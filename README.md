# MindfulSpace

Application web de bien-être mental et de pleine conscience.  
Projet académique HELMo – Framework / Archilog.

![NextJS](https://img.shields.io/badge/Next.js-black)
![NestJS](https://img.shields.io/badge/NestJS-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue)

---

## Objectif

L’application permet aux utilisateurs de :
- suivre leurs habitudes de bien-être (sommeil, sport, méditation),
- accéder à des méditations guidées,
- consulter des ressources éducatives (articles, vidéos, podcasts),
- interagir dans une communauté via forum / groupes.

---

## Architecture technique

| Composant | Technologie                    | Description |
|------------|--------------------------------|-------------|
| Frontend | Next.js (React 18 + TypeScript) | Interface utilisateur |
| Backend API | NestJS + Prisma                | Logique métier & accès DB |
| Base de données | PostgreSQL 16-alpine           | Données utilisateurs, contenu |
| Conteneurisation | Docker Compose                 | Orchestration multi-service |
| CI/CD | GitLab CI                      | Build, test, déploiement auto |
| OS cible | Debian 12              | VPS / environnements locaux |

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

### 1. Prérequis
Assurez-vous d’avoir :
- Node.js ≥ 20
- pnpm ≥ 9
- Docker ≥ 28.5.1
- Docker Compose v2
- Git

Vérifiez vos versions :
```bash
node -v
pnpm -v
docker -v
docker compose version
```

---

### 2. Cloner le dépôt
```bash
git clone git@gitlab.helmo.be:q230306/mindfulspace.git
cd mindfulspace
```

---

### 3. Configurer les environnements

Créer deux fichiers `.env` et `.env.local`.

#### 1. `/apps/api-nest/.env`
```env
DATABASE_URL="postgresql://ms_user:ms_password@localhost:5432/mindfulspace_local"
PORT=3001

(...)
```

Toutes les variables nécessaires se trouvent dans le fichier `/apps/api-nest/.env.example`.


#### 2. `/apps/frontend-next/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

### 4. Installation des dépendances
```bash
pnpm install
```
> Ce dépôt est un monorepo avec deux applications :
> - `apps/api-nest`
> - `apps/frontend-next`

---

### 5. Docker : structure actuelle

| Fichier                  | Rôle | Description |
|--------------------------|------|-------------|
| `docker-compose.dev.yml` | Utilisé | Lance les trois services : API, frontend et base de données |
| `docker-compose.db.yml`  | Utilisé | Lance uniquement la base de données pour le dev local |

Remarque : sous Windows il faut installer Docker Desktop (et le composant Linux) et il doit tourner pour lancer les containers (la DB notamment).

---

### 6. Lancer uniquement la base de données

```bash
docker compose -f docker-compose-db.yml up -d
```

Cela crée un conteneur PostgreSQL :
- nom : `mindfulspace_db_local`
- base : `mindfulspace_local`
- user : `ms_user`
- password : `ms_password`

---


### 7. Initialiser la base de données

Depuis le dossier `apps/api-nest` :
```bash
pnpm prisma migrate deploy
pnpm prisma db seed
```

---

### 8. Lancer les applications sans Docker

#### API (NestJS)
```bash
cd ./apps/api-nest
pnpm run start:de
```
ou
```bash
pnpm --filter .\apps\api-nest run start:dev
```
API disponible sur [http://localhost:3001](http://localhost:3001)

#### Frontend (Next.js)
```bash
cd ./apps/frontend-next
pnpm dev
```
ou
```bash
pnpm --filter .\apps\frontend-next run dev
```
Frontend disponible sur [http://localhost:3000](http://localhost:3000)

---

### 9. Lancer l’ensemble via Docker Compose

Depuis la racine :
```bash
docker compose up --build
```

Cela démarre 3 conteneurs :
- Frontend → http://localhost:3000  
- API → http://localhost:3001  
- PostgreSQL → port 5432  

---

## Configuration WebStorm pour lancer tout le projet

### Objectif
Avoir une configuration unique dans **WebStorm** permettant de lancer :
- la base de données (Docker),
- l’API NestJS en mode dev,
- le frontend Next.js en mode dev,
avec hot reload (HMR) pour le front et l’API.

### Étapes à suivre

#### 1. Créer une configuration Docker
- Type : **Docker Compose**
- Nom : `Dev: DB (Docker)`
- Fichier : `./docker-compose-db.yml`
- Service : `db`
- Options : cocher **Store as project file**  
- Laisser `Attach to: None`

#### 2. Créer deux configurations npm
**A. Dev: API**
- Type : **npm**
- Nom : `Dev: API`
- Package.json : `apps/api-nest/package.json`
- Command : `run`
- Script : `start:dev`
- Package manager : `pnpm`
- Node interpreter : `Project node`
- Cocher **Allow multiple instances** et **Store as project file**

**B. Dev: Frontend**
- Type : **npm**
- Nom : `Dev: Frontend`
- Package.json : `apps/frontend-next/package.json`
- Command : `run`
- Script : `dev`
- Package manager : `pnpm`
- Node interpreter : `Project node`
- Cocher **Allow multiple instances** et **Store as project file**

#### 3. Créer une configuration Compound
- Type : **Compound**
- Nom : `Dev: Front + API + DB`
- Ajouter :
  - `Docker 'Dev: DB (Docker)'`
  - `npm 'Dev: API'`
  - `npm 'Dev: Frontend'`
- Cocher **Store as project file**

#### 4. Lancer
- Choisir la configuration `Dev: Front + API + DB`
- Cliquer sur ▶️ Run  
  → Les trois services démarrent dans le bon ordre.

---

## Dépannage

Si erreur `tsx` ou `prisma not found` :
```bash
pnpm install
pnpm prisma generate
```

Pour vider les conteneurs et volumes :
```bash
docker compose down -v
```

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

- Générale : [`./docs/`](./docs/README.md)
- Architecture & ADR → [`docs/archi/`](./docs/cicd/DEV_TO_PROD_FULL_FLOW.md)
- CI/CD → [`docs/cicd/`](./docs/archi/README.md)
- Gestion de projet → [`docs/project-management/`](./docs/project-management/README.md)
- Workflow Git complet → [`docs/project-management/README_Git_Workflow.md`](./docs/project-management/README_Git_Workflow.md)
- Frontend → [`docs/frontend/`](./docs/frontend/index.html)

---

## Auteurs
Projet MindfulSpace – HELMo Liège  
Développement réalisé par les étudiants de 3e année – Cours Framework & Archilog.

Eve HOUSSA - Jules CORNETTE - Adrien WATRELOT - Sébastien GOUVARS
