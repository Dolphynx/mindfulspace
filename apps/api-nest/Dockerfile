# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /repo

# Dépendances systèmes minimales (openssl pour Prisma)
RUN apk add --no-cache openssl

# PNPM via corepack
RUN corepack enable

# On désactive le postinstall automatique de Prisma pendant l'install
# (on fera le `prisma generate` nous-mêmes plus bas, quand le schéma sera présent)
ENV PRISMA_SKIP_POSTINSTALL=1 \
    DATABASE_URL="postgresql://fake:fake@localhost:5432/fake?schema=public"

# Copie des fichiers racine du monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./

# Copie du manifeste de l'API + **schéma Prisma**
COPY apps/api-nest/package.json apps/api-nest/package.json
COPY apps/api-nest/prisma apps/api-nest/prisma

# Installe les deps au niveau monorepo
RUN pnpm install --frozen-lockfile

# Copie le reste du code de l'API puis build
COPY apps/api-nest ./apps/api-nest
WORKDIR /repo/apps/api-nest

# Génère Prisma Client (maintenant que le schema est bien là)
RUN npx prisma generate

# Compile Nest
RUN pnpm build

# Prépare un dossier d'exécution minimal avec deps prod
WORKDIR /repo
RUN pnpm deploy --filter ./apps/api-nest --prod /out

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

# l'image officielle Node a déjà un user "node"
USER node

ENV NODE_ENV=production \
    PORT=3001

# Copie artefacts (dist, node_modules, prisma, package.json…)
COPY --from=builder /out/ ./

EXPOSE 3001
CMD ["node","dist/main.js"]
