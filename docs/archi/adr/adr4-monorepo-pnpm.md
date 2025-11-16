# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 16/10/2025  
**Statut :** accepté  
**Auteur :** Équipe MindfulSpace

# ADR 4 : Monorepo géré avec PNPM

## Status  
Accepted

## Context  
Le projet comporte deux applications étroitement liées et qui doivent évoluer ensemble :

- un **frontend Next.js**,  
- une **API NestJS**,  

Les deux reposent sur TypeScript, partagent des types, et doivent être déployées dans le même pipeline.  
Avoir deux dépôts séparés compliquerait :

- la synchronisation front/back,  
- la gestion des dépendances,  
- la cohérence des versions,  
- les workflows CI/CD (2 pipelines séparés),  
- la construction Docker (duplication des installations npm/pnpm),  
- les migrations Prisma et l’évolution du schéma.

Le pipeline GitLab CI/CD (verify → build → deploy), les Dockerfiles multi-stage, et Kaniko s’intègrent particulièrement bien à une structure monorepo PNPM.

## Decision  
Nous adoptons un **monorepo** géré par **PNPM Workspaces**.

### Structure retenue  
- Racine :  
  - `package.json` (scripts globaux)  
  - `pnpm-lock.yaml` (verrouillage unique des dépendances)  
  - `pnpm-workspace.yaml` (déclaration des apps)  
  - `tsconfig.base.json` (configuration TypeScript partagée)  
- Applications :  
  - `apps/frontend-next` (Next.js 14)  
  - `apps/api-nest` (NestJS)  
- Une seule installation des dépendances :  
  ```
  pnpm install
  ```

### Raisons principales  
- **Mutualisation des dépendances** via un seul `node_modules` → coûts d’installation fortement réduits.  
- **Types partagés** front/back facilités (DTO, interfaces).  
- **Docker multi-stage optimisé** :  
  - couche `pnpm install` mise en cache,  
  - build Kaniko plus rapide et reproductible.  
- **CI/CD simplifié** :  
  - un seul repo à cloner,  
  - verify/build/deploy fonctionnent sur un ensemble cohérent,  
  - tagging staging/prod géré uniformément.  
- **Cohésion technique** : front et back évoluent au même rythme.

## Consequences

### Avantages  
- Réduction du temps de build (grâce au store pnpm + monorepo).  
- Moins de duplication, moins de divergence possible.  
- Meilleure productivité : une seule source de vérité.  
- Pipeline plus clair (un seul projet, un seul CI/CD).  
- Intégration parfaite avec Prisma (schema unique, migrations centralisées).  
- Configuration uniforme pour Docker, Traefik et Kaniko.

### Points d'attention  
- Le monorepo nécessite une convention stricte pour organiser les apps.  
- PNPM Workspaces demande une compréhension correcte des symlinks & du hoisting.  
- Tout changement dans les manifestes racine (package.json / workspace) invalide les caches Docker.

## Alternatives rejetées  
### Polyrepo (dépôts séparés pour front et back)  
Rejeté car :  
- pipelines indépendants → plus compliqués,  
- versioning incohérent,  
- duplication des dépendances,  
- synchronisation front/back fragile,  
- moins adapté à Docker multi-stage et à Kaniko.

---

Le monorepo PNPM est officiellement adopté comme **structure standard** du projet MindfulSpace, car il maximise la cohérence, la performance des builds et la simplicité du CI/CD.
