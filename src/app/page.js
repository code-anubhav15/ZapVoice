"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Edit3,
  CheckCircle,
  X,
  Play,
  Star,
  Users,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  Bot,
  MessageSquare,
  FileText,
  Shield,
  Rocket,
  ChevronDown,
  Menu,
  LogIn,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const fakeEmails = [
  {
    id: 1,
    title: "Invoice Payment Failed",
    message: "Payment for Invoice #INV-001 was unsuccessful",
    type: "error",
    delay: 1000,
  },
  {
    id: 2,
    title: "Overdue Invoice Reminder",
    message: "Invoice #INV-002 is 15 days overdue",
    type: "warning",
    delay: 2500,
  },
  {
    id: 3,
    title: "Payment Not Received",
    message: "Client hasn't paid Invoice #INV-003 yet",
    type: "error",
    delay: 4000,
  },
  {
    id: 4,
    title: "Manual Invoice Creation",
    message: "Spent 2 hours creating invoices manually",
    type: "info",
    delay: 5500,
  },
]

const features = [
  {
    icon: Bot,
    title: "AI-Powered Invoicing",
    description:
      "Let AI create professional invoices in seconds. Smart templates, automatic calculations, and intelligent client data management.",
    gradient: "from-green-500 to-green-700",
  },
  {
    icon: Mail,
    title: "Email & Slack Integration",
    description:
      "Send invoices directly through email or Slack. Get real-time notifications when clients view or pay your invoices.",
    gradient: "from-green-500 to-green-700",
  },
  {
    icon: Edit3,
    title: "Editable Invoices",
    description:
      "Customize every aspect of your invoices. Brand colors, logos, terms, and layouts - all easily editable in real-time.",
    gradient: "from-green-500 to-green-700",
  },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for freelancers and small businesses",
    features: ["Up to 50 invoices/month", "Basic AI templates", "Email integration", "Standard support"],
    popular: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "Best for growing businesses",
    features: [
      "Unlimited invoices",
      "Advanced AI features",
      "Email & Slack integration",
      "Custom branding",
      "Priority support",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large teams and agencies",
    features: [
      "Everything in Professional",
      "Multi-user accounts",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "White-label solution",
    ],
    popular: false,
  },
]

const faqs = [
  {
    question: "How does AI-powered invoicing work?",
    answer:
      "Our AI analyzes your business data, client information, and previous invoices to automatically generate professional invoices with accurate details, smart formatting, and personalized content.",
  },
  {
    question: "Can I customize the invoice templates?",
    answer:
      "You can customize colors, fonts, logos, layouts, and add your own branding. Our editor makes it easy to create invoices that match your business identity.",
  },
  {
    question: "What integrations do you support?",
    answer:
      "We integrate with popular email providers (Gmail, Outlook), Slack, QuickBooks, Stripe, PayPal, and many other business tools. More integrations are added regularly.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we use enterprise-grade security with 256-bit SSL encryption, regular backups, and comply with GDPR and SOC 2 standards to keep your data safe.",
  },
  {
    question: "Can I try it for free?",
    answer:
      "Yes! We offer a $0.49 trial with full access to all Pro features for 14 days. No long-term commitment required.",
  },
]

export default function LandingPage() {
  const [emailNotifications, setEmailNotifications] = useState([])
  const [openFaq, setOpenFaq] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fakeEmails.forEach((email) => {
      setTimeout(() => {
        setEmailNotifications((prev) => [...prev, email])

        // Auto remove after 4 seconds
        setTimeout(() => {
          setEmailNotifications((prev) => prev.filter((e) => e.id !== email.id))
        }, 4000)
      }, email.delay)
    })
  }, [])

  const removeNotification = (id) => {
    setEmailNotifications((prev) => prev.filter((e) => e.id !== id))
  }

  const handleStartTrial = () => {
    router.push("/auth")
  }

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo-section")
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Email Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {emailNotifications.map((email) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`max-w-sm p-4 rounded-lg shadow-lg border-l-4 bg-white ${
                email.type === "error"
                  ? "border-l-red-500"
                  : email.type === "warning"
                    ? "border-l-yellow-500"
                    : "border-l-green-500"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900">{email.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{email.message}</p>
                </div>
                <button onClick={() => removeNotification(email.id)} className="ml-2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-24 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
                FAQ
              </Link>
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden md:flex items-center space-x-2">
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Button>
              <Button
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 font-semibold text-sm sm:text-base px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Start $0.49 Trial – Sign in with Google</span>
                <span className="sm:hidden">Start Trial</span>
              </Button>

              {/* Mobile menu button */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 py-4"
              >
                <nav className="flex flex-col space-y-4">
                  <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </Link>
                  <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
                    FAQ
                  </Link>
                  <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Features
                  </Link>
                  <Button variant="ghost" className="justify-start">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-green-700/10 to-green-800/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Badge className="mb-6 bg-gradient-to-r from-green-600 to-green-800 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Invoice Creation
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                STOP WASTING TIME BY{" "}
                <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  MANUALLY CREATING
                </span>{" "}
                YOUR INVOICES
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Create beautiful invoices in seconds and get paid faster with our AI-powered platform
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  onClick={handleStartTrial}
                  className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold w-full sm:w-auto"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Start $0.49 Trial – Sign in with Google</span>
                  <span className="sm:hidden">Start $0.49 Trial</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-transparent w-full sm:w-auto"
                  onClick={scrollToDemo}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-4">14-day trial • Full Pro features • Cancel anytime</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-section" className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">See How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Watch how our AI creates professional invoices in seconds
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative aspect-video bg-gradient-to-r from-green-600 to-green-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30">
                  <Play className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                </Button>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-xs sm:text-sm opacity-80">Demo Video</p>
                <p className="text-sm sm:text-base font-semibold">AI Invoice Creation in Action</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Businesses
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, send, and manage invoices efficiently
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 sm:p-8">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { icon: Users, value: "10,000+", label: "Happy Customers" },
              { icon: FileText, value: "500K+", label: "Invoices Created" },
              { icon: Clock, value: "95%", label: "Time Saved" },
              { icon: DollarSign, value: "$50M+", label: "Payments Processed" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">Choose the perfect plan for your business needs</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative ${plan.popular ? "sm:scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-green-600 to-green-800 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`h-full ${plan.popular ? "border-green-200 shadow-xl" : "border-gray-200"} hover:shadow-lg transition-all duration-300`}
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="text-center mb-6 sm:mb-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600 ml-1">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-600 text-sm sm:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={handleStartTrial}
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      Start $0.49 Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">Everything you need to know about our platform</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="mb-4"
              >
                <Card className="border border-gray-200 hover:border-green-200 transition-colors duration-300">
                  <CardContent className="p-0">
                    <button
                      className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${openFaq === index ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-600 text-sm sm:text-base">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-green-600 to-green-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your Invoicing?
            </h2>
            <p className="text-lg sm:text-xl text-green-100 mb-6 sm:mb-8">
              Join thousands of businesses already using our platform to save time and get paid faster
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleStartTrial}
                className="bg-white text-green-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold"
              >
                <Rocket className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Start $0.49 Trial – Sign in with Google</span>
                <span className="sm:hidden">Start $0.49 Trial</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-transparent"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-4">
                <img src="/logo.png" alt="Logo" className="h-20 w-auto" />
              </div>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">Create beautiful invoices in seconds with AI</p>
              <div className="flex space-x-4">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-400">Enterprise Security</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
