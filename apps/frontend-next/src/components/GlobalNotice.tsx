"use client";

/**
 * Bandeau d’information global affiché en haut de l’application.
 *
 * Objectif :
 * - Informer l’utilisateur que l’application est un projet scolaire
 *   et que toutes les données sont fictives.
 *
 * Caractéristiques :
 * - Positionnement **sticky** : reste visible en haut lors du scroll.
 * - Priorité visuelle élevée grâce au `z-index` important.
 * - Style volontairement très contrasté (bg rouge + icône jaune) pour
 *   maximiser la lisibilité et signaler une information importante.
 *
 * Remarque :
 * - Composant purement présentational, sans logique.
 * - Peut être facilement désactivé ou personnalisé lorsque l’application
 *   passe en production réelle.
 */

export default function GlobalNotice() {
    return (
        <div className="sticky top-0 z-[10000] w-full bg-red-600 text-white text-xs flex items-center justify-center px-3 py-1 gap-2 text-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            {/* Petite icône visuelle "!" dans un carré jaune (style alerte) */}
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-[2px] bg-yellow-300 text-red-700 font-bold text-[10px] leading-none">
                !
            </span>

            {/* Message explicatif affiché à l’utilisateur */}
            <p>
                Ceci est une application de projet scolaire. Toutes les données,
                contenus et fonctionnalités sont fictifs.
            </p>
        </div>
    );
}
