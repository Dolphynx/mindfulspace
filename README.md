# MindfulSpace

Application web de suivi du bien-être mental et de méditation guidée.

Projet étudiant (HELMo – Bloc 3 Framework & Archilog 2025).  
Architecture **n-tiers** déployée sur un **VPS Debian 13**, conteneurisée avec **Docker** et orchestrée via **Traefik**.  
Déploiement automatisé grâce à **GitLab CI/CD**.

Stack principale : **Next.js + NestJS + PostgreSQL**, organisée en **monorepo PNPM**.

---

## ⚙Stack technique

- **Frontend** : Next.js (TypeScript, TailwindCSS)
- **Backend** : NestJS (TypeScript)
- **Base de données** : PostgreSQL 16
- **Reverse proxy** : Traefik v3 (HTTPS, dashboard, routing dynamique)
- **CI/CD** : GitLab CI (runner Docker)
- **Hébergement** : VPS Debian 13
- **Environnement** : Docker Compose (staging & production)

---

## Arborescence du monorepo

```
mindfulspace/
├── apps/
│   ├── frontend-next/     → Application Next.js (interface utilisateur)
│   └── api-nest/          → API NestJS (backend)
│
├── packages/              → Librairies partagées (utils, UI, config, etc.)
│
├── docs/                  → Documentation technique (archi, ADR, gestion projet)
│
├── pnpm-workspace.yaml
├── docker-compose.yml
├── .gitlab-ci.yml
└── README.md
```
> PNPM workspaces : toutes les dépendances sont gérées à la racine.

---

## Installation locale

### Prérequis
- Node.js ≥ 18
- PNPM installé globalement (`npm i -g pnpm`)
- Docker (optionnel pour base de données locale)

### Étapes
```bash
git clone https://git.helmo.be/q230306/mindfulspace.git
cd mindfulspace
pnpm install
```

### Commandes utiles

| Commande | Description |
|-----------|-------------|
| `pnpm -r dev` | Lancer front + back en développement |
| `pnpm --filter frontend-next dev` | Lancer uniquement le frontend |
| `pnpm --filter api-nest start:dev` | Lancer uniquement l’API |
| `pnpm -w lint` | Vérifier le lint sur tout le monorepo |
| `pnpm -r build` | Construire toutes les apps |

---

## Docker local (développement)

Le projet est prêt pour Docker :

```bash
docker compose -f docker-compose.dev.yml up --build
```

Lance :
- le frontend Next.js
- le backend NestJS
- la base PostgreSQL

---

## Workflow Git & CI/CD

Le projet suit un **Gitflow light** avec intégration continue et déploiements automatisés.

| Type | Source | Cible | Effet |
|------|---------|--------|-------|
| Nouvelle feature | `feature/...` | `dev` | Merge Request + build check |
| Release staging | `dev` | `main` | Déploiement staging automatique |
| Release production | tag `vX.Y.Z` sur `main` | – | Déploiement production |
| Hotfix | `hotfix/...` (depuis `main`) | `main` + `dev` | Correction critique |

Détails complets :  
[`docs/project-management/README_Git_Workflow.md`](./docs/project-management/README_Git_Workflow.md)

---

## CI/CD (GitLab)

### Pipeline automatisé

| Événement Git | Étape CI déclenchée |
|----------------|---------------------|
| Push sur `feature/...` ou MR → `dev` | Build check (tests, lint, build) |
| Merge `dev` → `main` | Build images + déploiement **staging** |
| Création d’un tag `vX.Y.Z` | Déploiement **production** |
| MR `hotfix/...` → `main` | Correctif + staging auto + tag possible |

Les jobs CI/CD sont définis dans `.gitlab-ci.yml` et exécutés par un **runner Docker**.  
Les images sont stockées dans le **registry GitLab** avant déploiement sur le VPS.

---

## Déploiement

### Environnement staging
- Déploiement automatique à chaque merge sur `main`
- Routage HTTPS géré par Traefik
- URL : https://staging.mindfulspace.be

### Environnement production
- Déploiement déclenché par **tag Git**
```bash
git tag v1.0.0
git push origin v1.0.0
```
- GitLab CI déploie automatiquement la version en **production**
- URL : https://mindfulspace.be

---

## Versioning sémantique

Nous utilisons **SemVer** :
```
vMAJOR.MINOR.PATCH
```

| Exemple | Description |
|----------|-------------|
| `v1.0.0` | Première release stable |
| `v1.1.0` | Nouvelles features |
| `v1.1.1` | Correction de bug / hotfix |

> Tags `v*` protégés sur GitLab (création limitée aux Maintainers).

---

## Documentation

- Architecture & ADR → [`docs/archi/`](./docs/archi)
- Gestion de projet → [`docs/project-management/`](./docs/project-management)
- Workflow Git complet → [`docs/project-management/README_Git_Workflow.md`](./docs/project-management/README_Git_Workflow.md)

---

## Notes pour l’équipe

- Toujours utiliser **PNPM**, jamais `npm` ou `yarn`.
- Pas de commit direct sur `dev` ou `main` → **Merge Request obligatoire**.
- Faire un `pnpm install` après chaque `git pull`.
- Les tags sont réservés au déploiement production.

> “Tout déploiement prod vient d’un tag stable validé sur staging.”
