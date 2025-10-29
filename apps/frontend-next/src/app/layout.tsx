import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "../pwa/ServiceWorkerRegister";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MindfulSpace",
    description: "Déployé avec amour et sérénité grâce à CI/CD GitLab 🌿",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-slate-800`}
        >
        {children}
        <ServiceWorkerRegister /> {/* ✅ ensure it runs on the client */}
        </body>
        </html>
    );
}
