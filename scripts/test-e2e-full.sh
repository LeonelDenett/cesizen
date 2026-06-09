#!/bin/bash

# ═══════════════════════════════════════════════════════════
# Script E2E complet — CESIZen
# Levanta DB, migra, seedea, levanta servidor, ejecuta tests E2E
# ═══════════════════════════════════════════════════════════

set -euo pipefail

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 CESIZen — E2E Full Test${NC}"

# ── 1. Renombrar .env.local ──
if [ -f .env.local ]; then
  echo -e "${YELLOW}📦 Renombrando .env.local → .env.local.backup${NC}"
  mv .env.local .env.local.backup
fi

# ── 2. Limpiar SQLite y Docker ──
echo -e "${YELLOW}🧹 Limpiando SQLite y Docker...${NC}"
docker compose -f docker-compose.e2e.yml down -v 2>/dev/null || true
rm -f secrets.db secrets.db-shm secrets.db-wal

# ── 3. Levantar PostgreSQL ──
echo -e "${YELLOW}🐘 Levantando PostgreSQL...${NC}"
docker compose -f docker-compose.e2e.yml up db-test -d
sleep 3

# ── 4. Migrar ──
echo -e "${YELLOW}🗄️  Migrando base de datos...${NC}"
DATABASE_URL=postgresql://postgres:postgres@localhost:5479/cesizen_test npx drizzle-kit migrate

# ── 5. Seed ──
echo -e "${YELLOW}🌱 Seedando datos...${NC}"
DATABASE_URL=postgresql://postgres:postgres@localhost:5479/cesizen_test SECRETS_DB_PATH=./secrets.db npx tsx lib/db/seed.ts

# ── 6. Levantar servidor en background ──
echo -e "${YELLOW}🌐 Levantando servidor Next.js...${NC}"
export DATABASE_URL=postgresql://postgres:postgres@localhost:5479/cesizen_test
export NEXTAUTH_SECRET=cesizen-test-secret-key-2026
export NEXTAUTH_URL=http://localhost:3000
export SECRETS_DB_PATH=./secrets.db

npm run dev &
SERVER_PID=$!

# Esperar que el servidor esté listo
echo -e "${YELLOW}⏳ Esperando servidor (3s)...${NC}"
sleep 3

# ── 7. Ejecutar tests E2E ──
echo -e "${GREEN}🧪 Ejecutando tests E2E...${NC}"
npx playwright test --reporter=line || TEST_EXIT=$?

# ── 8. Limpiar ──
echo -e "${YELLOW}🧹 Limpiando...${NC}"
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

# Restaurar .env.local
if [ -f .env.local.backup ]; then
  echo -e "${YELLOW}📦 Restaurando .env.local${NC}"
  mv .env.local.backup .env.local
fi

# ── 9. Resultado ──
if [ -z "${TEST_EXIT:-}" ] || [ "$TEST_EXIT" -eq 0 ]; then
  echo -e "${GREEN}✅ Tests E2E completados exitosamente${NC}"
  exit 0
else
  echo -e "${RED}❌ Tests E2E fallaron (código $TEST_EXIT)${NC}"
  exit $TEST_EXIT
fi
