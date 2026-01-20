-- =================================================================
-- UPDATE REWARDS SCRIPT
-- =================================================================

-- 1. Update the '10% PB CASHBACK' Reward
UPDATE diagnostic_rewards
SET 
  min_score = 100,
  max_score = 100,
  tier_name = '10% PB CASHBACK',
  product_description = '10% PB CASHBACK on your order! Your knowledge just paid off... literally.',
  coupon_code = 'ADXFHA',
  discount_value = '10% PB CASHBACK',
  priority = 1,
  is_active = true,
  -- Assuming you want to clear the image or set it if provided. Leaving as is if not specified in update list clearly.
  updated_at = NOW()
WHERE id = '242c623d-bde0-401d-8e94-7d411b5bd218';

-- 2. Update the 'Flat 5% Off' Reward
UPDATE diagnostic_rewards
SET 
  min_score = 80,
  max_score = 99,
  tier_name = 'Flat 5% Off!',
  product_description = 'Flat 6% Off! Hey, even wisdom teeth take time to grow.',
  coupon_code = 'PYUASQ',
  discount_value = '5% Off',
  priority = 2,
  is_active = true,
  updated_at = NOW()
WHERE id = '3f10e232-f3c2-4a3b-97e1-485aec477e58';

-- 3. VERIFY UPDATES
SELECT id, tier_name, min_score, max_score, coupon_code FROM diagnostic_rewards;
