"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import Island from "@/components/Island";
import DomainTabsPanel from "@/components/DomainTabsPanel";
import MapMantra from "@/components/map/MapMantra";

/**
 * Chemin SVG principal de la carte (île sans concavité).
 *
 * @remarks
 * Utilisé comme base pour générer les trois couches (outer/mid/deep) via des
 * transformations légères et des effets de pulsation.
 */
const ISLAND_PATH =
    "M416.1,691.9 \
     C374.8,679.6 352,666.3 329.7,642.1 \
     C302.2,612.2 286.5,578.6 277.9,532.1 \
     C273.7,507.9 261.3,482.8 246.6,470 \
     C240.9,464.3 220.9,451 202.3,440.4 \
     C152.7,411.5 108.6,361.2 93.4,316.5 \
     C68.2,240.6 69.6,176.5 97.6,120 \
     C121.8,71.6 157.2,54.1 233.2,52.7 \
     C247.4,52.7 270.2,54.1 283.1,56.5 \
     C296.4,58.4 314.4,61.3 323.6,62.6 \
     C332.6,64.1 343.5,66 347.3,66.4 \
     C351.1,67.4 361.5,69.3 370.1,71.2 \
     C442.2,87.8 529.1,89.2 589.4,74.5 \
     C608.9,70.3 672,47.5 696.3,36.1 \
     C736.6,18.1 835.8,0 868.9,5.2 \
     C880.8,7.1 895.9,9.5 902.1,10.4 \
     C917.7,12.3 967.3,31.3 989.9,44.2 \
     C1058.2,82.6 1109.5,151.9 1124.7,225.5 \
     C1131.3,257.3 1127,311.6 1116.1,335.8 \
     C1096.6,379.8 1068.6,399.3 990.6,424.4 \
     C927.8,444.6 911.6,456.1 880.8,501.7 \
     C866.5,523.6 846.1,549.9 835.8,560.3 \
     C820.2,576.5 678.2,662.2 667.3,662.2 \
     C665.4,662.2 654,667 641.7,672.7 \
     C621.8,681.7 588.1,691.7 555.3,698.4 \
     C528.0,704.4 500.0,705.8 472.0,703.0 \
     C448.0,700.6 431.0,697.2 416.1,691.9 Z";

const VIEWBOX_W = 1200;
const VIEWBOX_H = 700;

/**
 * Points d'ancrage des îlots (coordonnées dans le viewBox 1200x700).
 *
 * @remarks
 * Les positions sont converties en pourcentage afin de faciliter la mise en page
 * responsive sur un conteneur en `aspect-[16/9]`.
 */
const ISLAND_ANCHORS = {
    sleep: { x: 285, y: 215 },
    meditation: { x: 600, y: 535 },
    exercise: { x: 885, y: 185 },
} as const;

/**
 * Convertit une coordonnée X (dans le viewBox) en pourcentage CSS.
 *
 * @param x - Abscisse dans l'espace du viewBox.
 */
function toPctX(x: number) {
    return `${(x / VIEWBOX_W) * 100}%`;
}

/**
 * Convertit une coordonnée Y (dans le viewBox) en pourcentage CSS.
 *
 * @param y - Ordonnée dans l'espace du viewBox.
 */
function toPctY(y: number) {
    return `${(y / VIEWBOX_H) * 100}%`;
}

/**
 * Page "Serenity / World" (espace membre).
 *
 * @remarks
 * - Layout principal fixe sous le header (`top-[80px]`).
 * - Contenu scrollable interne (`overflow-y-auto`) pour laisser le décor fixe.
 * - Carte centrée (SVG) avec îlots cliquables positionnés par ancres.
 * - Panneau d'encodage (DomainTabsPanel) superposé à droite sur desktop.
 */
export default function SerenityLanding() {
    const router = useRouter();

    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("publicWorld");

    /**
     * Navigation vers un domaine via l'îlot correspondant.
     *
     * @param type - Domaine cible.
     */
    const handleIslandClick = (type: "sleep" | "meditation" | "exercise") => {
        router.push(`/${locale}/member/domains/${type}`);
    };

    return (
        <div
            className="
                fixed top-[80px] left-0 w-full h-[calc(100vh-80px)]
                bg-gradient-to-b from-[#eef4fa] to-[#dbe8f1]
            "
        >
            <div className="relative h-full overflow-y-auto overscroll-contain">
                <div className="relative mx-auto w-[92%] max-w-7xl pt-6 pb-10">
                    {/* MAP centered */}
                    <div className="mx-auto w-full max-w-5xl">
                        <div className="relative aspect-[16/9] w-full">
                            <IslandMapLayers islandPath={ISLAND_PATH} />

                            {/* Mantra IA – desktop only */}
                            <MapMantra locale={locale} />

                            {/* Îlots interactifs superposés à la carte */}
                            <div className="absolute inset-0 z-10">
                                {/* Sleep */}
                                <div
                                    className="absolute -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                        left: toPctX(ISLAND_ANCHORS.sleep.x),
                                        top: toPctY(ISLAND_ANCHORS.sleep.y),
                                    }}
                                >
                                    <Island
                                        type="sleep"
                                        label={t("sleepAlt")}
                                        iconSrc="/images/icone_sleep.png"
                                        onClick={() => handleIslandClick("sleep")}
                                        size="xs"
                                        animated={false}
                                    />
                                </div>

                                {/* Meditation */}
                                <div
                                    className="absolute -translate-x-1/2 -translate-y-1/2 scale-[1.06] md:scale-[1.1]"
                                    style={{
                                        left: toPctX(ISLAND_ANCHORS.meditation.x),
                                        top: toPctY(ISLAND_ANCHORS.meditation.y),
                                    }}
                                >
                                    <Island
                                        type="meditation"
                                        label={t("meditationAlt")}
                                        iconSrc="/images/icone_meditation.png"
                                        onClick={() => handleIslandClick("meditation")}
                                        size="xs"
                                        animated={false}
                                    />
                                </div>

                                {/* Exercise */}
                                <div
                                    className="absolute -translate-x-1/2 -translate-y-1/2 lg:translate-x-[-12px]"
                                    style={{
                                        left: toPctX(ISLAND_ANCHORS.exercise.x),
                                        top: toPctY(ISLAND_ANCHORS.exercise.y),
                                    }}
                                >
                                    <Island
                                        type="exercise"
                                        label={t("exerciceAlt")}
                                        iconSrc="/images/icone_exercise.png"
                                        onClick={() => handleIslandClick("exercise")}
                                        size="xs"
                                        animated={false}
                                    />
                                </div>
                            </div>

                            {/* Halo sous les îlots (décoratif). */}
                            <div className="pointer-events-none absolute inset-0 z-[5]">
                                <div className="absolute left-[50%] top-[58%] h-[42%] w-[70%] -translate-x-1/2 rounded-[50%] bg-white/30 blur-2xl" />
                            </div>
                        </div>

                        <div className="mt-4 text-center text-sm text-slate-600">
                            {t?.("worldIntro") ?? ""}
                        </div>
                    </div>

                    {/* Panneau de droite (desktop) : toujours au-dessus de la carte et des îlots */}
                    <div className="hidden lg:block absolute right-0 top-6 z-40">
                        <div className="sticky top-6">
                            <DomainTabsPanel />
                        </div>
                    </div>

                    {/* Version mobile : panneau dans le flux */}
                    <div className="lg:hidden mt-6">
                        <DomainTabsPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Couches SVG de la carte (outer/mid/deep) avec effets de vagues.
 *
 * @param islandPath - Chemin SVG de base.
 *
 * @remarks
 * - Utilise `<defs>` + `<use>` pour réutiliser le même path.
 * - Applique un shrink global léger pour réduire les débordements.
 * - Anime uniquement les couches "outer" et "mid" via des classes CSS dédiées.
 */
function IslandMapLayers({ islandPath }: { islandPath: string }) {
    /**
     * Shrink global léger pour contenir le rendu dans le conteneur.
     */
    const S = 0.965;

    /**
     * Translation calculée pour conserver le centrage après mise à l'échelle.
     */
    const TX = (1200 * (1 - S)) / 2;
    const TY = (700 * (1 - S)) / 2;

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <svg
                viewBox="0 0 1200 700"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <path id="pOuterRaw" d={islandPath} />
                    <path id="pMidRaw" d={islandPath} transform="translate(22 14) scale(0.965)" />
                    <path id="pDeepRaw" d={islandPath} transform="translate(40 24) scale(0.93)" />
                </defs>

                <g transform={`translate(${TX} ${TY}) scale(${S})`}>
                    {/* OUTER (light) */}
                    <g className="animate-island-wave-outer">
                        <use href="#pOuterRaw" fill="hsl(var(--ocean-light))" />
                        <path
                            d="M-80,430 Q220,380 520,430 T1280,430"
                            fill="rgba(255,255,255,0.16)"
                        />
                        <path
                            d="M-80,520 Q220,475 520,520 T1280,520"
                            fill="rgba(255,255,255,0.10)"
                        />
                    </g>

                    {/* MID (mid) */}
                    <g className="animate-island-wave-mid">
                        <use href="#pMidRaw" fill="hsl(var(--ocean-mid))" opacity="0.92" />
                        <path
                            d="M-80,455 Q240,420 520,455 T1280,455"
                            fill="rgba(255,255,255,0.10)"
                        />
                    </g>

                    {/* DEEP (terre) */}
                    <use href="#pDeepRaw" fill="hsl(var(--ocean-deep))" opacity="0.92" />

                    {/* Bord blanc discret */}
                    <use
                        href="#pOuterRaw"
                        fill="none"
                        stroke="rgba(255,255,255,0.30)"
                        strokeWidth="8"
                    />
                </g>
            </svg>
        </div>
    );
}
