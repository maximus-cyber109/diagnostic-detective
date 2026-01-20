// Auth Module
// Handles user login, session management

export const checkSession = () => {
    const session = localStorage.getItem('dd_session');
    if (session) {
        return JSON.parse(session);
    }
    return null;
};

export const login = async (email) => {
    // 1. Validate Email format
    if (!validateEmail(email)) return null;

    // 2. Call Backend to Validate (Mocking for now)
    // const response = await fetch(window.GAME_CONFIG.api.validateCustomer, { ... });

    // MOCK RESPONSE
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate net lag

    const mockUser = {
        id: 'u123',
        email: email,
        display_name: 'Dr. Test User',
        rank_title: 'Diagnostic Novice',
        total_score: 0,
        cases_solved: 0,
        average_accuracy: '0.00',
        best_streak: 0,
        reward_attempts_used: 0
    };

    localStorage.setItem('dd_session', JSON.stringify(mockUser));
    return mockUser;
};

export const logout = () => {
    localStorage.removeItem('dd_session');
    window.location.reload();
};

function validateEmail(email) {
    // Relaxed Validation: Allow any string with at least 3 chars for "override" effect
    // User requested easy access
    return String(email).length > 2;
}
