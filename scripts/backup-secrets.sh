#!/bin/sh
# =============================================================================
# CESIZen - Backup automatique de secrets.db
# =============================================================================
# Ce script crée une copie de sauvegarde de secrets.db avec un timestamp.
# Les backups sont stockés dans /backups/secrets/ et limités aux 10 derniers.
#
# Usage (dans le conteneur Docker) :
#   ./scripts/backup-secrets.sh
#
# Usage (depuis l'hôte) :
#   docker exec cesizen-app-prod ./scripts/backup-secrets.sh
# =============================================================================

set -e

BACKUP_DIR="/backups/secrets"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/secrets.db.$TIMESTAMP"

# Vérifier que SECRETS_DB_PATH est défini
if [ -z "$SECRETS_DB_PATH" ]; then
  echo "❌ ERREUR : SECRETS_DB_PATH non défini"
  echo "   Définissez la variable d'environnement SECRETS_DB_PATH"
  exit 1
fi

# Vérifier que le fichier existe
if [ ! -f "$SECRETS_DB_PATH" ]; then
  echo "❌ ERREUR : $SECRETS_DB_PATH non trouvé"
  echo "   Aucun backup possible."
  exit 1
fi

# Créer le répertoire de backup
mkdir -p "$BACKUP_DIR"

# Créer le backup
cp "$SECRETS_DB_PATH" "$BACKUP_FILE"

# Vérifier que le backup a été créé
if [ -f "$BACKUP_FILE" ]; then
  echo "✅ Backup créé : $BACKUP_FILE"
  echo "   Taille : $(ls -lh "$BACKUP_FILE" | awk '{ print $5 }')"
else
  echo "❌ ERREUR : Le backup n'a pas été créé"
  exit 1
fi

# Nettoyer les anciens backups (garder les 10 derniers)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/secrets.db.* 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
  echo "🧹 Nettoyage des anciens backups ($BACKUP_COUNT trouvés, limite: 10)..."
  ls -t "$BACKUP_DIR"/secrets.db.* | tail -n +11 | xargs -r rm -f
  echo "✅ Anciens backups supprimés."
fi

# Liste des backups disponibles
echo ""
echo "📦 Backups disponibles :"
ls -lt "$BACKUP_DIR"/secrets.db.* 2>/dev/null | head -5 | awk '{print "  " $6, $7, $8, "→", $9}' || echo "  Aucun backup"
