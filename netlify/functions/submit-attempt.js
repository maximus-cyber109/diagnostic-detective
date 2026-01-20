// functions/submit-attempt.js - Record game attempt
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, error: 'Method not allowed' })
        };
    }

    try {
        const attemptData = JSON.parse(event.body);

        const {
            userId,
            caseId,
            caseCode,
            selectedOption,
            isCorrect,
            timeTaken,
            scoreEarned,
            timeBonus,
            streakBonus,
            totalScore,
            isPracticeMode,
            difficulty,
            rewardTier,
            rewardTitle,
            couponCode,
            couponDiscount
        } = attemptData;

        // Validate required fields
        if (!userId || !caseId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Missing required fields' })
            };
        }

        // Get user's current attempt count
        const { data: user } = await supabase
            .from('diagnostic_users')
            .select('total_attempts')
            .eq('id', userId)
            .single();

        const attemptNumber = (user?.total_attempts || 0) + 1;

        // Insert attempt record
        const { data: attempt, error: attemptError } = await supabase
            .from('diagnostic_attempts')
            .insert([{
                user_id: userId,
                case_id: caseId,
                case_code: caseCode,
                attempt_number: attemptNumber,
                selected_option: selectedOption,
                is_correct: isCorrect,
                time_taken: timeTaken,
                score_earned: scoreEarned,
                time_bonus: timeBonus || 0,
                streak_bonus: streakBonus || 0,
                total_score: totalScore,
                is_practice_mode: isPracticeMode || false,
                difficulty: difficulty,
                reward_tier: rewardTier,
                reward_title: rewardTitle,
                coupon_code: couponCode,
                coupon_discount: couponDiscount,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (attemptError) {
            throw attemptError;
        }

        // Update user statistics
        const updates = {
            total_attempts: attemptNumber,
            last_game_at: new Date().toISOString()
        };

        if (!isPracticeMode) {
            updates.reward_attempts_used = supabase.rpc('increment', { row_id: userId, column_name: 'reward_attempts_used' });
        }

        if (isCorrect) {
            updates.cases_solved = supabase.rpc('increment', { row_id: userId, column_name: 'cases_solved' });
        }

        // Update best score if this is better
        const { data: currentUser } = await supabase
            .from('diagnostic_users')
            .select('total_score, best_streak')
            .eq('id', userId)
            .single();

        if (currentUser) {
            updates.total_score = (currentUser.total_score || 0) + totalScore;
        }

        await supabase
            .from('diagnostic_users')
            .update(updates)
            .eq('id', userId);

        // Update case play count
        await supabase.rpc('increment_case_play_count', { case_id: caseId });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                attempt: attempt,
                message: 'Attempt recorded successfully'
            })
        };

    } catch (error) {
        console.error('❌ Submit attempt error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to record attempt',
                details: error.message
            })
        };
    }
};
