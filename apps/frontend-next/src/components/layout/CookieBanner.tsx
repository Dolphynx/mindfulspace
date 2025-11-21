"use client";

/**
 * Bannière de consentement aux cookies.
 *
 * - Affiche un message lorsque l’utilisateur visite le site sans consentement enregistré.
 * - Permet de :
 *   - accepter tous les cookies directement,
 *   - ouvrir la modale des préférences avancées.
 *
 * Ce composant ne gère AUCUNE logique persistante.
 * → Toute la persistance (save / load) est effectuée dans cookieConsent.ts
 * → Toute l’ouverture de la modale est déléguée au parent via un callback.
 */

import { useEffect, useState } from "react";
import { hasConsent, acceptAllCookies } from "@/lib/cookieConsent";
import { useTranslations } from "@/i18n/TranslationContext";

/**
 * Propriétés du composant CookieBanner.
 *
 * @param onOpenPreferencesAction - Callback déclenché lorsqu'on clique sur
 *                                  le bouton "Je choisis" (ouvrir la modale).
 */
export default function CookieBanner({
                                         onOpenPreferencesAction,
                                     }: {
    onOpenPreferencesAction: () => void;
}) {
    /**
     * État local gérant l’affichage de la bannière.
     * - true  → visible
     * - false → masquée
     *
     * La bannière est affichée tant qu’aucun consentement n’a été enregistré.
     */
    const [show, setShow] = useState(false);

    /**
     * Hook i18n permettant d’obtenir les traductions :
     * t("title"), t("description"), t("acceptAll"), ...
     */
    const t = useTranslations("cookieBanner");

    /**
     * Au montage du composant (client-side uniquement), on vérifie si un
     * consentement a déjà été enregistré :
     * - Si oui → on ne montre pas la bannière.
     * - Si non → show = true → affichage.
     */
    useEffect(() => {
        if (!hasConsent()) {
            setShow(true);
        }
    }, []);

    /** Si pas d’affichage requis → on ne rend rien */
    if (!show) return null;

    return (
        <div className="fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-4">
            <div className="w-full max-w-md rounded-card border border-brandBorder bg-white shadow-xl p-5 text-brandText">

                {/* --- Titre de la bannière --- */}
                <p className="text-base font-semibold text-brandText">
                    {t("title")}
                </p>

                {/* --- Description du rôle des cookies --- */}
                <p className="text-sm text-brandText-soft mt-2">
                    {t("description")}
                </p>

                {/* --- Boutons d'action --- */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    {/* Bouton : accepter tous les cookies immédiatement */}
                    <button
                        className="flex-1 rounded-md border border-brandGreen bg-brandGreen text-white px-4 py-2 text-sm font-medium shadow-subtle hover:opacity-90"
                        onClick={() => {
                            acceptAllCookies(); // enregistre un consentement “full”
                            setShow(false);      // ferme la bannière
                        }}
                    >
                        {t("acceptAll")}
                    </button>

                    {/* Bouton : ouvrir la modale de préférences détaillées */}
                    <button
                        className="flex-1 rounded-md border border-brandBorder bg-white text-brandText px-4 py-2 text-sm font-medium hover:bg-brandBg"
                        onClick={onOpenPreferencesAction}
                    >
                        {t("choose")}
                    </button>
                </div>

                {/* --- Petit texte additionnel d’information --- */}
                <p className="text-[11px] text-brandText-soft mt-3 leading-relaxed">
                    {t("hint")}
                </p>
            </div>
        </div>
    );
}
