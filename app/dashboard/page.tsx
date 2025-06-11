"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Investment } from "@/lib/types"
import { MOCK_USER_WALLET } from "@/lib/constants"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { redeem as contractRedeem } from "@/lib/contracts"
import { ArrowDownToLine, CheckCircle, Clock, Wallet, Home } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UserDashboardPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRedeeming, setIsRedeeming] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchInvestments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/user/portfolio?walletAddress=${MOCK_USER_WALLET}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setInvestments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching investments:", error)
      setError("Could not load your investments. Please try again later.")
      toast({
        title: "Error",
        description: "Could not load your investments.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestments()
  }, [toast])

  const handleRedeem = async (investment: Investment) => {
    if (investment.status !== "matured") {
      toast({
        title: "Cannot Redeem",
        description: "Investment is not yet matured.",
        variant: "destructive",
      })
      return
    }

    setIsRedeeming((prev) => ({ ...prev, [investment.investment_id]: true }))
    try {
      const contractResponse = await contractRedeem(investment.investment_id.toString())
      if (!contractResponse.success || !contractResponse.transactionHash) {
        throw new Error("Smart contract redemption failed.")
      }

      const apiResponse = await fetch("/api/user/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investmentId: investment.investment_id,
          transactionHash: contractResponse.transactionHash,
        }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || "Failed to update redemption status.")
      }

      toast({
        title: "Redemption Successful",
        description: `Redeemed ${investment.invested_amount_weusd} WEstableUSD plus profit.`,
      })
      fetchInvestments()
    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsRedeeming((prev) => ({ ...prev, [investment.investment_id]: false }))
    }
  }

  const getStatusBadge = (status: Investment["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case "matured":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Matured
          </Badge>
        )
      case "redeemed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Redeemed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalInvested = investments.reduce((sum, inv) => sum + Number.parseFloat(inv.invested_amount_weusd), 0)
  const totalProfit = investments
    .filter((inv) => inv.status === "redeemed")
    .reduce((sum, inv) => sum + Number.parseFloat(inv.expected_profit_weusd), 0)
  const activeInvestments = investments.filter((inv) => inv.status === "active").length

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
              <a href="/dashboard" className="text-gray-900 font-medium">
                Portfolio
              </a>
              <a href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">My Investment Portfolio</h1>
          <p className="text-gray-600">Track your active and past investments.</p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg inline-block">
            <span className="text-sm text-gray-600">Connected Wallet: </span>
            <span className="font-mono text-sm text-blue-700">{MOCK_USER_WALLET}</span>
          </div>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} WEUSD
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Profit Claimed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} WEUSD
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeInvestments}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Your Investments</CardTitle>
            <CardDescription className="text-gray-600">Overview of all your investment activities.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : investments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">You have no investments yet.</p>
                <p className="text-sm text-gray-400 mt-2">Start investing to see your portfolio here.</p>
                <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black" asChild>
                  <a href="/">Start Investing</a>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600">Asset</TableHead>
                      <TableHead className="text-gray-600">Amount (WEUSD)</TableHead>
                      <TableHead className="text-gray-600">Term</TableHead>
                      <TableHead className="text-gray-600">Maturity Date</TableHead>
                      <TableHead className="text-gray-600">Expected Profit</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                      <TableHead className="text-right text-gray-600">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((inv) => (
                      <TableRow key={inv.investment_id} className="border-gray-200">
                        <TableCell className="font-medium text-gray-900">
                          {inv.asset_name || `Asset ID ${inv.asset_id}`}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {Number.parseFloat(inv.invested_amount_weusd).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-700">{inv.term_label || `Term ID ${inv.term_id}`}</TableCell>
                        <TableCell className="text-gray-700">
                          {new Date(inv.maturity_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {Number.parseFloat(inv.expected_profit_weusd).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(inv.status)}</TableCell>
                        <TableCell className="text-right">
                          {inv.status === "matured" && (
                            <Button
                              size="sm"
                              onClick={() => handleRedeem(inv)}
                              disabled={isRedeeming[inv.investment_id]}
                              className="bg-yellow-500 hover:bg-yellow-600 text-black"
                            >
                              {isRedeeming[inv.investment_id] ? (
                                "Redeeming..."
                              ) : (
                                <>
                                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                                  Redeem
                                </>
                              )}
                            </Button>
                          )}
                          {inv.status === "redeemed" && <span className="text-sm text-gray-500">Claimed</span>}
                          {inv.status === "active" && <span className="text-sm text-gray-500">Pending Maturity</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
