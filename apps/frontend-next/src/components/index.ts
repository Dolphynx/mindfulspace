// ============================================================
// BARREL FILE PRINCIPAL DU DOSSIER `components`
// ============================================================
//
// Ce fichier sert de *point d'entrée unique* pour exposer les
// sous-dossiers de `components/`.
//
// L'objectif est de permettre des imports plus simples comme :
//
//     import { Navbar, Footer } from "@/components";
//
// au lieu de :
//
//     import { Navbar } from "@/components/layout/Navbar";
//     import { Footer } from "@/components/layout/Footer";
//
// ============================================================
// NOTE IMPORTANTE :
// ------------------
// Ici, nous réexportons le contenu du dossier `layout`.
//
// Ce n'est qu'un EXEMPLE : d'autres sous-dossiers peuvent être
// ajoutés à l'avenir (ex : "forms", "charts", "ui", etc.).
//
// Le fichier `components/index.ts` deviendra alors le point
// central qui expose uniquement *ce que nous souhaitons rendre
// disponible* à l'extérieur du dossier `components/`.
//
// En résumé :
// - Ce fichier ne contient AUCUNE logique métier.
// - Il se contente de réexporter des groupes de composants.
// - Il facilite et uniformise tous les imports dans l'app.
// ============================================================
export * from "./admin";
export * from "./badges";
export * from "./confetti";
export * from "./exercise";
export * from "./layout";
export * from "./map";
export * from "./meditation";
export * from "./notifications";
export * from "./profile";
export * from "./resources";
export * from "./session";
export * from "./shared";
export * from "./sleep";
export * from "./toasts";
