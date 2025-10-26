# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace
**Date :** 10/10/2025
**Statut :** accepté
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# ADR 5 : Reverse proxy avec Traefik

## Status
Accepted

## Context
L’application comporte plusieurs services Docker (frontend, API, base de données).  
Il faut exposer uniquement les services publics via HTTPS, avec un certificat automatique.

## Decision
Nous utilisons **Traefik v3.1** comme reverse proxy et gestionnaire TLS.  
- Écoute sur les ports 80 et 443 du VPS.  
- Routage automatique basé sur les labels Docker (`Host(mindfulspace.be)` etc.).  
- Certificats **Let's Encrypt** via résolveur ACME et challenge HTTP.  
- Traefik tourne dans son propre conteneur avec un volume `/letsencrypt` persistant.

## Consequences
- HTTPS automatique et renouvelé.  
- Isolation des services internes.  
- Une seule porte d’entrée publique pour l’ensemble de la stack.
