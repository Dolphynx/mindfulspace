"use client";

/**
 * Modal de gestion détaillée des préférences de cookies.
 *
 * - Affiche une fenêtre modale centrée avec différents types de cookies.
 * - Permet à l'utilisateur d'activer / désactiver :
 *   - les cookies analytiques,
 *   - la personnalisation.
 * - Les cookies essentiels sont toujours activés (case cochée et désactivée).
 *
 * Accessibilité :
 * - Focus trap (le focus reste dans le modal tant qu'il est ouvert).
 * - Fermeture via la touche `Escape`.
 * - Fermeture en cliquant sur le fond (overlay) autour du modal.
 */

import { useEffect, useRef } from "react";
import { CookiePrefs } from "@/lib/cookieConsent";

/**
 * Propriétés attendues par le composant CookiePreferencesModal.
 */
type CookiePreferencesModalProps = {
    /** Indique si le modal est visible (true) ou caché (false). */
    isOpen: boolean;
    /** Callback appelé lorsqu'on souhaite fermer le modal (clic fond, bouton Annuler, Escape, etc.). */
    onCloseAction: () => void;
    /** Préférences de cookies actuellement sélectionnées. */
    prefs: CookiePrefs;
    /** Callback pour mettre à jour les préférences dans le state parent. */
    onChangePrefsAction: (next: CookiePrefs) => void;
    /** Callback appelé lorsqu'on clique sur "Enregistrer" (persistance des prefs côté parent). */
    onSaveAction: () => void;
};

/**
 * Composant modal de préférences cookies.
 *
 * @param isOpen - Contrôle la visibilité du modal.
 * @param onCloseAction - Fonction appelée pour fermer le modal.
 * @param prefs - Valeurs actuelles des préférences cookies.
 * @param onChangePrefsAction - Fonction de mise à jour des préférences.
 * @param onSaveAction - Fonction de sauvegarde des préférences.
 */
export default function CookiePreferencesModal({
                                                   isOpen,
                                                   onCloseAction,
                                                   prefs,
                                                   onChangePrefsAction,
                                                   onSaveAction,
                                               }: CookiePreferencesModalProps) {
    /**
     * Référence vers le premier élément focusable dans le modal
     * (ici, la checkbox "Cookies analytiques").
     *
     * Utilisé pour :
     * - donner le focus au premier élément à l'ouverture,
     * - gérer le "focus trap" avec Shift+Tab.
     */
    const firstFocusableRef = useRef<HTMLElement | null>(null);

    /**
     * Référence vers le dernier élément focusable dans le modal
     * (ici, le bouton "Enregistrer").
     *
     * Utilisé pour :
     * - gérer le "focus trap" avec Tab (sans Shift),
     * - boucler le focus de la fin vers le début.
     */
    const lastFocusableRef = useRef<HTMLElement | null>(null);

    /**
     * Setter dédié pour la première ref focusable
     * (permet de l'utiliser directement sur `ref={...}` dans le JSX).
     */
    const setFirstFocusableRef = (el: HTMLElement | null) => {
        firstFocusableRef.current = el;
    };

    /**
     * Setter dédié pour la dernière ref focusable.
     */
    const setLastFocusableRef = (el: HTMLElement | null) => {
        lastFocusableRef.current = el;
    };

    /**
     * Effet qui gère la fermeture du modal avec la touche Escape.
     *
     * - N'est actif que lorsque le modal est ouvert.
     * - Ajoute un listener sur `window` à l'ouverture,
     *   et le retire au démontage / fermeture.
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
     * Effet qui gère :
     * - le focus initial dans le modal (focus sur le premier élément focusable),
     * - le "focus trap" (Tab / Shift+Tab ne sortent pas du modal).
     *
     * Le focus trap fonctionne ainsi :
     * - Si on est sur le premier élément et qu'on presse Shift+Tab,
     *   on bloque et on renvoie le focus sur le dernier élément.
     * - Si on est sur le dernier élément et qu'on presse Tab,
     *   on bloque et on renvoie le focus sur le premier élément.
     */
    useEffect(() => {
        if (!isOpen) return;

        // Donne le focus au premier élément lors de l'ouverture
        firstFocusableRef.current?.focus();

        const trap = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;
            if (!firstFocusableRef.current || !lastFocusableRef.current) return;

            const firstEl = firstFocusableRef.current;
            const lastEl = lastFocusableRef.current;

            // Shift+Tab depuis le premier élément → focus sur le dernier
            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
            // Tab depuis le dernier élément → focus sur le premier
            else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        };

        document.addEventListener("keydown", trap);
        return () => document.removeEventListener("keydown", trap);
    }, [isOpen]);

    // Si le modal n'est pas ouvert, ne rien rendre (optimisation + comportement attendu).
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 p-4"
            role="presentation"
            aria-hidden={false}
            // Clic sur le fond (overlay) → fermeture du modal
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onCloseAction();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-prefs-title"
                className="w-full max-w-md rounded-card bg-white p-6 shadow-xl outline-none focus:outline-none border border-brandBorder"
            >
                <h2
                    id="cookie-prefs-title"
                    className="text-lg font-semibold text-brandText mb-4"
                >
                    Préférences cookies
                </h2>

                <div className="space-y-4 text-sm text-brandText-soft">
                    {/* Section : cookies analytiques */}
                    <section className="flex items-start gap-3">
                        <input
                            ref={setFirstFocusableRef}
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
                                Cookies analytiques
                            </span>
                            <span className="text-brandText-soft">
                                Nous aident à comprendre comment l’application
                                est utilisée.
                            </span>
                        </label>
                    </section>

                    {/* Section : personnalisation */}
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
                                Personnalisation
                            </span>
                            <span className="text-brandText-soft">
                                Permet de personnaliser le contenu affiché pour
                                toi.
                            </span>
                        </label>
                    </section>

                    {/* Section : cookies essentiels (toujours actifs, non modifiables) */}
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
                                Cookies essentiels
                            </span>
                            <span className="text-brandText-soft">
                                Nécessaires au fonctionnement de
                                l’application.
                            </span>
                        </label>
                    </section>
                </div>

                {/* Boutons d'action du modal : Annuler / Enregistrer */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        className="rounded-md border border-brandBorder bg-white px-4 py-2 text-sm font-medium text-brandText hover:bg-brandBg"
                        onClick={onCloseAction}
                    >
                        Annuler
                    </button>

                    <button
                        ref={setLastFocusableRef}
                        type="button"
                        className="rounded-md bg-brandGreen px-4 py-2 text-sm font-semibold text-white shadow-subtle hover:opacity-90"
                        onClick={() => {
                            // Sauvegarde des préférences puis fermeture du modal
                            onSaveAction();
                            onCloseAction();
                        }}
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}
