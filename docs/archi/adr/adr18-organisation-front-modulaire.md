# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 24/11/2025  
**Statut :** Accepté  
**Auteur :** Équipe MindfulSpace

# Organisation modulaire du front (App Router Next.js)

## Contexte
Le front-end Next.js regroupait initialement toutes les pages sous un seul layout comprenant
une unique barre de navigation. Avec la montée en complexité du projet MindfulSpace
(espace public, espace client, futur espace coach et interface d’administration), cette
organisation devenait difficile à maintenir et ne permettait pas d’adapter facilement
l’interface en fonction du rôle ou du contexte de l’utilisateur.

Next.js App Router offre la possibilité de structurer les routes par groupes, avec des
layouts différents et une meilleure isolation des espaces fonctionnels.

## Décision
Mettre en place une structure modulaire basée sur les groupes de routes Next.js :

- `app/(public)/…` pour les pages publiques.
- `app/member/(member)/…` pour les pages nécessitant une authentification.
- Prévoir `app/coach/(coach)` et `app/admin/(admin)` pour les extensions futures.

Introduire un composant commun `AppShell` contenant le chrome global de l’application
(footer, gestion des cookies, bandeau d’information).  
Créer des barres de navigation distinctes pour l’espace public et l’espace client, injectées
via les layouts spécifiques à chaque groupe de routes.

## Conséquences
- Séparation nette entre les espaces publics et authentifiés.
- Architecture plus lisible et extensible, facilitant l’ajout de nouveaux profils utilisateurs.
- Code plus cohérent, réduction du couplage entre les pages et la navigation.
- Meilleure conformité aux pratiques recommandées du routing App Router.

## Alternatives
- Conserver un layout unique avec logique conditionnelle dans la navbar.  
  Rejeté pour éviter la complexité croissante et le risque d’effets de bord.
- Séparer le front en plusieurs projets distincts.  
  Rejeté, car trop lourd pour le contexte du projet pédagogique.
