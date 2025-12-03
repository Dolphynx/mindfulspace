"use client";

import { useCallback, useEffect, useState } from "react";
import {
    createMeditationSession,
    fetchLastMeditationSessions,
    fetchMeditationTypes,
    type CreateMeditationSessionPayload,
    type MeditationSession,
    type MeditationTypeItem,
} from "@/lib/api/meditation";
import { VisualBreathingConfig } from "@/components";

export type MeditationErrorType = "load" | "save" | "types" | null;

/**
 * Représente le format minimal attendu lors de la création d'une séance.
 *
 * Ce type est directement mappé sur le payload de l’API
 * `POST /me/meditation-sessions`.
 */
type CreateSessionInput = CreateMeditationSessionPayload;

/**
 * Format de retour du hook `useMeditationSessions`.
 *
 * Ce contrat expose :
 * - les dernières séances (issues de `GET /me/meditation-sessions?lastDays=7`)
 * - la liste des types de méditation (via `GET /meditation-types`)
 * - les statuts de chargement et d’erreur
 * - des fonctions de refresh
 * - une fonction de création de séance
 */
type UseMeditationSessionsResult = {
    /** Liste des séances récentes. */
    sessions: MeditationSession[];

    /** Liste des types de méditation disponibles. */
    types: MeditationTypeItem[];

    /** Indique si une opération asynchrone est en cours. */
    loading: boolean;

    /** Nature de l’erreur rencontrée (chargement, sauvegarde, types…). */
    errorType: MeditationErrorType;

    /** Recharge les séances (ré-exécute `GET /me/meditation-sessions?lastDays=7`). */
    reload: () => Promise<void>;

    /** Recharge uniquement les types (`GET /meditation-types`). */
    reloadTypes: () => Promise<void>;

    /** Crée une séance (`POST /me/meditation-sessions`) puis rafraîchit la liste. */
    createSession: (payload: CreateSessionInput) => Promise<void>;
};

/**
 * Hook centralisant toute la logique des séances de méditation :
 *
 * - Chargement des types et des dernières séances (`GET /me/meditation-sessions`,
 *   `GET /meditation-types`)
 * - Création d’une séance (`POST /me/meditation-sessions`)
 * - Gestion des erreurs catégorisées
 * - Méthodes de rafraîchissement accessibles aux composants
 *
 * Le hook encapsule toutes les opérations liées aux ressources "méditation"
 * côté API, permettant ainsi aux composants d'utiliser une API minimaliste et stable.
 *
 * @returns Données, états et actions relatives aux séances de méditation.
 */
export function useMeditationSessions(): UseMeditationSessionsResult {
    const [sessions, setSessions] = useState<MeditationSession[]>([]);
    const [types, setTypes] = useState<MeditationTypeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<MeditationErrorType>(null);

    /**
     * Charge les dernières séances de méditation pour l’utilisateur courant.
     *
     * S’appuie sur l’API `GET /me/meditation-sessions?lastDays=7`.
     * Définit `errorType = "load"` en cas d’échec réseau ou API.
     */
    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);

        try {
            const data = await fetchLastMeditationSessions();
            setSessions(data);
        } catch (e) {
            console.error("[useMeditationSessions] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Charge les types de méditation disponibles.
     *
     * S’appuie sur l’API `GET /meditation-types`.
     * Définit `errorType = "types"` en cas d’échec.
     */
    const loadTypes = useCallback(async () => {
        try {
            const data = await fetchMeditationTypes();
            setTypes(data);
        } catch (e) {
            console.error("[useMeditationSessions] types failed", e);
            setErrorType("types");
        }
    }, []);

    /**
     * Chargement initial des données (séances et types).
     */
    useEffect(() => {
        void load();
        void loadTypes();
    }, [load, loadTypes]);

    /**
     * Crée une nouvelle séance pour l’utilisateur courant puis recharge la liste.
     *
     * Utilise l’API `POST /me/meditation-sessions` puis,
     * en cas de succès, relance `load()` pour rafraîchir les données.
     *
     * Définit `errorType = "save"` en cas d’échec et relance l’erreur
     * pour permettre un traitement spécifique côté UI (toast, banner, etc.).
     */
    const createSession = useCallback(
        async (payload: CreateSessionInput) => {
            setErrorType(null);
            try {
                await createMeditationSession(payload);
                await load();
            } catch (e) {
                console.error("[useMeditationSessions] save failed", e);
                setErrorType("save");
                throw e;
            }
        },
        [load],
    );

    return {
        sessions,
        types,
        loading,
        errorType,
        reload: load,
        reloadTypes: loadTypes,
        createSession,
    };
}

// 🔁 Ré-export des types pour simplifier l'import dans les composants.
export type {
    MeditationSession,
    MeditationTypeItem,
} from "@/lib/api/meditation";

/**
 * Représentation simplifiée d’un contenu de méditation utilisée
 * par certains composants (ex. visualisation / respiration guidée).
 *
 * Ce type est distinct du type détaillé de l’API afin de découpler
 * la forme exacte des données backend des besoins UI.
 */
export type MeditationContent = {
    /** Identifiant unique du contenu. */
    id: string;

    /** Titre affiché dans l’interface. */
    title: string;

    /** Description éventuelle, courte, affichée sous le titre. */
    description?: string | null;

    /** Indique si le contenu est réservé aux utilisateurs premium. */
    isPremium: boolean;

    /**
     * Mode de la séance (audio, simple timer, visualisation, vidéo).
     * Permet de sélectionner le composant UI approprié.
     */
    mode: "AUDIO" | "TIMER" | "VISUAL" | "VIDEO";

    /** URL éventuelle vers la ressource multimédia. */
    mediaUrl?: string | null;

    /**
     * Configuration spécifique pour les visualisations de respiration
     * (couleurs, timing, etc.). Null ou omise si non applicable.
     */
    visualConfig?: VisualBreathingConfig | null;
};
