/**
 * AuthButton Component
 * Primary button for authentication actions
 */

import { ButtonHTMLAttributes } from 'react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function AuthButton({
  children,
  loading,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: AuthButtonProps) {
  const baseStyles = 'inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'border border-brandGreen bg-brandGreen text-white shadow-sm hover:bg-brandGreen/90',
    secondary: 'border border-brandBorder bg-white text-brandText hover:bg-brandSurface',
    ghost: 'text-brandGreen hover:bg-brandSurface/50',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
