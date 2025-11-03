"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function RespirationPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<"inspirez" | "bloquez" | "expirez">("inspirez");
    const [cycle, setCycle] = useState(1);
    const totalCycles = 3;

    const sequence = useRef([
        { p: "inspirez" as const, d: 4000 },
        { p: "bloquez" as const, d: 4000 },
        { p: "expirez" as const, d: 4000 },
    ]);

    const aliveRef = useRef(true);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const goNext = () => {
        if (aliveRef.current) router.push("/seance/humeur");
    };

    // ✅ Skip → Dashboard
    const handleSkip = () => {
        if (aliveRef.current) router.push("/dashboard");
    };

    useEffect(() => {
        aliveRef.current = true;

        try {
            router.prefetch("/seance/humeur");
        } catch {}

        let i = 0;
        const run = () => {
            if (!aliveRef.current) return;
            const cur = sequence.current[i % sequence.current.length];
            setPhase(cur.p);

            const t = setTimeout(() => {
                if (!aliveRef.current) return;
                i++;
                if (i % sequence.current.length === 0) {
                    setCycle((c) => {
                        const next = c + 1;
                        if (next > totalCycles) {
                            queueMicrotask(goNext);
                            return c;
                        }
                        return next;
                    });
                }
                run();
            }, cur.d);

            timersRef.current.push(t);
        };

        run();
        return () => {
            aliveRef.current = false;
            for (const t of timersRef.current) clearTimeout(t);
            timersRef.current = [];
        };
    }, [router]);

    const colorMap = {
        inspirez: "from-emerald-400 to-green-600",
        bloquez: "from-cyan-400 to-sky-500",
        expirez: "from-amber-400 to-orange-500",
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center gap-8 relative">
            {/* 🔹 Skip → Dashboard */}
            <button
                onClick={handleSkip}
                className="absolute top-4 right-4 px-4 py-2 rounded-full bg-brandGreen/20 text-brandGreen hover:bg-brandGreen/30 transition"
            >
                Skip ⏩
            </button>

            <h1 className="text-4xl md:text-5xl text-brandText">Respiration guidée</h1>

            <div
                className={`relative w-64 h-64 rounded-full flex items-center justify-center text-3xl md:text-5xl text-white transition-all duration-[4000ms] ${
                    phase === "inspirez"
                        ? "scale-110"
                        : phase === "expirez"
                            ? "scale-90"
                            : "scale-100"
                } bg-gradient-to-br ${colorMap[phase]}`}
            >
        <span className="drop-shadow-md">
          {phase === "inspirez"
              ? "Inspirez"
              : phase === "bloquez"
                  ? "Bloquez"
                  : "Expirez"}
        </span>
            </div>

            <div className="text-brandText-soft">
                <p>Cycle {cycle} / {totalCycles}</p>
                <p>Suivez le rythme de respiration</p>
            </div>
        </main>
    );
}
