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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
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

  // Handle keyboard shortcuts for command palette
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (event.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle hover functionality for collapsed sidebar
  const handleSidebarMouseEnter = () => {
    if (!sidebarOpen) {
      setIsHovering(true);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!sidebarOpen && isHovering) {
      const timeout = setTimeout(() => {
        setIsHovering(false);
      }, 300); // 300ms delay before closing
      setHoverTimeout(timeout);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

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

  // Search tools for mobile navigation
  const mobileNavigation = [
    ...navigation,
    { 
      name: "GST Search", 
      href: "/search-gst",
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    { 
      name: "HSN Search", 
      href: "/search-hsn",
      icon: (
        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen || isHovering ? 'lg:w-72 translate-x-0' : 'lg:w-20 translate-x-0'
        }`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <div className={`flex grow flex-col gap-y-5 overflow-y-auto bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen || isHovering ? 'px-6' : 'px-3'
        } pb-4`}>
          {/* Sidebar Header - matches main header height */}
          <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200">
            {sidebarOpen || isHovering ? (
              <div className="text-sm font-medium text-gray-500">Way Finder</div>
            ) : (
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            )}
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                {(sidebarOpen || isHovering) && (
                  <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide mb-2">
                    Main Navigation
                  </div>
                )}
                <ul role="list" className={`space-y-1 ${sidebarOpen || isHovering ? '-mx-2 mt-2' : 'mx-0'}`}>
                  {navigation.map((item) => (
                    (!item.adminOnly || (item.adminOnly && isAdmin)) && (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`${
                            isActive(item.href)
                              ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                              : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50'
                          } group flex items-center transition-all duration-200 ${
                            sidebarOpen || isHovering
                              ? 'gap-x-3 rounded-l-md p-3 text-sm leading-6 font-medium' 
                              : 'justify-center p-3 rounded-lg mx-1 mb-2'
                          }`}
                          title={!sidebarOpen && !isHovering ? item.name : undefined}
                        >
                          <div className={`${
                            isActive(item.href)
                              ? 'text-primary-600'
                              : 'text-gray-400 group-hover:text-primary-600'
                          } transition-colors duration-200 ${sidebarOpen || isHovering ? '' : 'w-5 h-5'}`}>
                            {item.icon}
                          </div>
                          {(sidebarOpen || isHovering) && (
                            <>
                              <span className="transition-opacity duration-300">{item.name}</span>
                              {isActive(item.href) && (
                                <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full"></div>
                              )}
                            </>
                          )}
                        </Link>
                      </li>
                    )
                  ))}
                </ul>
              </li>
              
              <li>
                {(sidebarOpen || isHovering) && (
                  <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide mb-2">
                    Search & Verification
                  </div>
                )}
                <ul role="list" className={`space-y-1 ${sidebarOpen || isHovering ? '-mx-2 mt-2' : 'mx-0'}`}>
                  <li>
                    <Link
                      href="/search-gst"
                      className={`${
                        pathname === "/search-gst"
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                              } group flex items-center transition-all duration-200 ${
                          sidebarOpen || isHovering
                            ? 'gap-x-3 rounded-l-md p-3 text-sm leading-6 font-medium' 
                            : 'justify-center p-3 rounded-lg mx-1 mb-2'
                        }`}
                        title={!sidebarOpen && !isHovering ? 'GST Search' : undefined}
                    >
                                              <svg className={`shrink-0 ${
                          pathname === "/search-gst"
                            ? 'text-blue-600'
                            : 'text-gray-400 group-hover:text-blue-600'
                        } transition-colors duration-200 ${sidebarOpen || isHovering ? 'h-5 w-5' : 'h-5 w-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {(sidebarOpen || isHovering) && (
                          <>
                            <span className="transition-opacity duration-300">GST Search</span>
                            {pathname === "/search-gst" && (
                              <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </>
                        )}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/search-hsn"
                      className={`${
                        pathname === "/search-hsn"
                          ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                          : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
                                              } group flex items-center transition-all duration-200 ${
                          sidebarOpen || isHovering
                            ? 'gap-x-3 rounded-l-md p-3 text-sm leading-6 font-medium' 
                            : 'justify-center p-3 rounded-lg mx-1 mb-2'
                        }`}
                        title={!sidebarOpen && !isHovering ? 'HSN Search' : undefined}
                    >
                                              <svg className={`shrink-0 ${
                          pathname === "/search-hsn"
                            ? 'text-green-600'
                            : 'text-gray-400 group-hover:text-green-600'
                        } transition-colors duration-200 ${sidebarOpen || isHovering ? 'h-5 w-5' : 'h-5 w-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {(sidebarOpen || isHovering) && (
                          <>
                            <span className="transition-opacity duration-300">HSN Search</span>
                            {pathname === "/search-hsn" && (
                              <div className="ml-auto w-2 h-2 bg-green-600 rounded-full"></div>
                            )}
                          </>
                        )}
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
            
            {/* User Profile in Sidebar */}
            <div className="mt-auto">
              <div className={`flex items-center text-sm font-semibold leading-6 text-gray-900 border-t border-gray-200 transition-all duration-300 ${
                sidebarOpen || isHovering ? 'gap-x-4 px-3 py-3' : 'justify-center px-3 py-4'
              }`}>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {(sidebarOpen || isHovering) && (
                  <div className="flex-1 min-w-0 transition-opacity duration-300">
                    <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`hidden lg:fixed lg:top-4 lg:z-50 lg:flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-300 ${
          sidebarOpen ? 'lg:left-[280px]' : 'lg:left-6'
        }`}
      >
        <svg className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <nav className={`bg-white shadow-sm border-b border-gray-200 print:hidden relative z-40 transition-all duration-300 ${
        sidebarOpen || isHovering ? 'lg:pl-72' : 'lg:pl-20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-1">
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
            </div>

            {/* Center Search Bar - Desktop Only */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-lg mx-8">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
              >
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="flex-1 text-left">Search pages, GST, HSN codes...</span>
                <kbd className="hidden lg:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 bg-white border border-gray-200 rounded">
                  ⌘K
                </kbd>
              </button>
            </div>
            {/* Right side - User Profile */}
            <div className="hidden md:flex items-center justify-end flex-1">
              <div className="relative" ref={menuRef}>
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
                  <div className="origin-top-right absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg py-2 bg-white ring-1 ring-black ring-opacity-5 z-50 border border-gray-200">
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
            {/* Mobile search and menu buttons */}
            <div className="-mr-2 flex md:hidden items-center space-x-2">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="bg-white inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-gray-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
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
                {mobileNavigation.map((item) => (
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

      <main className={`print:p-0 print:m-0 transition-all duration-300 ${
        sidebarOpen || isHovering ? 'lg:pl-72' : 'lg:pl-20'
      }`}>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-full">
          {children}
        </div>
      </main>

      {/* Command Palette Modal */}
      <Transition show={commandPaletteOpen} as={Fragment}>
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-start justify-center px-4 pt-16 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setCommandPaletteOpen(false)} />
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative inline-block w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Search</h3>
                    <button
                      onClick={() => setCommandPaletteOpen(false)}
                      className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Main Navigation */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Way Finder</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {navigation.map((item) => (
                        (!item.adminOnly || (item.adminOnly && isAdmin)) && (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setCommandPaletteOpen(false)}
                            className={`group relative rounded-lg border p-4 hover:shadow-md transition-all duration-200 ${
                              isActive(item.href)
                                ? "border-primary-300 bg-primary-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                                isActive(item.href)
                                  ? "bg-primary-100 text-primary-600"
                                  : "bg-gray-50 text-gray-600 group-hover:bg-gray-100"
                              }`}>
                                {item.icon}
                              </div>
                              <div className="ml-3">
                                <h5 className={`font-medium transition-colors ${
                                  isActive(item.href)
                                    ? "text-primary-700"
                                    : "text-gray-900 group-hover:text-gray-700"
                                }`}>
                                  {item.name}
                                </h5>
                              </div>
                              {isActive(item.href) && (
                                <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full"></div>
                              )}
                            </div>
                          </Link>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Search Tools */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Search & Verification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* GST Search */}
                      <Link
                        href="/search-gst"
                        onClick={() => setCommandPaletteOpen(false)}
                        className={`group relative rounded-xl border p-6 hover:shadow-lg transition-all duration-200 ${
                          pathname === "/search-gst"
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                            pathname === "/search-gst"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                          }`}>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h4 className={`text-lg font-semibold transition-colors ${
                              pathname === "/search-gst"
                                ? "text-blue-700"
                                : "text-gray-900 group-hover:text-blue-600"
                            }`}>
                              GST Search
                            </h4>
                            <p className="text-sm text-gray-500">
                              Verify and lookup GST numbers
                            </p>
                          </div>
                          {pathname === "/search-gst" && (
                            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <div className="mt-4">
                          <p className="text-xs text-gray-400">
                            Search for business details, registration info, and compliance status
                          </p>
                        </div>
                      </Link>

                      {/* HSN Search */}
                      <Link
                        href="/search-hsn"
                        onClick={() => setCommandPaletteOpen(false)}
                        className={`group relative rounded-xl border p-6 hover:shadow-lg transition-all duration-200 ${
                          pathname === "/search-hsn"
                            ? "border-green-300 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                            pathname === "/search-hsn"
                              ? "bg-green-100 text-green-600"
                              : "bg-green-50 text-green-600 group-hover:bg-green-100"
                          }`}>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h4 className={`text-lg font-semibold transition-colors ${
                              pathname === "/search-hsn"
                                ? "text-green-700"
                                : "text-gray-900 group-hover:text-green-600"
                            }`}>
                              HSN Search
                            </h4>
                            <p className="text-sm text-gray-500">
                              Find HSN codes and tax rates
                            </p>
                          </div>
                          {pathname === "/search-hsn" && (
                            <div className="ml-auto w-2 h-2 bg-green-600 rounded-full"></div>
                          )}
                        </div>
                        <div className="mt-4">
                          <p className="text-xs text-gray-400">
                            Search by product name or HSN code to get accurate GST rates
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Press <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">Esc</kbd> to close</span>
                      <span>Press <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">⌘K</kbd> to open</span>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition>
    </div>
  );
} 