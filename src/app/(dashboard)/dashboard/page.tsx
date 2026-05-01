"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  PageHeader,
  StatsCard,
  QuickActionCard,
  LoadingSpinner,
} from "@/components/ui";

interface Activity {
  id: string;
  type: 'customer' | 'item' | 'bill';
  title: string;
  description: string;
  createdAt: string;
  href?: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    customers: 0,
    items: 0,
    bills: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      try {
        const profileCheck = await fetch("/api/auth/check-profile");
        if (profileCheck.ok) {
          const { hasProfile } = await profileCheck.json();
          if (!hasProfile) {
            window.location.href = "/dashboard/profile";
            return;
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };

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

    const fetchRecentActivities = async () => {
      try {
        const [customersRes, itemsRes, billsRes] = await Promise.all([
          fetch("/api/customers?limit=3"),
          fetch("/api/items?limit=3"),
          fetch("/api/bills?limit=3")
        ]);

        const allActivities: Activity[] = [];

        if (customersRes.ok) {
          const customers = await customersRes.json();
          customers.forEach((customer: any) => {
            allActivities.push({
              id: `customer-${customer.id}`,
              type: 'customer',
              title: 'New Customer Added',
              description: `${customer.name} was added to the system`,
              createdAt: customer.createdAt,
              href: `/dashboard/customers/edit/${customer.id}`
            });
          });
        }

        if (itemsRes.ok) {
          const items = await itemsRes.json();
          items.forEach((item: any) => {
            allActivities.push({
              id: `item-${item.id}`,
              type: 'item',
              title: 'New Item Created',
              description: `${item.name} was added to inventory`,
              createdAt: item.createdAt,
              href: `/dashboard/items/edit/${item.id}`
            });
          });
        }

        if (billsRes.ok) {
          const bills = await billsRes.json();
          bills.forEach((bill: any) => {
            allActivities.push({
              id: `bill-${bill.id}`,
              type: 'bill',
              title: 'New Bill Generated',
              description: `Bill #${bill.billNumber} for ${bill.customer?.name || 'Unknown Customer'}`,
              createdAt: bill.createdAt,
              href: `/dashboard/bills/${bill.id}`
            });
          });
        }

        // Sort by creation date (most recent first) and take top 8
        const sortedActivities = allActivities
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8);

        setActivities(sortedActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    checkProfileAndRedirect();
    fetchStats();
    fetchRecentActivities();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session?.user?.name || "User"}! Here's your business overview.`}
        icon={
          <svg className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        }
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 p-4 sm:p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="ml-3 sm:ml-4 flex-1">
                    <div className="h-3 bg-gray-200 rounded w-28 mb-2" />
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : null}
          {!isLoading && <>
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
          </>}
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>

          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner text="Loading activities..." />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start creating bills and managing customers to see activity here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const getActivityIcon = (type: string) => {
                  switch (type) {
                    case 'customer':
                      return (
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      );
                    case 'item':
                      return (
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      );
                    case 'bill':
                      return (
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      );
                    default:
                      return (
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      );
                  }
                };

                const formatTimeAgo = (dateString: string) => {
                  const now = new Date();
                  const activityDate = new Date(dateString);
                  const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
                  
                  if (diffInMinutes < 1) return 'Just now';
                  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
                  
                  const diffInHours = Math.floor(diffInMinutes / 60);
                  if (diffInHours < 24) return `${diffInHours}h ago`;
                  
                  const diffInDays = Math.floor(diffInHours / 24);
                  if (diffInDays < 7) return `${diffInDays}d ago`;
                  
                  return activityDate.toLocaleDateString();
                };

                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                    </div>
                    {activity.href && (
                      <a
                        href={activity.href}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                        title="View details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                );
              })}
              
              {activities.length >= 8 && (
                <div className="pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                  >
                    Go to top ↑
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 