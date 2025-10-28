"use client";

import Link from "next/link";
import FooterCookiesLink from "@/components/FooterCookiesLink";

type FooterProps = {
    onOpenPreferences: () => void;
};

export default function Footer({ onOpenPreferences }: FooterProps) {
    return (
        <footer className="w-full bg-transparent border-t border-brandBorder py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[12px] text-brandText-soft max-w-7xl mx-auto px-4">
                <p className="text-center">
                    Déployé avec ❤️ et sérénité grâce à CI/CD GitLab 🌿
                </p>

                <div className="flex items-center gap-3">
                    {/* bouton / lien qui ouvre la modale de préférences cookies */}
                    <FooterCookiesLink onOpenPreferences={onOpenPreferences} />

                    {/* lien vers la politique de cookies */}
                    <Link
                        href="/cookies-policy"
                        className="hover:text-brandText transition-colors"
                    >
                        Politique de cookies
                    </Link>
                </div>
            </div>
        </footer>
    );
}
