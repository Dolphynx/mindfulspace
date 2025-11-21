// ============================================================
// POINT D’ENTRÉE DES COMPOSANTS DE LAYOUT
// ============================================================
// Ce fichier centralise **tous les composants appartenant au layout**.
//
// Cela permet d’importer depuis un seul endroit, par exemple :
//
//     import { Navbar, Footer, CookieBanner } from "@/components";
//
// au lieu de :
//
//     import Navbar from "@/components/layout/Navbar";
//     import Footer from "@/components/layout/Footer";
//     import CookieBanner from "@/components/layout/CookieBanner";
//
// => L'objectif est de rendre les imports plus propres, plus courts,
//    et de maintenir une architecture claire du dossier `components/layout`.
// ============================================================

export { default as CookieBanner } from "./CookieBanner";
export { default as CookiePreferencesModal } from "./CookiePreferencesModal";
export { default as Footer } from "./Footer";
export { default as FooterCookiesLink } from "./FooterCookiesLink";

export { ClientNavbar } from "./Navbar";
export { PublicNavbar } from "./PublicNavbar";
export { CoachNavbar } from "./CoachNavbar";
export { AdminNavbar } from "./AdminNavbar";
export { MainNavbar } from "./MainNavbar";

export { default as AppShell } from "./AppShell";
