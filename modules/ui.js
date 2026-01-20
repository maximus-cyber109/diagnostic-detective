// UI Module
// Handles DOM updates, Screens, rendering

export const showScreen = (screenId) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
};

export const showError = (elementId, message) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
};

export const setLoading = (isLoading) => {
    // Simple implementation
    const btn = document.querySelector('button[type="submit"]');
    if (btn) {
        btn.disabled = isLoading;
        btn.querySelector('.btn-text').textContent = isLoading ? 'Authenticating...' : 'Authenticate Access';
    }
};

export const updateUserProfile = (user) => {
    document.getElementById('user-display-name').textContent = user.display_name;
    document.getElementById('user-rank-title').textContent = user.rank_title;
    document.getElementById('header-score').textContent = user.total_score.toString().padStart(4, '0');
};

export const updateStats = (user) => {
    document.getElementById('stats-solved').textContent = user.cases_solved;
    document.getElementById('stats-streak').textContent = user.best_streak;
    document.getElementById('stats-accuracy').textContent = user.average_accuracy + '%';
};

export const renderCaseGrid = (cases, onSelect) => {
    const grid = document.getElementById('cases-grid');
    grid.innerHTML = '';

    cases.forEach(c => {
        const card = document.createElement('div');
        card.className = 'glass-card case-card fade-in';
        card.innerHTML = `
            <div class="case-card-header">
                <img src="${c.primaryImageUrl}" alt="${c.title}" onerror="this.src='assets/images/cases/placeholder_xray.jpg'"> <!-- Fallback image -->
                <div class="case-status-badge ${c.solved ? 'status-solved' : 'hidden'}">SOLVED</div>
            </div>
            <div class="case-card-body">
                <div class="case-meta-line">
                    <span>${c.caseCode}</span>
                    <span><span class="difficulty-dot diff-${c.difficulty}"></span>${c.difficulty}</span>
                </div>
                <h3>${c.title}</h3>
            </div>
        `;
        card.addEventListener('click', () => onSelect(c.id));
        grid.appendChild(card);
    });
};

export const renderGameScreen = (c) => {
    // Images
    const imgEl = document.getElementById('case-image');
    imgEl.src = c.primaryImageUrl;
    imgEl.onerror = () => { imgEl.src = 'https://placehold.co/800x600/131720/EEE?text=X-Ray+Case+Image'; }; // Temporary placeholder online

    document.getElementById('image-caption').textContent = c.imageCaption || '';

    // Text Data
    document.getElementById('case-title').textContent = c.title;
    document.getElementById('case-difficulty').textContent = c.difficulty.toUpperCase();

    document.getElementById('patient-demographics').textContent = `${c.patientAge}y / ${c.patientGender}`;
    document.getElementById('chief-complaint').textContent = c.chiefComplaint;

    renderList('clinical-findings-list', c.clinicalFindings);
    renderList('radiographic-findings-list', c.radiographicFindings);

    document.getElementById('question-text').textContent = c.question;

    // Options
    const optsContainer = document.getElementById('options-container');
    optsContainer.innerHTML = '';

    ['A', 'B', 'C', 'D'].forEach(opt => {
        const text = c[`option${opt}`];
        if (!text) return;

        const optEl = document.createElement('div');
        optEl.className = 'option-card';
        optEl.dataset.value = opt;
        optEl.innerHTML = `
            <div class="option-letter">${opt}</div>
            <div class="option-text">${text}</div>
        `;

        optEl.addEventListener('click', () => {
            // Handle selection visual
            document.querySelectorAll('.option-card').forEach(o => o.classList.remove('selected'));
            optEl.classList.add('selected');
            document.getElementById('submit-answer').disabled = false;
        });

        optsContainer.appendChild(optEl);
    });

    document.getElementById('submit-answer').disabled = true;
};

function renderList(id, items) {
    const ul = document.getElementById(id);
    if (!ul) return;
    ul.innerHTML = '';
    if (!items) return;
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
    });
}

export const getSelectedOption = () => {
    const selected = document.querySelector('.option-card.selected');
    return selected ? selected.dataset.value : null;
};

export const showResultModal = (result) => {
    const modal = document.getElementById('result-modal');
    modal.classList.remove('hidden');

    const titleEl = document.getElementById('result-title');
    const iconEl = document.getElementById('result-icon');

    if (result.isCorrect) {
        titleEl.textContent = "Correct Diagnosis!";
        titleEl.style.color = 'var(--success)';
        iconEl.textContent = "✅";
    } else {
        titleEl.textContent = "Incorrect Diagnosis";
        titleEl.style.color = 'var(--error)';
        iconEl.textContent = "❌";
    }

    // Score
    document.getElementById('round-score').textContent = result.totalScore;
    if (result.timeBonus > 0) document.getElementById('time-bonus-row').classList.remove('hidden');
    else document.getElementById('time-bonus-row').classList.add('hidden');

    if (result.streakBonus > 0) document.getElementById('streak-bonus-row').classList.remove('hidden');
    else document.getElementById('streak-bonus-row').classList.add('hidden');

    // Explanation
    document.getElementById('explanation-text').textContent = result.explanation;

    // Reward
    if (result.reward && result.reward.couponCode) {
        document.getElementById('reward-unlock-section').classList.remove('hidden');
        document.getElementById('reward-name').textContent = result.reward.title + ' - ' + result.reward.discount;
        document.getElementById('coupon-code').textContent = result.reward.couponCode;
    } else {
        document.getElementById('reward-unlock-section').classList.add('hidden');
    }
};

export const hideModal = (id) => {
    document.getElementById(id).classList.add('hidden');
};
