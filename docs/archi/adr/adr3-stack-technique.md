# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace
**Date :** 06/10/2025
**Statut :** accepté
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# ADR 3 : Stack technique

## Status
Accepted

## Context
Nous avons besoin d’une stack moderne, compatible TypeScript, full JavaScript, et adaptée à un déploiement Docker.  

## Decision
- **Frontend** : Next.js 14 (React, SSR, SSG, PWA-ready).  
- **Backend** : NestJS (structure modulaire, validation, sécurité).  
- **Database** : PostgreSQL.  
- **Langage** : TypeScript.  
- **Gestionnaire de paquets** : pnpm.  
- **Hébergement** : VPS Debian 13 + Docker.  
- **Reverse proxy** : Traefik v3.1 (Let’s Encrypt TLS).  
- **CI/CD** : GitLab CI/CD (staging via branche main, prod via tag).

## Consequences
- Cohérence du langage entre front et back.  
- Stack largement documentée et utilisée en entreprise.  
- Simplicité d’intégration continue via Docker.
