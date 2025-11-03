"use client";

import { useEffect, useRef } from "react";
import { CookiePrefs } from "@/lib/cookieConsent";

type CookiePreferencesModalProps = {
    isOpen: boolean;
    onCloseAction: () => void;
    prefs: CookiePrefs;
    onChangePrefsAction: (next: CookiePrefs) => void;
    onSaveAction: () => void;
};

export default function CookiePreferencesModal({
                                                   isOpen,
                                                   onCloseAction,
                                                   prefs,
                                                   onChangePrefsAction,
                                                   onSaveAction,
                                               }: CookiePreferencesModalProps) {
    const firstFocusableRef = useRef<HTMLElement | null>(null);
    const lastFocusableRef = useRef<HTMLElement | null>(null);

    const setFirstFocusableRef = (el: HTMLElement | null) => {
        firstFocusableRef.current = el;
    };
    const setLastFocusableRef = (el: HTMLElement | null) => {
        lastFocusableRef.current = el;
    };

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

    useEffect(() => {
        if (!isOpen) return;

        firstFocusableRef.current?.focus();

        const trap = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;
            if (!firstFocusableRef.current || !lastFocusableRef.current) return;

            const firstEl = firstFocusableRef.current;
            const lastEl = lastFocusableRef.current;

            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        };

        document.addEventListener("keydown", trap);
        return () => document.removeEventListener("keydown", trap);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 p-4"
            role="presentation"
            aria-hidden={false}
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
