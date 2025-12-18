# MindfulSpace – Architecture Decision Record

# Authentification & comptes

## Contexte
Les utilisateurs créent un compte et accèdent à des données personnelles. Le dispositif
d'authentification doit être sûr, standard et compatible PWA/mobile.

## Décision
Mettre en place un système d'authentification complet comprenant :

### Authentification principale
- **Email/mot de passe** : inscription avec validation forte du mot de passe (minimum 8 caractères, majuscule, minuscule, chiffre, caractère spécial)
- **Confirmation d'email** : envoi automatique d'un email de vérification avec token valide 24 heures
- **Hachage Argon2id** : algorithme de hachage sécurisé avec paramètres conformes OWASP (64 MB mémoire, 3 itérations, 4 threads)
- **Tokens JWT** :
  - Token d'accès court (15 minutes) pour les requêtes API
  - Token de rafraîchissement long (7 jours) stocké en base de données avec rotation automatique
  - Distribution via cookies httpOnly sécurisés ET corps de réponse (compatibilité mobile)
- **Réinitialisation de mot de passe** :
  - Génération de token sécurisé valide 1 heure
  - Email avec lien de réinitialisation
  - Token à usage unique pour éviter les réutilisations
  - Invalidation de tous les tokens de rafraîchissement lors du changement
- **Limitation de débit (rate limiting)** :
  - Trois niveaux : 3 req/s, 20 req/10s, 100 req/min
  - Protection contre les attaques par force brute

### OAuth (implémenté)
- **Google OAuth** : authentification via compte Google avec création/liaison automatique de compte
- **GitHub OAuth** : authentification via compte GitHub avec création/liaison automatique de compte
- Les comptes OAuth ont leur email automatiquement vérifié
- Stockage des tokens OAuth en base de données pour gestion multi-providers

### Contrôle d'accès
- **RBAC (Role-Based Access Control)** : système de rôles (user, coach, admin)
- **Permissions granulaires** : permissions par ressource (ex: sessions:create, users:delete)
- Attribution automatique du rôle "user" lors de l'inscription
- Guards NestJS pour protection des routes selon rôles et permissions

### Sécurité renforcée
- **Cookies sécurisés** : httpOnly, secure (production), SameSite strict
- **CORS configuré** : liste blanche d'origines, credentials activés
- **Tracking des sessions** : enregistrement de l'userAgent et IP pour audit de sécurité
- **Gestion de compte** : support de la suspension de compte (champ isActive)
- **Validation globale** : validation automatique des DTOs avec whitelist

### Service d'emails
- **SendGrid** : intégration pour l'envoi d'emails transactionnels
- Templates HTML professionnels pour vérification d'email et réinitialisation de mot de passe
- Fallback console en développement si clé API non configurée

## Implémentation technique

### Endpoints disponibles
- `POST /auth/register` : inscription avec email/mot de passe
- `POST /auth/login` : connexion avec génération des tokens JWT
- `POST /auth/logout` : déconnexion avec invalidation du refresh token
- `POST /auth/refresh` : rafraîchissement du token d'accès
- `POST /auth/verify-email` : vérification de l'email avec token
- `POST /auth/forgot-password` : demande de réinitialisation de mot de passe
- `POST /auth/reset-password` : réinitialisation du mot de passe avec token
- `GET /auth/me` : récupération des informations de l'utilisateur connecté
- `GET /auth/google` : initiation du flux OAuth Google
- `GET /auth/google/callback` : callback OAuth Google
- `GET /auth/github` : initiation du flux OAuth GitHub
- `GET /auth/github/callback` : callback OAuth GitHub

### Stack technique
- **NestJS** : framework backend avec architecture modulaire
- **Passport.js** : stratégies d'authentification (JWT, Google OAuth, GitHub OAuth)
- **Argon2** : bibliothèque de hachage (@argon2)
- **@nestjs/jwt** : gestion des tokens JWT
- **@nestjs/throttler** : limitation de débit
- **SendGrid** : service d'envoi d'emails
- **Prisma ORM** : modèles User, Role, Permission, RefreshToken, EmailVerificationToken, PasswordResetToken, OAuthAccount

## Conséquences

### Avantages
- Parcours utilisateur standard et sécurisé avec email/mot de passe
- Expérience simplifiée via OAuth pour les utilisateurs préférant cette option
- Sécurité renforcée avec Argon2, JWT courts, rotation des tokens
- Compatibilité totale avec PWA et applications mobiles (tokens dans réponse + cookies)
- Contrôle d'accès granulaire avec RBAC et permissions
- Audit de sécurité possible via tracking des sessions
- Protection contre attaques courantes (force brute, XSS, CSRF)

### Contraintes
- Besoin d'un service SMTP fiable (SendGrid) et configuration DNS mail adaptée
- Gestion des secrets OAuth (Google Client ID/Secret, GitHub Client ID/Secret)
- Configuration des callbacks OAuth dans les consoles développeurs Google et GitHub
- Maintenance des tokens en base de données (nettoyage périodique des tokens expirés recommandé)
- Coût potentiel du service SendGrid selon le volume d'emails

### Points d'attention
- Les tokens de rafraîchissement sont stockés en base : prévoir nettoyage des tokens expirés
- OAuth nécessite validation côté providers (Google Cloud Console, GitHub OAuth Apps)
- Les emails de vérification expirent après 24h, les tokens de reset après 1h
- Rate limiting appliqué globalement au module auth (peut nécessiter ajustement par endpoint)

## Améliorations futures possibles
- Renvoi d'email de vérification si token expiré
- Interface de gestion des sessions actives pour l'utilisateur
- Verrouillage automatique du compte après X tentatives de connexion échouées
- Authentification à deux facteurs (2FA/TOTP)
- Support WebAuthn/Passkeys
- Historique des mots de passe pour éviter la réutilisation
- Logs d'audit de sécurité complets
- Rate limiting par IP en plus du rate limiting global
