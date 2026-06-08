#!/bin/sh
set -e

echo "============================================"
echo "  CESIZen - Script de démarrage (Docker)   "
echo "============================================"

# Extraction hôte/port depuis DATABASE_URL
# Format attendu : postgresql://user:pass@host:port/db
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

if [ -z "$DB_HOST" ]; then
  DB_HOST="db"
fi
if [ -z "$DB_PORT" ]; then
  DB_PORT="5432"
fi

echo "⏳ Attente de PostgreSQL ($DB_HOST:$DB_PORT)..."

MAX_RETRIES=30
RETRIES=0

until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
    echo "❌ PostgreSQL non disponible après $MAX_RETRIES tentatives. Abandon."
    exit 1
  fi
  echo "   Tentative $RETRIES/$MAX_RETRIES..."
  sleep 2
done

echo "✅ PostgreSQL est disponible !"

# Migrations
echo ""
echo "🔄 Exécution des migrations Drizzle..."
if npx drizzle-kit migrate; then
  echo "✅ Migrations appliquées."
else
  echo "⚠️ Aucune migration à appliquer ou erreur non bloquante."
fi

# Seed (idempotent si possible)
echo ""
echo "🌱 Exécution du seed..."
if npx tsx lib/db/seed.ts; then
  echo "✅ Seed exécuté."
else
  echo "⚠️ Seed déjà présent ou erreur non bloquante."
fi

echo ""
echo "🚀 Lancement de CESIZen sur le port $PORT..."
echo "============================================"
exec node server.js
