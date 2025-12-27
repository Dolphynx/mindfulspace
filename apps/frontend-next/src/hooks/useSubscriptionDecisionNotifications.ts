"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useAppToasts } from "@/components/toasts/AppToastProvider";

type DecisionNotif = {
    id: string;
    requestType: "PREMIUM" | "COACH";
    status: "APPROVED" | "REJECTED" | "CANCELLED";
    coachTier?: "STARTER" | "PROFESSIONAL" | "PREMIUM" | null;
    reviewedAt?: string | null;
};

type ApiResponse = {
    unreadCount: number;
    items: DecisionNotif[];
};

function buildToastMessage(n: DecisionNotif): { kind: "success" | "error" | "info"; message: string } {
    const target = n.requestType === "PREMIUM" ? "Premium" : "Coach";

    if (n.status === "APPROVED") {
        return { kind: "success", message: `Votre demande ${target} a été approuvée.` };
    }
    if (n.status === "REJECTED") {
        return { kind: "error", message: `Votre demande ${target} a été refusée.` };
    }
    return { kind: "info", message: `Mise à jour de votre demande ${target}.` };
}

export function useSubscriptionDecisionNotifications(enabled: boolean) {
    const { pushToast } = useAppToasts();

    const [data, setData] = useState<ApiResponse>({ unreadCount: 0, items: [] });

    const seenIdsRef = useRef<Set<string>>(new Set());
    const timerRef = useRef<number | null>(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchOnce = async () => {
        if (!baseUrl) return;

        const res = await apiFetch(`${baseUrl}/subscription-requests/notifications`, { cache: "no-store" });
        if (!res.ok) return;

        const json = (await res.json()) as ApiResponse;

        // Toast uniquement pour les nouvelles IDs
        for (const n of json.items ?? []) {
            if (!seenIdsRef.current.has(n.id)) {
                seenIdsRef.current.add(n.id);
                const toast = buildToastMessage(n);
                pushToast({ kind: toast.kind, message: toast.message, autoCloseMs: 2500 });
            }
        }

        setData({
            unreadCount: json.unreadCount ?? 0,
            items: json.items ?? [],
        });
    };

    useEffect(() => {
        if (!enabled) return;
        if (!baseUrl) return;

        // 1er fetch immédiat
        fetchOnce();

        // polling 30s
        timerRef.current = window.setInterval(fetchOnce, 30_000);

        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
            timerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, baseUrl]);

    const markAllRead = async () => {
        if (!baseUrl) return;
        await apiFetch(`${baseUrl}/subscription-requests/read-all`, { method: "PATCH" });
        setData({ unreadCount: 0, items: [] });
    };

    const markOneRead = async (id: string) => {
        if (!baseUrl) return;
        await apiFetch(`${baseUrl}/subscription-requests/${id}/read`, { method: "PATCH" });
        setData((prev) => ({
            unreadCount: Math.max(0, (prev.unreadCount ?? 0) - 1),
            items: (prev.items ?? []).filter((x) => x.id !== id),
        }));
    };

    return {
        unreadCount: data.unreadCount,
        items: data.items,
        markAllRead,
        markOneRead,
    };
}
