export async function getTip(): Promise<string> {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/tips/random`;
        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        return data.tip ?? "Prenez une grande respiration et souriez 🌿";
    } catch (e) {
        return "Prenez une grande respiration et souriez 🌿";
    }
}
