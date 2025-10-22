# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 06/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Stack technique : Next.js + NestJS + PostgreSQL

## Contexte
Le produit combine SEO, pages publiques, parcours authentifiés et logique métier. Le front 
doit fournir SSR/SSG/ISR et le back-end doit rester modulaire et typé. Les données sont relationnelles.

## Décision
Utiliser Next.js pour le front (SSR/SSG/ISR, RSC), NestJS pour l'API (structure modulaire, 
DI, validation), PostgreSQL pour la persistance des données.

## Conséquences
- Bon compromis entre SEO, performance perçue et productivité.
- Architecture back robuste, testable et typée.
- Intégrité référentielle et requêtes avancées côté PostgreSQL.
- Double courbe d'apprentissage (Next et Nest).

## Alternatives
Remix/Fastify/Prisma-only ou frameworks monolithiques (Rails/Django). Non retenus pour rester 
dans l'écosystème JavaScript demandé et conserver SSR/ISR natifs.
