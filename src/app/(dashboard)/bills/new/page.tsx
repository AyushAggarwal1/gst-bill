"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiPlus, FiTrash } from "react-icons/fi";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { FormSuccess } from "@/components/ui/FormSuccess";

// Define types
type Customer = {
  id: string;
  name: string;
  address: string;
  gstNo: string | null;
};

type Item = {
  id: string;
  name: string;
  hsnCode: string;
  gstPercentage: number;
};

// Form schema
const billItemSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Quantity must be a positive number",
  }),
  rate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Rate must be a positive number",
  }),
  amount: z.string(),
  taxAmount: z.string(),
  totalAmount: z.string(),
});

const formSchema = z.object({
  invoiceNo: z.string().min(1, "Invoice number is required"),
  date: z.string().min(1, "Date is required"),
  customerId: z.string().min(1, "Customer is required"),
  items: z.array(billItemSchema).min(1, "At least one item is required"),
  totalAmount: z.string(),
  totalTax: z.string(),
  grandTotal: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewBillPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNo: "",
      date: new Date().toISOString().split("T")[0],
      customerId: "",
      items: [{ itemId: "", quantity: "1", rate: "0", amount: "0", taxAmount: "0", totalAmount: "0" }],
      totalAmount: "0",
      totalTax: "0",
      grandTotal: "0",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watch form values for calculations
  const watchItems = watch("items");
  const watchCustomerId = watch("customerId");

  // Load customers and items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, itemsResponse] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/items"),
        ]);

        const customersData = await customersResponse.json();
        const itemsData = await itemsResponse.json();

        setCustomers(customersData.customers || []);
        setItems(itemsData.items || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load customers or items");
      }
    };

    fetchData();
  }, []);

  // Update selected customer when customerId changes
  useEffect(() => {
    if (watchCustomerId && customers.length > 0) {
      const customer = customers.find((c) => c.id === watchCustomerId);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [watchCustomerId, customers]);

  // Calculate totals when items change
  useEffect(() => {
    if (watchItems.length > 0) {
      let totalAmount = 0;
      let totalTax = 0;
      let grandTotal = 0;

      watchItems.forEach((item, index) => {
        if (item.itemId && item.quantity && item.rate) {
          const selectedItem = items.find((i) => i.id === item.itemId);
          if (selectedItem) {
            const quantity = Number(item.quantity);
            const rate = Number(item.rate);
            const amount = quantity * rate;
            const taxAmount = (amount * selectedItem.gstPercentage) / 100;
            const itemTotal = amount + taxAmount;

            // Update calculated fields
            setValue(`items.${index}.amount`, amount.toFixed(2));
            setValue(`items.${index}.taxAmount`, taxAmount.toFixed(2));
            setValue(`items.${index}.totalAmount`, itemTotal.toFixed(2));

            totalAmount += amount;
            totalTax += taxAmount;
            grandTotal += itemTotal;
          }
        }
      });

      setValue("totalAmount", totalAmount.toFixed(2));
      setValue("totalTax", totalTax.toFixed(2));
      setValue("grandTotal", grandTotal.toFixed(2));
    }
  }, [watchItems, items, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      setError("");
      setSuccess("");
      setIsLoading(true);

      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create bill");
      }

      setSuccess("Bill created successfully!");
      
      setTimeout(() => {
        router.push(`/bills/${responseData.bill.id}`);
        router.refresh();
      }, 1500);
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    append({ itemId: "", quantity: "1", rate: "0", amount: "0", taxAmount: "0", totalAmount: "0" });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Bill</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Bill header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Invoice No"
              {...register("invoiceNo")}
              error={errors.invoiceNo?.message}
              disabled={isLoading}
            />

            <Input
              label="Date"
              type="date"
              {...register("date")}
              error={errors.date?.message}
              disabled={isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.customerId ? "border-red-500" : "border-gray-300"
                }`}
                {...register("customerId")}
                disabled={isLoading}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerId.message}
                </p>
              )}
            </div>
          </div>

          {/* Customer details */}
          {selectedCustomer && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Customer Details</h3>
              <p className="text-sm">{selectedCustomer.address}</p>
              {selectedCustomer.gstNo && (
                <p className="text-sm mt-1">GST No: {selectedCustomer.gstNo}</p>
              )}
            </div>
          )}

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Items</h3>
              <Button
                type="button"
                size="sm"
                onClick={addItem}
                disabled={isLoading}
              >
                <FiPlus className="mr-1" /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Quantity
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
                      GST Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((field, index) => {
                    const selectedItemId = watchItems[index]?.itemId;
                    const selectedItem = items.find((i) => i.id === selectedItemId);
                    
                    return (
                      <tr key={field.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.items?.[index]?.itemId ? "border-red-500" : "border-gray-200"
                            }`}
                            {...register(`items.${index}.itemId` as const)}
                            disabled={isLoading}
                          >
                            <option value="">Select an item</option>
                            {items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.gstPercentage}% GST)
                              </option>
                            ))}
                          </select>
                          {errors.items?.[index]?.itemId && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.items?.[index]?.itemId?.message}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            className={`w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.items?.[index]?.quantity ? "border-red-500" : "border-gray-200"
                            }`}
                            min="1"
                            {...register(`items.${index}.quantity` as const)}
                            disabled={isLoading}
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.items?.[index]?.quantity?.message}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            className={`w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors.items?.[index]?.rate ? "border-red-500" : "border-gray-200"
                            }`}
                            step="0.01"
                            min="0"
                            {...register(`items.${index}.rate` as const)}
                            disabled={isLoading}
                          />
                          {errors.items?.[index]?.rate && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.items?.[index]?.rate?.message}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ₹{watchItems[index]?.amount || "0.00"}
                          <input type="hidden" {...register(`items.${index}.amount` as const)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ₹{watchItems[index]?.taxAmount || "0.00"}
                          {selectedItem && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({selectedItem.gstPercentage}%)
                            </span>
                          )}
                          <input type="hidden" {...register(`items.${index}.taxAmount` as const)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          ₹{watchItems[index]?.totalAmount || "0.00"}
                          <input type="hidden" {...register(`items.${index}.totalAmount` as const)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900"
                              onClick={() => remove(index)}
                              disabled={isLoading}
                            >
                              <FiTrash size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {errors.items && errors.items.root && (
              <p className="mt-2 text-sm text-red-600">
                {errors.items.root.message}
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end space-y-2 border-t pt-4">
            <div className="flex justify-between w-64">
              <span className="text-gray-600">Subtotal:</span>
              <span>₹{watch("totalAmount")}</span>
              <input type="hidden" {...register("totalAmount")} />
            </div>
            <div className="flex justify-between w-64">
              <span className="text-gray-600">Total Tax:</span>
              <span>₹{watch("totalTax")}</span>
              <input type="hidden" {...register("totalTax")} />
            </div>
            <div className="flex justify-between w-64 font-bold">
              <span>Grand Total:</span>
              <span>₹{watch("grandTotal")}</span>
              <input type="hidden" {...register("grandTotal")} />
            </div>
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/bills")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Bill
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 