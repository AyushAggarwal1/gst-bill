import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
// Import XLSX dynamically to avoid build issues
// import * as XLSX from 'xlsx';

// Tell Next.js to always render this route dynamically
export const dynamic = 'force-dynamic';

// POST to export bills to Excel
export async function POST(req: Request) {
  try {
    // Dynamically import xlsx to avoid build issues
    const XLSX = await import('xlsx');
    
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email || !(session.user as any).tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user by email and tenantId (compound unique key)
    const user = await prisma.user.findUnique({
      where: {
        email_tenantId: {
          email: session.user.email,
          tenantId: (session.user as any).tenantId,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the bill IDs from the request body
    const { billIds } = await req.json();

    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return NextResponse.json(
        { error: "No bills selected for export" },
        { status: 400 }
      );
    }

    // Get the bills with customer details
    const bills = await prisma.bill.findMany({
      where: {
        id: {
          in: billIds,
        },
        userId: user.id, // Ensure bills belong to the current user
      },
      include: {
        customer: {
          select: {
            name: true,
            gstNo: true,
            address: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (bills.length === 0) {
      return NextResponse.json(
        { error: "No valid bills found for export" },
        { status: 404 }
      );
    }

    // Create an array of bill data for export with detailed item info
    const billsData = bills.map(bill => {
      // Get item totals for this bill
      const totalItems = bill.items.reduce((total, item) => total + item.quantity, 0);
      
      // Create a detailed item summary with quantities
      const itemSummaryWithQty = bill.items.map(item => 
        `${item.item.name} (${parseFloat(item.quantity).toFixed(2)} × ₹${item.price.toFixed(2)})`
      ).join(", ");
      
      return {
        'Bill Number': bill.billNumber,
        'Date': new Date(bill.billDate).toLocaleDateString(),
        'Customer': bill.customer.name,
        'Customer GSTIN': bill.customer.gstNo,
        'Customer Address': bill.customer.address,
        'Tax Type': bill.isIGST ? 'IGST' : 'CGST/SGST',
        'Total Items': totalItems,
        'Item Details': itemSummaryWithQty,
        'Subtotal': bill.subtotal,
        'CGST': bill.cgst,
        'SGST': bill.sgst,
        'IGST': bill.igst,
        'Total': bill.total,
      };
    });

    // Create a worksheet for bill summary
    const workbook = XLSX.utils.book_new();
    const billsWorksheet = XLSX.utils.json_to_sheet(billsData);
    
    // Set column widths for better readability
    const billsWsColWidth = [
      { wch: 12 }, // Bill Number
      { wch: 12 }, // Date
      { wch: 20 }, // Customer
      { wch: 20 }, // GSTIN
      { wch: 30 }, // Address
      { wch: 10 }, // Tax Type
      { wch: 10 }, // Total Items
      { wch: 60 }, // Item Details
      { wch: 10 }, // Subtotal
      { wch: 10 }, // CGST
      { wch: 10 }, // SGST
      { wch: 10 }, // IGST
      { wch: 12 }, // Total
    ];
    billsWorksheet['!cols'] = billsWsColWidth;
    
    XLSX.utils.book_append_sheet(workbook, billsWorksheet, 'Bills Summary');

    // Create a more detailed worksheet for bill items
    const itemsData: any[] = [];
    bills.forEach(bill => {
      bill.items.forEach(item => {
        itemsData.push({
          'Bill Number': bill.billNumber,
          'Bill Date': new Date(bill.billDate).toLocaleDateString(),
          'Customer': bill.customer.name,
          'Customer GSTIN': bill.customer.gstNo,
          'Item Name': item.item.name,
          'HSN Code': item.item.hsnCode,
          'Quantity': parseFloat(item.quantity).toFixed(2),
          'Unit Price': item.price.toFixed(2),
          'Amount': item.amount.toFixed(2),
          'Tax Rate': item.item.taxRate + '%',
          'Tax Amount': item.taxAmount.toFixed(2),
          'Total Amount': (item.amount + item.taxAmount).toFixed(2),
        });
      });
    });

    const itemsWorksheet = XLSX.utils.json_to_sheet(itemsData);
    
    // Set column widths for better readability
    const itemsWsColWidth = [
      { wch: 12 }, // Bill Number
      { wch: 12 }, // Bill Date
      { wch: 20 }, // Customer
      { wch: 20 }, // GSTIN
      { wch: 25 }, // Item Name
      { wch: 12 }, // HSN Code
      { wch: 10 }, // Quantity
      { wch: 12 }, // Unit Price
      { wch: 12 }, // Amount
      { wch: 10 }, // Tax Rate
      { wch: 12 }, // Tax Amount
      { wch: 12 }, // Total Amount
    ];
    itemsWorksheet['!cols'] = itemsWsColWidth;
    
    XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Bill Items');

    // Create a third sheet with detailed item analysis
    const itemAnalysisData: any[] = [];
    const itemSummary: Record<string, { 
      name: string, 
      hsnCode: string, 
      totalQuantity: number, 
      totalAmount: number, 
      totalTax: number 
    }> = {};

    // Collect data for item analysis
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const itemKey = item.item.id;
        if (!itemSummary[itemKey]) {
          itemSummary[itemKey] = {
            name: item.item.name,
            hsnCode: item.item.hsnCode,
            totalQuantity: 0,
            totalAmount: 0,
            totalTax: 0
          };
        }
        
        itemSummary[itemKey].totalQuantity += item.quantity;
        itemSummary[itemKey].totalAmount += item.amount;
        itemSummary[itemKey].totalTax += item.taxAmount;
      });
    });

    // Convert to array for the Excel sheet
    Object.values(itemSummary).forEach(item => {
      itemAnalysisData.push({
        'Item Name': item.name,
        'HSN Code': item.hsnCode,
        'Total Quantity': parseFloat(item.totalQuantity).toFixed(2),
        'Total Sales Amount': item.totalAmount.toFixed(2),
        'Total Tax Amount': item.totalTax.toFixed(2),
        'Total Value': (item.totalAmount + item.totalTax).toFixed(2),
        'Average Price': (item.totalAmount / item.totalQuantity).toFixed(2),
      });
    });

    // Sort by total quantity in descending order
    itemAnalysisData.sort((a, b) => b['Total Quantity'] - a['Total Quantity']);

    const itemAnalysisWorksheet = XLSX.utils.json_to_sheet(itemAnalysisData);
    
    // Set column widths for better readability
    const itemAnalysisWsColWidth = [
      { wch: 25 }, // Item Name
      { wch: 15 }, // HSN Code
      { wch: 15 }, // Total Quantity
      { wch: 18 }, // Total Sales Amount
      { wch: 18 }, // Total Tax Amount
      { wch: 15 }, // Total Value
      { wch: 15 }, // Average Price
    ];
    itemAnalysisWorksheet['!cols'] = itemAnalysisWsColWidth;
    
    XLSX.utils.book_append_sheet(workbook, itemAnalysisWorksheet, 'Item Analysis');

    // Create a fourth worksheet specifically for price analysis
    const priceAnalysisData: any[] = [];
    
    // Group items by name and price to analyze price variations
    const priceVariations: Record<string, Record<number, {
      totalQuantity: number,
      occurrences: number,
      billNumbers: string[]
    }>> = {};
    
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const itemName = item.item.name;
        const price = parseFloat(item.price.toFixed(2));
        
        if (!priceVariations[itemName]) {
          priceVariations[itemName] = {};
        }
        
        if (!priceVariations[itemName][price]) {
          priceVariations[itemName][price] = {
            totalQuantity: 0,
            occurrences: 0,
            billNumbers: []
          };
        }
        
        priceVariations[itemName][price].totalQuantity += item.quantity;
        priceVariations[itemName][price].occurrences += 1;
        if (!priceVariations[itemName][price].billNumbers.includes(bill.billNumber)) {
          priceVariations[itemName][price].billNumbers.push(bill.billNumber);
        }
      });
    });
    
    // Convert to array for Excel
    Object.entries(priceVariations).forEach(([itemName, prices]) => {
      // Get price statistics
      const pricePoints = Object.keys(prices).map(p => parseFloat(p));
      const minPrice = Math.min(...pricePoints);
      const maxPrice = Math.max(...pricePoints);
      const priceCount = pricePoints.length;
      
      // Add entry for each price point
      Object.entries(prices).forEach(([price, data]) => {
        priceAnalysisData.push({
          'Item Name': itemName,
          'Unit Price': price,
          'Quantity Sold at This Price': parseFloat(data.totalQuantity).toFixed(2),
          'Number of Sales': data.occurrences,
          'Number of Bills': data.billNumbers.length,
          'Bill Numbers': data.billNumbers.join(", "),
          'Price Variation': priceCount > 1 ? "Yes" : "No",
          'Price Range': priceCount > 1 ? `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}` : "No Variation",
        });
      });
    });
    
    // Sort by item name and then by price
    priceAnalysisData.sort((a, b) => {
      if (a['Item Name'] === b['Item Name']) {
        return parseFloat(a['Unit Price']) - parseFloat(b['Unit Price']);
      }
      return a['Item Name'].localeCompare(b['Item Name']);
    });
    
    const priceAnalysisWorksheet = XLSX.utils.json_to_sheet(priceAnalysisData);
    
    // Set column widths for the price analysis worksheet
    const priceAnalysisWsColWidth = [
      { wch: 25 }, // Item Name
      { wch: 12 }, // Unit Price
      { wch: 25 }, // Quantity Sold at This Price
      { wch: 15 }, // Number of Sales
      { wch: 15 }, // Number of Bills
      { wch: 30 }, // Bill Numbers
      { wch: 15 }, // Price Variation
      { wch: 20 }, // Price Range
    ];
    priceAnalysisWorksheet['!cols'] = priceAnalysisWsColWidth;
    
    XLSX.utils.book_append_sheet(workbook, priceAnalysisWorksheet, 'Price Analysis');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="bills-export.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error exporting bills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 