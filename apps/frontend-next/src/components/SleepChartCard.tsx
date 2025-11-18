"use client";

/**
 * Carte de visualisation du sommeil (SleepChartCard)
 *
 * - Affiche un graphique de type line chart basé sur Recharts.
 * - Permet de visualiser l'évolution du sommeil (en heures) sur une période.
 * - Le composant est "stateless" : il reçoit les données déjà agrégées via `chartData`.
 *
 * Structure :
 * - Header : titre, sous-titre, et plage de dates affichée.
 * - Graphique : ligne représentant le nombre d'heures de sommeil par jour.
 *
 * Remarques :
 * - L’UI est stylée pour être cohérente avec le design MindfulSpace (couleurs, bordures, ombres).
 * - Les données affichées dans `displayedRange` sont pour l’instant statiques,
 *   mais peuvent être dynamiques selon l’utilisation dans le parent.
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DotProps } from "recharts";

/**
 * Point de données de sommeil pour le graphique.
 * - `day`  : étiquette du jour (ex: "Lun", "Mar", "27/10", etc.).
 * - `hours`: nombre d'heures de sommeil pour ce jour.
 *
 * ⚠️ Type défini pour documentation / clarté mais pas utilisé directement plus bas.
 */
type SleepPoint = {
    day: string;
    hours: number;
};

/**
 * Type minimal pour les props de Dot actif (état hover) dans Recharts.
 *
 * On ne dépend pas ici du type complet de Recharts, uniquement des coordonnées.
 */
type ActiveDotPropsLike = {
    cx?: number;
    cy?: number;
};

/**
 * Type des props attendues par le composant SleepChartCard.
 *
 * `chartData` est un tableau d’objets génériques :
 * - label : étiquette de l’axe X (ex: date ou jour).
 * - value : valeur numérique (heures de sommeil).
 */
type SleepChartCardProps = {
    chartData: { label: string; value: number }[];
};

/**
 * CustomDot – Dot personnalisé utilisé pour l’état « normal » de la courbe.
 *
 * - Dessine un cercle vert (#4da884) au niveau de chaque point de données.
 * - Ne rend rien si les coordonnées ne sont pas numériques (sécurité).
 *
 * Utilisé via la prop `dot` de `<Line />`.
 */
function CustomDot(props: DotProps) {
    const { cx, cy } = props;
    if (typeof cx !== "number" || typeof cy !== "number") return null;
    return (
        <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#4da884"
            stroke="#4da884"
            strokeWidth={2}
        />
    );
}

/**
 * CustomActiveDot – Dot personnalisé pour l’état actif (hover).
 *
 * - Utilisé lorsqu’un point est survolé dans le graphique.
 * - Affiche un cercle légèrement plus grand avec un contour blanc.
 * - En cas de coordonnées invalides, rend un cercle invisible
 *   pour éviter des erreurs de rendu.
 *
 * Utilisé via la prop `activeDot` de `<Line />`.
 */
function CustomActiveDot(props: ActiveDotPropsLike) {
    const { cx, cy } = props;
    if (typeof cx !== "number" || typeof cy !== "number") {
        return (
            <circle
                cx={0}
                cy={0}
                r={0}
                fill="transparent"
                stroke="transparent"
                strokeWidth={0}
            />
        );
    }
    return (
        <circle
            cx={cx}
            cy={cy}
            r={7}
            fill="#4da884"
            stroke="#ffffff"
            strokeWidth={2}
        />
    );
}

/**
 * Composant principal SleepChartCard.
 *
 * @param chartData - Données brutes du sommeil (label + value) à transformer pour Recharts.
 *
 * Fonctionnement :
 * - Transforme `chartData` en `sleepData` avec les propriétés `day` et `hours`
 *   attendues par Recharts.
 * - Encapsule un LineChart dans un ResponsiveContainer pour s’adapter à la largeur.
 * - Configure :
 *   - grille (`CartesianGrid`)
 *   - axes X/Y (`XAxis`, `YAxis`)
 *   - tooltip personnalisé (`Tooltip`)
 *   - ligne principale (`Line`) avec dots custom.
 */
export default function SleepChartCard({ chartData }: SleepChartCardProps) {
    // Transformation des données pour correspondre au format requis par le graphique
    const sleepData = chartData.map((data) => ({
        day: data.label,
        hours: data.value,
    }));

    // Plage de dates affichée dans le header (statique pour l’instant)
    const displayedRange = "27/10 → 02/11";

    return (
        <section className="bg-white border border-[#d9eadf] rounded-xl shadow-sm flex flex-col">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-5 border-b border-[#d9eadf]">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                        Sleep Tracking (From DB !)
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Your sleep pattern over the last week
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3 text-gray-800 text-lg">
                    <div className="font-medium text-gray-800">{displayedRange}</div>
                </div>
            </header>

            {/* Chart */}
            <div className="p-5 w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={sleepData}
                        margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                    >
                        {/* Grille de fond avec lignes horizontales uniquement */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#d9eadf"
                            vertical={false}
                        />

                        {/* Axe des X : jours / labels */}
                        <XAxis
                            dataKey="day"
                            stroke="#4b5563"
                            tick={{ fontSize: 16, fill: "#4b5563" }}
                            tickLine={false}
                            axisLine={{ stroke: "#4b5563" }}
                        />

                        {/* Axe des Y : heures de sommeil */}
                        <YAxis
                            stroke="#4b5563"
                            tick={{ fontSize: 16, fill: "#4b5563" }}
                            tickLine={false}
                            axisLine={{ stroke: "#4b5563" }}
                            domain={[0, 12]}
                            ticks={[0, 3, 6, 9, 12]}
                        />

                        {/* Tooltip au survol des points */}
                        <Tooltip
                            cursor={{
                                stroke: "#94c5a9",
                                strokeWidth: 1,
                                strokeDasharray: "4 2",
                            }}
                            contentStyle={{
                                borderRadius: "0.5rem",
                                borderColor: "#d9eadf",
                                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.08)",
                                fontSize: "0.875rem",
                            }}
                            labelStyle={{
                                fontWeight: 600,
                                color: "#1f2937",
                                marginBottom: "0.25rem",
                            }}
                            formatter={(value) => [`${value} h`, "Sleep"]}
                        />

                        {/* Ligne principale représentant les heures de sommeil */}
                        <Line
                            type="monotone"
                            dataKey="hours"
                            stroke="#4da884"
                            strokeWidth={3}
                            dot={<CustomDot />}
                            activeDot={<CustomActiveDot />}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
