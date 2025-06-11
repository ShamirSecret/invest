"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Asset } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, Building2 } from "lucide-react"

interface InvestmentCardProps {
  asset: Asset
  onSelectAsset: (asset: Asset) => void
}

export function InvestmentCard({ asset, onSelectAsset }: InvestmentCardProps) {
  const minApy = Math.min(...asset.terms.map((t) => Number.parseFloat(t.apy)))
  const maxApy = Math.max(...asset.terms.map((t) => Number.parseFloat(t.apy)))

  const getAssetIcon = () => {
    if (asset.asset_type === "us_treasury_bond") {
      return <Shield className="h-8 w-8 text-blue-600" />
    }
    return <Building2 className="h-8 w-8 text-blue-600" />
  }

  const getAssetTypeLabel = () => {
    return asset.asset_type === "us_treasury_bond" ? "Treasury" : "Corporate"
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 border border-gray-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">{getAssetIcon()}</div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">{asset.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                {asset.issuer || "Investment Grade"}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1">
            {getAssetTypeLabel()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">YTD Return</span>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{(maxApy * 100).toFixed(2)}%</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            APY Range: {(minApy * 100).toFixed(2)}% - {(maxApy * 100).toFixed(2)}%
          </div>

          {asset.bond_maturity_date && (
            <div className="text-xs text-gray-500">
              Maturity: {new Date(asset.bond_maturity_date).toLocaleDateString()}
            </div>
          )}

          <div className="flex flex-wrap gap-1 pt-2">
            {asset.terms.slice(0, 4).map((term) => (
              <Badge key={term.term_id} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {term.term_label}
              </Badge>
            ))}
            {asset.terms.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{asset.terms.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
          onClick={() => onSelectAsset(asset)}
        >
          Invest Now
        </Button>
      </CardFooter>
    </Card>
  )
}
