'use client';

import { useEffect, useState } from 'react';
import PageHero from '@/components/PageHero';

type SessionUnit = {
    id: string;
    value: string;
};

type SessionType = {
    id: string;
    name: string;
    sessionUnit?: SessionUnit | null;
};

type ObjectiveLevel = 'easy' | 'normal' | 'challenge';

type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type DurationUnit = 'DAY' | 'WEEK' | 'MONTH';

type ObjectivesProposal = {
    sessionTypeId: string;
    sessionTypeName: string;
    unitLabel: string;
    average: number;
    frequency: Frequency;
    durationUnit: DurationUnit;
    durationValue: number;
    objectives: {
        easy: { level: ObjectiveLevel; value: number };
        normal: { level: ObjectiveLevel; value: number };
        challenge: { level: ObjectiveLevel; value: number };
    };
};

type SavedObjective = {
    id: string;
    sessionTypeId: string;
    sessionTypeName: string;
    unitLabel: string;
    value: number;
    frequency: Frequency;
    durationUnit: DurationUnit;
    durationValue: number;
    level?: ObjectiveLevel; // pas stocké en DB pour les anciens, mais connu pour ceux créés durant la session
};

type HasSessionsResponse = {
    hasSessions: boolean;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

function buildUrl(path: string) {
    if (!apiBaseUrl) {
        throw new Error(
            'NEXT_PUBLIC_API_URL non défini. Vérifie ta config Docker / env.',
        );
    }
    return `${apiBaseUrl}${path}`;
}

function frequencyLabel(freq: Frequency) {
    switch (freq) {
        case 'DAILY':
            return 'par jour';
        case 'WEEKLY':
            return 'par semaine';
        case 'MONTHLY':
            return 'par mois';
    }
}

function durationUnitLabel(unit: DurationUnit, value: number) {
    switch (unit) {
        case 'DAY':
            return value > 1 ? 'jours' : 'jour';
        case 'WEEK':
            return value > 1 ? 'semaines' : 'semaine';
        case 'MONTH':
            return value > 1 ? 'mois' : 'mois';
    }
}

function levelLabel(level: ObjectiveLevel) {
    switch (level) {
        case 'easy':
            return 'Facile';
        case 'normal':
            return 'Standard';
        case 'challenge':
            return 'Challenge';
    }
}

function levelBadgeClasses(level: ObjectiveLevel) {
    switch (level) {
        case 'easy':
            return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'normal':
            return 'bg-sky-50 text-sky-700 border-sky-100';
        case 'challenge':
            return 'bg-amber-50 text-amber-700 border-amber-100';
    }
}

function sessionTypeIcon(name?: string) {
    const n = (name ?? '').toLowerCase();
    if (n.includes('sleep') || n.includes('sommeil')) return '😴';
    if (n.includes('exercice') || n.includes('sport') || n.includes('exercise')) return '🏃‍♂️';
    if (n.includes('medit') || n.includes('médit')) return '🧘';
    return '🎯';
}

export default function ObjectivesPage() {
    const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
    const [selectedSessionTypeId, setSelectedSessionTypeId] = useState('');
    const [loadingInit, setLoadingInit] = useState(false);

    const [proposal, setProposal] = useState<ObjectivesProposal | null>(null);
    const [loadingProposal, setLoadingProposal] = useState(false);

    const [savingLevel, setSavingLevel] = useState<ObjectiveLevel | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [savedObjectives, setSavedObjectives] = useState<SavedObjective[]>([]);
    const [hasSessions, setHasSessions] = useState<boolean | null>(null);

    // Chargement initial : types de session + objectifs déjà encodés + info "hasSessions"
    useEffect(() => {
        if (!apiBaseUrl) return;

        async function fetchInitial() {
            setLoadingInit(true);
            setError(null);

            try {
                const [typesRes, objectivesRes, sessionsRes] = await Promise.all([
                    fetch(buildUrl('/sessions/types')),
                    fetch(buildUrl('/objectives')),
                    fetch(buildUrl('/objectives/has-sessions')),
                ]);

                if (!typesRes.ok) {
                    throw new Error('Erreur lors du chargement des types de session.');
                }
                if (!objectivesRes.ok) {
                    throw new Error('Erreur lors du chargement des objectifs.');
                }
                if (!sessionsRes.ok) {
                    throw new Error('Erreur lors de la vérification des sessions.');
                }

                const typesData: SessionType[] = await typesRes.json();
                const objectivesData: SavedObjective[] = await objectivesRes.json();
                const sessionsData: HasSessionsResponse = await sessionsRes.json();

                setSessionTypes(typesData);
                setSavedObjectives(objectivesData);
                setHasSessions(sessionsData.hasSessions);
            } catch (error: unknown) {
                console.error(error);
                setError(
                    "Impossible de charger les types de session, les objectifs et/ou les informations sur les sessions.",
                );
                setHasSessions(null);
            } finally {
                setLoadingInit(false);
            }
        }

        fetchInitial();
    }, []);

    async function handlePropose() {
        setMessage(null);
        setError(null);
        setProposal(null);

        if (!selectedSessionTypeId) {
            setError('Choisis d’abord un type de session.');
            return;
        }

        setLoadingProposal(true);
        try {
            const res = await fetch(buildUrl('/objectives/propose'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionTypeId: selectedSessionTypeId }),
            });

            if (!res.ok) {
                let errorMessage = "Impossible de proposer des objectifs pour l'instant.";

                try {
                    const errJson: unknown = await res.json();
                    if (
                        res.status === 404 &&
                        errJson &&
                        typeof errJson === 'object' &&
                        'message' in errJson &&
                        typeof (errJson as { message: string }).message === 'string'
                    ) {
                        errorMessage = (errJson as { message: string }).message;
                    }
                } catch {
                    // ignore JSON parsing errors, garder le message par défaut
                }

                throw new Error(errorMessage);
            }

            const data: ObjectivesProposal = await res.json();
            setProposal(data);
        } catch (error: unknown) {
            console.error(error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Impossible de proposer des objectifs pour l'instant.",
            );
        } finally {
            setLoadingProposal(false);
        }
    }

    async function handleSave(level: ObjectiveLevel) {
        if (!proposal) return;
        setSavingLevel(level);
        setMessage(null);
        setError(null);

        try {
            const res = await fetch(buildUrl('/objectives/save'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionTypeId: proposal.sessionTypeId,
                    level,
                }),
            });

            if (!res.ok) {
                throw new Error("Impossible d'enregistrer cet objectif.");
            }

            const data: {
                message: string;
                level: ObjectiveLevel;
                objective: {
                    id: string;
                    sessionTypeId: string;
                    value: number;
                    frequency: Frequency;
                    durationUnit: DurationUnit;
                    durationValue: number;
                };
            } = await res.json();

            setMessage(
                `Objectif "${levelLabel(level)}" enregistré avec succès.`,
            );

            // Ajouter immédiatement dans la colonne de gauche
            setSavedObjectives((prev) => [
                {
                    id: data.objective.id,
                    sessionTypeId: data.objective.sessionTypeId,
                    sessionTypeName: proposal.sessionTypeName,
                    unitLabel: proposal.unitLabel,
                    value: data.objective.value,
                    frequency: data.objective.frequency,
                    durationUnit: data.objective.durationUnit,
                    durationValue: data.objective.durationValue,
                    level: data.level,
                },
                ...prev,
            ]);
        } catch (error: unknown) {
            console.error(error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Impossible d'enregistrer cet objectif.",
            );
        } finally {
            setSavingLevel(null);
        }
    }

    const isFormDisabled = hasSessions === false;

    return (
        <div className="text-brandText flex flex-col">
            <PageHero
                title="Objectifs personnalisés"
                subtitle="Propose des objectifs réalistes à partir de l’historique de sessions du user de démo."
            />

            <section className="mx-auto max-w-5xl w-full px-4 py-8">
                <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                    {/* Colonne gauche : objectifs déjà encodés */}
                    <div className="rounded-2xl bg-white shadow-sm border px-5 py-4 flex flex-col gap-4">
                        <header className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span>🎯 Objectifs enregistrés</span>
                                </h2>
                                <p className="text-sm text-brandMuted">
                                    Pour le user de démonstration.
                                </p>
                            </div>
                        </header>

                        {savedObjectives.length === 0 ? (
                            <p className="text-sm text-brandMuted border border-dashed rounded-xl px-4 py-3 text-center">
                                Aucun objectif pour le moment. Propose un objectif à droite
                                puis enregistre celui qui te convient.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {savedObjectives.map((obj) => (
                                    <div
                                        key={obj.id}
                                        className="flex items-start gap-3 rounded-2xl border bg-gradient-to-r from-white to-brandBg/40 px-4 py-3 shadow-xs"
                                    >
                                        <div className="text-2xl pt-1">
                                            {sessionTypeIcon(obj.sessionTypeName)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {obj.sessionTypeName}
                                                    </p>
                                                    <p className="text-xs text-brandMuted">
                                                        Objectif{' '}
                                                        {frequencyLabel(obj.frequency)}{' '}
                                                        pendant {obj.durationValue}{' '}
                                                        {durationUnitLabel(
                                                            obj.durationUnit,
                                                            obj.durationValue,
                                                        )}
                                                    </p>
                                                </div>
                                                {obj.level && (
                                                    <span
                                                        className={
                                                            'text-[11px] px-2 py-1 rounded-full border font-medium uppercase tracking-wide ' +
                                                            levelBadgeClasses(obj.level)
                                                        }
                                                    >
                                                        {levelLabel(obj.level)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold">
                                                {obj.value} {obj.unitLabel}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Colonne droite : formulaire + propositions */}
                    <div className="space-y-4">
                        {/* Carte formulaire ou message si pas de sessions */}
                        {isFormDisabled ? (
                            <div className="rounded-2xl bg-white shadow-sm border px-5 py-4 space-y-3 text-center">
                                <h2 className="text-lg font-semibold">
                                    Objectifs indisponibles
                                </h2>
                                <p className="text-sm text-brandMuted">
                                    Impossible de proposer des objectifs car aucune session
                                    n’a encore été encodée pour le user de démonstration.
                                </p>
                                <p className="text-sm text-brandMuted">
                                    Enregistrez quelques sessions (ou lancez le seed de
                                    démonstration) puis revenez sur cette page pour générer
                                    des objectifs personnalisés.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-white shadow-sm border px-5 py-4 space-y-3">
                                <h2 className="text-lg font-semibold">
                                    Proposer des objectifs
                                </h2>
                                <p className="text-sm text-brandMuted">
                                    Choisis un type de session puis laisse MindfulSpace te
                                    suggérer un objectif réaliste pour le user de démo.
                                </p>

                                <label className="block space-y-1">
                                    <span className="text-sm font-medium">
                                        Type de session pour les objectifs
                                    </span>
                                    <select
                                        value={selectedSessionTypeId}
                                        onChange={(e) =>
                                            setSelectedSessionTypeId(e.target.value)
                                        }
                                        className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                                        disabled={loadingInit}
                                    >
                                        <option value="">
                                            {loadingInit
                                                ? 'Chargement...'
                                                : 'Choisir un type de session'}
                                        </option>
                                        {sessionTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                                {type.sessionUnit?.value
                                                    ? ` (${type.sessionUnit.value})`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <button
                                    type="button"
                                    onClick={handlePropose}
                                    disabled={
                                        !selectedSessionTypeId || loadingProposal
                                    }
                                    className="inline-flex items-center rounded-xl bg-brandGreen px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                                >
                                    {loadingProposal
                                        ? 'Calcul en cours...'
                                        : 'Proposer des objectifs'}
                                </button>

                                {/* Messages */}
                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                        {error}
                                    </p>
                                )}

                                {message && (
                                    <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                        {message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Propositions sous le formulaire, version compacte */}
                        {proposal && !isFormDisabled && (
                            <div className="rounded-2xl bg-white shadow-sm border px-5 py-4 space-y-3">
                                <div>
                                    <h3 className="text-md font-semibold">
                                        Objectifs pour {proposal.sessionTypeName}{' '}
                                        {proposal.unitLabel &&
                                            `(${proposal.unitLabel})`}
                                    </h3>
                                    <p className="text-xs text-brandMuted">
                                        Basé sur une moyenne de {proposal.average}{' '}
                                        {proposal.unitLabel} sur les dernières
                                        sessions du user de démo.
                                    </p>
                                    <p className="text-xs text-brandMuted mt-1">
                                        Chaque objectif est exprimé en{' '}
                                        {proposal.unitLabel}{' '}
                                        {frequencyLabel(proposal.frequency)}{' '}
                                        pendant {proposal.durationValue}{' '}
                                        {durationUnitLabel(
                                            proposal.durationUnit,
                                            proposal.durationValue,
                                        )}
                                        .
                                    </p>
                                </div>

                                <div className="grid gap-3 md:grid-cols-3">
                                    {(
                                        [
                                            ['easy', 'Facile'],
                                            ['normal', 'Standard'],
                                            ['challenge', 'Challenge'],
                                        ] as [ObjectiveLevel, string][]
                                    ).map(([level, label]) => {
                                        const obj =
                                            proposal.objectives[level];
                                        return (
                                            <div
                                                key={level}
                                                className="rounded-2xl border bg-brandBg px-3 py-3 space-y-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold">
                                                        {label}
                                                    </span>
                                                    <span className="text-[11px] text-brandMuted capitalize">
                                                        {level}
                                                    </span>
                                                </div>
                                                <p className="text-lg font-semibold">
                                                    {obj.value}{' '}
                                                    {proposal.unitLabel}
                                                </p>
                                                <p className="text-[11px] text-brandMuted">
                                                    {frequencyLabel(
                                                        proposal.frequency,
                                                    )}
                                                    , pendant{' '}
                                                    {proposal.durationValue}{' '}
                                                    {durationUnitLabel(
                                                        proposal.durationUnit,
                                                        proposal.durationValue,
                                                    )}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSave(level)
                                                    }
                                                    disabled={
                                                        savingLevel === level
                                                    }
                                                    className="mt-1 inline-flex items-center rounded-xl border border-brandGreen px-3 py-1.5 text-[11px] font-medium text-brandGreen hover:bg-brandGreen hover:text-white transition-colors disabled:opacity-60"
                                                >
                                                    {savingLevel === level
                                                        ? 'Enregistrement...'
                                                        : 'Enregistrer cet objectif'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
