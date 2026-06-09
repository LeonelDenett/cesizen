#!/bin/sh
# =============================================================================
# CESIZen - Restauration de secrets.db depuis backup
# =============================================================================
# Ce script restaure secrets.db depuis le dernier backup disponible.
# En cas d'urgence, il peut aussi restaurer depuis un backup spécifique.
#
# Usage (dans le conteneur Docker) :
#   ./scripts/restore-secrets.sh              # Restaurer le dernier backup
#   ./scripts/restore-secrets.sh <fichier>    # Restaurer un backup spécifique
#
# Usage (depuis l'hôte) :
#   docker exec cesizen-app-prod ./scripts/restore-secrets.sh
# =============================================================================

set -e

BACKUP_DIR="/backups/secrets"

# Vérifier que SECRETS_DB_PATH est défini
if [ -z "$SECRETS_DB_PATH" ]; then
  echo "❌ ERREUR : SECRETS_DB_PATH non défini"
  exit 1
fi

echo "🔒 Restauration de secrets.db"
echo "=============================="
echo ""

# Si un fichier spécifique est fourni
if [ -n "$1" ]; then
  SPECIFIC_BACKUP="$1"
  if [ ! -f "$SPECIFIC_BACKUP" ]; then
    echo "❌ ERREUR : Le fichier spécifié n'existe pas : $SPECIFIC_BACKUP"
    exit 1
  fi
  
  echo "⚠️  ATTENTION : Cela remplacera le secrets.db actuel !"
  echo "   Backup source : $SPECIFIC_BACKUP"
  
  # Backup de sécurité avant restauration
  if [ -f "$SECRETS_DB_PATH" ]; then
    SAFETY_BACKUP="$BACKUP_DIR/secrets.db.pre-restore.$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp "$SECRETS_DB_PATH" "$SAFETY_BACKUP"
    echo "   Backup de sécurité créé : $SAFETY_BACKUP"
  fi
  
  cp "$SPECIFIC_BACKUP" "$SECRETS_DB_PATH"
  echo "✅ Restauration terminée depuis : $SPECIFIC_BACKUP"
  echo ""
  echo "📝 IMPORTANT : Redémarrez le conteneur pour recharger les secrets."
  exit 0
fi

# Sinon, restaurer le dernier backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/secrets.db.* 2>/dev/null | grep -v "pre-restore" | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "❌ ERREUR : Aucun backup trouvé dans $BACKUP_DIR"
  echo ""
  echo "📦 Backups disponibles :"
  ls -la "$BACKUP_DIR"/ 2>/dev/null || echo "  Le répertoire n'existe pas"
  exit 1
fi

echo "📦 Dernier backup trouvé : $LATEST_BACKUP"
echo "📍 Destination : $SECRETS_DB_PATH"
echo ""

# Backup de sécurité avant restauration
if [ -f "$SECRETS_DB_PATH" ]; then
  SAFETY_BACKUP="$BACKUP_DIR/secrets.db.pre-restore.$(date +%Y%m%d_%H%M%S)"
  cp "$SECRETS_DB_PATH" "$SAFETY_BACKUP"
  echo "   Backup de sécurité créé : $SAFETY_BACKUP"
fi

echo "⚠️  ATTENTION : Cela remplacera le secrets.db actuel !"

cp "$LATEST_BACKUP" "$SECRETS_DB_PATH"

# Vérifier que le fichier a été restauré
if [ -f "$SECRETS_DB_PATH" ]; then
  echo "✅ Restauration terminée avec succès !"
  echo ""
  echo "📝 IMPORTANT : Redémarrez le conteneur pour recharger les secrets."
  echo "   Commande : docker restart cesizen-app-prod"
else
  echo "❌ ERREUR : La restauration a échoué"
  exit 1
fi
