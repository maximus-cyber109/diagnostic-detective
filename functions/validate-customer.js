export default async (req, context) => {
    // const { email } = await req.json(); // If handling POST body
    const email = new URL(req.url).searchParams.get("email");

    // TODO: Connect to Magento API here
    // const magentoUrl = process.env.MAGENTO_API_URL;
    // ...

    // Mock Response
    if (email && email.includes('@')) {
        return new Response(JSON.stringify({
            success: true,
            customer: {
                email: email,
                firstname: 'Doctor',
                lastname: 'Strange',
                customer_id: 'CUST001'
            }
        }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email or customer not found'
    }), { status: 400, headers: { "Content-Type": "application/json" } });
};
