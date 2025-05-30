"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewItemPage() {
  const router = useRouter();
  const [item, setItem] = useState({
    name: "",
    hsnCode: "",
    taxRate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Convert taxRate to number
    const taxRateFloat = parseFloat(item.taxRate);
    if (isNaN(taxRateFloat)) {
      setError("Tax Rate must be a valid number");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          taxRate: taxRateFloat,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create item");
      }

      router.push("/dashboard/items");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create item"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Item</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <form onSubmit={handleSubmit}>
              <div className="px-4 py-5 sm:p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-sm text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Item Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={item.name}
                        onChange={handleChange}
                        placeholder="Enter item name or description"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="hsnCode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      HSN Code
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="hsnCode"
                        id="hsnCode"
                        required
                        value={item.hsnCode}
                        onChange={handleChange}
                        placeholder="Enter HSN/SAC code (e.g., 8471)"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="taxRate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tax Rate (%)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        name="taxRate"
                        id="taxRate"
                        required
                        value={item.taxRate}
                        onChange={handleChange}
                        placeholder="e.g., 5, 12, 18, 28"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Enter tax percentage (e.g., 5, 12, 18, 28)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <Link
                  href="/dashboard/items"
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 