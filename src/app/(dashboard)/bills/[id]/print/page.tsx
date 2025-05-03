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

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function BillPrintPage({ params }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const printBill = async () => {
      try {
        const resolvedParams = await params;
        const billId = resolvedParams.id;
        if (!billId) return;
        
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
          throw new Error("Bill data not found");
        }

        if (!profileData.user) {
          throw new Error("User profile not found");
        }

        // Prepare data for PDF
        const pdfData = {
          invoiceNo: billData.bill.invoiceNo,
          date: new Date(billData.bill.date),
          customerName: billData.bill.customer.name,
          customerAddress: billData.bill.customer.address,
          customerGst: billData.bill.customer.gstNo,
          firmName: profileData.user.firmName || "Your Business",
          firmAddress: profileData.user.address || "Your Address",
          firmGst: profileData.user.gstNo || "GSTIN",
          bankName: profileData.user.bankName || "Bank Name",
          accountNo: profileData.user.accountNo || "Account Number",
          ifscCode: profileData.user.ifscCode || "IFSC Code",
          items: billData.bill.billItems.map((item: BillItem) => ({
            ...item,
            item: {
              name: item.item.name,
              hsnCode: item.item.hsnCode,
              gstPercentage: item.item.gstPercentage
            }
          })),
          totalAmount: billData.bill.totalAmount,
          totalTax: billData.bill.totalTax,
          grandTotal: billData.bill.grandTotal,
        };

        // Print the bill
        await printBillPdf(pdfData);
        
        // Navigate back to the bill page
        router.push(`/bills/${billId}`);
      } catch (error: any) {
        console.error("Error printing bill:", error);
        setError(error.message || "Failed to print bill");
      } finally {
        setIsLoading(false);
      }
    };

    printBill();
  }, [params, router]);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Preparing bill for printing...</p>
      </div>
    );
  }

  if (error) {
    return <FormError message={error} />;
  }

  return null;
} 