# CONTRIBUTING – MindfulSpace

Merci de contribuer au projet **MindfulSpace** !  
Ce document définit les bonnes pratiques de développement, de revue et de déploiement.  
Objectif : garder un dépôt propre, collaboratif et des déploiements fiables.

---

## Branches principales

| Branche | Rôle |
|----------|------|
| `dev` | Intégration de toutes les fonctionnalités en cours (peut casser) |
| `main` | Code stable et testé, déployé en **staging** |
| `tag (vX.Y.Z)` | Version déployée en **production** |

Les branches `main` et `dev` sont **protégées** :  
→ aucune modification directe (`git push` interdit)  
→ seules les **Merge Requests (MR)** sont autorisées

---

## Cycle de développement

### 1. Créer une nouvelle feature
À partir de `dev` :
```bash
git checkout dev
git pull
git checkout -b feature/<nom-court>
```

Développe, committe, puis pousse :
```bash
git push -u origin feature/<nom-court>
```

Crée ensuite une **Merge Request** (`feature/...` → `dev`) :
- Description claire (objectif, changements, comment tester)
- CI doit être **verte** avant merge
- Minimum **1 review d’un autre membre** avant merge

---

### 2. Préparer une release (staging)
Quand `dev` est stable :
- Ouvre une **Merge Request** `dev` → `main`
- Revue collective (2 personnes si possible)
- Merge via GitLab (jamais de `git push main`)
- Le pipeline déploie automatiquement sur **staging**

---

### 3. Déploiement en production
Une fois validé sur staging :
```bash
git checkout main
git pull
git tag v1.0.0
git push origin v1.0.0
```
La CI détecte le tag et déploie automatiquement la version **production**.

> Les tags `v*` sont protégés : seuls les **Maintainers** peuvent les créer.

---

## Hotfix (bug critique en production)

1. Créer une branche depuis `main` :
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/<nom>
   ```
2. Corriger le bug, commit, push.
3. Créer une **MR `hotfix/...` → `main`**
4. Merge après validation : staging se redéploie.
5. Créer un **tag** (ex. `v1.0.1`) → déploiement production.
6. Réintégrer le correctif dans `dev` :
   ```bash
   git checkout dev
   git pull
   git merge main
   git push origin dev
   ```

---

## Validation et revue de Merge Requests

> *Pas de merge sans review, pas de review sans build vert.*

- **Toute MR** doit être validée par **au moins une autre personne**.  
  → commentaire explicite dans la MR : “OK pour merge” ou “Approved by @username”.
- Personne ne merge sa propre MR sans validation.
- **CI rouge = merge interdit** jusqu’à correction.
- Les MR vers `main` nécessitent **au moins deux regards** (validation collective).
- Une fois mergée :
  - coche “Supprimer la branche source”
  - supprime la branche locale correspondante (`git branch -d feature/...`)

---

## Bonnes pratiques GitLab

- ✅ **Les pipelines doivent réussir avant merge** (règle activée dans le projet)
- ✅ **Supprimer la branche source après merge**
- ✅ **Squash autorisé** (pour nettoyer les commits avant merge)
- 🚫 **Aucun push direct** sur `dev` ou `main`
- ✅ **Merge Requests uniquement**
- **CI/CD** :
  - `main` → déploiement **staging**
  - `tag vX.Y.Z` → déploiement **production**

---

## Rappel express

| Étape | Source | Cible | Effet |
|--------|----------|----------|--------|
| Dév feature | `feature/...` | `dev` | Build check CI |
| Release staging | `dev` | `main` | Déploiement staging |
| Release prod | `main` (tag `vX.Y.Z`) | – | Déploiement production |
| Hotfix | `hotfix/...` (depuis `main`) | `main` + `dev` | Correctif critique |

---

**En résumé :**
> - MR obligatoire  
> - CI verte avant merge  
> - 1 review minimum  
> - Pas d’auto-merge  
> - `main` = staging, `tag` = production  
> - Hotfix part de `main`, revient vers `main` puis `dev`
