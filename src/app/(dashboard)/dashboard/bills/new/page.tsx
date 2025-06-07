"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingSpinner } from "@/components/Spinner";
import { DeleteIcon } from "@/components/icons";
import { PageHeader } from "@/components/ui";


interface Customer {
  id: string;
  name: string;
  gstNo: string;
}

interface Item {
  id: string;
  name: string;
  hsnCode: string;
  taxRate: number;
}

interface BillItem {
  itemId: string;
  name: string;
  hsnCode: string;
  taxRate: number;
  quantity: number;
  price: number;
  amount: number;
  taxAmount: number;
}

interface DraftData {
  billData: {
    billNumber: string;
    billDate: string;
    customerId: string;
    isIGST: boolean;
    deliveryAddress: string;
  };
  billItems: BillItem[];
  timestamp: number;
}

export default function NewBillPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [draftStatus, setDraftStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [savedDraft, setSavedDraft] = useState<DraftData | null>(null);
  
  const [billData, setBillData] = useState({
    billNumber: "",
    billDate: new Date().toISOString().split("T")[0],
    customerId: "",
    isIGST: false,
    deliveryAddress: "",
  });

  // Form data for adding a new item to bill
  const [newItem, setNewItem] = useState({
    itemId: "",
    quantity: 0,
    price: 0,
  });

  // Auto-save functionality
  const saveDraft = async () => {
    if (billItems.length === 0 && !billData.customerId && !billData.deliveryAddress) {
      return; // Don't save empty drafts
    }

    setDraftStatus('saving');
    try {
      const draftData: DraftData = {
        billData,
        billItems,
        timestamp: Date.now()
      };
      localStorage.setItem('billDraft', JSON.stringify(draftData));
      setDraftStatus('saved');
      
      // Clear the status after 3 seconds
      setTimeout(() => setDraftStatus(null), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setDraftStatus('error');
      setTimeout(() => setDraftStatus(null), 3000);
    }
  };

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const draftStr = localStorage.getItem('billDraft');
      if (draftStr) {
        const draft: DraftData = JSON.parse(draftStr);
        // Check if draft is not older than 24 hours
        const hoursSinceLastSave = (Date.now() - draft.timestamp) / (1000 * 60 * 60);
        if (hoursSinceLastSave < 24) {
          setSavedDraft(draft);
          setShowDraftRecovery(true);
        } else {
          // Remove old draft
          localStorage.removeItem('billDraft');
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      localStorage.removeItem('billDraft');
    }
  };

  // Recover draft data
  const recoverDraft = () => {
    if (savedDraft) {
      setBillData(savedDraft.billData);
      setBillItems(savedDraft.billItems);
      setShowDraftRecovery(false);
      setSavedDraft(null);
    }
  };

  // Dismiss draft recovery
  const dismissDraft = () => {
    localStorage.removeItem('billDraft');
    setShowDraftRecovery(false);
    setSavedDraft(null);
  };

  // Clear draft when bill is successfully saved
  const clearDraft = () => {
    localStorage.removeItem('billDraft');
    setDraftStatus(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customersRes = await fetch("/api/customers");
        if (!customersRes.ok) {
          throw new Error("Failed to fetch customers");
        }
        const customersData = await customersRes.json();
        // Sort customers alphabetically by name
        const sortedCustomers = customersData.sort((a: Customer, b: Customer) => 
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        setCustomers(sortedCustomers);

        // Fetch items
        const itemsRes = await fetch("/api/items");
        if (!itemsRes.ok) {
          throw new Error("Failed to fetch items");
        }
        const itemsData = await itemsRes.json();
        // Sort items alphabetically by name
        const sortedItems = itemsData.sort((a: Item, b: Item) => 
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        setItems(sortedItems);

        // Generate a new bill number
        const billNumberRes = await fetch("/api/bills/nextBillNumber");
        if (billNumberRes.ok) {
          const { billNumber } = await billNumberRes.json();
          setBillData(prev => ({ ...prev, billNumber }));
        }

        // Check for saved draft
        loadDraft();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (!loading && (billItems.length > 0 || billData.customerId || billData.deliveryAddress)) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 2000); // Save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [billData, billItems, loading]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (billItems.length > 0 || billData.customerId || billData.deliveryAddress) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [billItems, billData]);

  const handleBillDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setBillData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addItemToBill = () => {
    if (!newItem.itemId || !newItem.quantity || !newItem.price) {
      setError("Please select an item and specify quantity and price");
      return;
    }

    const selectedItem = items.find(item => item.id === newItem.itemId);
    if (!selectedItem) {
      setError("Selected item not found");
      return;
    }

    const quantity = parseInt(String(newItem.quantity));
    const price = parseFloat(String(newItem.price));
    const amount = quantity * price;
    const taxAmount = (amount * selectedItem.taxRate) / 100;

    const billItem: BillItem = {
      itemId: selectedItem.id,
      name: selectedItem.name,
      hsnCode: selectedItem.hsnCode,
      taxRate: selectedItem.taxRate,
      quantity,
      price,
      amount,
      taxAmount,
    };

    setBillItems(prev => [...prev, billItem]);
    setNewItem({
      itemId: "",
      quantity: 1,
      price: 0,
    });
    setError("");
  };

  const removeItem = (index: number) => {
    setBillItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = billItems.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = billItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const cgst = billData.isIGST ? 0 : totalTax / 2;
  const sgst = billData.isIGST ? 0 : totalTax / 2;
  const igst = billData.isIGST ? totalTax : 0;
  const grandTotal = subtotal + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (billItems.length === 0) {
      setError("Please add at least one item to the bill");
      return;
    }

    if (!billData.customerId) {
      setError("Please select a customer");
      return;
    }

    if (!billData.billNumber) {
      setError("Bill number is required");
      return;
    }

    setSaveLoading(true);
    
    try {
      const items = billItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...billData,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create bill");
      }

      // Clear draft after successful save
      clearDraft();
      router.push("/dashboard/bills");
    } catch (error) {
      console.error("Error creating bill:", error);
      setError(error instanceof Error ? error.message : "Failed to create bill");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Draft Recovery Modal */}
      {showDraftRecovery && savedDraft && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Draft Found</h3>
                <p className="text-sm text-gray-600">You have unsaved work from earlier</p>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-amber-700 font-medium">Items:</span>
                  <span className="text-amber-800">{savedDraft.billItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700 font-medium">Customer:</span>
                  <span className="text-amber-800">{savedDraft.billData.customerId ? 'Selected' : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700 font-medium">Last saved:</span>
                  <span className="text-amber-800">
                    {new Date(savedDraft.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={dismissDraft}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
              >
                Start Fresh
              </button>
              <button
                onClick={recoverDraft}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all duration-200 shadow-sm"
              >
                Recover Draft
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title="Create New Bill"
        description="Generate a professional GST invoice for your customer"
        icon={
          <svg className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      >
        <div className="flex items-center gap-2 text-sm">
          {/* Draft Status Indicator */}
          {draftStatus && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              draftStatus === 'saved' 
                ? 'bg-green-50 border-green-200 text-green-700'
                : draftStatus === 'saving'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {draftStatus === 'saved' && (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-medium">Draft saved</span>
                </>
              )}
              {draftStatus === 'saving' && (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Saving...</span>
                </>
              )}
              {draftStatus === 'error' && (
                <>
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="font-medium">Save failed</span>
                </>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-700 font-medium">
              {billItems.length} item{billItems.length !== 1 ? 's' : ''} added
            </span>
          </div>
          {subtotal > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-emerald-700 font-medium">₹{grandTotal.toFixed(2)}</span>
            </div>
          )}
        </div>
        <Link
          href="/dashboard/bills"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Bills
        </Link>
      </PageHeader>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-6 sm:p-8">
              <div className="space-y-8">

                {/* Bill Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Bill Information</h2>
                      <p className="text-sm text-gray-600">Basic details about the invoice</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Bill Number */}
                    <div className="space-y-2">
                      <label htmlFor="billNumber" className="block text-sm font-medium text-gray-700">
                        Bill Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="billNumber"
                          id="billNumber"
                          required
                          value={billData.billNumber}
                          onChange={handleBillDataChange}
                          placeholder="Auto-generated"
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Bill Date */}
                    <div className="space-y-2">
                      <label htmlFor="billDate" className="block text-sm font-medium text-gray-700">
                        Bill Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="date"
                          name="billDate"
                          id="billDate"
                          required
                          value={billData.billDate}
                          onChange={handleBillDataChange}
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                        />
                      </div>
                    </div>

                    {/* Tax Type */}
                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Tax Type
                      </label>
                      <div className="relative">
                        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            id="isIGST"
                            name="isIGST"
                            type="checkbox"
                            checked={billData.isIGST}
                            onChange={handleBillDataChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Apply IGST (Interstate)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Selection Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
                      <p className="text-sm text-gray-600">Select customer and delivery information</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Customer Selection */}
                    <div className="space-y-2">
                      <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                        Select Customer <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <select
                          id="customerId"
                          name="customerId"
                          required
                          value={billData.customerId}
                          onChange={handleBillDataChange}
                          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors appearance-none"
                        >
                          <option value="">Select a customer</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name} - {customer.gstNo}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-2">
                      <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">
                        Delivery Address (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          rows={3}
                          value={billData.deliveryAddress}
                          onChange={handleBillDataChange}
                          placeholder="Enter delivery address if different from billing address"
                          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none placeholder-gray-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item Selection Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Add Items</h2>
                      <p className="text-sm text-gray-600">Select products and specify quantities</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="lg:col-span-2 space-y-2">
                        <label htmlFor="itemId" className="block text-sm font-medium text-gray-700">
                          Select Item <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <select
                            id="itemId"
                            name="itemId"
                            value={newItem.itemId}
                            onChange={handleNewItemChange}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors appearance-none"
                          >
                            <option value="">Select an item</option>
                            {items.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name} - HSN: {item.hsnCode} (Tax: {item.taxRate}%)
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2M7 4H5a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h6m-3 3v6m-2-3h4" />
                            </svg>
                          </div>
                          <input
                            type="number"
                            min="1"
                            name="quantity"
                            id="quantity"
                            value={newItem.quantity || ''}
                            onChange={handleNewItemChange}
                            placeholder="0"
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            id="price"
                            value={newItem.price || ''}
                            onChange={handleNewItemChange}
                            placeholder="0.00"
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={addItemToBill}
                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-6">
                  {billItems.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Added</h3>
                      <p className="text-sm text-gray-500">Add items to your bill using the form above</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Bill Items ({billItems.length})</h3>
                      </div>
                    
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Item
                                  </th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    HSN
                                  </th>
                            <th scope="col" className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Qty
                                  </th>
                            <th scope="col" className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Price
                                  </th>
                            <th scope="col" className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Amount
                                  </th>
                            <th scope="col" className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Tax Rate
                                  </th>
                            <th scope="col" className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Tax Amount
                                  </th>
                                                        <th scope="col" className="relative py-4 pl-3 pr-6">
                              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</span>
                            </th>
                                </tr>
                              </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {billItems.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                                      {item.name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {item.hsnCode}
                                    </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {item.quantity}
                                </span>
                                    </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right font-medium">
                                      ₹{item.price.toFixed(2)}
                                    </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right font-semibold">
                                      ₹{item.amount.toFixed(2)}
                                    </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                      {item.taxRate}%
                                </span>
                                    </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right font-medium">
                                      ₹{item.taxAmount.toFixed(2)}
                                    </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right">
                                      <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                  className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        aria-label="Remove item"
                                      >
                                        <DeleteIcon />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                )}
                </div>

                {/* Summary Section */}
                {billItems.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Bill Summary</h2>
                        <p className="text-sm text-gray-600">Tax calculations and total amount</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Subtotal</span>
                        <span className="text-lg font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>

                        {billData.isIGST ? (
                          <div className="flex justify-between items-center py-2 bg-gray-100 rounded-lg px-4">
                            <span className="text-sm font-medium text-gray-700">IGST</span>
                            <span className="text-lg font-semibold text-gray-900">₹{igst.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 bg-gray-100 rounded-lg px-4">
                              <span className="text-sm font-medium text-gray-700">CGST</span>
                              <span className="text-lg font-semibold text-gray-900">₹{cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-gray-100 rounded-lg px-4">
                              <span className="text-sm font-medium text-gray-700">SGST</span>
                              <span className="text-lg font-semibold text-gray-900">₹{sgst.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-4 border-t-2 border-gray-200">
                          <div className="flex justify-between items-center py-3 bg-blue-50 rounded-xl px-6">
                            <span className="text-lg font-bold text-blue-800">Grand Total</span>
                            <span className="text-2xl font-bold text-blue-900">₹{grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="px-4 py-6 sm:px-8 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <Link
                  href="/dashboard/bills"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm transition-colors border border-gray-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saveLoading || billItems.length === 0}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {saveLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Bill</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}