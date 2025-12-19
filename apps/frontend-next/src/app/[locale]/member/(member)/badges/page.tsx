"use client";

import { usePathname } from "next/navigation";
import OceanWavesBackground from "@/components/layout/OceanWavesBackground";
import { BadgesList } from "@/components/badges/BadgesList";
import { localeFromPathname, useUserBadges } from "@/components/badges/useUserBadges";

export default function MemberBadgesPage() {
    const pathname = usePathname();
    const locale = localeFromPathname(pathname);
    const { badges, loading } = useUserBadges();

    return (
        <OceanWavesBackground headerOffsetPx={80} wavesHeight="80vh">
            <div className="mx-auto w-[92%] max-w-6xl pt-6 pb-24">
                <BadgesList badges={badges} loading={loading} locale={locale} variant="page" />
            </div>
        </OceanWavesBackground>
    );
}
