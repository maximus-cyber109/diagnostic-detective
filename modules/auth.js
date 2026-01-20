// modules/auth.js - Authentication Handler
class Auth {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  async login(email) {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      console.log('🔐 Attempting login:', email);
      
      const apiUrl = '/.netlify/functions/validate-customer';
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Authentication service unavailable. Please try again later.');
        }

        let errorMessage = 'Authentication failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store user data
      this.user = data.user;
      this.isAuthenticated = true;
      
      localStorage.setItem('diagnostic_user', JSON.stringify(data.user));
      localStorage.setItem('diagnostic_email', email);

      console.log('✅ Login successful:', this.user);
      return { success: true, user: data.user };

    } catch (error) {
      console.error('❌ Login error:', error);
      
      let userMessage = error.message;
      
      if (error.message.includes('Failed to fetch')) {
        userMessage = 'Network error. Please check your connection.';
      }
      
      return { 
        success: false, 
        error: userMessage
      };
    }
  }

  checkSession() {
    try {
      const storedUser = localStorage.getItem('diagnostic_user');
      const storedEmail = localStorage.getItem('diagnostic_email');

      if (storedUser && storedEmail) {
        this.user = JSON.parse(storedUser);
        this.isAuthenticated = true;
        console.log('✅ Session restored for:', storedEmail);
        return true;
      }
    } catch (error) {
      console.error('Session restore error:', error);
      this.logout();
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

// Create global instance
window.auth = new Auth();
