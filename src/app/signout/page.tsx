"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function SignOutPage() {
  const [countdown, setCountdown] = useState(30000000);
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
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Clean Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Simple Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You're signed out
          </h1>
          <p className="text-gray-600 mb-8">
            Thanks for using GST Bill Maker
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-gray-50 px-6 py-8 rounded-lg border border-gray-200">
          <div className="text-center space-y-6">
            {/* Simple Message */}
            {!error && (
              <p className="text-gray-600">
                Redirecting you to the home page in <span className="font-semibold text-gray-900">{countdown}</span> seconds...
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                href="/"
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Home Page
              </Link>
              <Link 
                href="/login"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In Again
              </Link>
            </div>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            GST Bill Maker
            <br />
            Your data is safe and secure with us
          </p>
        </div>
      </div>
    </div>
  );
} 