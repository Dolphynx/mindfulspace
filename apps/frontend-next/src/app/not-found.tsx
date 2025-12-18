/**
 * NotFoundGlobal
 * --------------
 * Fallback 404 global (hors sous-arbre localisé).
 *
 * @remarks
 * - Ne dépend PAS du système de traduction (pas de locale ici).
 * - Sert uniquement de filet de sécurité.
 */

import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-3xl font-semibold">404</h1>
            <p className="mt-2 text-sm opacity-80">This page could not be found.</p>
            <Link href="/" className="mt-6 rounded-lg border px-4 py-2 text-sm hover:bg-black/5">
                Go home
            </Link>
        </main>
    );
}
