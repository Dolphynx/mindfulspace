# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 22/10/2025  
**Statut :** En cours  
**Auteur :** Équipe MindfulSpace

# Qualité : lint, format, tests

## Contexte
Le cours demande une démarche qualité explicite. L'équipe vise une base de code homogène, testée et présentable.

## Décision
Mettre en place ESLint et Prettier sur front et API, des tests unitaires (services Nest, composants 
critiques React), quelques tests end-to-end sur les routes essentielles, et des audits Lighthouse 
pour les pages publiques.

## Conséquences
- Réduction de la dette technique et régressions détectées tôt.
- Pipelines plus longs mais plus fiables.
- Besoin de budgets de test dans les sprints.

## Alternatives
Tests manuels uniquement. Non retenu car peu fiable et non industrialisable.
