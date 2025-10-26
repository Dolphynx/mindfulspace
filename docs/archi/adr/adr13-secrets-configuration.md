# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace
**Date :** 01/10/2025
**Statut :** accepté
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# ADR 13 : Gestion des secrets et de la configuration

## Status
Accepted

## Context
Les secrets (mots de passe, clés SSH, tokens) doivent être protégés.  
Nous utilisons GitLab CI/CD et des fichiers `.env` locaux pour stocker les données sensibles.

## Decision
- Secrets d’infrastructure (clé SSH, credentials Docker registry) :  
  → stockés dans GitLab CI/CD (variables **masked** et **protected**).  
- Secrets applicatifs (DB password, JWT secret, clés API) :  
  → définis dans des fichiers `.env` sur le serveur, non versionnés.  
- Variables partagées via `docker compose` au runtime.  
- Aucune donnée sensible dans le dépôt Git.

## Consequences
- Sécurité des secrets respectée.  
- Déploiement automatisé sans divulgation.  
- Bonne conformité aux pratiques DevOps.
