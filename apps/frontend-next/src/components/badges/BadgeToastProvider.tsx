"use client";

import {
    createContext,
    useState,
    useCallback,
    useContext,
    ReactNode,
} from "react";
import type { BadgeToastItem } from "@/types/badges";
import { BadgeToast } from "./BadgeToast";

interface BadgeToastContextValue {
    pushBadges: (badges: BadgeToastItem[]) => void;
}

const BadgeToastContext = createContext<BadgeToastContextValue | undefined>(
    undefined,
);

export function BadgeToastProvider({ children }: { children: ReactNode }) {
    const [queue, setQueue] = useState<BadgeToastItem[]>([]);

    const pushBadges = useCallback((badges: BadgeToastItem[]) => {
        if (!badges || badges.length === 0) return;
        setQueue((prev) => [...prev, ...badges]);
    }, []);

    const pop = useCallback(() => {
        setQueue((prev) => prev.slice(1));
    }, []);

    return (
        <BadgeToastContext.Provider value={{ pushBadges }}>
            {children}
            {queue.length > 0 && (
                <BadgeToast badge={queue[0]} onClose={pop} />
            )}
        </BadgeToastContext.Provider>
    );
}

export function useBadgeToasts(): BadgeToastContextValue {
    const ctx = useContext(BadgeToastContext);
    if (!ctx) {
        throw new Error(
            "useBadgeToasts must be used within a BadgeToastProvider",
        );
    }
    return ctx;
}
