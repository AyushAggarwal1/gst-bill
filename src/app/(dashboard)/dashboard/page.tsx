"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  PageHeader, 
  StatsCard, 
  QuickActionCard, 
  LoadingSpinner 
} from "@/components/ui";

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    customers: 0,
    items: 0,
    bills: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersRes, itemsRes, billsRes] = await Promise.all([
          fetch("/api/customers/count"),
          fetch("/api/items/count"),
          fetch("/api/bills/count")
        ]);

        if (customersRes.ok && itemsRes.ok && billsRes.ok) {
          const [customers, items, bills] = await Promise.all([
            customersRes.json(),
            itemsRes.json(),
            billsRes.json()
          ]);

          setStats({
            customers: customers.count,
            items: items.count,
            bills: bills.count,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session?.user?.name || "User"}! Here's your business overview.`}
      >
        <div className="text-xs sm:text-sm text-gray-500">
          <span className="sm:hidden">
            {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
          <span className="hidden sm:inline">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </PageHeader>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
          <StatsCard
            title="Total Customers"
            value={stats.customers}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            href="/dashboard/customers"
            linkText="View all customers"
            iconBgColor="bg-slate-100"
          />

          <StatsCard
            title="Total Items"
            value={stats.items}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            href="/dashboard/items"
            linkText="View all items"
            iconBgColor="bg-emerald-100"
          />

          <StatsCard
            title="Total Bills"
            value={stats.bills}
            icon={
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            href="/dashboard/bills"
            linkText="View all bills"
            iconBgColor="bg-blue-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-xs sm:text-sm text-gray-500">Get started with common tasks</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Create New Bill"
              description="Generate invoice for customers"
              href="/dashboard/bills/new"
              icon={
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              }
              iconBgColor="bg-blue-50"
            />

            <QuickActionCard
              title="Add New Customer"
              description="Register new customer details"
              href="/dashboard/customers/new"
              icon={
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
              iconBgColor="bg-green-50"
            />

            <QuickActionCard
              title="Add New Item"
              description="Add products to inventory"
              href="/dashboard/items/new"
              icon={
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              iconBgColor="bg-purple-50"
            />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start creating bills and managing customers to see activity here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 