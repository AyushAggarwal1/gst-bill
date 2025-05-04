"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Customers", href: "/dashboard/customers" },
    { name: "Items", href: "/dashboard/items" },
    { name: "Bills", href: "/dashboard/bills" },
    { name: "Profile", href: "/dashboard/profile" },
    // { name: "Auth Logs", href: "/dashboard/auth-logs" },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white text-xl font-bold">
                  GST Bill Maker
                </span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive(item.href)
                          ? "bg-indigo-700 text-white"
                          : "text-white hover:bg-indigo-500"
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="text-white">
                  {session?.user?.name || session?.user?.email}
                </div>
                <Link
                  href="/api/auth/signout"
                  className="ml-4 bg-indigo-700 py-1 px-3 rounded-md text-white text-sm"
                >
                  Sign out
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? "bg-indigo-700 text-white"
                    : "text-white hover:bg-indigo-500"
                } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/api/auth/signout"
              className="block px-3 py-2 text-base font-medium text-white bg-indigo-700 rounded-md"
            >
              Sign out
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 