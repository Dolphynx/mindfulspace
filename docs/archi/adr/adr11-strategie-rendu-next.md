# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 22/10/2025  
**Statut :** En cours  
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# Stratégie de rendu Next : SSR + SSG/ISR

## Contexte
Certaines pages publiques sont fortement indexables, d'autres sont dynamiques et réservées 
aux utilisateurs connectés. Il faut optimiser le temps au premier rendu et le SEO tout en 
préservant la fraîcheur des données.

## Décision
Utiliser SSG/ISR pour les pages publiques cacheables (présentation, certaines ressources), et 
SSR pour les pages dynamiques et authentifiées (compte, dashboard).

## Conséquences
- Bon équilibre entre SEO, performances et coûts serveur.
- Gestion de l'invalidation de cache ISR à concevoir.
- Distinction claire entre écrans offline potentiels et écrans online-only.

## Alternatives
Full SSR ou full SSG. Non retenus pour éviter respectivement une charge serveur excessive 
ou un manque de flexibilité.
