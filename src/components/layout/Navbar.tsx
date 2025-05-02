"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FiMenu, FiX } from "react-icons/fi";

export const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const isActive = (path: string) => {
    return pathname === path ? "bg-blue-700" : "";
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 font-bold text-xl">
              GST Bill Builder
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive("/dashboard")}`}
              >
                Dashboard
              </Link>
              <Link
                href="/customers"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive("/customers")}`}
              >
                Customers
              </Link>
              <Link
                href="/items"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive("/items")}`}
              >
                Items
              </Link>
              <Link
                href="/bills"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive("/bills")}`}
              >
                Bills
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive("/profile")}`}
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 ${isActive("/dashboard")}`}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
            <Link
              href="/customers"
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 ${isActive("/customers")}`}
              onClick={closeMenu}
            >
              Customers
            </Link>
            <Link
              href="/items"
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 ${isActive("/items")}`}
              onClick={closeMenu}
            >
              Items
            </Link>
            <Link
              href="/bills"
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 ${isActive("/bills")}`}
              onClick={closeMenu}
            >
              Bills
            </Link>
            <Link
              href="/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 ${isActive("/profile")}`}
              onClick={closeMenu}
            >
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}; 