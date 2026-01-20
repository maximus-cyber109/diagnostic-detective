export default async (req, context) => {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const { userId, rewardId } = await req.json();

    // TODO: Verify eligibility and generate coupon code

    return new Response(JSON.stringify({
        success: true,
        couponCode: 'CLAIMED123',
        expiry: '2025-12-31'
    }), { headers: { "Content-Type": "application/json" } });
};
