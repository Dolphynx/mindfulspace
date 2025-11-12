import Image from "next/image";
import SleepChartCard from "@/components/SleepChartCard";
import QuickLogCard from "@/components/QuickLogCard";

// Le type des objets renvoyés par l'API Nest (/test-data)
type ChartPoint = {
    label: string; // ex: "Lun"
    value: number; // ex: 12
};

// fetch côté serveur (Server Component)
// Pas de cache pour voir les updates en dev
async function getChartData(): Promise<ChartPoint[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Sécurité soft au cas où la var d'env manque
    if (!baseUrl) {
        console.error("NEXT_PUBLIC_API_URL manquant dans le front");
        return [];
    }

    const res = await fetch(
        `${baseUrl}/test-data?metricName=daily_meditation_minutes`,
        {
            // important en dev pour éviter que Next mette ça en cache
            cache: "no-store",
        }
    );

    if (!res.ok) {
        console.error("Erreur API test-data:", res.status, res.statusText);
        return [];
    }

    return res.json();
}

export default async function HomePage() {
    // Récupérer les données du backend
    const chartData = await getChartData();

    return (
        <div className="text-brandText flex flex-col">
            {/* HERO */}
            <section className="w-full border-b border-brandBorder bg-white">
                <div className="relative w-full h-[220px] overflow-hidden">
                    <Image
                        src="/images/wellness-hero3.jpg"
                        alt="Calm lake at sunrise"
                        width={1600}
                        height={600}
                        className="w-full h-full object-cover object-center"
                        priority
                    />

                    {/* garde ton voile doux */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10 pointer-events-none" />

                    {/* texte du hero en blanc */}
                    <div className="absolute inset-0 flex flex-col justify-center px-4 mx-auto max-w-7xl">
                        <h1 className="text-2xl font-semibold text-white">
                            Welcome back !
                        </h1>
                        <p className="text-white text-sm mt-1">
                            Votre suivi bien-être du jour !
                        </p>
                    </div>
                </div>
            </section>

            {/* DASHBOARD */}
            <section className="mx-auto max-w-7xl w-full px-4 py-8 grid gap-6 md:grid-cols-2">
                {/* Carte gauche */}
                <article className="bg-white border border-brandBorder rounded-card shadow-card flex flex-col">
                    <header className="p-5 border-b border-brandBorder">
                        <h2 className="text-xl font-semibold text-brandText flex items-center gap-2">
                            <span className="text-brandGreen text-lg" aria-hidden="true">
                                🎯
                            </span>
                            <span>Suivi bien-être</span>
                        </h2>
                        <p className="text-brandText-soft text-sm">
                            Ton résumé des habitudes et métriques
                        </p>
                    </header>

                    <div className="p-5 text-sm text-brandText-soft">
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="text-xl" aria-hidden="true">
                                        🛌
                                    </span>
                                    <span>
                                        <span className="font-medium text-brandText">
                                            Sommeil
                                        </span>{" "}
                                        <span className="text-brandText-soft">(hier)</span>
                                    </span>
                                </span>
                                {/* Remplacer par la donnée réelle du sommeil */}
                                <span className="font-medium text-brandText">
                                    {chartData.find((data) => data.label === "Sommeil")?.value || "8"} h
                                </span>
                            </li>

                            <li className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="text-xl" aria-hidden="true">
                                        🧘
                                    </span>
                                    <span className="font-medium text-brandText">
                                        Méditation
                                    </span>
                                </span>
                                {/* Remplacer par la donnée réelle de la méditation */}
                                <span className="font-medium text-brandText">
                                    {chartData.find((data) => data.label === "Méditation")?.value || "45"} min
                                </span>
                            </li>

                            <li className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="text-xl" aria-hidden="true">
                                        🏃
                                    </span>
                                    <span className="font-medium text-brandText">
                                        Activité physique
                                    </span>
                                </span>
                                {/* Remplacer par la donnée réelle de l'activité physique */}
                                <span className="font-medium text-brandText">
                                    {chartData.find((data) => data.label === "Activité")?.value || "10.000"} pas
                                </span>
                            </li>
                        </ul>
                    </div>
                </article>

                {/* Carte droite */}
                <QuickLogCard />
                <SleepChartCard chartData={chartData} />

            </section>
        </div>
    );
}
