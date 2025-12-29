"use client";

import { useEffect, useState } from "react";

export function useOnlineStatus() {
    /**
     * NOTE:
     * L’état initial est volontairement fixé à `true` afin de garantir
     * un rendu déterministe entre le rendu serveur (SSR) et le premier
     * rendu côté client (hydratation Next.js).
     *
     * L’état réel de la connexion (`navigator.onLine`) est ensuite
     * synchronisé côté client via les événements navigateur
     * `online` et `offline` dans le `useEffect`.
     *
     * Ce choix permet d’éviter les erreurs d’hydratation sans modifier
     * le comportement fonctionnel du hook.
     */
    /*const [online, setOnline] = useState(
        typeof navigator !== "undefined" ? navigator.onLine : true
    );*/
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);

        window.addEventListener("online", on);
        window.addEventListener("offline", off);

        return () => {
            window.removeEventListener("online", on);
            window.removeEventListener("offline", off);
        };
    }, []);

    return online;
}
