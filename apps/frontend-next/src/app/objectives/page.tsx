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

export default function ObjectivesPage() {
    const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
    const [selectedSessionTypeId, setSelectedSessionTypeId] = useState('');
    const [loadingTypes, setLoadingTypes] = useState(false);

    const [proposal, setProposal] = useState<ObjectivesProposal | null>(null);
    const [loadingProposal, setLoadingProposal] = useState(false);

    const [savingLevel, setSavingLevel] = useState<ObjectiveLevel | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Charger les SessionTypes au montage
    useEffect(() => {
        if (!apiBaseUrl) return;

        async function fetchTypes() {
            setLoadingTypes(true);
            setError(null);

            try {
                const res = await fetch(buildUrl('/sessions/types'));
                if (!res.ok) throw new Error('Erreur lors du chargement des types');
                const data: SessionType[] = await res.json();
                setSessionTypes(data);
            } catch (e) {
                console.error(e);
                setError("Impossible de charger les types de session.");
            } finally {
                setLoadingTypes(false);
            }
        }

        fetchTypes();
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
                const errJson = await res.json().catch(() => null);
                if (res.status === 404 && errJson?.message) {
                    throw new Error(errJson.message);
                }
                throw new Error('Réponse serveur non OK');
            }

            const data: ObjectivesProposal = await res.json();
            setProposal(data);
        } catch (e) {
            console.error(e);
            setError("Impossible de proposer des objectifs pour l'instant.");
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
                throw new Error('Réponse serveur non OK');
            }

            const data = await res.json();
            console.log('Objective saved:', data);
            setMessage(`Objectif "${level}" enregistré avec succès.`);
        } catch (e) {
            console.error(e);
            setError("Impossible d'enregistrer cet objectif.");
        } finally {
            setSavingLevel(null);
        }
    }

    return (
        <div className="text-brandText flex flex-col">
            <PageHero
                title="Objectifs personnalisés"
                subtitle="Propose des objectifs réalistes à partir de l’historique de sessions du user de démo."
            />

            <section className="mx-auto max-w-5xl w-full px-4 py-8 space-y-6">
                {/* Sélection du type de session */}
                <div className="space-y-2">
                    <label className="block space-y-1">
            <span className="text-sm font-medium">
              Type de session pour les objectifs
            </span>
                        <select
                            value={selectedSessionTypeId}
                            onChange={(e) => setSelectedSessionTypeId(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                            disabled={loadingTypes}
                        >
                            <option value="">
                                {loadingTypes
                                    ? 'Chargement des types...'
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
                        disabled={!selectedSessionTypeId || loadingProposal}
                        className="inline-flex items-center rounded-xl bg-brandGreen px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {loadingProposal ? 'Calcul en cours...' : 'Proposer des objectifs'}
                    </button>
                </div>

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

                {/* Propositions d’objectifs */}
                {proposal && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Objectifs pour {proposal.sessionTypeName}{' '}
                                {proposal.unitLabel && `(${proposal.unitLabel})`}
                            </h2>
                            <p className="text-sm text-brandMuted">
                                Basé sur une moyenne de {proposal.average}{' '}
                                {proposal.unitLabel} sur les dernières sessions du user de
                                démo.
                            </p>
                            <p className="text-sm text-brandMuted mt-1">
                                Chaque objectif est exprimé en {proposal.unitLabel}{' '}
                                {frequencyLabel(proposal.frequency)} pendant{' '}
                                {proposal.durationValue}{' '}
                                {durationUnitLabel(
                                    proposal.durationUnit,
                                    proposal.durationValue,
                                )}
                                .
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {(
                                [
                                    ['easy', 'Facile'],
                                    ['normal', 'Standard'],
                                    ['challenge', 'Challenge'],
                                ] as [ObjectiveLevel, string][]
                            ).map(([level, label]) => {
                                const obj = proposal.objectives[level];
                                return (
                                    <div
                                        key={level}
                                        className="rounded-2xl border bg-white px-4 py-3 shadow-sm space-y-2"
                                    >
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-sm font-medium">{label}</span>
                                            <span className="text-sm text-brandMuted capitalize">
                        {level}
                      </span>
                                        </div>
                                        <p className="text-xl font-semibold">
                                            {obj.value} {proposal.unitLabel}
                                        </p>
                                        <p className="text-xs text-brandMuted">
                                            {frequencyLabel(proposal.frequency)}, pendant{' '}
                                            {proposal.durationValue}{' '}
                                            {durationUnitLabel(
                                                proposal.durationUnit,
                                                proposal.durationValue,
                                            )}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleSave(level)}
                                            disabled={savingLevel === level}
                                            className="mt-1 inline-flex items-center rounded-xl border border-brandGreen px-3 py-1.5 text-xs font-medium text-brandGreen hover:bg-brandGreen hover:text-white transition-colors disabled:opacity-60"
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
            </section>
        </div>
    );
}