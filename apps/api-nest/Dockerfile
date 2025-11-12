# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /repo

# Dépendances systèmes minimales (openssl pour Prisma)
RUN apk add --no-cache openssl

# PNPM via corepack
RUN corepack enable

# Copie fichiers workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY apps/api-nest/package.json apps/api-nest/package.json

# Installe les deps au niveau monorepo
RUN pnpm install --frozen-lockfile

# Copie le code de l'API (et schema Prisma) puis build
COPY apps/api-nest ./apps/api-nest
WORKDIR /repo/apps/api-nest

# Génère Prisma Client (pas besoin de DB vivante)
RUN npx prisma generate

# Compile Nest
RUN pnpm build

# Prépare un dossier d'exécution minimal avec deps prod
WORKDIR /repo
RUN pnpm deploy --filter ./apps/api-nest --prod /out

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Sécurité: user non-root
#RUN addgroup -S nodejs && adduser -S node -G nodejs
USER node

# Variables
ENV NODE_ENV=production \
    PORT=3001

# Copie artefacts (dist, node_modules, prisma, package.json…)
COPY --from=builder /out/ ./

EXPOSE 3001
CMD ["node","dist/main.js"]
