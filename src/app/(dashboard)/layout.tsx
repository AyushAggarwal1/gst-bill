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
    return <div className="p-8">Loading...</div>;
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
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    { 
      name: "Customers", 
      href: "/dashboard/customers",
      icon: (
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: "Items", 
      href: "/dashboard/items",
      icon: (
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ) 
    },
    { 
      name: "Bills", 
      href: "/dashboard/bills",
      icon: (
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    // {
    //   name: "Invitations",
    //   href: "/dashboard/invitations",
    //   adminOnly: true,
    //   icon: (
    //     <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3M15 21H9M15 21H9m12-3a9 9 0 11-18 0 9 9 0 0118 0zM20 14v6m-3-3h6" />
    //     </svg>
    //   )
    // },
    {
      name: "User Management",
      href: "/dashboard/user-management",
      adminOnly: true,
      icon: (
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-1 1a2 2 0 10-4 0 2 2 0 004 0zm7 0a2 2 0 10-4 0 2 2 0 004 0zm-7-4a2 2 0 10-4 0 2 2 0 004 0z" />
        </svg>
      )
    },
    // { name: "Profile", href: "/dashboard/profile" },
    // { name: "Auth Logs", href: "/dashboard/auth-logs" },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/dashboard" className="text-white text-xl font-bold">
                  GST Bill Maker
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    (!item.adminOnly || (item.adminOnly && isAdmin)) && (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          isActive(item.href)
                            ? "bg-indigo-700 text-white"
                            : "text-white hover:bg-indigo-500"
                        } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
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
                  className="flex items-center text-white hover:text-indigo-100 focus:outline-none transition-colors px-2 py-1 rounded-md hover:bg-indigo-500"
                >
                  <svg className="h-5 w-5 mr-2 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="mr-2 font-medium">{session?.user?.name || session?.user?.email}</span>
                  <svg className={`h-4 w-4 ${menuOpen ? 'transform rotate-180' : ''} transition-transform duration-200`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="origin-top-right absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20 transform transition-all duration-200">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="h-4 w-4 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Edit Profile
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      href="/api/auth/signout"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="h-4 w-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                type="button"
                className="relative bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
          enter="transition ease-out duration-200 transform"
          enterFrom="opacity-0 -translate-y-10"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150 transform"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-10"
        >
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                (!item.adminOnly || (item.adminOnly && isAdmin)) && (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`${
                      isActive(item.href)
                        ? "bg-indigo-700 text-white"
                        : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                    } block px-3 py-2 rounded-md text-base font-medium flex items-center`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Link>
                )
              ))}
              {/* Mobile Profile Link */}
              <Link
                href="/dashboard/profile"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-indigo-100 hover:bg-indigo-500 hover:text-white rounded-md"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="ml-2">Profile</span>
              </Link>
              {/* Mobile Sign Out Link */}
              <Link
                href="/api/auth/signout"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-indigo-100 bg-indigo-700 hover:bg-indigo-800 rounded-md mt-2"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="ml-2">Sign out</span>
              </Link>
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