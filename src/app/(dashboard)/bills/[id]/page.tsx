"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import { downloadBillPdf, printBillPdf } from "@/lib/pdfUtils";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

// Define types for the bill data
type BillItem = {
  id: string;
  quantity: number;
  rate: number;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  item: {
    id: string;
    name: string;
    hsnCode: string;
    gstPercentage: number;
  };
};

type Bill = {
  id: string;
  invoiceNo: string;
  date: string;
  totalAmount: number;
  totalTax: number;
  grandTotal: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    address: string;
    gstNo: string | null;
  };
  billItems: BillItem[];
};

type UserProfile = {
  firmName: string;
  address: string;
  gstNo: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
};

interface PageProps {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function BillPage({ params }: PageProps) {
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [billId, setBillId] = useState<string>("");
  
  // Set the billId state as soon as the component mounts
  useEffect(() => {
    if (params?.id) {
      setBillId(params.id);
    }
  }, [params]);
  
  useEffect(() => {
    // Only proceed if billId is available
    if (!billId) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch bill data and user profile in parallel
        const [billResponse, profileResponse] = await Promise.all([
          fetch(`/api/bills/${billId}`),
          fetch('/api/user/profile')
        ]);

        if (!billResponse.ok) {
          const errorText = await billResponse.text();
          throw new Error(`Failed to fetch bill: ${errorText}`);
        }

        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          throw new Error(`Failed to fetch user profile: ${errorText}`);
        }

        const billData = await billResponse.json();
        const profileData = await profileResponse.json();

        setBill(billData.bill);
        setUserProfile(profileData.user);
      } catch (error: any) {
        console.error("Error loading data:", error);
        setError(error.message || "Failed to load bill data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [billId]); // Changed dependency to billId state

  const handleDownload = () => {
    if (!bill || !userProfile) return;
    
    try {
      setError("");
      console.log("Preparing bill data for PDF download...");
      
      // Prepare data for PDF with validation
      const pdfData = {
        invoiceNo: bill.invoiceNo,
        date: new Date(bill.date),
        customerName: bill.customer.name,
        customerAddress: bill.customer.address,
        customerGst: bill.customer.gstNo,
        firmName: userProfile.firmName || "Your Business",
        firmAddress: userProfile.address || "Your Address",
        firmGst: userProfile.gstNo || "GSTIN",
        bankName: userProfile.bankName || "Bank Name",
        accountNo: userProfile.accountNo || "Account Number",
        ifscCode: userProfile.ifscCode || "IFSC Code",
        items: bill.billItems.map(item => ({
          ...item,
          item: {
            name: item.item.name,
            hsnCode: item.item.hsnCode,
            gstPercentage: item.item.gstPercentage
          }
        })),
        totalAmount: bill.totalAmount,
        totalTax: bill.totalTax,
        grandTotal: bill.grandTotal,
      };
      
      console.log("Generating download PDF...");
      downloadBillPdf(pdfData);
      console.log("PDF downloaded successfully");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      setError(error.message || "There was an error generating the PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    if (!bill || !userProfile) return;

    try {
      // Navigate to the print page which will handle the printing
      router.push(`/bills/${billId}/print`);
    } catch (error: any) {
      console.error("Error navigating to print page:", error);
      setError(error.message || "There was an error printing the PDF. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Loading bill data...</p>
      </div>
    );
  }

  if (error) {
    return <FormError message={error} />;
  }

  if (!bill || !userProfile) {
    return <FormError message="Bill or profile data not available" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/bills" className="mr-4">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Invoice #{bill.invoiceNo}</h1>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleDownload} variant="outline">
            <FiDownload className="mr-2" /> Download
          </Button>
          <Button onClick={handlePrint}>
            <FiPrinter className="mr-2" /> Print
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Bill Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">{userProfile.firmName}</h2>
          <p className="text-gray-600">{userProfile.address}</p>
          <p className="text-gray-600">GSTIN: {userProfile.gstNo}</p>
          <div className="mt-4 border-b-2 border-gray-300 pb-2">
            <h3 className="text-xl font-semibold">TAX INVOICE</h3>
          </div>
        </div>

        {/* Bill Info & Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="font-semibold mb-2">Bill To:</h4>
            <p className="font-medium">{bill.customer.name}</p>
            <p className="text-gray-600">{bill.customer.address}</p>
            {bill.customer.gstNo && (
              <p className="text-gray-600">GSTIN: {bill.customer.gstNo}</p>
            )}
          </div>
          <div className="text-right">
            <p className="mb-1">
              <span className="font-medium">Invoice No:</span> {bill.invoiceNo}
            </p>
            <p className="mb-1">
              <span className="font-medium">Date:</span>{" "}
              {new Date(bill.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  S.No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  HSN/SAC
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Qty
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rate
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  GST %
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  GST Amt
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bill.billItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.item.hsnCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ₹{item.rate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ₹{item.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.item.gstPercentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ₹{item.taxAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ₹{item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t">
              <span className="font-medium">Subtotal:</span>
              <span>₹{bill.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span className="font-medium">Total Tax:</span>
              <span>₹{bill.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-double border-t-2">
              <span className="font-bold">Grand Total:</span>
              <span className="font-bold">₹{bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bank Details & Signature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-4 border-t">
          <div>
            <h4 className="font-semibold mb-2">Bank Details:</h4>
            <p className="text-sm text-gray-600">
              Bank Name: {userProfile.bankName}
            </p>
            <p className="text-sm text-gray-600">
              Account No: {userProfile.accountNo}
            </p>
            <p className="text-sm text-gray-600">
              IFSC Code: {userProfile.ifscCode}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold mb-8">For {userProfile.firmName}</p>
            <p className="font-medium">Authorized Signatory</p>
          </div>
        </div>

        <div className="text-center text-gray-500 text-xs mt-8">
          This is a computer generated invoice.
        </div>
      </div>
    </div>
  );
} 