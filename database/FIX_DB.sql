-- =================================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX DATABASE PERMISSIONS
-- =================================================================

-- 1. FIX USER STATS UPDATES (The most critical fix)
-- Grant the "service_role" (your Netlify Backend) full power to update users
DROP POLICY IF EXISTS "Service role can manage users" ON diagnostic_users;
CREATE POLICY "Service role can manage users" ON diagnostic_users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. FIX LEADERBOARD VISIBILITY
-- Allow the frontend (anon/public) to READ user scores for the leaderboard
DROP POLICY IF EXISTS "Users can view own profile" ON diagnostic_users;
CREATE POLICY "Public read all profiles" ON diagnostic_users
  FOR SELECT TO anon, authenticated, service_role
  USING (true);

-- 3. FIX ATTEMPT VISIBILITY
-- Allow reading attempts (optional, but good for debugging)
DROP POLICY IF EXISTS "Users can view own attempts" ON diagnostic_attempts;
CREATE POLICY "Public read all attempts" ON diagnostic_attempts
  FOR SELECT TO anon, authenticated, service_role
  USING (true);

-- 4. MANUALLY REFRESH LEADERBOARD
-- The leaderboard is a "snapshot". It needs to be refreshed to show new scores.
REFRESH MATERIALIZED VIEW diagnostic_leaderboard;

-- 5. VERIFICATION
-- Check if your score is there now
SELECT email, total_score, cases_solved FROM diagnostic_users ORDER BY last_active_at DESC LIMIT 5;
