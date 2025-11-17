/**
 * Page Astuce
 * -----------
 * Cette page affiche une astuce / conseil bien-être récupéré depuis la fonction
 * utilitaire `getTip()` située dans la librairie du projet.
 *
 * Fonctionnement :
 * - `AstucePage` est un composant serveur (pas de "use client").
 * - `getTip()` renvoie une astuce (string), généralement choisie de manière
 *   pseudo-aléatoire parmi une liste ou générée dynamiquement.
 * - Une fois l’astuce affichée, l'utilisateur peut passer à la page de récapitulatif.
 */

import { getTip } from "@/lib";
import Link from "next/link";

/**
 * Page serveur : `/seance/astuce`
 *
 * @returns L’astuce du jour + un lien vers la suite du parcours ("recap").
 *
 * Notes :
 * - Appel serveur direct à `getTip()`.
 * - Aucune interaction ou état local : affichage purement statique basé sur les données reçues.
 */
export default async function AstucePage() {
    /**
     * Récupère l’astuce via une fonction utilitaire asynchrone.
     *
     * `getTip()` peut :
     * - lire une base de données
     * - choisir une entrée dans une liste statique
     * - générer un texte aléatoire
     *
     * Le résultat est une simple chaîne de caractères.
     */
    const tip = await getTip();

    return (
        /**
         * Conteneur principal centré verticalement.
         * - min-height ajustée pour tenir compte de la navbar
         * - disposition verticale avec espacement
         */
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-8 text-center">

            <h1 className="text-3xl text-brandText">Astuce du jour</h1>

            {/**
             * Carte affichant l’astuce :
             * - style “card” cohérent avec le reste du design
             * - bordure, ombre et arrondis
             * - texte centré et lisible
             */}
            <div className="bg-white border border-brandBorder rounded-2xl shadow-card px-6 py-10 max-w-2xl text-2xl text-brandText-soft">
                {tip}
            </div>

            {/**
             * Bouton → page de récap
             * Permet de terminer la séance après avoir pris connaissance de l’astuce.
             */}
            <Link
                href="/seance/recap"
                className="px-6 py-3 rounded-full bg-brandGreen text-white hover:opacity-90 transition"
            >
                Terminer la séance
            </Link>

            <p className="text-brandText-soft">
                Gardez cette pensée avec vous aujourd&apos;hui
            </p>
        </main>
    );
}
