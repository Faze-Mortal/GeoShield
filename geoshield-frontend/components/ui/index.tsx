'use client';

import React from 'react';

interface BadgeProps {
  label: string;
  className?: string;
}

export function Badge({ label, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}

interface SpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <svg
      className={`animate-spin ${dim} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

interface ErrorNoticeProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorNotice({ message, onRetry, className = '' }: ErrorNoticeProps) {
  return (
    <div className={`rounded border border-red-500/40 bg-red-950/70 px-3 py-2 text-xs text-red-200 ${className}`}>
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1.5 rounded bg-red-600/80 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-red-500 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary: 'bg-sky-600 text-white hover:bg-sky-500',
    ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800',
  };
  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1.5 text-xs',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
