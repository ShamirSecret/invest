export interface AssetTerm {
  term_id: number
  asset_id: number
  term_duration_days: number
  term_label: string
  apy: string // Numeric string from DB
  is_active: boolean
  created_at: string
}

export interface Asset {
  asset_id: number
  onchain_asset_id: string
  name: string
  description: string | null
  asset_type: "us_treasury_bond" | "corporate_bond"
  issuer: string | null
  bond_isin: string | null
  bond_maturity_date: string | null // ISO date string
  created_at: string
  updated_at: string
  terms: AssetTerm[]
}

export interface Investment {
  investment_id: number
  user_wallet_address: string
  asset_id: number
  term_id: number
  invested_amount_weusd: string // Numeric string
  investment_date: string // ISO date string
  maturity_date: string // ISO date string
  expected_profit_weusd: string // Numeric string
  status: "active" | "matured" | "redeemed" | "cancelled"
  transaction_hash_invest: string | null
  transaction_hash_redeem: string | null
  redeemed_date: string | null // ISO date string
  created_at: string
  updated_at: string
  // Joined data
  asset_name?: string
  term_label?: string
}

export interface AdminDashboardMetrics {
  total_investment_weusd: string
  total_active_investment_weusd: string
  total_profit_deposited_weusd: string
  total_profit_claimed_weusd: string
  active_investment_count: number
  total_investment_count: number
}
