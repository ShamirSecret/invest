import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { AdminDashboardMetrics } from "@/lib/types"

export async function GET() {
  try {
    console.log("Fetching platform metrics...")

    // Try to get the latest metrics
    const metricsResult = await sql`
      SELECT * FROM platform_metrics 
      ORDER BY snapshot_timestamp DESC 
      LIMIT 1;
    `

    if (metricsResult.length === 0) {
      console.log("No metrics found, calculating from scratch...")

      // Calculate metrics from current data
      const totals = await sql`
        SELECT
          COALESCE(SUM(invested_amount_weusd), 0) AS total_investment,
          COALESCE(SUM(CASE WHEN status = 'active' THEN invested_amount_weusd ELSE 0 END), 0) AS total_active_investment,
          COUNT(*) AS total_investment_count,
          COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_investment_count,
          COALESCE(SUM(CASE WHEN status = 'redeemed' THEN expected_profit_weusd ELSE 0 END), 0) AS total_profit_claimed
        FROM investments;
      `

      const profitDeposits = await sql`
        SELECT COALESCE(SUM(amount_weusd), 0) AS total_profit_deposited 
        FROM profit_deposits;
      `

      const currentMetrics: AdminDashboardMetrics = {
        total_investment_weusd: totals[0].total_investment.toString(),
        total_active_investment_weusd: totals[0].total_active_investment.toString(),
        total_profit_deposited_weusd: profitDeposits[0].total_profit_deposited.toString(),
        total_profit_claimed_weusd: totals[0].total_profit_claimed.toString(),
        active_investment_count: Number.parseInt(totals[0].active_investment_count, 10),
        total_investment_count: Number.parseInt(totals[0].total_investment_count, 10),
      }

      // Insert calculated metrics
      await sql`
        INSERT INTO platform_metrics (
          total_investment_weusd, total_active_investment_weusd,
          total_profit_deposited_weusd, total_profit_claimed_weusd,
          active_investment_count, total_investment_count
        ) VALUES (
          ${currentMetrics.total_investment_weusd}, ${currentMetrics.total_active_investment_weusd},
          ${currentMetrics.total_profit_deposited_weusd}, ${currentMetrics.total_profit_claimed_weusd},
          ${currentMetrics.active_investment_count}, ${currentMetrics.total_investment_count}
        );
      `

      return NextResponse.json(currentMetrics)
    }

    const dbMetrics = metricsResult[0]
    const responseMetrics: AdminDashboardMetrics = {
      total_investment_weusd: dbMetrics.total_investment_weusd.toString(),
      total_active_investment_weusd: dbMetrics.total_active_investment_weusd.toString(),
      total_profit_deposited_weusd: dbMetrics.total_profit_deposited_weusd.toString(),
      total_profit_claimed_weusd: dbMetrics.total_profit_claimed_weusd.toString(),
      active_investment_count: Number.parseInt(dbMetrics.active_investment_count, 10),
      total_investment_count: Number.parseInt(dbMetrics.total_investment_count, 10),
    }

    console.log("Metrics fetched successfully:", responseMetrics)
    return NextResponse.json(responseMetrics)
  } catch (error) {
    console.error("Error fetching platform metrics:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        // Return default metrics as fallback
        total_investment_weusd: "0",
        total_active_investment_weusd: "0",
        total_profit_deposited_weusd: "0",
        total_profit_claimed_weusd: "0",
        active_investment_count: 0,
        total_investment_count: 0,
      },
      { status: 500 },
    )
  }
}
