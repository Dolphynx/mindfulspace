# Documentation technique – MindfulSpace

Ce dossier (`/docs`) centralise **l’ensemble de la documentation technique, architecturale et organisationnelle**
du projet **MindfulSpace**  
(HELMo – Bloc 3 · Framework & Archilog · 2025).

Il constitue le **point d’entrée** pour comprendre :
- l’architecture globale du système,
- les décisions techniques structurantes,
- les mécanismes clés (authentification, i18n, offline, PWA),
- le workflow Git et la chaîne CI/CD,
- l’organisation et la gestion du projet.

---

## Structure globale

### Architecture & conception

| Dossier | Contenu | Objectif |
|-------|--------|----------|
| [`archi/adr/`](./archi/adr/) | Architecture Decision Records (ADR) | Documente **les décisions techniques majeures** : contexte, choix retenus, alternatives, impacts. |
| [`archi/c4/`](./archi/c4/) | Diagrammes C4 | Représentation **visuelle et structurée** du système (contexte, conteneurs, composants). |
| [`archi/README.md`](./archi/README.md) | Vue d’ensemble | Point d’entrée reliant ADR et diagrammes C4. |

---

### Authentification & sécurité

| Dossier | Contenu | Objectif |
|-------|--------|----------|
| [`auth/backend/`](./auth/backend/) | Authentification backend | Mise en place de l’authentification côté API (stratégies, clés, configuration). |
| [`auth/frontend/`](./auth/frontend/) | Authentification frontend | Intégration côté frontend (flux utilisateur, guards, gestion de session). |
| [`auth/AUTHENTICATION_DEEP_DIVE.md`](./auth/AUTHENTICATION_DEEP_DIVE.md) | Analyse détaillée | Vue approfondie du fonctionnement global de l’authentification. |

---

### CI/CD, déploiement & infrastructure

| Dossier | Contenu | Objectif |
|-------|--------|----------|
| [`cicd/`](./cicd/) | CI/CD & déploiement | Décrit le **flux complet Dev → Prod**, les pipelines GitLab CI et les étapes de déploiement. |

---

### Internationalisation (I18N)

| Dossier | Contenu | Objectif |
|-------|--------|----------|
| [`I18N/I18N.md`](./I18N/I18N.md) | Principes i18n | Présente l’architecture de l’internationalisation du frontend. |
| [`I18N/RESOURCE_TRANSLATION_IMPLEMENTATION.md`](./I18N/RESOURCE_TRANSLATION_IMPLEMENTATION.md) | Implémentation | Détaille la gestion des ressources traduites. |
| [`I18N/RESOURCE_TRANSLATION_SLUG_CHANGE.md`](./I18N/RESOURCE_TRANSLATION_SLUG_CHANGE.md) | Évolution | Justifie et documente un changement de stratégie i18n. |

---

### Fonctionnalités transverses

| Fichier | Contenu | Objectif |
|-------|--------|----------|
| [`OFFLINE-SYNC.md`](./OFFLINE-SYNC.md) | Offline & synchronisation | Gestion du mode hors-ligne et resynchronisation des données. |
| [`PWA.md`](./PWA.md) | Progressive Web App | Fonctionnement PWA : cache, offline, installation. |

---

### Gestion de projet & workflow

| Dossier | Contenu | Objectif |
|-------|--------|----------|
| [`project-management/`](./project-management/) | Organisation du projet | Méthodologie, ClickUp, gestion du backlog et des sprints. |
| [`project-management/CLICKUP.md`](./project-management/CLICKUP.md) | Outil de gestion | Description de l’utilisation de ClickUp dans le projet. |
| [`project-management/CONTRIBUTING_EXTENDED.md`](./project-management/CONTRIBUTING_EXTENDED.md) | Règles de contribution | Bonnes pratiques Git, conventions et organisation du travail. |
| [`project-management/README_Git_Workflow.md`](./project-management/README_Git_Workflow.md) | Workflow Git | Détail du workflow Git utilisé par l’équipe. |

---

## Philosophie de documentation

- **ADR** : expliquent *pourquoi* une décision a été prise.
- **C4** : montrent *comment* le système est structuré.
- **Docs techniques ciblées** : décrivent les mécanismes complexes ou transverses.
- **Docs organisationnelles** : assurent la lisibilité du travail d’équipe.

> *ADR = Pourquoi*  
> *C4 = Comment*  
> *Docs techniques = Comment ça fonctionne*  
> *Gestion = Comment on travaille*

---

## Formats et conventions

- **Markdown (`.md`)** pour tous les documents : lisible, versionné, compatible GitLab/GitHub.
- **Mermaid** pour les diagrammes d’architecture (C4).
- Structure pensée pour être **explorable facilement lors de l’examen oral**.

---

> Cette documentation accompagne le développement, la maintenance et l’évaluation du projet **MindfulSpace**.
