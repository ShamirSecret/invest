-- Seed data for RWA Investment Platform

-- Insert sample assets
INSERT INTO assets (onchain_asset_id, name, description, asset_type, issuer, bond_isin, bond_maturity_date) VALUES
('USTB-Q3-2025', 'US Treasury Bond Q3 2025', 'Short-term US Treasury Bond maturing in Q3 2025', 'us_treasury_bond', 'US Treasury', 'US912828XY12', '2025-09-30'),
('CORPB-XYZ-2026', 'XYZ Corp Bond 2026', 'Corporate bond issued by XYZ Corporation', 'corporate_bond', 'XYZ Corporation', 'US123456AB78', '2026-12-31'),
('USTB-2024', 'US Treasury Bond 2024', '1-year US Treasury Bond', 'us_treasury_bond', 'US Treasury', 'US912828ZZ99', '2024-12-31')
ON CONFLICT (onchain_asset_id) DO NOTHING;

-- Insert asset terms for each asset
-- For USTB-Q3-2025
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0300, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-Q3-2025'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0350, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-Q3-2025'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 14, '2 Weeks', 0.0375, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-Q3-2025'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 30, '1 Month', 0.0400, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-Q3-2025'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 90, '3 Months', 0.0450, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-Q3-2025'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 180, '6 Months', 0.0500, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-Q3-2025'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

-- For CORPB-XYZ-2026
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0450, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORPB-XYZ-2026'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0500, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORPB-XYZ-2026'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 14, '2 Weeks', 0.0525, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORPB-XYZ-2026'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 30, '1 Month', 0.0550, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORPB-XYZ-2026'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 90, '3 Months', 0.0600, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORPB-XYZ-2026'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 180, '6 Months', 0.0650, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORPB-XYZ-2026'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

-- For USTB-2024
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0280, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0320, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 30, '1 Month', 0.0380, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024'
ON CONFLICT (asset_id, term_duration_days) DO NOTHING;

-- Insert initial platform metrics
INSERT INTO platform_metrics (
    total_investment_weusd, 
    total_active_investment_weusd,
    total_profit_deposited_weusd, 
    total_profit_claimed_weusd,
    active_investment_count, 
    total_investment_count
) VALUES (0, 0, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;
