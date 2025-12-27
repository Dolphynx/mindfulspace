"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionDecisionNotifications } from "@/hooks/useSubscriptionDecisionNotifications";
import {useState} from "react";

function formatLine(n: { requestType: "PREMIUM" | "COACH"; status: string; coachTier?: string | null }) {
    const target = n.requestType === "PREMIUM" ? "Premium" : "Coach";
    const decision = n.status === "APPROVED" ? "approuvé" : n.status === "REJECTED" ? "refusé" : "mis à jour";
    const tier = n.requestType === "COACH" && n.coachTier ? ` (${n.coachTier})` : "";
    return `${target}${tier} : ${decision}`;
}

export default function NotificationsBell() {
    const { user } = useAuth();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en";

    const { unreadCount, items, markAllRead, markOneRead } = useSubscriptionDecisionNotifications(!!user);

    const [open, setOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="relative rounded-lg border border-brandBorder bg-white px-3 py-2 text-sm hover:bg-brandSurface"
                aria-label="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 rounded-full bg-brandGreen text-white text-xs px-2 py-0.5">
            {unreadCount}
          </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-brandBorder bg-white shadow-lg p-2 z-50">
                    <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-sm font-semibold">Notifications</span>
                        <button className="text-xs underline" onClick={markAllRead} type="button">
                            Tout marquer comme lu
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-brandText-soft">Aucune notification.</div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {items.map((n) => (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => markOneRead(n.id)}
                                    className="text-left rounded-lg px-3 py-2 hover:bg-brandSurface border border-transparent hover:border-brandBorder"
                                >
                                    <div className="text-sm font-medium">{formatLine(n)}</div>
                                    <div className="text-xs text-brandText-soft">Détails dans votre profil</div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="px-2 pt-2 flex justify-between items-center">
                        <Link className="text-sm underline" href={`/${locale}/member/profile`} onClick={() => setOpen(false)}>
                            Aller au profil
                        </Link>
                        <button className="text-sm underline" type="button" onClick={() => setOpen(false)}>
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
