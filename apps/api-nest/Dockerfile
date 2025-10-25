# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# 1) Manifeste racine / workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# 2) Manifeste API
COPY apps/api-nest/package.json apps/api-nest/package.json

# 3) Installer pnpm + toutes les deps du monorepo
RUN npm i -g pnpm && pnpm install

# 4) Copier le code source de l'API et builder
COPY apps/api-nest ./apps/api-nest
WORKDIR /app/apps/api-nest
ENV NODE_ENV=production
RUN pnpm build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# On copie les deps telles qu'installées dans l'étape build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api-nest/node_modules ./apps/api-nest/node_modules

# On copie le build compilé NestJS
COPY --from=build /app/apps/api-nest/dist ./apps/api-nest/dist

EXPOSE 3001
CMD ["node", "apps/api-nest/dist/main.js"]
