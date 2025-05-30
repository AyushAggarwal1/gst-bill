"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/Spinner";

interface ItemParams {
  params: {
    id: string;
  };
}

export default function EditItemPage({ params }: ItemParams) {
  const router = useRouter();
  const { id } = params;
  const [item, setItem] = useState({
    name: "",
    hsnCode: "",
    taxRate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch item");
        }
        const data = await res.json();
        setItem({
          name: data.name || "",
          hsnCode: data.hsnCode || "",
          taxRate: data.taxRate !== null && data.taxRate !== undefined ? String(data.taxRate) : "",
        });
      } catch (err) {
        console.error("Error fetching item:", err);
        setError(err instanceof Error ? err.message : "Failed to load item. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError("");
    const taxRateFloat = parseFloat(item.taxRate);
    if (isNaN(taxRateFloat)) {
      setError("Tax Rate must be a valid number");
      setSaveLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, taxRate: taxRateFloat }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update item");
      }
      router.push("/dashboard/items");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
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
                  disabled={saveLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : "Update Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 