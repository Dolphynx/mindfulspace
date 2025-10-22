# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 01/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Hébergement : VPS Debian 13 + Docker

## Contexte
L'équipe dispose d'un VPS Debian 13 déjà équipé de Docker. Les contraintes du cours imposent de 
justifier des choix d'infrastructure réalistes et maîtrisables par une petite équipe. Le projet 
comporte plusieurs services (front, API, base de données, reverse proxy) devant cohabiter sur un même hôte.

## Décision
Héberger l'application sur un VPS Debian 13 et exécuter chaque service dans un conteneur Docker 
orchestré par Docker Compose. Les artefacts de déploiement sont versionnés dans le dépôt, et les 
images sont construites en CI puis tirées sur le VPS.

## Conséquences
- Parité entre environnements et reproductibilité des mises en production.
- Isolation des services et simplification des rollbacks.
- Besoin d'une politique de sauvegarde (base de données, fichiers) et d'une supervision minimale.
- Nécessité d'automatiser les mises à jour de sécurité du système et des images.

## Alternatives
PaaS (Railway, Render, Fly.io) ou services managés. Non retenu afin de garder la maîtrise 
pédagogique de l'infrastructure et limiter la dépendance à un fournisseur.
