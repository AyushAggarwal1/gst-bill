"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    customers: 0,
    items: 0,
    bills: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const customersRes = await fetch("/api/customers/count");
        const itemsRes = await fetch("/api/items/count");
        const billsRes = await fetch("/api/bills/count");

        if (customersRes.ok && itemsRes.ok && billsRes.ok) {
          const customers = await customersRes.json();
          const items = await itemsRes.json();
          const bills = await billsRes.json();

          setStats({
            customers: customers.count,
            items: items.count,
            bills: bills.count,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4 bg-white">
            <div className="text-lg mb-4">
              Welcome back, {session?.user?.name || "User"}!
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Customers
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.customers}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-100 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link
                      href="/dashboard/customers"
                      className="font-medium text-indigo-700 hover:text-indigo-900"
                    >
                      View all customers
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Items
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.items}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-100 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link
                      href="/dashboard/items"
                      className="font-medium text-indigo-700 hover:text-indigo-900"
                    >
                      View all items
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Bills
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.bills}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-100 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link
                      href="/dashboard/bills"
                      className="font-medium text-indigo-700 hover:text-indigo-900"
                    >
                      View all bills
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">
                Quick Actions
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  href="/dashboard/bills/new"
                  className="block p-6 bg-white hover:bg-gray-50 shadow rounded-lg border border-gray-200"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-gray-900">
                        Create New Bill
                      </h3>
                      <p className="text-sm text-gray-500">
                        Create a new bill for a customer
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/customers/new"
                  className="block p-6 bg-white hover:bg-gray-50 shadow rounded-lg border border-gray-200"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-gray-900">
                        Add New Customer
                      </h3>
                      <p className="text-sm text-gray-500">
                        Register a new customer
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/items/new"
                  className="block p-6 bg-white hover:bg-gray-50 shadow rounded-lg border border-gray-200"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-gray-900">
                        Add New Item
                      </h3>
                      <p className="text-sm text-gray-500">
                        Add a new product or service
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 