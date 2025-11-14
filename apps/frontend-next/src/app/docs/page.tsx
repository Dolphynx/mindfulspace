import Link from "next/link";

export const metadata = {
    title: "Documentation développeur | MindfulSpace",
};

export default function DocsPage() {
    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 text-brandText">
            {/* Titre principal */}
            <header className="space-y-2">
                <p className="text-sm uppercase tracking-wide text-gray-500">
                    MindfulSpace · Docs internes
                </p>
                <h1 className="text-3xl font-semibold">
                    Documentation développeur
                </h1>
                <p className="text-sm text-gray-600">
                    Ce document résume comment le front Next parle à l’API Nest,
                    où trouver la documentation API (Swagger) et comment générer
                    la documentation de code du front.
                </p>
            </header>

            {/* Section API / Swagger */}
            <section className="rounded-xl border border-brandBorder bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-xl font-semibold">
                    1. Documentation API (Swagger – NestJS)
                </h2>

                <p className="mb-3 text-sm text-gray-700">
                    L’API backend est développée avec NestJS. La documentation
                    est générée automatiquement avec Swagger / OpenAPI.
                </p>

                <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
                    <li>
                        En local, démarre l’API :
                        <pre className="mt-1 rounded bg-gray-900 px-3 py-2 text-xs text-gray-100">
                            <code>pnpm dev:api</code>
                        </pre>
                    </li>
                    <li className="pt-2">
                        Ouvre Swagger :
                        <div className="mt-1 rounded bg-gray-50 px-3 py-2 text-xs">
                            <code>http://localhost:3001/api/docs</code>
                        </div>
                    </li>
                    <li className="pt-2">
                        Sur les environnements distants (staging / prod),
                        Swagger est exposé sous le même chemin&nbsp;:
                        <span className="ml-1 rounded bg-gray-50 px-2 py-1 text-xs">
                            /api/docs
                        </span>
                    </li>
                </ul>

                <p className="text-sm text-gray-700">
                    Chaque contrôleur Nest est tagué avec{" "}
                    <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                        @ApiTags
                    </code>{" "}
                    et les DTOs utilisent{" "}
                    <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                        @ApiProperty
                    </code>{" "}
                    pour décrire les champs. Cela permet d’avoir des schémas
                    propres et des exemples dans l’UI Swagger.
                </p>
            </section>

            {/* Section Front & API */}
            <section className="rounded-xl border border-brandBorder bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-xl font-semibold">
                    2. Comment le front Next parle à l’API
                </h2>

                <p className="mb-3 text-sm text-gray-700">
                    Le front utilise une variable d’environnement publique pour
                    connaître l’URL de base de l’API&nbsp;:
                </p>

                <pre className="mb-3 rounded bg-gray-900 px-3 py-2 text-xs text-gray-100">
                    <code>NEXT_PUBLIC_API_URL=https://api.mindfulspace.example</code>
                </pre>

                <p className="mb-3 text-sm text-gray-700">
                    Exemple tiré de la page Dashboard&nbsp;:
                </p>

                <pre className="overflow-x-auto rounded bg-gray-900 px-3 py-2 text-xs text-gray-100">
                    <code>{`async function getChartData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    console.warn("NEXT_PUBLIC_API_URL manquante");
    return [];
  }

  const res = await fetch(\`\${baseUrl}/test-data/sleep-chart\`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Erreur API:", res.status);
    return [];
  }

  return res.json();
}`}</code>
                </pre>

                <p className="mt-3 text-sm text-gray-700">
                    Les autres écrans (séance, préférences, astuces…) suivent la
                    même logique&nbsp;: appels HTTP vers les endpoints décrits
                    dans Swagger (ex&nbsp;: <code>/prefs</code>,{" "}
                    <code>/tips/random</code>, etc.).
                </p>
            </section>

            {/* Section Docs de code (TypeDoc) */}
            <section className="rounded-xl border border-brandBorder bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-xl font-semibold">
                    3. Documentation du code front (TypeDoc)
                </h2>

                <p className="mb-3 text-sm text-gray-700">
                    On peut générer une documentation technique des composants,
                    hooks et fonctions TypeScript du front avec{" "}
                    <span className="font-mono">TypeDoc</span>.
                </p>

                <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                    <li>
                        Installer TypeDoc à la racine du monorepo{" "}
                        <span className="block">
                            <pre className="mt-1 rounded bg-gray-900 px-3 py-2 text-xs text-gray-100">
                                <code>pnpm add -D typedoc</code>
                            </pre>
                        </span>
                    </li>
                    <li>
                        Utiliser le fichier de configuration{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            typedoc.frontend.json
                        </code>{" "}
                        (voir plus bas).
                    </li>
                    <li>
                        Générer la doc :
                        <pre className="mt-1 rounded bg-gray-900 px-3 py-2 text-xs text-gray-100">
                            <code>pnpm docs:front</code>
                        </pre>
                        La doc HTML sera produite dans{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            /docs/frontend
                        </code>
                        .
                    </li>
                </ol>

                <p className="mb-2 text-sm text-gray-700">
                    TypeDoc lit les commentaires TSDoc dans le code. Exemple sur
                    un composant&nbsp;:
                </p>

                <pre className="overflow-x-auto rounded bg-gray-900 px-3 py-2 text-xs text-gray-100">
                    <code>{`/**
 * Affiche le sélecteur d’humeur pour la séance du jour.
 *
 * @param currentMood Humeur sélectionnée actuellement.
 * @param onChange Callback appelé quand l’utilisateur change d’humeur.
 */
export function MoodPicker(props: {
  currentMood: "bad" | "neutral" | "good";
  onChange: (mood: "bad" | "neutral" | "good") => void;
}) {
  // ...
}`}</code>
                </pre>

                <p className="mt-3 text-sm text-gray-700">
                    Plus les commentaires sont complets, plus la doc générée
                    sera lisible pour les autres devs.
                </p>
            </section>

            {/* Section liens / ressources */}
            <section className="rounded-xl border border-brandBorder bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-xl font-semibold">
                    4. Où trouver quoi ?
                </h2>

                <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                    <li>
                        <span className="font-semibold">CI/CD &amp; Git :</span>{" "}
                        voir les documents dans{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            /docs
                        </code>{" "}
                        du repo (Git workflow, déploiement, etc.).
                    </li>
                    <li>
                        <span className="font-semibold">API Nest :</span>{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            apps/api-nest/src
                        </code>{" "}
                        et Swagger sur{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            /api/docs
                        </code>
                        .
                    </li>
                    <li>
                        <span className="font-semibold">Front Next :</span>{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            apps/frontend-next/src
                        </code>
                        . Routes App Router sous{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            src/app
                        </code>
                        , composants dans{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            src/components
                        </code>
                        .
                    </li>
                    <li>
                        <span className="font-semibold">
                            Documentation de code front :
                        </span>{" "}
                        générée par TypeDoc dans{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            /docs/frontend
                        </code>{" "}
                        après{" "}
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                            pnpm docs:front
                        </code>
                        .
                    </li>
                </ul>

                <p className="mt-4 text-xs text-gray-500">
                    Cette page est purement interne, destinée à l’équipe
                    MindfulSpace. N’hésite pas à la mettre à jour quand tu
                    modifies l’architecture.
                </p>
            </section>
        </main>
    );
}
