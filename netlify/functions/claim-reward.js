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

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, error: "Method Not Allowed" })
        };
    }

    try {
        const { userId, rewardId } = JSON.parse(event.body);

        // TODO: Verify eligibility and generate coupon code
        // This would interact with the rewards table and user stats

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                couponCode: 'CLAIMED123',
                expiry: '2025-12-31',
                message: 'Reward claimed successfully (Mock)'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: "Invalid Request" })
        };
    }
};
