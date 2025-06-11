"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Asset } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { invest as contractInvest } from "@/lib/contracts"
import { MOCK_USER_WALLET } from "@/lib/constants"
import { ArrowLeft, DollarSign, Building, Landmark } from "lucide-react"

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset
}

export function InvestmentModal({ isOpen, onClose, asset }: InvestmentModalProps) {
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const selectedTerm = asset.terms?.find((term) => term.term_id.toString() === selectedTermId)
  const estimatedProfit =
    selectedTerm && amount
      ? (Number.parseFloat(amount) * selectedTerm.apy * (selectedTerm.term_duration_days / 365)).toFixed(2)
      : "0.00"

  const handleInvest = async () => {
    if (!selectedTermId || !amount) {
      setError("Please select a term and enter an amount.")
      return
    }
    const investmentAmount = Number.parseFloat(amount)
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      setError("Please enter a valid positive amount.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const contractResponse = await contractInvest(asset.onchain_asset_id, selectedTermId, investmentAmount.toString())

      if (!contractResponse.success || !contractResponse.transactionHash) {
        throw new Error(contractResponse.error || "Smart contract investment failed.")
      }

      const response = await fetch("/api/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWalletAddress: MOCK_USER_WALLET,
          assetId: asset.asset_id,
          termId: Number.parseInt(selectedTermId),
          investedAmountWeusd: investmentAmount.toString(),
          transactionHash: contractResponse.transactionHash,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to record investment.")
      }

      toast({
        title: "Investment Successful",
        description: `You have invested ${amount} WEUSD in ${asset.name}.`,
      })
      onClose()
    } catch (err: any) {
      console.error("Investment error:", err)
      setError(err.message || "An unexpected error occurred.")
      toast({
        title: "Investment Failed",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAssetIcon = (assetType: string) => {
    if (assetType === "us_treasury_bond") {
      return <Landmark className="h-5 w-5 text-blue-600" />
    } else if (assetType === "corporate_bond") {
      return <Building className="h-5 w-5 text-blue-600" />
    }
    return <DollarSign className="h-5 w-5 text-blue-600" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white p-6 rounded-lg shadow-lg">
        <DialogHeader className="border-b pb-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute left-4 top-4">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            <div className="flex items-center justify-center space-x-2">
              {getAssetIcon(asset.asset_type)}
              <span>{asset.name}</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">Invest in {asset.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <Tabs defaultValue="subscribe" className="w-full max-w-sm">
              <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-lg p-1">
                <TabsTrigger
                  value="subscribe"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md"
                >
                  Subscribe
                </TabsTrigger>
                <TabsTrigger
                  value="redeem"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md"
                >
                  Redeem
                </TabsTrigger>
              </TabsList>
              <TabsContent value="subscribe" className="mt-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currency" className="text-right">
                      Currency
                    </Label>
                    <Select defaultValue="weusd">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weusd">WEstableUSD (WEUSD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="balance" className="text-right">
                      Balance
                    </Label>
                    <Input id="balance" value="10,000.00 WEUSD" readOnly className="col-span-3 text-right" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="term" className="text-right">
                      Term
                    </Label>
                    <Select
                      onValueChange={setSelectedTermId}
                      value={selectedTermId || ""}
                      disabled={!asset.terms || asset.terms.length === 0}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select investment term" />
                      </SelectTrigger>
                      <SelectContent>
                        {asset.terms?.map((term) => (
                          <SelectItem key={term.term_id} value={term.term_id.toString()}>
                            {term.term_label} ({(term.apy * 100).toFixed(2)} APY)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="col-span-3 text-right"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="estimated-profit" className="text-right">
                      Est. Profit
                    </Label>
                    <Input
                      id="estimated-profit"
                      value={`${estimatedProfit} WEUSD`}
                      readOnly
                      className="col-span-3 text-right text-green-600 font-medium"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
                  <Button
                    onClick={handleInvest}
                    disabled={isSubmitting || !selectedTermId || !amount || Number.parseFloat(amount) <= 0}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 rounded-md mt-4"
                  >
                    {isSubmitting ? "Investing..." : "Invest"}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="redeem" className="mt-4">
                <div className="text-center text-gray-500">Redeem functionality is available on your dashboard.</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
