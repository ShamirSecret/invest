import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const walletAddress = searchParams.get("walletAddress")

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
  }

  try {
    // Update investments to 'matured' if their maturity_date has passed and they are 'active'
    await sql`
      UPDATE investments
      SET status = 'matured'
      WHERE status = 'active' AND maturity_date <= CURRENT_TIMESTAMP;
    `

    const investmentsResult = await sql`
      SELECT
        i.*,
        a.name as asset_name,
        at.term_label as term_label
      FROM investments i
      JOIN assets a ON i.asset_id = a.asset_id
      JOIN asset_terms at ON i.term_id = at.term_id
      WHERE i.user_wallet_address = ${walletAddress}
      ORDER BY i.investment_date DESC;
    `
    return NextResponse.json(investmentsResult)
  } catch (error) {
    console.error("Error fetching user portfolio:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
