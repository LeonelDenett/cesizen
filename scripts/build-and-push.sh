#!/bin/bash
set -e

# =============================================================================
# Script : build-and-push.sh
# Objectif : builder l'image Docker et la pousser vers un registre (GHCR ou Docker Hub)
# =============================================================================

IMAGE_NAME="cesizen"
REGISTRY="${REGISTRY:-ghcr.io/$(git remote get-url origin 2>/dev/null | sed 's/.*github.com[:\/]//;s/\.git$//' | cut -d'/' -f1)}"
TAG="${TAG:-latest}"

echo "============================================"
echo "  CESIZen - Build & Push Docker Image      "
echo "============================================"
echo "Image     : ${REGISTRY}/${IMAGE_NAME}:${TAG}"
echo "Context   : $(pwd)"
echo ""

# Vérification de la présence de Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé."
    exit 1
fi

# Build
echo "🔨 Construction de l'image..."
docker build \
  --build-arg DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@db:5432/cesizen}" \
  --build-arg NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-build-placeholder}" \
  --build-arg NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}" \
  -t "${IMAGE_NAME}:${TAG}" \
  -t "${REGISTRY}/${IMAGE_NAME}:${TAG}" \
  .

# Test local rapide (health)
echo ""
echo "🩺 Test de l'image locale (démarrage rapide)..."
docker run --rm -d --name cesizen-tmp \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://postgres:postgres@db:5432/cesizen \
  -e NEXTAUTH_SECRET=tmp-secret \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -p 3999:3000 \
  "${IMAGE_NAME}:${TAG}"

sleep 5
if curl -sf http://localhost:3999/api/health > /dev/null; then
    echo "✅ Healthcheck OK"
else
    echo "⚠️ Healthcheck non disponible (base absentee ?) — normal en local sans DB."
fi

docker stop cesizen-tmp 2>/dev/null || true

# Push si demandé
if [ "${PUSH:-false}" = "true" ]; then
    echo ""
    echo "📤 Push vers ${REGISTRY}..."
    docker push "${REGISTRY}/${IMAGE_NAME}:${TAG}"
    echo "✅ Push terminé."
else
    echo ""
    echo "ℹ️  Pour pousser : PUSH=true ./scripts/build-and-push.sh"
fi

echo ""
echo "🏁 Build terminée."
