"use client";

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

// Helper functions for showing toasts
export const showToast = {
  success: (message: string) => import('react-hot-toast').then(({ toast }) => toast.success(message)),
  error: (message: string) => import('react-hot-toast').then(({ toast }) => toast.error(message)),
  loading: (message: string) => import('react-hot-toast').then(({ toast }) => toast.loading(message)),
  dismiss: (toastId: string) => import('react-hot-toast').then(({ toast }) => toast.dismiss(toastId)),
}; 