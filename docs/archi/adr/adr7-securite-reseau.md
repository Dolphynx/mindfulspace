# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 10/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Sécurité & réseau : firewall, SSH, HTTPS

## Contexte
Les services sont exposés publiquement. Il faut réduire la surface d'attaque et sécuriser l'accès 
au serveur et aux applications.

## Décision
Mettre en place un pare-feu (UFW ou nftables) pour n'ouvrir que 22, 80, 443. Renforcer SSH 
(authentification par clés, utilisateur dédié, fail2ban). Forcer HTTPS via Traefik, activer HSTS 
et appliquer une CSP progressive.

## Conséquences
- Posture de sécurité minimale solide.
- Maintien à jour requis de la politique CSP et des certificats.
- Procédures à définir pour l'accès d'urgence et la rotation de clés.

## Alternatives
WAF ou services de protection gérés. Non retenus pour garder la simplicité et le contrôle local.
