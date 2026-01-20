export default async (req, context) => {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    try {
        const body = await req.json();
        // Body: { userId, caseId, selectedOption, timeTaken ... }

        // TODO: Validate logic on server side
        // const isCorrect = checkAnswer(body.caseId, body.selectedOption);

        // TODO: Save to Supabase

        return new Response(JSON.stringify({
            success: true,
            message: 'Attempt recorded'
        }), { headers: { "Content-Type": "application/json" } });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
