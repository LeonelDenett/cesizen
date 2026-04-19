#!/bin/bash
set -e

echo "🚀 CESIZen — Lanzando entorno de desarrollo..."
echo ""

# Matar cualquier next dev previo en este proyecto
EXISTING_PID=$(lsof -ti :3333 2>/dev/null || true)
if [ -n "$EXISTING_PID" ]; then
  echo "⚠️  Puerto 3333 ocupado (PID $EXISTING_PID), matando proceso..."
  kill $EXISTING_PID 2>/dev/null || true
  sleep 1
  echo "✅ Proceso anterior detenido"
fi

# Levantar PostgreSQL y esperar a que esté listo
echo "📦 Levantando PostgreSQL (puerto 5434)..."
docker compose -f docker-compose.dev.yml up -d db
echo "⏳ Esperando a que PostgreSQL esté listo..."
until docker compose -f docker-compose.dev.yml exec db pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL listo"
echo ""

# Exportar DATABASE_URL para herramientas locales
export DATABASE_URL="postgresql://postgres:postgres@localhost:5477/cesizen"
export NEXTAUTH_SECRET="dev-secret-key"
export NEXTAUTH_URL="http://localhost:3333"

# Correr migraciones
echo "🔄 Ejecutando migraciones..."
npx drizzle-kit migrate 2>/dev/null || echo "⚠️  Sin migraciones pendientes"
echo ""

# Seed
echo "🌱 Ejecutando seed..."
npx tsx lib/db/seed.ts 2>/dev/null || echo "⚠️  Seed ya ejecutado o error en seed"
echo ""

echo "═══════════════════════════════════════"
echo "🌐 Next.js     → http://localhost:3333"
echo "🐘 PostgreSQL  → localhost:5477"
echo "👤 Admin       → admin@cesizen.fr / Admin1234"
echo "═══════════════════════════════════════"
echo ""
echo "Ctrl+C para detener Next.js"
echo "docker compose -f docker-compose.dev.yml down  para detener PostgreSQL"
echo ""

npm run dev -- -p 3333
