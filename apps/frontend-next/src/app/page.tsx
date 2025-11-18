/**
 * Page d’entrée (route /)
 *
 * Comportement :
 * - Cette page sert de point d’entrée unique lorsqu’un utilisateur arrive
 *   sur la racine du frontend Next.js.
 * - Elle interroge l’API Nest pour récupérer les préférences utilisateur
 *   via `getUserPrefs()`.
 * - En fonction de ces préférences :
 *     • Si `launchBreathingOnStart === true` → redirection vers /seance/respiration
 *     • Sinon → redirection vers /dashboard
 *
 * Cette logique permet d’adapter automatiquement l’expérience utilisateur
 * dès l’arrivée dans l’application.
 *
 * Notes importantes :
 * - La fonction `redirect()` de Next.js effectue une redirection **côté serveur**.
 *   → Le code après l’appel à `redirect()` ne sera jamais exécuté.
 * - La page n’affiche jamais de UI : elle sert exclusivement de route de décision.
 */

import { redirect } from "next/navigation";
import { getUserPrefs } from "@/lib";

export default async function Entry() {
    // Récupère les préférences utilisateur depuis l’API Nest
    const prefs = await getUserPrefs();

    // Redirection conditionnelle selon la préférence "lancer la respiration au démarrage"
    if (prefs.launchBreathingOnStart) {
        redirect("/seance/respiration");
    } else {
        redirect("/dashboard");
    }

    // Le code n’est jamais exécuté car redirect() interrompt immédiatement le rendu SSR
    return null;
}
