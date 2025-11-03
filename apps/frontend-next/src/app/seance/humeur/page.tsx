"use client";
import { useState } from "react";
import MoodPicker from "@/components/MoodPicker";
import { MoodValue, moodToPercent } from "@/lib/mood";
import { useRouter } from "next/navigation";

export default function HumeurPage() {
    const [value, setValue] = useState<MoodValue | null>(null);
    const router = useRouter();

    const next = () => {
        if (!value) return;
        localStorage.setItem("moodScore", String(value));
        localStorage.setItem("moodPercent", String(moodToPercent(value)));
        router.push("/seance/astuce");
    };

    return (
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center gap-8 text-center justify-center">
            <h1 className="text-4xl">Comment vous sentez-vous ?</h1>
            <p className="text-lg text-brandText-soft">Prenez un moment pour reconnaître vos émotions</p>

            <MoodPicker value={value} onChangeAction={(v) => setValue(v)} />

            <button
                onClick={next}
                disabled={!value}
                className="px-6 py-3 rounded-full bg-brandGreen text-white disabled:opacity-50"
            >
                Continuer
            </button>
            <p className="text-brandText-soft">Il n&#39;y a pas de bonne ou mauvaise réponse</p>
        </main>
    );
}
