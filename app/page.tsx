"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvestmentCard } from "@/components/investment-card"
import { InvestmentModal } from "@/components/investment-modal"
import type { Asset } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { Wallet, Home } from "lucide-react"

export default function HomePage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"All" | "us_treasury_bond" | "corporate_bond" | "ended">("All")

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/admin/assets")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setAssets(data)
      } catch (error) {
        console.error("Error fetching assets:", error)
        setError("Failed to load investment assets. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAssets()
  }, [])

  const handleInvestClick = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAsset(null)
  }

  const filteredAssets = assets.filter((asset) => {
    if (filter === "All") return true
    if (filter === "ended") {
      // For 'ended' filter, we'd need a more sophisticated check,
      // e.g., if all terms are inactive or if a specific 'end_date' for the asset has passed.
      // For now, we'll just return false as we don't have this data.
      return false
    }
    return asset.asset_type === filter
  })

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
              <a href="/" className="text-gray-900 font-medium flex items-center">
                <Home className="mr-1 h-4 w-4" />
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

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">The Launchpad For Real Founders</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            PicWe is the world's first decentralized infrastructure enabling omni-chain liquidity for traders and
            developers.
          </p>
        </div>
      </section>

      {/* Investment Assets Section */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex justify-center mb-8">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-4 bg-gray-200 rounded-lg p-1">
              <TabsTrigger
                value="All"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="us_treasury_bond"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md"
              >
                Treasury
              </TabsTrigger>
              <TabsTrigger
                value="corporate_bond"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md"
              >
                Corporate
              </TabsTrigger>
              <TabsTrigger
                value="ended"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md"
              >
                Ended
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {error && (
          <div className="text-center text-red-600 py-8">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <InvestmentCard key={asset.asset_id} asset={asset} onInvestClick={handleInvestClick} />
            ))}
          </div>
        )}
      </section>

      {selectedAsset && <InvestmentModal isOpen={isModalOpen} onClose={handleCloseModal} asset={selectedAsset} />}
    </div>
  )
}
