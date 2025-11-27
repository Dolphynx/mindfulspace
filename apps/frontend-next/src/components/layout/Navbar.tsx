"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export function ClientNavbar() {
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "fr";
    const [isOpen, setIsOpen] = useState(false);

    const t = useTranslations("nav");

    const NavButton = ({
                           href,
                           icon,
                           label,
                       }: {
        href: string;
        icon?: React.ReactNode;
        label: string;
    }) => {
        const active = pathname === href;

        return (
            <Link
                href={href}
                className={[
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors",
                    "w-full justify-start",
                    "lg:w-auto lg:justify-center",
                    active
                        ? "bg-brandGreen text-white border-brandGreen shadow-sm"
                        : "text-brandText border-transparent hover:bg-white/60 hover:border-brandBorder",
                ].join(" ")}
            >
                {icon && <span aria-hidden="true">{icon}</span>}
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <header className="w-full bg-brandSurface border-b border-brandBorder">
            <div className="mx-auto max-w-7xl px-4 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center justify-between">
                        <Link href={`/${locale}/member/world`}>
                            <Image
                                src="/images/MindfulSpace_logo.jpg"
                                alt="MindfulSpace logo"
                                width={90}
                                height={40}
                                className="object-contain"
                                priority
                            />
                        </Link>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-brandBorder px-2 py-1 text-sm text-brandText hover:bg-white/70 lg:hidden"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                        >
                            <span className="flex flex-col gap-1">
                                <span className="block h-0.5 w-5 bg-brandText" />
                                <span className="block h-0.5 w-5 bg-brandText" />
                                <span className="block h-0.5 w-5 bg-brandText" />
                            </span>
                        </button>
                    </div>

                    <nav
                        className={[
                            "mt-1 flex flex-col gap-2",
                            isOpen ? "flex" : "hidden",
                            "lg:mt-0 lg:flex lg:flex-row lg:items-center lg:gap-4 lg:justify-end",
                        ].join(" ")}
                    >
                        <NavButton
                            href={`/${locale}/member/seance/respiration`}
                            label={t("breathing")}
                            icon={<span>🌬️</span>}
                        />

                        <NavButton
                            href={`/${locale}/member/objectives`}
                            label={t("Goals")}
                            icon={<span>🎯</span>}
                        />

                        <NavButton
                            href={`/${locale}/resources`}
                            label={t("resources")}
                            icon={<span>📚</span>}
                        />

                        <NavButton
                            href={`/${locale}/coach`}
                            label={t("becomeCoach")}
                            icon={<span>🎓</span>}
                        />

                        <NavButton
                            href={`/${locale}/contact`}
                            label={t("contact")}
                            icon={<span>✉️</span>}
                        />

                        <LanguageSwitcher />
                    </nav>
                </div>
            </div>
        </header>
    );
}
