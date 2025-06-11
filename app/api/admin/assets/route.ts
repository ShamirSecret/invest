import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching assets from database...")

    const assetsResult = await sql`
      SELECT
        a.*,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'term_id', at.term_id,
                'asset_id', at.asset_id,
                'term_duration_days', at.term_duration_days,
                'term_label', at.term_label,
                'apy', at.apy::text,
                'is_active', at.is_active,
                'created_at', at.created_at
              ) ORDER BY at.term_duration_days
            )
            FROM asset_terms at
            WHERE at.asset_id = a.asset_id AND at.is_active = TRUE
          ),
          '[]'::json
        ) AS terms
      FROM assets a
      ORDER BY a.created_at DESC;
    `

    console.log("Assets fetched:", assetsResult.length)
    return NextResponse.json(assetsResult)
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { onchain_asset_id, name, description, asset_type, issuer, bond_isin, bond_maturity_date, terms } = body

    if (!onchain_asset_id || !name || !asset_type || !terms || terms.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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
      await sql`
        INSERT INTO asset_terms (asset_id, term_duration_days, term_label, apy, is_active)
        VALUES (${newAssetId}, ${term.term_duration_days}, ${term.term_label}, ${term.apy}, TRUE);
      `
    }

    return NextResponse.json({ message: "Asset created successfully", asset_id: newAssetId }, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
