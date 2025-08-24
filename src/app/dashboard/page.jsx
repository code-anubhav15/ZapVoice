"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClientOnly from "@/components/client-only-wrapper";

// Charting Library
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Icons
import {
  Plus,
  FileText,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
} from "lucide-react";

// Layout
import { DashboardLayout } from "@/components/dashboard-layout";

export default function DashboardPage() {
  const supabase = createClient();

  // --- State Management ---
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, data: null });

  // --- Data Fetching ---
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invoices:", error);
      } else {
        setInvoices(data);
      }
      setLoading(false);
    };
    fetchInvoices();
  }, [supabase]);

  // --- Data Processing & Calculations (useMemo for performance) ---
  const stats = useMemo(() => {
    if (invoices.length === 0) {
      return {
        totalRevenue: 0,
        invoicesSent: 0,
        clientCount: 0,
        lastInvoice: null,
      };
    }
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const invoicesSent = invoices.length;
    const clientCount = new Set(invoices.map((inv) => inv.client_email)).size;
    const lastInvoice = invoices[0]; // Assumes invoices are sorted descending by creation date

    return { totalRevenue, invoicesSent, clientCount, lastInvoice };
  }, [invoices]);

  const chartData = useMemo(() => {
    const statusCounts = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});

    const pieChartData = [
      { name: "Paid", value: statusCounts.paid || 0, color: "#10B981" },
      { name: "Pending", value: statusCounts.pending || 0, color: "#F59E0B" },
      { name: "Overdue", value: statusCounts.overdue || 0, color: "#EF4444" },
      { name: "Draft", value: statusCounts.draft || 0, color: "#A0AEC0" },
    ].filter((d) => d.value > 0);

    const monthlyRevenue = invoices.reduce((acc, inv) => {
      const month = new Date(inv.invoice_date).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      acc[month] = (acc[month] || 0) + inv.amount;
      return acc;
    }, {});

    const barChartData = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .reverse() // Show most recent months first
      .slice(0, 6);

    return { pieChartData, barChartData };
  }, [invoices]);

  const recentInvoices = useMemo(() => invoices.slice(0, 5), [invoices]);

  // --- CUD Handlers ---
  const handleUpdateInvoice = async (updatedData) => {
    const { id, ...updateFields } = updatedData;
    const { data, error } = await supabase
      .from("invoices")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      alert("Failed to update invoice.");
    } else {
      setInvoices((currentInvoices) =>
        currentInvoices.map((inv) => (inv.id === id ? data : inv))
      );
      setModalState({ type: null, data: null });
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId);

    if (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice.");
    } else {
      setInvoices((currentInvoices) =>
        currentInvoices.filter((inv) => inv.id !== invoiceId)
      );
    }
    setModalState({ type: null, data: null });
  };

  // --- Utility Functions ---
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIconForCard = (status) => {
    switch (status) {
      case "paid":
        return CheckCircle;
      case "pending":
        return Clock;
      case "overdue":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStatusColorForCard = (status) => {
    switch (status) {
      case "paid":
        return "from-green-500 to-green-700";
      case "pending":
        return "from-yellow-500 to-orange-500";
      case "overdue":
        return "from-red-500 to-red-700";
      default:
        return "from-gray-500 to-gray-700";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="p-8">Loading dashboard...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's a summary of your business.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" className="p-4.5">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {/* ✅ FIX: Corrected typo from `aschild` to `asChild` */}
            <Link href="/invoices/new" asChild>
              <Button className="bg-gradient-to-r from-green-600 to-green-800">
                <Plus className="w-4 h-4" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="from-green-500 to-green-700"
          />
          <StatCard
            title="Invoices Sent"
            value={stats.invoicesSent}
            icon={FileText}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Clients"
            value={stats.clientCount}
            icon={Users}
            color="from-purple-500 to-indigo-500"
          />
          {stats.lastInvoice ? (
            <StatCard
              title="Last Invoice"
              value={`$${stats.lastInvoice.amount.toLocaleString()}`}
              icon={getStatusIconForCard(stats.lastInvoice.status)}
              color={getStatusColorForCard(stats.lastInvoice.status)}
            />
          ) : (
            <StatCard
              title="Last Invoice"
              value="$0"
              icon={Clock}
              color="from-gray-500 to-gray-700"
            />
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOnly>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.barChartData}>
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="revenue"
                      fill="#16A34A"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invoice Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOnly>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {chartData.pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ClientOnly>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              {/* ✅ FIX: Corrected typo from `aschild` to `asChild` and removed redundant passHref */}
              <Link href="/invoices" asChild>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Client</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">
                          {invoice.client_email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {/* ✅ FIX: Corrected typo from `aschild` to `asChild` */}
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/invoices/${invoice.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setModalState({ type: "send", data: invoice })
                            }
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setModalState({ type: "edit", data: invoice })
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() =>
                              setModalState({ type: "delete", data: invoice })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {modalState.type === "edit" && (
        <EditInvoiceModal
          invoice={modalState.data}
          onSave={handleUpdateInvoice}
          onClose={() => setModalState({ type: null, data: null })}
        />
      )}
      {modalState.type === "send" && (
        <SendInvoiceModal
          invoice={modalState.data}
          onClose={() => setModalState({ type: null, data: null })}
        />
      )}
      {modalState.type === "delete" && (
        <AlertDialog
          open={true}
          onOpenChange={() => setModalState({ type: null, data: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the invoice for{" "}
                {modalState.data.client_email}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteInvoice(modalState.data.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardLayout>
  );
}

// --- Reusable Components ---

function StatCard({ title, value, icon: Icon, color, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="py-0 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {children && <div className="mt-2">{children}</div>}
          </div>
          {Icon && (
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EditInvoiceModal({ invoice, onSave, onClose }) {
  const [formData, setFormData] = useState({ ...invoice });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_email">Client Email</Label>
            <Input
              id="client_email"
              name="client_email"
              value={formData.client_email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SendInvoiceModal({ invoice, onClose }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invoice to {invoice.client_email}</DialogTitle>
          <DialogDescription>
            This is a placeholder for your email sending feature.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">
            You can add your email sending form, a confirmation message, or
            integrate with an email service here.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
