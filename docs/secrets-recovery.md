# 📘 Récupération et sécurité de secrets.db

## Qu'est-ce que secrets.db ?

`secrets.db` est une base SQLite qui contient les **peppers uniques** de chaque utilisateur. 
C'est un mécanisme de **ségrégation des secrets** : les mots de passe sont stockés en deux parties distinctes :

- **PostgreSQL** : les hashes bcrypt (`password_hash`)
- **SQLite** : les peppers uniques (`user_peppers`)

Si un attaquant vole seulement PostgreSQL, il ne peut pas cracker les mots de passe sans le fichier `secrets.db`.

---

## ⚠️ Risque critique

**Si secrets.db est perdu ou corrompu, personne ne peut se connecter.**

Sans le pepper, le système ne peut pas valider :
```
bcrypt.compare("password" + ????, hash_de_PostgreSQL) → ÉCHEC PERMANENT
```

---

## 🔒 Sécurité actuelle

| Aspect | État | Commentaire |
|--------|------|-------------|
| En `.gitignore` | ✅ | Non commité |
| En Docker | ✅ | Volumen persistant `secrets-data` |
| Backup automatique | ✅ | Script `scripts/backup-secrets.sh` |
| Restauration | ✅ | Script `scripts/restore-secrets.sh` |
| Chiffrement | ❌ | Pas de chiffrement (SQLite standard) |
| Accès | ✅ | Accessible seulement dans le conteneur |

---

## 🛠️ Procédures de récupération

### 1. Faire un backup manuel

```bash
# Dans le conteneur Docker
docker exec cesizen-app-prod ./scripts/backup-secrets.sh

# Ou depuis l'hôte
SECRETS_DB_PATH=./secrets.db ./scripts/backup-secrets.sh
```

**Résultat** : Un fichier `secrets.db.YYYYMMDD_HHMMSS` dans `/backups/secrets/`.

### 2. Restaurer depuis le dernier backup

```bash
# Dans le conteneur Docker
docker exec cesizen-app-prod ./scripts/restore-secrets.sh

# Puis redémarrer le conteneur
docker restart cesizen-app-prod
```

**Résultat** : `secrets.db` est remplacé par la dernière copie. Un backup de sécurité est créé avant.

### 3. Restaurer depuis un backup spécifique

```bash
# Dans le conteneur Docker
docker exec cesizen-app-prod ./scripts/restore-secrets.sh /backups/secrets/secrets.db.20250101_120000
```

### 4. Récupération après perte totale

Si le fichier `secrets.db` a été supprimé et il n'y a pas de backup :

```
❌ RÉSULTAT : Tous les utilisateurs sont bloqués
⚠️  ACTION : Régénérer les mots de passe manuellement

1. Créer un nouveau secrets.db vide (touch)
2. Forcer une réinitialisation de mot de passe pour chaque utilisateur
3. Les nouveaux peppers seront générés automatiquement
```

---

## 🚨 Alertes et monitoring

### Alerte 1 : secrets.db manquant
```
Message dans les logs : "⚠️ secrets.db non trouvé"
Action : Le conteneur tente de créer un fichier vide.
Impact : Les nouveaux utilisateurs fonctionneront, mais les anciens seront bloqués.
```

### Alerte 2 : user_peppers vide
```
Message dans les logs : "⚠️ Table user_peppers vide"
Action : Si users a des données mais user_peppers est vide → anomalie critique.
```

### Alerte 3 : Backup échoue
```
Cause : Disque plein, permissions incorrectes
Solution : Vérifier l'espace disque et les permissions du répertoire /backups
```

---

## 📋 Checklist maintenance

- [ ] Vérifier quotidiennement les backups (automatique ou manuel)
- [ ] Tester la restauration une fois par mois
- [ ] Vérifier que le volumen Docker `secrets-data` n'est pas supprimé (`docker compose down -v` efface tout !)
- [ ] Surveiller l'espace disque des backups (limite : 10 copies)

---

## 🔧 Configuration Docker

```yaml
# docker-compose.yml
services:
  app:
    volumes:
      - secrets-data:/secrets    # ← Ne jamais supprimer ce volume
      - secrets-backup:/backups  # ← Backups séparés

volumes:
  secrets-data:
    driver: local
  secrets-backup:
    driver: local
```

---

## 📞 Escalade

En cas de perte de secrets.db sans backup :
1. **Vérifier** si un backup existe sur un autre système
2. **Réinitialiser** les mots de passe de tous les utilisateurs
3. **Informer** les utilisateurs (email)
4. **Documenter** l'incident (post-mortem)

---

*Document créé le 2026-06-09*
*Dernière mise à jour : 2026-06-09*
