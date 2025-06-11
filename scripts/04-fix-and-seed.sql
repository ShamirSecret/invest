-- Fix and seed data for RWA Investment Platform
-- This script will handle any existing data conflicts and ensure clean setup

-- First, let's check if tables exist and create them if they don't
CREATE TABLE IF NOT EXISTS assets (
    asset_id SERIAL PRIMARY KEY,
    onchain_asset_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('us_treasury_bond', 'corporate_bond')),
    issuer VARCHAR(255),
    bond_isin VARCHAR(50),
    bond_maturity_date TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_terms (
    term_id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(asset_id) ON DELETE CASCADE,
    term_duration_days INTEGER NOT NULL,
    term_label VARCHAR(50) NOT NULL,
    apy NUMERIC(5, 4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_id, term_duration_days)
);

CREATE TABLE IF NOT EXISTS investments (
    investment_id SERIAL PRIMARY KEY,
    user_wallet_address VARCHAR(42) NOT NULL,
    asset_id INTEGER REFERENCES assets(asset_id),
    term_id INTEGER REFERENCES asset_terms(term_id),
    invested_amount_weusd NUMERIC(36, 18) NOT NULL,
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    maturity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_profit_weusd NUMERIC(36, 18) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'matured', 'redeemed', 'cancelled')),
    transaction_hash_invest VARCHAR(66),
    transaction_hash_redeem VARCHAR(66),
    redeemed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profit_deposits (
    deposit_id SERIAL PRIMARY KEY,
    onchain_asset_id VARCHAR(255),
    amount_weusd NUMERIC(36, 18) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    deposit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    admin_user_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS platform_metrics (
    metric_id SERIAL PRIMARY KEY,
    snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_investment_weusd NUMERIC(36, 18) DEFAULT 0,
    total_active_investment_weusd NUMERIC(36, 18) DEFAULT 0,
    total_profit_deposited_weusd NUMERIC(36, 18) DEFAULT 0,
    total_profit_claimed_weusd NUMERIC(36, 18) DEFAULT 0,
    active_investment_count INTEGER DEFAULT 0,
    total_investment_count INTEGER DEFAULT 0
);

-- Clear existing data to avoid conflicts
TRUNCATE TABLE investments CASCADE;
TRUNCATE TABLE asset_terms CASCADE;
TRUNCATE TABLE assets CASCADE;
TRUNCATE TABLE profit_deposits CASCADE;
TRUNCATE TABLE platform_metrics CASCADE;

-- Insert sample assets
INSERT INTO assets (onchain_asset_id, name, description, asset_type, issuer, bond_isin, bond_maturity_date) VALUES
('USTB-2024-Q4', 'US Treasury Bond Q4 2024', 'Short-term US Treasury Bond with quarterly maturity', 'us_treasury_bond', 'US Treasury Department', 'US912828XY12', '2024-12-31'),
('USTB-2025-H1', 'US Treasury Bond H1 2025', 'Medium-term US Treasury Bond with semi-annual returns', 'us_treasury_bond', 'US Treasury Department', 'US912828XY34', '2025-06-30'),
('CORP-AAPL-2025', 'Apple Inc Corporate Bond', 'High-grade corporate bond from Apple Inc', 'corporate_bond', 'Apple Inc', 'US037833CH69', '2025-08-15'),
('CORP-MSFT-2026', 'Microsoft Corp Bond', 'Investment grade corporate bond with tech exposure', 'corporate_bond', 'Microsoft Corporation', 'US594918BW27', '2026-03-17'),
('CORP-GOOGL-2025', 'Alphabet Inc Bond Series A', 'Premium corporate bond from Alphabet Inc', 'corporate_bond', 'Alphabet Inc', 'US02079K1079', '2025-11-30'),
('CORP-JPM-2024', 'JPMorgan Chase Bond', 'Financial sector corporate bond', 'corporate_bond', 'JPMorgan Chase & Co', 'US46625H1005', '2024-09-15');

-- Insert asset terms
-- US Treasury Bond Q4 2024
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0285, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024-Q4';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0315, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2024-Q4';
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
SELECT a.asset_id, 30, '1 Month', 0.0405, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2025-H1';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 90, '3 Months', 0.0445, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2025-H1';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 180, '6 Months', 0.0485, TRUE FROM assets a WHERE a.onchain_asset_id = 'USTB-2025-H1';

-- Apple Corporate Bond
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0465, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-AAPL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0515, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-AAPL-2025';
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

-- Google Corporate Bond
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0455, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-GOOGL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0505, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-GOOGL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 30, '1 Month', 0.0575, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-GOOGL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 90, '3 Months', 0.0625, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-GOOGL-2025';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 180, '6 Months', 0.0675, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-GOOGL-2025';

-- JPMorgan Corporate Bond
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 1, '1 Day', 0.0435, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-JPM-2024';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 7, '1 Week', 0.0485, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-JPM-2024';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 30, '1 Month', 0.0555, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-JPM-2024';
INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active) 
SELECT a.asset_id, 90, '3 Months', 0.0605, TRUE FROM assets a WHERE a.onchain_asset_id = 'CORP-JPM-2024';

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

-- Insert platform metrics
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
);
