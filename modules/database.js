// modules/database.js - Supabase Client for Frontend
class Database {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    async init() {
        try {
            // Get public Supabase config from Netlify function
            const response = await fetch('/.netlify/functions/get-config');
            const config = await response.json();

            if (!config.supabaseUrl || !config.supabaseKey) {
                throw new Error('Supabase configuration not available');
            }

            // Initialize Supabase client with public anon key
            this.client = window.supabase.createClient(
                config.supabaseUrl,
                config.supabaseKey
            );

            this.initialized = true;
            console.log('✅ Database initialized');
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
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
            await this.init();
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
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return null;
        }
    }
}

window.database = new Database();
