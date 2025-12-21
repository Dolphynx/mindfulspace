// src/i18n/useLocaleFromPath.ts
"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export function useLocaleFromPath(): Locale {
    const pathname = usePathname();
    const segments = pathname.split("/");
    const raw = segments[1];

    if (raw && isLocale(raw)) return raw;
    return defaultLocale;
}
