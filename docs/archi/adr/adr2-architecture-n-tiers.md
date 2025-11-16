# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace
**Date :** 02/10/2025
**Statut :** accepté
**Auteur :** Équipe MindfulSpace

# ADR 2 : Architecture N-tiers

## Status
Accepted

## Context
MindfulSpace nécessite une séparation claire entre l’interface utilisateur, la logique métier et la persistance des données.  
Les frameworks choisis (Next.js + NestJS) s’intègrent naturellement dans une architecture en trois couches.

## Decision
Nous adoptons une **architecture N-tiers** :
- **Frontend (Next.js)** : couche de présentation, PWA responsive.  
- **Backend (NestJS)** : couche métier et API REST/GraphQL.  
- **Database (PostgreSQL)** : couche de stockage des données.

Ces services communiquent via HTTP interne, isolés dans des conteneurs distincts et reliés par un réseau Docker interne.

## Consequences
- Bonne séparation des responsabilités.  
- Facilite la maintenance et les tests.  
- Compatible avec une montée en charge future (scalabilité horizontale possible).
