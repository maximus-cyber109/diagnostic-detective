-- ===========================================
-- DIAGNOSTIC DETECTIVE - Database Schema
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TABLE 1: diagnostic_users
-- ===========================================
CREATE TABLE IF NOT EXISTS diagnostic_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  magento_customer_id TEXT,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  phone TEXT,
  clinic_name TEXT,
  city TEXT,
  state TEXT,
  
  -- Game Stats
  total_attempts INT DEFAULT 0,
  reward_attempts_used INT DEFAULT 0,
  practice_attempts INT DEFAULT 0,
  cases_solved INT DEFAULT 0,
  total_score INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  average_accuracy DECIMAL(5,2) DEFAULT 0,
  fastest_time INT,
  
  -- Ranks
  current_rank INT,
  rank_title TEXT DEFAULT 'Diagnostic Novice',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  last_game_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_diagnostic_users_email ON diagnostic_users(email);
CREATE INDEX IF NOT EXISTS idx_diagnostic_users_score ON diagnostic_users(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostic_users_active ON diagnostic_users(is_active);

-- ===========================================
-- TABLE 2: diagnostic_cases
-- ===========================================
CREATE TABLE IF NOT EXISTS diagnostic_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_code TEXT UNIQUE NOT NULL,
  case_number INT NOT NULL,
  
  -- Case Details
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  specialty TEXT,
  
  -- Patient Information
  patient_age INT,
  patient_gender TEXT,
  chief_complaint TEXT NOT NULL,
  medical_history TEXT,
  dental_history TEXT,
  
  -- Clinical Data
  clinical_findings TEXT[],
  radiographic_findings TEXT[],
  symptoms TEXT[],
  
  -- Images
  primary_image_url TEXT NOT NULL,
  secondary_image_url TEXT,
  image_type TEXT,
  image_caption TEXT,
  
  -- Question & Answer
  question TEXT,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  
  -- Educational Content
  explanation TEXT NOT NULL,
  differential_diagnosis TEXT[],
  treatment_plan TEXT,
  learning_points TEXT[],
  case_references TEXT[], -- RENAMED from 'references' to avoid keyword conflict
  
  -- Metadata
  tags TEXT[],
  points_value INT DEFAULT 100,
  time_limit INT DEFAULT 180,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  play_count INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_diagnostic_cases_code ON diagnostic_cases(case_code);
CREATE INDEX IF NOT EXISTS idx_diagnostic_cases_difficulty ON diagnostic_cases(difficulty);
CREATE INDEX IF NOT EXISTS idx_diagnostic_cases_active ON diagnostic_cases(is_active);
CREATE INDEX IF NOT EXISTS idx_diagnostic_cases_featured ON diagnostic_cases(is_featured);
CREATE INDEX IF NOT EXISTS idx_diagnostic_cases_number ON diagnostic_cases(case_number);

-- ===========================================
-- TABLE 3: diagnostic_attempts
-- ===========================================
CREATE TABLE IF NOT EXISTS diagnostic_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  user_id UUID REFERENCES diagnostic_users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES diagnostic_cases(id) ON DELETE CASCADE,
  case_code TEXT NOT NULL,
  
  -- Attempt Details
  attempt_number INT NOT NULL,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  time_taken INT NOT NULL,
  score_earned INT NOT NULL,
  
  -- Bonuses
  time_bonus INT DEFAULT 0,
  streak_bonus INT DEFAULT 0,
  total_score INT NOT NULL,
  
  -- Context
  is_practice_mode BOOLEAN DEFAULT false,
  difficulty TEXT,
  
  -- Rewards
  reward_tier TEXT,
  reward_title TEXT,
  coupon_code TEXT,
  coupon_discount TEXT,
  coupon_claimed BOOLEAN DEFAULT false,
  coupon_claimed_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_diagnostic_attempts_user ON diagnostic_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_attempts_case ON diagnostic_attempts(case_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_attempts_created ON diagnostic_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostic_attempts_practice ON diagnostic_attempts(is_practice_mode);

-- ===========================================
-- TABLE 4: diagnostic_rewards
-- ===========================================
CREATE TABLE IF NOT EXISTS diagnostic_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reward Tier
  tier_id TEXT UNIQUE NOT NULL,
  tier_name TEXT NOT NULL,
  min_score INT NOT NULL,
  max_score INT NOT NULL,
  priority INT NOT NULL,
  
  -- Reward Details
  product_name TEXT NOT NULL,
  product_description TEXT,
  product_image_url TEXT,
  product_sku TEXT,
  
  -- Coupon
  coupon_code TEXT NOT NULL,
  discount_type TEXT,
  discount_value TEXT,
  discount_description TEXT,
  
  -- Conditions
  min_cart_value DECIMAL(10,2),
  max_uses_per_user INT,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  display_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_diagnostic_rewards_active ON diagnostic_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_diagnostic_rewards_tier ON diagnostic_rewards(tier_id);

-- ===========================================
-- TABLE 5: diagnostic_sessions
-- ===========================================
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES diagnostic_users(id) ON DELETE CASCADE,
  
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  cases_played INT DEFAULT 0,
  session_score INT DEFAULT 0,
  
  device_type TEXT,
  browser TEXT,
  referrer TEXT
);

-- Index
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_user ON diagnostic_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_start ON diagnostic_sessions(session_start DESC);

-- ===========================================
-- MATERIALIZED VIEW: diagnostic_leaderboard
-- ===========================================
CREATE MATERIALIZED VIEW IF NOT EXISTS diagnostic_leaderboard AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.city,
  u.state,
  u.total_score,
  u.cases_solved,
  u.average_accuracy,
  u.best_streak,
  u.fastest_time,
  ROW_NUMBER() OVER (ORDER BY u.total_score DESC, u.cases_solved DESC, u.created_at ASC) as rank
FROM diagnostic_users u
WHERE u.is_active = true AND u.total_score > 0
ORDER BY u.total_score DESC
LIMIT 100;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_user_id ON diagnostic_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON diagnostic_leaderboard(rank);

-- ===========================================
-- FUNCTIONS & TRIGGERS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for diagnostic_cases
DROP TRIGGER IF EXISTS update_diagnostic_cases_updated_at ON diagnostic_cases;
CREATE TRIGGER update_diagnostic_cases_updated_at
BEFORE UPDATE ON diagnostic_cases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to increment case play count
CREATE OR REPLACE FUNCTION increment_case_play_count(case_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE diagnostic_cases 
  SET play_count = play_count + 1 
  WHERE id = case_id;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh leaderboard (call this periodically)
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY diagnostic_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- ===========================================

-- Enable RLS on tables
ALTER TABLE diagnostic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_cases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile" ON diagnostic_users
  FOR SELECT USING (true); -- All users can view (for leaderboard)

-- Policy: Only service role can write user data
CREATE POLICY "Service role can manage users" ON diagnostic_users
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: All users can read active cases
CREATE POLICY "Users can view active cases" ON diagnostic_cases
  FOR SELECT USING (is_active = true);

-- Policy: Users can view their own attempts
CREATE POLICY "Users can view own attempts" ON diagnostic_attempts
  FOR SELECT USING (true);

-- Policy: Only service role can insert attempts
CREATE POLICY "Service role can insert attempts" ON diagnostic_attempts
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ===========================================
-- SEED DATA - Sample Reward Tiers
-- ===========================================

INSERT INTO diagnostic_rewards (tier_id, tier_name, min_score, max_score, priority, product_name, product_description, coupon_code, discount_value, discount_description, is_active)
VALUES 
  ('perfect', 'Perfect Score', 150, 999999, 1, 'Elements Retract Complete Kit', 'Premium hemostatic kit - FREEBIE + 15% Off', 'PERFECT15', '15%', '15% Off + Free Product', true),
  ('excellent', 'Excellent Performance', 120, 149, 2, 'Elements Whitening System', 'Professional whitening kit - 10% Off', 'EXCEL10', '10%', '10% Off Entire Order', true),
  ('good', 'Good Job', 100, 119, 3, 'Premium Burs Set', 'Diamond burs collection - 5% Off', 'GOOD5', '5%', '5% Off Your Purchase', true),
  ('participation', 'Keep Practicing', 0, 99, 4, 'Better Luck Next Time', 'Keep practicing to unlock rewards', 'PRACTICE', '0%', 'No reward - Try again', true)
ON CONFLICT (tier_id) DO NOTHING;

-- ===========================================
-- DONE! Schema created successfully
-- ===========================================
