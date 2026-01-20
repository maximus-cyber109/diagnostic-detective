// Database Module
// Supabase Client Wrapper (Stub for now)

// import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(window.GAME_CONFIG.supabase.url, window.GAME_CONFIG.supabase.key);

export const getCases = async () => {
    // let { data, error } = await supabase.from('diagnostic_cases').select('*');
    // return data;
    return [];
};

export const saveAttempt = async (userId, result) => {
    // Write to Supabase...
    console.log('Saving attempt to DB:', result);
};
