# Documentation technique – MindfulSpace

Ce dossier contient la documentation d’architecture et de conception du projet **MindfulSpace** (HELMo – Bloc 3 Framework & Archilog, 2025).

## Structure

| Dossier                                                 | Contenu                       | Objectif                                                                                                                     |
|:--------------------------------------------------------|:------------------------------|:-----------------------------------------------------------------------------------------------------------------------------|
| [`archi/adr/`](./archi/adr/README.md)                   | Architecture Decision Records | Explique **les choix techniques et architecturaux** du projet : décisions, justifications, conséquences, alternatives.       |
| [`archi/c4/`](./archi/c4/README.md)                     | Diagrammes C4                 | Montre **comment ces décisions s’articulent visuellement** dans le système : contexte, conteneurs, composants, flux de code. |
| [`project-management/`](./project-management/README.md) | Gestion de projet             | Informations de gestion, organisation ClickUp, workflow Git étendu, cohérence projet/technique.                              |
| [`frontend/`](./frontend/index.html)                    | Doc frontend (TypeDoc)        | Documentation **automatique** du code du frontend (générée via TypeDoc).                                                     |
| [`I18N`](./I18N.md)                                     | I18N - Multilingue            | Documentation sur le système d'internationalisation du front.                                                                |

## Utilisation

- Consulte les **ADR** pour comprendre les **raisons** derrière chaque choix technique.
- Parcours ensuite les **diagrammes C4** pour visualiser la **structure et les interactions** du système.
- Les deux approches sont complémentaires :
  > *ADR = pourquoi* • *C4 = comment*

## Formats utilisés

- **Markdown (.md)** pour tous les documents : lisible sur GitLab/GitHub et versionné.
- **Mermaid** pour les diagrammes C4 : rendu automatique dans GitLab/GitHub/VS Code.

---

# Documentation API — Swagger (NestJS)

La documentation API est générée automatiquement par **Swagger / OpenAPI**.

## Consulter la documentation API

### En développement

1. Lancer l’API :
   ```bash
   pnpm dev:api
   ```
2. Ouvrir Swagger dans le navigateur :  
   http://localhost:3001/api/docs

### En staging / production

L’URL reste la même :
```
/api/docs
```

## Comment Swagger est généré ?

- Dans `apps/api-nest/src/main.ts` via `SwaggerModule`.
- Chaque contrôleur utilise :
    - `@ApiTags()`
    - `@ApiOkResponse()`
    - DTOs annotés avec `@ApiProperty()`

Swagger se met à jour automatiquement dès que :
- un contrôleur change,
- un endpoint est ajouté,
- un DTO est modifié.

---

# Documentation frontend — TypeDoc

Le code du frontend (Next.js) est documenté via **TypeDoc**.

## 🛠 Générer la documentation frontend

Depuis la **racine du monorepo** :

```bash
pnpm docs:front
```

Cela génère :

```
docs/frontend/index.html
```

Pour consulter la documentation :

- Ouvrir directement `docs/frontend/index.html`,
- ou lancer un serveur local :

  ```bash
  pnpm dlx serve docs/frontend
  ```

## Enrichir la documentation via TSDoc

Ajouter des commentaires **TSDoc** dans les composants, hooks et utilitaires :

```ts
/**
 * Sélecteur d’humeur de la séance.
 * @param currentMood humeur actuelle
 * @param onChange callback lors du changement
 */
```

Plus les commentaires sont complets, plus la documentation générée sera utile.

---

# Page interne de documentation frontend (`/docs`)

Une page interne accessible depuis le **frontend** fournit des informations utiles aux développeurs.

Emplacement :

```
apps/frontend-next/src/app/docs/page.tsx
```

Cette page explique :

- comment le frontend communique avec l’API,
- comment lancer et consulter Swagger,
- comment générer la documentation TypeDoc,
- où se trouvent les fichiers importants du monorepo.

Accès en développement :

```
http://localhost:3000/docs
```

---

> Ces documents servent de référence commune pour l’équipe MindfulSpace et accompagnent le développement, la présentation et l’évaluation du projet.
