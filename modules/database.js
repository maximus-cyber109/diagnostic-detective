// modules/database.js - Database Handler
class Database {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  async init() {
    try {
      // Get public Supabase config from Netlify function
      const response = await fetch('/.netlify/functions/get-config');

      if (!response.ok) {
        console.warn('⚠️ Could not fetch config from server, using fallback');
        // Fallback - will work if you add public keys to config.js
        this.initialized = false;
        return false;
      }

      const config = await response.json();

      if (!config.supabaseUrl || !config.supabaseKey) {
        console.warn('⚠️ Supabase configuration not available');
        this.initialized = false;
        return false;
      }

      // Initialize Supabase client with public anon key
      if (window.supabase && window.supabase.createClient) {
        this.client = window.supabase.createClient(
          config.supabaseUrl,
          config.supabaseKey
        );
        this.initialized = true;
        console.log('✅ Database initialized');
        return true;
      } else {
        console.error('❌ Supabase library not loaded');
        return false;
      }
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      this.initialized = false;
      return false;
    }
  }

  // Get leaderboard data
  async getLeaderboard(limit = 10) {
    try {
      const response = await fetch(`/.netlify/functions/get-leaderboard?limit=${limit}`);
      const data = await response.json();
      return data.success ? data.leaderboard : [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Check user stats
  async getUserStats(email) {
    if (!this.initialized || !this.client) {
      console.warn('Database not initialized');
      return null;
    }

    try {
      const { data, error } = await this.client
        .from('diagnostic_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  // Get played cases for a user
  async getPlayedCases(userId) {
    if (!this.initialized || !this.client) return [];

    try {
      const { data, error } = await this.client
        .from('diagnostic_attempts')
        .select('case_code')
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(item => item.case_code);
    } catch (error) {
      console.error('Error fetching played cases:', error);
      return [];
    }
  }
}

// Create global instance
window.database = new Database();
