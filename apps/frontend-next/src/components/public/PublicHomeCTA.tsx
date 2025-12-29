"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AuthButton from "@/components/auth/AuthButton";

/**
 * Translation subset required by {@link PublicHomeCTA}.
 */
type PublicHomeCTATranslations = {
    /**
     * Label for the registration button.
     */
    registerButton: string;

    /**
     * Label for the login button.
     */
    loginButton: string;

    /**
     * Label for the access button when the user is authenticated.
     */
    accessWorldButton: string;

    /**
     * Informational disclaimer displayed under authentication actions.
     */
    disclaimer: string;
};

/**
 * Props for {@link PublicHomeCTA}.
 */
interface Props {
    /**
     * Active locale used to build localized routes.
     */
    locale: string;

    /**
     * Translation strings used by the component.
     */
    t: PublicHomeCTATranslations;
}

/**
 * PublicHomeCTA
 * -------------
 * Client-side call-to-action block rendered on the public home page.
 *
 * Behavior:
 * - If the user is authenticated: displays a single button linking to the member world.
 * - If the user is not authenticated: displays two actions:
 *   - Register
 *   - Login
 *
 * This component relies on {@link useAuth} and must be rendered on the client.
 */
export default function PublicHomeCTA({ locale, t }: Props) {
    const { user, loading } = useAuth();

    if (user) {
        return (
            <Link
                href={`/${locale}/member/world-v2`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-brandGreen bg-brandGreen px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brandGreen/90"
            >
                {t.accessWorldButton}
            </Link>
        );
    }

    return (
        <div className="space-y-3">
            <Link href={`/${locale}/auth/register`} className="block">
                <AuthButton loading={loading}>
                    {t.registerButton}
                </AuthButton>
            </Link>

            <Link href={`/${locale}/auth/login`} className="block">
                <AuthButton variant="secondary" disabled={loading}>
                    {t.loginButton}
                </AuthButton>
            </Link>

            <p className="pt-1 text-xs text-brandText/70">
                {t.disclaimer}
            </p>
        </div>
    );
}
