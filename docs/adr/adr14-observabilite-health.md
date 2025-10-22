# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 15/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Observabilité & santé : /health, logs, métriques

## Contexte
La supervision et le diagnostic rapide nécessitent un minimum d'indicateurs et de signaux de santé des services.

## Décision
Exposer un endpoint `/health` pour liveness/readiness sur le front et l'API, utiliser des logs s
tructurés (JSON) avec rotation gérée par Docker, et prévoir une exposition de métriques compatible 
Prometheus à moyen terme.

## Conséquences
- Intégration simple avec le reverse proxy et la CI.
- Débogage et support facilités.
- Politique de rétention et de sauvegarde des logs à définir.

## Alternatives
Sans healthchecks ni structure de logs. Non retenu car augmente le temps de diagnostic et le risque opérationnel.
