-- RWA Investment Platform Schema for Neon PostgreSQL

-- Enum for investment status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investment_status_enum') THEN
        CREATE TYPE investment_status_enum AS ENUM ('active', 'matured', 'redeemed', 'cancelled');
    END IF;
END $$;

-- Enum for asset type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_type_enum') THEN
        CREATE TYPE asset_type_enum AS ENUM ('us_treasury_bond', 'corporate_bond');
    END IF;
END $$;

-- 1. Assets Table: Stores details about the RWA investment assets
CREATE TABLE IF NOT EXISTS assets (
    asset_id SERIAL PRIMARY KEY,
    onchain_asset_id VARCHAR(255) UNIQUE, -- ID used in the smart contract
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type asset_type_enum NOT NULL,
    issuer VARCHAR(255),
    bond_isin VARCHAR(50), -- International Securities Identification Number
    bond_maturity_date TIMESTAMP, -- Maturity date of the underlying bond
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Asset Terms Table: Stores available investment terms and their APYs for each asset
-- Predefined terms: 1 day, 1 week, 2 weeks, 1 month, 3 months, 6 months
CREATE TABLE IF NOT EXISTS asset_terms (
    term_id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(asset_id) ON DELETE CASCADE,
    term_duration_days INTEGER NOT NULL, -- e.g., 1, 7, 14, 30, 90, 180
    term_label VARCHAR(50) NOT NULL, -- e.g., "1 Day", "1 Week"
    apy NUMERIC(5, 4) NOT NULL, -- Annual Percentage Yield, e.g., 0.0500 for 5.00%
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_id, term_duration_days)
);

-- 3. Investments Table: Tracks user investments
CREATE TABLE IF NOT EXISTS investments (
    investment_id SERIAL PRIMARY KEY,
    user_wallet_address VARCHAR(42) NOT NULL, -- User's WEstableUSD wallet address
    asset_id INTEGER REFERENCES assets(asset_id),
    term_id INTEGER REFERENCES asset_terms(term_id),
    invested_amount_weusd NUMERIC(36, 18) NOT NULL, -- Assuming weusd has 18 decimals
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    maturity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_profit_weusd NUMERIC(36, 18) NOT NULL,
    status investment_status_enum DEFAULT 'active',
    transaction_hash_invest VARCHAR(66),
    transaction_hash_redeem VARCHAR(66),
    redeemed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_investments_user_wallet ON investments(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_maturity_date ON investments(maturity_date);


-- 4. Profit Deposits Table: Tracks profits deposited by admins into smart contract pools
CREATE TABLE IF NOT EXISTS profit_deposits (
    deposit_id SERIAL PRIMARY KEY,
    onchain_asset_id VARCHAR(255) REFERENCES assets(onchain_asset_id), -- Links to the asset in the contract
    amount_weusd NUMERIC(36, 18) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    deposit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    admin_user_id VARCHAR(255) -- Identifier for the admin who made the deposit
);

-- 5. Platform Metrics Table: Stores snapshots of key platform metrics
-- This could be updated periodically by a cron job or triggers
CREATE TABLE IF NOT EXISTS platform_metrics (
    metric_id SERIAL PRIMARY KEY,
    snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_investment_weusd NUMERIC(36, 18) DEFAULT 0,
    total_active_investment_weusd NUMERIC(36, 18) DEFAULT 0,
    total_profit_deposited_weusd NUMERIC(36, 18) DEFAULT 0, -- Sum from profit_deposits
    total_profit_claimed_weusd NUMERIC(36, 18) DEFAULT 0, -- Sum of expected_profit_weusd for 'redeemed' investments
    active_investment_count INTEGER DEFAULT 0,
    total_investment_count INTEGER DEFAULT 0
);

-- Function to update asset updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trigger_investments_updated_at
BEFORE UPDATE ON investments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
