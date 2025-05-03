"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

interface BillParams {
  params: {
    id: string;
  };
}

interface BillItem {
  id: string;
  item: {
    name: string;
    hsnCode: string;
    taxRate: number;
  };
  quantity: number;
  price: number;
  taxAmount: number;
  amount: number;
}

interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  customer: {
    name: string;
    address: string;
    gstNo: string;
  };
  items: BillItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  isIGST: boolean;
}

export default function BillDetailPage({ params }: BillParams) {
  const router = useRouter();
  const { id } = params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await fetch(`/api/bills/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch bill");
        }
        const data = await res.json();
        setBill(data);
      } catch (error) {
        console.error("Error fetching bill:", error);
        setError("Failed to load bill. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this bill?")) {
      try {
        const res = await fetch(`/api/bills/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete bill");
        }

        router.push("/dashboard/bills");
      } catch (error) {
        console.error("Error deleting bill:", error);
        setError("Failed to delete bill. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Loading bill...</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md max-w-7xl mx-auto mt-8">
        {error || "Failed to load bill details"}
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow print:hidden">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Bill #{bill.billNumber}</h1>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Print
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
            <Link
              href="/dashboard/bills"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Bill Content for Print and View */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-center mb-2">TAX INVOICE</h2>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Invoice #: {bill.billNumber}</p>
                    <p className="text-sm text-gray-500">
                      Date: {format(new Date(bill.billDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Tax Type: {bill.isIGST ? "IGST" : "CGST/SGST"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Details</h3>
                  <p className="text-sm font-medium">{bill.customer.name}</p>
                  <p className="text-sm text-gray-500 whitespace-pre-line">{bill.customer.address}</p>
                  <p className="text-sm text-gray-500">GSTIN: {bill.customer.gstNo}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
                <div className="overflow-x-auto">
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {bill.items.map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.item.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.item.hsnCode}
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
                            {item.item.taxRate}%
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ₹{item.taxAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
                      <dd className="text-sm font-medium text-gray-900">₹{bill.subtotal.toFixed(2)}</dd>
                    </div>

                    {bill.isIGST ? (
                      <div className="flex justify-between py-2">
                        <dt className="text-sm font-medium text-gray-500">IGST</dt>
                        <dd className="text-sm font-medium text-gray-900">₹{bill.igst.toFixed(2)}</dd>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between py-2">
                          <dt className="text-sm font-medium text-gray-500">CGST</dt>
                          <dd className="text-sm font-medium text-gray-900">₹{bill.cgst.toFixed(2)}</dd>
                        </div>
                        <div className="flex justify-between py-2">
                          <dt className="text-sm font-medium text-gray-500">SGST</dt>
                          <dd className="text-sm font-medium text-gray-900">₹{bill.sgst.toFixed(2)}</dd>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between py-2 border-t border-gray-200">
                      <dt className="text-base font-bold text-gray-900">Total</dt>
                      <dd className="text-base font-bold text-gray-900">₹{bill.total.toFixed(2)}</dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 