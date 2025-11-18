# CONTRIBUTING – MindfulSpace

Merci de contribuer au projet **MindfulSpace**.  
Ce guide résume les règles essentielles pour travailler efficacement dans le projet.

---

## Branches principales

| Branche | Rôle |
|--------|------|
| `dev` | Intégration des features (peut casser) |
| `main` | Code stable → déployé en **staging** |
| `tag vX.Y.Z` | Version **production** |

Les branches `dev` et `main` sont protégées :  
aucun push direct, Merge Requests uniquement.

---

------------------------------------------------------------------------

## Règles Prisma : modifications du `schema.prisma` & migrations

Lorsque vous modifiez le fichier **`prisma/schema.prisma`**, vous devez
**OBLIGATOIREMENT** créer une migration Prisma.

### 1. Celui qui modifie le schéma → crée une migration

``` bash
npx prisma migrate dev --name nom_de_la_migration
```

Cela :

-   génère une migration dans `prisma/migrations`
-   met à jour la base locale
-   garantit que la CI/CD pourra appliquer la migration en staging /
    production

**La migration doit être commitée dans votre branche.**

---

### 2. Tous les autres développeurs → appliquent les migrations

Quand une branche contenant des migrations est mergée :

``` bash
git pull
npx prisma migrate dev
```

Cela met votre base locale en phase avec le repo.

Astuce : si problème ou base locale trop sale

``` bash
npx prisma migrate reset
```

---

### ⚠️ Important

-   **NE JAMAIS** modifier directement la DB en staging ou production.
-   **NE PAS supprimer / renommer manuellement** un dossier dans
    `prisma/migrations`.
-   La CI utilise `prisma migrate deploy` → elle applique **toutes** les
    migrations dans l'ordre.

---

## Règle essentielle : garder les branches à jour avec `main`

Afin d’éviter les conflits tardifs et les divergences importantes dans le code,  
chaque développeur est responsable de **maintenir sa branche feature synchronisée avec `main`**.

À faire :

- avant d’ouvrir une Merge Request vers `dev`,  
- avant de pousser un travail important,  
- après chaque session de développement,  
- dès qu’un merge est effectué dans `main`.

### Mise à jour recommandée (rebase)

```bash
git fetch origin
git checkout feature/nom-court
git rebase origin/main
git push --force-with-lease
```

### Alternative (merge)

```bash
git fetch origin
git checkout feature/nom-court
git merge origin/main
git push
```

---

## En cas d’erreur : marche à suivre si une MR crée des conflits (important)

Si la feature poussée n'était pas à jour (= non respect de la règle ci-dessus !) et était en retard sur `main`, il se peut qu’une Merge Request affiche des conflits.  
GitLab bloque alors automatiquement le merge.

Voici la procédure pour corriger votre branche :

### 1. Mettre à jour la branche locale

```bash
git fetch origin
git checkout feature/nom-court
```

### 2. Rebase sur la dernière version de `main`

```bash
git rebase origin/main
```

### 3. Résoudre les conflits

Dans les fichiers indiqués :

- ouvrir les fichiers contenant `<<<<<<<`, `=======`, `>>>>>>>`
- garder uniquement le code souhaité
- supprimer les marqueurs de conflit

Puis :

```bash
git add .
git rebase --continue
```

### 4. Pousser les corrections

Comme un rebase réécrit l’historique, il faut :

```bash
git push --force-with-lease
```

### 5. Retour à la Merge Request

- GitLab relance la CI automatiquement  
- Si la CI est valide et qu’il n’y a plus de conflits  
  → la MR peut être mergée

Cette procédure garantit que seules des branches propres et synchronisées entrent dans `dev` puis `main`.

---

## Workflow de développement

### 1. Créer une feature

```bash
git checkout dev
git pull
git checkout -b feature/nom-court
git push -u origin feature/nom-court
```

Créer ensuite une Merge Request vers `dev`.

---

## Merge Request vers `dev`

- Une revue minimum  
- CI **verte obligatoire**  
- Squash autorisé  
- Supprimer la branche source après merge

---

## Staging : MR `dev` → `main`

Déploiement automatique sur **staging**.

URLs santé :  
- API : https://api.staging.mindfulspace.be/health  
- Front : https://staging.mindfulspace.be/

---

## Production : Tag depuis `main`

```bash
git checkout main
git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

Déploiement automatique en **production**.

URLs santé :  
- API : https://api.mindfulspace.be/health  
- Front : https://mindfulspace.be/

---

## Hotfix (production)

1. Créer une branche depuis `main` :

```bash
git checkout -b hotfix/bug
```

2. Merge Request vers `main`  
3. Tag pour la mise en production  
4. Synchroniser `main` → `dev`

---

## Résumé rapide

```
feature → MR dev → merge
dev → MR main → staging → merge
main → tag → production
hotfix depuis main → main → tag → dev
```

Merci de suivre ces bonnes pratiques pour maintenir un workflow stable, lisible et cohérent.
