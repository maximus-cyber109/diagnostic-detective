import * as Auth from './modules/auth.js';
import * as Game from './modules/game.js';
import * as UI from './modules/ui.js';
import { generateCases } from './modules/cases.js';

class App {
    constructor() {
        this.state = {
            currentUser: null,
            activeCase: null,
            allCases: [],
            playedCaseIds: []
        };

        // Expose to window for inline onclicks in HTML
        window.app = this;
        this.init();
    }

    async init() {
        // Load Cases
        this.state.allCases = generateCases();
        console.log(`Loaded ${this.state.allCases.length} cases.`);

        // Event Bindings
        this.bindEvents();

        // Session Check
        const urlParams = new URLSearchParams(window.location.search);
        const urlEmail = urlParams.get('email');

        if (urlEmail) {
            // Auto-login from URL
            this.handleLogin(urlEmail);
        } else {
            const existingSession = Auth.checkSession();
            if (existingSession) {
                this.state.currentUser = existingSession;
                this.loadDashboard();
            } else {
                this.showScreen('auth-screen');
            }
        }
    }

    bindEvents() {
        // Login
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Start Game
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) startBtn.addEventListener('click', () => this.startRandomGame());

        // Exit Game (optional element)
        const exitBtn = document.getElementById('exit-game-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                Game.stopTimer();
                this.loadDashboard();
            });
        }

        // Submit Answer (optional - new UI uses submit-btn-lg with inline onclick)
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAnswer());
        }
    }

    async handleLogin(passedEmail = null) {
        const emailInput = document.getElementById('user-email');
        const email = passedEmail || (emailInput ? emailInput.value : ''); // Param or Input



        const user = await Auth.login(email);
        if (user) {
            this.state.currentUser = user;
            this.loadDashboard();
        } else {
            // Show error if it exists, likely need to add it to HTML if missing
            const errEl = document.getElementById('login-error');
            if (errEl) {
                errEl.textContent = "Invalid Format";
                errEl.classList.remove('hidden');
            } else {
                alert("Login Failed: Please enter a valid email.");
            }
        }
    }

    loadDashboard() {
        // Explicitly hide Auth Overlay (Forcefully)
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.classList.add('hidden');

        this.showScreen('dashboard-screen');

        // Update Stats
        if (this.state.currentUser) {
            document.getElementById('user-display-name').textContent = this.state.currentUser.display_name.toUpperCase();
            document.getElementById('dash-solved').textContent = this.state.currentUser.cases_solved || 0;
            // Use Accuracy if available, else Mock a high number for motivation
            document.getElementById('dash-accuracy').textContent = this.state.currentUser.average_accuracy ? `${this.state.currentUser.average_accuracy}%` : "95%";
        }
    }

    startRandomGame() {
        // Show Instructions first?
        document.getElementById('instructions-modal').classList.remove('hidden');
    }

    closeInstructions() {
        document.getElementById('instructions-modal').classList.add('hidden');

        // Pick random unplayed case
        const randomIndex = Math.floor(Math.random() * this.state.allCases.length);
        const selectedCase = this.state.allCases[randomIndex];
        this.state.activeCase = selectedCase;

        this.renderGame(selectedCase);
        this.showScreen('game-screen');
        // Step initialization is handled inside renderGame via updateStepUI()

        Game.initGame(selectedCase, () => this.handleTimeUp());
    }

    // Step Logic: 'history' | 'exam' | 'quiz'
    // Now handled by integer steps 1, 2, 3

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateStepUI();
        }
    }

    updateStepUI() {
        // Hide all steps
        [1, 2, 3].forEach(i => {
            const el = document.getElementById(`step-${i}`);
            if (el) {
                el.classList.add('hidden');
                el.classList.remove('flex');
            }
            const prog = document.getElementById(`prog-${i}`);
            if (prog) prog.classList.replace('bg-primary', 'bg-slate-200');
        });

        // Show Current Step
        const stepEl = document.getElementById(`step-${this.currentStep}`);
        if (stepEl) {
            stepEl.classList.remove('hidden');
            stepEl.classList.add('flex');
        }

        // Update Progress Bar
        for (let i = 1; i <= this.currentStep; i++) {
            const prog = document.getElementById(`prog-${i}`);
            if (prog) prog.classList.replace('bg-slate-200', 'bg-primary');
        }

        const indicator = document.getElementById('step-indicator');
        if (indicator) indicator.textContent = `STEP ${this.currentStep}/3`;

        // Update Footer Button State
        this.updateStepFooter();
    }

    updateStepFooter() {
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn-lg');

        if (this.currentStep === 3) {
            if (nextBtn) nextBtn.classList.add('hidden');
            if (submitBtn) submitBtn.classList.remove('hidden');

            // Disable submit if no selection
            if (this.selectedOption) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            if (nextBtn) nextBtn.classList.remove('hidden');
            if (submitBtn) submitBtn.classList.add('hidden');
        }
    }

    openVitalsModal(type) {
        const modal = document.getElementById('vitals-modal');
        if (modal) modal.classList.remove('hidden');

        if (type === 'bp' && this.state.activeCase) {
            const content = document.getElementById('modal-content-bp');
            if (content) content.classList.remove('hidden');

            const [sys, dia] = (this.state.activeCase.vitals.bp || "120/80").split('/');

            // Animate Bars (Small delay to allow transition)
            setTimeout(() => {
                const sysBar = document.getElementById('sys-bar-graph');
                if (sysBar) sysBar.style.height = `${Math.min(100, (sys / 200) * 100)}%`;
                const sysVal = document.getElementById('sys-val-graph');
                if (sysVal) sysVal.textContent = sys;

                const diaBar = document.getElementById('dia-bar-graph');
                if (diaBar) diaBar.style.height = `${Math.min(100, (dia / 140) * 100)}%`;
                const diaVal = document.getElementById('dia-val-graph');
                if (diaVal) diaVal.textContent = dia;

                // Category Logic
                let cat = "Normal";
                if (sys > 130 || dia > 80) cat = "Hypertension Stage 1";
                if (sys > 140 || dia > 90) cat = "Hypertension Stage 2";
                const catEl = document.getElementById('bp-category');
                if (catEl) catEl.textContent = cat;
            }, 100);
        }
    }

    renderGame(c) {
        // Reset Steps
        this.currentStep = 1;
        this.selectedOption = null; // Clear previous selection
        this.updateStepUI();

        // --- STEP 1: VITALS ---
        const ptName = document.getElementById('pt-name');
        if (ptName) ptName.textContent = c.patientName.toUpperCase();

        // BP & Details (Populate Large Logic)
        if (c.vitals.bp) {
            const [sys, dia] = c.vitals.bp.split('/');
            const sysEl = document.getElementById('pt-bp-sys-lg');
            const diaEl = document.getElementById('pt-bp-dia-lg');
            if (sysEl) sysEl.textContent = sys;
            if (diaEl) diaEl.textContent = '/' + dia;

            // Mini Bar visual
            const perc = Math.min(100, (parseInt(sys) - 90) * 1.5);
            const miniBar = document.getElementById('bp-bar-mini');
            if (miniBar) miniBar.style.width = `${perc}%`;
        }

        const painLg = document.getElementById('pt-pain-lg');
        if (painLg) painLg.textContent = c.vitals.painLevel;

        const painBar = document.getElementById('pt-pain-bar');
        if (painBar) painBar.style.width = `${c.vitals.painLevel * 10}%`;

        const painText = document.getElementById('pt-pain-text');
        if (painText) {
            painText.textContent = c.vitals.painLevel > 7 ? 'SEVERE' : (c.vitals.painLevel > 3 ? 'MODERATE' : 'MILD');
            painText.className = `text-xs font-bold uppercase ${c.vitals.painLevel > 7 ? 'text-red-500' : 'text-amber-500'}`;
        }

        const complaintLg = document.getElementById('history-complaint-lg');
        if (complaintLg) complaintLg.textContent = c.chiefComplaint;

        // --- STEP 2: EXAM ---
        const imgEl = document.getElementById('game-image-lg');
        const noImg = document.getElementById('no-image-placeholder');

        if (imgEl && noImg) {
            if (c.primaryImageUrl) {
                imgEl.src = c.primaryImageUrl;
                imgEl.classList.remove('hidden');
                noImg.classList.add('hidden');
            } else {
                imgEl.classList.add('hidden');
                noImg.classList.remove('hidden');
                noImg.classList.add('flex');
            }
        }

        const findingsLg = document.getElementById('exam-findings-lg');
        if (findingsLg) findingsLg.textContent = c.clinicalFindings.join(', ');

        // --- STEP 3: OPTIONS ---
        const optsContainer = document.getElementById('game-options-lg');
        if (optsContainer) {
            optsContainer.innerHTML = '';

            ['A', 'B', 'C', 'D'].forEach(opt => {
                const btn = document.createElement('button');
                // High contrast design: Dark Blue Button with White Text
                btn.className = "option-btn w-full p-5 rounded-xl bg-slate-900 border border-slate-700 text-left text-white hover:bg-slate-800 transition-all flex items-center justify-between group shadow-sm";
                btn.innerHTML = `
                    <div class="flex items-center gap-4">
                        <span class="font-bold text-slate-900 bg-white size-8 flex items-center justify-center rounded-lg text-sm">${opt}</span>
                        <span class="text-base font-bold leading-tight">${c['option' + opt]}</span>
                    </div>
                    <div class="size-6 rounded-full border-2 border-slate-600 group-hover:border-white transition-colors"></div>
                `;

                btn.addEventListener('click', () => {
                    // Seleciton state
                    document.querySelectorAll('.option-btn').forEach(b => {
                        b.classList.remove('ring-2', 'ring-primary', 'bg-slate-800', 'shadow-lg');
                        b.classList.add('bg-slate-900');
                        b.querySelector('.rounded-full').classList.remove('bg-primary', 'border-primary'); // radio circle
                    });

                    btn.classList.remove('bg-slate-900');
                    btn.classList.add('bg-slate-800', 'ring-2', 'ring-primary', 'shadow-lg');

                    // Radio fill
                    const radio = btn.querySelector('.rounded-full');
                    radio.classList.add('bg-primary', 'border-primary');

                    this.selectedOption = opt;

                    // Show Submit logic handles itself via footer
                    this.updateStepFooter();
                });

                optsContainer.appendChild(btn);
            });
        }

    }

    submitAnswer() {
        if (!this.selectedOption) return;

        const result = Game.calculateResult(this.state.activeCase, this.selectedOption);
        Game.stopTimer(); // Stop timer

        // Update User
        this.state.currentUser.total_score += result.totalScore;
        if (result.isCorrect) {
            this.state.currentUser.cases_solved++;
            this.state.currentUser.current_streak++;
            if (this.state.currentUser.current_streak > this.state.currentUser.best_streak) {
                this.state.currentUser.best_streak = this.state.currentUser.current_streak;
            }
        } else {
            this.state.currentUser.current_streak = 0;
        }

        this.showResult(result);
    }

    showResult(result) {
        const modal = document.getElementById('result-modal');
        modal.classList.remove('hidden');

        const title = document.getElementById('result-title');
        const icon = document.getElementById('result-icon');
        const container = document.getElementById('result-icon-container');

        if (result.isCorrect) {
            title.textContent = "Correct Diagnosis!";
            title.className = "text-2xl font-bold text-emerald-400 mb-1";
            icon.textContent = "check_circle";
            container.className = "size-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500 text-emerald-500";
        } else {
            title.textContent = "Incorrect";
            title.className = "text-2xl font-bold text-red-500 mb-1";
            icon.textContent = "cancel";
            container.className = "size-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500 text-red-500";
        }

        document.getElementById('result-score').textContent = `Total Score: ${this.state.currentUser.total_score}`;
        document.getElementById('result-explanation').textContent = result.explanation;

        // Reward Logic (Simplified: 1st attempt only)
        const rewardBox = document.getElementById('reward-box');
        if (this.state.currentUser.reward_attempts_used === 0) {
            rewardBox.classList.remove('hidden');
            // Mock Reward
            const reward = window.GAME_CONFIG.rewards[result.isCorrect ? 0 : 1]; // Cashback for win, Discount for lose
            document.getElementById('reward-desc').textContent = reward.description;
            document.getElementById('reward-code').textContent = reward.couponCode;

            this.state.currentUser.reward_attempts_used = 1; // Mark used
        } else {
            rewardBox.classList.add('hidden');
        }
    }

    closeResult() {
        document.getElementById('result-modal').classList.add('hidden');
        this.loadDashboard();
    }

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
        document.getElementById(id).classList.add('flex');
    }

    handleTimeUp() {
        // ...
        // Auto-fail logic
    }
}

new App();
