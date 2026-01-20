export default async (req, context) => {
    // TODO: Fetch from Supabase View 'diagnostic_leaderboard'

    const mockLeaderboard = [
        { rank: 1, display_name: 'Dr. House', total_score: 5000, cases_solved: 42 },
        { rank: 2, display_name: 'Dr. Watson', total_score: 4800, cases_solved: 40 },
        { rank: 3, display_name: 'Dr. Strange', total_score: 4500, cases_solved: 38 },
        // ...
    ];

    return new Response(JSON.stringify(mockLeaderboard), {
        headers: { "Content-Type": "application/json" }
    });
};
