"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Share2,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Crown,
  UserCircle,
  HelpCircle,
  CreditCard,
  Shield,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Sidebar,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    name: "Share & Refer",
    href: "/share",
    icon: Share2,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

const notifications = [
  {
    id: 1,
    title: "Payment Received",
    message: "Invoice #INV-001 has been paid by Acme Corp",
    time: "2 minutes ago",
    type: "success",
    unread: true,
  },
  {
    id: 2,
    title: "Invoice Overdue",
    message: "Invoice #INV-003 is now 5 days overdue",
    time: "1 hour ago",
    type: "warning",
    unread: true,
  },
  {
    id: 3,
    title: "New Client Added",
    message: "TechStart Inc has been added to your clients",
    time: "3 hours ago",
    type: "info",
    unread: false,
  },
  {
    id: 4,
    title: "Monthly Report Ready",
    message: "Your January invoice report is ready for download",
    time: "1 day ago",
    type: "info",
    unread: false,
  },
]

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const pathname = usePathname()
  const userDropdownRef = useRef(null)
  const notificationDropdownRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Persist sidebar collapsed state in localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed")
    if (savedCollapsedState !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsedState))
    }
  }, [])

  const handleSidebarToggle = () => {
    const newCollapsedState = !sidebarCollapsed
    setSidebarCollapsed(newCollapsedState)
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newCollapsedState))
  }

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="text-xl font-bold text-green-600">ZAPVOICE</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="px-4 py-4">
                <Badge className="bg-gradient-to-r from-green-600 to-green-800 text-white w-full justify-center">
                  <Crown className="w-4 h-4 mr-2" />
                  Pro Trial - 12 days left
                </Badge>
              </div>
              <nav className="p-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:w-16" : "lg:w-64"}`}
      >
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between px-4 py-4">
            {!sidebarCollapsed && <img src="/logo.png" alt="Logo" className="h-10 sm:h-10 w-40" />}
            <Button variant="ghost" size="sm" onClick={handleSidebarToggle} className="p-1">
              {sidebarCollapsed ? <Sidebar className="w-5 h-5" /> : <Sidebar className="w-5 h-5" />}
            </Button>
          </div>

          {/* Trial Badge */}
          {!sidebarCollapsed && (
            <div className="px-4 py-4">
              <Badge className="bg-gradient-to-r from-green-600 to-green-800 text-white w-50 justify-center py-1">
                <Crown className="w-4 h-4 mr-2" />
                Pro Trial - 12 days left
              </Badge>
            </div>
          )}

          {/* Navigation */}
          <nav className={`flex-1 py-4 space-y-2 ${sidebarCollapsed ? "px-2" : "px-4"}`}>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-lg transition-colors ${
                    sidebarCollapsed ? "justify-center p-3" : "space-x-3 px-3 py-2"
                  } ${
                    isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          {!sidebarCollapsed && (
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">N</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                  <p className="text-xs text-gray-500 truncate">john@example.com</p>
                </div>
                <Button variant="ghost" size="sm">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Collapsed User Profile */}
          {sidebarCollapsed && (
            <div className="px-2 py-4 border-t border-gray-200">
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">N</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>

              {/* Show ZAPVOICE logo when sidebar is collapsed */}
              {sidebarCollapsed && <img src="/logo.png" alt="Logo" className="h-10 sm:h-10 w-40" />}

              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationDropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>

                <AnimatePresence>
                  {notificationDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    >
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && <Badge className="bg-red-100 text-red-800">{unreadCount} new</Badge>}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              notification.unread ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === "success"
                                    ? "bg-green-500"
                                    : notification.type === "warning"
                                      ? "bg-yellow-500"
                                      : "bg-blue-500"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200">
                        <Button variant="outline" className="w-full text-sm bg-transparent">
                          View All Notifications
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">N</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    >
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">N</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">John Doe</p>
                            <p className="text-xs text-gray-500">john@example.com</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <UserCircle className="w-4 h-4" />
                          <span>Profile Settings</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Billing & Plans</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          <span>Security</span>
                        </Link>
                        <Link
                          href="#"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </Link>
                      </div>
                      <div className="border-t border-gray-200 py-2">
                        <button className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
