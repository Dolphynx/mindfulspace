"use client";

import { useEffect, useState } from "react";
import { hasConsent, acceptAllCookies } from "@/lib/cookieConsent";

export default function CookieBanner({
                                         onOpenPreferencesAction,
                                     }: {
    onOpenPreferencesAction: () => void;
}) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!hasConsent()) {
            setShow(true);
        }
    }, []);

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
                    <button
                        className="flex-1 rounded-md border border-brandGreen bg-brandGreen text-white px-4 py-2 text-sm font-medium shadow-subtle hover:opacity-90"
                        onClick={() => {
                            acceptAllCookies();
                            setShow(false);
                        }}
                    >
                        OK pour moi
                    </button>

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
