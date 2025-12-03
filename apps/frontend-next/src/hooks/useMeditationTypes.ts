"use client";

import { useEffect, useState } from "react";
import {
    fetchMeditationTypes,
    type MeditationTypeItem,
} from "@/lib/api/meditation";

/**
 * Représente un type de méditation tel que fourni par l'API.
 *
 * Chaque type correspond à une catégorie de contenu (ex.: "respiration",
 * "scan corporel", "audio guidée"). Ces types permettent d'organiser
 * l'affichage de la bibliothèque de méditations.
 *
 * Ce type étend le type minimal {@link MeditationTypeItem} exposé par
 * la couche API, en ajoutant quelques champs optionnels que le backend
 * peut fournir ou ignorer.
 */
export type MeditationType = MeditationTypeItem & {
    /**
     * Nom du type de méditation, optionnel côté API.
     * La majorité du temps, l'application utilise des traductions
     * basées sur le slug.
     */
    name?: string | null;

    /** Description textuelle fournie par l’API, utilisée notamment dans les listings. */
    description?: string | null;

    /**
     * Indique si le type de méditation est actif et doit être affiché
     * dans l’interface.
     *
     * Le backend filtre généralement sur `isActive = true`, ce champ est donc
     * surtout informatif côté frontend et reste optionnel.
     */
    isActive?: boolean;

    /**
     * Ordre d'affichage facultatif. L’API peut le fournir pour organiser les types
     * de manière cohérente dans l'interface.
     */
    sortOrder?: number | null;
};

/**
 * Valeur de retour du hook `useMeditationTypes`.
 *
 * Ce contrat permet de centraliser l'accès aux types de méditation,
 * ainsi que leur état de chargement et la gestion d’erreur.
 */
type UseMeditationTypesResult = {
    /** Liste des types de méditation récupérés depuis l'API. */
    types: MeditationType[];

    /** Indique si la requête est en cours. */
    loading: boolean;

    /** Indique si une erreur réseau ou API s'est produite. */
    error: boolean;
};

/**
 * Hook React permettant de charger les types de méditation depuis l'API.
 *
 * Ce hook :
 * - effectue une requête `GET /meditation-types` via la couche API
 *   (`fetchMeditationTypes`)
 * - gère automatiquement les états `loading` et `error`
 * - renvoie les données typées pour une utilisation immédiate dans l'UI
 *
 * Le chargement est déclenché uniquement au montage du composant.
 *
 * @returns Liste des types, état de chargement et état d'erreur.
 */
export function useMeditationTypes(): UseMeditationTypesResult {
    const [types, setTypes] = useState<MeditationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setError(false);

                // Les données retournées sont compatibles avec `MeditationTypeItem`
                // et sont castées ici vers `MeditationType` (champs supplémentaires optionnels).
                const data = (await fetchMeditationTypes()) as MeditationType[];
                setTypes(data);
            } catch (e) {
                console.error("Failed to load meditation types", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        void run();
    }, []);

    return { types, loading, error };
}
