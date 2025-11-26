'use client';

import { FormEvent, useState } from 'react';
import PageHero from "@/components/PageHero";

/**
 * Page /mantra
 *
 * → UI simple permettant :
 *   - de saisir un thème optionnel (texte libre)
 *   - de générer :
 *     - un mini-mantra
 *     - un message d’encouragement
 *     - trois objectifs (facile/normal/ambitieux)
 *
 * La page appelle directement l’API Nest via une URL fournie par
 * NEXT_PUBLIC_API_BASE_URL (configurée côté docker).
 *
 * Notes d’implémentation :
 * - Cette page est un composant client (`'use client'`) car elle gère :
 *   - des états locaux (useState),
 *   - des appels réseau côté navigateur (fetch),
 *   - des handlers d’événements (onSubmit, onClick).
 * - Chaque type de génération (mantra / encouragement / objectifs) possède :
 *   - son propre état de chargement,
 *   - son propre bouton,
 *   - sa propre fonction de handler.
 */
export default function MantraPage() {
    // Champ de saisie du thème
    const [theme, setTheme] = useState('');

    // États pour les résultats IA
    // - mantra : courte phrase inspirante
    const [mantra, setMantra] = useState('');
    // - encouragement : texte plus libre / motivant
    const [encouragement, setEncouragement] = useState('');
    // - objectives : pack de 3 objectifs de progression
    const [objectives, setObjectives] = useState<{
        easy?: string;
        normal?: string;
        ambitious?: string;
    }>({});

    // États de chargement / erreurs
    // Ces flags permettent de différencier les chargements par type d’action.
    const [loadingMantra, setLoadingMantra] = useState(false);
    const [loadingEncouragement, setLoadingEncouragement] = useState(false);
    const [loadingObjectives, setLoadingObjectives] = useState(false);
    const [error, setError] = useState('');

    /**
     * URL de base de l’API, injectée au build via NEXT_PUBLIC_API_BASE_URL.
     * Exemple en staging :
     *   NEXT_PUBLIC_API_BASE_URL=https://staging.mindfulspace.be/api
     *
     * Remarque :
     * - Si cette variable n’est pas définie, la page lève une erreur
     *   explicite dans buildUrl() afin de faciliter le debug.
     */
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    /**
     * Petit helper pour construire l’URL API complète.
     *
     * - Concatène la base avec le chemin fourni.
     * - En dev, si apiBaseUrl est absent, on lève une erreur claire
     *   pour éviter des fetch vers `undefined/xxx`.
     */
    function buildUrl(path: string) {
        if (!apiBaseUrl) {
            // On laisse l’erreur se voir en dev si la variable n’est pas configurée.
            throw new Error('NEXT_PUBLIC_API_BASE_URL non défini dans les variables Next.');
        }
        return `${apiBaseUrl}${path}`;
    }

    /**
     * Gestion de la soumission du formulaire :
     * on ne lance pas tout en même temps pour éviter la confusion,
     * mais tu pourrais adapter pour tout générer en parallèle.
     *
     * Comportement :
     * - Empêche le rechargement de la page (e.preventDefault()).
     * - Nettoie l’erreur et le dernier mantra.
     * - Active l’état de chargement du mantra.
     * - Envoie une requête POST vers /ai/mantra avec éventuellement un thème.
     * - En cas de succès → met à jour l’état `mantra`.
     * - En cas d’échec → affiche un message d’erreur utilisateur.
     */
    async function handleGenerateMantra(e: FormEvent) {
        e.preventDefault();
        setError('');
        setMantra('');
        setLoadingMantra(true);

        try {
            const res = await fetch(buildUrl('/ai/mantra'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: theme || undefined }),
            });

            if (!res.ok) {
                throw new Error('Réponse serveur non OK');
            }

            const data: { mantra: string } = await res.json();
            setMantra(data.mantra);
        } catch (err) {
            console.error(err);
            setError("Impossible de générer un mantra pour l'instant.");
        } finally {
            setLoadingMantra(false);
        }
    }

    /**
     * Génération d’un message d’encouragement.
     *
     * - Ne passe pas par le onSubmit du formulaire : déclenchée via un bouton `type="button"`.
     * - Utilise le même pattern que pour le mantra :
     *   • reset de l’erreur et de la valeur précédente,
     *   • activation du flag de chargement,
     *   • appel POST vers /ai/encouragement.
     */
    async function handleGenerateEncouragement() {
        setError('');
        setEncouragement('');
        setLoadingEncouragement(true);

        try {
            const res = await fetch(buildUrl('/ai/encouragement'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: theme || undefined }),
            });

            if (!res.ok) {
                throw new Error('Réponse serveur non OK');
            }

            const data: { encouragement: string } = await res.json();
            setEncouragement(data.encouragement);
        } catch (err) {
            console.error(err);
            setError("Impossible de générer un message d'encouragement pour l'instant.");
        } finally {
            setLoadingEncouragement(false);
        }
    }

    /**
     * Génération d’un trio d’objectifs (facile / normal / ambitieux).
     *
     * - Reset des objectifs existants avant la nouvelle génération.
     * - Appel POST vers /ai/objectives avec un éventuel thème.
     * - Met à jour `objectives` avec la réponse brute.
     */
    async function handleGenerateObjectives() {
        setError('');
        setObjectives({});
        setLoadingObjectives(true);

        try {
            const res = await fetch(buildUrl('/ai/objectives'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: theme || undefined }),
            });

            if (!res.ok) {
                throw new Error('Réponse serveur non OK');
            }

            const data: {
                easy: string;
                normal: string;
                ambitious: string;
            } = await res.json();

            setObjectives(data);
        } catch (err) {
            console.error(err);
            setError("Impossible de générer des objectifs pour l'instant.");
        } finally {
            setLoadingObjectives(false);
        }
    }

    return (
        <div className="text-brandText flex flex-col">
            {/* HERO
               - Bandeau visuel en haut de page, avec titre et sous-titre explicatifs. */}
            <PageHero
                title="Soutien IA – Mantras & objectifs"
                subtitle="Indique un thème (facultatif) et laisse l’IA proposer un mini-mantra, un message d’encouragement et des objectifs adaptés."
            />

            {/* IA FORM
               - Zone centrale avec le formulaire d’entrée du thème
                 et les boutons de génération. */}
            <section className="mx-auto max-w-7xl w-full px-4 py-8">
                <form onSubmit={handleGenerateMantra} className="space-y-4">
                    <label className="block space-y-1">
                        <span className="text-sm font-medium">Thème (optionnel)</span>
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2 text-sm"
                            placeholder="ex: stress, confiance en soi, sommeil…"
                        />
                    </label>

                    {/* Boutons de déclenchement des différentes générations IA */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={loadingMantra}
                            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            {loadingMantra ? 'Génération du mantra…' : 'Générer un mini-mantra'}
                        </button>

                        <button
                            type="button"
                            onClick={handleGenerateEncouragement}
                            disabled={loadingEncouragement}
                            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            {loadingEncouragement
                                ? "Génération de l'encouragement…"
                                : "Générer un message d'encouragement"}
                        </button>

                        <button
                            type="button"
                            onClick={handleGenerateObjectives}
                            disabled={loadingObjectives}
                            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            {loadingObjectives
                                ? 'Génération des objectifs…'
                                : 'Générer 3 objectifs (facile/normal/ambitieux)'}
                        </button>
                    </div>
                </form>

                {/* Message d’erreur global (affiché si une des requêtes échoue) */}
                {error && <p className="text-sm text-red-600">{error}</p>}

                {/* IA RESPONSES
                    - Affichage conditionnel de chaque bloc selon les données reçues. */}
                <section className="space-y-4">
                    {mantra && (
                        <div className="rounded-2xl border px-4 py-3">
                            <h2 className="text-sm font-semibold text-gray-700">Mini-mantra</h2>
                            <p className="mt-1 text-lg italic">“{mantra}”</p>
                        </div>
                    )}

                    {encouragement && (
                        <div className="rounded-2xl border px-4 py-3">
                            <h2 className="text-sm font-semibold text-gray-700">Message d&apos;encouragement</h2>
                            <p className="mt-1 text-base">{encouragement}</p>
                        </div>
                    )}

                    {(objectives.easy || objectives.normal || objectives.ambitious) && (
                        <div className="rounded-2xl border px-4 py-3">
                            <h2 className="text-sm font-semibold text-gray-700">Objectifs proposés</h2>
                            <ul className="mt-2 space-y-1 text-sm">
                                {objectives.easy && (
                                    <li>
                                        <span className="font-semibold">Facile : </span>
                                        {objectives.easy}
                                    </li>
                                )}
                                {objectives.normal && (
                                    <li>
                                        <span className="font-semibold">Normal : </span>
                                        {objectives.normal}
                                    </li>
                                )}
                                {objectives.ambitious && (
                                    <li>
                                        <span className="font-semibold">Ambitieux : </span>
                                        {objectives.ambitious}
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </section>
            </section>
        </div>
    );
}
