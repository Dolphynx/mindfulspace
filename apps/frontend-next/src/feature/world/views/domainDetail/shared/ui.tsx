import React from "react";

/**
 * Tons visuels supportés par les composants UI partagés (KPI / visuals).
 *
 * Chaque ton influence :
 * - la couleur du ring (bordure/halo),
 * - le dégradé de la barre latérale,
 * - le style des chips (badge de hint / pourcentage / pastilles).
 */
type Tone = "slate" | "blue" | "purple" | "green";

/**
 * Résout les classes Tailwind associées à un ton.
 *
 * @param tone - Ton visuel sélectionné.
 * @returns Ensemble de classes (ring, barre latérale, chip).
 */
function toneClasses(tone: Tone) {
    switch (tone) {
        case "blue":
            return {
                ring: "ring-sky-100",
                bar: "from-sky-300 to-violet-300",
                chip: "bg-sky-50 text-sky-700 border-sky-100",
            };
        case "purple":
            return {
                ring: "ring-violet-100",
                bar: "from-violet-300 to-teal-300",
                chip: "bg-violet-50 text-violet-700 border-violet-100",
            };
        case "green":
            return {
                ring: "ring-emerald-100",
                bar: "from-emerald-300 to-teal-300",
                chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
            };
        default:
            return {
                ring: "ring-slate-100",
                bar: "from-slate-300 to-slate-200",
                chip: "bg-slate-50 text-slate-700 border-slate-100",
            };
    }
}

/**
 * Section structurante pour regrouper un bloc UI sous un titre.
 *
 * Structure :
 * - Un header avec titre à gauche et une zone optionnelle à droite.
 * - Le contenu libre `children` en dessous.
 *
 * @param props - Propriétés de la section.
 * @param props.title - Titre affiché.
 * @param props.children - Contenu du bloc.
 * @param props.right - Contenu optionnel aligné à droite du titre (ex. badge, actions).
 * @returns Section structurée.
 */
export function Section(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-700">{props.title}</h3>
                {props.right}
            </div>
            {props.children}
        </section>
    );
}

/**
 * Sparkline SVG simple pour visualiser une série temporelle.
 *
 * Comportement :
 * - Si `values.length <= 1`, rend un placeholder (bloc vide).
 * - Sinon, normalise les valeurs entre min/max et produit une polyline.
 *
 * Notes :
 * - Largeur/hauteur de `viewBox` fixes (w = 520, h = 120) pour un rendu stable.
 * - Padding interne appliqué afin d’éviter de coller la polyline aux bords.
 *
 * @param props - Propriétés du composant.
 * @param props.values - Série de valeurs à tracer.
 * @returns Bloc contenant le sparkline (ou un placeholder si insuffisant).
 */
export function Sparkline(props: { values: number[] }) {
    const values = props.values ?? [];
    const w = 520;
    const h = 120;
    const pad = 8;

    if (values.length <= 1) {
        return <div className="h-[120px] rounded-xl bg-slate-50 border border-slate-100" />;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(1e-6, max - min);

    const pts = values
        .map((v, i) => {
            const x = pad + (i * (w - pad * 2)) / (values.length - 1);
            const y = pad + (1 - (v - min) / span) * (h - pad * 2);
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <div className="overflow-hidden rounded-2xl bg-white/80 border border-slate-100">
            <svg viewBox={`0 0 ${w} ${h}`} className="block w-full h-[120px]">
                <polyline
                    points={pts}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-slate-400"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}

// ---------- Visuals (donut, rating, pills) ----------

/**
 * Visual “donut” affichant un pourcentage et un libellé.
 *
 * Contraintes :
 * - `pct` est borné dans [0, 100] puis arrondi.
 * - Le donut est dessiné avec deux cercles :
 *   - un fond (track),
 *   - un arc (progress) via `strokeDasharray`.
 *
 * @param props - Propriétés du donut.
 * @param props.pct - Pourcentage à afficher (0..100).
 * @param props.tone - Ton visuel (influence la chip de pourcentage).
 * @param props.label - Libellé descriptif affiché à côté (et utile pour l’UI).
 * @returns Donut SVG accompagné d’un label et d’une chip de pourcentage.
 */
function Donut(props: { pct: number; tone?: Tone; label?: string }) {
    const pct = Math.max(0, Math.min(100, Math.round(props.pct)));
    const r = 18;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;

    const tone = toneClasses(props.tone ?? "slate");

    return (
        <div className="flex items-center gap-3">
            <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
                <circle
                    cx="22"
                    cy="22"
                    r={r}
                    strokeWidth="6"
                    className="text-slate-200"
                    stroke="currentColor"
                    fill="none"
                />
                <circle
                    cx="22"
                    cy="22"
                    r={r}
                    strokeWidth="6"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    className="text-slate-500"
                    style={{
                        strokeDasharray: `${dash} ${c - dash}`,
                        transform: "rotate(-90deg)",
                        transformOrigin: "22px 22px",
                    }}
                />
            </svg>

            <div className="min-w-0">
                <div className="text-xs text-slate-500">{props.label}</div>
                <div className="text-sm font-semibold text-slate-800">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 ${tone.chip}`}>
                        {pct}%
                    </span>
                </div>
            </div>
        </div>
    );
}

/**
 * Visual “rating” sous forme de pastilles (pips) avec affichage `v/max`.
 *
 * Comportement :
 * - `value` est arrondi et borné dans [0, max].
 * - Le rendu montre `max` pastilles, remplies selon `value`.
 *
 * @param props - Propriétés du rating.
 * @param props.value - Note numérique.
 * @param props.max - Valeur maximale (défaut : 5).
 * @param props.tone - Ton visuel (appliqué aux pastilles remplies).
 * @returns Indicateur de note sous forme de pastilles.
 */
function RatingPips(props: { value: number; max?: number; tone?: Tone }) {
    const max = props.max ?? 5;
    const v = Math.max(0, Math.min(max, Math.round(props.value)));
    const tone = props.tone ?? "slate";
    const t = toneClasses(tone);

    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: max }).map((_, i) => {
                const filled = i < v;
                return (
                    <span
                        key={i}
                        className={[
                            "h-2.5 w-2.5 rounded-full border",
                            filled ? t.chip : "bg-white border-slate-200",
                        ].join(" ")}
                    />
                );
            })}
            <span className="ml-2 text-xs text-slate-500">
                {v}/{max}
            </span>
        </div>
    );
}

/**
 * Visual “pills” affichant une liste de libellés sous forme de chips.
 *
 * Comportement :
 * - Filtre les valeurs falsy.
 * - Affiche au maximum `max` éléments.
 * - Si la liste dépasse `max`, affiche une pastille “+rest”.
 * - Si aucun élément, affiche `emptyLabel`.
 *
 * @param props - Propriétés de la liste.
 * @param props.items - Libellés à afficher.
 * @param props.emptyLabel - Libellé affiché si la liste est vide.
 * @param props.tone - Ton visuel appliqué aux chips.
 * @param props.max - Nombre maximum de chips affichées (défaut : 3).
 * @returns Ensemble de pills ou un fallback texte.
 */
function Pills(props: { items: string[]; emptyLabel: string; tone?: Tone; max?: number }) {
    const max = props.max ?? 3;
    const items = props.items.filter(Boolean);
    const shown = items.slice(0, max);
    const rest = Math.max(0, items.length - shown.length);
    const t = toneClasses(props.tone ?? "slate");

    if (items.length === 0) {
        return <span className="text-sm text-slate-500">{props.emptyLabel}</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {shown.map((it) => (
                <span
                    key={it}
                    className={`max-w-[220px] truncate rounded-full border px-2 py-0.5 text-xs ${t.chip}`}
                    title={it}
                >
                    {it}
                </span>
            ))}
            {rest > 0 && (
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                    +{rest}
                </span>
            )}
        </div>
    );
}

/**
 * Descripteur typé d’un visuel optionnel affiché dans une `KpiCard`.
 *
 * - `donut` : pourcentage + label.
 * - `rating` : note `value/max`.
 * - `pills` : liste de libellés (top N, tags, etc.).
 */
type KpiVisual =
    | { kind: "donut"; pct: number; label: string }
    | { kind: "rating"; value: number; max?: number }
    | { kind: "pills"; items: string[]; emptyLabel: string; max?: number };

/**
 * Carte KPI générique, supportant :
 * - un label (petit, uppercase),
 * - une valeur principale,
 * - un hint optionnel (chip),
 * - un visuel optionnel (donut / rating / pills).
 *
 * Le rendu est modulé par un ton (`Tone`) afin d’assurer une cohérence visuelle
 * entre domaines.
 *
 * @param props - Propriétés de la carte.
 * @param props.label - Libellé de la KPI.
 * @param props.value - Valeur principale (formatée).
 * @param props.hint - Indication secondaire optionnelle (ex. delta %, meilleur streak).
 * @param props.tone - Ton visuel de la carte (défaut : `"slate"`).
 * @param props.visual - Visuel optionnel rendu à droite.
 * @returns Carte KPI.
 */
export function KpiCard(props: {
    label: string;
    value: string;
    hint?: string;
    tone?: Tone;
    visual?: KpiVisual;
}) {
    const tone = props.tone ?? "slate";
    const t = toneClasses(tone);

    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-white/90 border border-slate-100 shadow-sm ring-1 ${t.ring}`}
        >
            <span
                className={`pointer-events-none absolute inset-y-3 left-3 w-1 rounded-full bg-gradient-to-b ${t.bar}`}
            />

            <div className="p-5 pl-7">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            {props.label}
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-slate-900">
                            {props.value}
                        </div>

                        {props.hint && (
                            <div className="mt-2">
                                <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${t.chip}`}
                                >
                                    {props.hint}
                                </span>
                            </div>
                        )}
                    </div>

                    {props.visual && (
                        <div className="shrink-0 pt-1">
                            {props.visual.kind === "donut" && (
                                <Donut pct={props.visual.pct} label={props.visual.label} tone={tone} />
                            )}
                            {props.visual.kind === "rating" && (
                                <RatingPips value={props.visual.value} max={props.visual.max} tone={tone} />
                            )}
                            {props.visual.kind === "pills" && (
                                <div className="max-w-[240px]">
                                    <Pills
                                        items={props.visual.items}
                                        emptyLabel={props.visual.emptyLabel}
                                        tone={tone}
                                        max={props.visual.max}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
