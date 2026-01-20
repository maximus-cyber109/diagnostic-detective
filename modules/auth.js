// modules/auth.js - Authentication Handler
class Auth {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
    }

    async validateEmail(email) {
        try {
            console.log('🔐 Validating email:', email);

            // Call Netlify function to validate with Magento and Supabase
            const response = await fetch(window.GAME_CONFIG.api.validateCustomer, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Validation failed');
            }

            // Store user data
            this.user = data.user;
            this.isAuthenticated = true;

            // Save to localStorage for session persistence
            localStorage.setItem('diagnostic_user', JSON.stringify(data.user));
            localStorage.setItem('diagnostic_email', email);

            console.log('✅ Authentication successful');
            return { success: true, user: data.user };

        } catch (error) {
            console.error('❌ Authentication failed:', error);
            return {
                success: false,
                error: error.message || 'Failed to validate email. Please try again.'
            };
        }
    }

    // Check if user has existing session
    checkSession() {
        const storedUser = localStorage.getItem('diagnostic_user');
        const storedEmail = localStorage.getItem('diagnostic_email');

        if (storedUser && storedEmail) {
            try {
                this.user = JSON.parse(storedUser);
                this.isAuthenticated = true;
                console.log('✅ Session restored');
                return true;
            } catch (error) {
                console.error('Session restore failed:', error);
                this.logout();
            }
        }
        return false;
    }

    logout() {
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('diagnostic_user');
        localStorage.removeItem('diagnostic_email');
        console.log('👋 Logged out');
    }

    getUser() {
        return this.user;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }
}

window.auth = new Auth();
