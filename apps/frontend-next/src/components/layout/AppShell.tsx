"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import GlobalNotice from "@/components/GlobalNotice";
import { CookieBanner, CookiePreferencesModal, Footer } from "@/components/layout";

import {
    CookiePrefs,
    loadCookiePrefs,
    saveCookiePrefs,
    analyticsAllowed,
    personalizationAllowed,
} from "@/lib/cookieConsent";

/**
 * Props du composant {@link AppShell}.
 */
type AppShellProps = {
    /**
     * Barre de navigation fournie par le layout (ex: {@link MainNavbar}).
     *
     * @remarks
     * Injectée pour permettre de varier la navbar selon le contexte (public, client, admin…).
     */
    navbar?: ReactNode;

    /**
     * Contenu de la page (route actuelle).
     */
    children: ReactNode;
};

/**
 * Construit les préférences cookies initiales.
 *
 * @remarks
 * - Tente de charger les préférences depuis le storage.
 * - Sinon, retourne une configuration par défaut (essentiels actifs, reste inactif).
 */
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

/**
 * Squelette global de l’application.
 *
 * @remarks
 * Responsabilités :
 * - Afficher un header sticky unifié : **GlobalNotice + Navbar**.
 *   Cela évite les effets de "navbar qui remonte" lorsque la page ne scrolle pas réellement.
 * - Encapsuler les pages avec une structure `min-h-screen` (footer en bas).
 * - Gérer le bandeau cookies + la modale de préférences.
 * - Désactiver navbar/footer sur les routes de type "séance" (immersion).
 *
 * Comportement en mode "séance" :
 * - Navbar et Footer masqués (focus utilisateur).
 * - La notice globale peut rester affichée (si tu le souhaites).
 */
export default function AppShell({ navbar, children }: AppShellProps) {
    const pathname = usePathname();

    /**
     * Détermine si la route actuelle correspond à une séance.
     *
     * @example
     * /fr/member/seance/respiration -> true
     */
    const segments = pathname?.split("/") ?? [];
    const isSession = segments.includes("seance");

    const [openPrefs, setOpenPrefs] = useState(false);
    const [prefs, setPrefs] = useState<CookiePrefs>(getInitialPrefs);

    /**
     * Initialise des features optionnelles selon les préférences cookies stockées.
     *
     * @remarks
     * - Si aucune préférence n’existe, on ne lance rien.
     * - Sinon, on initialise analytics/personnalisation si autorisées.
     */
    useEffect(() => {
        const stored = loadCookiePrefs();
        if (!stored) return;

        if (analyticsAllowed()) initAnalytics();
        if (personalizationAllowed()) initPersonalization();
    }, []);

    /**
     * Persiste les préférences cookies et met à jour l’état local.
     */
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
            {/* ------------------------------------------------------------------ */}
            {/* Header sticky unifié : Notice + Navbar                              */}
            {/* ------------------------------------------------------------------ */}
            {!isSession && (
                <div className="sticky top-0 z-[100]">
                    <GlobalNotice />
                    {navbar}
                </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* Layout principal                                                    */}
            {/* ------------------------------------------------------------------ */}
            <div className="min-h-screen flex flex-col bg-brandBg text-brandText border-t border-brandBorder">
                {/* En séance : pas de navbar/footer ; on peut afficher la notice seule */}
                {isSession && <GlobalNotice />}

                <main className="flex-1 min-h-0">{children}</main>

                {!isSession && (
                    <Footer onOpenPreferencesAction={() => setOpenPrefs(true)} />
                )}
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* Cookies                                                             */}
            {/* ------------------------------------------------------------------ */}
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

/**
 * Initialise l’analytics (stub).
 *
 * @remarks
 * À remplacer par l’intégration réelle (GA, Plausible, etc.).
 */
function initAnalytics() {}

/**
 * Initialise la personnalisation (stub).
 *
 * @remarks
 * À remplacer par la logique réelle (AB tests, recommandations, etc.).
 */
function initPersonalization() {}
