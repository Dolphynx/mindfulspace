# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# 1) Manifests racine + base TS (important pour extends ../../tsconfig.base.json)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# 2) Manifests de l'API
COPY apps/api-nest/package.json apps/api-nest/package.json

# 3) Install
RUN npm i -g pnpm && pnpm install --filter ./apps/api-nest...

# (Optionnel) on nettoie un lockfile local éventuel dans l'API
RUN rm -f /app/apps/api-nest/pnpm-lock.yaml /app/apps/api-nest/pnpm-workspace.yaml || true

# 4) Code de l'API + build Nest → dist/
COPY apps/api-nest ./apps/api-nest
WORKDIR /app/apps/api-nest
RUN pnpm build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Deps prod uniquement pour l'API
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-nest/package.json ./apps/api-nest/package.json
RUN pnpm install --filter ./apps/api-nest... --prod

# Binaire Nest compilé
COPY --from=build /app/apps/api-nest/dist ./apps/api-nest/dist

EXPOSE 3001
CMD ["node", "apps/api-nest/dist/main.js"]
