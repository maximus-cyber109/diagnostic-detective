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
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Missing required fields' })
            };
        }

        // Check if caseId is a valid UUID
        const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

        // If generated case (e.g. "c64"), database ID is null, but we track by code
        const dbCaseId = (caseId && isUUID(caseId)) ? caseId : null;

        // Get user's current attempt count
        const { data: user } = await supabase
            .from('diagnostic_users')
            .select('total_attempts')
            .eq('id', userId)
            .single();

        const attemptNumber = (user?.total_attempts || 0) + 1;

        // -----------------------------------------------------
        // REWARD CALCULATION LOGIC
        // -----------------------------------------------------
        // Fetch active rewards
        const { data: rewards } = await supabase
            .from('diagnostic_rewards')
            .select('*')
            .eq('is_active', true)
            .order('priority', { ascending: true }); // High priority first

        let earnedReward = null;

        if (rewards && rewards.length > 0) {
            // Find best matching reward
            earnedReward = rewards.find(r => totalScore >= r.min_score && totalScore <= r.max_score);
        }

        const tierName = earnedReward ? earnedReward.tier_name : null;
        const tierId = earnedReward ? earnedReward.tier_id : null;
        const rTitle = earnedReward ? earnedReward.tier_name : null;
        const cCode = earnedReward ? earnedReward.coupon_code : null;
        const cDiscount = earnedReward ? earnedReward.discount_value : null;

        console.log('🏆 Calculated Reward:', tierName, cCode);



        // Insert attempt record
        const { data: attempt, error: attemptError } = await supabase
            .from('diagnostic_attempts')
            .insert([{
                user_id: userId,
                case_id: dbCaseId, // Null if procedural case
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

                // Saving Reward Details
                reward_tier: tierId,
                reward_title: rTitle,
                coupon_code: cCode,
                coupon_discount: cDiscount,

                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (attemptError) {
            throw attemptError;
        }

        // Update user statistics
        const { data: currentUser, error: userError } = await supabase
            .from('diagnostic_users')
            .select('total_attempts, total_score, cases_solved, reward_attempts_used')
            .eq('id', userId)
            .single();

        if (userError && userError.code !== 'PGRST116') {
            console.warn('Could not fetch user stats for update', userError);
        }

        const updates = {
            total_attempts: attemptNumber,
            last_game_at: new Date().toISOString()
        };

        if (currentUser) {
            console.log('📝 Updating stats for user:', userId);
            console.log('Current Score:', currentUser.total_score, 'Adding:', totalScore);

            // Calculate new values based on current DB state
            if (!isPracticeMode) {
                updates.reward_attempts_used = (currentUser.reward_attempts_used || 0) + 1;
            }

            if (isCorrect) {
                updates.cases_solved = (currentUser.cases_solved || 0) + 1;
            }

            // Update score
            updates.total_score = (currentUser.total_score || 0) + totalScore;

            console.log('New Stats:', updates);
        }

        const { error: updateError } = await supabase
            .from('diagnostic_users')
            .update(updates)
            .eq('id', userId);

        if (updateError) {
            console.error('❌ Failed to update user stats:', updateError);
            // We don't fail the written attempt, but we should know about this
        } else {
            console.log('✅ User stats updated successfully');

            // Trigger Leaderboard Refresh
            try {
                await supabase.rpc('refresh_leaderboard');
            } catch (rpcErr) {
                console.warn('⚠️ Failed to refresh leaderboard:', rpcErr);
            }
        }

        // Update case play count using the valid RPC function ONLY if we have a real DB case ID
        if (dbCaseId) {
            try {
                await supabase.rpc('increment_case_play_count', { case_id: dbCaseId });
            } catch (rpcError) {
                console.warn('Failed to increment case count:', rpcError);
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                attempt: attempt,
                message: 'Attempt recorded successfully',
                reward: earnedReward ? {
                    name: earnedReward.product_description || earnedReward.tier_name,
                    code: earnedReward.coupon_code,
                    discount: earnedReward.discount_value
                } : null,
                newStats: {
                    rewardAttemptsUsed: updates.reward_attempts_used,
                    totalScore: updates.total_score,
                    casesSolved: updates.cases_solved
                }
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
