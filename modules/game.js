// Game Module
// Handles timer, scoring logic, and state

let timerInterval = null;
let startTime = 0;
let currentTime = 0;
let gameActive = false;
let currentStreak = 0; // Should be loaded from user state

export const initGame = (caseData, onTimeUp) => {
    gameActive = true;
    startTime = Date.now();

    const timeLimit = caseData.timeLimit || window.GAME_CONFIG.game.timePerCase;
    let timeRemaining = timeLimit;

    updateTimerDisplay(timeRemaining);

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!gameActive) return;

        timeRemaining--;
        currentTime = timeRemaining;
        updateTimerDisplay(timeRemaining);

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            if (onTimeUp) onTimeUp();
        }
    }, 1000);
};

export const stopTimer = () => {
    gameActive = false;
    clearInterval(timerInterval);
    return Math.floor((Date.now() - startTime) / 1000); // Time taken in seconds
};

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${remSeconds.toString().padStart(2, '0')}`;

    const timerEl = document.getElementById('game-timer');
    if (timerEl) {
        timerEl.textContent = display;

        // Urgency effects
        if (seconds <= 30) {
            timerEl.classList.add('pulse-urgent');
        } else {
            timerEl.classList.remove('pulse-urgent');
        }
    }
}

export const calculateResult = (caseData, selectedOption) => {
    const isCorrect = selectedOption === caseData.correctAnswer;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000); // Seconds

    let baseScore = 0;
    let timeBonus = 0;
    let streakBonus = 0;

    if (isCorrect) {
        baseScore = window.GAME_CONFIG.game.basePoints;

        // Time Bonus
        if (timeTaken < window.GAME_CONFIG.game.timeBonusThreshold) {
            timeBonus = window.GAME_CONFIG.game.timeBonus;
        }

        // Streak Bonus (Simple local logic for now)
        currentStreak++;
        if (currentStreak >= window.GAME_CONFIG.game.streakBonusThreshold) {
            streakBonus = window.GAME_CONFIG.game.streakBonus;
        }
    } else {
        currentStreak = 0; // Reset streak
    }

    const totalScore = baseScore + timeBonus + streakBonus;

    // Determine Logic for Rewards (Mock)
    const reward = determineReward(totalScore);

    return {
        isCorrect,
        correctAnswer: caseData.correctAnswer,
        timeTaken,
        baseScore,
        timeBonus,
        streakBonus,
        totalScore,
        explanation: caseData.explanation,
        reward
    };
};

function determineReward(score) {
    // Simple lookup from config
    const rewards = window.GAME_CONFIG.rewards;
    for (const r of rewards) {
        if (score >= r.minScore) return r;
    }
    return rewards[rewards.length - 1]; // Participation
}
