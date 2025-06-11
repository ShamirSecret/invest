"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AdminDashboardMetrics } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, TrendingUp, Users, ListChecks, CheckCircle, Wallet, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { depositProfitForAsset, checkProfitPoolBalances } from "@/lib/contracts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseUnits, formatUnits } from "viem"
import { WEUSD_DECIMALS } from "@/lib/constants"

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [profitPools, setProfitPools] = useState<Record<string, bigint>>({})
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [isLoadingPools, setIsLoadingPools] = useState(true)
  const { toast } = useToast()

  const [depositAssetId, setDepositAssetId] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true)
    try {
      const response = await fetch("/api/admin/metrics")
      if (!response.ok) throw new Error("Failed to fetch metrics")
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Could not load platform metrics.", variant: "destructive" })
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const fetchProfitPools = async () => {
    setIsLoadingPools(true)
    try {
      const pools = await checkProfitPoolBalances()
      setProfitPools(pools)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Could not load profit pool balances.", variant: "destructive" })
    } finally {
      setIsLoadingPools(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    fetchProfitPools()
  }, [toast])

  const handleDepositProfit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositAssetId || !depositAmount) {
      toast({ title: "Missing fields", description: "Please provide asset ID and amount.", variant: "destructive" })
      return
    }
    const amountWei = parseUnits(depositAmount, WEUSD_DECIMALS)
    if (amountWei <= 0n) {
      toast({ title: "Invalid Amount", description: "Deposit amount must be positive.", variant: "destructive" })
      return
    }

    setIsDepositing(true)
    try {
      const result = await depositProfitForAsset(depositAssetId, amountWei)
      if (result.success) {
        toast({
          title: "Profit Deposited",
          description: `Successfully deposited ${depositAmount} weUSD for asset ${depositAssetId}. Tx: ${result.transactionHash}`,
        })
        setDepositAssetId("")
        setDepositAmount("")
        fetchProfitPools()
        fetchMetrics()
      } else {
        throw new Error("Failed to deposit profit via smart contract.")
      }
    } catch (error: any) {
      toast({ title: "Deposit Failed", description: error.message || "An error occurred.", variant: "destructive" })
    } finally {
      setIsDepositing(false)
    }
  }

  const MetricCard = ({
    title,
    value,
    icon,
    isLoadingValue,
    unit = "WEUSD",
  }: { title: string; value?: string | number; icon: React.ReactNode; isLoadingValue: boolean; unit?: string }) => (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoadingValue ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
            {value !== undefined && unit && typeof value !== "number" && (
              <span className="text-xs text-gray-500 ml-1">{unit}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">RW</span>
              </div>
              <span className="text-xl font-bold text-gray-900">RWAInvest</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-gray-900 flex items-center">
                <Home className="mr-1 h-4 w-4" />
                Home
              </a>
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Portfolio
              </a>
              <a href="/admin/dashboard" className="text-gray-900 font-medium">
                Admin
              </a>
            </nav>
          </div>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage and monitor the RWA investment platform.</p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Platform Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total Investment"
              value={
                metrics?.total_investment_weusd
                  ? Number.parseFloat(metrics.total_investment_weusd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"
              }
              icon={<DollarSign className="h-4 w-4 text-gray-400" />}
              isLoadingValue={isLoadingMetrics}
            />
            <MetricCard
              title="Total Active Investment"
              value={
                metrics?.total_active_investment_weusd
                  ? Number.parseFloat(metrics.total_active_investment_weusd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"
              }
              icon={<TrendingUp className="h-4 w-4 text-gray-400" />}
              isLoadingValue={isLoadingMetrics}
            />
            <MetricCard
              title="Total Profit Deposited"
              value={
                metrics?.total_profit_deposited_weusd
                  ? Number.parseFloat(metrics.total_profit_deposited_weusd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"
              }
              icon={<DollarSign className="h-4 w-4 text-gray-400" />}
              isLoadingValue={isLoadingMetrics}
            />
            <MetricCard
              title="Total Profit Claimed"
              value={
                metrics?.total_profit_claimed_weusd
                  ? Number.parseFloat(metrics.total_profit_claimed_weusd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"
              }
              icon={<CheckCircle className="h-4 w-4 text-gray-400" />}
              isLoadingValue={isLoadingMetrics}
            />
            <MetricCard
              title="Active Investments Count"
              value={metrics?.active_investment_count}
              icon={<Users className="h-4 w-4 text-gray-400" />}
              isLoadingValue={isLoadingMetrics}
              unit=""
            />
            <MetricCard
              title="Total Investments Count"
              value={metrics?.total_investment_count}
              icon={<ListChecks className="h-4 w-4 text-gray-400" />}
              isLoadingValue={isLoadingMetrics}
              unit=""
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Deposit Profits to Asset Pools</h2>
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Deposit Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDepositProfit} className="space-y-4">
                <div>
                  <Label htmlFor="depositAssetId" className="text-sm font-medium text-gray-700">
                    On-Chain Asset ID
                  </Label>
                  <Input
                    id="depositAssetId"
                    value={depositAssetId}
                    onChange={(e) => setDepositAssetId(e.target.value)}
                    placeholder="e.g., USTB-2024-Q4"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="depositAmount" className="text-sm font-medium text-gray-700">
                    Amount (WEstableUSD)
                  </Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g., 10000"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isDepositing}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                >
                  {isDepositing ? "Depositing..." : "Deposit Profit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Asset Profit Pool Balances (On-Chain)</h2>
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Pool Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPools ? (
                <Skeleton className="h-20 w-full" />
              ) : Object.keys(profitPools).length === 0 ? (
                <p className="text-gray-500">No profit pool data available.</p>
              ) : (
                <ul className="space-y-2">
                  {Object.entries(profitPools).map(([assetId, balance]) => (
                    <li
                      key={assetId}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded-md"
                    >
                      <span className="font-medium text-gray-900">{assetId}</span>
                      <span className="text-green-600 font-semibold">
                        {Number.parseFloat(formatUnits(balance, WEUSD_DECIMALS)).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        WEUSD
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
