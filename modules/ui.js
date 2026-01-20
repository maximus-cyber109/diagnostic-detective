// modules/ui.js - UI Helper Functions
class UI {
  constructor() {
    this.toastContainer = null;
  }

  showLoading(message = 'Loading...') {
    console.log('Loading:', message);
    // You can implement a loading spinner here if needed
  }

  hideLoading() {
    console.log('Loading complete');
  }

  showToast(message, type = 'info') {
    console.log(`Toast [${type}]:`, message);
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-lg transition-all transform animate-slide-down ${
      type === 'error' ? 'bg-red-500 text-white' : 
      type === 'success' ? 'bg-green-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    
    // Add icon
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${icon}</span>
        <span class="font-medium">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showLeaderboardModal(leaderboard) {
    const modal = document.getElementById('leaderboard-modal');
    if (!modal) return;
    
    // Populate leaderboard content
    const container = modal.querySelector('.flex-1');
    if (container && leaderboard && leaderboard.length > 0) {
      container.innerHTML = leaderboard.map((player, idx) => `
        <div class="p-3 bg-slate-50 mb-2 rounded-lg flex justify-between items-center">
          <div class="flex items-center gap-3">
            <span class="font-bold text-primary">#${idx + 1}</span>
            <span class="font-medium">${player.name || 'Anonymous'}</span>
          </div>
          <span class="font-bold text-text-main">${player.score || 0} pts</span>
        </div>
      `).join('');
    }
    
    modal.classList.remove('hidden');
  }
}

// Create global instance
window.ui = new UI();
