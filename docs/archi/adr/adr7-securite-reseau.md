# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace
**Date :** 10/10/2025
**Statut :** accepté
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# ADR 7 : Sécurité réseau et isolation

## Status
Accepted

## Context
L’application contient des composants sensibles (API et base de données).  
Il est impératif d’isoler les services pour éviter les expositions inutiles.

## Decision
- Deux réseaux Docker :  
  - **web** : Traefik, frontend et API.  
  - **internal** : API et base de données.  
- Seul Traefik expose des ports sur le VPS (80/443).  
- Postgres n’est accessible qu’en interne depuis l’API.  
- Accès SSH restreint à l’utilisateur `ms-deploy`.  
- `PermitRootLogin prohibit-password` pour bloquer les connexions root directes.

## Consequences
- Aucune exposition de la DB sur Internet.  
- Flux réseau maîtrisés et audités.  
- Bonne pratique de sécurité pour un projet déployé publiquement.
