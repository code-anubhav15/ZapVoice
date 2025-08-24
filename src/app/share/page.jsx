"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Mail, Users, Gift, DollarSign, Check, Send, Twitter, Facebook, Linkedin } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

const referrals = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    status: "signed_up",
    date: "2024-01-15",
    reward: "$10",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@example.com",
    status: "trial",
    date: "2024-01-12",
    reward: "$10",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily@example.com",
    status: "paid",
    date: "2024-01-08",
    reward: "$25",
  },
]

export default function SharePage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState(
    "Hey! I've been using InvoiceAI to create professional invoices in seconds. You should check it out!",
  )
  const [copied, setCopied] = useState(false)

  const referralLink = "https://invoiceai.com/ref/johndoe123"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = () => {
    // Handle email invite
    console.log("Sending invite to:", email)
    setEmail("")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "trial":
        return "bg-blue-100 text-blue-800"
      case "signed_up":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return "Paid Customer"
      case "trial":
        return "Trial User"
      case "signed_up":
        return "Signed Up"
      default:
        return "Unknown"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Share & Refer</h1>
          <p className="text-gray-600 mt-1">Invite friends and earn rewards for every successful referral.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Total Referrals",
              value: "12",
              icon: Users,
              color: "from-blue-500 to-cyan-500",
            },
            {
              title: "Successful Conversions",
              value: "8",
              icon: Check,
              color: "from-green-500 to-green-700",
            },
            {
              title: "Total Earned",
              value: "$180",
              icon: DollarSign,
              color: "from-purple-500 to-pink-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="py-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Referral Program */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>Referral Program</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">How it works:</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Share your unique referral link</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Friend signs up and starts trial ($10 reward)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Friend becomes paid customer ($25 total reward)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>You both get account credits!</span>
                    </li>
                  </ul>
                </div>

                {/* Referral Link */}
                <div className="space-y-2">
                  <Label>Your Referral Link</Label>
                  <div className="flex space-x-2">
                    <Input value={referralLink} readOnly className="flex-1" />
                    <Button onClick={handleCopyLink} variant="outline">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  {copied && <p className="text-sm text-green-600">Link copied to clipboard!</p>}
                </div>

                {/* Social Sharing */}
                <div className="space-y-3">
                  <Label>Share on Social Media</Label>
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Send Invites */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Send Personal Invites</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Friend's Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="friend@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Personal Message</Label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleSendInvite}
                    className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
                    disabled={!email}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Invite
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-1">Pro Tip</h4>
                  <p className="text-sm text-blue-800">
                    Personal invites have a 3x higher conversion rate than shared links!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Referral History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((referral, index) => (
                      <motion.tr
                        key={referral.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{referral.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">{referral.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getStatusColor(referral.status)} w-fit`}>
                            {getStatusText(referral.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">{referral.date}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-green-600">{referral.reward}</div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
