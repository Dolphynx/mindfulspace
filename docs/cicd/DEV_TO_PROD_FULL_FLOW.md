# MindfulSpace – Guide technique complet du flux Dév → Prod

## 0. Vue d’ensemble

**Stack choisie** :  
- VPS Debian 13  
- Docker (3 containers : Postgres / API NestJS / Front Next.js)  
- Traefik comme reverse-proxy  
- Monorepo PNPM  
- GitLab CI/CD avec Kaniko  
- Prisma pour DB + migrations + seed  
- Staging + Production  

Ce document explique **toute la chaîne**, du développement à la production, en détaillant les mécanismes internes (Docker, Traefik, GitLab, CI/CD, réseaux, registry, santé, migrations…).

---

# 1. Structure Git & Flux de développement

## 1.1 Stratégie de branches

- **feature/*** → développement d’une fonctionnalité  
- **dev** → intégration (facultatif mais utilisé dans ton workflow)  
- **main** → stable, prête pour la prod  
- **tags** → déclenchent les déploiements production

## 1.2 Monorepo PNPM

- Racine : `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`  
- Apps :  
  - `apps/frontend-next`  
  - `apps/api-nest`  
- `node_modules` unique à la racine via symlinks PNPM

---

# 2. Docker – Comprendre en profondeur

## 2.1 Concepts internes

- **Image** : snapshot immuable composée de *layers*
- **Container** : process isolé via *namespaces Linux* (PID, réseau, filesystem…)
- **Registry** : GitLab Container Registry
- **Network** :  
  - `internal` : API ↔ DB  
  - `web` : Traefik ↔ API / Front  
- **Volume** : persistance des données PostgreSQL

Docker utilise :
- **Namespaces** (pid, net, mount…) pour isoler chaque container  
- **cgroups** pour limiter ressources  
- **UnionFS** (overlay2) pour les layers d’image  

## 2.2 Dockerfile Front-end (Next.js)

*(Version complète insérée comme fournie)*

## 2.3 Dockerfile API NestJS

Même logique : multi-stage (build + runtime), production légère, port exposé, etc.

---

# 3. docker-compose (VPS Staging)

*(Version complète comme fournie)*

### 3.1 Réseaux
- `web` : extérieur, utilisé par Traefik  
- `internal` : isolement API/DB

### 3.2 service db (Postgres)
- Volume `db_data_staging`
- Healthcheck avec `pg_isready`

### 3.3 service api (NestJS)
- Connecté aux réseaux `internal` + `web`
- Labels Traefik (routing + TLS)
- Healthcheck HTTP `/health`

### 3.4 service frontend (Next.js)
- Exposé via Traefik (`staging.mindfulspace.be`)

---

# 4. Traefik – Comment exactement ça fonctionne

## 4.1 Provider Docker

Traefik écoute :
- labels Docker
- évènements runtime
- ports mappés

Il génère dynamiquement :
- routers  
- services  
- middlewares  

## 4.2 Chaîne complète d'une requête HTTPS

1. DNS → IP VPS  
2. Arrive sur port 443 (Traefik)  
3. Vérification du Host  
4. Matche un router :  
   `traefik.http.routers.frontend-staging.rule=Host("staging.mindfulspace.be")`  
5. Router → service → container:port  
6. Connexion via réseau `web`  
7. Retour réponse

---

# 5. GitLab CI/CD – Concepts

## 5.1 Pipeline

- **verify**  
- **build**  
- **deploy**

## 5.2 Runner Docker

Chaque job :
- tourne dans un container éphémère  
- utilise une image Docker (ex: node:20-alpine)

## 5.3 Variables GitLab

- Variables CI automatiques  
- Variables secrètes (SSH_KEY, DB_URL, etc.)

---

# 6. .gitlab-ci.yml – Décomposition complète

*(Version intégrale déjà fournie dans ton message précédent — recopiée ici dans le fichier)*

## 6.1 Stage verify

### verify:frontend
- build Next.js  
- vérifie que le front compile

### verify:api
- build NestJS  
- vérifie que l’API compile

## 6.2 Stage build – Kaniko

### Pourquoi Kaniko ?
- Pas besoin de Docker dans la CI  
- Plus sécurisé  
- Compatible runners non privilégiés  

### build:images
- Génère les images frontend + API  
- Tag selon environnement (`staging` ou `prod`)  
- Passe `NEXT_PUBLIC_API_URL` au Dockerfile

## 6.3 Stage deploy – connexion SSH

Base :
- image alpine  
- installation ssh & curl  
- écriture du fichier `~/.ssh/config`  
- écriture des secrets (api.env, db.env)

### deploy:staging
- construit `api.env`  
- extrait mot de passe DB depuis l’URL  
- `docker compose pull && up -d`  
- migrations Prisma + seed  
- checks HTTP avec retries  

### deploy:prod
- même logique, sans seed  
- checks santé sur URLs prod

---

# 7. Prisma – Migrations & Seed

## 7.1 Local
- `npx prisma migrate dev`  
- `npx prisma db seed`

## 7.2 Staging
- migrations  
- seed (données de tests)

## 7.3 Production
- migrations uniquement  
- jamais de seed

---

# 8. Flux complet de A → Z

## 8.1 Développement

1. branche `feature/*`  
2. dev local  
3. push → verify  
4. MR → verify  
5. merge dans `main`  
6. build images → deploy staging  
7. recette  
8. tag → deploy prod

## 8.2 Hotfix

1. `hotfix/*`  
2. merge → staging  
3. tag → prod

---

# 9. Sécurité

### SSH
- user `deploy`  
- clé privée côté GitLab  
- StrictHostKeyChecking=no (à revoir en prod)

### Secrets
- uniquement variables protégées GitLab  
- fichiers `.env` générés sur le VPS (chmod 600)

### Réseau
- DB uniquement en **internal**  
- API et front seulement via Traefik

---

# 10. Résumé ultra condensé

- **Dev** → PNPM monorepo  
- **CI verify** → build front + API  
- **CI build** → Kaniko build images  
- **CI deploy** → SSH → compose pull/up  
- **Staging** : migrations + seed  
- **Prod** : migrations  
- **Traefik** : reverse proxy dynamique auto-généré  
- **Sécurité** : utilisateur deploy, SSH, secrets GitLab

---

Fin du document.
