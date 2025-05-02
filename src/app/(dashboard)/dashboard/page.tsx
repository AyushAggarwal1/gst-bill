import React from "react";
import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FiUsers, FiPackage, FiFileText, FiPlusCircle } from "react-icons/fi";

// Define the type for the bill with customer included
type BillWithCustomer = {
  id: string;
  invoiceNo: string;
  date: Date;
  grandTotal: number;
  customer: {
    name: string;
  };
};

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  // Get counts
  const [customersCount, itemsCount, billsCount] = await Promise.all([
    prisma.customer.count({
      where: { userId: session.user.id },
    }),
    prisma.item.count({
      where: { userId: session.user.id },
    }),
    prisma.bill.count({
      where: { userId: session.user.id },
    }),
  ]);

  // Get recent bills
  const recentBills = await prisma.bill.findMany({
    where: { userId: session.user.id },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiUsers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Customers</p>
              <p className="text-2xl font-semibold">{customersCount}</p>
            </div>
          </div>
          <Link
            href="/customers"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 inline-block"
          >
            View all customers →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiPackage className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Items</p>
              <p className="text-2xl font-semibold">{itemsCount}</p>
            </div>
          </div>
          <Link
            href="/items"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 inline-block"
          >
            View all items →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiFileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Bills</p>
              <p className="text-2xl font-semibold">{billsCount}</p>
            </div>
          </div>
          <Link
            href="/bills"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 inline-block"
          >
            View all bills →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/bills/new"
            className="flex items-center justify-center py-3 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FiPlusCircle className="mr-2" />
            Create New Bill
          </Link>
          <Link
            href="/customers/new"
            className="flex items-center justify-center py-3 px-4 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            <FiPlusCircle className="mr-2" />
            Add New Customer
          </Link>
          <Link
            href="/items/new"
            className="flex items-center justify-center py-3 px-4 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            <FiPlusCircle className="mr-2" />
            Add New Item
          </Link>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Recent Bills</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Invoice No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBills.length > 0 ? (
                recentBills.map((bill: BillWithCustomer) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{bill.grandTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/bills/${bill.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center" colSpan={5}>
                    No bills found. Create your first bill!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {recentBills.length > 0 && (
          <div className="mt-4 text-right">
            <Link
              href="/bills"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all bills →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 