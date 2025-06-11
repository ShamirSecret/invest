"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Asset } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Shield, Building2, TrendingUp } from "lucide-react"

interface InvestmentModalProps {
  asset: Asset | null
  isOpen: boolean
  onClose: () => void
  onInvest: (assetId: number, termId: number, amount: string) => Promise<void>
}

export function InvestmentModal({ asset, isOpen, onClose, onInvest }: InvestmentModalProps) {
  const [selectedTermId, setSelectedTermId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [isInvesting, setIsInvesting] = useState(false)
  const { toast } = useToast()

  if (!asset) return null

  const selectedTermDetails = asset.terms.find((t) => t.term_id.toString() === selectedTermId)

  const calculatedProfit = () => {
    if (!selectedTermDetails || !amount) return "0.00"
    const principal = Number.parseFloat(amount)
    const apy = Number.parseFloat(selectedTermDetails.apy)
    const days = selectedTermDetails.term_duration_days
    if (isNaN(principal) || isNaN(apy) || isNaN(days) || principal <= 0) return "0.00"
    const profit = principal * apy * (days / 365.0)
    return profit.toFixed(2)
  }

  const handleSubmit = async () => {
    if (!selectedTermId || !amount || !asset) return
    const principal = Number.parseFloat(amount)
    if (isNaN(principal) || principal <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid positive amount.", variant: "destructive" })
      return
    }

    setIsInvesting(true)
    try {
      await onInvest(asset.asset_id, Number.parseInt(selectedTermId), amount)
      toast({ title: "Investment Submitted", description: "Your investment is being processed." })
      onClose()
      setSelectedTermId("")
      setAmount("")
    } catch (error: any) {
      toast({
        title: "Investment Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsInvesting(false)
    }
  }

  const getAssetIcon = () => {
    if (asset.asset_type === "us_treasury_bond") {
      return <Shield className="h-12 w-12 text-blue-600" />
    }
    return <Building2 className="h-12 w-12 text-blue-600" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-full">{getAssetIcon()}</div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">{asset.name}</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {asset.issuer} • {asset.asset_type === "us_treasury_bond" ? "Treasury Bond" : "Corporate Bond"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="subscribe" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="subscribe" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              Subscribe
            </TabsTrigger>
            <TabsTrigger value="redeem" disabled className="opacity-50">
              Redeem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscribe" className="space-y-6 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">YTD Return (Indicative)</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {selectedTermDetails ? (Number.parseFloat(selectedTermDetails.apy) * 100).toFixed(2) : "0.00"}%
                  </span>
                </div>
              </div>
              {selectedTermDetails && (
                <p className="text-xs text-gray-500 mt-2">Structured note linked to the performance of {asset.name}</p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                  Currency
                </Label>
                <Select value="WEUSD" disabled>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="WEUSD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEUSD">WEUSD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="term" className="text-sm font-medium text-gray-700">
                  Investment Term
                </Label>
                <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select investment term" />
                  </SelectTrigger>
                  <SelectContent>
                    {asset.terms.map((term) => (
                      <SelectItem key={term.term_id} value={term.term_id.toString()}>
                        {term.term_label} ({(Number.parseFloat(term.apy) * 100).toFixed(2)}% APY)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1"
                  placeholder="0.00"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Balance: 1,000,000 WEUSD</span>
                  <span>Min: 100 WEUSD</span>
                </div>
              </div>

              <div>
                <Label htmlFor="estimated" className="text-sm font-medium text-gray-700">
                  Estimated
                </Label>
                <Input
                  id="estimated"
                  type="text"
                  value={calculatedProfit()}
                  disabled
                  className="mt-1 bg-gray-50"
                  placeholder="0.00"
                />
                <div className="text-xs text-gray-500 mt-1">
                  <span>Estimated profit: {calculatedProfit()} WEUSD</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedTermId || !amount || isInvesting}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3"
            >
              {isInvesting ? "Processing..." : "Sign up"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
