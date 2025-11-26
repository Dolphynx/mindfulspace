// src/app/[locale]/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/globals.css";
import ServiceWorkerRegister from "../../../pwa/ServiceWorkerRegister";
import { ReactNode } from "react";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { TranslationProvider } from "@/i18n/TranslationContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

/**
 * Metadata dynamique selon la locale.
 */
export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    const dict = await getDictionary(locale);
    const t = dict.metadataLayout;

    return {
        title: {
            default: t.defaultTitle,
            template: `%s · MindfulSpace`,
        },
        description: t.description,
        manifest: "/manifest.json",
        robots: { index: false, follow: false },
    };
}

export default async function RootLayout({
                                             children,
                                             params,
                                         }: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    const messages = await getDictionary(locale);

    return (
        <html lang={locale}>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ServiceWorkerRegister />
        <TranslationProvider locale={locale} messages={messages}>
            {children}
        </TranslationProvider>
        </body>
        </html>
    );
}
