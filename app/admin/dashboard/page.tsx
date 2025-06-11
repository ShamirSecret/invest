"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { PlatformMetrics } from "@/lib/types"
import { depositProfitForAsset, checkProfitPoolBalances } from "@/lib/contracts"
import { Wallet, Home } from "lucide-react"
import Image from "next/image"

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [errorMetrics, setErrorMetrics] = useState<string | null>(null)

  const [assetIdToDeposit, setAssetIdToDeposit] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositError, setDepositError] = useState<string | null>(null)

  const [profitPoolBalances, setProfitPoolBalances] = useState<Record<string, string>>({})
  const [isLoadingPools, setIsLoadingPools] = useState(true)
  const [errorPools, setErrorPools] = useState<string | null>(null)

  const { toast } = useToast()

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true)
    setErrorMetrics(null)
    try {
      const response = await fetch("/api/admin/metrics")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error("Error fetching metrics:", error)
      setErrorMetrics("Failed to load platform metrics.")
      toast({
        title: "Error",
        description: "Failed to load platform metrics.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const fetchProfitPoolBalances = async () => {
    setIsLoadingPools(true)
    setErrorPools(null)
    try {
      const balances = await checkProfitPoolBalances()
      setProfitPoolBalances(balances)
    } catch (error) {
      console.error("Error checking profit pool balances:", error)
      setErrorPools("Failed to load profit pool balances.")
      toast({
        title: "Error",
        description: "Failed to load profit pool balances.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPools(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    fetchProfitPoolBalances()
  }, [])

  const handleDepositProfit = async () => {
    if (!assetIdToDeposit || !depositAmount) {
      setDepositError("Please enter both Asset ID and Amount.")
      return
    }
    const amount = Number.parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      setDepositError("Please enter a valid positive amount.")
      return
    }

    setIsDepositing(true)
    setDepositError(null)
    try {
      // Pass the parsed float amount directly, as the mock function expects a number
      const response = await depositProfitForAsset(assetIdToDeposit, amount)
      if (response.success) {
        toast({
          title: "Profit Deposited",
          description: `Successfully deposited ${amount} WEUSD for Asset ID: ${assetIdToDeposit}. Transaction: ${response.transactionHash}`,
        })
        setAssetIdToDeposit("")
        setDepositAmount("")
        fetchProfitPoolBalances() // Refresh balances after deposit
        fetchMetrics() // Refresh metrics as totalProfitDeposited might change
      } else {
        throw new Error(response.error || "Failed to deposit profit via smart contract.")
      }
    } catch (error: any) {
      console.error("Deposit error:", error)
      setDepositError(error.message || "An unexpected error occurred during deposit.")
      toast({
        title: "Deposit Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsDepositing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/picwe-logo.png"
                alt="PicWe Invest Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">PicWe Invest</span>
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
          <p className="text-gray-600">Manage platform assets and view key metrics.</p>
        </header>

        {/* Platform Metrics */}
        <Card className="mb-8 bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Platform Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : errorMetrics ? (
              <div className="text-red-600">{errorMetrics}</div>
            ) : metrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-600">Total Investment</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {/* Removed BigInt and formatUnits, directly parse float */}
                    {Number.parseFloat(metrics.total_investment_weusd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    WEUSD
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-600">Total Active Investment</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {/* Removed BigInt and formatUnits, directly parse float */}
                    {Number.parseFloat(metrics.total_active_investment_weusd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    WEUSD
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-600">Total Profit Deposited</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {/* Removed BigInt and formatUnits, directly parse float */}
                    {Number.parseFloat(metrics.total_profit_deposited_weusd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    WEUSD
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-600">Total Profit Claimed</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {/* Removed BigInt and formatUnits, directly parse float */}
                    {Number.parseFloat(metrics.total_profit_claimed_weusd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    WEUSD
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-600">Active Investments Count</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics.active_investment_count.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-600">Total Investments Count</h3>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_investment_count.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No metrics available.</p>
            )}
          </CardContent>
        </Card>

        {/* Deposit Profit */}
        <Card className="mb-8 bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Deposit Profit to Asset Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assetIdToDeposit">Asset ID (On-chain)</Label>
                <Input
                  id="assetIdToDeposit"
                  placeholder="e.g., USTB-2024-Q4"
                  value={assetIdToDeposit}
                  onChange={(e) => setAssetIdToDeposit(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="depositAmount">Amount (WEUSD)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="e.g., 1000.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            {depositError && <p className="text-red-500 text-sm mt-2">{depositError}</p>}
            <Button
              onClick={handleDepositProfit}
              disabled={isDepositing}
              className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
            >
              {isDepositing ? "Depositing..." : "Deposit Profit"}
            </Button>
          </CardContent>
        </Card>

        {/* Profit Pool Balances */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Profit Pool Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPools ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : errorPools ? (
              <div className="text-red-600">{errorPools}</div>
            ) : Object.keys(profitPoolBalances).length === 0 ? (
              <p className="text-gray-500">No profit pool balances available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(profitPoolBalances).map(([assetId, balance]) => (
                  <div key={assetId} className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-600">Asset ID: {assetId}</h3>
                    <p className="text-xl font-bold text-gray-900">
                      {Number.parseFloat(balance).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      WEUSD
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
