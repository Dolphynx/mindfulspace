"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RecapPage() {
    const router = useRouter();
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        const s = Number(localStorage.getItem("moodScore") || "0");
        setScore(isNaN(s) ? null : s * 20);
    }, []);

    return (
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-8 text-center">
            <h1 className="text-4xl text-brandText">Séance terminée</h1>

            <div className="relative w-48 h-48 rounded-full border-8 border-brandGreen/40 flex items-center justify-center">
                <span className="text-4xl text-brandText">{score ?? 60}</span>
            </div>

            <p className="text-brandText-soft">Vous progressez sur le chemin de la paix 🌸</p>

            <div className="flex gap-3 flex-wrap justify-center">
                {/* 🔹 Supprimé : “Retour à l’accueil” */}
                <Link href="/dashboard" className="px-5 py-2 rounded-full bg-brandGreen text-white">
                    Mon suivi
                </Link>
                <button
                    onClick={() => router.push("/seance/respiration")}
                    className="px-5 py-2 rounded-full bg-brandGreen/20 text-brandGreen"
                >
                    Refaire une séance
                </button>
            </div>

            <p className="text-brandText-soft">Revenez demain pour continuer votre pratique</p>
        </main>
    );
}
