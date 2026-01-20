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
      
      // Check for existing session
      const hasSession = window.auth.checkSession();
      
      if (hasSession) {
        console.log('✅ Session found, loading dashboard...');
        this.loadDashboard();
      } else {
        console.log('🔐 No session, showing login...');
        this.showScreen('auth');
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

  async handleLogin() {
    const emailInput = document.getElementById('user-email');
    const email = emailInput?.value?.trim();

    if (!email) {
      window.ui.showToast('Please enter your email', 'error');
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
      }

    } catch (error) {
      console.error('Login error:', error);
      window.ui.hideLoading();
      window.ui.showToast('An error occurred. Please try again.', 'error');
    }
  }

  loadDashboard() {
    this.showScreen('dashboard');
    
    const user = window.auth.getUser();
    if (user) {
      // Update dashboard with user info
      const displayNameEl = document.getElementById('user-display-name');
      if (displayNameEl) {
        displayNameEl.textContent = user.displayName || 'DOCTOR';
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
  }

  async startRandomGame() {
    const randomCase = window.cases.getRandomCase();
    
    if (!randomCase) {
      window.ui.showToast('No cases available', 'error');
      return;
    }
    
    this.currentCase = randomCase;
    this.currentStep = 1;
    
    // Show instructions first
    const instructionsModal = document.getElementById('instructions-modal');
    if (instructionsModal) {
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
    const submitBtn = document.getElementById('submit-btn-lg');
    
    if (step === 3) {
      if (nextBtn) nextBtn.classList.add('hidden');
      if (submitBtn) submitBtn.classList.remove('hidden');
    } else {
      if (nextBtn) nextBtn.classList.remove('hidden');
      if (submitBtn) submitBtn.classList.add('hidden');
    }
  }

  submitAnswer() {
    const result = window.game.checkAnswer();
    
    // Show result modal
    this.showResult(result);
  }

  showResult(result) {
    const modal = document.getElementById('result-modal');
    if (!modal) return;
    
    const iconContainer = document.getElementById('result-icon-container');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const score = document.getElementById('result-score');
    const explanation = document.getElementById('result-explanation');
    
    if (result.correct) {
      iconContainer.className = 'size-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100';
      icon.textContent = 'check_circle';
      icon.className = 'material-symbols-outlined text-4xl text-green-500';
      title.textContent = 'Correct Diagnosis!';
      score.textContent = '+100 Points';
    } else {
      iconContainer.className = 'size-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100';
      icon.textContent = 'cancel';
      icon.className = 'material-symbols-outlined text-4xl text-red-500';
      title.textContent = 'Incorrect';
      score.textContent = `Correct answer: ${result.correctAnswer}`;
    }
    
    if (explanation) {
      explanation.textContent = result.explanation || 'No explanation available';
    }
    
    modal.classList.remove('hidden');
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
