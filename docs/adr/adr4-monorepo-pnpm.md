# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 16/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Monorepo avec pnpm workspaces

## Contexte
Le projet contient un front Next.js, une API NestJS et des packages partagés (types, utilitaires). 
Une gestion multi-dépôts augmenterait la friction et la duplication de configuration.

## Décision
Centraliser le code dans un monorepo pnpm workspaces avec `apps/frontend-next`, `apps/api-nest` et 
`packages/*`. Un seul `node_modules` à la racine. Pipelines CI segmentés par application.

## Conséquences
- Partage de code et de types simplifié.
- Déduplication des dépendances et configuration unique.
- Pipelines plus efficaces grâce au cache et à la sensibilité par dossier.
- Attention requise pour éviter les couplages non souhaités entre apps et packages.

## Alternatives
Multi-repos. Non retenu pour limiter la charge de coordination et simplifier la CI/CD.
