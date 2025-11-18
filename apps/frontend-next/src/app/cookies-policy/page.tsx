/**
 * Page Politique de cookies
 * -------------------------
 * Cette page statique décrit la gestion des cookies au sein du projet MindfulSpace.
 *
 * Objectifs :
 * - Informer l’utilisateur sur les cookies utilisés (essentiels, analytiques, personnalisation)
 * - Expliquer le fonctionnement du consentement dans l’application
 * - Rappeler que le projet ne collecte aucune donnée réelle (cadre académique)
 *
 * Particularités :
 * - Page 100% statique : pas de logique métier ni d’interaction.
 * - Rédigée pour accompagner la bannière de consentement présente dans le frontend.
 * - Utilise exclusivement des classes TailwindCSS pour la mise en forme.
 */

/**
 * Composant de page : `/cookies-policy`
 *
 * @returns Le contenu statique décrivant la politique de cookies de MindfulSpace.
 *
 * Notes :
 * - Cette page est une Server Component (pas de "use client").
 * - Elle sert de référence pour le lien “Préférences cookies” dans le footer.
 */
export default function CookiesPolicyPage() {
    return (
        /**
         * Conteneur principal :
         * - `max-w-3xl mx-auto` : largeur limitée et centrage
         * - `px-4 py-10` : marges internes confortables
         * - `text-sm leading-relaxed` : lisibilité optimale pour du texte juridique
         */
        <main className="max-w-3xl mx-auto px-4 py-10 text-sm text-brandText leading-relaxed">

            {/** -----------------------------------------------------------------
             * TITRE PRINCIPAL
             * Sert d’en-tête à la page.
             * ------------------------------------------------------------------ */}
            <h1 className="text-2xl font-semibold mb-4 text-brandText">
                Politique de cookies
            </h1>

            {/**
             * Introduction générale
             * ----------------------
             * Explique le cadre académique du projet et l’absence de collecte
             * commerciale ou réelle de données.
             */}
            <p className="mb-4 text-brandText-soft">
                Cette page décrit comment MindfulSpace utilise les cookies et
                technologies similaires sur cette application. Ce projet est réalisé
                dans un cadre académique fictif et ne collecte aucune donnée à des fins
                commerciales.
            </p>

            {/** SECTION 1 : Définition -------------------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                1. Qu’est-ce qu’un cookie ?
            </h2>
            <p className="text-brandText-soft mb-4">
                Un cookie est un petit fichier texte enregistré sur votre appareil lors
                de la consultation d’un site web. Il permet à un site de reconnaître
                votre navigateur ou de mémoriser certaines informations.
            </p>

            {/** SECTION 2 : Types de cookies ------------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                2. Types de cookies utilisés
            </h2>

            {/**
             * Liste des cookies potentiellement utilisés dans le cadre du projet.
             *
             * Remarque :
             * - Les cookies analytiques ou de personnalisation sont désactivés par défaut.
             * - Cette liste correspond à la logique implémentée dans la bannière et les préférences.
             */}
            <ul className="list-disc pl-6 space-y-2 text-brandText-soft mb-4">
                <li>
                    <strong className="text-brandText">Essentiels :</strong> nécessaires
                    au bon fonctionnement du site (ex. mémorisation du consentement).
                </li>
                <li>
                    <strong className="text-brandText">Analytiques :</strong> permettent
                    d’améliorer l’expérience utilisateur via des statistiques anonymisées.
                    Ces cookies sont désactivés par défaut.
                </li>
                <li>
                    <strong className="text-brandText">Personnalisation :</strong> visent
                    à adapter le contenu ou les recommandations. Également désactivés par
                    défaut.
                </li>
            </ul>

            {/** SECTION 3 : Consentement ------------------------------------------------ */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                3. Votre consentement
            </h2>
            <p className="text-brandText-soft mb-4">
                Lors de votre première visite, une bannière vous permet d’accepter ou de
                refuser les cookies non essentiels. Vous pouvez modifier ce choix à tout
                moment via le lien <em>“Préférences cookies”</em> en bas de page.
            </p>

            {/** SECTION 4 : Données personnelles --------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                4. Données personnelles
            </h2>
            <p className="text-brandText-soft mb-4">
                MindfulSpace ne collecte, ne conserve ni ne partage aucune donnée
                personnelle. Les informations affichées dans l’application sont
                entièrement fictives et ne sont pas transmises à des tiers.
            </p>

            {/** SECTION 5 : Contact ----------------------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                5. Contact
            </h2>
            <p className="text-brandText-soft">
                Pour toute question concernant cette politique, vous pouvez nous écrire
                à : <strong className="text-brandText">contact@mindfulspace.be</strong>
            </p>
        </main>
    );
}
