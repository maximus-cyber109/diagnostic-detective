// functions/validate-customer.js - Validate customer with Magento API
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key (server-side only)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // Service role key for admin operations
);

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
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
        const { email } = JSON.parse(event.body);

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Invalid email format' })
            };
        }

        console.log('🔍 Validating customer:', email);

        // Step 1: Check Magento API
        let magentoCustomer = null;
        try {
            const magentoUrl = `${process.env.MAGENTO_API_URL}/customers/search`;
            const searchParams = new URLSearchParams({
                'searchCriteria[filterGroups][0][filters][0][field]': 'email',
                'searchCriteria[filterGroups][0][filters][0][value]': email,
                'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq'
            });

            const magentoResponse = await fetch(`${magentoUrl}?${searchParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.MAGENTO_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!magentoResponse.ok) {
                console.warn('⚠️ Magento API error:', magentoResponse.status);
            } else {
                const magentoData = await magentoResponse.json();

                if (magentoData.items && magentoData.items.length > 0) {
                    magentoCustomer = magentoData.items[0];
                    console.log('✅ Found in Magento:', magentoCustomer.email);
                } else {
                    console.log('⚠️ Customer not found in Magento');
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Email not found. Please register at PinkBlue.in first.'
                        })
                    };
                }
            }
        } catch (magentoError) {
            console.error('❌ Magento API error:', magentoError.message);
            // Don't fail completely, continue to check/create in Supabase
        }

        // Step 2: Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
            .from('diagnostic_users')
            .select('*')
            .eq('email', email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        // Step 3: Create or update user in Supabase
        let userData;

        if (existingUser) {
            // User exists, return their data
            console.log('✅ User found in database');
            userData = existingUser;

            // Update last active timestamp
            await supabase
                .from('diagnostic_users')
                .update({ last_active_at: new Date().toISOString() })
                .eq('id', existingUser.id);

        } else {
            // Create new user
            console.log('💾 Creating new user in database');

            const firstName = magentoCustomer?.firstname || email.split('@')[0];
            const lastName = magentoCustomer?.lastname || '';
            const displayName = `Dr. ${firstName} ${lastName}`.trim();

            const { data: newUser, error: createError } = await supabase
                .from('diagnostic_users')
                .insert([{
                    email: email,
                    magento_customer_id: magentoCustomer?.id?.toString() || null,
                    first_name: firstName,
                    last_name: lastName,
                    display_name: displayName,
                    phone: magentoCustomer?.custom_attributes?.find(a => a.attribute_code === 'mobilenumber')?.value || null,
                    city: magentoCustomer?.addresses?.[0]?.city || null,
                    state: magentoCustomer?.addresses?.[0]?.region?.region || null,
                    created_at: new Date().toISOString(),
                    last_active_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (createError) {
                throw createError;
            }

            userData = newUser;
            console.log('✅ User created successfully');
        }

        // Return success with user data
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                user: {
                    id: userData.id,
                    email: userData.email,
                    displayName: userData.display_name,
                    firstName: userData.first_name,
                    lastName: userData.last_name,
                    city: userData.city,
                    state: userData.state,
                    totalScore: userData.total_score || 0,
                    casеsSolved: userData.cases_solved || 0,
                    averageAccuracy: userData.average_accuracy || 0,
                    rewardAttemptsUsed: userData.reward_attempts_used || 0,
                    practiceAttempts: userData.practice_attempts || 0,
                    currentRank: userData.current_rank || null,
                    rankTitle: userData.rank_title || 'Diagnostic Novice'
                }
            })
        };

    } catch (error) {
        console.error('❌ Validation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Server error during validation',
                details: error.message
            })
        };
    }
};
