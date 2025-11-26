/**
 * AuthInput Component
 * Styled input field for authentication forms
 */

import { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function AuthInput({ label, error, className = '', ...props }: AuthInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-brandText">
        {label}
      </label>
      <input
        className={`w-full rounded-xl border ${
          error ? 'border-red-300' : 'border-brandBorder'
        } bg-white px-4 py-2.5 text-sm text-brandText placeholder-brandText/50 transition focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
