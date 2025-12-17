/**
 * Page listant les ressources.
 *
 * Cette page affiche :
 *  - une barre de recherche
 *  - une liste filtrable par catégories
 *  - l'ensemble des ressources disponibles
 *  - pour les coaches: un toggle pour gérer leurs propres ressources
 *
 * Route : /[locale]/resources
 */

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import PageHero from "@/components/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";
import { useAuth } from "@/contexts/AuthContext";
import { ResourcesList } from "@/components/resources";

export default function ResourcesPage() {
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "fr";
    const t = useTranslations("resourcesPage");
    const { user } = useAuth();

    // Toggle between public view and coach management view
    const [showMyResources, setShowMyResources] = useState(false);

    // Check if user is coach or admin
    const isCoach = user?.roles.some((role) =>
        ['coach', 'admin'].includes(role.toLowerCase())
    ) ?? false;

    return (
        <div className="text-brandText flex flex-col">
            {/* En-tête de page */}
            <PageHero
                title={t("heroTitle")}
                subtitle={t("heroSubtitle")}
            />

            <section className="mx-auto max-w-5xl w-full px-4 py-8 space-y-6">
                {/* Coach toggle button */}
                {isCoach && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowMyResources(!showMyResources)}
                            className="rounded-lg bg-brandGreen px-4 py-2 text-sm font-medium text-white transition hover:bg-brandGreen/90"
                        >
                            {showMyResources
                                ? t("viewAllResources")
                                : t("manageMyResources")}
                        </button>
                    </div>
                )}

                {/* Resources list with mode toggle */}
                <ResourcesList
                    mode={showMyResources ? "myResources" : "public"}
                    locale={locale}
                    showCreateButton={showMyResources}
                />
            </section>
        </div>
    );
}