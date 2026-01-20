import { generateCases } from './modules/cases.js';

window.GAME_CONFIG = {
    // API Endpoints
    api: {
        validateCustomer: '/.netlify/functions/validate-customer',
        submitAttempt: '/.netlify/functions/submit-attempt',
        getLeaderboard: '/.netlify/functions/get-leaderboard',
        claimReward: '/.netlify/functions/claim-reward'
    },

    // Game Rules
    game: {
        maxRewardAttempts: 1,        // STRICT: Only 1 attempt for rewards
        timePerCase: 180,
        basePoints: 100,
        timeBonusThreshold: 60,
        timeBonus: 50,
        streakBonusThreshold: 3,
        streakBonus: 25
    },

    // Reward Tiers (Only 2 Valid Rewards)
    rewards: [
        {
            tier: 'gold',
            minScore: 100, // Reasonable threshold for the "Cashback"
            title: 'PinkBlue Cashback',
            description: '5% Cashback on your next order',
            couponCode: 'FGAHDS',
            discount: '5% Cashback',
            imageUrl: 'assets/images/rewards/participation.png'
        },
        {
            tier: 'silver',
            minScore: 0, // Everyone who plays gets at least discount
            title: 'PinkBlue Discount',
            description: '5% Off your next order',
            couponCode: 'CODE SDFASG',
            discount: '5% Off',
            imageUrl: 'assets/images/rewards/participation.png'
        }
    ],

    // Ranks
    ranks: [
        { title: 'Novice', minScore: 0, icon: '🔰' },
        { title: 'Resident', minScore: 500, icon: '🩺' },
        { title: 'Specialist', minScore: 1500, icon: '⚕️' },
        { title: 'Chief of Staff', minScore: 3000, icon: '👑' }
    ],

    messages: {
        welcome: ["Welcome to PinkBlue Diagnostics."],
        correct: ["Diagnosis Confirmed."],
        incorrect: ["Diagnosis Incorrect."],
    }
};

// Generate the 100 Cases
window.ALL_CASES = generateCases();
