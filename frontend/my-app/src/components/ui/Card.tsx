import * as React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className = '',
  ...props 
}: CardProps) {
  const baseClasses = 'rounded-lg border transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border-secondary-200 shadow-sm hover:shadow-md',
    outlined: 'bg-white border-secondary-300 shadow-none hover:border-secondary-400',
    elevated: 'bg-white border-transparent shadow-lg hover:shadow-xl'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  );
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`mt-4 pt-4 border-t border-secondary-200 ${className}`}>
      {children}
    </div>
  );
} 