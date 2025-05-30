"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Simple Loading Spinner component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

// Main form component
function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!token && !searchParams) { // Also check if searchParams itself is still loading
        // Still waiting for searchParams, do nothing yet or show a specific loading state for token
    } else if (!token) {
      setTokenError('Invitation token is missing or invalid. Please check the link or contact the sender.');
    }
  }, [token, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.'});
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      setMessage({ type: 'success', text: data.message || 'Account created successfully! You can now log in.' });
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading if token is not yet available from searchParams
  if (!searchParams) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-2xl rounded-lg">
            <LoadingSpinner />
            <p className="text-center text-gray-500 mt-2">Loading invitation details...</p>
          </div>
        </div>
      );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-2xl rounded-lg">
            {/* Logo Placeholder */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">Invalid Invitation</h2>
            <p className="mt-2 text-center text-sm text-red-600">{tokenError}</p>
            <div className="mt-8">
              <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Go to Login
              </Link>
            </div>
        </div>
      </div>
    );
  }
  
  if (message?.type === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-2xl rounded-lg">
            {/* Logo Placeholder */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">Success!</h2>
            <p className="mt-2 text-center text-sm text-green-600">{message.text}</p>
            <div className="mt-8">
              <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Proceed to Login
              </Link>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 p-8 bg-white shadow-2xl rounded-lg">
        <div>
          {/* Logo Placeholder - Replace with your actual logo or app name styling */}
          <div className="text-center">
            <svg className="mx-auto h-12 w-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {/* Or simply: <h1 className="text-3xl font-bold text-indigo-600">Your App Name</h1> */}
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Accept Your Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set a password to complete your account setup.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && message.type === 'error' && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              {message.text}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name (Optional)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Choose a strong password"
              />
               <p className="mt-1 text-xs text-gray-500">Minimum 8 characters.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !token}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition duration-150 ease-in-out"
            >
              {isLoading ? <LoadingSpinner /> : 'Create Account & Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Wrap the component with Suspense for useSearchParams
export default function AcceptInvitationPage() {
    return (
        <Suspense 
            fallback={
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-2xl rounded-lg">
                        <LoadingSpinner />
                        <p className="text-center text-gray-500 mt-2">Loading invitation...</p>
                    </div>
                </div>
            }
        >
            <AcceptInvitationForm />
        </Suspense>
    );
} 