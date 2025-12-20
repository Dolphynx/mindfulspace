import { apiFetch } from "./client";

/**
 * Type minimal représentant un type de méditation tel qu’exposé au frontend.
 *
 * Ce DTO correspond à la forme renvoyée par l’endpoint
 * `GET /meditation-types`.
 */
export type MeditationTypeItem = {
    /** Identifiant unique du type de méditation. */
    id: string;

    /** Slug textuel utilisé pour les traductions et le routing. */
    slug: string;

    // name?: string; // optionnel côté backend
};

/**
 * Représente une séance de méditation telle que renvoyée par l’API
 * via l’endpoint `GET /me/meditation-sessions?lastDays=7`.
 *
 * Les champs sont volontairement minimalistes pour alléger les transferts
 * et s’adapter aux besoins du graphe d’historique côté UI.
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
 * Payload envoyé au backend lors de la création d’une nouvelle séance
 * via l’endpoint `POST /me/meditation-sessions`.
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

/* -------------------------------------------------------------------------- */
/*  TYPES : réponses BACKEND "brutes"                                         */
/* -------------------------------------------------------------------------- */

/**
 * Forme brute d’un résumé de séance renvoyé par l’API.
 *
 * Les champs sont typés en `unknown` car le JSON backend
 * n’est pas typé statiquement côté client. Une phase de
 * validation/normalisation est donc nécessaire avant
 * de transformer ces données en {@link MeditationSession}.
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
 * @returns `true` si la structure est minimalement valide
 *          (date string + durée numérique).
 */
function isRawMeditationSummary(
    value: unknown,
): value is RawMeditationSummary {
    if (!value || typeof value !== "object") return false;
    const v = value as RawMeditationSummary;
    return typeof v.date === "string" && typeof v.durationSeconds === "number";
}

/**
 * Convertit une valeur brute potentiellement hétérogène en
 * {@link MeditationSession}, ou retourne `null` si la structure est invalide.
 *
 * Ce pattern sécurise le front-end contre les dérives ou modifications
 * inattendues du backend (champs manquants, types incorrects, etc.).
 *
 * @param raw Objet brut supposé représenter un résumé de séance.
 * @returns Une instance valide de {@link MeditationSession} ou `null`.
 */
function normalizeMeditationSummary(
    raw: RawMeditationSummary,
): MeditationSession | null {
    if (typeof raw.date !== "string") return null;
    if (typeof raw.durationSeconds !== "number") return null;

    const moodAfter = typeof raw.moodAfter === "number" ? raw.moodAfter : null;

    return {
        date: raw.date,
        durationSeconds: raw.durationSeconds,
        moodAfter,
        meditationTypeId:
            typeof raw.meditationTypeId === "string" ? raw.meditationTypeId : null,
    };
}

/* -------------------------------------------------------------------------- */
/*  GET /me/meditation-sessions?lastDays=7                                    */
/* -------------------------------------------------------------------------- */

/**
 * Récupère les 7 derniers jours de séances de méditation
 * pour l’utilisateur courant.
 *
 * L’API renvoie une liste de structures non typées (`unknown[]`).
 * Le traitement applique :
 *
 * - un filtrage via {@link isRawMeditationSummary},
 * - une conversion forte via {@link normalizeMeditationSummary},
 * - un filtrage final pour éliminer les entrées invalides.
 *
 * @returns Liste sécurisée de {@link MeditationSession}.
 * @throws En cas de réponse HTTP non OK (`res.ok === false`).
 */
export async function fetchLastMeditationSessions(): Promise<MeditationSession[]> {
    const res = await apiFetch("/me/meditation-sessions?lastDays=7", {
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
/*  GET /meditation-types                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Récupère la liste des types de méditation disponibles.
 *
 * Les données renvoyées correspondent directement
 * au type {@link MeditationTypeItem}.
 *
 * @returns Promesse d’une liste de {@link MeditationTypeItem}.
 * @throws Si la requête échoue (`res.ok === false`).
 */
export async function fetchMeditationTypes(): Promise<MeditationTypeItem[]> {
    const res = await apiFetch("/meditation-types", {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch meditation types");
    }

    return res.json();
}

/* -------------------------------------------------------------------------- */
/*  POST /me/meditation-sessions                                              */
/* -------------------------------------------------------------------------- */

/**
 * Crée une nouvelle séance de méditation via l’endpoint
 * `POST /me/meditation-sessions`.
 *
 * Cette fonction n’effectue pas de transformation sur la réponse :
 * en cas de succès, elle se contente de résoudre la promesse, sinon
 * elle lève une erreur avec le code HTTP.
 *
 * @param payload Données nécessaires à l’enregistrement de la séance.
 * @throws Si l’API renvoie un code HTTP d’erreur.
 */
export type CreateMeditationSessionResponse = {
    session: unknown;
    newBadges?: unknown[];
};

export async function createMeditationSession(
    payload: CreateMeditationSessionPayload,
): Promise<CreateMeditationSessionResponse> {
    const res = await apiFetch("/me/meditation-sessions", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    return res.json() as Promise<CreateMeditationSessionResponse>;
}

export async function fetchMeditationSessionsDetail(
    lastDays: number = 30,
): Promise<MeditationSession[]> {
    const res = await apiFetch(`/me/meditation-sessions?lastDays=${lastDays}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    return res.json() as Promise<MeditationSession[]>;
}
