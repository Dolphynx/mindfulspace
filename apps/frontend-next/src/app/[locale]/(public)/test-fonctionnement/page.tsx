// === TEST DE FONCTIONNEMENT ===
// Page accessible sur /test-fonctionnement
// Elle interroge NEXT_PUBLIC_API_URL/health et affiche la réponse.

export const revalidate = 0; // pour le test => pas de cache

type HealthResponse = { status: string };

async function fetchHealth(): Promise<{ ok: boolean; data?: HealthResponse; error?: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) return { ok: false, error: 'NEXT_PUBLIC_API_URL manquant (voir .env.local)' };

    try {
        const res = await fetch(`${baseUrl}/health`, { cache: 'no-store' });
        if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
        const data = (await res.json()) as HealthResponse;
        return { ok: true, data };
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return { ok: false, error: message ?? 'Erreur inconnue' };
    }
}

export default async function TestFonctionnementPage() {
    const result = await fetchHealth();

    return (
        <main className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-lg w-full rounded-2xl shadow p-6 border">
                <h1 className="text-2xl font-bold mb-4">Test de fonctionnement : Front ↔ API</h1>

                <div className="text-sm mb-4">
                    <div>
                        <span className="font-semibold">API cible :</span>{' '}
                        {process.env.NEXT_PUBLIC_API_URL ?? '(non défini)'}
                    </div>
                    <div>
                        <span className="font-semibold">Endpoint testé :</span> <code>/health</code>
                    </div>
                </div>

                {result.ok ? (
                    <div className="rounded-md border bg-green-50 p-4">
                        <p className="font-medium">OK</p>
                        <pre className="text-xs mt-2">{JSON.stringify(result.data, null, 2)}</pre>
                    </div>
                ) : (
                    <div className="rounded-md border bg-red-50 p-4">
                        <p className="font-medium">Échec</p>
                        <p className="text-sm mt-1">Détail : {result.error}</p>
                        <ul className="text-xs mt-2 list-disc pl-4">
                            <li>Vérifie que l’API tourne sur le bon port (3001 par défaut).</li>
                            <li>
                                Vérifie <code>frontend/.env.local</code> (clé <code>NEXT_PUBLIC_API_URL</code>).
                            </li>
                            <li>
                                Vérifie que le CORS est bien activé dans l’API (voir <code>api/src/main.ts</code>).
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </main>
    );
}
