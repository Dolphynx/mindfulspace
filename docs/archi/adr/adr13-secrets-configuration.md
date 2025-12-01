# MindfulSpace – Architecture Decision Record

# ADR 13 : Gestion des secrets et de la configuration

## Status  
Accepted

## Context  
Le projet nécessite de manipuler plusieurs secrets sensibles :  
- mots de passe PostgreSQL,  
- clés SSH permettant le déploiement,  
- credentials du GitLab Container Registry,  
- secrets applicatifs (JWT, clés API externes),  
- URLs de bases de données pour staging et production.

Ces secrets ne doivent **jamais** être présents en clair dans le dépôt Git, ni transmis via des mécanismes non sécurisés.  
La gestion doit être compatible avec l’architecture CI/CD (GitLab), le déploiement Docker et l’infrastructure VPS.

## Decision  

### Secrets d’infrastructure  
Stockés exclusivement dans **GitLab CI/CD** :  
- `SSH_KEY` (clé privée utilisée pour le déploiement),  
- variables Docker Registry (`CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`),  
- URLs de bases de données (`STAGING_DATABASE_URL`, `PROD_DATABASE_URL`).  

Ces variables sont configurées comme :  
- **masked** (jamais visibles dans les logs),  
- **protected** (utilisables seulement sur *main* et les *tags*),  
- **non modifiables** par les pipelines.

### Secrets applicatifs  
Stockés côté serveur dans des fichiers locaux non versionnés :  
- `api.env` pour l’API (contenant `DATABASE_URL`),  
- `db.env` pour la base PostgreSQL (via extraction du mot de passe),  
- éventuellement d’autres fichiers `.env` si ajout de nouveaux services.

GitLab CI génère automatiquement ces fichiers au déploiement.

### Intégration avec Docker / Compose  
Les fichiers `api.env` et `db.env` sont chargés par :  
```
docker compose --env-file ./api.env
```
et alimentent les services `api` et `db`.

Les secrets **ne quittent jamais GitLab CI/CD** ni le VPS.

### Aucune donnée sensible dans le dépôt Git  
- Aucun `.env` n’est versionné.  
- `.gitignore` est configuré pour bloquer tout fichier contenant des secrets.  
- Les Dockerfiles ne contiennent aucune valeur sensible.  

### Transmission sécurisée des secrets  
- SSH via clé privée protégée dans GitLab  
- Aucun passage de secret en clair dans la sortie CI  
- `curl` est utilisé uniquement pour des checks, jamais pour transmettre des secrets  

## Consequences  

### Avantages  
- Protection forte des secrets (CI/CD + serveur).  
- Déploiement automatisé sans exposition d’informations sensibles.  
- Conformité aux bonnes pratiques DevOps (principes *12-factor app*).  
- Séparation nette entre secrets d’infrastructure et secrets applicatifs.  
- Secrets jamais présents dans l’image Docker → images sûres et partageables.

### Points d’attention  
- Toute rotation de secret doit être mise à jour dans GitLab CI + VPS.  
- Une mauvaise manipulation des variables CI/CD peut casser le pipeline.  
- Ne jamais ajouter de secret dans un commit (même temporairement).

---

Cette politique devient la norme pour la gestion des secrets dans MindfulSpace et s’applique à toutes les évolutions ultérieures du projet.
