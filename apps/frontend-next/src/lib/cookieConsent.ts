/**
 * Gestion centralisée du consentement cookies côté frontend.
 *
 * Ce module :
 * - stocke les préférences de l’utilisateur dans localStorage,
 * - fournit des helpers pour savoir si une catégorie est autorisée,
 * - propose un mode "tout accepter",
 * - permet de purger certains cookies lorsque l’utilisateur refuse une catégorie.
 *
 * En production réelle, le backend devrait également respecter ces choix :
 *   suppression d’identifiants, arrêt du tracking, configuration de services externes…
 *
 * Important :
 *   - Toute modification de structure (ajout d'une catégorie, renommage, suppression)
 *     nécessite de **versionner la clé STORAGE_KEY**, sinon les anciennes prefs deviennent invalides.
 */

export type CookiePrefs = {
    /** Catégorie essentielle — toujours activée, non désactivable. */
    essential: true;

    /** Autorisation des cookies analytiques. */
    analytics: boolean;

    /** Autorisation de la personnalisation (ex. recommandations). */
    personalization: boolean;

    /** Horodatage ISO de la dernière mise à jour. */
    updatedAt: string;
};

// Clé unique du stockage (versionne-la si tu changes les catégories)
const STORAGE_KEY = "cookie-consent-v1";

/** Retourne un timestamp ISO standardisé. */
function nowISO() {
    return new Date().toISOString();
}

/**
 * Lecture des préférences depuis localStorage.
 *
 * - Retourne `null` si aucune préférence n’a été sauvegardée.
 * - Utilise un try/catch pour éviter les erreurs JSON ou localStorage bloqué.
 * - Ne fonctionne que côté client (`window` nécessaire).
 */
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

/**
 * Enregistre les préférences dans localStorage.
 *
 * - Le parent fournit toutes les catégories SAUF updatedAt.
 * - updatedAt est automatiquement mis à jour.
 */
export function saveCookiePrefs(prefs: Omit<CookiePrefs, "updatedAt">) {
    if (typeof window === "undefined") return;
    const full: CookiePrefs = {
        ...prefs,
        updatedAt: nowISO(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

/**
 * Mode "tout accepter" utilisé par le bouton principal de la bannière.
 *
 * - Active analytics + personalization.
 * - essential reste forcé à true.
 * - updatedAt est géré automatiquement.
 */
export function acceptAllCookies() {
    saveCookiePrefs({
        essential: true,
        analytics: true,
        personalization: true,
    });
}

/**
 * Indique simplement si l’utilisateur a déjà fait un choix.
 *
 * - Utilisé par la bannière pour savoir si elle doit s’afficher.
 */
export function hasConsent() {
    return !!loadCookiePrefs();
}

/**
 * Helpers de catégories.
 *
 * analyticsAllowed → true si l’utilisateur a accepté les cookies analytics.
 * personalizationAllowed → true si personnalisation autorisée.
 *
 * - Utilisés dans AppChrome pour initier analytics / personnalisation
 *   uniquement si le consentement le permet.
 */
export function analyticsAllowed(): boolean {
    const prefs = loadCookiePrefs();
    return !!prefs?.analytics;
}

export function personalizationAllowed(): boolean {
    const prefs = loadCookiePrefs();
    return !!prefs?.personalization;
}

/**
 * purgeCookiesForDisabledPrefs
 *
 * Supprime les cookies associés aux catégories refusées.
 *
 * - Cette fonction ne supprime pas "tous les cookies", mais uniquement ceux
 *   que l'application connaît et utilise.
 * - À adapter selon les cookies réellement utilisés (analytics, A/B testing, etc.).
 *
 * Backend :
 *   En environnement réel, cette purge devrait aussi être effectuée côté serveur
 *   pour s’assurer que les identifiants ne sont plus associés à l’utilisateur.
 */
export function purgeCookiesForDisabledPrefs(prefs: CookiePrefs) {
    if (typeof document === "undefined") return;

    // Si analytics est refusé → suppression des cookies analytiques
    if (!prefs.analytics) {
        deleteCookie("analytics_id");
        deleteCookie("ga_client_id");
        // Ajouter ici tous les cookies analytiques réels du projet
    }

    // Si personnalisation refusée → suppression des cookies associés
    if (!prefs.personalization) {
        deleteCookie("personalized_ui");
        deleteCookie("recommended_content_token");
    }
}

/**
 * deleteCookie
 *
 * Utilitaire bas niveau pour supprimer un cookie navigateur.
 * - path=/ → suppression globale
 * - max-age=0 → effacement immédiat
 * - SameSite=Lax pour un comportement cohérent et sécurisé
 */
function deleteCookie(name: string) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}
