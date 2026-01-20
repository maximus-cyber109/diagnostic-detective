// functions/get-leaderboard.js - Fetch leaderboard
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const limit = parseInt(event.queryStringParameters?.limit) || 10;

        const { data, error } = await supabase
            .from('diagnostic_users')
            .select('display_name, city, total_score, cases_solved, average_accuracy, best_streak')
            .gt('total_score', 0)
            .order('total_score', { ascending: false })
            .order('cases_solved', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        const leaderboard = data.map((user, index) => ({
            rank: index + 1,
            display_name: user.display_name,
            city: user.city,
            total_score: user.total_score,
            cases_solved: user.cases_solved,
            average_accuracy: user.average_accuracy,
            best_streak: user.best_streak
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                leaderboard: leaderboard
            })
        };

    } catch (error) {
        console.error('❌ Leaderboard error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch leaderboard'
            })
        };
    }
};
