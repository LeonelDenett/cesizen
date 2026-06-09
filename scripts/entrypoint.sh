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

# Vérification de la base SQLite (secrets.db)
# Cette base contient les peppers uniques des utilisateurs (ségrégation des secrets)
SECRETS_DIR=$(dirname "$SECRETS_DB_PATH")
if [ ! -d "$SECRETS_DIR" ]; then
  echo "📁 Création du répertoire des secrets: $SECRETS_DIR"
  mkdir -p "$SECRETS_DIR"
fi

if [ ! -f "$SECRETS_DB_PATH" ]; then
  echo "⚠️  secrets.db non trouvé. Création d'une base vide..."
  # La table sera créée automatiquement par sqlite.ts au démarrage
  touch "$SECRETS_DB_PATH"
  echo "✅ secrets.db initialisé."
else
  echo "✅ secrets.db trouvé."
fi

# Migrations
echo ""
echo "🔄 Exécution des migrations Drizzle..."
if npx drizzle-kit migrate; then
  echo "✅ Migrations appliquées."
else
  echo "⚠️ Aucune migration à appliquer ou erreur non bloquante."
fi

# Seed (idempotent si possible)
# ⚠️ PRODUCTION : le seed est désactivé dans le conteneur Docker.
#    Le seed contient des données de développement (users demo, contenu test)
#    qui écraseraient les données réelles en production.
#    Pour l'initialisation en production, utilisez le script prod-init.sh
#    Pour les environnements de développement, exécutez manuellement :
#      npx tsx scripts/seed-run.ts
#
echo ""
echo "⏭️  Seed ignoré en production (protégé par NODE_ENV)."
echo "   En production, les données doivent être créées manuellement."

echo ""
echo "🚀 Lancement de CESIZen sur le port $PORT..."
echo "============================================"
exec node server.js
