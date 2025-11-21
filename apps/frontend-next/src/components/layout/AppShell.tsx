"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import GlobalNotice from "@/components/GlobalNotice";
import {
    CookieBanner,
    CookiePreferencesModal,
    Footer,
} from "@/components/layout";

import {
    CookiePrefs,
    loadCookiePrefs,
    saveCookiePrefs,
    analyticsAllowed,
    personalizationAllowed,
} from "@/lib/cookieConsent";

type AppShellProps = {
    navbar?: ReactNode;
    children: ReactNode;
};

function getInitialPrefs(): CookiePrefs {
    const loaded = loadCookiePrefs();
    if (loaded) return loaded;
    return {
        analytics: false,
        personalization: false,
        essential: true,
        updatedAt: new Date().toISOString(),
    };
}

export default function AppShell({ navbar, children }: AppShellProps) {
    const pathname = usePathname();

    // Nouvelle structure : locale + segments
    // Exemple: /fr/member/seance/respiration
    const segments = pathname?.split("/") ?? [];
    // ["", "fr", "member", "seance", "respiration"]
    const isSession = segments.includes("seance");

    const [openPrefs, setOpenPrefs] = useState(false);
    const [prefs, setPrefs] = useState<CookiePrefs>(getInitialPrefs);

    useEffect(() => {
        const stored = loadCookiePrefs();
        if (!stored) return;

        if (analyticsAllowed()) initAnalytics();
        if (personalizationAllowed()) initPersonalization();
    }, []);

    function handleSavePrefs() {
        const nextPrefs: CookiePrefs = {
            ...prefs,
            essential: true,
            updatedAt: new Date().toISOString(),
        };
        saveCookiePrefs(nextPrefs);
        setPrefs(nextPrefs);
    }

    return (
        <>
            <GlobalNotice />

            <div className="min-h-screen flex flex-col bg-brandBg text-brandText border-t border-brandBorder">
                {/* Navbar injectée par le layout, masquée en séance */}
                {!isSession && navbar}

                <main className="flex-1">{children}</main>

                {!isSession && (
                    <Footer onOpenPreferencesAction={() => setOpenPrefs(true)} />
                )}
            </div>

            {!isSession && (
                <CookieBanner onOpenPreferencesAction={() => setOpenPrefs(true)} />
            )}

            <CookiePreferencesModal
                isOpen={openPrefs}
                onCloseAction={() => setOpenPrefs(false)}
                prefs={prefs}
                onChangePrefsAction={setPrefs}
                onSaveAction={handleSavePrefs}
            />
        </>
    );
}

function initAnalytics() {}
function initPersonalization() {}
