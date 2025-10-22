# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 22/10/2025  
**Statut :** En cours  
**Auteur :** Équipe MindfulSpace (HELMo – Bloc 3 Framework)

# Authentification & comptes

## Contexte
Les utilisateurs créent un compte et accèdent à des données personnelles. Le dispositif 
d'authentification doit être sûr, standard et compatible PWA/mobile.

## Décision
Mettre en place l'authentification email/mot de passe avec confirmation d'email, hachage Argon2, 
tokens JWT d'accès court et de rafraîchissement plus long, endpoints de réinitialisation de mot 
de passe et limitation de débit.

## Conséquences
- Parcours utilisateur standard et sécurisé.
- Compatibilité avec la PWA et une application mobile ultérieure.
- Besoin d'un service SMTP fiable et d'une configuration DNS mail adaptée.

## Alternatives
OAuth (Google/Apple) pour une version ultérieure afin de simplifier l'inscription et réduire 
la gestion des mots de passe.
