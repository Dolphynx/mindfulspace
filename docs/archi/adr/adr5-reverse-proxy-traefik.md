# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 10/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Reverse proxy & entrypoint : Traefik

## Contexte
Un seul VPS héberge plusieurs services web. Le proxy doit gérer le routage, le TLS et l'automatisation 
des certificats avec une intégration Docker simple.

## Décision
Utiliser Traefik comme reverse proxy avec Let’s Encrypt, routage par labels Docker, redirections 
HTTP→HTTPS et middlewares de sécurité (HSTS, headers).

## Conséquences
- Déploiement de nouveaux services par simple ajout de labels.
- Certificats TLS gérés automatiquement.
- Courbe de configuration initiale plus importante.

## Alternatives
Caddy ou Nginx Proxy Manager. Non retenus pour privilégier l'intégration par labels Docker et la 
flexibilité des middlewares Traefik.
