# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# 1) Copie des manifestes racine nécessaires à PNPM
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# 2) Copie des manifestes des apps dont on dépend
COPY apps/frontend-next/package.json apps/frontend-next/package.json

# Étape clé :
# On installe PNPM global, puis on installe TOUTES les deps du monorepo,
# pas juste le filtre frontal. Pourquoi ?
# - PNPM va créer le store partagé et les node_modules avec les bons liens.
# - Ensuite on pourra builder juste le frontend.
RUN npm i -g pnpm && pnpm install

# 3) Maintenant qu'on a les deps, on copie le code source complet du front
COPY apps/frontend-next ./apps/frontend-next

# 4) Build Next.js en mode production standalone
WORKDIR /app/apps/frontend-next
ENV NODE_ENV=production
RUN pnpm build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# On copie uniquement ce qui est nécessaire pour faire tourner l'app
# (le build standalone de Next embarque déjà les node_modules utiles)
COPY --from=build /app/apps/frontend-next/.next/standalone ./
COPY --from=build /app/apps/frontend-next/public ./apps/frontend-next/public
COPY --from=build /app/apps/frontend-next/.next/static ./apps/frontend-next/.next/static

EXPOSE 3000
CMD ["node", "apps/frontend-next/server.js"]
