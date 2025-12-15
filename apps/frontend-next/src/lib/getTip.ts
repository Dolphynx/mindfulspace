import {apiFetch} from "@/lib/api/client";

/**
 * getTip
 *
 * Récupère un "tip" (conseil bien-être) depuis l’API Nest.
 *
 * - Ne contient AUCUN texte i18n.
 * - Ne connaît pas la liste des locales supportées.
 * - Si l’API ne renvoie rien de valable → retourne `null`.
 *   (Le fallback textuel est géré dans l’UI via les traductions.)
 */
export async function getTip(locale: string): Promise<string | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_API_URL manquant");
            return null;
        }

        const url = `${baseUrl}/tips/random?locale=${encodeURIComponent(locale)}`;

        const res = await apiFetch(url, { cache: "no-store" });

        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        if (typeof data.tip === "string" && data.tip.trim().length > 0) {
            return data.tip;
        }

        return null;
    } catch (e) {
        console.error("Erreur dans getTip:", e);
        return null;
    }
}
