# CONTRIBUTING – MindfulSpace

Merci de contribuer au projet **MindfulSpace** !  
Ce guide résume les règles essentielles pour travailler efficacement dans le projet.

---

## 🚀 Branches principales

| Branche | Rôle |
|--------|------|
| `dev` | Intégration des features (peut casser) |
| `main` | Code stable → déployé en **staging** |
| `tag vX.Y.Z` | Version **production** |

🔒 `dev` et `main` sont protégées :  
→ **aucun push direct**, **MR uniquement**.

---

## 🧩 Workflow de développement

### 1. Créer une feature
```bash
git checkout dev
git pull
git checkout -b feature/nom-court
```
Puis :
```bash
git push -u origin feature/nom-court
```

Créer une Merge Request vers `dev`.

---

## 🔄 Merge Request vers `dev`
- 1 review minimum  
- CI **verte obligatoire**  
- Squash autorisé  
- Une fois mergée, supprimer la branche source

---

## 📦 Staging : MR `dev` → `main`
→ Déploiement automatique sur **staging**.

URLs santé :  
- API : https://api.staging.mindfulspace.be/health  
- Front : https://staging.mindfulspace.be/

---

## 🚀 Production : Tag depuis `main`

```bash
git checkout main
git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

→ Déploiement automatique en **production**.

URLs santé :  
- API : https://api.mindfulspace.be/health  
- Front : https://mindfulspace.be/

---

## 🛠 Hotfix (production)
1. Branche depuis `main` :
   ```bash
   git checkout -b hotfix/bug
   ```
2. MR vers `main`
3. Tag → production
4. Puis merge de `main` → `dev`

---

## 📘 Résumé rapide

```
feature → MR dev → merge
dev → MR main → staging → merge
main → tag → production
hotfix depuis main → main → tag → dev
```

Merci de suivre ces bonnes pratiques pour garder un projet fiable et cohérent.
