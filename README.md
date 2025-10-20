# MindfulSpace

Application web de suivi du bien-être mental et de méditation guidée.

---

## Stack technique
- Frontend : Next.js (TypeScript, TailwindCSS)
- Backend : NestJS (TypeScript)
- Base de données : PostgreSQL
- Environnement : Docker (3 conteneurs : frontend, api, db)

---

## Initialisation du projet

1) Installer PNPM
   npm i -g pnpm

2) Création du frontend (Next.js)
   pnpm dlx create-next-app@latest frontend \
   --ts --eslint --app --src-dir --tailwind --use-pnpm

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

    - frontend/.env.local
      NEXT_PUBLIC_API_URL=http://localhost:3001
   - api/.env
     PORT=3001
     DATABASE_URL=postgres://user:pass@localhost:5432/mindfulspace

---

## Développement local
1) Démarrer la base de données (Docker)
   docker compose -f docker-compose.dev.yml up -d db

2) Démarrer l’API (Nest)
   pnpm --dir api start:dev
   (écoute par défaut sur http://localhost:3001)

3) Démarrer le Front (Next)
   pnpm --dir frontend dev
   (http://localhost:3000)

---

## Production
Sur le serveur (avec .env.prod présent à la racine) :
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

---

