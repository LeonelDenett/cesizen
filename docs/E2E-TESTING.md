# Tests E2E — Guide de lancement.

## Prérequis

- Docker et Docker Compose installés
- Le projet est construit (`npm run build` doit fonctionner)

## Méthode 1 : Docker (recommandée — environnement isolé)

```bash
# 1. Lancer l'environnement Docker (PostgreSQL + app)
docker compose -f docker-compose.e2e.yml up -d --build

# 2. Attendre que l'app démarre (30-60 secondes)
# Vous pouvez vérifier : curl http://localhost:3000/api/health

# 3. Lancer les tests E2E
npm run test:e2e

# 4. Arrêter l'environnement
docker compose -f docker-compose.e2e.yml down -v
```

## Méthode 2 : Manuel (base locale + serveur local)

```bash
# 1. Démarrer PostgreSQL avec Docker
docker compose up db -d

# 2. Attendre que la base soit prête
sleep 5

# 3. Appliquer les migrations
DATABASE_URL=postgresql://postgres:changeme@localhost:5477/cesizen npx drizzle-kit migrate

# 4. Insérer les données de test
DATABASE_URL=postgresql://postgres:changeme@localhost:5477/cesizen npx tsx scripts/seed-run.ts

# 5. Démarrer le serveur Next.js avec la base locale
DATABASE_URL=postgresql://postgres:changeme@localhost:5477/cesizen \
NEXTAUTH_SECRET=cesizen-test-secret-key-2026 \
NEXTAUTH_URL=http://localhost:3000 \
SECRETS_DB_PATH=./secrets.db \
npm run dev

# 6. Dans un autre terminal, lancer les tests E2E
npm run test:e2e
```

## Dépannage

### Problème : `client password must be a string`

**Cause** : Le fichier `.env.local` avec la base Neon est chargé au lieu de la base locale.

**Solution** : Utiliser la méthode Docker, ou bien passer `DATABASE_URL` explicitement sur la ligne de commande.

### Problème : `SASL: SCRAM-SERVER-FIRST-MESSAGE`

**Cause** : Le mot de passe de PostgreSQL n'est pas correct (celui de docker-compose.yml est `changeme`, pas `postgres`).

**Solution** : Utiliser `DATABASE_URL=postgresql://postgres:changeme@localhost:5477/cesizen` avec le mot de passe `changeme`.

### Problème : `getByText('CESIZen')` ambigu

**Cause** : Plusieurs éléments sur la page contiennent "CESIZen".

**Solution** : Utiliser `getByRole('heading', { name: '...' }).first()` au lieu de `getByText('CESIZen')`.

## Vérifier la base de données

```bash
# Accéder au conteneur PostgreSQL
docker exec -it cesizen-db-test psql -U postgres -d cesizen_test

# Vérifier les tables
\dt

# Vérifier les utilisateurs
SELECT * FROM users;

# Quitter
\q
```

---

*Document mis à jour le 2026-06-09*
