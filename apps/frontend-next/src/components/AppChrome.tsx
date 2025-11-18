"use client";

/**
 * Composant "chrome" global de l'application.
 *
 * - Gère l'affichage du layout principal (Navbar, footer, etc.).
 * - Centralise la gestion de la bannière cookies et du modal de préférences.
 * - Masque la navigation lors d'une séance (URL commençant par /seance/).
 *
 * ⚠️ Important :
 * - Ce composant doit entourer toutes les pages Next qui font partie de l'app.
 * - La logique de consentement cookies est centralisée ici pour éviter les duplications.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import GlobalNotice from "@/components/GlobalNotice";
import {
    Navbar,
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

/**
 * Retourne les préférences de cookies initiales.
 *
 * - Si des préférences sont déjà stockées en local (localStorage, cookie…),
 *   on les réutilise.
 * - Sinon, on génère un objet par défaut :
 *   - essential: true → les cookies essentiels sont toujours activés
 *   - analytics / personalization: false par défaut (opt-in)
 *   - updatedAt: timestamp ISO pour tracer la dernière mise à jour
 *
 * Cette fonction est utilisée comme "lazy initializer" pour useState,
 * afin d'éviter de recalculer les préférences à chaque rendu.
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
 * Composant de layout global de l'application.
 *
 * @param children - Le contenu spécifique à chaque page (fourni par Next).
 *
 * Responsabilités principales :
 * - Déterminer si l'on se trouve dans une page de séance (`/seance/...`) :
 *   - si OUI : cacher la navbar, le footer et la bannière cookies.
 *   - si NON : afficher la chrome complète.
 * - Gérer l'état du modal de préférences cookies (ouvert/fermé).
 * - Charger et sauvegarder les préférences cookies de l'utilisateur.
 * - Initialiser les services d'analytics / personnalisation en fonction du consentement.
 */
export default function AppChrome({ children }: { children: React.ReactNode }) {
    // Récupère le chemin courant (ex: "/seance/123", "/profil", etc.)
    const pathname = usePathname();
    // Indique si on est sur une route de séance. On masque alors certains éléments d'UI.
    const isSession = pathname?.startsWith("/seance/") ?? false;

    /**
     * État contrôlant l'ouverture du modal de préférences cookies.
     * - false : modal fermé
     * - true : modal visible
     */
    const [openPrefs, setOpenPrefs] = useState(false);

    /**
     * État contenant les préférences cookies actuelles.
     * Initialisé une seule fois via getInitialPrefs (lazy init).
     */
    const [prefs, setPrefs] = useState<CookiePrefs>(getInitialPrefs);

    /**
     * Effet déclenché après le premier rendu côté client.
     *
     * - Recharge les prefs depuis la source persistée si disponible.
     * - En fonction des helper `analyticsAllowed` et `personalizationAllowed`,
     *   initialise les services correspondants.
     *
     * ⚠️ Remarque :
     * - On ne met pas stored dans le state ici (on se base sur getInitialPrefs).
     * - L'appel à `loadCookiePrefs` permet de vérifier la présence de prefs existantes.
     */
    useEffect(() => {
        const stored = loadCookiePrefs();
        if (!stored) return;

        if (analyticsAllowed()) initAnalytics();
        if (personalizationAllowed()) initPersonalization();
    }, []);

    /**
     * Handler appelé lorsque l'utilisateur valide ses préférences dans le modal.
     *
     * Règles métier :
     * - essential est toujours forcé à true (les cookies essentiels sont requis).
     * - updatedAt est mis à jour au moment de l'enregistrement.
     * - Les nouvelles prefs sont :
     *   - sauvegardées côté client via `saveCookiePrefs`
     *   - re-injectées dans l'état local `prefs`.
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
            {/* Message global en haut de la page (annonces, infos, alertes, etc.) */}
            <GlobalNotice />

            <div className="min-h-screen flex flex-col bg-brandBg text-brandText border-t border-brandBorder">
                {/* Masquer le menu pendant la séance */}
                {!isSession && <Navbar />}

                {/* Contenu principal de la page (fourni par Next) */}
                <main className="flex-1">{children}</main>

                {/* Footer visible uniquement en dehors des séances.
                    onOpenPreferencesAction : callback pour ouvrir le modal de préférences. */}
                {!isSession && <Footer onOpenPreferencesAction={() => setOpenPrefs(true)} />}
            </div>

            {/* Bannière cookies uniquement hors séance.
                Affichée tant que l'utilisateur n'a pas confirmé ses préférences. */}
            {!isSession && (
                <CookieBanner onOpenPreferencesAction={() => setOpenPrefs(true)} />
            )}

            {/* Modal de gestion détaillée des préférences cookies.
                - isOpen : contrôle visibilité
                - onCloseAction : ferme le modal
                - prefs : valeurs actuelles
                - onChangePrefsAction : mise à jour en direct lorsqu'on coche/décoche
                - onSaveAction : persistance + forçage de essential à true */}
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
 * Initialise le système d'analytics.
 *
 * Implémentation volontairement vide pour l'instant :
 * - Ajouter ici le code d'intégration du fournisseur (Matomo, Plausible, GA4, etc.).
 * - À appeler uniquement si `analyticsAllowed()` retourne true.
 */
function initAnalytics() {}

/**
 * Initialise la couche de personnalisation (recommandations, A/B testing, etc.).
 *
 * Implémentation volontairement vide pour l'instant :
 * - Ajouter ici le code d'intégration du moteur de personnalisation.
 * - À appeler uniquement si `personalizationAllowed()` retourne true.
 */
function initPersonalization() {}
