// app.js - Main Application Controller
class App {
  constructor() {
    this.currentScreen = 'auth';
    this.currentCase = null;
    this.currentStep = 1;

    this.waitForModules().then(() => {
      this.init();
    }).catch(err => {
      console.error('Failed to load modules:', err);
      alert('Application failed to initialize. Please refresh the page.');
    });
  }

  async waitForModules() {
    console.log('⏳ Waiting for modules to load...');

    const maxWait = 5000;
    const startTime = Date.now();

    while (!this.modulesReady()) {
      if (Date.now() - startTime > maxWait) {
        throw new Error('Modules failed to load in time');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ All modules loaded');
  }

  modulesReady() {
    return (
      window.database &&
      window.ui &&
      window.auth &&
      window.cases &&
      window.game &&
      window.GAME_CONFIG
    );
  }

  async init() {
    console.log('🚀 Initializing Diagnostic Detective...');

    try {
      // Initialize database (don't fail if it doesn't work)
      await window.database.init().catch(err => {
        console.warn('⚠️ Database init failed, continuing anyway:', err);
      });

      // CHECK URL PARAMS FOR EMAIL
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');

      if (emailParam) {
        console.log('🔗 URL Email found:', emailParam);
        // HIDE AUTH SCREEN IMMEDIATELY
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.classList.add('hidden');

        // Auto-login
        await this.handleLogin(emailParam);
      } else {
        // Check for existing session
        const hasSession = window.auth.checkSession();

        if (hasSession) {
          console.log('✅ Session found, loading dashboard...');
          this.loadDashboard();
          const authScreen = document.getElementById('auth-screen');
          if (authScreen) authScreen.classList.add('hidden');
        } else {
          console.log('🔐 No session, showing login...');
          this.showScreen('auth');
        }
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
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }
  }

  async handleLogin(emailOverride = null) {
    const emailInput = document.getElementById('user-email');
    const email = emailOverride || emailInput?.value?.trim();

    if (!email) {
      window.ui.showToast('Please enter your email', 'error');
      // If manually triggered and invalid, ensure auth screen is visible
      if (!emailOverride) this.showScreen('auth');
      return;
    }

    window.ui.showLoading('Validating credentials...');

    try {
      const result = await window.auth.login(email);

      window.ui.hideLoading();

      if (result.success) {
        window.ui.showToast('Welcome, ' + result.user.displayName + '!', 'success');
        this.loadDashboard();
      } else {
        window.ui.showToast(result.error || 'Login failed', 'error');
        // If failed URL login, show auth screen
        if (emailOverride) this.showScreen('auth');
      }

    } catch (error) {
      console.error('Login error:', error);
      window.ui.hideLoading();
      window.ui.showToast('An error occurred. Please try again.', 'error');
      if (emailOverride) this.showScreen('auth');
    }
  }

  loadDashboard() {
    this.showScreen('dashboard');

    const user = window.auth.getUser();
    if (user) {
      // Update dashboard with user info
      const displayNameEl = document.getElementById('user-display-name');
      if (displayNameEl) {
        // Prefer explicit display_name, fallback to formatted email name
        const rawName = user.displayName || user.email?.split('@')[0] || 'DOCTOR';
        displayNameEl.textContent = this.formatName(rawName);
      }

      const solvedEl = document.getElementById('dash-solved');
      if (solvedEl) {
        solvedEl.textContent = user.casesSolved || 0;
      }

      const accuracyEl = document.getElementById('dash-accuracy');
      if (accuracyEl) {
        const acc = user.averageAccuracy || 0;
        accuracyEl.textContent = acc > 0 ? acc + '%' : '--';
      }
    }

    // Load cases
    window.cases.loadCases();

    // Load Leaderboard Widget
    this.loadLeaderboard();
  }

  formatName(name) {
    if (!name) return 'Doctor';
    return name
      .replace(/[._]/g, ' ') // Replace dots/underscores with space
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  async loadLeaderboard() {
    const container = document.getElementById('dashboard-leaderboard');
    if (!container || !window.database) return;

    try {
      // Fetch top 3
      const leaders = await window.database.getLeaderboard(3);

      if (!leaders || leaders.length === 0) {
        container.innerHTML = '<p class="text-xs text-text-muted text-center py-2">No top detectives yet. Be the first!</p>';
        return;
      }

      container.innerHTML = leaders.map((leader, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const styles = [
          'bg-yellow-50 text-yellow-700 border-yellow-100',
          'bg-slate-50 text-slate-700 border-slate-100',
          'bg-orange-50 text-orange-700 border-orange-100'
        ];

        return `
              <div class="flex items-center justify-between p-2 rounded-lg border ${styles[index] || 'bg-white border-slate-100'}">
                  <div class="flex items-center gap-3">
                      <div class="size-8 rounded-full bg-white shadow-sm flex items-center justify-center text-lg">
                          ${medals[index] || (index + 1)}
                      </div>
                      <div>
                          <p class="text-xs font-bold font-display">${this.formatName(leader.display_name)}</p>
                          <p class="text-[10px] opacity-80">${leader.cases_solved || 0} Cases</p>
                      </div>
                  </div>
                  <span class="text-xs font-bold font-mono">${leader.total_score || 0} XP</span>
              </div>
              `;
      }).join('');

    } catch (err) {
      console.error('Failed to load leaderboard widget:', err);
      container.innerHTML = '<p class="text-xs text-red-400">Unavailable</p>';
    }
  }

  async startRandomGame() {
    const user = window.auth.getUser();

    // Default to practice mode if no user, but usually we require login
    let isPracticeMode = false;

    if (user) {
      // Enforce 2-Attempt Limit
      const maxAttempts = window.GAME_CONFIG.game.maxRewardAttempts || 2;
      // Use camelCase if mapped by auth, otherwise check snake_case fallback
      const attemptsUsed = user.rewardAttemptsUsed !== undefined ? user.rewardAttemptsUsed : (user.reward_attempts_used || 0);

      if (attemptsUsed >= maxAttempts) {
        isPracticeMode = true;
        window.ui.showToast('You used your 2 reward attempts. Entering Practice Mode.', 'info');
      }
    }

    // Fetch played history for unique cases
    let playedCodes = [];
    if (user && window.database) {
      playedCodes = await window.database.getPlayedCases(user.id);
    }

    // Get unique case
    const randomCase = window.cases.getRandomCase(playedCodes);

    if (!randomCase) {
      window.ui.showToast('No new cases available!', 'error');
      // Optionally reset history here or handle "Game Over" state
      return;
    }

    this.currentCase = { ...randomCase, isPracticeMode }; // Store mode in case object for submission checks
    this.currentStep = 1;

    // Show instructions first (update text based on mode?)
    const instructionsModal = document.getElementById('instructions-modal');
    if (instructionsModal) {
      // Optional: Update instruction text dynamically
      const descEl = document.getElementById('instructions-desc');
      if (descEl && isPracticeMode) {
        descEl.textContent = "You are in Practice Mode. You won't earn rewards, but you can sharpen your skills.";
      }
      instructionsModal.classList.remove('hidden');
    }
  }



  closeInstructions() {
    const modal = document.getElementById('instructions-modal');
    if (modal) {
      modal.classList.add('hidden');
    }

    // Now start the actual game
    this.loadGameScreen();
  }

  loadGameScreen() {
    this.showScreen('game');

    // Initialize game
    window.game.startGame(this.currentCase);

    // Populate case data
    this.updateGameUI();
  }

  updateGameUI() {
    if (!this.currentCase) return;

    // Update patient name
    const ptNameEl = document.getElementById('pt-name');
    if (ptNameEl) {
      ptNameEl.textContent = this.currentCase.title || 'PATIENT';
    }

    // Update vitals (mock data for now)
    const bpSysEl = document.getElementById('pt-bp-sys-lg');
    const bpDiaEl = document.getElementById('pt-bp-dia-lg');
    if (bpSysEl) bpSysEl.textContent = '120';
    if (bpDiaEl) bpDiaEl.textContent = '/80';

    // Update complaint
    const complaintEl = document.getElementById('history-complaint-lg');
    if (complaintEl) {
      complaintEl.textContent = this.currentCase.chiefComplaint || 'No complaint recorded';
    }

    // Update image
    const imgEl = document.getElementById('game-image-lg');
    if (imgEl && this.currentCase.primaryImageUrl) {
      imgEl.src = this.currentCase.primaryImageUrl;
    }

    // Update findings
    const findingsEl = document.getElementById('exam-findings-lg');
    if (findingsEl && this.currentCase.clinicalFindings) {
      findingsEl.textContent = this.currentCase.clinicalFindings.join(', ');
    }

    // Populate options
    this.populateOptions();

    // Show first step
    this.showStep(1);
  }

  populateOptions() {
    const container = document.getElementById('game-options-lg');
    if (!container || !this.currentCase) return;

    const options = [
      { letter: 'A', text: this.currentCase.option_a },
      { letter: 'B', text: this.currentCase.option_b },
      { letter: 'C', text: this.currentCase.option_c },
      { letter: 'D', text: this.currentCase.option_d }
    ];

    container.innerHTML = options.map(opt => `
      <button onclick="app.selectOption('${opt.letter}')" 
              class="option-btn text-left p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-3"
              data-option="${opt.letter}">
        <div class="size-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-text-main">
          ${opt.letter}
        </div>
        <span class="text-text-main font-medium flex-1">${opt.text}</span>
      </button>
    `).join('');
  }

  selectOption(letter) {
    // Remove previous selection
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.classList.remove('border-primary', 'bg-blue-50');
      btn.classList.add('border-slate-200');
    });

    // Highlight selected
    const selectedBtn = document.querySelector(`[data-option="${letter}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('border-primary', 'bg-blue-50');
      selectedBtn.classList.remove('border-slate-200');
    }

    // Store selection
    window.game.selectAnswer(letter);
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
      this.showStep(this.currentStep);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  }

  showStep(step) {
    // Hide all steps
    for (let i = 1; i <= 3; i++) {
      const stepEl = document.getElementById(`step-${i}`);
      if (stepEl) {
        stepEl.classList.add('hidden');
      }

      const progEl = document.getElementById(`prog-${i}`);
      if (progEl) {
        progEl.classList.remove('bg-primary');
        progEl.classList.add('bg-slate-200');
      }
    }

    // Show current step
    const currentStepEl = document.getElementById(`step-${step}`);
    if (currentStepEl) {
      currentStepEl.classList.remove('hidden');
    }

    // Update progress
    for (let i = 1; i <= step; i++) {
      const progEl = document.getElementById(`prog-${i}`);
      if (progEl) {
        progEl.classList.add('bg-primary');
        progEl.classList.remove('bg-slate-200');
      }
    }

    // Update step indicator
    const stepIndicator = document.getElementById('step-indicator');
    if (stepIndicator) {
      stepIndicator.textContent = `STEP ${step}/3`;
    }

    // Toggle buttons
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn-lg');

    // Handle Back Button
    if (prevBtn) {
      if (step === 1) prevBtn.classList.add('hidden');
      else prevBtn.classList.remove('hidden');
    }

    if (step === 3) {
      if (nextBtn) nextBtn.classList.add('hidden');
      if (submitBtn) {
        submitBtn.classList.remove('hidden');
        // RESET BUTTON STATE
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        submitBtn.innerHTML = 'CONFIRM DIAGNOSIS';
      }
    } else {
      if (nextBtn) nextBtn.classList.remove('hidden');
      if (submitBtn) submitBtn.classList.add('hidden');
    }
  }

  async showHistory() {
    const user = window.auth.getUser();
    if (!user) return;

    const modal = document.getElementById('history-modal');
    const list = document.getElementById('history-list');
    if (modal && list) {
      modal.classList.remove('hidden');
      list.innerHTML = '<div class="text-center py-4"><span class="material-symbols-outlined animate-spin">refresh</span></div>';

      const history = await window.database.getFullHistory(user.id);

      if (!history || history.length === 0) {
        list.innerHTML = '<p class="text-center text-text-muted py-4">No cases played yet.</p>';
        return;
      }

      list.innerHTML = history.map(h => {
        const date = new Date(h.created_at).toLocaleDateString();
        const isWin = h.is_correct;
        const color = isWin ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50';
        const icon = isWin ? 'check_circle' : 'cancel';

        // Get Case Details
        const caseDetail = window.cases.getCaseByCode(h.case_code);
        const title = caseDetail ? caseDetail.title : (h.case_code || 'Mystery Case');
        const codeDisplay = caseDetail ? h.case_code : '';

        return `
              <div class="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex justify-between items-center">
                  <div>
                      <div class="flex items-center gap-2">
                          <span class="font-bold text-sm text-text-main">${title}</span>
                          ${codeDisplay ? `<span class="text-[10px] text-text-muted bg-slate-100 px-1.5 rounded">${codeDisplay}</span>` : ''}
                      </div>
                      <div class="flex items-center gap-2 mt-1">
                          <span class="text-[10px] px-2 py-0.5 rounded-full ${color} font-bold border border-current opacity-80">
                              ${isWin ? '+' + h.score_earned + ' XP' : '0 XP'}
                          </span>
                          <p class="text-[10px] text-text-muted">${date}</p>
                      </div>
                  </div>
                  <span class="material-symbols-outlined ${isWin ? 'text-green-500' : 'text-red-400'}">${icon}</span>
              </div>
              `;
      }).join('');
    }
  }

  shareLink() {
    const url = 'https://pinkblue.in/diagnostic-detective';
    if (navigator.share) {
      navigator.share({
        title: 'Diagnostic Detective',
        text: 'Can you solve this dental case? Play now!',
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url)
        .then(() => window.ui.showToast('Link copied to clipboard!', 'success'))
        .catch(() => window.ui.showToast('Failed to copy link', 'error'));
    }
  }

  async openLeaderboard() {
    const modal = document.getElementById('leaderboard-modal');
    const list = document.getElementById('leaderboard-list-full');

    if (modal && list) {
      modal.classList.remove('hidden');
      list.innerHTML = '<div class="text-center py-4"><span class="material-symbols-outlined animate-spin">refresh</span></div>';

      const leaders = await window.database.getLeaderboard(20);

      if (!leaders || leaders.length === 0) {
        list.innerHTML = '<p class="text-center text-text-muted">No data available.</p>';
        return;
      }

      list.innerHTML = leaders.map((l, i) => `
              <div class="p-3 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-100">
                  <div class="flex items-center gap-3">
                      <span class="font-bold text-text-sec w-6 text-center">${i + 1}</span>
                      <div>
                          <p class="font-bold text-sm text-text-main">${this.formatName(l.display_name)}</p>
                          <p class="text-[10px] text-text-muted">${l.cases_solved || 0} Solved</p>
                      </div>
                  </div>
                  <span class="font-mono font-bold text-primary text-sm">${l.total_score} XP</span>
              </div>
          `).join('');
    }
  }

  async submitAnswer_moved() {
    // Placeholder to keep the method sequence clean if needed, but not used here.
  }

  async submitAnswer() {
    // DISABLE BUTTON IMMEDIATELY TO PREVENT DOUBLE CLICK
    const submitBtn = document.getElementById('submit-btn-lg');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Processing...';
    }

    const result = window.game.checkAnswer();

    // VALIDATION: Ensure answer selected
    if (!result || !result.selectedAnswer) {
      window.ui.showToast('Please select an option first!', 'error');
      // Reset Button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        submitBtn.innerHTML = 'CONFIRM DIAGNOSIS';
      }
      return;
    }

    const user = window.auth.getUser();

    if (!user) {
      console.error('No user found for submission');
      this.showResult(result);
      return;
    }

    // Calculate Score
    let score = 0;
    let timeBonus = 0;
    let streakBonus = 0;

    if (result.correct) {
      score = window.GAME_CONFIG.game.basePoints || 100;

      // Time Bonus
      if (result.timeTaken < (window.GAME_CONFIG.game.timeBonusThreshold || 60)) {
        timeBonus = window.GAME_CONFIG.game.timeBonus || 50;
        score += timeBonus;
      }
    }

    const payload = {
      userId: user.id,
      caseId: this.currentCase.id,
      caseCode: this.currentCase.caseCode,
      selectedOption: result.selectedAnswer,
      isCorrect: result.correct,
      timeTaken: result.timeTaken,
      scoreEarned: score,
      timeBonus: timeBonus,
      streakBonus: streakBonus,
      totalScore: score, // For this attempt
      isPracticeMode: this.currentCase.isPracticeMode || false,
      difficulty: this.currentCase.difficulty
    };

    console.log('📤 Submitting attempt:', payload);

    try {
      // Send to Backend
      const response = await fetch(window.GAME_CONFIG.api.submitAttempt, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Attempt recorded:', data);

        // Update Local Stats (Practice Mode Limit)
        if (data.newStats) {
          window.auth.updateUser(data.newStats);
        }

        // Pass reward to result modal
        this.showResult({
          ...result,
          scoreEarned: score,
          reward: data.reward
        });

      } else {
        console.error('❌ Submission failed:', data.error);
        this.showResult({ ...result, scoreEarned: score });
      }

    } catch (err) {
      console.error('❌ Network error submitting attempt:', err);
      this.showResult({ ...result, scoreEarned: score });
    }
  }

  showResult(result) {
    const modal = document.getElementById('result-modal');
    if (!modal) return;

    const iconContainer = document.getElementById('result-icon-container');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const score = document.getElementById('result-score');
    const explanation = document.getElementById('result-explanation');

    // Reward Elements
    const rewardBox = document.getElementById('reward-box');
    const rewardDesc = document.getElementById('reward-desc');
    const rewardCode = document.getElementById('reward-code');

    if (result.correct) {
      iconContainer.className = 'size-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100';
      icon.textContent = 'check_circle';
      icon.className = 'material-symbols-outlined text-4xl text-green-500';
      title.textContent = 'Correct Diagnosis!';
      score.textContent = `+${result.scoreEarned || 100} Points`;

      // Show Reward if earned
      if (result.reward && rewardBox) {
        rewardBox.classList.remove('hidden');
        if (rewardDesc) rewardDesc.textContent = result.reward.discount || result.reward.name;
        if (rewardCode) rewardCode.textContent = result.reward.code;

        // Safe Copy Handler
        const copyBtn = document.querySelector('#reward-box button');
        if (copyBtn) {
          copyBtn.onclick = () => {
            const code = result.reward.code;
            // Try standard API
            if (navigator.clipboard) {
              navigator.clipboard.writeText(code)
                .then(() => window.ui.showToast('Code copied!', 'success'))
                .catch(() => this.fallbackCopy(code));
            } else {
              this.fallbackCopy(code);
            }
          };
        }

      } else if (rewardBox) {
        rewardBox.classList.add('hidden');
      }

    } else {
      iconContainer.className = 'size-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100';
      icon.textContent = 'cancel';
      icon.className = 'material-symbols-outlined text-4xl text-red-500';
      title.textContent = 'Incorrect';
      score.textContent = `Correct answer: ${result.correctAnswer}`;
      if (rewardBox) rewardBox.classList.add('hidden');
    }

    if (explanation) {
      explanation.textContent = result.explanation || 'No explanation available';
    }

    modal.classList.remove('hidden');
  }

  fallbackCopy(text) {
    // Fallback for iFrames blocking clipboard API
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed'; // Avoid scrolling to bottom
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        window.ui.showToast('Code copied to clipboard!', 'success');
      } else {
        window.ui.showToast('Please copy code manually: ' + text, 'info');
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
      window.ui.showToast('Please copy code manually: ' + text, 'info');
    }
  }

  closeResult() {
    const modal = document.getElementById('result-modal');
    if (modal) {
      modal.classList.add('hidden');
    }

    // Return to dashboard
    this.loadDashboard();
  }

  openVitalsModal(type) {
    const modal = document.getElementById('vitals-modal');
    const content = document.getElementById('modal-content-bp');

    if (modal && content) {
      content.classList.remove('hidden');
      modal.classList.remove('hidden');

      // Animate BP bars
      setTimeout(() => {
        const sysBar = document.getElementById('sys-bar-graph');
        const diaBar = document.getElementById('dia-bar-graph');
        if (sysBar) sysBar.style.height = '60%';
        if (diaBar) diaBar.style.height = '40%';
      }, 100);
    }
  }

  showScreen(screenName) {
    console.log('📺 Showing screen:', screenName);

    const screens = ['auth', 'dashboard', 'game'];
    screens.forEach(screen => {
      const el = document.getElementById(`${screen}-screen`);
      if (el) {
        el.classList.add('hidden');
      }
    });

    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      this.currentScreen = screenName;
    } else {
      console.error('Screen not found:', screenName);
    }
  }

  showError(message) {
    if (window.ui && window.ui.showToast) {
      window.ui.showToast(message, 'error');
    } else {
      console.error('Error:', message);
      alert(message);
    }
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
