import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/globals.css";

import AppChrome from "@/components/AppChrome";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "MindfulSpace – Prends soin de ton esprit",
        template: "%s · MindfulSpace",
    },
    description:
        "MindfulSpace t'aide à suivre ton bien-être (sommeil, respiration, méditation) et à développer une routine plus apaisée. Projet étudiant HELMo.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <AppChrome>{children}</AppChrome>
        </body>
        </html>
    );
}
