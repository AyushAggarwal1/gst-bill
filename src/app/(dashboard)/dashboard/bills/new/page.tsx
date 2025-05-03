"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function NewBillPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [billData, setBillData] = useState({
    billNumber: "",
    billDate: new Date().toISOString().split("T")[0],
    customerId: "",
    isIGST: false,
  });

  // Form data for adding a new item to bill
  const [newItem, setNewItem] = useState({
    itemId: "",
    quantity: 1,
    price: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customersRes = await fetch("/api/customers");
        if (!customersRes.ok) {
          throw new Error("Failed to fetch customers");
        }
        const customersData = await customersRes.json();
        setCustomers(customersData);

        // Fetch items
        const itemsRes = await fetch("/api/items");
        if (!itemsRes.ok) {
          throw new Error("Failed to fetch items");
        }
        const itemsData = await itemsRes.json();
        setItems(itemsData);

        // Generate a new bill number
        const billNumberRes = await fetch("/api/bills/nextBillNumber");
        if (billNumberRes.ok) {
          const { billNumber } = await billNumberRes.json();
          setBillData(prev => ({ ...prev, billNumber }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBillDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      router.push("/dashboard/bills");
    } catch (error) {
      console.error("Error creating bill:", error);
      setError(error instanceof Error ? error.message : "Failed to create bill");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Bill</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <form onSubmit={handleSubmit}>
              <div className="px-4 py-5 sm:p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Bill Details Section */}
                  <div className="sm:col-span-3">
                    <label htmlFor="billNumber" className="block text-sm font-medium text-gray-700">
                      Bill Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="billNumber"
                        id="billNumber"
                        required
                        value={billData.billNumber}
                        onChange={handleBillDataChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="billDate" className="block text-sm font-medium text-gray-700">
                      Bill Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="billDate"
                        id="billDate"
                        required
                        value={billData.billDate}
                        onChange={handleBillDataChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                      Customer
                    </label>
                    <div className="mt-1">
                      <select
                        id="customerId"
                        name="customerId"
                        required
                        value={billData.customerId}
                        onChange={handleBillDataChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} - {customer.gstNo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center h-full mt-6">
                      <input
                        id="isIGST"
                        name="isIGST"
                        type="checkbox"
                        checked={billData.isIGST}
                        onChange={handleBillDataChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isIGST" className="ml-2 block text-sm text-gray-700">
                        Apply IGST (Interstate)
                      </label>
                    </div>
                  </div>

                  {/* Item Selection Section */}
                  <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Add Items</h3>
                    <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="itemId" className="block text-sm font-medium text-gray-700">
                          Item
                        </label>
                        <div className="mt-1">
                          <select
                            id="itemId"
                            name="itemId"
                            value={newItem.itemId}
                            onChange={handleNewItemChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="">Select an item</option>
                            {items.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name} - HSN: {item.hsnCode} (Tax: {item.taxRate}%)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-1">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            min="1"
                            name="quantity"
                            id="quantity"
                            value={newItem.quantity}
                            onChange={handleNewItemChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-1">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            id="price"
                            value={newItem.price}
                            onChange={handleNewItemChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex items-end">
                        <button
                          type="button"
                          onClick={addItemToBill}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Bill Items</h3>
                    {billItems.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-500">No items added to this bill yet.</p>
                    ) : (
                      <div className="mt-4 flex flex-col">
                        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                              <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                      Item
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      HSN
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      Qty
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      Price
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      Amount
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      Tax Rate
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      Tax Amount
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                      <span className="sr-only">Actions</span>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                  {billItems.map((item, index) => (
                                    <tr key={index}>
                                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        {item.name}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {item.hsnCode}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {item.quantity}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        ₹{item.price.toFixed(2)}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        ₹{item.amount.toFixed(2)}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {item.taxRate}%
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        ₹{item.taxAmount.toFixed(2)}
                                      </td>
                                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button
                                          type="button"
                                          onClick={() => removeItem(index)}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Section */}
                  {billItems.length > 0 && (
                    <div className="sm:col-span-6">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Bill Summary</h3>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Subtotal:</p>
                            <p className="text-sm font-medium text-gray-900">₹{subtotal.toFixed(2)}</p>
                          </div>
                          
                          {billData.isIGST ? (
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-500">IGST:</p>
                              <p className="text-sm font-medium text-gray-900">₹{igst.toFixed(2)}</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <p className="text-sm text-gray-500">CGST:</p>
                                <p className="text-sm font-medium text-gray-900">₹{cgst.toFixed(2)}</p>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-sm text-gray-500">SGST:</p>
                                <p className="text-sm font-medium text-gray-900">₹{sgst.toFixed(2)}</p>
                              </div>
                            </>
                          )}
                          
                          <div className="pt-2 border-t border-gray-200 flex justify-between">
                            <p className="text-base font-medium text-gray-900">Total:</p>
                            <p className="text-base font-medium text-gray-900">₹{grandTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <Link
                  href="/dashboard/bills"
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saveLoading || billItems.length === 0}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : "Create Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 