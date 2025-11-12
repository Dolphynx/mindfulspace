# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /repo
RUN corepack enable

# Dépendances build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY apps/frontend-next/package.json apps/frontend-next/package.json
RUN pnpm install --frozen-lockfile

# Copie code front et build
COPY apps/frontend-next ./apps/frontend-next
WORKDIR /repo/apps/frontend-next

# Important: next.config.js doit être en mode "output: 'standalone'"
# et inclure les variables publiques nécessaires via process.env.* si besoin.
RUN pnpm build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Sécurité: user non-root
#RUN addgroup -S nodejs && adduser -S node -G nodejs
USER node

# Copie le build standalone + public
# - .next/standalone contient server.js + node_modules minimaux
# - .next/static et public sont requis
COPY --from=builder /repo/apps/frontend-next/.next/standalone ./
COPY --from=builder /repo/apps/frontend-next/public ./public
COPY --from=builder /repo/apps/frontend-next/.next/static ./.next/static

EXPOSE 3000
CMD ["node","server.js"]
