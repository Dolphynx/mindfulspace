# CONTRIBUTING – MindfulSpace

Merci de contribuer au projet **MindfulSpace** !  
Voici les règles essentielles à suivre pour garder un repo propre et des déploiements fiables.

---

## Branches principales

| Branche | Rôle |
|----------|------|
| `dev` | Intégration de toutes les features |
| `main` | Code stable, déployé en staging |
| `tag (vX.Y.Z)` | Version déployée en production |

---

## Cycle de développement

1. Crée une branche à partir de `dev` :
   ```bash
   git checkout dev
   git pull
   git checkout -b feature/<nom-court>
   ```
2. Code, commit, puis push :
   ```bash
   git push -u origin feature/<nom-court>
   ```
3. Ouvre une **Merge Request** (`feature/...` → `dev`)
   - Description claire (objectif, détails, tests)
   - CI doit être verte
   - Min. 1 review avant merge

4. Pour une release staging : MR `dev` → `main`  
   → Merge = déploiement **staging**

5. Pour la production : créer un **tag sur `main`**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   → CI déploie en **production**.

---

## Hotfix

1. Créer à partir de `main` :
   ```bash
   git checkout main
   git checkout -b hotfix/<nom>
   ```
2. Corriger → MR `hotfix/...` → `main`
3. Tag pour prod → merge dans `dev`

---

## Règles GitLab

- `main` & `dev` : protégées → merge uniquement via MR
- `v*` : tags protégés (maintainers only)
- MR requiert CI verte et au moins une review

---

## Rappel express

- feature → dev → main → tag  
- MR obligatoire  
- CI verte avant merge  
- tag = prod uniquement  
- hotfix depuis main puis retour vers dev
