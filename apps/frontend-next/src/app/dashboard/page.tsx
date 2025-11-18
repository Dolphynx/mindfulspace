import PageHero from "@/components/PageHero";
import SleepChartCard from "@/components/SleepChartCard";
import Image from "next/image";
import QuickLogCard from "@/components/QuickLogCard";
import SessionChartCard from "@/components/SessionChartCard";

async function getYesterdaySummary() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${baseUrl}/sessions/summary/yesterday`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch yesterday summary");
    return res.json();
}

export default async function HomePage() {
    // Récupérer les données du backend
    const yesterdaySummary = await getYesterdaySummary();

    return (
        <div className="text-brandText flex flex-col">
            {/* HERO */}
            <PageHero
                title="Welcome back !!!"
                subtitle="Votre suivi bien-être du jour !"
            />

            {/* DASHBOARD */}
            <section
                className="
                    mx-auto
                    max-w-7xl
                    w-full
                    px-4
                    py-8
                    grid
                    gap-6
                    md:grid-cols-2
                    justify-items-center
                    ">
                {/* Carte gauche */}

                <article className="bg-white border border-brandBorder rounded-card shadow-card flex flex-col">
                    <header className="p-5 border-b border-brandBorder">
                        <h2 className="text-xl font-semibold text-brandText flex items-center gap-2">
                            <span className="text-brandGreen text-lg" aria-hidden="true">
                            🎯
                            </span>
                            <span>Wellness Tracking</span>
                        </h2>
                            <p className="text-brandText-soft text-sm">Your wellness metrics from yesterday</p>
                    </header>

                    <div className="p-5 text-sm text-brandText-soft">
                        <ul className="space-y-4">
                            {yesterdaySummary.map((item: any) => (
                                <li key={item.name} className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <span className="text-xl" aria-hidden="true">
                                            {item.name === "Sleep"
                                                ? "🛌"
                                                : item.name === "Meditation"
                                                    ? "🧘"
                                                    : "🏃"}
                                        </span>
                                        <span className="font-medium text-brandText">{item.name}</span>
                                    </span>
                                    <span className="font-medium text-brandText">
                                        {item.value !== null ? `${item.value} ${item.units?.[0] ?? ""}` : "—"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>

                <QuickLogCard/>
            </section>
            <section className="mx-auto max-w-7xl w-full px-4 py-8 grid gap-6 md:grid-cols-3">
                <SessionChartCard type="sleep" unit="Hours" />
                <SessionChartCard type="meditation" unit="Minutes" />
                <SessionChartCard type="exercise" unit="Minutes" />
            </section>
        </div>
    );
}
