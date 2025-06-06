"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, Fragment } from "react";
import { Transition } from "@headlessui/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Extend the session user type to include isAdmin (if not already there)
  // This is an example; adjust based on your actual session user type
  interface SessionUser extends Record<string, any> {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin?: boolean; // Add this if not present
    role?: string; // Or you might have a role string
  }
  
  const typedSession = session as { user: SessionUser } | null;
  const isAdmin = typedSession?.user?.isAdmin || typedSession?.user?.role === 'ADMIN'; // Adjust as needed

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const navigation = [
    { 
      name: "Dashboard", 
      href: "/dashboard",
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    { 
      name: "Customers", 
      href: "/dashboard/customers",
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: "Items", 
      href: "/dashboard/items",
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ) 
    },
    { 
      name: "Bills", 
      href: "/dashboard/bills",
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: "User Management",
      href: "/dashboard/user-management",
      adminOnly: true,
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-1 1a2 2 0 10-4 0 2 2 0 004 0zm7 0a2 2 0 10-4 0 2 2 0 004 0zm-7-4a2 2 0 10-4 0 2 2 0 004 0z" />
        </svg>
      )
    },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/dashboard" className="flex items-center">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM1 15a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2zm12-10a2 2 0 00-2 2v11a3 3 0 106 0V7a2 2 0 00-2-2h-2zM11 17a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-900">GST Bill Maker</span>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-1">
                  {navigation.map((item) => (
                    (!item.adminOnly || (item.adminOnly && isAdmin)) && (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          isActive(item.href)
                            ? "bg-primary-50 text-primary-700 border-primary-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        } px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-200 border border-transparent`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              {/* Desktop User Profile Dropdown */}
              <div className="ml-4 flex items-center md:ml-6 relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="mr-2 font-medium text-sm">{session?.user?.name || session?.user?.email}</span>
                  <svg className={`h-4 w-4 ${menuOpen ? 'transform rotate-180' : ''} transition-transform duration-200`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <Transition
                  show={menuOpen}
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <div className="origin-top-right absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg py-2 bg-white ring-1 ring-black ring-opacity-5 z-20 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{session?.user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Edit Profile
                    </Link>
                    <Link
                      href="/api/auth/signout"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="h-4 w-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </Link>
                  </div>
                </Transition>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                type="button"
                className="relative bg-white inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-gray-200"
                aria-controls="mobile-menu"
                aria-expanded={isMobileNavOpen}
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon container for transitions */}
                <div className="relative h-6 w-6">
                  {/* Hamburger Icon */}
                  <Transition
                    as={Fragment}
                    show={!isMobileNavOpen}
                    enter="transition-opacity duration-150 ease-out"
                    enterFrom="opacity-0 rotate-[-90deg] scale-50"
                    enterTo="opacity-100 rotate-0 scale-100"
                    leave="transition-opacity duration-150 ease-in"
                    leaveFrom="opacity-100 rotate-0 scale-100"
                    leaveTo="opacity-0 rotate-[-90deg] scale-50"
                  >
                    <svg className="absolute inset-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </Transition>
                  {/* Close Icon */}
                  <Transition
                    as={Fragment}
                    show={isMobileNavOpen}
                    enter="transition-opacity duration-150 ease-out"
                    enterFrom="opacity-0 rotate-90deg scale-50"
                    enterTo="opacity-100 rotate-0 scale-100"
                    leave="transition-opacity duration-150 ease-in"
                    leaveFrom="opacity-100 rotate-0 scale-100"
                    leaveTo="opacity-0 rotate-90deg scale-50"
                  >
                    <svg className="absolute inset-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Transition>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        <Transition
          show={isMobileNavOpen}
          as={Fragment}
          enter="transition ease-out duration-300 transform"
          enterFrom="opacity-0 -translate-y-4 scale-95"
          enterTo="opacity-100 translate-y-0 scale-100"
          leave="transition ease-in duration-200 transform"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 -translate-y-4 scale-95"
        >
          <div className="md:hidden bg-white shadow-lg border-t border-gray-200" id="mobile-menu">
            <div className="px-4 pt-6 pb-4">
              {/* Navigation Links */}
              <div className="space-y-2">
                {navigation.map((item) => (
                  (!item.adminOnly || (item.adminOnly && isAdmin)) && (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={`${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-transparent"
                      } group flex items-center px-4 py-3 rounded-xl text-base font-medium border transition-all duration-200 hover:shadow-sm`}
                    >
                      <div className={`${
                        isActive(item.href)
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      } transition-colors duration-200`}>
                        {item.icon}
                      </div>
                      <span className="ml-3">{item.name}</span>
                      {isActive(item.href) && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </Link>
                  )
                ))}
              </div>
              
              {/* User Profile Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center px-3 py-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                  </div>
                </div>
                
                {/* Profile Actions */}
                <div className="space-y-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm">Profile</span>
                  </Link>
                  
                  <Link
                    href="/api/auth/signout"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm">Sign out</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </nav>

      <main className="print:p-0 print:m-0">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
} 