"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import MapMantra from "@/components/map/MapMantra";
import WorldHubClient from "@/feature/world/app/WorldHubClient";
import { useWorldHub } from "@/feature/world/hub/WorldHubProvider";
import { PanelBody } from "@/feature/world/panel/PanelBody";
import { WorldBadgesLotusOverlay } from "@/components/badges/WorldBadgesLotusOverlay";

/**
 * Chemin SVG principal de la carte (île sans concavité).
 *
 * @remarks
 * Utilisé comme base pour générer les couches (outer/mid/deep) via des
 * transformations légères et des effets d'animation.
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

/**
 * Page "My World" (V2) : map interactive + panneau latéral (drawer / overlay).
 *
 * @remarks
 * - Le décor (fond + map) est stable.
 * - Les interactions ouvrent idéalement un drawer SPA (overlay) pour éviter
 *   une navigation multi-pages.
 *
 * ⚠️ Actuellement, la navigation des îlots fait encore un `router.push`
 * vers les pages legacy des domaines.
 * Dans la version SPA finale, ce handler devra appeler une action du
 * provider (ex: `openDomainAction("sleep")`) au lieu de changer de route.
 */
export default function SerenityLanding() {
    return (
        <WorldHubClient>
            <WorldV2Content />
        </WorldHubClient>
    );
}

/**
 * Contenu réel de la page World V2.
 *
 * @remarks
 * Séparé de `SerenityLanding` pour pouvoir utiliser `useWorldHub()`:
 * le hook doit être appelé sous le Provider monté par `WorldHubClient`.
 */
function WorldV2Content() {
    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("publicWorld");

    const { state, openPanel, closePanel, goBack} = useWorldHub();
    const canGoBack = state.drawerStack.length > 1;

    return (
        <div
            className="
        fixed top-[80px] left-0 w-full h-[calc(100vh-80px)]
        bg-gradient-to-b from-[#eef4fa] to-[#dbe8f1]
      "
        >
            <div className="relative h-full overflow-hidden">
                {/* MAP SCENE */}
                <div className="relative mx-auto w-[92%] max-w-7xl pt-12 sm:pt-6 pb-10">
                    <div className="mx-auto w-full max-w-5xl">
                        <div className="relative aspect-[16/9] w-full">
                            <IslandMapLayers islandPath={ISLAND_PATH} />

                            {/* Mantra IA */}
                            <MapMantra locale={locale} />

                            {/* Badges récents en lotus sur la map (overlay) */}
                            <WorldBadgesLotusOverlay />

                            {/* CTA “Démarrer” */}
                            {!state.isPanelOpen && (
                                <div className="absolute inset-0 z-20 flex items-end justify-center pb-6 pointer-events-none">
                                    <div className="pointer-events-auto rounded-3xl bg-white/55 backdrop-blur border border-white/40 shadow-lg px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-800 text-center">
                                            {t("worldStartTitle") /* i18n */}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-600 text-center">
                                            {t("worldStartSubtitle") /* i18n */}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => openPanel()}
                                            className="
                        mt-4 w-full rounded-2xl bg-white/80 hover:bg-white transition
                        px-5 py-3 text-sm font-semibold text-slate-800 shadow
                      "
                                        >
                                            {t("worldStartCta")}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Halo décoratif */}
                            <div className="pointer-events-none absolute inset-0 z-[5]">
                                <div className="absolute left-[50%] top-[58%] h-[42%] w-[70%] -translate-x-1/2 rounded-[50%] bg-white/30 blur-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PANEL FULLSCREEN (ton drawer devient un “grand panneau”) */}
                {state.isPanelOpen && (
                    <div className="absolute inset-0 z-40">
                        {/* backdrop */}
                        <button
                            type="button"
                            onClick={() => closePanel()}
                            aria-label={t("worldPanelCloseAria")}
                            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                        />

                        {/* panel */}
                        <div
                            className="
                relative absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                w-[94vw] max-w-5xl h-[88vh]
                rounded-[28px]
                bg-white/55 backdrop-blur-xl
                border border-white/40
                shadow-2xl
                overflow-hidden
              "
                        >
                            {/* header panel */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
                                <div className="flex items-center gap-2">
                                    {canGoBack && (
                                        <button
                                            type="button"
                                            onClick={() => goBack()}
                                            className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-slate-700 text-sm"
                                            aria-label={t("worldPanelBackAria")}
                                        >
                                            ←
                                        </button>
                                    )}

                                    <div className="text-xs font-semibold tracking-widest text-slate-700">
                                        {t("worldPanelTitle")}
                                    </div>
                                </div>

                                {/* Close */}
                                <button
                                    type="button"
                                    onClick={() => closePanel()}
                                    className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-slate-700"
                                    aria-label={t("worldPanelCloseAria")}
                                >
                                    ✕
                                </button>
                            </div>


                            {/* body */}
                            <div className="relative h-[calc(88vh-60px)] overflow-y-auto p-6">
                                <WorldHubClientPanelBody />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Couches SVG de la carte (outer/mid/deep) avec effets de vagues.
 *
 * @param params - Props du composant.
 * @param params.islandPath - Chemin SVG de base.
 *
 * @remarks
 * - Utilise `<defs>` + `<use>` pour réutiliser le même path.
 * - Applique un shrink global léger pour réduire les débordements.
 * - Anime uniquement les couches "outer" et "mid" via des classes CSS.
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
                        <path d="M-80,430 Q220,380 520,430 T1280,430" fill="rgba(255,255,255,0.16)" />
                        <path d="M-80,520 Q220,475 520,520 T1280,520" fill="rgba(255,255,255,0.10)" />
                    </g>

                    {/* MID (mid) */}
                    <g className="animate-island-wave-mid">
                        <use href="#pMidRaw" fill="hsl(var(--ocean-mid))" opacity="0.92" />
                        <path d="M-80,455 Q240,420 520,455 T1280,455" fill="rgba(255,255,255,0.10)" />
                    </g>

                    {/* DEEP (base) */}
                    <use href="#pDeepRaw" fill="hsl(var(--ocean-deep))" opacity="0.92" />

                    {/* Bord blanc discret */}
                    <use href="#pOuterRaw" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="8" />
                </g>
            </svg>
        </div>
    );
}

function WorldHubClientPanelBody() {
    return <PanelBody />;
}
