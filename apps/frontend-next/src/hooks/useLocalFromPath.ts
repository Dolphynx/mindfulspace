"use client";

import { useParams } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export function useLocaleFromPath(): Locale {
    const params = useParams<{ locale?: string }>();
    const raw = params.locale ?? defaultLocale;

    return isLocale(raw) ? raw : defaultLocale;
}
