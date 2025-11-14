# CONTRIBUTING (version détaillée) – MindfulSpace

Ce document explique **en profondeur** le workflow Git, la structure des branches,  
le CI/CD complet (verify → build → deploy), les règles internes, les hotfixes,  
et le processus de publication staging/production.

---

# 1. Organisation des branches

| Branche | Description |
|--------|-------------|
| `dev` | Branche d’intégration. Toutes les features y arrivent. |
| `main` | Branche stable. Déploiement automatique en **staging**. |
| `tag vX.Y.Z` | Déploiement automatique en **production**. |
| `feature/...` | Nouveaux développements. |
| `hotfix/...` | Correctifs urgents en production. |

🔒 **Protection activée sur `dev`, `main` et tous les tags v\***  
→ Push direct interdit → **Merge Request obligatoire**

---

# 2. Workflow de développement

## 2.1 Créer une branche de feature
```bash
git checkout dev
git pull
git checkout -b feature/nom-court
```

Développement → commit → push :
```bash
git push -u origin feature/nom-court
```

## 2.2 Merge Request vers `dev`
- au moins **1 review**
- CI **verte obligatoire**
- squash autorisé
- supprimer la branche après merge

---

# 3. Merge vers `main` (staging)

Quand `dev` est stable, ouvrir une MR `dev` → `main`.

Cela déclenche automatiquement :

## Pipeline staging

| Étape | Job | Description |
|-------|------|-------------|
| **Verify** | `verify:frontend` + `verify:api` | Build, compilation TS, Prisma generate (fake DB) |
| **Build** | Kaniko | Construction des images Docker `:staging` |
| **Deploy** | SSH → VPS | Mise à jour de `/srv/mindfulspace/staging` + `docker compose pull/up` |

## URLs de validation staging
- API : https://api.staging.mindfulspace.be/health  
- Frontend : https://staging.mindfulspace.be/

---

# 4. Mise en production (tag)

Avant de taguer :
```bash
git checkout main
git pull
```

Créer un tag :
```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

Cela déclenche :

## Pipeline production

| Étape | Description |
|--------|-------------|
| Verify | Compilation & checks |
| Build | Build Docker `:prod` via Kaniko |
| Deploy | Déploiement dans `/srv/mindfulspace/production` |

### URLs santé production
- API : https://api.mindfulspace.be/health  
- Frontend : https://mindfulspace.be/

---

# 5. Règles strictes de merge / review

- Pas d’auto-merge de ses propres MR
- CI doit être **verte**
- `main` → nécessite idéalement **2 reviewers**
- Les MR doivent expliquer :
  - ce qui a été modifié
  - comment tester
  - si elles impactent la DB (Prisma)

---
