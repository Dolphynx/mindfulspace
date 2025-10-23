# MindfulSpace

Application web de suivi du bien-être mental et de méditation guidée.

Projet Next.js + NestJS + PostgreSQL organisé en monorepo avec PNPM workspaces.

---

## Stack technique
- Frontend : Next.js (TypeScript, TailwindCSS)
- Backend : NestJS (TypeScript)
- Base de données : PostgreSQL
- Environnement : Docker (3 conteneurs : frontend, api, db)

---

## Structure du projet

```
mindfulspace/
├── apps/
│   ├── frontend-next/     → Application Next.js (interface)
│   └── api-nest/          → API NestJS (backend)
│
├── packages/              → Librairies partagées (utils, UI, etc.)
│   └── .gitkeep           → placeholder
│
├── node_modules/          → Dépendances hoistées à la racine
├── pnpm-workspace.yaml
├── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Façon dont le projet a été initialisé au départ

1) Installer PNPM
   npm i -g pnpm

2) Création du frontend (Next.js)
   pnpm dlx create-next-app@latest frontend \ --ts --eslint --app --src-dir --tailwind --use-pnpm

   Options :
    - --ts        → active TypeScript
    - --eslint    → configure ESLint
    - --app       → utilise le App Router (Next 13+)
    - --src-dir   → crée un dossier src/ pour le code source
    - --tailwind  → installe Tailwind CSS
    - --use-pnpm  → utilise pnpm comme gestionnaire de paquets

   Choix pendant la création :
    - Turbopack → Yes
    - Import alias "@/*" → Yes

3) Création du backend (NestJS)
   pnpm dlx @nestjs/cli new api --package-manager pnpm
   Option :
    - --package-manager pnpm → utilise pnpm pour les dépendances

4) Fichiers d’environnement

    - apps/frontend-next/.env.local
      NEXT_PUBLIC_API_URL=http://localhost:3001
   - apps/api-nest/.env
     PORT=3001
     DATABASE_URL=postgres://user:pass@localhost:5432/mindfulspace

---

## Installation

Prérequis : Node.js ≥ 18 et PNPM installé globalement.

1. Cloner le dépôt :
   git clone https://git.helmo.be/q230306/mindfulspace.git
   cd mindfulspace

2. Installer toutes les dépendances du workspace :
   pnpm install

Les node_modules sont gérés à la racine grâce à PNPM Workspaces.
Inutile d’installer séparément dans /apps/frontend-next ou /apps/api-nest.

---

## Commandes utiles

- Lancer le front et le back en développement :
  pnpm -r dev

- Lancer uniquement le frontend :
  pnpm --filter frontend-next dev

- Lancer uniquement l’API :
  pnpm --filter api-nest start:dev

- Vérifier le lint (tous les projets) :
  pnpm -w run lint

- Construire les apps :
  pnpm -r build

---

## Docker (optionnel)

Le projet est prêt pour Docker :

docker compose -f docker-compose.dev.yml up --build

Cela lancera :
- le frontend (Next.js)
- le backend (NestJS)
- la base PostgreSQL

---

## Notes pour l'équipe

- Le dossier /packages est prévu pour les modules partagés (ex. ui, config, shared, ...).
- Ne pas déplacer les dossiers apps ou packages sans mettre à jour pnpm-workspace.yaml.
- Toujours utiliser PNPM (pas npm ou yarn).
- Faire un pnpm install après chaque git pull (pour être sûr).

---

## Production
Sur le serveur (avec .env.prod présent à la racine) :
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

---

