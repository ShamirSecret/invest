import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { MOCK_USER_WALLET } from "@/lib/constants" // For auth simulation

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { investmentId, transactionHash } = body
    const userWalletAddress = MOCK_USER_WALLET // Get from authenticated session

    if (!investmentId || !transactionHash) {
      return NextResponse.json({ error: "Missing investmentId or transactionHash" }, { status: 400 })
    }

    const updateResult = await sql`
      UPDATE investments
      SET status = 'redeemed',
          transaction_hash_redeem = ${transactionHash},
          redeemed_date = CURRENT_TIMESTAMP
      WHERE investment_id = ${investmentId}
        AND user_wallet_address = ${userWalletAddress}
        AND status = 'matured'
      RETURNING investment_id;
    `

    if (updateResult.length === 0) {
      // Could be that investment doesn't exist, not owned by user, or not matured
      const checkInvestment =
        await sql`SELECT status FROM investments WHERE investment_id = ${investmentId} AND user_wallet_address = ${userWalletAddress}`
      if (checkInvestment.length > 0 && checkInvestment[0].status !== "matured") {
        return NextResponse.json(
          { error: `Investment not matured or already processed. Current status: ${checkInvestment[0].status}` },
          { status: 400 },
        )
      }
      return NextResponse.json(
        { error: "Failed to redeem investment. It might not be redeemable or does not exist." },
        { status: 404 },
      )
    }

    return NextResponse.json({
      message: "Redemption recorded successfully",
      investmentId: updateResult[0].investment_id,
    })
  } catch (error) {
    console.error("Error recording redemption:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
