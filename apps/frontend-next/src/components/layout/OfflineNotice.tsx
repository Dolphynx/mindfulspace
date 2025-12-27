"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineNotice() {
    const t = useTranslations("offlineNotice");
    const online = useOnlineStatus();

    if (online) return null;

    return (
        <div className="sticky top-0 z-[9000] w-full bg-slate-800 text-slate-100 text-xs flex items-center justify-center px-3 py-1.5 gap-2 text-center shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
            {/* Subtle connectivity icon */}
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-600 text-white text-[9px] leading-none">
                ⛅
            </span>

            <p className="opacity-90">
                {t("message")}
            </p>
        </div>
    );
}
