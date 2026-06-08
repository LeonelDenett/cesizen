# =============================================================================
# CESIZen - Dockerfile multi-étapes optimisé
# =============================================================================

# ---- Étape 1 : Base commune ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# ---- Étape 2 : Dépendances ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --prefer-offline

# ---- Étape 3 : Builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables nécessaires au build de Next.js (standalone)
# Valeurs par défaut sécurisées pour ne jamais embarquer de vrais secrets
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

ENV DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@db:5432/cesizen}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-build-time-secret-placeholder}
ENV NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}

# Build de l'application Next.js en mode standalone
RUN npm run build

# ---- Étape 4 : Runner (production) ----
FROM base AS runner
ENV NODE_ENV=production

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Outils réseau pour l'attente de la base de données
RUN apk add --no-cache netcat-openbsd

# Copie des artefacts de build standalone
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copie des ressources nécessaires aux migrations / seed
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib/db ./lib/db
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Script d'entrée : attente DB, migrations, seed, démarrage serveur
COPY --chown=nextjs:nodejs scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Healthcheck pour Docker / orchestrateurs
HEALTHCHECK --interval=15s --timeout=5s --start-period=90s --retries=5 \
  CMD wget --spider -q http://127.0.0.1:3000/api/health || exit 1

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/entrypoint.sh"]
