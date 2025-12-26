import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

const LOCALE_COOKIE = "locale";

/**
 * Middleware i18n (redirection vers une route localisée).
 *
 * @remarks
 * - Ignore les routes Next.js internes, l'API, et les fichiers statiques.
 * - Laisse passer `/auth` en "root-level" (non localisé).
 * - Si l'URL n'est pas déjà préfixée par une locale, redirige vers `/{locale}{pathname}`.
 * - La locale est déterminée via cookie `locale` (si valide) sinon {@link defaultLocale}.
 */
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    /**
     * Laisse `/auth` hors locale (route "root-level").
     */
    if (pathname === "/auth" || pathname.startsWith("/auth/")) {
        return NextResponse.next();
    }

    /**
     * Ignore Next internals, API et ressources statiques.
     *
     * @remarks
     * - `/_next` : assets internes Next.js
     * - `/api` : routes API Next.js
     * - `/favicon.ico` : favicon
     * - Extensions : fichiers statiques (images, fonts, etc.)
     */
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/docs") || // pour servir la doc sans locale
        pathname.match(/\.(.*)$/)
    ) {
        return NextResponse.next();
    }

    /**
     * Si l'URL commence déjà par une locale (`/fr/...` ou `/en/...`), ne pas rediriger.
     */
    const seg1 = pathname.split("/")[1];
    if (isLocale(seg1)) {
        return NextResponse.next();
    }

    /**
     * Détermine la locale cible via cookie (si présent et valide) ou locale par défaut.
     */
    const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
    const chosen = cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale;

    /**
     * Redirige vers la variante localisée de l'URL.
     */
    const url = req.nextUrl.clone();
    url.pathname = `/${chosen}${pathname}`;
    return NextResponse.redirect(url);
}

/**
 * Configuration du matcher.
 *
 * @remarks
 * Applique le middleware à toutes les routes, avec exclusions gérées dans la fonction.
 */
export const config = {
    matcher: ["/:path*"],
};
