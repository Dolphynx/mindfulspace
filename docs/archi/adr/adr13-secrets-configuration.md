# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 01/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Secrets & configuration

## Contexte
Le projet manipule des secrets (DB, JWT, SMTP) et variables de configuration. Les fuites doivent 
être évitées et la rotation doit rester possible.

## Décision
Stocker les secrets dans les variables GitLab CI pour la CI/CD, utiliser `.env.local` ignoré en VCS 
pour le développement, injecter la configuration en production via `env_file` ou variables Compose, 
et mettre en place une rotation régulière des secrets critiques.

## Conséquences
- Réduction du risque de fuite et séparation claire des environnements.
- Conformité au principe 12-factor pour la configuration.
- Discipline d'équipe nécessaire pour la mise à jour et la révocation des secrets.

## Alternatives
Gestion centralisée via Vault. Non retenue pour la v1 en raison de la complexité de mise en place.
