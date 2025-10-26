# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 22/10/2025  
**Statut :** En cours  
**Auteur :** Équipe MindfulSpace (S. Gouvars)

# PWA : périmètre offline & service worker

## Contexte
Sans connexion, l'utilisateur doit pouvoir lire des contenus mis en cache et réaliser des actions 
simples (brouillons, notes) avec synchronisation ultérieure.

## Décision
Mettre en place un app-shell statique (SSG), un service worker (next-pwa/workbox) pour la mise en 
cache des assets et de certaines pages publiques, et utiliser IndexedDB pour stocker localement 
des données utilisateur synchronisées à la reconnexion.

## Conséquences
- Expérience résiliente en mobilité et en conditions réseau dégradées.
- Gestion de la synchronisation, des conflits et des stratégies de cache à concevoir.
- Besoin de documentation claire sur le périmètre offline.

## Alternatives
Pas de PWA. Non retenu car appauvrirait l'expérience utilisateur et la disponibilité.
