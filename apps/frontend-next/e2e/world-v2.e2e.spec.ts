import { test, expect } from "@playwright/test";

/**
 * Test end-to-end du contrôle d’accès à la page World V2.
 *
 * @remarks
 * La page World V2 est située sous une route protégée (`/member`).
 * Lorsqu’un utilisateur non authentifié tente d’y accéder,
 * l’application doit automatiquement le rediriger vers la page de connexion,
 * tout en conservant la destination initiale via le paramètre `redirectTo`.
 *
 * Ce test valide :
 * - que l’accès à `/fr/member/world-v2` est bien protégé,
 * - que la redirection vers la page de connexion est effective,
 * - que la destination demandée est correctement préservée.
 *
 * Aucun mock d’authentification n’est utilisé afin de représenter
 * le comportement réel de l’application dans un navigateur.
 */
test("World V2 : redirection vers la page de connexion si non authentifié", async ({ page }) => {
    // Tentative d’accès à la page protégée World V2
    await page.goto("/fr/member/world-v2");

    // Vérifie que l’utilisateur est redirigé vers la page de connexion
    await expect(page).toHaveURL(/\/fr\/auth\/login\?redirectTo=/);

    // Extraction du paramètre redirectTo depuis l’URL
    const url = new URL(page.url());
    const redirectTo = url.searchParams.get("redirectTo");

    // Vérifie que la destination initiale est correctement conservée
    expect(redirectTo).toBe("/fr/member/world-v2");
});
