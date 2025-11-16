# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 22/10/2025  
**Statut :** accepté  
**Auteur :** Équipe MindfulSpace

# ADR 12 : Conteneurisation des applications

## Status  
Accepted

## Context  
Pour garantir des environnements **cohérents**, **reproductibles** et **isolés** entre le développement, le CI/CD et la production, l’ensemble des services MindfulSpace doit fonctionner dans des conteneurs Docker.

La plateforme repose sur plusieurs composants interdépendants (frontend, API, base de données, reverse-proxy), qui doivent pouvoir être orchestrés ensemble via Docker Compose et exposés proprement via Traefik.

Le choix d'une conteneurisation complète facilite également l'intégration avec Kaniko, GitLab CI/CD, les réseaux Docker (`web` / `internal`) et l’architecture multi-environnements (staging & production).

## Decision  
Toutes les applications du projet sont conteneurisées avec **Docker multi-stage**.

### Backend : API NestJS  
- Build dans une image Node 20 Alpine (pnpm install + build NestJS + prisma generate).  
- Runtime léger (Node 20 Alpine + dist/).  
- Exposé sur le port 3001.  
- Intégré à Traefik via labels Docker.

### Frontend : Next.js  
- Build en mode production via `pnpm build` (Next.js 14).  
- Serveur de production : `next start` dans l’image runtime.  
- Injection automatique de `NEXT_PUBLIC_API_URL` via `--build-arg`.  
- Exposé sur le port 3000.  

### Base de données : PostgreSQL  
- Exécutée dans un conteneur Docker isolé sur le réseau `internal`.  
- Volume persistant : `db_data_<env>`.  
- Jamais exposée publiquement.

### Reverse Proxy : Traefik v3.x  
- Unique point d’entrée HTTP/HTTPS.  
- Certificats Let’s Encrypt automatiques.  
- Routage basé sur les labels (staging/prod + sous-domaines).  
- Conteneur dédié connecté au réseau `web`.

### Intégration CI/CD  
- Les images sont construites via **Kaniko** dans GitLab CI/CD.  
- Tagging automatique :  
  - `staging` sur la branche `main`,  
  - `prod` lors des tags Git.  
- Push dans le GitLab Container Registry.  
- Déploiement automatisé via SSH + Docker Compose.

## Consequences  

### Avantages  
- Portabilité totale sur tous les environnements.  
- Aucun runtime Node/Postgres installé sur le VPS → tout passe par Docker.  
- Déploiement simplifié : `docker compose pull && up -d`.  
- Isolation forte entre services (`web` public, `internal` privé).  
- Images légères et optimisées grâce au multi-stage.  
- Sécurité renforcée (minimisation de surface d’attaque).  
- Parfaitement compatible avec Kaniko + GitLab CI.

### Points de vigilance  
- Les images doivent rester cohérentes avec le monorepo PNPM.  
- Nécessite une gestion correcte des volumes DB.  
- La conteneurisation impose un build system rigoureux (Dockerfiles maintenus à jour).

---

La conteneurisation complète est adoptée comme stratégie standard pour MindfulSpace, car elle garantit une architecture stable, sécurisée et reproductible du développement jusqu’à la production.
