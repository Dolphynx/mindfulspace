# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 04/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Base de données & migrations

## Contexte
Le schéma évolue au fil des fonctionnalités. L'équipe doit éviter les divergences entre environnements 
et sécuriser les évolutions en production.

## Décision
Utiliser un ORM (TypeORM ou Prisma) et des migrations versionnées. En développement, migrations 
automatiques. En production, exécution contrôlée des migrations via la CI/CD avec journalisation 
et possibilité de rollback.

## Conséquences
- Historique clair des changements de schéma.
- Déploiements contrôlés et auditables.
- Discipline nécessaire dans la conception et la revue des migrations.

## Alternatives
SQL manuel non versionné. Non retenu pour éviter les écarts et faciliter l'automatisation.
