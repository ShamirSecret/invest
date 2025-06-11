import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { INVESTMENT_TERMS_DAYS } from "@/lib/constants"
import type { Asset } from "@/lib/types" // Define these types

// Define types (could be in a separate types.ts file)
// export interface Asset {
//   asset_id?: number;
//   onchain_asset_id: string;
//   name: string;
//   description?: string;
//   asset_type: 'us_treasury_bond' | 'corporate_bond';
//   issuer?: string;
//   bond_isin?: string;
//   bond_maturity_date?: string; // ISO date string
//   terms?: AssetTerm[]; // For creating terms along with asset
// }
// export interface AssetTerm {
//   term_id?: number;
//   asset_id?: number;
//   term_duration_days: number;
//   term_label: string;
//   apy: number; // e.g., 0.05 for 5%
//   is_active?: boolean;
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { onchain_asset_id, name, description, asset_type, issuer, bond_isin, bond_maturity_date, terms } =
      body as Asset & { terms: Array<{ term_duration_days: number; apy: number; term_label: string }> }

    if (!onchain_asset_id || !name || !asset_type || !terms || terms.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real app, use Drizzle or a transaction block
    const newAssetResult = await sql`
      INSERT INTO assets (onchain_asset_id, name, description, asset_type, issuer, bond_isin, bond_maturity_date)
      VALUES (${onchain_asset_id}, ${name}, ${description}, ${asset_type}, ${issuer}, ${bond_isin}, ${bond_maturity_date ? new Date(bond_maturity_date) : null})
      RETURNING asset_id;
    `
    const newAssetId = newAssetResult[0]?.asset_id

    if (!newAssetId) {
      return NextResponse.json({ error: "Failed to create asset" }, { status: 500 })
    }

    for (const term of terms) {
      const existingTerm = INVESTMENT_TERMS_DAYS.find((t) => t.days === term.term_duration_days)
      if (!existingTerm) {
        console.warn(`Skipping invalid term duration: ${term.term_duration_days}`)
        continue
      }
      await sql`
        INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active)
        VALUES (${newAssetId}, ${term.term_duration_days}, ${existingTerm.label}, ${term.apy}, TRUE);
      `
    }

    return NextResponse.json({ message: "Asset created successfully", asset_id: newAssetId }, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const assetsResult = await sql`
      SELECT
        a.*,
        COALESCE(
          (
            SELECT json_agg(at.* ORDER BY at.term_duration_days)
            FROM asset_terms at
            WHERE at.asset_id = a.asset_id AND at.is_active = TRUE
          ),
          '[]'::json
        ) AS terms
      FROM assets a
      ORDER BY a.created_at DESC;
    `
    return NextResponse.json(assetsResult)
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
