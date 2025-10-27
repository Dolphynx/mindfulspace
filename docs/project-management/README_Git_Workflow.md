# Workflow Git – MindfulSpace

Ce document décrit **comment l’équipe travaille avec Git et GitLab** pour développer, relire et déployer le projet **MindfulSpace**.
Notre objectif est d’avoir un processus simple, propre et fiable pour éviter les conflits, les bugs en production et les déploiements accidentels.

---

## 1. Vue d’ensemble du workflow

Nous utilisons un **Gitflow allégé**, adapté à une équipe de 4 personnes.

### Branches principales

| Branche | Rôle | Déploiement |
|----------|------|--------------|
| `dev` | Intégration continue de toutes les features. Peut casser. | Aucun |
| `main` | Code stable et testé. Représente la version staging / pré-production. | **Staging automatique** |
| `tag (vX.Y.Z)` | Version de production. | **Production automatique** |

### Branches temporaires
| Type | But | Crée à partir de | Fusionne vers |
|------|-----|------------------|----------------|
| `feature/<nom>` | Développement d’une nouvelle fonctionnalité | `dev` | `dev` |
| `hotfix/<nom>` | Correction urgente sur la production | `main` | `main` **puis** `dev` |

---

## 2. Stratégie de développement

### a) Création d’une nouvelle feature
1. Mettre `dev` à jour :
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. Créer une branche :
   ```bash
   git checkout -b feature/<nom-court>
   ```
3. Développer, commit, push régulièrement :
   ```bash
   git push -u origin feature/<nom>
   ```
4. Créer une **Merge Request** (`feature/...` → `dev`)
   - Décrire ce que fait la MR
   - Demander une **review** à un autre membre

### b) Fusion vers `main` (staging)
1. Créer une MR `dev` → `main`
2. Relire collectivement (2 approbations conseillées)
3. Merge → GitLab déploie automatiquement sur **staging**

---

## 3. Déploiement & versioning

### a) Staging
Chaque merge vers `main` déclenche automatiquement :
- le build
- le déploiement sur **staging**

### b) Production (via tag)
1. Vérifier `main` :
   ```bash
   git checkout main && git pull
   ```
2. Créer un tag :
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitLab CI déploie **production**.

> Seuls les mainteneurs peuvent créer des tags `v*` (Protected Tags)

---

## 4. Hotfix (bug prod)

1. Créer :
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/<nom>
   ```
2. Corriger, MR `hotfix/...` → `main`
3. Taguer `main` pour prod :
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. Réintégrer le fix dans `dev` :
   ```bash
   git checkout dev
   git merge main
   git push origin dev
   ```

---

## 5. Merge Requests (MR)

### Règles :
- ✅ 1 review min pour merge vers `dev`
- ✅ 2 reviews pour merge vers `main`
- 🚫 Pas de push direct sur `dev` ni `main`
- 🚫 Pas de merge si CI rouge

### Exemple de MR :
```md
### Objectif
Ajout du module de suivi des habitudes

### Détails techniques
- Nouveau composant React `MeditationTracker`
- Route API `/habits`
- Tests unitaires ajoutés

### À tester
- Lancer le front
- Vérifier création d’une habitude
```

---

## 6. Versioning sémantique

Format : `vMAJOR.MINOR.PATCH`

| Exemple | Signification |
|----------|----------------|
| `v1.0.0` | Première release stable |
| `v1.1.0` | Nouvelle feature |
| `v1.1.1` | Correction de bug |

---

## 7. Résumé express

| Action | Branche source | Branche cible | Effet CI |
|--------|----------------|----------------|----------|
| Nouvelle feature | feature/* | dev | Build check |
| Préparer release | dev | main | Déploiement staging |
| Tag stable | main | tag v* | Déploiement production |
| Hotfix prod | hotfix/* | main + dev | Correction + synchro |

> « Tout déploiement prod vient d’un tag stable validé sur staging. »
