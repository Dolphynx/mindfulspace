# MindfulSpace – Architecture Decision Record

# ADR 1 : Hébergement sur VPS avec Docker

## Status
Accepted

## Context
Nous devons héberger l’application MindfulSpace dans un environnement stable, accessible publiquement, et conforme aux contraintes d’un projet académique.  
Les options incluaient : hébergement mutualisé, PaaS (Heroku, Vercel), ou serveur VPS autogéré.  
Nous souhaitons maîtriser l’infrastructure, comprendre les couches réseau, et gérer le déploiement complet.

## Decision
Nous avons choisi d’héberger le projet sur un **VPS Debian 13 (Trixie)**, configuré avec **Docker Engine 28.5.1**.  
Docker permet d’exécuter chaque service dans un conteneur isolé :  
- **Frontend** (Next.js, Node 20)  
- **Backend API** (NestJS, Node 20)  
- **Base de données** (PostgreSQL 15)  
- **Traefik** (reverse proxy et gestion TLS)  

## Consequences
- L’équipe comprend la chaîne complète du déploiement (OS → Docker → App).  
- L’environnement est portable et reproductible.  
- L’administration demande un minimum de maintenance (surveillance VPS, mises à jour Docker).  
- Le coût et la complexité restent faibles pour un petit projet.
