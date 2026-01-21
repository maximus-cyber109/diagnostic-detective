const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const MAGENTO_TOKEN = process.env.MAGENTO_API_TOKEN || '';
const MAGENTO_BASE_URL = process.env.MAGENTO_BASE_URL || 'https://pinkblue.in/rest/V1';

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const FIREWALL_HEADERS = {
    'Authorization': `Bearer ${MAGENTO_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'PB_Netlify',
    'X-Source-App': 'ClinicalMastery',
    'X-Netlify-Secret': 'X-PB-NetlifY2025-901AD7EE35110CCB445F3CA0EBEB1494'
};

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

async function getCustomerByEmail(email) {
    return new Promise((resolve, reject) => {
        const endpoint = `/customers/search?searchCriteria[filterGroups][0][filters][0][field]=email&searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(email)}&searchCriteria[filterGroups][0][filters][0][conditionType]=eq`;
        const url = `${MAGENTO_BASE_URL}${endpoint}`;

        const req = https.request(url, {
            method: 'GET',
            headers: FIREWALL_HEADERS,
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.items && parsed.items.length > 0) {
                        const customer = parsed.items[0];
                        resolve({
                            success: true,
                            customer: {
                                magento_id: customer.id, // Keep Magento ID separately
                                email: customer.email,
                                firstname: customer.firstname,
                                lastname: customer.lastname
                            }
                        });
                    } else {
                        resolve({ success: false, error: 'Customer not found' });
                    }
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.abort();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
}

// Function to Sync with Supabase and Get UUID
async function syncUserWithSupabase(customer) {
    console.log('🔄 Syncing user with Supabase:', customer.email);

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
        .from('diagnostic_users')
        .select('id, display_name, magento_customer_id')
        .eq('email', customer.email)
        .single();

    if (existingUser) {
        console.log('✅ User found in DB:', existingUser.id);

        // Update magento_id if missing
        if (!existingUser.magento_customer_id) {
            await supabase
                .from('diagnostic_users')
                .update({ magento_customer_id: customer.magento_id })
                .eq('id', existingUser.id);
        }

        return {
            ...customer,
            id: existingUser.id, // USE SUPABASE UUID
            displayName: existingUser.display_name || `${customer.firstname} ${customer.lastname}`.trim()
        };
    }

    // Create new user (Upsert based on email)
    const displayName = `${customer.firstname} ${customer.lastname}`.trim();
    const newUser = {
        email: customer.email,
        magento_customer_id: customer.magento_id ? String(customer.magento_id) : null,
        first_name: customer.firstname,
        last_name: customer.lastname || '',
        display_name: displayName,
        is_active: true,
        created_at: new Date().toISOString()
    };

    const { data: createdUser, error: insertError } = await supabase
        .from('diagnostic_users')
        .upsert(newUser, { onConflict: 'email' })
        .select()
        .single();

    if (insertError) {
        console.error('❌ Supabase user creation failed:', insertError);
        throw new Error('Failed to synchronize user account');
    }

    console.log('✨ New user created:', createdUser.id);
    return {
        ...customer,
        id: createdUser.id, // RETURN SUPABASE UUID
        displayName: displayName
    };
}

exports.handler = async (event) => {
    console.log('🚀 Clinical Mastery - Validate Customer');
    // console.log('HTTP Method:', event.httpMethod); // Reduced logging

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        let action, email;

        if (event.httpMethod === 'POST' && event.body) {
            const body = JSON.parse(event.body);
            action = body.action;
            email = body.email;
        } else if (event.httpMethod === 'GET' && event.queryStringParameters) {
            action = event.queryStringParameters.action;
            email = event.queryStringParameters.email;
        }

        if (action === 'getCustomer' && email) {
            // 1. Get from Magento
            const magentoResult = await getCustomerByEmail(email);

            if (!magentoResult.success) {
                return {
                    statusCode: 200, // Return 200 but simple success: false for frontend
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                    body: JSON.stringify(magentoResult)
                };
            }

            // 2. Sync with Supabase (Get UUID)
            try {
                const synchronizedUser = await syncUserWithSupabase(magentoResult.customer);

                return {
                    statusCode: 200,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: true,
                        customer: synchronizedUser // This now has UUID as .id
                    })
                };
            } catch (syncError) {
                console.error('Sync Error:', syncError);
                return {
                    statusCode: 500,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: false, error: 'Account synchronization failed' })
                };
            }
        }

        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: 'Invalid request',
                details: `Missing action or email.`
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
