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
                className={
                    [
                        // Base : mobile
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors",
                        "w-full justify-start",          // boutons large écran tactile
                        // Desktop
                        "lg:w-auto lg:justify-center",
                        active
                            ? "bg-brandGreen text-white border-brandGreen shadow-sm"
                            : "text-brandText border-transparent hover:bg-white/60 hover:border-brandBorder",
                    ].join(" ")
                }
            >
                {icon && (
                    <span
                        className="text-lg leading-none"
                        aria-hidden={label ? undefined : "true"}
                    >
                        {icon}
                    </span>
                )}
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <header className="w-full bg-brandSurface border-b border-brandBorder">
            {/* --- DEBUG MARKER: NAVBAR V4 (responsive) --- */}
            <div className="hidden" data-navbar-version="v4" />

            <div className="mx-auto max-w-7xl px-4 py-3">
                {/* Ligne du haut : logo + burger */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                    </div>

                    {/* Bouton burger : visible seulement sur mobile / tablette */}
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-brandBorder px-2 py-1 text-sm text-brandText hover:bg-white/70 lg:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                        aria-label="Ouvrir le menu"
                    >
                        {/* Icône burger simple en CSS */}
                        <span className="sr-only">Ouvrir le menu</span>
                        <span className="flex flex-col gap-1">
                            <span className="block h-0.5 w-5 bg-brandText" />
                            <span className="block h-0.5 w-5 bg-brandText" />
                            <span className="block h-0.5 w-5 bg-brandText" />
                        </span>
                    </button>
                </div>

                {/* Navigation :
                    - Mobile : colonne, masquée quand isOpen = false
                    - Desktop : row, toujours visible */}
                <nav
                    className={[
                        "mt-3 flex flex-col gap-2",
                        isOpen ? "flex" : "hidden", // mobile
                        "lg:mt-0 lg:flex lg:flex-row lg:items-center lg:gap-4", // desktop
                    ].join(" ")}
                >
                    <NavButton
                        href="/seance/respiration"
                        label="Respiration"
                        icon={
                            <span aria-label="Respiration" title="Lancer respiration">
                                🌬️
                            </span>
                        }
                    />

                    <NavButton
                        href="/dashboard"
                        label="Dashboard"
                        icon={<span>📊</span>}
                    />

                    <NavButton
                        href="/objectives"
                        label="Objectives"
                        icon={
                            <span aria-label="Objectives" title="Objectives">
                                🎯
                            </span>
                        }
                    />

                    <NavButton
                        href="/resources"
                        label="Ressources"
                        icon={
                            <span aria-label="Ressources" title="Ressources">
                                📚
                            </span>
                        }
                    />

                    <NavButton
                        href="/coach"
                        label="Become a coach"
                        icon={
                            <span aria-label="Become a coach" title="Become a coach">
                                🎓
                            </span>
                        }
                    />

                    <NavButton
                        href="/contact"
                        label="Contact"
                        icon={
                            <span aria-label="Contact" title="Contact">
                                ✉️
                            </span>
                        }
                    />
                </nav>
            </div>
        </header>
    );
}
