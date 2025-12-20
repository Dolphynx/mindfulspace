"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

import WorldHubClient from "@/feature/world/app/WorldHubClient";
import { useWorldHub } from "@/feature/world/hub/WorldHubProvider";
import { PanelBody } from "@/feature/world/panel/PanelBody";

import MapMantra from "@/components/map/MapMantra";
import { WorldBadgesLotusOverlay } from "@/components/badges/WorldBadgesLotusOverlay";
import { IslandMapLayers } from "@/components/map/IslandMapLayers";
import { ISLAND_PATH } from "@/components/map/islandPath";

/**
 * Page "My World" (V2) : scène de carte interactive + panneau fullscreen (drawer/overlay).
 *
 * @remarks
 * - Le décor (fond + carte) est stable et reste visible en arrière-plan.
 * - Les interactions principales ouvrent un panneau (overlay) afin de conserver
 *   un comportement de type SPA, sans navigation multi-pages.
 * - La map (SVG et path) est extraite en composants dédiés pour réduire la
 *   responsabilité de la page et améliorer la maintenabilité.
 *
 * @returns Le composant de page Next.js rendu avec le provider WorldHub.
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
 * Séparé de `SerenityLanding` afin de pouvoir utiliser `useWorldHub()` :
 * le hook doit être invoqué sous le Provider monté par `WorldHubClient`.
 *
 * @returns La scène World V2 (map + overlays) et le panneau fullscreen.
 */
function WorldV2Content() {
    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("publicWorld");

    const { state, openPanel, closePanel, goBack } = useWorldHub();
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
                            {/* Base visuelle (SVG) */}
                            <IslandMapLayers islandPath={ISLAND_PATH} />

                            {/* Mantra IA (overlay) */}
                            <MapMantra locale={locale} />

                            {/* Badges récents en lotus (overlay) */}
                            <WorldBadgesLotusOverlay />

                            {/* CTA d'entrée : visible uniquement lorsque le panneau est fermé */}
                            {!state.isPanelOpen && (
                                <div className="absolute inset-0 z-20 flex items-end justify-center pb-6 pointer-events-none">
                                    <div className="pointer-events-auto rounded-3xl bg-white/55 backdrop-blur border border-white/40 shadow-lg px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-800 text-center">
                                            {t("worldStartTitle")}
                                        </div>

                                        <div className="mt-1 text-xs text-slate-600 text-center">
                                            {t("worldStartSubtitle")}
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

                {/* PANEL FULLSCREEN */}
                {state.isPanelOpen && (
                    <div className="absolute inset-0 z-40">
                        {/* Backdrop cliquable */}
                        <button
                            type="button"
                            onClick={() => closePanel()}
                            aria-label={t("worldPanelCloseAria")}
                            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                        />

                        {/* Container du panneau */}
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
                            {/* En-tête du panneau */}
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

                                <button
                                    type="button"
                                    onClick={() => closePanel()}
                                    className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-slate-700"
                                    aria-label={t("worldPanelCloseAria")}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Corps du panneau */}
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
 * Adaptateur de rendu pour le corps du panneau.
 *
 * @remarks
 * Centralise le rendu du composant `PanelBody` afin de conserver une structure
 * homogène avec les autres wrappers de la feature WorldHub.
 *
 * @returns Le contenu du panneau.
 */
function WorldHubClientPanelBody() {
    return <PanelBody />;
}
