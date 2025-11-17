"use client";

/**
 * Petit composant dédié au lien/bouton "Cookies" affiché dans le footer.
 *
 * - Sert uniquement à déclencher l'ouverture du modal de préférences cookies.
 * - Placé dans un composant séparé pour :
 *   - alléger le code du Footer,
 *   - permettre une éventuelle évolution (icône, tooltip, variation responsive…).
 *
 * Ce composposant ne contient aucune logique métier :
 * il délègue entièrement l’action au parent via `onOpenPreferencesAction`.
 */

export default function FooterCookiesLink({
                                              onOpenPreferencesAction,
                                          }: {
    /** Callback déclenché par l’utilisateur pour ouvrir la modale de préférences cookies. */
    onOpenPreferencesAction: () => void;
}) {
    return (
        <button
            className="text-[12px] text-brandText-soft underline hover:text-brandText"
            onClick={onOpenPreferencesAction}
        >
            Cookies
        </button>
    );
}
