export default function CookiesPolicyPage() {
    return (
        <main className="max-w-3xl mx-auto px-4 py-10 text-sm text-brandText leading-relaxed">
            <h1 className="text-2xl font-semibold mb-4 text-brandText">
                Politique de cookies
            </h1>

            <p className="mb-4 text-brandText-soft">
                Cette page décrit comment MindfulSpace utilise les cookies et
                technologies similaires sur cette application. Ce projet est réalisé
                dans un cadre académique fictif et ne collecte aucune donnée à des fins
                commerciales.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                1. Qu’est-ce qu’un cookie ?
            </h2>
            <p className="text-brandText-soft mb-4">
                Un cookie est un petit fichier texte enregistré sur votre appareil lors
                de la consultation d’un site web. Il permet à un site de reconnaître
                votre navigateur ou de mémoriser certaines informations.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                2. Types de cookies utilisés
            </h2>
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

            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                3. Votre consentement
            </h2>
            <p className="text-brandText-soft mb-4">
                Lors de votre première visite, une bannière vous permet d’accepter ou de
                refuser les cookies non essentiels. Vous pouvez modifier ce choix à tout
                moment via le lien <em>“Préférences cookies”</em> en bas de page.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                4. Données personnelles
            </h2>
            <p className="text-brandText-soft mb-4">
                MindfulSpace ne collecte, ne conserve ni ne partage aucune donnée
                personnelle. Les informations affichées dans l’application sont
                entièrement fictives et ne sont pas transmises à des tiers.
            </p>

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
