import { getTip } from "@/lib";
import Link from "next/link";

export default async function AstucePage() {
    const tip = await getTip();

    return (
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-8 text-center">
            <h1 className="text-3xl text-brandText">Astuce du jour</h1>

            <div className="bg-white border border-brandBorder rounded-2xl shadow-card px-6 py-10 max-w-2xl text-2xl text-brandText-soft">
                {tip}
            </div>

            <Link
                href="/seance/recap"
                className="px-6 py-3 rounded-full bg-brandGreen text-white hover:opacity-90 transition"
            >
                Terminer la séance
            </Link>

            <p className="text-brandText-soft">
                Gardez cette pensée avec vous aujourd&apos;hui
            </p>
        </main>
    );
}
