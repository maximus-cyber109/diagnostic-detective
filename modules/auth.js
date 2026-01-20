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
    // 1. Validate Email format locally first
    if (!validateEmail(email)) return null;

    // 2. Call Magento via Netlify Function
    try {
        const response = await fetch(window.GAME_CONFIG.api.validateCustomer, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'getCustomer',
                email: email
            })
        });

        const data = await response.json();

        if (data.success && data.customer) {
            // Customer found in Magento
            const user = {
                id: data.customer.id,
                email: data.customer.email,
                display_name: `Dr. ${data.customer.firstname} ${data.customer.lastname}`,
                rank_title: 'Diagnostic Novice',
                total_score: 0,
                cases_solved: 0,
                average_accuracy: '0.00',
                best_streak: 0,
                current_streak: 0,
                reward_attempts_used: 0
            };

            localStorage.setItem('dd_session', JSON.stringify(user));
            return user;
        } else {
            // Customer not found
            console.warn('Customer not found:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Login API Error:', error);
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem('dd_session');
    window.location.reload();
};

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}
