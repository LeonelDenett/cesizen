#!/bin/bash
# CESIZen - Déployement en 1 ligne
# Usage: bash <(curl -fsSL https://raw.githubusercontent.com/LeonelDenett/cesizen/main/scripts/deploy.sh)

set -e

DIR="${HOME}/cesizen"
mkdir -p "$DIR" && cd "$DIR"

# Créer le docker-compose minimal
if [ ! -f docker-compose.yml ]; then
  cat > docker-compose.yml << 'EOF'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cesizen
    ports:
      - "127.0.0.1:5479:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
  app:
    image: leoneldenettdev/cesizen:latest
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@db:5432/cesizen
      NEXTAUTH_SECRET: cesizen-demo-secret-key-2026
      NEXTAUTH_URL: http://localhost:3000
      SECRETS_DB_PATH: /tmp/secrets.db
    depends_on:
      db:
        condition: service_healthy
    command: >
      sh -c "
        npx drizzle-kit migrate &&
        npx tsx scripts/seed-run.ts &&
        node server.js
      "
EOF
fi

echo "🐳 Lancement de CESIZen..."
docker compose up -d

echo "⏳ Attente..."
for i in {1..30}; do
  if curl -fsSL http://localhost:3000/api/health > /dev/null 2>&1; then
    echo ""
    echo "✅ CESIZen déployé sur http://localhost:3000"
    echo "👤 admin@cesizen.fr / Admin1234!Secure"
    exit 0
  fi
  echo "   Attente... ($i/30)"
  sleep 2
done

echo ""
echo "⚠️  Vérifiez les logs: docker compose logs -f"
