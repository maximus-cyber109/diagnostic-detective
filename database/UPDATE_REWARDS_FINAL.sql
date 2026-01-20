-- Remove all existing rewards to ensure clean state
DELETE FROM diagnostic_rewards;

-- Insert ONLY the two requested rewards
INSERT INTO diagnostic_rewards 
(tier_id, tier_name, min_score, max_score, priority, product_name, product_description, coupon_code, discount_value, is_active)
VALUES 
-- Tier 1: Good Job (100-119) -> 5% Off
('good', 'Good Job', 100, 119, 2, '5% Discount', '5% Off Your Purchase', 'GOOD5', '5%', true),

-- Tier 2: Excellent (120+) -> 10% PB Cashback
('excellent', 'Excellent Performance', 120, 999999, 1, 'PB CASHBACK', '10% PB Cashback', 'EXCEL10', '10% Cashback', true);

-- Verify the update
SELECT * FROM diagnostic_rewards;
