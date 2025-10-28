import Image from "next/image";
import SleepChartCard from "@/components/SleepChartCard";

export default function HomePage() {
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
                                <span className="font-medium text-brandText">7 h 10</span>
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
                                <span className="font-medium text-brandText">12 min</span>
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
                                <span className="font-medium text-brandText">
                                    3 200 pas
                                </span>
                            </li>
                        </ul>
                    </div>
                </article>

                {/* Carte droite */}
                <SleepChartCard />
            </section>
        </div>
    );
}
