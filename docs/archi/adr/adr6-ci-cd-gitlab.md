# MindfulSpace – Architecture Decision Record

# ADR 6 : Intégration, build Docker et déploiement continu avec GitLab CI/CD

## Status
Accepted

## Context
L’équipe doit pouvoir déployer l’application de manière **fiable**, **reproductible**, et **automatisée** sur deux environnements distincts :

- **staging** (tests internes)
- **production** (tags Git)

Le projet repose sur :

- Un **monorepo PNPM** (API NestJS + Front Next.js)
- Un **VPS Debian** avec Docker Engine
- **Traefik** comme reverse‑proxy HTTPS
- **Prisma** pour les migrations
- Le **GitLab Container Registry** pour les images Docker
- Deux Dockerfiles multi‑stage pour API et Frontend

Le pipeline CI/CD doit assurer :

- la compilation des services,
- la construction des images Docker (sans Docker‑in-Docker),
- le tag staging/prod automatique,
- le déploiement via SSH,
- la génération des environnements (`api.env`, `db.env`),
- l’application des migrations Prisma,
- les checks de santé HTTP.

---

# 1. VERIFY

Objectif : valider que le code compile avant tout déploiement.

Deux jobs :

- `verify:frontend` → build Next.js
- `verify:api` → build NestJS

Déclencheurs :

- toutes les **merge requests**,
- toutes les **branches sauf `main`**.

Cela garantit que `main` reste toujours déployable.

---

# 2. BUILD (Kaniko + Docker multi‑stage)

## Objectifs
- Construire des images Docker reproductibles.
- Éviter Docker‑in‑Docker → utiliser **Kaniko**, plus sûr.
- Taguer automatiquement staging/prod.

## Dockerfiles multi‑stage

### API NestJS
Étape build :

- installation deps monorepo
- `prisma generate`
- `nest build`

Étape runtime :

- image Node 20 Alpine minimale
- copie du dossier `dist/`
- **CMD :** `node apps/api-nest/dist/src/main.js`

### Frontend Next.js
Étape build :

- installation deps
- `pnpm build`
- injection des variables NEXT_PUBLIC_* via `--build-arg`

Étape runtime :

- image Node 20 Alpine
- **CMD :** `pnpm start`

## Stratégie de tagging automatique

| Contexte pipeline | Tags appliqués |
|-------------------|----------------|
| commit sur `main` | `api:staging`, `frontend:staging` |
| tag Git (vX.Y.Z)  | `api:prod`, `frontend:prod` |

## Build ARG pour frontend
Injection automatique via CI :

```
NEXT_PUBLIC_API_URL=https://api.staging.mindfulspace.be
```

ou

```
NEXT_PUBLIC_API_URL=https://api.mindfulspace.be
```

---

# 3. DEPLOY (SSH + Docker Compose)

## Déclenchement
- `deploy:staging` → commit sur `main`
- `deploy:prod` → pipeline déclenché par **tag**

## Étapes

1. Connexion SSH au VPS via clé CI **SSH_KEY**
2. Création/mise à jour du dossier :
    - `/srv/mindfulspace/staging`
    - `/srv/mindfulspace/prod`
3. Génération côté serveur :
    - `api.env` → `DATABASE_URL=...`
    - `db.env` → extraction du mot de passe Postgres
4. Mise à jour des services :
   ```
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
5. Prisma :
    - staging → `migrate deploy` + `db seed`
    - production → `migrate deploy` (jamais de seed)
6. Vérification automatique :
    - `curl --retry 10 --retry-delay 5 --retry-all-errors ...`

---

# 4. Reverse Proxy & HTTPS (Traefik)

Traefik est utilisé pour exposer uniquement les services publics et gérer le HTTPS.

### Configuration retenue

- Traefik écoute sur **80** et **443**
- Certificats automatiques **Let’s Encrypt**
- Un réseau Docker **`web`** partagé :
    - prod → `mindfulspace.be`, `api.mindfulspace.be`
    - staging → `staging.mindfulspace.be`, `api.staging.mindfulspace.be`
- Le routage repose sur les **labels Docker** dans chaque service.
- Services internes (`db`) uniquement accessibles via le réseau Docker `internal`.

---

# 5. Organisation des environnements

## Staging
Déploiement automatique à chaque commit sur `main`.

Répertoire :

```
/srv/mindfulspace/staging
```

## Production
Déploiement uniquement via **tag Git**.

Répertoire :

```
/srv/mindfulspace/prod
```

Chaque environnement contient :

- `docker-compose.yml`
- `api.env` et `db.env`
- ses propres volumes Docker (dont PostgreSQL)

---

# 6. Sécurité

- Secrets stockés dans des **variables GitLab masquées + protégées**
- Utilisateur VPS `deploy` membre du groupe `docker`
- Aucun secret versionné dans le dépôt
- Réseaux Docker isolés (`web` public, `internal` privé)

---

## Consequences

### Avantages

- Pipeline entièrement automatique (verify → build → deploy)
- Séparation claire staging/production
- Builds Docker multi-stage optimisés
- Zéro Docker‑in‑Docker → usage de Kaniko
- HTTPS automatique via Traefik
- Contrôle strict des migrations Prisma
- Très bonne robustesse grâce aux checks HTTP finaux

## Points d’attention

- Les migrations Prisma doivent rester rétro‑compatibles
- Les variables CI doivent être maintenues correctement
- Les Dockerfiles doivent suivre la structure du monorepo PNPM

---

## Conclusion

Cette architecture CI/CD constitue le **socle officiel et standardisé** du déploiement de MindfulSpace :

- robuste,
- sécurisée,
- reproductible,
- automatisée,
- parfaitement intégrée à Docker, Traefik, Prisma et GitLab.

Elle est **acceptée et adoptée** pour tous les développements futurs.
