# MindfulSpace – Architecture Decision Record

# ADR 0 : Architecture globale et pipeline MindfulSpace

## Status
Accepted

## Context
MindfulSpace est une application web de bien-être mental et de pleine conscience.  
Le projet doit combiner :  
- une **interface Next.js** moderne et réactive,  
- une **API NestJS** performante et sécurisée,  
- une **base de données PostgreSQL** persistante,  
- un **hébergement Dockerisé** sur VPS Debian,  
- et un **pipeline CI/CD GitLab** entièrement automatisé.  

L’objectif : mettre en place une architecture claire, sécurisée et réaliste, inspirée des pratiques professionnelles (architecture modulaire, reverse proxy, staging / production, secrets protégés, etc.).

## Decision
L’architecture globale repose sur les principes suivants :

### 1️ Organisation du code
- Monorepo TypeScript géré par **pnpm workspaces**.  
- Deux applications principales :  
  - `apps/frontend-next` : Next.js 14 (SSR + PWA).  
  - `apps/api-nest` : NestJS 10.  
- Un `package.json` racine et un `pnpm-lock.yaml` unique assurent la cohérence des dépendances.  

### 2️ Infrastructure serveur
- **VPS Debian 13 ** hébergeant **Docker 29.0.0**.  
- Conteneurs :  
  - `frontend` (Next.js buildé en production),  
  - `api` (NestJS),  
  - `postgres` (base de données),  
  - `traefik` (reverse proxy / TLS).  

### 3️ Réseaux Docker
- `web` : relie Traefik, frontend et API.  
- `internal` : relie API et Postgres uniquement.  
→ La base n’est pas exposée publiquement ; seul Traefik publie les ports 80 / 443.

### 4️ Reverse proxy et HTTPS
- **Traefik v3.1** configure automatiquement le routage et le chiffrement TLS via Let’s Encrypt.  
- Challenge ACME HTTP + stockage persistant dans `/letsencrypt/acme.json`.

### 5️ CI/CD GitLab
- Runner Docker avec **service `docker:dind`** pour construire et pousser les images.  
- Étapes :
  1. **Build :** création des images `frontend` et `api`, push vers le Container Registry GitLab.  
  2. **Deploy :** connexion SSH au VPS (`ms-deploy`), `docker pull` + `docker compose up -d`.  
- Deux environnements :  
  - **staging** → branche `main` → `staging.mindfulspace.be`,  
  - **production** → tag Git → `mindfulspace.be`.

### 6️ Secrets et sécurité
- Secrets infra (GitLab CI : clés SSH, identifiants Registry) → variables **masked / protected**.  
- Secrets app (.env sur le serveur) → non versionnés.  
- SSH : utilisateur `ms-deploy`, `PermitRootLogin prohibit-password`.  
- Aucun port inutile exposé ; isolation réseau complète.

## Consequences
✅ Déploiement automatisé et reproductible.  
✅ Environnement cohérent et sécurisé.  
✅ Séparation claire staging / production.  
✅ Stack moderne, documentée et maîtrisée par l’équipe.  
✅ Architecture démonstrative des bonnes pratiques DevOps pour un projet académique.
