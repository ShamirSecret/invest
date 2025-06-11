-- Enhanced seed data with more realistic investment options

-- Clear existing data first
DELETE FROM investments;
DELETE FROM asset_terms;
DELETE FROM assets;
DELETE FROM platform_metrics;

-- Insert enhanced assets with more variety
INSERT INTO assets (onchain_asset_id, name, description, asset_type, issuer, bond_isin, bond_maturity_date) VALUES
('USTB-2024-Q4', 'US Treasury Bond Q4 2024', 'Short-term US Treasury Bond with quarterly maturity', 'us_treasury_bond', 'US Treasury Department', 'US912828XY12', '2024-12-31'),
('USTB-2025-H1', 'US Treasury Bond H1 2025', 'Medium-term US Treasury Bond with semi-annual returns', 'us_treasury_bond', 'US Treasury Department', 'US912828XY34', '2025-06-30'),
('USTB-2025-H2', 'US Treasury Bond H2 2025', 'Stable government-backed investment vehicle', 'us_treasury_bond', 'US Treasury Department', 'US912828XY56', '2025-12-31'),
('CORP-AAPL-2025', 'Apple Inc Corporate Bond', 'High-grade corporate bond from Apple Inc', 'corporate_bond', 'Apple Inc', 'US037833CH69', '2025-08-15'),
('CORP-MSFT-2026', 'Microsoft Corp Bond', 'Investment grade corporate bond with tech exposure', 'corporate_bond', 'Microsoft Corporation', 'US594918BW27', '2026-03-17'),
('CORP-GOOGL-2025', 'Alphabet Inc Bond Series A', 'Premium corporate bond from Alphabet Inc', 'corporate_bond', 'Alphabet Inc', 'US02079K1079', '2025-11-30'),
('CORP-JPM-2024', 'JPMorgan Chase Bond', 'Financial sector corporate bond with quarterly dividends', 'corporate_bond', 'JPMorgan Chase & Co', 'US46625H1005', '2024-09-15'),
('USTB-TIPS-2026', 'Treasury Inflation-Protected Securities', 'Inflation-adjusted US Treasury securities', 'us_treasury_bond', 'US Treasury Department', 'US912828XZ78', '2026-01-15');

-- Insert comprehensive asset terms for each asset
-- US Treasury Bond Q4 2024 (Lower risk, lower returns)
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0285, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024-Q4';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0315, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024-Q4';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 14, '2 Weeks', 0.0335, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024-Q4';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 30, '1 Month', 0.0365, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024-Q4';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 90, '3 Months', 0.0395, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024-Q4';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 180, '6 Months', 0.0425, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024-Q4';

-- US Treasury Bond H1 2025
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0325, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2025-H1';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0355, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2025-H1';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 14, '2 Weeks', 0.0375, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2025-H1';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 30, '1 Month', 0.0405, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2025-H1';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 90, '3 Months', 0.0445, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2025-H1';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 180, '6 Months', 0.0485, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2025-H1';

-- Apple Corporate Bond (Higher returns)
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0465, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-AAPL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0515, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-AAPL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 14, '2 Weeks', 0.0545, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-AAPL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 30, '1 Month', 0.0585, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-AAPL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 90, '3 Months', 0.0635, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-AAPL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 180, '6 Months', 0.0685, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-AAPL-2025';

-- Microsoft Corporate Bond
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0445, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-MSFT-2026';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0495, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-MSFT-2026';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 30, '1 Month', 0.0565, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-MSFT-2026';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 90, '3 Months', 0.0615, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-MSFT-2026';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 180, '6 Months', 0.0665, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-MSFT-2026';

-- Add sample investments for portfolio demonstration
INSERT INTO investments (user_wallet_address, asset_id, term_id, invested_amount_weusd, investment_date, maturity_date, expected_profit_weusd, status, transaction_hash_invest) 
SELECT 
    '0x1234567890123456789012345678901234567890',
    a.asset_id,
    at.term_id,
    '5000.000000000000000000',
    CURRENT_TIMESTAMP - INTERVAL '45 days',
    CURRENT_TIMESTAMP + INTERVAL '45 days',
    '95.890410958904109589',
    'active',
    '0xabcdef1234567890abcdef1234567890abcdef12'
FROM assets a 
JOIN asset_terms at ON a.asset_id = at.asset_id 
WHERE a.onchain_asset_id = 'USTB-2024-Q4' AND at.term_duration_days = 90
LIMIT 1;

INSERT INTO investments (user_wallet_address, asset_id, term_id, invested_amount_weusd, investment_date, maturity_date, expected_profit_weusd, status, transaction_hash_invest) 
SELECT 
    '0x1234567890123456789012345678901234567890',
    a.asset_id,
    at.term_id,
    '10000.000000000000000000',
    CURRENT_TIMESTAMP - INTERVAL '95 days',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    '178.082191780821917808',
    'matured',
    '0xfedcba0987654321fedcba0987654321fedcba09'
FROM assets a 
JOIN asset_terms at ON a.asset_id = at.asset_id 
WHERE a.onchain_asset_id = 'CORP-AAPL-2025' AND at.term_duration_days = 90
LIMIT 1;

INSERT INTO investments (user_wallet_address, asset_id, term_id, invested_amount_weusd, investment_date, maturity_date, expected_profit_weusd, status, transaction_hash_invest, transaction_hash_redeem, redeemed_date) 
SELECT 
    '0x1234567890123456789012345678901234567890',
    a.asset_id,
    at.term_id,
    '2500.000000000000000000',
    CURRENT_TIMESTAMP - INTERVAL '200 days',
    CURRENT_TIMESTAMP - INTERVAL '20 days',
    '67.123287671232876712',
    'redeemed',
    '0x1111222233334444555566667777888899990000',
    '0x0000999988887777666655554444333322221111',
    CURRENT_TIMESTAMP - INTERVAL '18 days'
FROM assets a 
JOIN asset_terms at ON a.asset_id = at.asset_id 
WHERE a.onchain_asset_id = 'USTB-2025-H1' AND at.term_duration_days = 180
LIMIT 1;

-- Update platform metrics with realistic data
INSERT INTO platform_metrics (
    total_investment_weusd, 
    total_active_investment_weusd,
    total_profit_deposited_weusd, 
    total_profit_claimed_weusd,
    active_investment_count, 
    total_investment_count
) VALUES (
    '2847500.000000000000000000',
    '1245000.000000000000000000', 
    '125000.000000000000000000',
    '89234.567890123456789012',
    1247,
    3891
) ON CONFLICT DO NOTHING;
