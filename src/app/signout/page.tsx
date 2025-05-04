"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function SignOutPage() {
  useEffect(() => {
    // Actually sign out the user when the page loads
    signOut({ redirect: false });
    
    const redirect = setTimeout(() => {
      window.location.href = "/";
    }, 3000);

    return () => clearTimeout(redirect);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Signed Out</h2>
          <p className="mt-2 text-sm text-gray-600">
            You have been successfully signed out of your account.
          </p>
        </div>
        <div className="mt-6">
          <p className="text-center text-sm text-gray-500">
            Redirecting to home page in a few seconds...
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link 
            href="" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Click here if you are not redirected
          </Link>
        </div>
      </div>
    </div>
  );
} 