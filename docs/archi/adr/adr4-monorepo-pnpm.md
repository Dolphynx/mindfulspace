# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace
**Date :** 16/10/2025
**Statut :** accepté
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# ADR 4 : Monorepo géré avec PNPM

## Status
Accepted

## Context
Le projet comporte deux applications étroitement liées (Next.js et NestJS).  
Avoir deux dépôts compliquerait la maintenance, les dépendances et le CI/CD.

## Decision
Nous utilisons un **monorepo** géré par **pnpm workspaces** :  
- Racine : fichiers `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`.  
- Sous-apps : `apps/frontend-next` et `apps/api-nest`.  
- Une seule installation de dépendances (`pnpm install`).

## Consequences
- Un seul `node_modules` partagé → moins de duplication.  
- Build reproductible et plus rapide dans Docker.  
- Facilite la synchronisation de versions front/back et la gestion des types partagés.
