import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { WEUSD_DECIMALS, MOCK_USER_WALLET } from "@/lib/constants"
import { invest as contractInvest } from "@/lib/contracts"
import { parseUnits, formatUnits } from "viem" // Using viem for decimal handling

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { assetId, termId, amountWEUSDString } = body // db asset_id, db term_id
    const userWalletAddress = MOCK_USER_WALLET // Get from authenticated session in real app

    if (!assetId || !termId || !amountWEUSDString) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const amountWEUSD = Number.parseFloat(amountWEUSDString)
    if (isNaN(amountWEUSD) || amountWEUSD <= 0) {
      return NextResponse.json({ error: "Invalid investment amount" }, { status: 400 })
    }
    const amountWei = parseUnits(amountWEUSDString, WEUSD_DECIMALS)

    const termResult = await sql`
      SELECT at.term_duration_days, at.apy, a.onchain_asset_id
      FROM asset_terms at
      JOIN assets a ON at.asset_id = a.asset_id
      WHERE at.term_id = ${termId} AND at.asset_id = ${assetId} AND at.is_active = TRUE;
    `

    if (termResult.length === 0) {
      return NextResponse.json({ error: "Invalid asset or term selected" }, { status: 400 })
    }
    const { term_duration_days, apy, onchain_asset_id } = termResult[0]

    // Mock contract call
    const contractResponse = await contractInvest(onchain_asset_id, term_duration_days, amountWei)
    if (!contractResponse.success || !contractResponse.transactionHash) {
      return NextResponse.json({ error: "Smart contract investment failed" }, { status: 500 })
    }

    const investmentDate = new Date()
    const maturityDate = new Date(investmentDate)
    maturityDate.setDate(investmentDate.getDate() + term_duration_days)

    const yearlyProfit = amountWEUSD * Number.parseFloat(apy)
    const termProfit = yearlyProfit * (term_duration_days / 365.0)
    const expectedProfitWei = parseUnits(termProfit.toFixed(WEUSD_DECIMALS), WEUSD_DECIMALS)

    await sql`
      INSERT INTO investments (user_wallet_address, asset_id, term_id, invested_amount_weusd, investment_date, maturity_date, expected_profit_weusd, status, transaction_hash_invest)
      VALUES (${userWalletAddress}, ${assetId}, ${termId}, ${formatUnits(amountWei, WEUSD_DECIMALS)}, ${investmentDate.toISOString()}, ${maturityDate.toISOString()}, ${formatUnits(expectedProfitWei, WEUSD_DECIMALS)}, 'active', ${contractResponse.transactionHash});
    `

    return NextResponse.json(
      { message: "Investment successful", transactionHash: contractResponse.transactionHash },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error processing investment:", error)
    // Check for specific error types if using Drizzle, e.g., unique constraint violation
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
