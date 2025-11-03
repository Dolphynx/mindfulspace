"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import GlobalNotice from "@/components/GlobalNotice";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";
import CookiePreferencesModal from "@/components/CookiePreferencesModal";
import Footer from "@/components/Footer";

import {
    CookiePrefs,
    loadCookiePrefs,
    saveCookiePrefs,
    analyticsAllowed,
    personalizationAllowed,
} from "@/lib/cookieConsent";

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

export default function AppChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isSession = pathname?.startsWith("/seance/") ?? false;

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
                {/* Masquer le menu pendant la séance */}
                {!isSession && <Navbar />}

                <main className="flex-1">{children}</main>

                {!isSession && <Footer onOpenPreferencesAction={() => setOpenPrefs(true)} />}
            </div>

            {/* Bannière cookies uniquement hors séance */}
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
