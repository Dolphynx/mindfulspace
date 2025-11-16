# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 04/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace

# Style d’API : REST + OpenAPI

## Contexte
Le front web et d'éventuels clients tiers doivent consommer une API stable, documentée et 
testable sans couplage excessif.

## Décision
Adopter REST avec versionnage `/api/v1`, documentation OpenAPI générée automatiquement (Swagger) 
et conventions HTTP claires (ressources, verbes, statuts).

## Conséquences
- Interopérabilité élevée et outillage mature.
- Tests automatisés plus simples.
- Discipline de gestion de versions et de dépréciations nécessaire.

## Alternatives
GraphQL. Non retenu pour la v1 afin de limiter la complexité et la montée en compétences requise.
