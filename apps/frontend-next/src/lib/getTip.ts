export async function getTip(): Promise<string> {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/tips/random`;
        console.log("🌐 Fetch tip from:", url);
        const res = await fetch(url, { cache: "no-store" });
        console.log("Status:", res.status);

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        console.log("Réponse API:", data);

        return data.tip ?? "Prenez une grande respiration et souriez 🌿";
    } catch (e) {
        console.error("Erreur chargement tip:", e);
        return "Prenez une grande respiration et souriez 🌿";
    }
}
