"use client";

import { useEffect, useState } from "react";

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
                <Navbar />

                <main className="flex-1">{children}</main>

                {/* ✅ on passe bien la fonction au Footer */}
                <Footer onOpenPreferences={() => setOpenPrefs(true)} />
            </div>

            <CookieBanner onOpenPreferences={() => setOpenPrefs(true)} />

            <CookiePreferencesModal
                isOpen={openPrefs}
                onClose={() => setOpenPrefs(false)}
                prefs={prefs}
                onChangePrefs={setPrefs}
                onSave={handleSavePrefs}
            />
        </>
    );
}

function initAnalytics() {}
function initPersonalization() {}
