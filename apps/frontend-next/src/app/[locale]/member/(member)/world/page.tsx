"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export default function WorldMap() {
    // Détection de la locale depuis l’URL : /fr/... ou /en/...
    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    // Namespace i18n
    const t = useTranslations("publicWorld");

    return (
        <div className="relative w-full h-screen">

            {/* IMAGE DE FOND */}
            <Image
                src="/images/mindfulworld.png"
                alt={t("worldAlt")}
                fill
                className="object-cover"
                priority
            />

            {/* --- ICONES CLIQUABLES --- */}

            {/* Icône Sommeil */}
            <Link
                href={`/${locale}/member/domains/sleep`}
                className="absolute"
                style={{
                    top: "40%",
                    left: "30%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Image
                    src="/images/icon_sleep.png"
                    alt={t("sleepAlt")}
                    width={80}
                    height={80}
                    className="hover:scale-110 transition-transform cursor-pointer"
                />
            </Link>

            {/* Icône Yoga / Exercice */}
            <Link
                href={`/${locale}/member/domains/exercice`}
                className="absolute"
                style={{
                    top: "60%",
                    left: "55%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Image
                    src="/images/icon_yoga.png"
                    alt={t("exerciceAlt")}
                    width={80}
                    height={80}
                    className="hover:scale-110 transition-transform cursor-pointer"
                />
            </Link>

            {/* Icône Méditation */}
            <Link
                href={`/${locale}/member/domains/meditation`}
                className="absolute"
                style={{
                    top: "35%",
                    left: "70%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Image
                    src="/images/icon_meditation.png"
                    alt={t("meditationAlt")}
                    width={80}
                    height={80}
                    className="hover:scale-110 transition-transform cursor-pointer"
                />
            </Link>

        </div>
    );
}
