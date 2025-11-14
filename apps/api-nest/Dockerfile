# ************************************************************
# DOCKERFILE API NESTJS – VERSION COMMENTÉE
# ------------------------------------------------------------
# Ce Dockerfile est en deux étapes :
#   1) Étape "build"    → compilation, installation deps, prisma generate
#   2) Étape "runtime"  → exécution minimale, propre, légère
#
# On ne modifie AUCUNE ligne existante, on ajoute uniquement
# des commentaires explicatifs pour que l’équipe comprenne
# exactement ce qu’il se passe à chaque étape.
# ************************************************************


# ------------------------------------------------------------
# ---- Build stage ----
# ------------------------------------------------------------
# On part de node:20-alpine pour :
#  - avoir Node 20 (LTS)
#  - bénéficier de l'image Alpine, légère
#  - permettre un build propre et rapide
FROM node:20-alpine AS build

# Dossier de travail dans l'image (toutes les commandes suivantes
# seront exécutées depuis /app)
WORKDIR /app

# Prisma a besoin d'un DATABASE_URL même faux lors du "prisma generate".
# Sans cela, certaines versions de Prisma lèvent des erreurs si le schema
# contient des éléments dépendants de la connexion.
ENV DATABASE_URL="postgresql://fake:fake@localhost:5432/fake?schema=public"

# ------------------------------------------------------------
# 1) Manifeste racine / workspace
# ------------------------------------------------------------
# On copie les fichiers essentiels du monorepo :
# - package.json            : liste des scripts + deps racines
# - pnpm-lock.yaml          : versions exactes des dépendances
# - pnpm-workspace.yaml     : déclaration du monorepo
# - tsconfig.base.json      : configuration TypeScript partagée
#
# Le fait de copier d’abord ces fichiers permet aux layers Docker
# d’être bien mis en cache : tant qu’ils ne changent pas,
# l'étape "pnpm install" sera réutilisée.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# ------------------------------------------------------------
# 2) Manifeste API + schema Prisma
# ------------------------------------------------------------
# On copie le package.json de l'app API :
#   - nécessaire pour que pnpm sache qu'il existe un workspace enfant
#   - utile pour installer les dépendances API, même avant de copier
#     tout le code de l’application
#
# On copie aussi le dossier /prisma :
#   - pour que "prisma generate" trouve son schema.prisma
#   - pour que Prisma puisse générer son client TypeScript
COPY apps/api-nest/package.json apps/api-nest/package.json
COPY apps/api-nest/prisma apps/api-nest/prisma

# ------------------------------------------------------------
# 3) Installer pnpm + toutes les dépendances du monorepo
# ------------------------------------------------------------
# On installe pnpm globalement via npm :
#   - npm i -g pnpm
#
# Puis on exécute pnpm install :
#   - détecte automatiquement le workspace
#   - installe TOUTES les dépendances du monorepo
#   - réutilise le cache docker si les fichiers manifestes n’ont pas changé
RUN npm i -g pnpm && pnpm install

# ------------------------------------------------------------
# 4) Copier le code source de l'API et builder l’application
# ------------------------------------------------------------
# Maintenant que les dépendances sont installées, on copie
# tout le code source de l'API.
COPY apps/api-nest ./apps/api-nest

# On se place dans le dossier spécifique de l’API
WORKDIR /app/apps/api-nest

# On force NODE_ENV=production pour un build optimisé
ENV NODE_ENV=production

# IMPORTANT :
# Le script "build" défini dans apps/api-nest/package.json
# fait déjà :
#   - prisma generate
#   - nest build
#
# Cela génère :
#   - le client Prisma (dans node_modules/.prisma/client)
#   - le code transpilé TS -> JS dans "dist/"
RUN pnpm build


# ------------------------------------------------------------
# ---- Runtime stage ----
# ------------------------------------------------------------
# Cette étape produit l’image finale utilisée en production.
# Elle est beaucoup plus légère :
#   - on ne garde PAS les outils de build
#   - on ne garde PAS les sources TypeScript
#   - uniquement le code JS compilé + node_modules nécessaires
FROM node:20-alpine AS runtime

# Dossier de travail final
WORKDIR /app

# Mode production dans l’image finale
ENV NODE_ENV=production

# ------------------------------------------------------------
# (Optionnel) User non-root :
#   - sécurité accrue
#   - pas activé ici, mais prêt si vous voulez l’utiliser plus tard
# ------------------------------------------------------------
# USER node

# ------------------------------------------------------------
# Copie des dépendances depuis le stage build
# ------------------------------------------------------------
# /app/node_modules : dépendances racines du monorepo
# /app/apps/api-nest/node_modules : dépendances spécifiques API
#
# On récupère EXACTEMENT l’environnement runtime généré
# par pnpm install (avec symlinks du monorepo, etc.)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api-nest/node_modules ./apps/api-nest/node_modules

# ------------------------------------------------------------
# Copie du code compilé NestJS & du schema Prisma
# ------------------------------------------------------------
# dist/ : résultat de "nest build"
# prisma/ : schema Prisma pour migrations (exécutées via container)
# package.json : utiles pour des commandes npx prisma dans le conteneur
COPY --from=build /app/apps/api-nest/dist ./apps/api-nest/dist
COPY --from=build /app/apps/api-nest/prisma ./apps/api-nest/prisma
COPY --from=build /app/apps/api-nest/package.json ./apps/api-nest/package.json

# ------------------------------------------------------------
# L’API écoute sur le port 3001
# Ce port sera utilisé par Traefik pour construire la route vers l’API.
# ------------------------------------------------------------
EXPOSE 3001

# ------------------------------------------------------------
# Commande finale :
#   node apps/api-nest/dist/src/main.js
#
# Ce fichier est le point d’entrée compilé de ton application NestJS.
#
# NOTE : la structure "dist/src/main.js" dépend de ton tsconfig
#        et du compilateur Nest. Ce chemin correspond à ta config.
# ------------------------------------------------------------
CMD ["node", "apps/api-nest/dist/src/main.js"]
