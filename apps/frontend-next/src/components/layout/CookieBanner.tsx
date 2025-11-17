"use client";

/**
 * Bannière de consentement cookies affichée en bas de l'écran.
 *
 * - Apparaît uniquement si l'utilisateur n'a pas encore donné ou refusé son consentement.
 * - Propose deux actions :
 *   1. "OK pour moi" → accepte tous les cookies immédiatement.
 *   2. "Je choisis" → ouvre le modal de préférences afin de personnaliser le consentement.
 *
 * - Cette bannière disparaît automatiquement :
 *   - dès que l'utilisateur a donné un consentement,
 *   - ou après validation d'une option.
 *
 * Composant léger : la logique de stockage/suivi est externalisée dans lib/cookieConsent.
 */

import { useEffect, useState } from "react";
import { hasConsent, acceptAllCookies } from "@/lib/cookieConsent";

/**
 * Props attendues par la CookieBanner.
 */
export default function CookieBanner({
                                         onOpenPreferencesAction,
                                     }: {
    /**
     * Callback permettant d’ouvrir la modale avancée de préférences cookies.
     * → Transmis depuis AppChrome (le parent).
     */
    onOpenPreferencesAction: () => void;
}) {
    /**
     * État local "show" : détermine si la bannière doit être affichée.
     *
     * - false au départ → la bannière n’apparaît pas immédiatement (évite un flicker).
     * - Après vérification (useEffect), on l’affiche si aucun consentement n’est présent.
     */
    const [show, setShow] = useState(false);

    /**
     * Effet exécuté uniquement au montage du composant :
     * - Vérifie si un consentement existe déjà via `hasConsent()`.
     * - Si ce n’est pas le cas → affichage de la bannière.
     */
    useEffect(() => {
        if (!hasConsent()) {
            setShow(true);
        }
    }, []);

    // Si pas besoin d'afficher la bannière → ne rien rendre.
    if (!show) return null;

    return (
        <div className="fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-4">
            <div className="w-full max-w-md rounded-card border border-brandBorder bg-white shadow-xl p-5 text-brandText">
                <p className="text-base font-semibold text-brandText">
                    Cookies & bien-être 🍪
                </p>

                <p className="text-sm text-brandText-soft mt-2">
                    On utilise des cookies essentiels pour faire fonctionner le
                    site. Avec ton accord, on utilise aussi des cookies pour
                    analyser l’usage et personnaliser ton expérience.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    {/* Bouton principal : accepter tous les cookies */}
                    <button
                        className="flex-1 rounded-md border border-brandGreen bg-brandGreen text-white px-4 py-2 text-sm font-medium shadow-subtle hover:opacity-90"
                        onClick={() => {
                            // Accepte toutes les catégories
                            acceptAllCookies();
                            // Masque la bannière après action
                            setShow(false);
                        }}
                    >
                        OK pour moi
                    </button>

                    {/* Ouvre la modale de préférences détaillées */}
                    <button
                        className="flex-1 rounded-md border border-brandBorder bg-white text-brandText px-4 py-2 text-sm font-medium hover:bg-brandBg"
                        onClick={() => {
                            onOpenPreferencesAction();
                        }}
                    >
                        Je choisis
                    </button>
                </div>

                <p className="text-[11px] text-brandText-soft mt-3 leading-relaxed">
                    Tu peux modifier tes choix à tout moment dans “Cookies”.
                </p>
            </div>
        </div>
    );
}
