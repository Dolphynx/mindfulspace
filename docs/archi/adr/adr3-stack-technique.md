# MindfulSpace – Architecture Decision Record

# ADR 3 : Stack technique

## Status
Accepted

## Context
Le projet MindfulSpace nécessite une stack moderne, cohérente et entièrement basée sur TypeScript, permettant :

- un développement rapide et structuré,
- une forte maintenabilité,
- un déploiement simple via Docker,
- une intégration native avec un pipeline CI/CD GitLab,
- une séparation claire des environnements *staging* et *production*.

La stack doit également s’intégrer naturellement au monorepo PNPM et à Traefik pour la gestion du HTTPS.

## Decision

### **Frontend : Next.js 14**
- Framework React moderne
- Support SSR / SSG / ISR
- Optimal pour SEO
- Intégration simple avec Traefik via labels Docker
- Build et execution en mode production via Docker multi-stage

### **Backend : NestJS**
- Architecture modulaire, claire et scalable
- Intégration fluide avec Prisma
- Support TypeScript natif
- Parfait pour une API structurée (DTO, Guards, middlewares…)

### **Base de données : PostgreSQL**
- Système SQL puissant
- Excellent support avec Prisma
- Déployé en container Docker (réseau interne uniquement)

### **ORM / Migrations : Prisma**
- Migrations versionnées
- Client TypeScript fortement typé
- Migrations automatiques dans la CI/CD (staging/prod)
- Seed automatique en staging

### **Gestionnaire de paquets : PNPM**
- Idéal pour un monorepo
- Dépendances mutualisées via le store global
- Performances supérieures à npm/yarn
- Pertinent pour les Dockerfiles multi-stage

### **Infrastructure : VPS Debian 12 + Docker**
- Hébergement complet sur VPS
- Environnements séparés :
    - `/srv/mindfulspace/staging`
    - `/srv/mindfulspace/prod`
- Docker Compose pour orchestrer :
    - API
    - Frontend
    - PostgreSQL
    - Traefik

### **Reverse Proxy : Traefik v3.x**
- Certificats HTTPS automatiques via Let’s Encrypt
- Routage basé sur les labels Docker :
    - `mindfulspace.be` (prod front)
    - `api.mindfulspace.be` (prod API)
    - `staging.mindfulspace.be` (staging front)
    - `api.staging.mindfulspace.be` (staging API)
- Un réseau Docker externe `web` pour les services publics
- Un réseau interne pour la DB

### **CI/CD : GitLab CI/CD**
- Pipeline en 3 stages :
    - `verify` → builds de validation (Next & Nest)
    - `build` → construction d’images via Kaniko (rootless)
    - `deploy` → SSH vers VPS + Docker Compose
- Stratégie :
    - staging → branche `main`
    - production → création d’un **tag Git**
- Génération automatique :
    - `api.env`
    - `db.env`
- Application des migrations Prisma en staging & production

## Consequences

### Avantages
- Stack entièrement construite autour de TypeScript
- Parfaitement adaptée au monorepo et à Docker
- Migrations et déploiements sécurisés via CI/CD
- Architecture robuste, moderne, et utilisée en entreprise
- Séparation nette staging/production avec Traefik + sous-domaines
- Cohérence technique sur tout le projet

### Inconvénients potentiels
- Demande rigueur dans la gestion des migrations Prisma
- Pipeline plus riche ⇒ nécessite discipline sur les MR
- Stack moderne ⇒ certains membres doivent se former à PNPM, Next 14, Prisma

---

Cette stack constitue la base technique officielle du projet MindfulSpace et est adaptée à son évolution long terme.
