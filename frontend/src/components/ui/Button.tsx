import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

const VARIANTS = {
  primary: 'text-deep-navy border-0',
  secondary:
    'bg-transparent text-text-primary border border-border hover:border-atlas-teal hover:bg-atlas-teal/5',
  ghost: 'bg-transparent text-atlas-teal border-0 hover:bg-atlas-teal/10',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const style =
    variant === 'primary'
      ? {
          background: 'linear-gradient(135deg, #14DFC8 0%, #0BBFAA 60%, #085A50 100%)',
        }
      : {};

  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
