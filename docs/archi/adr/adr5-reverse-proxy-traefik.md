# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 10/10/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace

# ADR 5 : Reverse proxy avec Traefik

## Status
Accepted

## Context
L'application MindfulSpace comporte plusieurs services Docker :
- frontend Next.js
- API NestJS
- base de données PostgreSQL (interne)

Seuls certains services doivent être exposés publiquement.  
L'équipe souhaite également :
- une terminaison TLS automatique,
- un routage par nom de domaine,
- une séparation claire des environnements **staging** et **production**.

## Decision
Nous utilisons **Traefik v3.x** comme reverse-proxy principal et gestionnaire TLS.

### Architecture mise en place
- Traefik écoute sur les ports **80** (HTTP) et **443** (HTTPS) du VPS.
- Les services frontend/API sont connectés au réseau Docker externe **`web`**, partagé avec Traefik.
- Le routage s’effectue via **labels Docker**, par exemple :
    - `Host("mindfulspace.be")` → frontend prod
    - `Host("api.mindfulspace.be")` → API prod
    - `Host("staging.mindfulspace.be")` → frontend staging
    - `Host("api.staging.mindfulspace.be")` → API staging
- Certificats **Let's Encrypt** via un certresolver ACME (stocké dans un volume `/letsencrypt`).
- Les services internes (PostgreSQL, réseau `internal`) ne sont **pas exposés**.

## Consequences
- **HTTPS automatique et renouvelé** sans intervention humaine.
- **Isolation stricte** des services : seuls frontend/API sont publics, la base reste privée.
- **Support multi-environnements** avec sous-domaines séparés.
- **Une seule porte d’entrée publique**, réduisant la surface d’attaque et facilitant la maintenance.

