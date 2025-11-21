"use client";

/**
 * Modale de gestion avancée des préférences cookies.
 *
 * Fonctionnalités :
 * - Permet d’activer / désactiver les cookies analytiques et de personnalisation.
 * - Les cookies essentiels sont affichés comme obligatoires (non modifiables).
 * - Conserve le focus au sein de la modale (meilleure accessibilité).
 * - Ferme la modale lorsqu’on clique en dehors ou sur Escape.
 *
 * Ce composant :
 * - NE gère PAS la persistance → confiée au parent via onSaveAction().
 * - NE gère PAS l'état d’ouverture → confié au parent via isOpen + onCloseAction().
 */

import { useEffect, useRef } from "react";
import { CookiePrefs } from "@/lib/cookieConsent";
import { useTranslations } from "@/i18n/TranslationContext";

/**
 * Propriétés du composant CookiePreferencesModal.
 */
type CookiePreferencesModalProps = {
    /** La modale est-elle visible ? */
    isOpen: boolean;

    /** Fonction pour fermer la modale */
    onCloseAction: () => void;

    /** Objet des préférences actuelles */
    prefs: CookiePrefs;

    /** Fonction pour modifier les préférences (case cochée / décochée) */
    onChangePrefsAction: (next: CookiePrefs) => void;

    /** Fonction appelée lorsqu'on clique sur “Enregistrer” */
    onSaveAction: () => void;
};

/**
 * Composant principal : Modale de préférences cookies.
 */
export default function CookiePreferencesModal({
                                                   isOpen,
                                                   onCloseAction,
                                                   prefs,
                                                   onChangePrefsAction,
                                                   onSaveAction,
                                               }: CookiePreferencesModalProps) {
    /**
     * Références au premier et au dernier élément focusable de la modale.
     * Ces références servent à “capturer” le focus clavier dans la modale
     * (accessibilité : empêcher Tab de sortir de la boîte).
     */
    const firstFocusableRef = useRef<HTMLElement | null>(null);
    const lastFocusableRef = useRef<HTMLElement | null>(null);

    /** Fonctions utilitaires pour attribuer les refs */
    const setFirstFocusableRef = (el: HTMLElement | null) => {
        firstFocusableRef.current = el;
    };
    const setLastFocusableRef = (el: HTMLElement | null) => {
        lastFocusableRef.current = el;
    };

    /** Hook i18n pour les textes spécifiques à cette modale */
    const t = useTranslations("cookieModal");

    /**
     * Effet : fermeture de la modale sur “Escape”.
     */
    useEffect(() => {
        if (!isOpen) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onCloseAction();
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onCloseAction]);

    /**
     * Effet : piège du focus dans la modale
     * - Tab / Shift+Tab restent dans la boîte
     * - focus initial sur le premier élément interactif
     */
    useEffect(() => {
        if (!isOpen) return;

        // Focus initial
        firstFocusableRef.current?.focus();

        const trap = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;
            if (!firstFocusableRef.current || !lastFocusableRef.current) return;

            const firstEl = firstFocusableRef.current;
            const lastEl = lastFocusableRef.current;

            // Si Shift+Tab depuis le premier, renvoyer au dernier
            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
            // Si Tab depuis le dernier, revenir au premier
            else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        };

        document.addEventListener("keydown", trap);
        return () => document.removeEventListener("keydown", trap);
    }, [isOpen]);

    /** Ne rien rendre si la modale n'est pas ouverte */
    if (!isOpen) return null;

    return (
        /**
         * Backdrop (fond assombri). Ferme la modale si on clique dessus.
         */
        <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 p-4"
            role="presentation"
            aria-hidden={false}
            onClick={(e) => {
                // Si on clique sur le fond (pas le contenu), fermer la modale
                if (e.target === e.currentTarget) {
                    onCloseAction();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-prefs-title"
                className="w-full max-w-md rounded-card bg-white p-6 shadow-xl outline-none border border-brandBorder"
            >
                {/* --- Titre de la fenêtre modale --- */}
                <h2
                    id="cookie-prefs-title"
                    className="text-lg font-semibold text-brandText mb-4"
                >
                    {t("title")}
                </h2>

                {/* --- Options de préférences cookie --- */}
                <div className="space-y-4 text-sm text-brandText-soft">

                    {/** Option : cookies analytiques */}
                    <section className="flex items-start gap-3">
                        <input
                            ref={setFirstFocusableRef} // premier élément focusable
                            id="analytics"
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-brandBorder"
                            checked={prefs.analytics}
                            onChange={(e) =>
                                onChangePrefsAction({
                                    ...prefs,
                                    analytics: e.target.checked,
                                })
                            }
                        />
                        <label htmlFor="analytics" className="flex-1">
                            <span className="font-medium text-brandText block">
                                {t("analyticsTitle")}
                            </span>
                            <span>{t("analyticsDescription")}</span>
                        </label>
                    </section>

                    {/** Option : personnalisation */}
                    <section className="flex items-start gap-3">
                        <input
                            id="personalization"
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-brandBorder"
                            checked={prefs.personalization}
                            onChange={(e) =>
                                onChangePrefsAction({
                                    ...prefs,
                                    personalization: e.target.checked,
                                })
                            }
                        />
                        <label htmlFor="personalization" className="flex-1">
                            <span className="font-medium text-brandText block">
                                {t("personalizationTitle")}
                            </span>
                            <span>{t("personalizationDescription")}</span>
                        </label>
                    </section>

                    {/** Option : cookies essentiels (non modifiable) */}
                    <section className="flex items-start gap-3">
                        <input
                            id="essential"
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-brandBorder"
                            checked
                            disabled
                        />
                        <label htmlFor="essential" className="flex-1">
                            <span className="font-medium text-brandText block">
                                {t("essentialTitle")}
                            </span>
                            <span>{t("essentialDescription")}</span>
                        </label>
                    </section>
                </div>

                {/* --- Boutons en bas de la modale --- */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        className="rounded-md border border-brandBorder bg-white px-4 py-2 text-sm font-medium text-brandText hover:bg-brandBg"
                        onClick={onCloseAction}
                    >
                        {t("cancel")}
                    </button>

                    <button
                        ref={setLastFocusableRef} // dernier élément focusable
                        type="button"
                        className="rounded-md bg-brandGreen px-4 py-2 text-sm font-semibold text-white shadow-subtle hover:opacity-90"
                        onClick={() => {
                            onSaveAction();    // enregistre les préférences
                            onCloseAction();   // ferme la modale
                        }}
                    >
                        {t("save")}
                    </button>
                </div>
            </div>
        </div>
    );
}
