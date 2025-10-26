# MindfulSpace – Architecture Decision Records

Ces décisions sont prises dans le cadre du projet étudiant **MindfulSpace**  
(HELMo – Bloc 3 *Frameworks web* & *Archilog*, 2025).  

Elles documentent les **choix techniques et architecturaux** du projet, leur **contexte**, leur **raison d’être**, et leurs **conséquences**, selon la méthodologie des *Architecture Decision Records (ADR)*.

L’objectif est d’assurer la **traçabilité des décisions** majeures, la **compréhension du pipeline complet** (du code au déploiement), et la **transparence technique** vis-à-vis des enseignants et de l’équipe.

---

## 📘 Liste des ADR

0. [Architecture globale & pipeline MindfulSpace](./adr0-architecture-globale.md)  
1. [Hébergement : VPS Debian 13 + Docker](./adr1-hebergement-vps-docker.md)  
2. [Architecture logique : n-tiers](./adr2-architecture-n-tiers.md)  
3. [Stack technique : Next.js + NestJS + PostgreSQL](./adr3-stack-technique.md)  
4. [Monorepo avec pnpm workspaces](./adr4-monorepo-pnpm.md)  
5. [Reverse proxy & entrypoint : Traefik](./adr5-reverse-proxy-traefik.md)  
6. [CI/CD : GitLab CI sur runner Docker](./adr6-ci-cd-gitlab.md)  
7. [Sécurité & réseau : isolation, SSH, HTTPS](./adr7-securite-reseau.md)  
8. [Style d’API : REST + OpenAPI](./adr8-style-api-rest.md)  
9. [Base de données & migrations](./adr9-base-donnees-migrations.md)  
10. [Authentification & comptes](./adr10-authentification-comptes.md)  
11. [Stratégie de rendu Next : SSR + SSG/ISR](./adr11-strategie-rendu-next.md)  
12. [Conteneurisation : images « prod » multi-stage](./adr12-conteneurisation.md)  
13. [Secrets & configuration](./adr13-secrets-configuration.md)  
14. [Observabilité & santé : /health, logs, métriques](./adr14-observabilite-health.md)  
15. [Qualité : lint, format, tests](./adr15-qualite-tests.md)  
16. [PWA : périmètre offline & service worker](./adr16-pwa-offline.md)  
17. [Cap vers mobile : Capacitor (phase 2)](./adr17-capacitor-mobile.md)

---

### Structure du dossier

```
adr/
├── adr0-architecture-globale.md
├── adr1-hebergement-vps-docker.md
├── ...
├── adr17-capacitor-mobile.md
└── README.md
```

---

### À propos du projet

**MindfulSpace** est une application web dédiée au bien-être mental :  
suivi d’habitudes, méditations guidées, ressources éducatives, et communauté d’entraide.  

Le projet met en œuvre :
- une stack **Next.js + NestJS + PostgreSQL**,  
- un **monorepo TypeScript** géré par pnpm,  
- un **hébergement Dockerisé** sur **VPS Debian 13**,  
- un **reverse proxy Traefik** (TLS Let's Encrypt),  
- et un **pipeline CI/CD GitLab** automatisé (staging + production).

---

**Auteur :** Équipe MindfulSpace
**Année académique :** 2024 – 2025  
**HELMo – Département Informatique (Bloc 3)**
