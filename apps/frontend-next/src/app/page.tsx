import { redirect } from "next/navigation";
import { getUserPrefs } from "@/lib";

export default async function Entry() {
    const prefs = await getUserPrefs();

    if (prefs.launchBreathingOnStart) {
        redirect("/seance/respiration");
    } else {
        redirect("/dashboard");
    }

    // never reached – redirect fait la navigation côté serveur
    return null;
}
