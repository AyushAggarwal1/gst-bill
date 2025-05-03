"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EditCustomerPageProps {
  params: {
    id: string;
  };
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    deliveryAddress: "",
    gstNo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${params.id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch customer");
        }

        const data = await res.json();
        setCustomer({
          name: data.name,
          address: data.address,
          deliveryAddress: data.deliveryAddress,
          gstNo: data.gstNo,
        });
      } catch (error) {
        console.error("Error fetching customer:", error);
        setError("Failed to load customer. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSameAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCustomer((prev) => ({
        ...prev,
        deliveryAddress: prev.address,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/customers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update customer");
      }

      router.push("/dashboard/customers");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update customer"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
          </div>
        </header>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-12">Loading customer data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
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
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Customer Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="organization"
                        required
                        value={customer.name}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Business Address
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        required
                        value={customer.address}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div className="flex items-center">
                      <label
                        htmlFor="deliveryAddress"
                        className="block text-sm font-medium text-gray-700 mr-3"
                      >
                        Delivery Address
                      </label>
                      <div className="flex items-center h-5">
                        <input
                          id="sameAsBusiness"
                          name="sameAsBusiness"
                          type="checkbox"
                          onChange={handleSameAddress}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="sameAsBusiness"
                          className="ml-2 text-xs text-gray-500"
                        >
                          Same as business address
                        </label>
                      </div>
                    </div>
                    <div className="mt-1">
                      <textarea
                        id="deliveryAddress"
                        name="deliveryAddress"
                        rows={3}
                        required
                        value={customer.deliveryAddress}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="gstNo"
                      className="block text-sm font-medium text-gray-700"
                    >
                      GST Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="gstNo"
                        id="gstNo"
                        required
                        pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                        title="Please enter a valid GST Number (e.g., 22AAAAA0000A1Z5)"
                        value={customer.gstNo}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Format: 22AAAAA0000A1Z5
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <Link
                  href="/dashboard/customers"
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 