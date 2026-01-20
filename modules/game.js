// modules/game.js - Game Logic Handler
class Game {
  constructor() {
    this.currentCase = null;
    this.startTime = null;
    this.timerInterval = null;
    this.selectedAnswer = null;
  }

  async startGame(caseData) {
    this.currentCase = caseData;
    this.startTime = Date.now();
    this.selectedAnswer = null;
    
    console.log('🎮 Game started:', caseData.title);
    
    // Start timer
    this.startTimer();
    
    return true;
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      
      const timerEl = document.getElementById('game-timer');
      if (timerEl) {
        timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getTimeTaken() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  selectAnswer(answer) {
    this.selectedAnswer = answer;
  }

  checkAnswer() {
    if (!this.currentCase || !this.selectedAnswer) {
      return { correct: false, message: 'No answer selected' };
    }
    
    const correct = this.selectedAnswer === this.currentCase.correctAnswer;
    const timeTaken = this.getTimeTaken();
    
    this.stopTimer();
    
    return {
      correct: correct,
      selectedAnswer: this.selectedAnswer,
      correctAnswer: this.currentCase.correctAnswer,
      timeTaken: timeTaken,
      explanation: this.currentCase.explanation
    };
  }
}

// Create global instance
window.game = new Game();
