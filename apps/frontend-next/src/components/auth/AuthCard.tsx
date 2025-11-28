/**
 * AuthCard Component
 * Container card for authentication forms
 */

import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="space-y-6 rounded-2xl border border-brandBorder bg-white/80 p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-brandText">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-brandText/70">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
