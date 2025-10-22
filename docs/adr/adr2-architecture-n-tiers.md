# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 02/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Architecture logique : n-tiers

## Contexte
Le produit comporte une partie publique (SEO), une application authentifiée, une API métier 
et une base de données relationnelle. L'équipe doit privilégier la clarté, la testabilité et 
un déploiement simple sur un seul serveur.

## Décision
Adopter une architecture n-tiers avec séparation front-end, API et base de données. Les communications 
se font via des contrats HTTP stables. Chaque tier est packagé et déployé indépendamment dans un conteneur distinct.

## Conséquences
- Séparation des responsabilités et contrôle du couplage.
- Tests, intégration continue et déploiement facilité par service.
- Complexité maîtrisée pour une équipe étudiante.
- Couplage plus fort qu'une architecture microservices, mais sans l'overhead d'orchestration et d'observabilité distribuée.

## Alternatives
Microservices. Écarté pour la version initiale à cause du coût opérationnel (maillage, traçage, 
résilience inter-services, orchestration).
