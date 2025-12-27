"use client";

/**
 * UserMenu Component
 * ------------------
 * Affiche un bouton avatar (initiales) et un dropdown lorsque l’utilisateur est authentifié.
 *
 * @remarks
 * - Le bouton trigger est volontairement "avatar only" (pas de nom) pour rester compact en navbar.
 * - Le menu se ferme au clic extérieur et après navigation.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/i18n/TranslationContext";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export default function UserMenu() {
    const { user, logout } = useAuth();
    const t = useTranslations("auth");

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const router = useRouter();

    const params = useParams<{ locale?: string }>();
    const raw = params.locale ?? defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = async () => {
        await logout();
        router.push(`/${locale}`);
    };

    if (!user) return null;

    const initials = user.displayName
        ? user.displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : user.email[0]?.toUpperCase() ?? "U";

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className="inline-flex items-center justify-center rounded-full border border-brandBorder bg-white/70 p-1 transition hover:bg-brandSurface"
            >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brandGreen text-sm font-semibold text-white">
                    {initials}
                </div>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-brandBorder bg-white shadow-lg z-50"
                    role="menu"
                    aria-label="User menu"
                >
                    <div className="border-b border-brandBorder px-4 py-3">
                        <p className="text-sm font-medium text-brandText">{user.displayName}</p>
                        <p className="text-xs text-brandText/70">{user.email}</p>

                        {user.roles && user.roles.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                    <span
                                        key={role}
                                        className="rounded-full bg-brandGreen/10 px-2 py-0.5 text-xs text-brandGreen"
                                    >
                    {role}
                  </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="py-1">
                        <Link
                            href={`/${locale}/member/world-v2`}
                            className="block px-4 py-2 text-sm text-brandText transition hover:bg-brandSurface"
                            onClick={() => setIsOpen(false)}
                            role="menuitem"
                        >
                            {t("myWorld")}
                        </Link>

                        <Link
                            href={`/${locale}/member/profile`}
                            className="block px-4 py-2 text-sm text-brandText transition hover:bg-brandSurface"
                            onClick={() => setIsOpen(false)}
                            role="menuitem"
                        >
                            {t("profileSettings")}
                        </Link>
                    </div>

                    <div className="border-t border-brandBorder py-1">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                            role="menuitem"
                        >
                            {t("signOut")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
