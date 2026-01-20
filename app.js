// app.js - Main Application Controller
class App {
  constructor() {
    this.currentScreen = 'loading';
    this.currentCase = null;
    this.gameState = null;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.showScreen = this.showScreen.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    
    // Initialize
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Diagnostic Detective...');
    
    try {
      // Initialize database
      await window.database.init();
      
      // Check for existing session
      const hasSession = window.auth.checkSession(); // ← Use window.auth (lowercase)
      
      if (hasSession) {
        console.log('✅ Session found, loading dashboard...');
        await this.showDashboard();
      } else {
        console.log('🔐 No session, showing login...');
        this.showScreen('login');
      }
      
      // Setup event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ Initialization error:', error);
      this.showError('Failed to initialize application');
    }
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.auth.logout();
        this.showScreen('login');
      });
    }

    // Start game button
    const startGameBtn = document.getElementById('startGameBtn');
    if (startGameBtn) {
      startGameBtn.addEventListener('click', () => {
        this.showCaseSelection();
      });
    }

    // View leaderboard
    const leaderboardBtn = document.getElementById('viewLeaderboardBtn');
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', () => {
        this.showLeaderboard();
      });
    }
  }

  async handleLogin() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput?.value?.trim();

    if (!email) {
      window.ui.showToast('Please enter your email', 'error');
      return;
    }

    // Show loading
    window.ui.showLoading('Validating your credentials...');

    try {
      // Call auth.login (lowercase - instance method)
      const result = await window.auth.login(email);

      window.ui.hideLoading();

      if (result.success) {
        window.ui.showToast('Welcome back, ' + result.user.displayName + '!', 'success');
        await this.showDashboard();
      } else {
        window.ui.showToast(result.error || 'Login failed', 'error');
      }

    } catch (error) {
      console.error('Login error:', error);
      window.ui.hideLoading();
      window.ui.showToast('An error occurred. Please try again.', 'error');
    }
  }

  async showDashboard() {
    try {
      this.showScreen('dashboard');
      
      const user = window.auth.getUser();
      if (!user) {
        throw new Error('No user data found');
      }

      // Update dashboard UI
      this.updateDashboardStats(user);
      
      // Load cases
      await window.cases.loadCases();
      this.displayCases();
      
      // Load leaderboard
      await this.loadMiniLeaderboard();
      
    } catch (error) {
      console.error('Dashboard error:', error);
      this.showError('Failed to load dashboard');
    }
  }

  updateDashboardStats(user) {
    // Update welcome message
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
      welcomeEl.textContent = `Welcome back, ${user.displayName}!`;
    }

    // Update stats
    const stats = {
      totalScore: user.totalScore || 0,
      casesSolved: user.casesSolved || 0,
      accuracy: user.averageAccuracy || 0,
      rank: user.currentRank || '-'
    };

    Object.keys(stats).forEach(key => {
      const el = document.getElementById(key + 'Value');
      if (el) {
        el.textContent = stats[key];
      }
    });

    // Attempts remaining
    const maxAttempts = window.GAME_CONFIG.game.maxRewardAttempts;
    const attemptsUsed = user.rewardAttemptsUsed || 0;
    const attemptsLeft = Math.max(0, maxAttempts - attemptsUsed);
    
    const attemptsEl = document.getElementById('attemptsRemaining');
    if (attemptsEl) {
      attemptsEl.textContent = `${attemptsLeft}/${maxAttempts}`;
    }

    // Practice mode badge
    const practiceBadge = document.getElementById('practiceModeBadge');
    if (practiceBadge) {
      practiceBadge.style.display = attemptsLeft === 0 ? 'block' : 'none';
    }
  }

  displayCases() {
    const casesContainer = document.getElementById('casesContainer');
    if (!casesContainer) return;

    const cases = window.cases.getAllCases();
    
    if (!cases || cases.length === 0) {
      casesContainer.innerHTML = `
        <div class="empty-state">
          <p>No cases available yet. Check back soon!</p>
        </div>
      `;
      return;
    }

    casesContainer.innerHTML = cases.map(c => `
      <div class="case-card" data-case-id="${c.id}">
        <div class="case-image">
          <img src="${c.primaryImageUrl}" alt="${c.title}" loading="lazy">
        </div>
        <div class="case-content">
          <div class="case-header">
            <span class="case-number">CASE ${c.caseNumber}</span>
            <span class="difficulty-badge ${c.difficulty}">${c.difficulty}</span>
          </div>
          <h3 class="case-title">${c.title}</h3>
          <p class="case-description">${c.chiefComplaint}</p>
          <div class="case-meta">
            <span>⏱️ ${Math.floor(c.timeLimit / 60)} min</span>
            <span>🎯 ${c.pointsValue} pts</span>
          </div>
          <button class="btn btn-primary start-case-btn" data-case-id="${c.id}">
            Start Case →
          </button>
        </div>
      </div>
    `).join('');

    // Add click listeners
    casesContainer.querySelectorAll('.start-case-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const caseId = e.target.dataset.caseId;
        this.startCase(caseId);
      });
    });
  }

  async startCase(caseId) {
    try {
      const caseData = window.cases.getCaseById(caseId);
      if (!caseData) {
        throw new Error('Case not found');
      }

      this.currentCase = caseData;
      
      // Initialize game
      await window.game.startGame(caseData);
      
      this.showScreen('game');
      
    } catch (error) {
      console.error('Start case error:', error);
      window.ui.showToast('Failed to start case', 'error');
    }
  }

  showCaseSelection() {
    // Scroll to cases section
    const casesSection = document.getElementById('casesSection');
    if (casesSection) {
      casesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async loadMiniLeaderboard() {
    try {
      const leaderboard = await window.database.getLeaderboard(5);
      this.displayMiniLeaderboard(leaderboard);
    } catch (error) {
      console.error('Leaderboard error:', error);
    }
  }

  displayMiniLeaderboard(leaderboard) {
    const container = document.getElementById('miniLeaderboard');
    if (!container) return;

    if (!leaderboard || leaderboard.length === 0) {
      container.innerHTML = '<p class="empty-state">No players yet. Be the first!</p>';
      return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    
    container.innerHTML = `
      <div class="leaderboard-list">
        ${leaderboard.map((player, idx) => `
          <div class="leaderboard-item">
            <span class="rank">${medals[idx] || (idx + 1)}</span>
            <span class="name">${player.name}</span>
            <span class="score">${player.score}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  async showLeaderboard() {
    try {
      window.ui.showLoading('Loading leaderboard...');
      const leaderboard = await window.database.getLeaderboard(50);
      window.ui.hideLoading();
      
      // Show in modal
      window.ui.showLeaderboardModal(leaderboard);
      
    } catch (error) {
      console.error('Leaderboard error:', error);
      window.ui.hideLoading();
      window.ui.showToast('Failed to load leaderboard', 'error');
    }
  }

  showScreen(screenName) {
    console.log('📺 Showing screen:', screenName);
    
    // Hide all screens
    const screens = ['loading', 'login', 'dashboard', 'game', 'result'];
    screens.forEach(screen => {
      const el = document.getElementById(`${screen}Screen`);
      if (el) {
        el.classList.add('hidden');
      }
    });

    // Show requested screen
    const targetScreen = document.getElementById(`${screenName}Screen`);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      this.currentScreen = screenName;
    } else {
      console.error('Screen not found:', screenName);
    }
  }

  showError(message) {
    window.ui.showToast(message, 'error');
    this.showScreen('login');
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
  });
} else {
  window.app = new App();
}
