"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

export type MeditationTypeLite = { id: string; slug: string };
export type ExerciceContentItem = { id: string; name: string };

type DomainTypesState = {
    meditation: MeditationTypeLite[];
    exercise: ExerciceContentItem[];
};

export function useDomainTypes() {
    const [types, setTypes] = useState<DomainTypesState>({
        meditation: [],
        exercise: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const [medRes, exRes] = await Promise.all([
                    apiFetch("/meditation-types", { cache: "no-store" }),
                    apiFetch("/exercices/exercice-content", { cache: "no-store" }),
                ]);

                if (!medRes.ok || !exRes.ok) return;

                const medRaw = (await medRes.json()) as unknown;
                const exRaw = (await exRes.json()) as unknown;

                // Typage défensif minimal (sans `any`)
                const meditation = Array.isArray(medRaw)
                    ? (medRaw as MeditationTypeLite[])
                    : [];
                const exercise = Array.isArray(exRaw)
                    ? (exRaw as ExerciceContentItem[])
                    : [];

                if (!cancelled) setTypes({ meditation, exercise });
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return { types, loading };
}
