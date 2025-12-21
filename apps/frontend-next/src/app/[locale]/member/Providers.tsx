"use client";

import type { ReactNode } from "react";

import { ConfettiProvider } from "@/components/confetti/ConfettiProvider";
import { BadgeToastProvider } from "@/components/badges/BadgeToastProvider";
import { AppToastProvider } from "@/components/toasts/AppToastProvider";

/**
 * Providers globaux de l’espace member (authentifié).
 *
 * @remarks
 * Centralise les Context Providers utilisés dans le layout afin de :
 * - réduire la verbosité du fichier `layout.tsx` ;
 * - documenter clairement l’ordre d’encapsulation.
 *
 * Ordre :
 * - `ConfettiProvider` : overlay global (effet visuel).
 * - `BadgeToastProvider` : file de toasts badges (déclenche `fire()` à chaque badge affiché).
 * - `AppToastProvider` : toasts génériques (succès/erreur/info).
 */
export function MemberProviders({ children }: { children: ReactNode }) {
    return (
        <ConfettiProvider>
            <BadgeToastProvider>
                <AppToastProvider>{children}</AppToastProvider>
            </BadgeToastProvider>
        </ConfettiProvider>
    );
}
