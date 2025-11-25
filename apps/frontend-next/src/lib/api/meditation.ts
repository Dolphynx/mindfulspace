export type MeditationTypeItem = {
    /** Identifiant unique du type de méditation. */
    id: string;

    /** Slug textuel utilisé pour les traductions et le routing. */
    slug: string;

    // name?: string; // optionnel côté backend
};

/**
 * Représente une séance de méditation telle que renvoyée par l’API
 * via l’endpoint `/meditation/last7days`.
 *
 * Les champs sont volontairement minimalistes pour alléger les transferts.
 */
export type MeditationSession = {
    /** Date normalisée au format YYYY-MM-DD. */
    date: string;

    /** Durée de la séance, en secondes. */
    durationSeconds: number;

    /** Humeur finale (1 à 5) ou null si absente. */
    moodAfter: number | null;

    /**
     * Identifiant du type de méditation.
     * Peut être null si le backend ne parvient pas à associer le type.
     */
    meditationTypeId: string | null;
};

/**
 * Payload envoyé au backend lors de la création d’une nouvelle séance.
 */
export type CreateMeditationSessionPayload = {
    /** Type de méditation sélectionné. */
    meditationTypeId: string;

    /** Identifiant du contenu (audio/visuel) si applicable. */
    meditationContentId?: string;

    /** Durée totale de la séance en secondes. */
    durationSeconds: number;

    /** Date ISO complète utilisée pour l’enregistrement. */
    dateSession: string;

    /** Humeur avant la séance, si renseignée. */
    moodBefore?: number;

    /** Humeur après la séance, si renseignée. */
    moodAfter?: number;

    /** Notes textuelles éventuelles. */
    notes?: string;
};

/**
 * URL de base de l’API.
 * En développement : fallback sur http://localhost:3001.
 */
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/* -------------------------------------------------------------------------- */
/*  TYPES : réponses BACKEND "brutes"                                         */
/* -------------------------------------------------------------------------- */

/**
 * Forme brute d’un résumé de séance renvoyé par l’API.
 * Les types étant incertains (unknown), une phase de validation est nécessaire.
 */
type RawMeditationSummary = {
    date?: unknown;
    durationSeconds?: unknown;
    moodAfter?: unknown;
    meditationTypeId?: unknown;
};

/**
 * Type guard permettant de vérifier qu’une valeur correspond
 * à une structure cohérente de résumé de séance.
 *
 * @param value Valeur quelconque issue du JSON backend.
 * @returns `true` si la structure est minimalement valide.
 */
function isRawMeditationSummary(
    value: unknown,
): value is RawMeditationSummary {
    if (!value || typeof value !== "object") return false;
    const v = value as RawMeditationSummary;
    return (
        typeof v.date === "string" &&
        typeof v.durationSeconds === "number"
    );
}

/**
 * Convertit une valeur brute potentiellement hétérogène en
 * `MeditationSession`, ou retourne `null` si la structure est invalide.
 *
 * Ce pattern sécurise le front-end contre les dérives ou modifications
 * inattendues du backend.
 */
function normalizeMeditationSummary(
    raw: RawMeditationSummary,
): MeditationSession | null {
    if (typeof raw.date !== "string") return null;
    if (typeof raw.durationSeconds !== "number") return null;

    const moodAfter =
        typeof raw.moodAfter === "number" ? raw.moodAfter : null;

    return {
        date: raw.date,
        durationSeconds: raw.durationSeconds,
        moodAfter,
        meditationTypeId:
            typeof raw.meditationTypeId === "string"
                ? raw.meditationTypeId
                : null,
    };
}

/* -------------------------------------------------------------------------- */
/*  GET /meditation/last7days                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Récupère les 7 derniers jours de séances de méditation.
 *
 * L’API renvoie une liste de structures non typées.
 * Le traitement applique :
 * - un filtrage via `isRawMeditationSummary`
 * - une conversion forte via `normalizeMeditationSummary`
 *
 * @param baseUrl URL personnalisée de l’API (défaut : API_BASE_URL)
 * @returns Liste sécurisée de `MeditationSession`.
 * @throws En cas de réponse HTTP invalide.
 */
export async function fetchLastMeditationSessions(
    baseUrl: string = API_BASE_URL,
): Promise<MeditationSession[]> {
    const res = await fetch(`${baseUrl}/meditation/last7days`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as unknown;

    if (!Array.isArray(data)) return [];

    return data
        .filter(isRawMeditationSummary)
        .map(normalizeMeditationSummary)
        .filter((s): s is MeditationSession => s !== null);
}

/* -------------------------------------------------------------------------- */
/*  GET /meditation/types                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Récupère la liste des types de méditation disponibles.
 *
 * @param baseUrl URL personnalisée de l’API (facultatif).
 * @returns Liste brute de `MeditationTypeItem`.
 * @throws Si la requête échoue.
 */
export async function fetchMeditationTypes(
    baseUrl = API_BASE_URL,
): Promise<MeditationTypeItem[]> {
    const res = await fetch(`${baseUrl}/meditation/types`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch meditation types");
    }

    return res.json();
}

/* -------------------------------------------------------------------------- */
/*  POST /meditation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Crée une nouvelle séance de méditation.
 *
 * Envoie un payload JSON au backend contenant :
 * - le type
 * - le contenu optionnel
 * - la durée
 * - la date complète de la séance
 * - les humeurs avant/après
 * - d’éventuelles notes
 *
 * @param payload Données nécessaires à l’enregistrement.
 * @param baseUrl URL de l’API.
 * @throws Si l’API renvoie un code HTTP d’erreur.
 */
export async function createMeditationSession(
    payload: CreateMeditationSessionPayload,
    baseUrl: string = API_BASE_URL,
): Promise<void> {
    const res = await fetch(`${baseUrl}/meditation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
}
