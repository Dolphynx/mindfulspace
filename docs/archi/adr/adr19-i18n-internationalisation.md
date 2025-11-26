# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 24/11/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace

# Gestion multilingue du front (i18n avec App Router)

## Contexte
Le front-end Next.js de MindfulSpace était initialement développé uniquement en français,
avec des chaînes de caractères écrites en dur dans les composants et les pages.  
Avec la montée en puissance du projet (public cible plus large, démonstrations possibles
à un public non francophone, réutilisation ou évolution future), cette approche monolingue
n’était plus adaptée.

Par ailleurs, l’architecture modulaire du front (groupes de routes `(public)`, `client`, etc.)
reposant sur l’App Router est désormais en place. Il devenait important que
la solution de traduction soit cohérente avec cette structure, en particulier au niveau du
routing et des layouts partagés.

Les besoins identifiés :
- Supporter au minimum les langues **français (fr)** et **anglais (en)**.
- Pouvoir ajouter facilement d’autres langues si nécessaire.
- Garder une expérience utilisateur cohérente entre les modules (public / client / coach / admin).
- Éviter de dupliquer les pages ou les composants pour chaque langue.
- Rester dans le modèle App Router (Server Components / Client Components).

## Décision
Mettre en place un système i18n maison, basé sur :
- Un **segment de langue** dans l’URL : `app/[locale]/…`  
  - Exemples : `/fr/resources`, `/en/member/dashboard`, `/fr/member/seance/respiration`.
- Une configuration centralisée dans `src/i18n/config.ts` :  
  - `type Locale = "fr" | "en";`  
  - `export const locales: Locale[] = ["fr", "en"];`  
  - `export const defaultLocale = "fr";`  
  - helper `isLocale()` pour sécuriser les usages.
- Des **dictionnaires de traduction** par langue :  
  - `src/i18n/fr.ts` et `src/i18n/en.ts`, organisés par *namespace* (`footer`, `navbar`,
    `resourcesPage`, `moodSession`, etc.).
- Un **TranslationProvider** (contexte React) injecté dans `app/[locale]/layout.tsx`, afin que
  les composants clients puissent consommer les traductions via un hook.
- Deux modes d’accès aux traductions, selon le type de composant :
  - **Server Components** : usage de `getDictionary(locale)` et accès aux clés par propriété
    (`t.title`, `t.subtitle`, …).
  - **Client Components** : usage du hook `useTranslations("namespace")` et accès fonctionnel
    (`t("title")`, `t("subtitle")`, …).
- Un composant **LanguageSwitcher** dans les layouts `(public)` et `(client)` permettant de
  basculer entre `fr` et `en` en conservant le chemin de la page courante (remplacement du
  premier segment de l’URL).

Les liens internes sont systématiquement écrits en incluant la locale actuelle, par exemple :  
`href={f"/{locale}/resources"}` plutôt que `href="/resources"`.

## Conséquences
- Le front est désormais **compatible multi-langues** (FR/EN) sans duplication de pages.
- Les équipes disposent d’un **modèle clair** pour ajouter de nouveaux textes :
  - créer un namespace dans `fr.ts` et `en.ts`,
  - utiliser `getDictionary` (server) ou `useTranslations` (client) selon le composant.
- La structure des routes reste lisible : la langue est toujours visible dans l’URL
  (`/[locale]/…`), ce qui facilite le partage de liens et le SEO.
- Le changement de langue ne nécessite pas de rechargement complet : `LanguageSwitcher` se
  contente de recalculer l’URL en changeant le segment de langue.
- L’ajout d’une nouvelle langue demandera essentiellement la création d’un nouveau fichier
  de dictionnaire (ex. `de.ts`) et l’ajout de la locale dans `config.ts`.

Points d’attention :
- Il devient important de **ne plus écrire de texte en dur** dans les JSX, sauf cas
  exceptionnel (debug, expérimentations locales).
- Toute nouvelle fonctionnalité devra prévoir ses clés de traduction FR/EN dès le départ.
- Les développeurs doivent bien distinguer l’usage de `getDictionary` (server) et
  `useTranslations` (client) pour éviter les erreurs de type ou d’hydratation.

## Alternatives
- Utiliser une librairie dédiée comme `next-intl` ou `next-i18next`.  
  Rejeté pour garder une solution légère, facilement compréhensible et bien intégrée
  au modèle App Router sans surcouche supplémentaire.
- Gérer la langue uniquement via des cookies ou le `navigator.language` sans segment d’URL.  
  Rejeté car moins explicite, moins pratique pour le partage de liens et plus complexe à
  combiner avec la structure de routes existante.
- Dupliquer certaines pages par langue (ex. `/fr/...` et `/en/...` physiquement séparées).  
  Rejeté pour éviter la duplication de logique et de layout, difficile à maintenir à moyen terme.
