# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace
**Date :** 01/10/2025
**Statut :** accepté
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# ADR 6 : Intégration et déploiement continu avec GitLab CI/CD

## Status
Accepted

## Context
Les membres de l’équipe doivent pouvoir déployer rapidement et de façon reproductible.  
Le dépôt GitLab est utilisé comme registre de code et d’images Docker.

## Decision
Mise en place d’un pipeline GitLab CI/CD avec deux étapes :  
1. **Build** :  
   - Utilise `docker:27` + service `docker:dind`.  
   - Construit les images `frontend` et `api`.  
   - Pousse les images vers le **Container Registry GitLab**.  
   - Tag `staging` pour la branche `main`, `prod` pour les tags Git.  
2. **Deploy** :  
   - Connexion SSH au VPS via clé privée stockée dans `SSH_PRIVATE_KEY`.  
   - `docker pull` des nouvelles images et `docker compose up -d`.  
   - Environnements distincts : `/srv/staging` et `/srv/prod`.

## Consequences
- Déploiement automatisé sans action manuelle.  
- Séparation claire staging/production.  
- Sécurité renforcée grâce aux variables masquées et protégées (GitLab CI/CD).  
- CI portable et compatible avec Docker-in-Docker.
