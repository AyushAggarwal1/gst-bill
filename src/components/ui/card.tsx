"use client";

import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: CardHeaderProps) => {
  return (
    <div className={cn('card-header', className)} {...props}>
      {children}
    </div>
  );
};

export const CardBody = ({ className, children, ...props }: CardBodyProps) => {
  return (
    <div className={cn('card-body', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }: CardFooterProps) => {
  return (
    <div className={cn('card-footer', className)} {...props}>
      {children}
    </div>
  );
}; 