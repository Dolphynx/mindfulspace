"use client";

import { useEffect, useRef } from "react";
import { syncOfflineQueue } from "@/offline-sync/sync";

export function OfflineSyncListener() {
    const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    // Mutex (verrou) pour empêcher plusieurs synchronisations offline
    // de s’exécuter en parallèle.
    //
    // Pourquoi ?
    // - `online`, `visibilitychange` et le montage du composant
    //   peuvent déclencher la sync presque en même temps.
    // - Sans verrou, on peut lancer plusieurs sync concurrentes,
    //   provoquant des doublons d’appels API ou des conflits IndexedDB.
    //
    // `useRef` est utilisé car :
    // - la valeur persiste entre les renders
    // - la mise à jour ne déclenche pas de re-render React
    const isSyncingRef = useRef(false);

    useEffect(() => {
        const handler = async () => {

            // On ne synchronise que lorsque l’application est visible.
            // Sur mobile/PWA, les requêtes réseau en arrière-plan
            // sont peu fiables (throttling, suspension par l’OS).
            if (document.visibilityState !== "visible") return;

            // Si une synchronisation est déjà en cours, on ignore
            // cette nouvelle tentative (mutex).
            if (isSyncingRef.current) return;

            // On prend le verrou : à partir d’ici, aucune autre
            // synchronisation ne pourra démarrer tant que celle-ci
            // n’est pas terminée.
            isSyncingRef.current = true;

            try {
                // Synchronisation de la queue offline avec l’API
                await syncOfflineQueue(baseUrl);
            } catch (err) {
                // En cas d’erreur, on log sans casser l’application.
                // Le verrou sera quand même libéré dans le `finally`.
                console.warn("Offline sync failed:", err);
            } finally {
                // Libération du verrou :
                // - succès ou échec, on autorise les futures tentatives
                // - évite tout risque de blocage permanent (deadlock)
                isSyncingRef.current = false;
            }
        };

        // Déclenche une synchronisation immédiatement au montage du composant.
        // Indispensable pour les PWAs mobiles :
        // - l’utilisateur peut rouvrir l’app alors qu’il est déjà en ligne
        // - dans ce cas, l’événement `online` ne se déclenche pas
        // - sans cet appel, la queue offline pourrait rester bloquée indéfiniment
        handler();

        // Synchronisation lorsque la connectivité réseau revient.
        // Couvre le cas classique : offline → online sans recharger l’app.
        window.addEventListener("online", handler);

        // Synchronisation lorsque l’application revient au premier plan.
        // En PWA/mobile, l’app peut être mise en arrière-plan pendant une
        // coupure réseau, puis redevenir visible sans événement `online`.
        window.addEventListener("visibilitychange", handler);

        return () => {
            window.removeEventListener("online", handler);
            window.removeEventListener("visibilitychange", handler);
        };
    }, [baseUrl]);

    return null;
}
