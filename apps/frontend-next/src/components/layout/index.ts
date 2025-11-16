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

export { default as Navbar } from "./Navbar";                         // Barre de navigation principale
export { default as Footer } from "./Footer";                         // Footer général du site
export { default as FooterCookiesLink } from "./FooterCookiesLink";   // Lien vers les préférences cookies, affiché dans le footer
export { default as CookieBanner } from "./CookieBanner";             // Bandeau cookies affiché aux nouveaux visiteurs
export { default as CookiePreferencesModal } from "./CookiePreferencesModal"; // Modal permettant de gérer les préférences cookies
