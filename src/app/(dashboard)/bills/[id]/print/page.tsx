"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { printBillPdf } from "@/lib/pdfUtils";
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
  params: {
    id: string;
  };
}

export default function BillPrintPage({ params }: PageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [billId, setBillId] = useState<string>("");
  
  // Set the billId state as soon as the component mounts
  useEffect(() => {
    if (params?.id) {
      // In client components we can use params.id directly
      setBillId(params.id);
    }
  }, [params]);

  useEffect(() => {
    // Only proceed if billId is available
    if (!billId) return;
    
    const printBill = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        console.log("Fetching bill data for ID:", billId);
        
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

        if (!billData.bill) {
          throw new Error("Bill data is missing or invalid");
        }

        if (!profileData.user) {
          throw new Error("User profile data is missing or invalid");
        }

        const bill = billData.bill as Bill;
        const userProfile = profileData.user as UserProfile;

        console.log("Successfully fetched bill data:", bill.invoiceNo);

        // Prepare data for PDF
        const pdfData = {
          invoiceNo: bill.invoiceNo,
          date: new Date(bill.date),
          customerName: bill.customer.name,
          customerAddress: bill.customer.address,
          customerGst: bill.customer.gstNo,
          firmName: userProfile.firmName || 'Your Business',
          firmAddress: userProfile.address || 'Your Address',
          firmGst: userProfile.gstNo || 'GSTIN',
          bankName: userProfile.bankName || 'Bank Name',
          accountNo: userProfile.accountNo || 'Account Number',
          ifscCode: userProfile.ifscCode || 'IFSC Code',
          items: bill.billItems,
          totalAmount: bill.totalAmount,
          totalTax: bill.totalTax,
          grandTotal: bill.grandTotal,
        };

        // Automatically print the bill
        console.log("Generating PDF for printing...");
        
        try {
          await new Promise<void>((resolve) => {
            // Small delay to ensure UI updates before PDF processing
            setTimeout(() => {
              try {
                printBillPdf(pdfData);
                resolve();
              } catch (err) {
                console.error("Error in printBillPdf:", err);
                throw err;
              }
            }, 500);
          });
          
          console.log("PDF printed successfully");
        } catch (err: any) {
          console.error("PDF printing error:", err);
          setError(err.message || "There was an error printing your bill. Please try again.");
          
          // Still redirect back to bill view after a delay
          setTimeout(() => {
            router.push(`/bills/${billId}`);
          }, 3000);
          return;
        }

        // Redirect back to bill view
        setTimeout(() => {
          router.push(`/bills/${billId}`);
        }, 1000);
      } catch (err: any) {
        console.error("Error in print process:", err);
        setError(err.message || "There was an error loading bill data. Please try again.");
        
        // Redirect with a delay
        setTimeout(() => {
          router.push(`/bills/${billId}`);
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    printBill();
  }, [billId, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-lg p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Printing Error</h1>
          <FormError message={error} />
          <p className="mt-4 text-gray-600">
            You will be redirected back to the bill page automatically.
          </p>
          <button 
            onClick={() => router.push(`/bills/${billId}`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Preparing Your Invoice...</h1>
        <p className="text-gray-600">
          {isLoading ? "Please wait while we generate your invoice..." : "Printing your invoice..."}
        </p>
        <p className="text-gray-500 text-sm mt-4">
          You will be redirected automatically.
        </p>
        <div className="mt-4">
          <button 
            onClick={() => router.push(`/bills/${billId}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 