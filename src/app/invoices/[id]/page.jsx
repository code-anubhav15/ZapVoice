"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { InvoicePDFDocument } from "@/components/InvoicePDFDocument";

// UI Components & Icons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus, Send, Paperclip, Sparkles, FileText, User, Edit3, Copy, ArrowLeft,
  Menu, X, CheckCircle, Clock, AlertCircle, PanelLeftClose, PanelLeftOpen, LogOut,
  Save, Download,
  Sidebar
} from "lucide-react";
import Link from "next/link";

// Layout
import { DashboardLayout } from "@/components/dashboard-layout";

const aiSuggestions = [
  "Create an invoice for web development services for a client named 'TechCorp' at 'billing@techcorp.com', due by the end of next month.",
  "Generate an invoice for 20 hours of consulting work at $150/hour for 'Innovate LLC' (contact@innovate.co), due in 15 days.",
  "Make an invoice for 'Logo Design' (1 unit, $800) and 'Brand Guidelines' (1 unit, $1200) for 'StartupX' (founders@startupx.io).",
  "Create a monthly retainer invoice for $2500 for 'Marketing Solutions Inc' (accounts@marketingsolutions.com).",
];

export default function InvoiceChatPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const isNewInvoice = params.id === 'new';

  // --- State Management ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previousInvoices, setPreviousInvoices] = useState([]);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(isNewInvoice ? null : params.id);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [activeInvoiceData, setActiveInvoiceData] = useState(null); 
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  
  const messagesEndRef = useRef(null);

  // --- Utility Functions ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid": return <CheckCircle className="w-3 h-3" />;
      case "pending": return <Clock className="w-3 h-3" />;
      case "overdue": return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // --- Data Fetching & Side Effects ---
  useEffect(() => {
    const fetchPreviousInvoices = async () => {
        const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(10);
        if (!error) setPreviousInvoices(data);
    };

    const loadPageData = async () => {
        setLoadingPage(true);
        if (isNewInvoice) {
            setConversation([]);
            setViewingInvoice(null);
            setCurrentInvoiceId(null);
        } else {
            const { data, error } = await supabase.from('invoices').select('*').eq('id', params.id).single();
            if (error) {
                console.error("Error fetching invoice details:", error);
                router.push('/invoices/new');
            } else {
                setViewingInvoice(data);
                setConversation([]);
            }
        }
        setLoadingPage(false);
    };

    fetchPreviousInvoices();
    loadPageData();
  }, [params.id, isNewInvoice, supabase, router]);

  useEffect(() => { scrollToBottom(); }, [conversation]);

  useEffect(() => {
    const savedCollapsedState = localStorage.getItem("newInvoiceSidebarCollapsed");
    if (savedCollapsedState !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsedState));
    }
  }, []);

  // --- Event Handlers ---
  const handleSidebarToggle = () => {
    const newCollapsedState = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsedState);
    localStorage.setItem("newInvoiceSidebarCollapsed", JSON.stringify(newCollapsedState));
  };

  const handleNewInvoiceClick = () => {
    if (isNewInvoice) {
        setConversation([]);
        setViewingInvoice(null);
        setCurrentInvoiceId(null);
        setActiveInvoiceData(null);
        setMessage("");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isGenerating) return;

    const userMessageContent = message.trim();
    setConversation(prev => [...prev, { type: "user", content: userMessageContent }]);
    setMessage("");
    setIsGenerating(true);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessageContent, conversationHistory: conversation }),
        });

        if (!response.ok) throw new Error('API request failed');

        const result = await response.json();
        let aiResponse;

        if (result.type === 'invoice') {
            setActiveInvoiceData(result.data); 
            aiResponse = {
                type: "assistant",
                content: "I've generated the invoice based on the details provided. You can now save, download, or send it.",
                invoiceData: result.data, 
            };
        } else { 
            aiResponse = { type: "assistant", content: result.message };
        }
        setConversation(prev => [...prev, aiResponse]);

    } catch (error) {
        console.error("Failed to send message:", error);
        setConversation(prev => [...prev, { type: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveInvoice = async (invoiceData) => {
    setIsGenerating(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("You must be logged in to save an invoice.");
        setIsGenerating(false);
        return;
    }

    const invoicePayload = {
        creator_id: user.id,
        client_email: invoiceData.client_email,
        due_date: invoiceData.due_date,
        description: invoiceData.items.map(i => i.description).join(', '),
        amount: invoiceData.total,
        status: 'draft',
        items: invoiceData.items,
    };

    const { data: newInvoice, error } = await supabase.from('invoices').insert(invoicePayload).select().single();
    
    if (error) {
        console.error("Failed to save invoice:", error);
        alert("Error: Could not save the invoice. Please ensure your database schema is up to date.");
        setIsGenerating(false);
        return;
    }

    setPreviousInvoices(prev => [newInvoice, ...prev.slice(0, 9)]);
    alert(`Invoice Draft #${newInvoice.id.slice(0,8)} has been saved!`);
    router.push(`/invoices/${newInvoice.id}`);
    setIsGenerating(false);
  };
  
  const handleDownloadNewInvoice = async (invoiceData) => {
    const blob = await pdf(<InvoicePDFDocument invoiceData={invoiceData} />).toBlob();
    saveAs(blob, `Invoice-${invoiceData.client_name || 'invoice'}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDownloadExistingInvoice = async (invoiceData) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed on the server.');
      }

      const blob = await response.blob();
      saveAs(blob, `Invoice-${invoiceData.id.slice(0,8)}.pdf`);
    } catch (error) {
      console.error("Error downloading existing invoice PDF:", error);
      alert("Could not generate the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenSendModal = (invoiceData) => {
    setActiveInvoiceData(invoiceData);
    setIsSendModalOpen(true);
  };

  const handleSuggestionClick = (suggestion) => { setMessage(suggestion); };
  const handleKeyPress = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
  
  const SidebarContent = () => (
    <>
      <div className={`p-4 border-b border-gray-200 ${sidebarCollapsed ? "px-2" : ""}`}>
        <Link href={`/invoices/new`} passHref>
          <Button 
            onClick={handleNewInvoiceClick}
            className={`bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 ${sidebarCollapsed ? "w-12 h-12 p-0" : "w-full"}`} 
            title={sidebarCollapsed ? "New Invoice" : undefined}
          >
            <Plus className={`w-4 h-4 ${sidebarCollapsed ? "" : "mr-2"}`} />
            {!sidebarCollapsed && "New Invoice"}
          </Button>
        </Link>
      </div>
      <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? "px-2 py-4" : "p-4"}`}>
        {!sidebarCollapsed && <h3 className="text-sm font-medium text-gray-500 mb-3">Previous Invoices</h3>}
        <div className="space-y-3">
          {previousInvoices.map((invoice) => (
            <Link href={`/invoices/${invoice.id}`} key={invoice.id} passHref>
              <motion.div whileHover={{ scale: sidebarCollapsed ? 1.05 : 1.02 }} className={`rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors ${sidebarCollapsed ? "p-2 flex items-center justify-center" : "p-3"}`} title={sidebarCollapsed ? `${invoice.id.slice(0,8)} - ${invoice.client_email}` : undefined}>
                {sidebarCollapsed ? (
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{invoice.id.slice(0,8)}...</span>
                      <Badge className={`${getStatusColor(invoice.status)} flex items-center space-x-1`}>
                        {getStatusIcon(invoice.status)}
                        <span className="capitalize text-xs">{invoice.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{invoice.client_email}</p>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{invoice.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>${invoice.amount.toLocaleString()}</span>
                      <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      <div className={`border-t border-gray-200 ${sidebarCollapsed ? "px-2 py-4" : "p-4"}`}>
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center"><span className="text-white text-sm font-medium">N</span></div>
            <Button variant="ghost" size="sm" className="p-1"><LogOut className="w-4 h-4" /></Button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center"><span className="text-white text-sm font-medium">N</span></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">John Doe</p><p className="text-xs text-gray-500 truncate">john@example.com</p></div>
            <Button variant="ghost" size="sm"><LogOut className="w-4 h-4" /></Button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="h-screen bg-gray-50 flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed top-0 left-0 z-50 w-80 h-full bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/invoices" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /><span>Back to Invoices</span></Link>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></Button>
              </div>
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? "lg:w-16" : "lg:w-80"}`}>
        <div className="flex items-center justify-between p-4 border-b">
          {!sidebarCollapsed && (<Link href="/invoices" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /><span>Back to Invoices</span></Link>)}
          <Button variant="ghost" size="sm" onClick={handleSidebarToggle} className="p-1">{sidebarCollapsed ? <Sidebar className="w-5 h-5" /> : <Sidebar className="w-5 h-5" />}</Button>
        </div>
        <SidebarContent />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></Button>
                    {sidebarCollapsed && (<Link href="/invoices" className="hidden lg:flex items-center space-x-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /><span>Back to Invoices</span></Link>)}
                </div>
                <div className="flex items-center space-x-2"><img src="/logo.png" alt="Logo" className="h-8 w-auto" /></div>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            {loadingPage ? (
              <p>Loading...</p>
            ) : viewingInvoice ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Invoice Details</CardTitle>
                      <Badge className={getStatusColor(viewingInvoice.status)}>{viewingInvoice.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between"><span className="text-gray-600">Client:</span><span className="font-medium">{viewingInvoice.client_email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Amount:</span><span className="font-medium">${viewingInvoice.amount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Due Date:</span><span className="font-medium">{new Date(viewingInvoice.due_date).toLocaleDateString()}</span></div>
                    {viewingInvoice.items && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Items</h4>
                        {viewingInvoice.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm"><p>{item.description}</p><p>${item.amount.toLocaleString()}</p></div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end pt-4">
                       <Button onClick={() => handleDownloadExistingInvoice(viewingInvoice)} disabled={isGenerating}>
                         <Download className="w-4 h-4 mr-2"/>
                         {isGenerating ? 'Generating...' : 'Generate PDF'}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <>
                {conversation.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl flex items-center justify-center mx-auto mb-6"><Sparkles className="w-8 h-8 text-white" /></div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Your Invoice with AI</h1>
                    <p className="text-lg text-gray-600 mb-8">Describe what you need, and I'll generate a professional invoice for you.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {aiSuggestions.map((suggestion, index) => (
                        <motion.button key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} onClick={() => handleSuggestionClick(suggestion)} className="p-4 text-left border rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
                          <div className="flex items-center space-x-3"><FileText className="w-5 h-5 text-green-600" /><span>{suggestion}</span></div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {conversation.map((msg, index) => (
                        <Fragment key={index}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-3xl ${msg.type === "user" ? "bg-gradient-to-r from-green-600 to-green-800 text-white" : "bg-white border"} rounded-2xl p-4`}>
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === "user" ? "bg-white/20" : "bg-gradient-to-r from-green-600 to-green-800"}`}>
                                            {msg.type === "user" ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className="flex-1"><p>{msg.content}</p></div>
                                    </div>
                                </div>
                            </motion.div>
                            {msg.invoiceData && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                    <Card className="overflow-hidden">
                                        <div className="h-[500px] bg-gray-200">
                                            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                                                <InvoicePDFDocument invoiceData={msg.invoiceData} />
                                            </PDFViewer>
                                        </div>
                                        <CardContent className="p-3 bg-gray-50 flex items-center justify-end space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleSaveInvoice(msg.invoiceData)}><Save className="w-4 h-4 mr-2" />Save</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDownloadNewInvoice(msg.invoiceData)}><Download className="w-4 h-4 mr-2" />Download</Button>
                                            <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-800" onClick={() => handleOpenSendModal(msg.invoiceData)}><Send className="w-4 h-4 mr-2" />Send</Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </Fragment>
                    ))}
                    {isGenerating && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                        <div className="bg-white border rounded-2xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-green-800 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                            <div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} /></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {!viewingInvoice && (
          <div className="bg-white border-t p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Describe the invoice you want to create..." className="w-full resize-none border rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-green-500 max-h-32" rows={1} style={{ minHeight: "48px" }} />
                  <Button variant="ghost" size="sm" className="absolute right-2 bottom-2"><Paperclip className="w-4 h-4" /></Button>
                </div>
                <Button onClick={handleSendMessage} disabled={!message.trim() || isGenerating} className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl px-6 py-3"><Send className="w-4 h-4" /></Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">AI can make mistakes. Please review generated invoices before sending.</p>
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Send Invoice</DialogTitle>
                  <DialogDescription>
                      This will send the invoice to {activeInvoiceData?.client_email}.
                  </DialogDescription>
              </DialogHeader>
              <div>
                  <p className="mb-2 text-sm font-medium">Additional Message (Optional)</p>
                  <textarea className="w-full resize-none border rounded-md p-2 text-sm" rows={4} placeholder="E.g., Here's your invoice for the recent project. Thank you for your business!"></textarea>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>Cancel</Button>
                  <Button className="bg-gradient-to-r from-green-600 to-green-800">Send Invoice</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  )
}
