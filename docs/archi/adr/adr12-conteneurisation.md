# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace
**Date :** 22/10/2025
**Statut :** accepté
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# ADR 12 : Conteneurisation des applications

## Status
Accepted

## Context
Afin de garantir des environnements homogènes en développement, intégration et production, nous avons décidé de conteneuriser toutes les applications du projet.

## Decision
Chaque composant est exécuté dans un conteneur Docker :  
- **Frontend** : Next.js buildé en mode production (output standalone).  
- **Backend** : API NestJS (Node 20).  
- **Database** : PostgreSQL.  
- **Traefik** : reverse proxy / TLS.  

Les images sont construites dans la CI/CD, taguées (`staging` ou `prod`) puis poussées dans le registre GitLab.

## Consequences
- Portabilité totale.  
- Aucune dépendance installée directement sur le VPS.  
- Simplifie le déploiement et la montée en charge future.
