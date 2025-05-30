// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation"; // Import useParams
// import Link from "next/link";
// import Spinner from "@/components/Spinner";
// import { DeleteIcon } from "@/components/icons"; // Assuming DeleteIcon is used for removing items

// interface Customer {
//   id: string;
//   name: string;
//   gstNo: string;
// }

// interface Item {
//   id: string;
//   name: string;
//   hsnCode: string;
//   taxRate: number;
// }

// interface BillItem {
//   itemId: string;
//   name: string;
//   hsnCode: string;
//   taxRate: number;
//   quantity: number;
//   price: number;
//   amount: number;
//   taxAmount: number;
//   // For existing items, we might have an id from the database
//   id?: string; 
// }

// interface BillData {
//   billNumber: string;
//   billDate: string;
//   customerId: string;
//   isIGST: boolean;
//   deliveryAddress: string;
//   // For existing bills, we might have an id
//   id?: string;
//   items?: BillItem[]; // For fetching
// }

// export default function EditBillPage() {
//   const router = useRouter();
//   const params = useParams();
//   const billId = params?.id as string; // Assuming the folder is [id]

//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [items, setItems] = useState<Item[]>([]);
//   const [billItems, setBillItems] = useState<BillItem[]>([]);
  
//   const [loading, setLoading] = useState(true); // For initial data load
//   const [pageError, setPageError] = useState<string | null>(null); // For critical page load errors
//   const [formError, setFormError] = useState(""); // For form validation errors

//   const [saveLoading, setSaveLoading] = useState(false);
  
//   const [billData, setBillData] = useState<BillData>({
//     billNumber: "",
//     billDate: "", // Will be set from fetched data
//     customerId: "",
//     isIGST: false,
//     deliveryAddress: "",
//   });

//   const [newItem, setNewItem] = useState({
//     itemId: "",
//     quantity: 0,
//     price: 0,
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!billId) {
//         setPageError("Bill ID is missing.");
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);
//         setPageError(null);

//         // Fetch customers and items (similar to NewBillPage)
//         const customersRes = await fetch("/api/customers");
//         if (!customersRes.ok) throw new Error("Failed to fetch customers");
//         const customersData = await customersRes.json();
//         setCustomers(customersData.sort((a: Customer, b: Customer) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())));

//         const itemsRes = await fetch("/api/items");
//         if (!itemsRes.ok) throw new Error("Failed to fetch items");
//         const itemsData = await itemsRes.json();
//         setItems(itemsData.sort((a: Item, b: Item) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())));

//         // Fetch the specific bill to edit
//         const billRes = await fetch(`/api/bills/${billId}`);
//         if (!billRes.ok) {
//           if (billRes.status === 404) {
//             throw new Error("Bill not found. It may have been deleted.");
//           }
//           throw new Error("Failed to fetch bill data");
//         }
//         const existingBill: BillData & { items: BillItem[] } = await billRes.json();
        
//         setBillData({
//           id: existingBill.id,
//           billNumber: existingBill.billNumber,
//           billDate: existingBill.billDate ? new Date(existingBill.billDate).toISOString().split("T")[0] : "",
//           customerId: existingBill.customerId,
//           isIGST: existingBill.isIGST,
//           deliveryAddress: existingBill.deliveryAddress || "",
//         });

//         // Transform fetched items to BillItem structure for the form
//         const fetchedBillItems = existingBill.items.map(item => {
//             const masterItem = itemsData.find((i: Item) => i.id === item.itemId);
//             const amount = (item.quantity || 0) * (item.price || 0);
//             const taxAmount = masterItem ? (amount * masterItem.taxRate) / 100 : 0;
//             return {
//                 ...item, // Includes itemId, quantity, price, and potentially its own DB id
//                 name: masterItem?.name || 'N/A',
//                 hsnCode: masterItem?.hsnCode || 'N/A',
//                 taxRate: masterItem?.taxRate || 0,
//                 amount,
//                 taxAmount
//             };
//         });
//         setBillItems(fetchedBillItems);

//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setPageError(err instanceof Error ? err.message : "Failed to load bill data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [billId]); // Re-fetch if billId changes (though unlikely for an edit page)

//   const handleBillDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target as HTMLInputElement;
//     setBillData(prev => ({
//       ...prev,
//       [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
//     }));
//   };

//   const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setNewItem(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const addItemToBill = () => {
//     if (!newItem.itemId || newItem.quantity <= 0 || newItem.price < 0) {
//       setFormError("Please select an item, and specify a valid quantity and price.");
//       return;
//     }
//     const selectedItem = items.find(item => item.id === newItem.itemId);
//     if (!selectedItem) {
//       setFormError("Selected item not found. Please refresh or check item list.");
//       return;
//     }
//     const quantity = Number(newItem.quantity);
//     const price = Number(newItem.price);
//     const amount = quantity * price;
//     const taxAmount = (amount * selectedItem.taxRate) / 100;

//     const billItemToAdd: BillItem = {
//       itemId: selectedItem.id,
//       name: selectedItem.name,
//       hsnCode: selectedItem.hsnCode,
//       taxRate: selectedItem.taxRate,
//       quantity,
//       price,
//       amount,
//       taxAmount,
//     };
//     setBillItems(prev => [...prev, billItemToAdd]);
//     setNewItem({ itemId: "", quantity: 0, price: 0 }); // Reset
//     setFormError("");
//   };

//   const removeItem = (index: number) => {
//     setBillItems(prev => prev.filter((_, i) => i !== index));
//   };

//   const subtotal = billItems.reduce((sum, item) => sum + (item.amount || 0), 0);
//   const totalTax = billItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
//   const cgst = billData.isIGST ? 0 : totalTax / 2;
//   const sgst = billData.isIGST ? 0 : totalTax / 2;
//   const igst = billData.isIGST ? totalTax : 0;
//   const grandTotal = subtotal + totalTax;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormError(""); // Clear previous errors
//     if (billItems.length === 0) return setFormError("Please add at least one item to the bill.");
//     if (!billData.customerId) return setFormError("Please select a customer.");
//     if (!billData.billNumber) return setFormError("Bill number is required.");
//     if (!billId) return setFormError("Bill ID is missing. Cannot update.");

//     setSaveLoading(true);
//     try {
//       const updatedBillPayload = {
//         ...billData,
//         items: billItems.map(item => ({ // Only send necessary fields for update/create
//           id: item.id, // Include if you want to update existing items by their DB ID
//           itemId: item.itemId,
//           quantity: item.quantity,
//           price: item.price,
//         })),
//       };
//       // Remove id from top level billData as it's in the URL, not body for PUT
//       delete updatedBillPayload.id;


//       const res = await fetch(`/api/bills/${billId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedBillPayload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to update bill");
//       router.push("/dashboard/bills"); // Or router.push(`/dashboard/bills/${billId}`) to view
//     } catch (err) {
//       console.error("Error updating bill:", err);
//       setFormError(err instanceof Error ? err.message : "Failed to update bill. An unknown error occurred.");
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   if (loading) return <Spinner />;
//   if (pageError) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
//         <div class="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
//             <h2 class="text-2xl font-semibold text-red-600 mb-4">Error Loading Bill</h2>
//             <p class="text-gray-700 mb-6">{pageError}</p>
//             <Link href="/dashboard/bills"
 