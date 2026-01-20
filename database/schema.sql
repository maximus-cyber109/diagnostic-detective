-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Diagnostic Users
CREATE TABLE diagnostic_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  magento_customer_id TEXT,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT, -- "Dr. Firstname Lastname"
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
  fastest_time INT, -- seconds
  
  -- Ranks
  current_rank INT,
  rank_title TEXT, -- "Diagnostic Novice", "Clinical Expert", "Master Diagnostician"
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  last_game_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_diagnostic_users_email ON diagnostic_users(email);
CREATE INDEX idx_diagnostic_users_score ON diagnostic_users(total_score DESC);

-- 2. Diagnostic Cases
CREATE TABLE diagnostic_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_code TEXT UNIQUE NOT NULL, -- "CASE001", "CASE002"
  case_number INT NOT NULL,
  
  -- Case Details
  title TEXT NOT NULL, -- "The Mystery Molar"
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  specialty TEXT, -- "Endodontics", "Periodontics", "Oral Surgery"
  
  -- Patient Information
  patient_age INT,
  patient_gender TEXT,
  chief_complaint TEXT NOT NULL,
  medical_history TEXT,
  dental_history TEXT,
  
  -- Clinical Data
  clinical_findings TEXT[], -- Array of findings
  radiographic_findings TEXT[],
  symptoms TEXT[],
  
  -- Images
  primary_image_url TEXT NOT NULL,
  secondary_image_url TEXT,
  image_type TEXT, -- "periapical", "bitewing", "panoramic", "cbct", "intraoral_photo"
  image_caption TEXT,
  
  -- Question & Answer
  question TEXT, -- "What is the most likely diagnosis?"
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL, -- "A", "B", "C", or "D"
  
  -- Educational Content
  explanation TEXT NOT NULL, -- Why this is correct
  differential_diagnosis TEXT[], -- Other possibilities
  treatment_plan TEXT,
  learning_points TEXT[],
  references TEXT[], -- Citations/sources
  
  -- Metadata
  tags TEXT[], -- ["caries", "pulpitis", "endodontics"]
  points_value INT DEFAULT 100,
  time_limit INT DEFAULT 180, -- seconds
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  play_count INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diagnostic_cases_difficulty ON diagnostic_cases(difficulty);
CREATE INDEX idx_diagnostic_cases_active ON diagnostic_cases(is_active);
CREATE INDEX idx_diagnostic_cases_featured ON diagnostic_cases(is_featured);

-- 3. Diagnostic Attempts
CREATE TABLE diagnostic_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  user_id UUID REFERENCES diagnostic_users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES diagnostic_cases(id) ON DELETE CASCADE,
  case_code TEXT NOT NULL,
  
  -- Attempt Details
  attempt_number INT NOT NULL, -- User's nth attempt overall
  selected_option TEXT NOT NULL, -- "A", "B", "C", "D"
  is_correct BOOLEAN NOT NULL,
  time_taken INT NOT NULL, -- seconds
  score_earned INT NOT NULL,
  
  -- Bonuses
  time_bonus INT DEFAULT 0,
  streak_bonus INT DEFAULT 0,
  total_score INT NOT NULL,
  
  -- Context
  is_practice_mode BOOLEAN DEFAULT false,
  difficulty TEXT,
  
  -- Rewards
  reward_tier TEXT, -- "perfect", "excellent", "good"
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

CREATE INDEX idx_diagnostic_attempts_user ON diagnostic_attempts(user_id);
CREATE INDEX idx_diagnostic_attempts_case ON diagnostic_attempts(case_id);
CREATE INDEX idx_diagnostic_attempts_created ON diagnostic_attempts(created_at DESC);

-- 4. Diagnostic Rewards
CREATE TABLE diagnostic_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reward Tier
  tier_id TEXT UNIQUE NOT NULL, -- "perfect", "excellent", "good", "participation"
  tier_name TEXT NOT NULL,
  min_score INT NOT NULL,
  max_score INT NOT NULL,
  priority INT NOT NULL, -- Lower = higher priority
  
  -- Reward Details
  product_name TEXT NOT NULL,
  product_description TEXT,
  product_image_url TEXT,
  product_sku TEXT, -- Magento SKU for freebie
  
  -- Coupon
  coupon_code TEXT NOT NULL,
  discount_type TEXT, -- "percentage", "fixed", "free_product"
  discount_value TEXT, -- "15%", "₹500", "Free Product"
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

-- 5. Diagnostic Leaderboard (Materialized View)
CREATE MATERIALIZED VIEW diagnostic_leaderboard AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.city,
  u.total_score,
  u.cases_solved,
  u.average_accuracy,
  u.best_streak,
  u.fastest_time,
  ROW_NUMBER() OVER (ORDER BY u.total_score DESC, u.cases_solved DESC) as rank
FROM diagnostic_users u
WHERE u.is_active = true AND u.total_score > 0
ORDER BY u.total_score DESC
LIMIT 100;

CREATE INDEX idx_leaderboard_rank ON diagnostic_leaderboard(rank);

-- 6. Diagnostic Sessions
CREATE TABLE diagnostic_sessions (
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
