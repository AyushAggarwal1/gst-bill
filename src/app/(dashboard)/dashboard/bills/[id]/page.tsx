"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

// Helper function to convert number to words
function numberToWords(num: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertLessThanOneThousand(num: number): string {
    if (num === 0) {
      return '';
    }
    if (num < 20) {
      return units[num];
    }
    if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');
    }
    return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertLessThanOneThousand(num % 100) : '');
  }

  if (num === 0) {
    return 'Zero';
  }

  // Get integer and decimal parts
  let rupeesValue = Math.floor(num);
  const paise = Math.round((num - rupeesValue) * 100);

  let result = '';
  
  if (rupeesValue > 0) {
    if (rupeesValue >= 10000000) {
      result += convertLessThanOneThousand(Math.floor(rupeesValue / 10000000)) + ' Crore ';
      rupeesValue %= 10000000;
    }
    
    if (rupeesValue >= 100000) {
      result += convertLessThanOneThousand(Math.floor(rupeesValue / 100000)) + ' Lakh ';
      rupeesValue %= 100000;
    }
    
    if (rupeesValue >= 1000) {
      result += convertLessThanOneThousand(Math.floor(rupeesValue / 1000)) + ' Thousand ';
      rupeesValue %= 1000;
    }
    
    if (rupeesValue > 0) {
      result += convertLessThanOneThousand(rupeesValue);
    }
    
    result += ' Rupees';
  }
  
  if (paise > 0) {
    result += (rupeesValue > 0 ? ' and ' : '') + convertLessThanOneThousand(paise) + ' Paise';
  }
  
  return result + ' Only';
}

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
  deliveryAddress: string | null;
}

interface Profile {
  firmName: string;
  address: string;
  gstNo: string;
  phoneNo: string | null;
  bankDetails: string | null;
}

export default function BillDetailPage({ params }: BillParams) {
  const router = useRouter();
  const { id } = params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // @ayushaggarwal1 -- this is for the share dropdown
  // const [showShareDropdown, setShowShareDropdown] = useState(false);
  // const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bill data
        const billRes = await fetch(`/api/bills/${id}`);
        if (!billRes.ok) {
          throw new Error("Failed to fetch bill");
        }
        const billData = await billRes.json();
        setBill(billData);

        // Fetch profile data
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle printing with a dedicated function
  const handlePrint = async () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice');
      return;
    }
    
    try {
      // Fetch the HTML template
      const templateResponse = await fetch('/templates/billFormat.html');
      if (!templateResponse.ok) {
        throw new Error('Failed to load template');
      }
      
      let htmlTemplate = await templateResponse.text();
    
    // Get tax rate safely
    const taxRate = bill?.items && bill.items.length > 0 ? bill.items[0].item.taxRate : 0;
    
      // Generate items table HTML
      const itemsTableHTML = bill?.items.map((item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.item.name}</td>
                  <td>${item.item.hsnCode}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${item.price.toFixed(2)}</td>
                  <td class="text-right">₹${item.amount.toFixed(2)}</td>
                  <td class="text-center">${item.item.taxRate}%</td>
                  <td class="text-right">₹${item.taxAmount.toFixed(2)}</td>
                </tr>
      `).join('') || '';
      
      // Generate tax rows HTML
      const taxRowsHTML = bill?.isIGST ? `
                <tr>
                  <td>IGST (${taxRate}%):</td>
                  <td>₹${bill?.igst.toFixed(2) || '0.00'}</td>
                </tr>
              ` : `
                <tr>
                  <td>CGST (${taxRate / 2}%):</td>
                  <td>₹${bill?.cgst.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                  <td>SGST (${taxRate / 2}%):</td>
                  <td>₹${bill?.sgst.toFixed(2) || '0.00'}</td>
                </tr>
      `;
      
      // Generate bank details HTML
      const bankDetailsHTML = profile?.bankDetails ? `
            <div class="bank-details">
              <h3>Bank Details</h3>
          <p>${(profile.bankDetails || '').replace(/\n/g, '<br>')}</p>
            </div>
      ` : '';
      
      // Generate delivery address HTML
      const deliveryAddressHTML = bill?.deliveryAddress ? `
        <div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
          <p style="font-weight: 600;">Delivery Address:</p>
          <p>${(bill.deliveryAddress).replace(/\n/g, '<br>')}</p>
        </div>
      ` : '';
      
      // Replace template placeholders with actual data
      const printContent = htmlTemplate
        .replace(/{{BILL_NUMBER}}/g, bill?.billNumber || '')
        .replace(/{{BILL_DATE}}/g, format(new Date(bill?.billDate || new Date()), "dd/MM/yyyy"))
        .replace(/{{TAX_TYPE}}/g, bill?.isIGST ? "IGST" : "CGST/SGST")
        .replace(/{{COMPANY_NAME}}/g, profile?.firmName || '')
        .replace(/{{COMPANY_ADDRESS}}/g, (profile?.address || '').replace(/\n/g, '<br>'))
        .replace(/{{COMPANY_GST}}/g, profile?.gstNo || '')
        .replace(/{{COMPANY_PHONE}}/g, profile?.phoneNo ? `<p>Phone: ${profile.phoneNo}</p>` : '')
        .replace(/{{CUSTOMER_NAME}}/g, bill?.customer.name || '')
        .replace(/{{CUSTOMER_ADDRESS}}/g, (bill?.customer.address || '').replace(/\n/g, '<br>'))
        .replace(/{{CUSTOMER_GST}}/g, bill?.customer.gstNo || '')
        .replace(/{{DELIVERY_ADDRESS}}/g, deliveryAddressHTML)
        .replace(/{{ITEMS_TABLE}}/g, itemsTableHTML)
        .replace(/{{SUBTOTAL}}/g, bill?.subtotal.toFixed(2) || '0.00')
        .replace(/{{TAX_ROWS}}/g, taxRowsHTML)
        .replace(/{{TOTAL}}/g, bill?.total.toFixed(2) || '0.00')
        .replace(/{{AMOUNT_IN_WORDS}}/g, numberToWords(bill?.total || 0))
        .replace(/{{BANK_DETAILS}}/g, bankDetailsHTML);
    
    // Write the content to the new window and print it
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Give the browser a moment to render before printing
    setTimeout(() => {
      printWindow.print();
      // Don't close the window automatically to allow user to review
    }, 800);
      
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load print template. Please try again.');
      printWindow.close();
    }
  };


// @ayushaggarwal1 -- function used to create blob of pdf for sharing in cache memory

//   // Generate PDF blob for sharing
//   const generatePDFBlob = async (): Promise<Blob> => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const htmlContent = await generateBillHTML();
        
//         // Create a new window for PDF generation
//         const printWindow = window.open('', '_blank');
//         if (!printWindow) {
//           reject(new Error('Pop-up blocked'));
//           return;
//         }
        
//         // Modify the HTML to include the desired filename in the title
//         const modifiedHtmlContent = htmlContent.replace(
//           /<title>.*?<\/title>/,
//           `<title>Invoice_${bill?.billNumber}</title>`
//         );
        
//         // Write content to the new window
//         printWindow.document.write(modifiedHtmlContent);
//         printWindow.document.close();
        
//         // Wait for content to load
//         setTimeout(() => {
//           printWindow.focus();
          
//           // For now, we'll use the print approach and create a blob from HTML
//           // Note: True PDF generation would require a library like jsPDF or Puppeteer
//           const htmlBlob = new Blob([modifiedHtmlContent], { type: 'text/html' });
//           printWindow.close();
//           resolve(htmlBlob);
//         }, 1000);
        
//       } catch (error) {
//         reject(error);
//       }
//     });
//   };

//   // Generate HTML content for sharing (reusable function)
//   const generateBillHTML = async () => {
//     try {
//       // Fetch the HTML template
//       const templateResponse = await fetch('/templates/billFormat.html');
//       if (!templateResponse.ok) {
//         throw new Error('Failed to load template');
//       }
      
//       let htmlTemplate = await templateResponse.text();
      
//       // Get tax rate safely
//       const taxRate = bill?.items && bill.items.length > 0 ? bill.items[0].item.taxRate : 0;
      
//       // Generate items table HTML
//       const itemsTableHTML = bill?.items.map((item, index) => `
//         <tr>
//           <td class="text-center">${index + 1}</td>
//           <td>${item.item.name}</td>
//           <td>${item.item.hsnCode}</td>
//           <td class="text-center">${item.quantity}</td>
//           <td class="text-right">₹${item.price.toFixed(2)}</td>
//           <td class="text-right">₹${item.amount.toFixed(2)}</td>
//           <td class="text-center">${item.item.taxRate}%</td>
//           <td class="text-right">₹${item.taxAmount.toFixed(2)}</td>
//         </tr>
//       `).join('') || '';
      
//       // Generate tax rows HTML
//       const taxRowsHTML = bill?.isIGST ? `
//         <tr>
//           <td>IGST (${taxRate}%):</td>
//           <td>₹${bill?.igst.toFixed(2) || '0.00'}</td>
//         </tr>
//       ` : `
//         <tr>
//           <td>CGST (${taxRate / 2}%):</td>
//           <td>₹${bill?.cgst.toFixed(2) || '0.00'}</td>
//         </tr>
//         <tr>
//           <td>SGST (${taxRate / 2}%):</td>
//           <td>₹${bill?.sgst.toFixed(2) || '0.00'}</td>
//         </tr>
//       `;
      
//       // Generate bank details HTML
//       const bankDetailsHTML = profile?.bankDetails ? `
//         <div class="bank-details">
//           <h3>Bank Details</h3>
//           <p>${(profile.bankDetails || '').replace(/\n/g, '<br>')}</p>
//         </div>
//       ` : '';
      
//       // Generate delivery address HTML
//       const deliveryAddressHTML = bill?.deliveryAddress ? `
//         <div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
//           <p style="font-weight: 600;">Delivery Address:</p>
//           <p>${(bill.deliveryAddress).replace(/\n/g, '<br>')}</p>
//         </div>
//       ` : '';
      
//       // Replace template placeholders with actual data
//       const htmlContent = htmlTemplate
//         .replace(/{{BILL_NUMBER}}/g, bill?.billNumber || '')
//         .replace(/{{BILL_DATE}}/g, format(new Date(bill?.billDate || new Date()), "dd/MM/yyyy"))
//         .replace(/{{TAX_TYPE}}/g, bill?.isIGST ? "IGST" : "CGST/SGST")
//         .replace(/{{COMPANY_NAME}}/g, profile?.firmName || '')
//         .replace(/{{COMPANY_ADDRESS}}/g, (profile?.address || '').replace(/\n/g, '<br>'))
//         .replace(/{{COMPANY_GST}}/g, profile?.gstNo || '')
//         .replace(/{{COMPANY_PHONE}}/g, profile?.phoneNo ? `<p>Phone: ${profile.phoneNo}</p>` : '')
//         .replace(/{{CUSTOMER_NAME}}/g, bill?.customer.name || '')
//         .replace(/{{CUSTOMER_ADDRESS}}/g, (bill?.customer.address || '').replace(/\n/g, '<br>'))
//         .replace(/{{CUSTOMER_GST}}/g, bill?.customer.gstNo || '')
//         .replace(/{{DELIVERY_ADDRESS}}/g, deliveryAddressHTML)
//         .replace(/{{ITEMS_TABLE}}/g, itemsTableHTML)
//         .replace(/{{SUBTOTAL}}/g, bill?.subtotal.toFixed(2) || '0.00')
//         .replace(/{{TAX_ROWS}}/g, taxRowsHTML)
//         .replace(/{{TOTAL}}/g, bill?.total.toFixed(2) || '0.00')
//         .replace(/{{AMOUNT_IN_WORDS}}/g, numberToWords(bill?.total || 0))
//         .replace(/{{BANK_DETAILS}}/g, bankDetailsHTML);
      
//       return htmlContent;
//     } catch (error) {
//       console.error('Error generating bill HTML:', error);
//       throw error;
//     }
//   };

// @ayushaggarwal1 -- function used to share the bill via whatsapp

//   // Handle WhatsApp sharing
//   const handleWhatsAppShare = async () => {
//     console.log('WhatsApp share clicked');
//     setIsGeneratingPDF(true);
    
//     try {
//       const message = `Invoice #${bill?.billNumber}\nDate: ${format(new Date(bill?.billDate || new Date()), "dd/MM/yyyy")}\nCustomer: ${bill?.customer.name}\nTotal: ₹${bill?.total.toFixed(2)}`;
      
//       // Check if Web Share API is available (mainly on mobile)
//       if (navigator.share) {
//         try {
//           // Generate PDF blob
//           const pdfBlob = await generatePDFBlob();
//           const pdfFile = new File([pdfBlob], `Invoice_${bill?.billNumber}.html`, { type: 'text/html' });
          
//           await navigator.share({
//             title: `Invoice #${bill?.billNumber}`,
//             text: message,
//             files: [pdfFile]
//           });
          
//           console.log('Shared successfully via Web Share API');
//         } catch (shareError) {
//           console.log('Web Share API failed, falling back to URL method');
//           // Fallback to URL method
//           const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + '\n\nPDF will be generated separately.')}`;
//           window.open(whatsappUrl, '_blank');
          
//           // Also trigger PDF download
//           setTimeout(() => {
//             handleSaveToFile(true);
//           }, 1000);
//         }
//       } else {
//         // Fallback for desktop browsers
//         console.log('Web Share API not available, using fallback method');
        
//         // Generate and download PDF first
//         await handleSaveToFile(true);
        
//         // Then open WhatsApp
//         setTimeout(() => {
//           const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + '\n\nPlease attach the downloaded PDF: Invoice_' + bill?.billNumber + '.pdf')}`;
//           const newWindow = window.open(whatsappUrl, '_blank');
//           if (!newWindow) {
//             alert('Please allow pop-ups to share to WhatsApp');
//           }
//         }, 2000);
//       }
//     } catch (error) {
//       console.error('Error sharing to WhatsApp:', error);
//       alert('Failed to share to WhatsApp. Please try again.');
//     } finally {
//       setIsGeneratingPDF(false);
//     }
//   };

// @ayushaggarwal1 -- function used to share the bill via email

//   // Handle Email sharing
//   const handleEmailShare = async () => {
//     console.log('Email share clicked');
//     setIsGeneratingPDF(true);
    
//     try {
//       const subject = `Invoice #${bill?.billNumber} - ${profile?.firmName}`;
//       const body = `Dear ${bill?.customer.name},

// Please find the invoice details below:

// Invoice Number: ${bill?.billNumber}
// Date: ${format(new Date(bill?.billDate || new Date()), "dd/MM/yyyy")}
// Total Amount: ₹${bill?.total.toFixed(2)}

// Thank you for your business.

// Best regards,
// ${profile?.firmName}`;

//       // Check if Web Share API is available (mainly on mobile)
//       if (navigator.share) {
//         try {
//           // Generate PDF blob
//           const pdfBlob = await generatePDFBlob();
//           const pdfFile = new File([pdfBlob], `Invoice_${bill?.billNumber}.html`, { type: 'text/html' });
          
//           await navigator.share({
//             title: subject,
//             text: body,
//             files: [pdfFile]
//           });
          
//           console.log('Shared successfully via Web Share API');
//         } catch (shareError) {
//           console.log('Web Share API failed, falling back to mailto');
//           // Fallback to mailto
//           const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\nPDF will be generated separately.')}`;
//           window.location.href = mailtoUrl;
          
//           // Also trigger PDF download
//           setTimeout(() => {
//             handleSaveToFile(true);
//           }, 1000);
//         }
//       } else {
//         // Fallback for desktop browsers
//         console.log('Web Share API not available, using mailto fallback');
        
//         // Generate and download PDF first
//         await handleSaveToFile(true);
        
//         // Then open email client
//         setTimeout(() => {
//           const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\nPlease attach the downloaded PDF: Invoice_' + bill?.billNumber + '.pdf')}`;
//           window.location.href = mailtoUrl;
//         }, 2000);
//       }
//     } catch (error) {
//       console.error('Error sharing via email:', error);
//       alert('Failed to open email client. Please try again.');
//     } finally {
//       setIsGeneratingPDF(false);
//     }
//   };

// @ayushaggarwal1 -- function used to save the bill as pdf

//   // Handle Save to File (PDF)
//   const handleSaveToFile = async (silent = false) => {
//     if (!silent) console.log('Save to file clicked');
//     try {
//       console.log('Generating HTML content...');
//       const htmlContent = await generateBillHTML();
//       console.log('HTML content generated successfully');
      
//       // Create a new window for PDF generation
//       const printWindow = window.open('', '_blank');
//       if (!printWindow) {
//         if (!silent) alert('Please allow pop-ups to save the PDF');
//         throw new Error('Pop-up blocked');
//       }
      
//       // Modify the HTML to include the desired filename in the title
//       const modifiedHtmlContent = htmlContent.replace(
//         /<title>.*?<\/title>/,
//         `<title>Invoice_${bill?.billNumber}</title>`
//       );
      
//       // Write content to the new window
//       printWindow.document.write(modifiedHtmlContent);
//       printWindow.document.close();
      
//       // Return a promise that resolves when PDF generation is initiated
//       return new Promise<void>((resolve) => {
//         // Wait for content to load, then trigger print dialog
//         setTimeout(() => {
//           printWindow.focus();
          
//           // Try to use the newer print API if available
//           if ('print' in printWindow) {
//             printWindow.print();
//           }
          
//           // Show instructions to user
//           if (!silent) {
//             alert(`Please choose "Save as PDF" in the print dialog and save as: Invoice_${bill?.billNumber}.pdf`);
//           }
          
//           // Close the window after a delay to allow printing
//           setTimeout(() => {
//             printWindow.close();
//             resolve();
//           }, 2000);
//         }, 800);
//       });
      
//     } catch (error) {
//       console.error('Error saving PDF:', error);
//       if (!silent) alert('Failed to generate PDF. Please try again.');
//       throw error;
//     }
//   };

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
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Save PDF
            </button>
            
            {/* Share Button with Dropdown
            <div className="relative share-dropdown-container">
              <button
                onClick={() => {
                  console.log('Share button clicked, current dropdown state:', showShareDropdown);
                  setShowShareDropdown(!showShareDropdown);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Share
                <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showShareDropdown && (() => {
                console.log('Dropdown is being rendered');
                return (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  >
                    {isGeneratingPDF && (
                      <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating PDF...
                        </div>
                      </div>
                    )}
                    <div className="py-1" role="menu">
                      <button
                        onClick={(e) => {
                          console.log('WhatsApp button clicked');
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isGeneratingPDF) {
                            handleWhatsAppShare();
                            setShowShareDropdown(false);
                          }
                        }}
                        disabled={isGeneratingPDF}
                        className={`flex items-center w-full px-4 py-2 text-sm ${isGeneratingPDF ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        role="menuitem"
                      >
                        <svg className="mr-3 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                        </svg>
                        Send to WhatsApp
                      </button>
                      <button
                        onClick={(e) => {
                          console.log('Email button clicked');
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isGeneratingPDF) {
                            handleEmailShare();
                            setShowShareDropdown(false);
                          }
                        }}
                        disabled={isGeneratingPDF}
                        className={`flex items-center w-full px-4 py-2 text-sm ${isGeneratingPDF ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        role="menuitem"
                      >
                        <svg className="mr-3 h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Email
                      </button>
                      <button
                        onClick={(e) => {
                          console.log('Save to file button clicked');
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isGeneratingPDF) {
                            handleSaveToFile();
                            setShowShareDropdown(false);
                          }
                        }}
                        disabled={isGeneratingPDF}
                        className={`flex items-center w-full px-4 py-2 text-sm ${isGeneratingPDF ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        role="menuitem"
                      >
                        <svg className="mr-3 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Save as PDF
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div> */}
            
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-full">
        <div className="px-4 py-6 sm:px-0 print:p-0">
          {/* Bill Content for Print and View */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg print:shadow-none print:rounded-none">
            <div className="px-4 py-5 sm:p-6 print:p-4">
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
                {profile && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Company Details</h3>
                    <p className="text-sm font-medium">{profile.firmName}</p>
                    <p className="text-sm text-gray-500 whitespace-pre-line">{profile.address}</p>
                    <p className="text-sm text-gray-500">GSTIN: {profile.gstNo}</p>
                    {profile.phoneNo && <p className="text-sm text-gray-500">Phone: {profile.phoneNo}</p>}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Details</h3>
                  <p className="text-sm font-medium">{bill.customer.name}</p>
                  <p className="text-sm text-gray-500 whitespace-pre-line">{bill.customer.address}</p>
                  <p className="text-sm text-gray-500">GSTIN: {bill.customer.gstNo}</p>
                  
                  {bill.deliveryAddress && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700">Delivery Address:</p>
                      <p className="text-sm text-gray-500 whitespace-pre-line">{bill.deliveryAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          S.No.
                        </th>
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
                      {bill.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                            {index + 1}
                          </td>
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
              
              {/* Amount in Words Section */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Amount in words:</span> {numberToWords(bill.total)}
                </p>
              </div>

              {/* Bank Details Section */}
              {profile && profile.bankDetails && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bank Details</h3>
                  <p className="text-sm text-gray-500 whitespace-pre-line">{profile.bankDetails}</p>
                </div>
              )}

              {/* Footer Note */}
              <div className="mt-8 border-t border-gray-200 pt-4 text-center">
                <p className="text-sm text-gray-500">This is a system generated invoice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 