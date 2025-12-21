"use client";

import { useEffect } from "react";
import { syncOfflineQueue } from "@/offline-sync/sync";

export function OfflineSyncListener() {
    const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    useEffect(() => {
        const handler = () => syncOfflineQueue();
        window.addEventListener("online", handler);
        return () => window.removeEventListener("online", handler);
    }, [baseUrl]);

    return null;
}