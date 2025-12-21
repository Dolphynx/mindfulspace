/**
 * @file OverviewErrors.tsx
 * @description
 * Composants d’erreur minimalistes utilisés par la vue d’overview du World Hub
 * lorsque le chargement des métriques échoue.
 *
 * Objectifs :
 * - Fournir un retour visuel discret et cohérent avec le design global.
 * - Éviter toute logique métier : ces composants sont purement présentatifs.
 */

/**
 * Panneau d’erreur compact utilisé dans la zone “snapshot”.
 *
 * Structure :
 * - Un titre mis en évidence.
 * - Un message explicatif en texte secondaire.
 *
 * @param props - Propriétés du composant.
 * @param props.title - Titre du panneau d’erreur.
 * @param props.message - Message d’erreur affiché.
 * @returns Panneau d’erreur.
 */
export function ErrorPanel(props: { title: string; message: string }) {
    return (
        <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
            <div className="text-sm font-semibold text-slate-800">
                {props.title}
            </div>
            <div className="mt-2 text-xs text-slate-600">
                {props.message}
            </div>
        </div>
    );
}

/**
 * Carte d’erreur utilisée dans la grille des domaines.
 *
 * Structure :
 * - Un placeholder visuel en tête (squelette léger).
 * - Un message d’erreur en texte secondaire.
 *
 * Cette variante est pensée pour s’insérer dans des layouts en grille
 * sans casser l’alignement visuel des cartes voisines.
 *
 * @param props - Propriétés du composant.
 * @param props.message - Message d’erreur affiché.
 * @returns Carte d’erreur.
 */
export function ErrorCard(props: { message: string }) {
    return (
        <div className="rounded-3xl border border-white/40 bg-white/55 shadow-md backdrop-blur p-5">
            <div className="h-5 w-24 rounded bg-white/70" />
            <div className="mt-2 text-xs text-slate-600">
                {props.message}
            </div>
        </div>
    );
}
