// config.js - Frontend Configuration (NO SECRETS HERE)
window.GAME_CONFIG = {
    // API Endpoints (Netlify Functions)
    api: {
        validateCustomer: '/.netlify/functions/validate-customer',
        submitAttempt: '/.netlify/functions/submit-attempt',
        getLeaderboard: '/.netlify/functions/get-leaderboard',
        claimReward: '/.netlify/functions/claim-reward'
    },

    // Game Rules
    game: {
        maxRewardAttempts: 2,
        timePerCase: 180, // 3 minutes
        basePoints: 100,
        timeBonusThreshold: 60,
        timeBonus: 50,
        streakBonusThreshold: 3,
        streakBonus: 25
    },

    // Reward Tiers (These are safe to expose)
    rewards: [
        {
            tier: 'perfect',
            minScore: 150,
            title: 'Elements Retract Complete Kit',
            description: 'Premium hemostatic kit - FREEBIE + 15% Off',
            couponCode: 'PERFECT15',
            discount: '15% + Free Product',
            imageUrl: 'https://email-editor-resources.s3.amazonaws.com/images/82618240/elements%20retract.png'
        },
        {
            tier: 'excellent',
            minScore: 120,
            title: 'Elements Whitening System',
            description: 'Professional whitening - 10% Off',
            couponCode: 'EXCEL10',
            discount: '10% Off',
            imageUrl: 'https://email-editor-resources.s3.amazonaws.com/images/82618240/elements%20bleaching%20kit.png'
        },
        {
            tier: 'good',
            minScore: 100,
            title: 'Premium Burs Set',
            description: 'Diamond burs - 5% Off',
            couponCode: 'GOOD5',
            discount: '5% Off',
            imageUrl: 'https://pinkblue.in/media/catalog/product/placeholder/default/no-image.png'
        },
        {
            tier: 'participation',
            minScore: 0,
            title: 'Keep Practicing!',
            description: 'Try again to unlock rewards',
            couponCode: null,
            discount: null
        }
    ],

    // Messages
    messages: {
        welcome: [
            "Ready to crack some cases, detective? 🔍",
            "Time to put those diagnostic skills to work! 💪"
        ],
        correct: ["Spot on diagnosis! 🎯", "You nailed it! 🔥"],
        incorrect: ["Not quite, but great try! 🤔", "Close! Review the explanation 📚"]
    }
};
