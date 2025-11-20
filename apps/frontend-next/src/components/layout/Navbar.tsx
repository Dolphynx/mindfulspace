"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

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
                    // mobile : plein largeur
                    "w-full justify-start",
                    // desktop : bouton compact
                    "lg:w-auto lg:justify-center",
                    active
                        ? "bg-brandGreen text-white border-brandGreen shadow-sm"
                        : "text-brandText border-transparent hover:bg-white/60 hover:border-brandBorder",
                ].join(" ")}
            >
                {icon && (
                    <span className="text-lg leading-none" aria-hidden="true">
            {icon}
          </span>
                )}
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <header className="w-full bg-brandSurface border-b border-brandBorder">
            <div className="mx-auto max-w-7xl px-4 py-3">
                {/* CONTENEUR GLOBAL :
            - mobile : colonne
            - desktop : ligne logo + menu */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Ligne logo + burger */}
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Image
                                src="/images/MindfulSpace_logo.jpg"
                                alt="MindfulSpace logo"
                                width={90}
                                height={40}
                                className="object-contain"
                                priority
                            />
                        </Link>

                        {/* Burger visible seulement sur mobile / tablette */}
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-brandBorder px-2 py-1 text-sm text-brandText hover:bg-white/70 lg:hidden"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                            aria-label="Ouvrir le menu"
                        >
                            <span className="sr-only">Ouvrir le menu</span>
                            <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 bg-brandText" />
                <span className="block h-0.5 w-5 bg-brandText" />
                <span className="block h-0.5 w-5 bg-brandText" />
              </span>
                        </button>
                    </div>

                    {/* NAV :
              - mobile : caché/affiché sous le logo
              - desktop : toujours visible, sur la même ligne, à droite */}
                    <nav
                        className={[
                            "mt-1 flex flex-col gap-2",
                            isOpen ? "flex" : "hidden", // mobile
                            "lg:mt-0 lg:flex lg:flex-row lg:items-center lg:gap-4 lg:justify-end", // desktop
                        ].join(" ")}
                    >
                        <NavButton
                            href="/seance/respiration"
                            label="Respiration"
                            icon={<span>🌬️</span>}
                        />
                        <NavButton href="/dashboard" label="Dashboard" icon={<span>📊</span>} />
                        <NavButton href="/objectives" label="Objectives" icon={<span>🎯</span>} />
                        <NavButton href="/resources" label="Ressources" icon={<span>📚</span>} />
                        <NavButton href="/coach" label="Become a coach" icon={<span>🎓</span>} />
                        <NavButton href="/contact" label="Contact" icon={<span>✉️</span>} />
                    </nav>
                </div>
            </div>
        </header>
    );
}
