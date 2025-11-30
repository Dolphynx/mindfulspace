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
 * Mappé directement sur le payload API.
 */
type CreateSessionInput = CreateMeditationSessionPayload;

/**
 * Format de retour du hook `useMeditationSessions`.
 *
 * Ce contrat expose :
 * - les dernières séances
 * - la liste des types de méditation
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

    /** Recharge les séances. */
    reload: () => Promise<void>;

    /** Recharge uniquement les types. */
    reloadTypes: () => Promise<void>;

    /** Crée une séance et rafraîchit ensuite la liste. */
    createSession: (payload: CreateSessionInput) => Promise<void>;
};

/**
 * Hook centralisant toute la logique des séances de méditation :
 *
 * - Chargement des types et des dernières séances
 * - Création d’une séance
 * - Gestion des erreurs catégorisées
 * - Méthodes de rafraîchissement accessibles aux composants
 *
 * Le hook encapsule toutes les opérations liées à la ressource "méditation",
 * permettant ainsi aux composants d'utiliser une API minimaliste et stable.
 *
 * @returns Données, états et actions relatives aux séances de méditation.
 */
export function useMeditationSessions(): UseMeditationSessionsResult {
    const [sessions, setSessions] = useState<MeditationSession[]>([]);
    const [types, setTypes] = useState<MeditationTypeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<MeditationErrorType>(null);

    /**
     * Charge les dernières séances de méditation.
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
     * Crée une nouvelle séance puis recharge la liste.
     * Définit `errorType = "save"` en cas d’échec et relance l’erreur
     * pour permettre un traitement spécifique côté UI.
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

export type MeditationContent = {
    id: string;
    title: string;
    description?: string | null;
    isPremium: boolean;
    mode: "AUDIO" | "TIMER" | "VISUAL" | "VIDEO";
    mediaUrl?: string | null;
    visualConfig?: VisualBreathingConfig | null;
};
