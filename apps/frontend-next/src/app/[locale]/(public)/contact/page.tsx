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
 *
 * i18n :
 * - Tous les textes visibles sont fournis par le dictionnaire `contactPage`.
 * - La locale est déterminée à partir du segment dynamique [locale].
 */

import PageHero from "@/components/PageHero";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Composant de page : `/[locale]/contact`
 *
 * @returns Le JSX représentant la page de contact.
 *
 * Notes :
 * - Le composant est une Server Component (pas de "use client", pas de hooks React).
 * - Sert de page informative non-interactive.
 * - Utilise l’i18n côté serveur (chargement du dictionnaire selon la locale).
 */
export default async function ContactPage({
                                              params,
                                          }: {
    params: Promise<{ locale: string }>;
}) {
    // Récupération asynchrone de la locale depuis les paramètres dynamiques
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    // Chargement du dictionnaire pour cette locale, namespace contactPage
    const dict = await getDictionary(locale);
    const t = dict.contactPage;

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
             *
             * Les textes proviennent ici du dictionnaire i18n (contactPage.heroTitle / heroSubtitle).
             */}
            <PageHero
                title={t.heroTitle}
                subtitle={t.heroSubtitle}
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
                 *
                 * Les textes sont extraits du dictionnaire i18n. Les coordonnées
                 * (email / adresse / téléphone) restent des données "brutes" non traduites.
                 */}
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h2 className="text-xl font-semibold text-brandText mb-2">
                        {t.teamTitle}
                    </h2>

                    <p className="text-brandText-soft text-sm leading-relaxed">
                        {t.projectDescription}
                        <strong className="block text-brandText mt-2">
                            {t.projectWarning}
                        </strong>
                    </p>

                    {/**
                     * Bloc détaillant les coordonnées :
                     * - Email
                     * - Adresse physique
                     * - Téléphone fictif
                     *
                     * Le style utilise un texte plus discret via `text-brandText-soft`.
                     * Les libellés (“Email”, “Adresse”, “Téléphone”) sont traduits.
                     */}
                    <div className="mt-4 text-sm text-brandText-soft space-y-2">
                        <p>
                            📧 {t.contactEmailLabel}{" "}
                            <span className="font-medium text-brandText">
                                contact@mindfulspace.be
                            </span>
                        </p>
                        <p>🏢 {t.contactAddressLabel} Rue de Harlez 18, 4000 Liège</p>
                        <p>📞 {t.contactPhoneLabel} +32 499 12 34 56</p>
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
                        {t.emergencyTitle}
                    </h3>
                    <p className="text-sm text-brandText-soft leading-relaxed">
                        {t.emergencyDescription}
                    </p>
                    <p className="text-xl mt-4" aria-hidden="true">
                        😄
                    </p>
                </article>

            </section>
        </div>
    );
}
