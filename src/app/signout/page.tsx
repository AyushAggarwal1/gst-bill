"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function SignOutPage() {
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState("");

  useEffect(() => {
    const signOutUser = async () => {
      try {
        await signOut({ redirect: false });
      } catch (error) {
        setError("There was an error signing out. Please try again.");
        return;
      }

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            window.location.href = "/";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    };

    signOutUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            GST Bill Maker
          </h1>
          <p className="mt-2 text-sm text-indigo-600 font-medium">
            Simplified Billing Solution
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-indigo-100">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Loading Animation */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-indigo-600">
                {countdown}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">Signed Out</h2>
            
            {error ? (
              <div className="rounded-md bg-red-50 p-4 border-l-4 border-red-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-center">
                  You have been successfully signed out of your account.
                </p>
                <p className="text-gray-500 text-sm">
                  Redirecting to home page in {countdown} seconds...
                </p>
              </>
            )}

            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Return to Home Page
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Thank you for using GST Bill Maker
          </p>
        </div>
      </div>
    </div>
  );
} 