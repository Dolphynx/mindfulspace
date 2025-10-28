// apps/frontend-next/src/lib/cookieConsent.ts

export type CookiePrefs = {
    essential: true;
    analytics: boolean;
    personalization: boolean;
    updatedAt: string;
};

// Clé unique du stockage (versionne-la si tu changes les catégories)
const STORAGE_KEY = "cookie-consent-v1";

function nowISO() {
    return new Date().toISOString();
}

// Lire les préférences depuis localStorage
export function loadCookiePrefs(): CookiePrefs | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as CookiePrefs;
    } catch {
        return null;
    }
}

// Sauver les préférences dans localStorage
export function saveCookiePrefs(prefs: Omit<CookiePrefs, "updatedAt">) {
    if (typeof window === "undefined") return;
    const full: CookiePrefs = {
        ...prefs,
        updatedAt: nowISO(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

// Consent complet ("OK pour moi")
export function acceptAllCookies() {
    saveCookiePrefs({
        essential: true,
        analytics: true,
        personalization: true,
    });
}

// Est-ce qu'on a déjà un choix utilisateur ?
export function hasConsent() {
    return !!loadCookiePrefs();
}

// Helpers par catégorie
export function analyticsAllowed(): boolean {
    const prefs = loadCookiePrefs();
    return !!prefs?.analytics;
}

export function personalizationAllowed(): boolean {
    const prefs = loadCookiePrefs();
    return !!prefs?.personalization;
}

/**
 * Supprime les cookies clients liés aux catégories refusées.
 * - Ici on gère côté navigateur uniquement.
 * - En prod réelle, tu supprimerais aussi côté backend les identifiants stockés.
 */
export function purgeCookiesForDisabledPrefs(prefs: CookiePrefs) {
    if (typeof document === "undefined") return;

    // Exemple: si analytics refusé -> on supprime cookies analytics connus
    if (!prefs.analytics) {
        deleteCookie("analytics_id");
        deleteCookie("ga_client_id");
        // ajoute ici tous les cookies analytics que tu poses/poserais
    }

    // Exemple: si personalization refusé -> on supprime cookies de personnalisation
    if (!prefs.personalization) {
        deleteCookie("personalized_ui");
        deleteCookie("recommended_content_token");
    }
}

// utilitaire bas niveau pour supprimer un cookie navigateur
function deleteCookie(name: string) {
    // max-age=0 => suppression immédiate
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}
