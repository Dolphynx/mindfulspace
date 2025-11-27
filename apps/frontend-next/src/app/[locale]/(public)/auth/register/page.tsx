'use client';

/**
 * Register Page
 * User registration with email verification
 */

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/i18n/TranslationContext';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import AuthDivider from '@/components/auth/AuthDivider';
import OAuthButtons from '@/components/auth/OAuthButtons';

export default function RegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { register } = useAuth();
  const t = useTranslations('auth');
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return t('passwordMinLength');
    }
    if (!/[A-Z]/.test(password)) {
      return t('passwordUppercase');
    }
    if (!/[a-z]/.test(password)) {
      return t('passwordLowercase');
    }
    if (!/[0-9]/.test(password)) {
      return t('passwordNumber');
    }
    if (!/[@$!%*?&]/.test(password)) {
      return t('passwordSpecial');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validation
    const newErrors: Record<string, string> = {};

    if (formData.displayName.length < 2) {
      newErrors.displayName = t('nameMinLength');
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsNoMatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrors({ general: err.message || t('registrationFailed') });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <AuthCard
          title={t('checkEmailTitle')}
          subtitle={t('checkEmailSubtitle')}
        >
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brandGreen/10">
              <svg className="h-8 w-8 text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <p className="text-sm text-brandText/70">
              {t('checkEmailMessage').replace('{email}', formData.email)}
            </p>

            <p className="text-xs text-brandText/60">
              {t('checkEmailNote')}
            </p>

            <AuthButton onClick={() => router.push(`/${locale}/auth/login`)} variant="secondary">
              {t('backToLogin')}
            </AuthButton>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <AuthCard
        title={t('registerTitle')}
        subtitle={t('registerSubtitle')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <AuthInput
            label={t('fullNameLabel')}
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder={t('fullNamePlaceholder')}
            error={errors.displayName}
            required
            autoComplete="name"
          />

          <AuthInput
            label={t('emailLabel')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder={t('emailPlaceholder')}
            error={errors.email}
            required
            autoComplete="email"
          />

          <AuthInput
            label={t('passwordLabel')}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={t('passwordPlaceholder')}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <AuthInput
            label={t('confirmPasswordLabel')}
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder={t('passwordPlaceholder')}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <p className="text-xs text-brandText/60">
            {t('passwordRequirements')}
          </p>

          <AuthButton type="submit" loading={loading}>
            {t('createAccountButton')}
          </AuthButton>
        </form>

        <AuthDivider text={t('orContinueWith')} />

        <OAuthButtons />

        <p className="mt-6 text-center text-sm text-brandText/70">
          {t('alreadyHaveAccount')}{' '}
          <Link href={`/${locale}/auth/login`} className="font-medium text-brandGreen hover:underline">
            {t('signInLink')}
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
