# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 04/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace

# ADR 7 : Base de données, Prisma & migrations

## Status
Accepted

## Contexte
Le schéma de base de données évolue régulièrement au fil du développement.  
Pour assurer une cohérence stricte entre les environnements **local**, **staging**, et **production**, l’équipe a besoin :

- d’un mécanisme fiable de migration du schéma,
- d’un moyen reproductible d’appliquer ces migrations sur le VPS,
- d’éviter des divergences dues à des modifications manuelles en base,
- d’un outil permettant de générer du code client typé pour l’API.

De plus, le projet repose sur :

- PostgreSQL (staging + production)
- Un monorepo PNPM
- Un déploiement via Docker Compose
- GitLab CI/CD pour automatiser et contrôler les changements en base

## Décision

### Adoption de **Prisma ORM** comme solution principale
Le choix s’oriente sur Prisma pour les raisons suivantes :

- Migrations versionnées dans le dossier `prisma/migrations`
- Génération d’un client TypeScript fortement typé pour l’API NestJS
- Intégration standardisée dans le pipeline CI/CD
- Commandes explicites et robustes (`migrate dev`, `migrate deploy`, `db seed`)
- Compatibilité totale avec Docker multi-stage et le design de l’API

### Règles établies pour les environnements

#### **Environnement local**
- Commande principale :
  ```bash
  npx prisma migrate dev
