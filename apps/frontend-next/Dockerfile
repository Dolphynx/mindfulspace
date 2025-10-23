# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# 1) Manifests du monorepo (racine)
# On ajoute tsconfig.base.json pour les "extends" TS dans les apps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# 2) Manifests de l'app front
COPY apps/frontend-next/package.json apps/frontend-next/package.json

# 3) Install PNPM + deps filtrées (workspace)
RUN npm i -g pnpm && pnpm install --filter ./apps/frontend-next...

# (Optionnel) Supprimer un lockfile PNPM local si présent dans l'app pour éviter le warning Turbopack
RUN rm -f /app/apps/frontend-next/pnpm-lock.yaml || true

# 4) Code source de l'app
COPY apps/frontend-next ./apps/frontend-next
WORKDIR /app/apps/frontend-next

# 5) Build Next en mode standalone (voir next.config.ts plus bas)
ENV NODE_ENV=production
RUN pnpm build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copie la sortie standalone générée par Next
COPY --from=build /app/apps/frontend-next/.next/standalone ./
COPY --from=build /app/apps/frontend-next/public ./apps/frontend-next/public
COPY --from=build /app/apps/frontend-next/.next/static ./apps/frontend-next/.next/static

EXPOSE 3000
CMD ["node", "apps/frontend-next/server.js"]
