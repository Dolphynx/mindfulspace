/**
 * Page Contact
 * ------------
 * Cette page Next.js affiche les informations de contact du projet MindfulSpace.
 *
 * Elle contient :
 * - un composant `PageHero` en en-tête visuelle (titre + sous-titre)
 * - deux sections principales :
 *    1. Une section "Équipe MindfulSpace" contenant les informations de contact
 *    2. Une section "Besoin d’aide urgente ?" pour rappeler les limites du service
 *
 * Particularités :
 * - Cette page n’a aucune logique métier : elle ne fait qu’afficher du contenu statique.
 * - Les styles reposent uniquement sur TailwindCSS via les classes utilitaires.
 * - Page simple pouvant servir d’exemple de structure pour d'autres pages statiques.
 */

import PageHero from "@/components/PageHero";

/**
 * Composant de page : `/contact`
 *
 * @returns Le JSX représentant la page de contact.
 *
 * Notes :
 * - Le composant est une Server Component (pas de "use client", pas de hooks).
 * - Sert de page informative non-interactive.
 */
export default function ContactPage() {
    return (
        /**
         * Conteneur principal :
         * - `text-brandText` : couleur de texte par défaut
         * - `flex flex-col`   : la page s'affiche verticalement
         */
        <div className="text-brandText flex flex-col">

            {/**
             * HERO VISUEL
             * -----------
             * Le composant PageHero affiche :
             * - un titre
             * - un sous-titre
             * C’est un composant réutilisé sur d'autres pages du site.
             */}
            <PageHero
                title="Contact"
                subtitle="Une question concernant MindfulSpace ?"
            />

            {/**
             * SECTION PRINCIPALE DU CONTENU
             * ------------------------------
             * Contient deux *articles* présentés comme des cartes.
             *
             * Classes utiles :
             * - `mx-auto max-w-3xl` : centrage et largeur max
             * - `px-4 py-8`         : marges internes
             * - `space-y-6`         : espacement vertical entre les cartes
             */}
            <section className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">

                {/**
                 * PREMIÈRE CARTE : Informations officielles de contact
                 * -----------------------------------------------------
                 * Contient :
                 * - description courte du projet
                 * - avertissement important (pas un service médical)
                 * - email, adresse et téléphone
                 */}
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h2 className="text-xl font-semibold text-brandText mb-2">
                        Équipe MindfulSpace
                    </h2>

                    <p className="text-brandText-soft text-sm leading-relaxed">
                        MindfulSpace est un projet académique fictif développé
                        dans le cadre d&apos;un cursus en développement
                        d&apos;application.
                        <strong className="block text-brandText mt-2">
                            Aucune information fournie via cette plateforme
                            n&apos;est lue, traitée ni suivie par un
                            professionnel de santé.
                        </strong>
                    </p>

                    {/**
                     * Bloc détaillant les coordonnées :
                     * - Email
                     * - Adresse physique
                     * - Téléphone fictif
                     *
                     * Le style utilise un texte plus discret via `text-brandText-soft`.
                     */}
                    <div className="mt-4 text-sm text-brandText-soft space-y-2">
                        <p>
                            📧 Email :{" "}
                            <span className="font-medium text-brandText">
                                contact@mindfulspace.be
                            </span>
                        </p>
                        <p>🏢 Adresse : Rue de Harlez 18, 4000 Liège</p>
                        <p>📞 Téléphone : +32 499 12 34 56</p>
                    </div>
                </article>

                {/**
                 * DEUXIÈME CARTE : Message pour les urgences
                 * -------------------------------------------
                 * Cette section rappelle que l'application n'est pas destinée
                 * à la gestion de crises ou situations médicales.
                 *
                 * Le petit emoji final est décoratif, avec `aria-hidden`
                 * pour éviter d'interférer avec les lecteurs d’écran.
                 */}
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h3 className="text-lg font-semibold text-brandText mb-2">
                        Besoin d&apos;aide urgente ?
                    </h3>
                    <p className="text-sm text-brandText-soft leading-relaxed">
                        Cette application n&apos;est pas un service médical. En
                        cas de détresse émotionnelle ou de crise, contacte
                        immédiatement un service d&apos;urgence ou une ligne
                        d&apos;écoute professionnelle.
                    </p>
                    <p className="text-xl mt-4" aria-hidden="true">
                        😄
                    </p>
                </article>

            </section>
        </div>
    );
}
