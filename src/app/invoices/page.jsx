"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"

// Icons
import {
  Plus, Search, Filter, Download, Eye, Edit, Send, CheckCircle,
  Clock, AlertCircle, Calendar, DollarSign, Trash2
} from "lucide-react"

// Layout
import { DashboardLayout } from "@/components/dashboard-layout"


export default function InvoicesPage() {
  const supabase = createClient()

  // --- State Management ---
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [modalState, setModalState] = useState({ type: null, data: null }) // For Edit/Send/Delete modals

  const initialFilters = {
    status: { value: "all" },
    amount: { condition: "greater_than", value: "" },
    date: { startDate: "", endDate: "" }
  };
  const [filters, setFilters] = useState(initialFilters);

  // --- Data Fetching from Supabase ---
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching invoices:", error);
      } else {
        setInvoices(data);
      }
      setLoading(false);
    };
    fetchInvoices();
  }, [supabase]);


  // --- CUD (Create, Update, Delete) Handlers ---
  const handleUpdateInvoice = async (updatedData) => {
    const { id, ...updateFields } = updatedData;
    const { data, error } = await supabase
      .from('invoices')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice.');
    } else {
      setInvoices(currentInvoices => currentInvoices.map(inv => (inv.id === id ? data : inv)));
      setModalState({ type: null, data: null }); // Close modal
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice.');
    } else {
      setInvoices(currentInvoices => currentInvoices.filter(inv => inv.id !== invoiceId));
    }
    setModalState({ type: null, data: null }); // Close confirmation dialog
  };
  
  // --- Filtering Logic ---
  const handleFilterChange = (field, key, value) => { /* ... unchanged ... */ };
  const resetFilters = () => setFilters(initialFilters);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        invoice.client_email?.toLowerCase().includes(lowerSearchTerm) ||
        invoice.id?.toLowerCase().includes(lowerSearchTerm) ||
        invoice.description?.toLowerCase().includes(lowerSearchTerm);

      if (!matchesSearch) return false;

      const { status, amount, date } = filters;
      if (status.value && status.value !== 'all' && invoice.status !== status.value) return false;
      if (amount.value) {
        const numericAmount = parseFloat(amount.value);
        if (!isNaN(numericAmount)) {
          if (amount.condition === 'greater_than' && invoice.amount <= numericAmount) return false;
          if (amount.condition === 'less_than' && invoice.amount >= numericAmount) return false;
        }
      }
      if (date.startDate && new Date(invoice.invoice_date) < new Date(date.startDate)) return false;
      if (date.endDate && new Date(invoice.invoice_date) > new Date(date.endDate)) return false;

      return true;
    });
  }, [invoices, searchTerm, filters]);

  // --- Stat & UI Helpers ---
  const stats = useMemo(() => ({
      totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      paidAmount: filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
      pendingAmount: filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
      overdueAmount: filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
      draftAmount: filteredInvoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + inv.amount, 0),
  }), [filteredInvoices]);

  const getStatusColor = (status) => { /* ... unchanged ... */ };
  const getStatusIcon = (status) => { /* ... unchanged ... */ };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                <p className="text-gray-600 mt-1">Manage and track all your invoices in one place.</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <Button variant="outline" size="sm" className="p-4.5"><Download className="w-4 h-4 mr-2" />Export</Button>
                <Link href="/invoices/new" aschild>
                    <Button className="bg-gradient-to-r from-green-600 to-green-800"><Plus className="w-4 h-4" />Create Invoice</Button>
                </Link>
            </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <StatCard title="Total Amount" value={`$${stats.totalAmount.toLocaleString()}`} icon={DollarSign} color="from-blue-500 to-cyan-500" />
            <StatCard title="Paid" value={`$${stats.paidAmount.toLocaleString()}`} icon={CheckCircle} color="from-green-500 to-green-700" />
            <StatCard title="Pending" value={`$${stats.pendingAmount.toLocaleString()}`} icon={Clock} color="from-yellow-500 to-orange-500" />
            <StatCard title="Overdue" value={`$${stats.overdueAmount.toLocaleString()}`} icon={AlertCircle} color="from-red-500 to-red-700" />
            <StatCard title="Drafts" value={`$${stats.draftAmount.toLocaleString()}`} icon={Clock} color="from-gray-500 to-gray-700" />
        </div>

        <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search client, email, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64"/>
                  <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger aschild><Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2"/>Filters</Button></PopoverTrigger>
                    {/* ... Filter PopoverContent ... */}
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <p>Loading...</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left font-medium">Invoice</th>
                        <th className="p-4 text-left font-medium">Amount</th>
                        <th className="p-4 text-left font-medium">Status</th>
                        <th className="p-4 text-left font-medium">Due Date</th>
                        <th className="p-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice) => (
                        <motion.tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium">{invoice.client_email}</div>
                            <div className="text-sm text-gray-500">{invoice.description}</div>
                          </td>
                          <td className="p-4 font-medium">${invoice.amount.toLocaleString()}</td>
                          <td className="p-4"><Badge className={`${getStatusColor(invoice.status)}`}>{invoice.status}</Badge></td>
                          <td className="p-4">{new Date(invoice.due_date).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-end space-x-2">
                               <Button variant="ghost" size="icon" aschild>
                                 <Link href={`/invoices/${invoice.id}`}><Eye className="w-4 h-4" /></Link>
                               </Button>
                               <Button variant="ghost" size="icon" onClick={() => setModalState({ type: 'send', data: invoice })}>
                                 <Send className="w-4 h-4" />
                               </Button>
                               <Button variant="ghost" size="icon" onClick={() => setModalState({ type: 'edit', data: invoice })}>
                                 <Edit className="w-4 h-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setModalState({ type: 'delete', data: invoice })}>
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
        </Card>
      </div>

      {/* --- Modals --- */}
      {modalState.type === 'edit' && (
        <EditInvoiceModal
          invoice={modalState.data}
          onSave={handleUpdateInvoice}
          onClose={() => setModalState({ type: null, data: null })}
        />
      )}
       {modalState.type === 'send' && (
        <SendInvoiceModal
          invoice={modalState.data}
          onClose={() => setModalState({ type: null, data: null })}
        />
      )}
      {modalState.type === 'delete' && (
        <AlertDialog open={true} onOpenChange={() => setModalState({ type: null, data: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the invoice for {modalState.data.client_email}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteInvoice(modalState.data.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardLayout>
  )
}

// --- Reusable Components (can be moved to their own files) ---

function StatCard({ title, value, icon: Icon, color }) {
  return (
     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
       <Card>
         <CardContent className="py-0 flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-gray-600">{title}</p>
             <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
           </div>
           <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center shrink-0`}>
             <Icon className="w-6 h-6 text-white" />
           </div>
         </CardContent>
       </Card>
     </motion.div>
  );
}

function EditInvoiceModal({ invoice, onSave, onClose }) {
  const [formData, setFormData] = useState({ ...invoice });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div><Label htmlFor="client_email">Client Email</Label><Input id="client_email" name="client_email" value={formData.client_email} onChange={handleChange} /></div>
          <div><Label htmlFor="amount">Amount</Label><Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} /></div>
          <div><Label htmlFor="status">Status</Label>
            <Select name="status" value={formData.status} onValueChange={(v) => setFormData(p => ({...p, status: v}))}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem><SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem><SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
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
        <DialogHeader><DialogTitle>Send Invoice to {invoice.client_email}</DialogTitle></DialogHeader>
        <p className="py-4">This is a placeholder. You can add your email sending logic or a confirmation message here.</p>
        <DialogFooter><Button onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}