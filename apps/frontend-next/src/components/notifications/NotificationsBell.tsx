"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionDecisionNotifications } from "@/hooks/useSubscriptionDecisionNotifications";
import { useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";

function formatLine(
    n: { requestType: "PREMIUM" | "COACH"; status: string; coachTier?: string | null },
    t: (key: string) => string,
) {
    const target =
        n.requestType === "PREMIUM"
            ? t("target.premium")
            : t("target.coach");

    const decision =
        n.status === "APPROVED"
            ? t("decision.approved")
            : n.status === "REJECTED"
                ? t("decision.rejected")
                : t("decision.updated");

    const tier =
        n.requestType === "COACH" && n.coachTier
            ? t("format.tier").replace("{tier}", n.coachTier)
            : "";

    return t("format.line")
        .replace("{target}", target)
        .replace("{tier}", tier)
        .replace("{decision}", decision);
}

export default function NotificationsBell() {
    const { user } = useAuth();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en";

    const t = useTranslations("notificationsBell");

    const { unreadCount, items, markAllRead, markOneRead } =
        useSubscriptionDecisionNotifications(!!user);

    const [open, setOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="relative rounded-lg border border-brandBorder bg-white px-3 py-2 hover:bg-brandSurface"
                aria-label={t("ariaLabel")}
            >
                <Image
                    src="/icons/bell.png"
                    alt=""
                    width={24}
                    height={24}
                    className="block"
                    priority
                />

                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[1.25rem] rounded-full bg-brandGreen text-white text-xs px-1.5 py-0.5 text-center leading-none">
            {unreadCount}
          </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-brandBorder bg-white text-slate-900 shadow-lg p-2 z-50">
                    <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-semibold text-slate-900">
              {t("title")}
            </span>

                        <button
                            className="text-xs underline text-slate-700 hover:text-slate-900"
                            onClick={markAllRead}
                            type="button"
                        >
                            {t("markAllRead")}
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-slate-600">
                            {t("empty")}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {items.map((n) => (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => markOneRead(n.id)}
                                    className="text-left rounded-lg px-3 py-2 hover:bg-brandSurface border border-transparent hover:border-brandBorder"
                                >
                                    <div className="text-sm font-medium text-slate-900">
                                        {formatLine(n, t)}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        {t("detailsInProfile")}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="px-2 pt-2 flex justify-between items-center">
                        <Link
                            className="text-sm underline text-slate-700 hover:text-slate-900"
                            href={`/${locale}/member/profile`}
                            onClick={() => setOpen(false)}
                        >
                            {t("goToProfile")}
                        </Link>

                        <button
                            className="text-sm underline text-slate-700 hover:text-slate-900"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            {t("close")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
