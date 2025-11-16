# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 15/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# ADR 14 : Observabilité & Santé (Healthchecks, Logs, Métriques)

## Status  
Accepted

## Contexte  
Afin d’assurer la stabilité opérationnelle de MindfulSpace, les services doivent exposer des
mécanismes de supervision simples, fiables et compatibles avec les outils standards DevOps.

Les objectifs principaux sont :  
- détecter rapidement les défaillances,  
- simplifier le diagnostic en production et en staging,  
- garantir l'intégration avec Traefik, Docker et GitLab CI/CD,  
- préparer l’évolution vers un système de métriques complet.

## Décision  

### Endpoint `/health` obligatoire  
Implémenté dans **l’API NestJS** et le **frontend Next.js**.

- Sert de *liveness* et *readiness*.  
- Permet à :
  - Traefik de vérifier la disponibilité du service,
  - Docker Compose d’exécuter des **healthchecks**,
  - GitLab CI/CD de vérifier un déploiement avant validation du job.

Traitement minimal, par exemple :  
- API NestJS → renvoie `{ status: "ok" }`  
- Frontend Next.js → renvoie un 200 minimal ou une page statique.

### Logs structurés JSON  
- Format unique JSON pour tous les services.  
- Exploitable par :  
  - Graylog / ELK (si évolution future),  
  - outils de monitoring externes,  
  - recherche CLI simple (`jq`, `grep`, `docker logs`).  
- Rotation automatique prise en charge par Docker via :  
  - `json-file` logging driver,  
  - `max-size` + `max-file`.

### Préparation aux métriques (Prometheus-ready)  
À moyen terme, l’API exposera :  
- un endpoint `/metrics` (format Prometheus),  
- des compteurs HTTP, latences, erreurs,  
- utilisation potentielle du module `@willsoto/nestjs-prometheus`.

Non prioritaire mais anticipé dans l’architecture.

## Conséquences  

### Avantages  
- Healthchecks intégrés à **Traefik**, **Docker**, et **CI/CD**.  
- Débogage facilité grâce aux logs homogènes et structurés.  
- Préparation simple pour un futur observability stack (Prometheus + Grafana).  
- Amélioration de la visibilité opérationnelle sans surcomplexité.

### Points d’attention  
- La politique de rétention des logs doit être définie (taille/max-file).  
- `/metrics` devra rester protégé (pas exposé publiquement).  
- L’endpoint `/health` doit rester léger et sans dépendance forte.

## Alternatives rejetées  

### Absence de healthchecks et logs non structurés  
Rejetée car elle :  
- augmente le temps de diagnostic,  
- complique la supervision,  
- empêche l’intégration avec les outils DevOps,  
- nuit à la résilience en production.

---

Cette stratégie d’observabilité minimaliste mais robuste est adoptée comme standard pour MindfulSpace.
