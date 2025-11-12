'use client';

import Image from "next/image";
import {useState, useEffect} from "react";
import {openDB} from "idb";

type SleepData = {
    date: string;
    steps: number;
    hours: number;
};
export default function Home() {
    const [form, setForm] = useState({date: "", steps: "", hours: ""});
    const [status, setStatus] = useState("");
    const [data, setData] = useState<any[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        initDB();
        if (navigator.onLine) syncData(); // try immediately

        const goOnline = () => {
            setIsOnline(true);
            syncData();
            loadData(); // reload all data from network
        };

        const goOffline = async () => {
            setIsOnline(false);
            const cached = await getCachedHistory();
            setData(cached); // only show stored history
        };

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);

        loadData(); // initial load

        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);


    async function loadData() {
        if (navigator.onLine) {
            try {
                const res = await fetch("http://localhost:3001/sleep");
                const allData = await res.json(); // Sort by date descending and keep last 3 days
                const last3Days = allData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
                await saveHistoryData(last3Days);
                setData(allData);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                const cached = await getCachedHistory();
                setData(cached);
            }
        } else {
            const cached = await getCachedHistory();
            setData(cached);
        }
    }

    async function initDB() {
        console.log("initDb")
        await openDB("offline-db", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("pending")) {
                    db.createObjectStore("pending", {keyPath: "id", autoIncrement: true});
                }
                if (!db.objectStoreNames.contains("history")) {
                    db.createObjectStore("history", {keyPath: "date"}); // date = unique per day
                }
            },
        });
    }

    async function saveToIndexedDB(data: SleepData) {
        const db = await openDB("offline-db", 1);
        const tx = db.transaction("pending", "readwrite");
        await tx.store.add(data);
        await tx.done;
    }

    async function syncData() {
        const db = await openDB("offline-db", 1);
        const all = await db.getAll("pending");
        console.log("🗃 Pending items:", all);
        for (const item of all) {
            try {
                await fetch("http://localhost:3001/sleep", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(item),
                });
                await db.delete("pending", item.id);
                console.log("✅ Synced item:", item);
            } catch (err) {
                console.error("Sync failed", err);
            }
        }
        if (all.length > 0) setStatus("✅ Données synchronisées !");
    }

    async function saveHistoryData(data: any[]) {
        const db = await openDB("offline-db", 1);
        const tx = db.transaction("history", "readwrite");
        for (const record of data) {
            await tx.store.put(record);
        }
        await tx.done;
    }

    async function getCachedHistory() {
        const db = await openDB("offline-db", 1);
        return await db.getAll("history");
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = {date: form.date, steps: Number(form.steps), hours: Number(form.hours),};
        if (navigator.onLine) {
            await fetch("http://localhost:3001/sleep", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            });
            setStatus("✅ Données envoyées en ligne !");
        } else {
            await saveToIndexedDB(data);
            setStatus("💾 Données enregistrées hors-ligne");
        }
        setForm({date: "", steps: "", hours: ""});
    }

    return (<main
        className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-emerald-50 via-white to-rose-50 text-slate-800"> {/* HERO HEADER */}
        <header className="relative w-full h-[400px]"><Image src="/hill-5324149_1280.jpg"
                                                             alt="Paysage apaisant MindfulSpace" fill priority
                                                             className="object-cover object-center"/>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-white/0"/>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"><h1
                className="text-4xl sm:text-5xl font-semibold tracking-tight text-emerald-900 drop-shadow-[0_2px_6px_rgba(255,255,255,0.9)]"> MindfulSpace </h1>
                <p className="mt-3 text-base sm:text-lg font-medium text-emerald-800 drop-shadow-[0_2px_6px_rgba(255,255,255,0.9)]"> Respirez,
                    votre espace de sérénité est en ligne 🌿 </p></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white/90"/>
        </header>
        {/* CONTENU */}
        <section
            className="max-w-3xl w-full mx-auto mt-10 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_30px_120px_-20px_rgba(0,0,0,0.25)] p-8 sm:p-12 border border-emerald-100/60 text-center">
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed mb-8"> Cette page a été{" "} <span
                className="text-emerald-600 font-semibold">déployée automatiquement [EN STAGING]</span>{" "} grâce à
                notre pipeline{" "} <span className="text-sky-600 font-semibold">CI/CD GitLab</span> 🚀 <br/> Prenez une
                grande inspiration,{" "} <span className="italic text-slate-600">le déploiement est zen.</span></p>
            <div className="w-full rounded-xl bg-emerald-50/70 border border-emerald-100 text-left p-5 shadow-inner"><p
                className="text-sm font-medium text-emerald-800 tracking-wide uppercase"> Pause respiration (10s) </p><p
                className="text-slate-700 text-base leading-relaxed mt-2"> Inspire 4 secondes…<br/> Garde l’air 2
                secondes…<br/> Expire doucement 4 secondes…<br/> Tu es exactement où tu dois être 🌿 </p></div>
            {/* --- NEW OFFLINE FORM --- */}
            <div className="mt-10 p-6 rounded-xl bg-rose-50/60 border border-rose-100 shadow-inner text-left"><h2
                className="text-xl font-semibold text-rose-700 mb-4"> Suivi bien-être (hors-ligne possible) </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto"><input type="date"
                                                                                                      value={form.date}
                                                                                                      onChange={(e) => setForm({
                                                                                                          ...form,
                                                                                                          date: e.target.value
                                                                                                      })} required
                                                                                                      className="p-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"/>
                    <input type="number" placeholder="Nombre de pas" value={form.steps}
                           onChange={(e) => setForm({...form, steps: e.target.value})} required
                           className="p-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"/>
                    <input type="number" placeholder="Heures de sommeil" value={form.hours}
                           onChange={(e) => setForm({...form, hours: e.target.value})} required
                           className="p-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"/>
                    <button type="submit"
                            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all"> Enregistrer
                    </button>
                </form>
                {status && (<p className="mt-4 text-sm text-emerald-700 font-medium text-center">{status}</p>)} </div>
            {/* --- END FORM --- */}
            <div className="mt-8 text-left"><h3 className="text-lg font-semibold text-emerald-700 mb-2"> Historique du
                sommeil & des pas </h3>
                <ul className="space-y-2"> {data.map((item) => (<li key={item.date}
                                                                    className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex justify-between">
                    <span>{item.date}</span> <span>{item.steps} pas, {item.hours} h sommeil</span></li>))} </ul>
                {!isOnline && (
                    <p className="text-sm text-rose-600 mt-3"> 🌿 Mode hors ligne : affichage des 3 derniers jours
                        enregistrés. </p>)} </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"><a href="/" target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md transition-all hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-emerald-300"> Voir
                le pipeline </a> <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer"
                                    className="px-6 py-3 rounded-full border border-emerald-300/80 text-emerald-700 hover:bg-emerald-100/60 font-semibold shadow-sm transition-all hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-emerald-200"> Powered
                by Next.js ⚡ </a></div>
            <footer className="mt-8 text-sm text-slate-500"><p> Made with ❤️ et sérénité par{" "} <span
                className="text-emerald-600 font-medium">l’équipe MindfulSpace</span></p></footer>
        </section>
        <p className="mt-10 mb-6 text-xs text-slate-400 text-center"> prod = calme • staging = expérimental • respire
            avant de push 🙏 </p></main>);
}