#!/bin/bash
set -e

# =============================================================================
# Script : deploy-local.sh
# Objectif : déployer CESIZen en local via Docker Compose (production)
# =============================================================================

COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

echo "============================================"
echo "  CESIZen - Déploiement local (Docker)     "
echo "============================================"

# Vérification du fichier d'environnement
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Fichier $ENV_FILE manquant."
    echo "   Création depuis le template .env.example..."
    cp .env.example "$ENV_FILE"
    echo "   ➜ Modifiez $ENV_FILE avec vos vrais secrets avant de relancer."
    exit 1
fi

# Chargement des variables (optionnel, compose lit directement .env)
# export $(grep -v '^#' "$ENV_FILE" | xargs) 2>/dev/null || true

echo ""
echo "📦 Démarrage des services (build inclus)..."
docker compose -f "$COMPOSE_FILE" up --build -d

echo ""
echo "⏳ Attente du démarrage complet (10s)..."
sleep 10

echo ""
echo "🔎 Vérification des conteneurs :"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "🩺 Healthcheck application :"
APP_PORT=$(grep APP_PORT "$ENV_FILE" | cut -d '=' -f2 || echo "3333")
if curl -sf "http://127.0.0.1:${APP_PORT}/api/health" > /dev/null; then
    echo "✅ Application en ligne sur http://127.0.0.1:${APP_PORT}"
else
    echo "⚠️  L'application ne répond pas encore — vérifiez les logs :"
    echo "   docker compose -f ${COMPOSE_FILE} logs -f app"
fi

echo ""
echo "📋 Commandes utiles :"
echo "   docker compose -f ${COMPOSE_FILE} logs -f app   # logs application"
echo "   docker compose -f ${COMPOSE_FILE} down            # arrêt complet"
echo "   docker compose -f ${COMPOSE_FILE} down -v         # arrêt + suppression données"
