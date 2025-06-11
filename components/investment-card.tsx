"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Asset, InvestmentTerm } from "@/lib/types"
import { ArrowUpRight, BarChart2, DollarSign, Building, Landmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface InvestmentCardProps {
  asset: Asset
  onInvestClick: (asset: Asset) => void
}

export function InvestmentCard({ asset, onInvestClick }: InvestmentCardProps) {
  // Find the term with the highest APY for display
  const highestApyTerm: InvestmentTerm | undefined = asset.terms
    ? asset.terms.reduce((maxTerm, currentTerm) => {
        return currentTerm.apy > maxTerm.apy ? currentTerm : maxTerm
      }, asset.terms[0])
    : undefined

  const displayApy = highestApyTerm ? (highestApyTerm.apy * 100).toFixed(2) : "N/A"

  const getAssetIcon = (assetType: string) => {
    if (assetType === "us_treasury_bond") {
      return <Landmark className="h-6 w-6 text-blue-600" />
    } else if (assetType === "corporate_bond") {
      return <Building className="h-6 w-6 text-blue-600" />
    }
    return <DollarSign className="h-6 w-6 text-blue-600" />
  }

  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {getAssetIcon(asset.asset_type)}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">{asset.name}</CardTitle>
            <p className="text-sm text-gray-500">{asset.issuer}</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
          Funds
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">YTD Return</p>
            <div className="text-4xl font-bold text-gray-900">{displayApy}%</div>
          </div>
          <BarChart2 className="h-8 w-8 text-gray-400" />
        </div>
        <Button
          onClick={() => onInvestClick(asset)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 rounded-md flex items-center justify-center"
        >
          Invest Now
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
