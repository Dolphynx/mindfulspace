/**
 * Point d’entrée centralisé (barrel file) pour les utilitaires du dossier `lib/`.
 *
 * Ce fichier ré-exporte l’ensemble des modules publics de la librairie interne,
 * permettant ainsi d’importer facilement les helpers n’importe où dans l’app :
 *
 *    import { getTip, getUserPrefs, MOOD_OPTIONS } from "@/lib";
 *
 * Avantages :
 * - Simplifie les imports (un seul chemin).
 * - Masque l’organisation interne du dossier `lib/`.
 * - Facilite la maintenance lorsque des fichiers sont ajoutés ou renommés.
 *
 * Important :
 * - Ne ré-exporter ici que ce qui constitue véritablement l’API publique du dossier.
 * - Ajouter un export ici lorsque de nouveaux modules internes doivent être exposés.
 */

export * from "./getTip";
export * from "./userPrefs";
export * from "./mood";
export * from "./cookieConsent";
