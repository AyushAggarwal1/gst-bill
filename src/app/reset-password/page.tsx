"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!params) return;
    const e = params.get('email') || '';
    const org = params.get('organizationName') || '';
    setEmail(e);
    setOrganizationName(org);
  }, [params]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, organizationName, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password updated. Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setMessage(data.message || 'Invalid code or expired');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-sm sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">GST Bill Maker</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Professional billing solution for your business</p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 mx-auto w-full max-w-sm sm:max-w-md">
        <div className="bg-white py-6 px-4 sm:py-8 shadow-xl rounded-xl sm:rounded-2xl sm:px-8 border border-gray-200">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Reset password</h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">Enter the 6-digit code we sent and your new password</p>
          </div>

          <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5 sm:mb-2">Organization Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <input
                  className="pl-9 sm:pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm py-2.5 sm:py-3 transition-all duration-200 bg-white hover:border-gray-400 focus:bg-white text-gray-900"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  placeholder="Your Organization"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5 sm:mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  className="pl-9 sm:pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm py-2.5 sm:py-3 transition-all duration-200 bg-white hover:border-gray-400 focus:bg-white text-gray-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5 sm:mb-2">OTP Code</label>
              <input
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm py-2.5 sm:py-3 transition-all duration-200 bg-white hover:border-gray-400 focus:bg-white text-gray-900 tracking-widest"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="123456"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5 sm:mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm py-2.5 sm:py-3 transition-all duration-200 bg-white hover:border-gray-400 focus:bg-white text-gray-900 pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-1 sm:pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 sm:py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-6 rounded-xl bg-blue-50 p-4 border border-blue-200 text-sm text-blue-800">{message}</div>
          )}

          <div className="mt-6 sm:mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">Back to</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-6">
              <Link
                href="/login"
                className="w-full inline-flex justify-center items-center py-2.5 sm:py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md active:scale-95"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                </svg>
                <span className="text-sm">Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


