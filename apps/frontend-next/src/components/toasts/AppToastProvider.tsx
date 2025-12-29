"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type AppToastKind = "success" | "error" | "info";

export type AppToastItem = {
    id: string;
    kind: AppToastKind;
    message: string;
    autoCloseMs?: number;
};

type Ctx = {
    pushToast: (toast: Omit<AppToastItem, "id"> & { id?: string }) => void;
};

const AppToastContext = createContext<Ctx | undefined>(undefined);

export function AppToastProvider({ children }: { children: ReactNode }) {
    const [queue, setQueue] = useState<AppToastItem[]>([]);

    const pushToast = useCallback((toast: Omit<AppToastItem, "id"> & { id?: string }) => {
        const id = toast.id ?? `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setQueue((prev) => [...prev, { id, ...toast }]);
    }, []);

    const pop = useCallback(() => {
        setQueue((prev) => prev.slice(1));
    }, []);

    const active = queue[0] ?? null;

    // auto close
    useEffect(() => {
        if (!active) return;
        const delay = active.autoCloseMs ?? 1800;
        const timer = window.setTimeout(pop, delay);
        return () => window.clearTimeout(timer);
    }, [active, pop]);

    const value = useMemo(() => ({ pushToast }), [pushToast]);

    return (
        <AppToastContext.Provider value={value}>
            {children}

            {active && (
                <div
                    role="status"
                    aria-live="polite"
                    className="
            fixed top-24 left-1/2 -translate-x-1/2 z-[1000]
            rounded-2xl bg-white shadow-xl p-4 border border-slate-200
            flex items-center gap-3 animate-fade-in-up
          "
                >
          <span aria-hidden className="text-lg">
            {active.kind === "success" ? "✅" : active.kind === "error" ? "⚠️" : "ℹ️"}
          </span>

                    <span className="text-sm font-medium text-slate-800">{active.message}</span>

                    <button
                        onClick={pop}
                        className="ml-2 text-slate-400 hover:text-slate-600 transition"
                        aria-label="Close toast"
                        type="button"
                    >
                        ✕
                    </button>
                </div>
            )}
        </AppToastContext.Provider>
    );
}

export function useAppToasts(): Ctx {
    const ctx = useContext(AppToastContext);
    if (!ctx) throw new Error("useAppToasts must be used within an AppToastProvider");
    return ctx;
}
