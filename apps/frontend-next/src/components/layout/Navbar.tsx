"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

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
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors " +
                    (active
                        ? "bg-brandGreen text-white border-brandGreen shadow-sm"
                        : "text-brandText border-transparent hover:bg-white/60 hover:border-brandBorder")
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
            {/* --- DEBUG MARKER: NAVBAR V3 --- */}
            <div className="hidden" data-navbar-version="v3" />

            <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
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

                <nav className="flex items-center gap-4">

                    {/* bouton dashbaord */}
                    <NavButton
                        href="/dashboard"
                        label="Dashboard"
                        icon={<span>📊</span>}
                    />

                    {/* bouton respiration */}
                    <NavButton
                        href="/seance/respiration"
                        label="Respiration"
                        icon={<span aria-label="Respiration" title="Lancer respiration">🌬️</span>}
                    />

                    {/* bouton AI mantras */}
                    <NavButton
                        href="/mantra"
                        label="IA mantras"
                        icon={<span aria-label="IA mantras" title="IA mantras">💬</span>}
                    />

                    {/* bouton contact */}
                    <NavButton
                        href="/contact"
                        label="Contact"
                        icon={<span aria-label="Contact" title="Contact">✉️</span>}
                    />
                </nav>
            </div>
        </header>
    );
}
