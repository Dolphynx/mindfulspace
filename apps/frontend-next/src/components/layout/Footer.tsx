"use client";

/**
 * Footer de l'application.
 *
 * - Affiche un message de crédit / déploiement.
 * - Propose :
 *   - un lien / bouton pour ouvrir les préférences de cookies,
 *   - un lien vers la page de politique de cookies.
 *
 * Ce composant est purement présentational : toute la logique
 * (ouverture du modal, gestion des prefs, etc.) est gérée dans le parent.
 */

import Link from "next/link";
import { FooterCookiesLink } from "@/components/layout/";

/**
 * Propriétés du composant Footer.
 */
type FooterProps = {
    /**
     * Callback déclenché lorsqu'on clique sur le lien "préférences cookies".
     *
     * → En pratique, le parent (ex. AppChrome) utilise cette fonction pour
     *    ouvrir le modal de gestion des préférences.
     */
    onOpenPreferencesAction: () => void;
};

/**
 * Composant Footer global.
 *
 * @param onOpenPreferencesAction - Fonction pour ouvrir le modal des préférences cookies.
 *
 * Usage :
 * - À placer en bas de page dans le layout principal.
 * - Le parent reste responsable de l'état d'ouverture du modal.
 */
export default function Footer({ onOpenPreferencesAction }: FooterProps) {
    return (
        <footer className="w-full bg-transparent border-t border-brandBorder py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[12px] text-brandText-soft max-w-7xl mx-auto px-4">
                {/* Message de crédit / déploiement */}
                <p className="text-center">
                    Déployé avec ❤️ et sérénité grâce à CI/CD GitLab 🌿
                </p>

                <div className="flex items-center gap-3">
                    {/* Bouton / lien qui ouvre la modale de préférences cookies.
                       → Délégué à FooterCookiesLink pour garder le Footer simple. */}
                    <FooterCookiesLink onOpenPreferencesAction={onOpenPreferencesAction} />

                    {/* Lien vers la page de politique de cookies.
                       → Page statique ou CMS selon l'implémentation du projet. */}
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
