# ************************************************************
# DOCKERFILE FRONTEND NEXT.JS – VERSION COMMENTÉE
# ------------------------------------------------------------
# Ce Dockerfile suit une architecture multi-stage :
#   1) Étape "build"   : installation deps, build Next.js
#   2) Étape "runtime" : image finale minimale pour exécuter le front
#
# Ce fichier ne change AUCUNE ligne originale.
# Seuls les commentaires ont été ajoutés, pour rendre la mécanique claire.
# ************************************************************


# ------------------------------------------------------------
# ---- Build stage ----
# ------------------------------------------------------------
# Image de base :
#  - Node 20 (LTS)
#  - Alpine (ultra-léger)
#  - utilisée pour builder Next.js
FROM node:20-alpine AS build

# Dossier de travail (tous les RUN/COPY suivants s'exécutent ici)
WORKDIR /app

# ------------------------------------------------------------
# Next.js nécessite parfois des libc spécifiques pour éviter
# des problèmes avec des binaires natifs (Sharp, SWC…).
#
# libc6-compat ajoute une compatibilité glibc dans Alpine,
# qui utilise normalement musl et peut casser certains modules.
# ------------------------------------------------------------
RUN apk add --no-cache libc6-compat

# ------------------------------------------------------------
# Installation du gestionnaire PNPM via npm
#   - node:alpine n'inclut pas pnpm par défaut
#   - on l’installe globalement
# ------------------------------------------------------------
RUN npm i -g pnpm

# ------------------------------------------------------------
# Déclaration d'un ARG (argument de build)
# Injecté depuis la CI via Kaniko :
#   --build-arg NEXT_PUBLIC_API_URL=...
#
# NEXT_PUBLIC_API_URL est une variable spéciale Next.js :
#   - les variables NEXT_PUBLIC_* sont exposées au client web
#   - elle sera utilisée au build (et intégrée au JS final)
# ------------------------------------------------------------
ARG NEXT_PUBLIC_API_URL

# ------------------------------------------------------------
# On place aussi cette variable en ENV :
#   - ENV = disponible lors du build Next
#   - Next.js lit process.env.NEXT_PUBLIC_API_URL
# ------------------------------------------------------------
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# ------------------------------------------------------------
# 1) Copie des manifestes racine nécessaires à PNPM
#
# Le but :
#   - optimiser le cache Docker
#   - pnpm install se base sur pnpm-lock.yaml
#   - tant que ces fichiers ne changent pas, la couche install
#     sera réutilisée → builds beaucoup plus rapides
# ------------------------------------------------------------
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# ------------------------------------------------------------
# 2) Copie du package.json du front
#
# Important car PNPM doit connaître l’existence du workspace
# ./apps/frontend-next pour installer les dépendances propres
# à cette app (Next.js, React, etc.)
# ------------------------------------------------------------
COPY apps/frontend-next/package.json apps/frontend-next/package.json

# ------------------------------------------------------------
# 3) Install de TOUTES les deps du monorepo
#
# pnpm install :
#   - détecte le workspace via pnpm-workspace.yaml
#   - installe toutes les dépendances racine + dépendances front
#   - crée les symlinks entre les workspaces si nécessaire
# ------------------------------------------------------------
RUN pnpm install

# ------------------------------------------------------------
# 4) Copier le code source front
#
# On ne copie le code source qu’après pnpm install,
# sinon chaque changement dans le code invaliderait le cache.
# ------------------------------------------------------------
COPY apps/frontend-next ./apps/frontend-next

# ------------------------------------------------------------
# 5) Build Next.js
# ------------------------------------------------------------
WORKDIR /app/apps/frontend-next

# On force NODE_ENV=production pour :
#   - activer les optimisations build Next.js
#   - retirer les devDependencies si certains outils les respectent
ENV NODE_ENV=production

# RUN pnpm build :
#   - exécute "next build"
#   - génère le dossier .next/
#   - compile React côté client + côté serveur
#   - injecte NEXT_PUBLIC_API_URL dans le bundle final
RUN pnpm build


# ------------------------------------------------------------
# ---- Runtime stage ----
# ------------------------------------------------------------
# Image finale :
#  - Node 20 Alpine (petite)
#  - uniquement ce qui est nécessaire pour exécuter le front
# ------------------------------------------------------------
FROM node:20-alpine AS runtime

# Répertoire de travail final
WORKDIR /app

# Runtime en mode production
ENV NODE_ENV=production

# ------------------------------------------------------------
# PNPM global (optionnel mais pratique)
# - utilisé ici car tu lances "pnpm start"
# ------------------------------------------------------------
RUN npm i -g pnpm

# ------------------------------------------------------------
# ARG + ENV (optionnel mais propre)
# On expose l'URL API même au runtime :
#   - utile si certain code Next.js côté serveur utilise process.env.*
#   - même si NEXT_PUBLIC_API_URL est surtout pour le front buildé
# ------------------------------------------------------------
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# ------------------------------------------------------------
# Copie du node_modules du build :
#   - contient la store de pnpm
#   - contient les dependances Next.js buildées
# ------------------------------------------------------------
COPY --from=build /app/node_modules ./node_modules

# ------------------------------------------------------------
# Copie de *toute* l’app front telle qu’elle est après build :
#   - .next       => bundle compilé
#   - public      => assets statiques
#   - package.json
#   - next.config.js (si présent)
#   - etc.
# ------------------------------------------------------------
COPY --from=build /app/apps/frontend-next ./apps/frontend-next

# On se place dans le dossier final du front
WORKDIR /app/apps/frontend-next

# Next.js écoute par défaut sur 3000
EXPOSE 3000

# ------------------------------------------------------------
# Commande finale :
#   pnpm start → exécute "next start"
#
# next start :
#   - lance un serveur Node de production Next.js
#   - lit le bundle .next/
#   - sert les pages SSR et statiques
# ------------------------------------------------------------
CMD ["pnpm", "start"]
