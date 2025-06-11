"use client"

import { useEffect, useState } from "react"
import { InvestmentCard } from "@/components/investment-card"
import { InvestmentModal } from "@/components/investment-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import type { Asset } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Wallet } from "lucide-react"

export default function InvestPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    async function fetchAssets() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/admin/assets")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log("Fetched assets:", data)
        setAssets(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching assets:", error)
        setError("Could not load investment assets. Please try again later.")
        toast({
          title: "Error",
          description: "Could not load investment assets.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchAssets()
  }, [toast])

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset)
  }

  const handleCloseModal = () => {
    setSelectedAsset(null)
  }

  const handleInvest = async (assetId: number, termId: number, amount: string) => {
    try {
      const response = await fetch("/api/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, termId, amountWEUSDString: amount }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Investment failed")
      }

      const result = await response.json()
      toast({
        title: "Investment Successful",
        description: `Your investment has been processed. Transaction: ${result.transactionHash}`,
      })
    } catch (error: any) {
      console.error("Investment error:", error)
      throw error
    }
  }

  const filteredAssets = assets.filter((asset) => {
    if (activeTab === "all") return true
    if (activeTab === "treasury") return asset.asset_type === "us_treasury_bond"
    if (activeTab === "corporate") return asset.asset_type === "corporate_bond"
    return true
  })

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
              <a href="/" className="text-gray-900 font-medium">
                Home
              </a>
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">The Launchpad For Real World Assets</h1>
          <p className="text-gray-600 text-lg">
            RWAInvest is the world's first decentralized infrastructure/lending omni-chain launchpad for traders and
            developers.
          </p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black font-medium"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="treasury"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black font-medium"
            >
              Treasury
            </TabsTrigger>
            <TabsTrigger
              value="corporate"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black font-medium"
            >
              Corporate
            </TabsTrigger>
            <TabsTrigger value="ended" disabled className="opacity-50">
              Ended
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-[320px] w-full rounded-lg" />
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No investment assets available in this category.</p>
                <p className="text-sm text-gray-400 mt-2">Please check other categories or try again later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map((asset) => (
                  <InvestmentCard key={asset.asset_id} asset={asset} onSelectAsset={handleSelectAsset} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <InvestmentModal
          asset={selectedAsset}
          isOpen={!!selectedAsset}
          onClose={handleCloseModal}
          onInvest={handleInvest}
        />
      </div>
    </div>
  )
}
