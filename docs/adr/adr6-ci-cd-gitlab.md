# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 01/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# CI/CD : GitLab CI sur runner Docker

## Contexte
Le dépôt est hébergé sur GitLab de l'école. L'équipe souhaite automatiser lint, tests, build 
d'images et déploiement sur le VPS via SSH.

## Décision
Mettre en place des jobs par application (lint, test, build image), publier les images dans un 
registre, et déployer par connexion SSH au VPS avec `docker compose pull` puis `up -d`. Variables 
et secrets gérés dans les variables GitLab CI.

## Conséquences
- Traçabilité et reproductibilité des déploiements.
- Qualité intégrée au pipeline.
- Besoin de politiques de cache et d'optimisation des couches Docker.
- Gestion rigoureuse des secrets dans CI/CD.

## Alternatives
GitHub Actions. Non retenu car le dépôt vit sur GitLab.
