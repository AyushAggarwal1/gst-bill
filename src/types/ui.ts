import { ReactNode } from 'react';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Button variants and sizes
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Alert and Toast variants
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

// Modal sizes
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

// Loading spinner sizes
export type SpinnerSize = 'sm' | 'md' | 'lg';

// Form field types
export interface FormFieldProps extends BaseComponentProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
}

// Stats card data
export interface StatsCardData {
  title: string;
  value: string | number;
  icon: ReactNode;
  href?: string;
  linkText?: string;
  iconBgColor?: string;
}

// Quick action card data
export interface QuickActionCardData {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  iconBgColor?: string;
} 