# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 22/10/2025  
**Statut :** En cours  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Conteneurisation : images “prod” multi-stage

## Contexte
Les images doivent être petites, sûres et rapides à construire. Le front et l'API ont 
des besoins de build distincts.

## Décision
Construire des images multi-stage : Next.js en mode standalone avec assets statiques séparés ; 
NestJS sur base Node Alpine ; base de données via image officielle PostgreSQL ; healthchecks au 
niveau Docker Compose et labels Traefik.

## Conséquences
- Temps de démarrage plus court et surface d'attaque réduite.
- Builds plus verbaux nécessitant une configuration de cache maîtrisée.
- Séparation claire entre dépendances de build et d'exécution.

## Alternatives
Images de développement en production. Non retenu pour des raisons de performance et de sécurité.
