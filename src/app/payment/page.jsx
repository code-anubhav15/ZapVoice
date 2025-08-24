"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Shield, CheckCircle, CreditCard, Lock, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PaymentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [name, setName] = useState("")
  const router = useRouter()

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      router.push("/dashboard")
    }, 3000)
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/auth" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          <div className="flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Logo" className="h-30 sm:h-40 w-auto" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Complete Your Trial Setup</h1>
          <p className="text-gray-600 text-sm sm:text-base">Secure your $0.49 trial and unlock all Pro features</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Payment Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4 sm:space-y-6">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Expiry Date */}
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        maxLength={5}
                        required
                      />
                    </div>

                    {/* CVV */}
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, "").substring(0, 4))}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <Separator />

                  {/* Payment Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">14-day Pro Trial</span>
                      <span className="font-semibold">$0.49</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">$0.49</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-base sm:text-lg font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Lock className="w-5 h-5" />
                        <span>Start My Trial - $0.49</span>
                      </div>
                    )}
                  </Button>

                  {/* Security Note */}
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      Secured by Stripe. Your payment information is encrypted and secure.
                    </span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Trial Benefits */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-600 to-green-800 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Pro Trial Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {[
                  "Unlimited AI-generated invoices",
                  "Advanced customization options",
                  "Email & Slack integrations",
                  "Priority customer support",
                  "Analytics and reporting",
                  "Custom branding",
                  "Multi-currency support",
                  "Automated payment reminders",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Special Trial Pricing</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">$0.49</div>
                    <div className="text-sm text-gray-600">for 14 days</div>
                    <div className="text-xs text-gray-500">Then $29/month. Cancel anytime.</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>✓ No setup fees</div>
                      <div>✓ Cancel anytime</div>
                      <div>✓ Full refund if not satisfied</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Money Back Guarantee */}
            <Card className="shadow-lg border-0 bg-green-50 border-green-200">
              <CardContent className="p-4 sm:p-6 text-center">
                <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900 mb-1">30-Day Money Back Guarantee</h3>
                <p className="text-sm text-green-700">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6 sm:mt-8">
          By completing this purchase, you agree to our{" "}
          <Link href="#" className="underline hover:text-gray-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-gray-700">
            Privacy Policy
          </Link>
          . Your subscription will automatically renew at $29/month after the trial period.
        </p>
      </div>
    </div>
  )
}
