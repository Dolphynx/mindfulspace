# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 22/10/2025  
**Statut :** En cours  
**Auteur :** Équipe MindfulSpace

# Stratégie de rendu Next : SSR + SSG/ISR

## Contexte
Certaines pages publiques sont fortement indexables, d'autres sont dynamiques et réservées
aux utilisateurs connectés. Il faut optimiser le temps au premier rendu et le SEO tout en
préservant la fraîcheur des données.

Par ailleurs, l'application contient plusieurs espaces fonctionnels (public, client, coach,
administration). Pour accompagner cette modularité, une structuration claire des routes
et des layouts est nécessaire.

## Décision
Utiliser SSG/ISR pour les pages publiques cacheables (présentation, certaines ressources), et
SSR pour les pages dynamiques et authentifiées (compte, dashboard).

Mettre en place une organisation modulaire du front basée sur les groupes de routes
(App Router Next.js), avec séparation explicite entre les espaces :
- `(public)` pour les pages publiques,
- `client/(client)` pour les pages nécessitant une authentification,
- extensible à terme pour `coach` et `admin`.

Centraliser le chrome global (footer, gestion des cookies, bandeau global) dans un composant
unique `AppShell`, et utiliser des layouts distincts pour injecter les barres de navigation
appropriées (publique ou authentifiée).

## Conséquences
- Bon équilibre entre SEO, performances et coûts serveur.
- Gestion de l'invalidation de cache ISR à concevoir.
- Distinction claire entre écrans offline potentiels et écrans online-only.
- Meilleure modularité du front, facilitant l’évolution vers plusieurs profils utilisateurs
  et une maintenance plus structurée.

## Alternatives
Full SSR ou full SSG. Non retenus pour éviter respectivement une charge serveur excessive
ou un manque de flexibilité.
