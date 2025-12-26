"use client";

/**
 * AuthButtons Component
 * ---------------------
 * Displays login/register buttons when not authenticated.
 *
 * Variants:
 * - default (navbar): if authenticated, shows the UserMenu dropdown.
 * - inpage: if authenticated, shows a single button linking to the profile page.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/i18n/TranslationContext";
import UserMenu from "./UserMenu";

type AuthButtonsProps = {
    /**
     * Rendering variant.
     *
     * @default "default"
     */
    variant?: "default" | "inpage";
};

export default function AuthButtons({ variant = "default" }: AuthButtonsProps) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en";
    const t = useTranslations("auth");

    if (loading) {
        return <div className="h-9 w-20 animate-pulse rounded-lg bg-brandBorder" />;
    }

    // Authenticated
    if (user) {
        if (variant === "inpage") {
            return (
                <Link
                    href={`/${locale}/member/profile`}
                    className="rounded-lg border border-brandGreen bg-brandGreen px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brandGreen/90"
                >
                    {t("goToProfile")}
                </Link>
            );
        }

        // default navbar behavior
        return <UserMenu />;
    }

    // Not authenticated
    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/${locale}/auth/login`}
                className="rounded-lg border border-brandBorder bg-white px-4 py-2 text-sm font-medium text-brandText transition hover:bg-brandSurface"
            >
                {t("signIn")}
            </Link>
            <Link
                href={`/${locale}/auth/register`}
                className="rounded-lg border border-brandGreen bg-brandGreen px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brandGreen/90"
            >
                {t("signUp")}
            </Link>
        </div>
    );
}
