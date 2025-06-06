"use client";

import { ConfirmDialog as UIConfirmDialog } from './ui/confirm-dialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonColor = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  // Map old color names to new variant names
  const getVariant = (color: string) => {
    switch (color) {
      case 'red':
        return 'danger';
      case 'indigo':
      case 'blue':
        return 'primary';
      case 'yellow':
        return 'warning';
      default:
        return 'danger';
    }
  };

  return (
    <UIConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={confirmButtonText}
      cancelText={cancelButtonText}
      variant={getVariant(confirmButtonColor)}
      isLoading={isLoading}
    />
  );
} 