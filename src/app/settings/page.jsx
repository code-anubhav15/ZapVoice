"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Icons
import {
  User, Bell, CreditCard, Shield, Crown, Check, Upload, Save,
  AlertCircle, LinkIcon, Mail, Twitter, Linkedin, Chrome
} from "lucide-react"

// Layout
import { DashboardLayout } from "@/components/dashboard-layout"


const settingsTabs = [
  { id: "profile", name: "Profile", icon: User },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "billing", name: "Billing", icon: CreditCard },
  { id: "integrations", name: "Integrations", icon: LinkIcon },
  { id: "security", name: "Security", icon: Shield },
]

export default function SettingsPage() {
  const supabase = createClient();
  
  // --- State Management ---
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [profile, setProfile] = useState({ name: '', email: '', company: '', phone: '', image_url: null });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

    const [integrations, setIntegrations] = useState({
    stripe: { connected: true, email: "john@example.com" },
    gmail: { connected: true, email: "john@gmail.com" },
    linkedin: { connected: false, email: "" },
    twitter: { connected: false, email: "" },
    google: { connected: true, email: "john@example.com" },
  })

    const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
    invoiceUpdates: true,
    paymentReminders: true,
  })
  
  const fileInputRef = useRef(null);

  // --- Data Fetching ---
  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        }
        if (data) {
          setProfile(data);
          if (data.image_url) {
            setAvatarPreview(data.image_url);
          }
        }
      }
      setLoading(false);
    };

    getProfile();
  }, [supabase]);

  // --- Event Handlers ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async () => {
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let avatarUrl = profile.image_url;

    // 1. Handle image upload if a new file is selected
    if (avatarFile) {
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        alert('Failed to upload new photo.');
        setUpdating(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      avatarUrl = urlData.publicUrl;
    }

    // 2. Update the profile table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        company: profile.company,
        phone: profile.phone,
        image_url: avatarUrl
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      alert('Failed to save changes.');
    } else {
      alert('Profile updated successfully!');
      // Optionally re-fetch profile to confirm changes
    }
    setUpdating(false);
  };

  // Cleanup for object URL
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    }
  }, [avatarPreview]);
  
  const renderTabContent = () => {
    // ... switch statement with content for each tab
    // (The Profile tab is the main one that changes)
    switch (activeTab) {
      case "profile":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center space-x-4">
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg"/>
                   {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                   ) : (
                     <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-600" />
                     </div>
                   )}
                   <div>
                     <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
                       <Upload className="w-4 h-4 mr-2" />Change Photo
                     </Button>
                     <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label htmlFor="name">Full Name</Label>
                       <Input id="name" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="email">Email Address</Label>
                       <Input id="email" type="email" value={profile.email || ''} disabled />
                       <p className="text-xs text-gray-500">Email cannot be changed (Google SSO)</p>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="company">Company</Label>
                       <Input id="company" value={profile.company || ''} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="phone">Phone Number</Label>
                       <Input id="phone" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                 </div>
                 
                 <Button onClick={handleProfileSave} disabled={updating}>
                   <Save className="w-4 h-4 mr-2" />
                   {updating ? 'Saving...' : 'Save Changes'}
                 </Button>
              </CardContent>
            </Card>
          </motion.div>
        )
            case "billing":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>Subscription & Billing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Pro Trial</h3>
                      <p className="text-sm text-gray-600">12 days remaining</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-600 to-green-800 text-white">Active</Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trial Started</span>
                    <span className="font-medium">January 15, 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trial Ends</span>
                    <span className="font-medium">January 29, 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Next Billing</span>
                    <span className="font-medium">$29.00 on Jan 30, 2024</span>
                  </div>
                </div>

                <Separator />

                <div className="flex space-x-3">
                  <Button variant="outline">Upgrade Now</Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                    Cancel Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case "notifications":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    key: "email",
                    title: "Email Notifications",
                    description: "Receive notifications via email",
                  },
                  {
                    key: "push",
                    title: "Push Notifications",
                    description: "Receive push notifications in your browser",
                  },
                  {
                    key: "marketing",
                    title: "Marketing Emails",
                    description: "Receive updates about new features and tips",
                  },
                  {
                    key: "invoiceUpdates",
                    title: "Invoice Updates",
                    description: "Get notified when invoices are viewed or paid",
                  },
                  {
                    key: "paymentReminders",
                    title: "Payment Reminders",
                    description: "Automatic reminders for overdue invoices",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Switch
                      // checked={notifications[item.key]}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                    />
                  </div>
                ))}

                <Button className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )

      case "security":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Google SSO Enabled</h4>
                      <p className="text-sm text-green-700">Your account is secured with Google authentication</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">Login Activity</h4>
                      <p className="text-sm text-gray-500">View recent login attempts</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Activity
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">Connected Apps</h4>
                      <p className="text-sm text-gray-500">Manage third-party app access</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Apps
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case "integrations":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LinkIcon className="w-5 h-5" />
                  <span>Integrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">Connect your favorite tools and services to streamline your workflow.</p>

                <div className="space-y-4">
                  {[
                    {
                      key: "stripe",
                      name: "Stripe",
                      description: "Accept payments and manage billing",
                      icon: CreditCard,
                      color: "text-purple-600",
                      bgColor: "bg-purple-100",
                    },
                    {
                      key: "gmail",
                      name: "Gmail",
                      description: "Send invoices directly via Gmail",
                      icon: Mail,
                      color: "text-red-600",
                      bgColor: "bg-red-100",
                    },
                    {
                      key: "linkedin",
                      name: "LinkedIn",
                      description: "Share updates and connect with clients",
                      icon: Linkedin,
                      color: "text-blue-600",
                      bgColor: "bg-blue-100",
                    },
                    {
                      key: "twitter",
                      name: "Twitter",
                      description: "Share your business updates",
                      icon: Twitter,
                      color: "text-sky-600",
                      bgColor: "bg-sky-100",
                    },
                    {
                      key: "google",
                      name: "Google Workspace",
                      description: "Sync with Google Drive and Calendar",
                      icon: Chrome,
                      color: "text-green-600",
                      bgColor: "bg-green-100",
                    },
                  ].map((integration) => (
                    <div
                      key={integration.key}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${integration.bgColor} rounded-lg flex items-center justify-center`}>
                          <integration.icon className={`w-5 h-5 ${integration.color}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{integration.name}</h4>
                          <p className="text-sm text-gray-500">{integration.description}</p>
                          {integrations[integration.key].connected && (
                            <p className="text-xs text-green-600 mt-1">
                              Connected: {integrations[integration.key].email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {integrations[integration.key].connected ? (
                          <>
                            <Badge className="bg-green-100 text-green-800">Connected</Badge>
                            <Button variant="outline" size="sm">
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      // case "appearance":
      //   return (
      //     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      //       <Card>
      //         <CardHeader>
      //           <CardTitle className="flex items-center space-x-2">
      //             <Palette className="w-5 h-5" />
      //             <span>Appearance Settings</span>
      //           </CardTitle>
      //         </CardHeader>
      //         <CardContent className="space-y-6">
      //           <div>
      //             <h4 className="font-medium text-gray-900 mb-4">Theme</h4>
      //             <div className="grid grid-cols-3 gap-4">
      //               {["Light", "Dark", "System"].map((theme) => (
      //                 <div key={theme} className="relative">
      //                   <input
      //                     type="radio"
      //                     id={theme.toLowerCase()}
      //                     name="theme"
      //                     defaultChecked={theme === "Light"}
      //                     className="sr-only"
      //                   />
      //                   <label
      //                     htmlFor={theme.toLowerCase()}
      //                     className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors"
      //                   >
      //                     <div
      //                       className={`w-12 h-8 rounded mb-2 ${
      //                         theme === "Light"
      //                           ? "bg-white border border-gray-300"
      //                           : theme === "Dark"
      //                             ? "bg-gray-800"
      //                             : "bg-gradient-to-r from-white to-gray-800"
      //                       }`}
      //                     />
      //                     <span className="text-sm font-medium">{theme}</span>
      //                   </label>
      //                 </div>
      //               ))}
      //             </div>
      //           </div>

      //           <div>
      //             <h4 className="font-medium text-gray-900 mb-4">Font Size</h4>
      //             <select className="w-full border border-gray-300 rounded-md px-3 py-2" defaultValue="Medium">
      //               <option value="Small">Small</option>
      //               <option value="Medium">Medium</option>
      //               <option value="Large">Large</option>
      //             </select>
      //           </div>

      //           <Button className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900">
      //             <Save className="w-4 h-4 mr-2" />
      //             Save Appearance
      //           </Button>
      //         </CardContent>
      //       </Card>
      //     </motion.div>
      //   )

      // case "preferences":
      //   return (
      //     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      //       <Card>
      //         <CardHeader>
      //           <CardTitle className="flex items-center space-x-2">
      //             <Globe className="w-5 h-5" />
      //             <span>General Preferences</span>
      //           </CardTitle>
      //         </CardHeader>
      //         <CardContent className="space-y-6">
      //           <div className="space-y-4">
      //             <div>
      //               <Label htmlFor="language">Language</Label>
      //               <select
      //                 id="language"
      //                 className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
      //                 defaultValue="English (US)"
      //               >
      //                 <option value="English (US)">English (US)</option>
      //                 <option value="English (UK)">English (UK)</option>
      //                 <option value="Spanish">Spanish</option>
      //                 <option value="French">French</option>
      //                 <option value="German">German</option>
      //               </select>
      //             </div>

      //             <div>
      //               <Label htmlFor="currency">Default Currency</Label>
      //               <select
      //                 id="currency"
      //                 className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
      //                 defaultValue="USD ($)"
      //               >
      //                 <option value="USD ($)">USD ($)</option>
      //                 <option value="EUR (€)">EUR (€)</option>
      //                 <option value="GBP (£)">GBP (£)</option>
      //                 <option value="CAD (C$)">CAD (C$)</option>
      //               </select>
      //             </div>

      //             <div>
      //               <Label htmlFor="dateFormat">Date Format</Label>
      //               <select
      //                 id="dateFormat"
      //                 className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
      //                 defaultValue="MM/DD/YYYY"
      //               >
      //                 <option value="MM/DD/YYYY">MM/DD/YYYY</option>
      //                 <option value="DD/MM/YYYY">DD/MM/YYYY</option>
      //                 <option value="YYYY-MM-DD">YYYY-MM-DD</option>
      //               </select>
      //             </div>
      //           </div>

      //           <Button className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900">
      //             <Save className="w-4 h-4 mr-2" />
      //             Save Preferences
      //           </Button>
      //         </CardContent>
      //       </Card>
      //     </motion.div>
      //   )
      default: return null;
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors text-sm ${
                        activeTab === tab.id
                          ? "bg-green-100 text-green-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {loading ? <p>Loading profile...</p> : renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}