"use client";

import { UsageExample } from "@/components/ui/usage-example";
import Link from "next/link";

export default function UIDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">UI/UX Improvements Demo</h1>
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Sign-out Page</h2>
            <p className="mb-4">We&apos;ve created a dedicated sign-out page that shows a confirmation message and redirects users to the login page.</p>
            <div className="mt-4">
              <Link 
                href="/signout" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                View Sign-out Page
              </Link>
            </div>
          </div>
          
          <UsageExample />
        </div>
      </div>
    </div>
  );
} 