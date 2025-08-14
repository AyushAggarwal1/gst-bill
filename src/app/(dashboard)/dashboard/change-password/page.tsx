"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }
      setSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10V7a4 4 0 118 0v3" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 10h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Change Password</h1>
              <p className="text-sm text-gray-600 mt-1">Update your account password</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20">
          <form onSubmit={onSubmit}>
            <div className="px-6 py-6 sm:p-8">
              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10V7a4 4 0 118 0v3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 10h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                      </svg>
                    </div>
                    <input
                      type={showCurrent ? "text" : "password"}
                      className="pl-10 pr-10 block w-full rounded-xl border-gray-200 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm py-3 transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label={showCurrent ? 'Hide password' : 'Show password'}
                    >
                      {showCurrent ? (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3l18 18" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.58 6.05C11.04 6.02 11.51 6 12 6c4.03 0 7.61 2.12 9.67 5.32.2.28.2.68 0 .96-.75 1.17-1.7 2.2-2.8 3.06" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.53 6.53C4.57 7.77 3 9.64 2.25 11.99c2.25 4.5 6.75 7.5 9.75 7.5 1.09 0 2.15-.2 3.14-.57" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.88 9.88A3 3 0 0012 15c.56 0 1.09-.15 1.54-.41" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 12c2.5-4.5 7-7.5 9.75-7.5S19.5 7.5 21.75 12c-2.25 4.5-6.75 7.5-9.75 7.5S4.75 16.5 2.25 12z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10V7a4 4 0 118 0v3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 10h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                      </svg>
                    </div>
                    <input
                      type={showNew ? "text" : "password"}
                      className="pl-10 pr-10 block w-full rounded-xl border-gray-200 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm py-3 transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-900"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3l18 18" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.58 6.05C11.04 6.02 11.51 6 12 6c4.03 0 7.61 2.12 9.67 5.32.2.28.2.68 0 .96-.75 1.17-1.7 2.2-2.8 3.06" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.53 6.53C4.57 7.77 3 9.64 2.25 11.99c2.25 4.5 6.75 7.5 9.75 7.5 1.09 0 2.15-.2 3.14-.57" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.88 9.88A3 3 0 0012 15c.56 0 1.09-.15 1.54-.41" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 12c2.5-4.5 7-7.5 9.75-7.5S19.5 7.5 21.75 12c-2.25 4.5-6.75 7.5-9.75 7.5S4.75 16.5 2.25 12z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Must be at least 8 characters</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 sm:px-8 bg-gray-50/50 rounded-b-2xl border-t border-gray-100">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center py-3 px-6 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10V7a4 4 0 118 0v3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 10h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                      </svg>
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


