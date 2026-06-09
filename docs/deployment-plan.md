# Plan de déploiement CESIZen — Guide complet

> Ce guide explique **pas à pas** comment déployer CESIZen en local, en production, et comment distribuer l'image Docker.

---

## 🎯 Architecture de déploiement

```
┌─────────────────────────────────────────────────────────┐
│  Utilisateur (navigateur)                                │
│  http://localhost:3333                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  🐳 Conteneur : cesizen-app-prod                         │
│  ├─ Next.js (frontend + backend)                       │
│  ├─ Port 3000, utilisateur non-root (nextjs)            │
│  ├─ Healthcheck : /api/health                            │
│  ├─ secrets.db (SQLite) → /secrets/secrets.db              │
│  └─ Connexion à PostgreSQL via réseau interne            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  🐳 Conteneur : cesizen-db-prod                          │
│  ├─ PostgreSQL 16 (Alpine)                               │
│  ├─ Port 127.0.0.1:5477 (localhost uniquement)         │
│  ├─ Volume persistant : pgdata-prod                      │
│  └─ Healthcheck : pg_isready                             │
└─────────────────────────────────────────────────────────┘
```

## 📦 Déployer en local avec Docker (5 minutes)

### Option A : Déploiement en une ligne (One-liner)

```bash
curl -fsSL https://raw.githubusercontent.com/LeonelDenett/cesizen/main/scripts/deploy-one-liner.sh | bash
```

**Ce script automatique fait tout :**
1. Crée un dossier `~/cesizen`
2. Télécharge `docker-compose.yml` et `.env.example` depuis GitHub
3. Génère des secrets aléatoires (PostgreSQL password + NEXTAUTH_SECRET)
4. Télécharge l'image Docker depuis GitHub Container Registry
5. Lance l'application avec Docker Compose
6. Attend le healthcheck et affiche le résumé

**Accès :** http://localhost:3333

### Option B : Déploiement manuel (Git + Docker)

### 1. Prérequis

- [Git](https://git-scm.com/) installé
- [Docker](https://docs.docker.com/get-docker/) installé
- [Docker Compose](https://docs.docker.com/compose/install/) installé

### 2. Récupérer le code

```bash
git clone https://github.com/LeonelDenett/cesizen.git
cd cesizen
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Modifier `.env` avec vos propres valeurs (au minimum `POSTGRES_PASSWORD` et `NEXTAUTH_SECRET`) :

```bash
# Base de données
POSTGRES_PASSWORD=mon-mot-de-passe-secu
DATABASE_URL=postgresql://postgres:mon-mot-de-passe-secu@db:5432/cesizen

# Authentification
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3333

# Port d'accès
APP_PORT=3333

# Secrets (SQLite)
SECRETS_DB_PATH=/secrets/secrets.db
```

### 4. Lancer l'application

```bash
./scripts/deploy-local.sh
```

Ce script automatique va :
1. Vérifier que `.env` existe
2. Construire l'image Docker (`docker compose up --build -d`)
3. Attendre que PostgreSQL démarre (healthcheck)
4. Attendre que secrets.db soit accessible
5. Appliquer les migrations Drizzle
6. Tester que l'application répond sur `/api/health`

### 5. Accéder à l'application

| URL | Description |
|-----|-------------|
| `http://localhost:3333` | Application web |
| `http://localhost:3333/api/health` | Healthcheck JSON |

### Comptes de démo

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@cesizen.fr` | `Admin1234!Secure` | Administrateur |
| `marie@cesizen.fr` | `User1234!Secure` | Utilisateur |

### Commandes utiles

```bash
# Voir les logs de l'application
docker compose logs -f app

# Voir les logs de la base
docker compose logs -f db

# Vérifier le healthcheck
curl http://localhost:3333/api/health

# Arrêter (sans perdre les données)
docker compose down

# Arrêter et supprimer TOUTES les données (⚠️)
docker compose down -v

# Redémarrer
docker compose up -d

# Backup des secrets
docker exec cesizen-app-prod ./scripts/backup-secrets.sh

# Restaurer les secrets
docker exec cesizen-app-prod ./scripts/restore-secrets.sh
```
┌─────────────────────────────────────────────────────────┐
│  Utilisateur (navigateur)                                │
│  http://localhost:3333                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  🐳 Conteneur : cesizen-app-prod                         │
│  ├─ Next.js (frontend + backend)                       │
│  ├─ Port 3000, utilisateur non-root (nextjs)            │
│  ├─ Healthcheck : /api/health                            │
│  ├─ secrets.db (SQLite) → /secrets/secrets.db              │
│  └─ Connexion à PostgreSQL via réseau interne            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  🐳 Conteneur : cesizen-db-prod                          │
│  ├─ PostgreSQL 16 (Alpine)                               │
│  ├─ Port 127.0.0.1:5477 (localhost uniquement)         │
│  ├─ Volume persistant : pgdata-prod                      │
│  └─ Healthcheck : pg_isready                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Déployer en local avec Docker (5 minutes)

### 1. Prérequis

- [Git](https://git-scm.com/) installé
- [Docker](https://docs.docker.com/get-docker/) installé
- [Docker Compose](https://docs.docker.com/compose/install/) installé

### 2. Récupérer le code

```bash
git clone https://github.com/LeonelDenett/cesizen.git
cd cesizen
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Modifier `.env` avec vos propres valeurs (au minimum `POSTGRES_PASSWORD` et `NEXTAUTH_SECRET`) :

```bash
# Base de données
POSTGRES_PASSWORD=mon-mot-de-passe-secu
DATABASE_URL=postgresql://postgres:mon-mot-de-passe-secu@db:5432/cesizen

# Authentification
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3333

# Port d'accès
APP_PORT=3333

# Secrets (SQLite)
SECRETS_DB_PATH=/secrets/secrets.db
```

### 4. Lancer l'application

```bash
./scripts/deploy-local.sh
```

Ce script automatique va :
1. Vérifier que `.env` existe
2. Construire l'image Docker (`docker compose up --build -d`)
3. Attendre que PostgreSQL démarre (healthcheck)
4. Attendre que secrets.db soit accessible
5. Appliquer les migrations Drizzle
6. Tester que l'application répond sur `/api/health`

### 5. Accéder à l'application

| URL | Description |
|-----|-------------|
| `http://localhost:3333` | Application web |
| `http://localhost:3333/api/health` | Healthcheck JSON |

### Comptes de démo

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@cesizen.fr` | `Admin1234!Secure` | Administrateur |
| `marie@cesizen.fr` | `User1234!Secure` | Utilisateur |

### Commandes utiles

```bash
# Voir les logs de l'application
docker compose logs -f app

# Voir les logs de la base
docker compose logs -f db

# Vérifier le healthcheck
curl http://localhost:3333/api/health

# Arrêter (sans perdre les données)
docker compose down

# Arrêter et supprimer TOUTES les données (⚠️)
docker compose down -v

# Redémarrer
docker compose up -d

# Backup des secrets
docker exec cesizen-app-prod ./scripts/backup-secrets.sh

# Restaurer les secrets
docker exec cesizen-app-prod ./scripts/restore-secrets.sh
```

---

## 🌐 Les 3 environnements

| Environnement | Fichier | Port | Base | Usage |
|---------------|---------|------|------|-------|
| **Production** | `docker-compose.yml` | 3333 | `cesizen` | Déploiement réel avec persistance |
| **Développement** | `docker-compose.dev.yml` | 3000 | `cesizen` | Hot-reload du code source |
| **Tests** | `docker-compose.e2e.yml` | 5479 | `cesizen_test` | Exécuter les tests E2E |

### Lancer en développement (hot-reload)

```bash
docker compose -f docker-compose.dev.yml up
```

Le code source est monté en volume : toute modification est immédiatement visible.

### Lancer les tests E2E

```bash
npm run test:e2e:local
```

Automatiquement :
1. Levanta PostgreSQL en Docker
2. Migre la base
3. Seed les données
4. Lance le serveur
5. Exécute les tests Playwright
6. Nettoie tout

---

## 🐳 Dockerfile multi-étapes

```dockerfile
# Étape 1 : Base
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# Étape 2 : Dépendances
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --prefer-offline

# Étape 3 : Builder
FROM base AS builder
RUN apk add --no-cache python3 make g++ gcc libc-dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm rebuild better-sqlite3
RUN npm run build

# Étape 4 : Runtime
FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache python3 make g++ gcc libc-dev netcat-openbsd
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/lib/db ./lib/db
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
HEALTHCHECK --interval=15s --timeout=5s --start-period=90s --retries=5 \
  CMD wget --spider -q http://127.0.0.1:3000/api/health || exit 1
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/entrypoint.sh"]
```

**Sécurité** :
- Image Alpine (minimale)
- Utilisateur non-root (`nextjs:nodejs`, UID 1001)
- Pas de secrets dans l'image (ARG avec placeholders)
- Healthcheck applicatif
- `dumb-init` pour gérer les signaux correctement

---

## 🔄 Pipeline CI/CD (GitHub Actions)

Fichier : `.github/workflows/ci.yml`

Déclencheurs : push sur `main` / `develop`, Pull Request, manuel.

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   Lint   │   │  Tests   │   │  Build   │   │SonarCloud│
│ (ESLint) │   │  (Jest)  │   │(Next.js) │   │  SAST    │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │              │
     └──────────────┴──────────────┴──────────────┘
                    │
          ┌─────────▼──────────┐
          │ Security Scan      │
          │ (Trivy + npm audit)│
          └─────────┬──────────┘
                    │
          ┌─────────▼──────────┐
          │ Docker Build       │
          │ (Buildx + cache)   │
          └─────────┬──────────┘
                    │
          ┌─────────▼──────────┐
          │ Tests E2E          │
          │ (Playwright)       │
          └─────────┬──────────┘
                    │
          ┌─────────▼──────────┐
          │ Push image → GHCR  │
          │  (si main)         │
          └────────────────────┘
```

| Job | Description | Résultat attendu |
|-----|-------------|----------------|
| 🔍 Lint | ESLint sur tout le code | Vert (0 errors) |
| 🧪 Tests unitaires | Jest 171 tests + couverture | Vert (≥ 70%) |
| 🏗️ Build | `next build` en mode standalone | Vert |
| 🔍 SonarCloud | Analyse SAST | Vert (pas de vulnérabilité critique) |
| 🛡️ Sécurité | `npm audit` + Trivy scan | Jaune (warnings OK) |
| 🐳 Docker build | Construction de l'image | Vert |
| 🎭 Tests E2E | Playwright | Vert (4 tests pass) |
| 🚀 Déploiement | Push vers `ghcr.io` | Vert (si main) |

---

## 🚀 Distribution de l'image

**Actuellement — GitHub Container Registry (GHCR)**

```bash
# Pull depuis GitHub Container Registry
docker pull ghcr.io/leoneldenett/cesizen:latest

# Construction locale
docker build -t cesizen:latest .
```

**Perspectives — Docker Hub (futur)**

```bash
# Pull depuis Docker Hub (futur)
docker pull leoneldenettdev/cesizen:latest

# Déploiement en une ligne (futur)
bash <(curl -fsSL https://raw.githubusercontent.com/LeonelDenett/cesizen/main/scripts/deploy.sh)
```

**Ce que fera le script (futur) :**
1. Créer le dossier `~/cesizen`
2. Créer un `docker-compose.yml` minimal (PostgreSQL + app)
3. Télécharger l'image depuis Docker Hub
4. Lancer l'application
5. Attendre le healthcheck

**Résultat :** http://localhost:3000

**Pull et run** :
```bash
# Pull de l'image
docker pull ghcr.io/leoneldenett/cesizen:latest

# Lancer avec docker-compose
wget https://raw.githubusercontent.com/LeonelDenett/cesizen/main/docker-compose.yml
wget https://raw.githubusercontent.com/LeonelDenett/cesizen/main/.env.example
cp .env.example .env
# Modifier .env
docker compose up -d
```

### Docker Hub (optionnel)

```bash
# Login
 docker login -u LeonelDenett

# Tag et push
 docker tag cesizen:latest docker.io/leoneldenett/cesizen:latest
 docker push docker.io/leoneldenett/cesizen:latest
```

---

## 📋 Versioning (Git)

### Branches

| Branche | Usage |
|---------|-------|
| `main` | Code stable, tags de version |
| `develop` | Intégration continue |
| `feature/XXX` | Nouvelles fonctionnalités |
| `fix/XXX` | Corrections de bugs |
| `security/XXX` | Correctifs de sécurité |

### Commits

Format : `type: description (#ticket)`

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `test:` ajout/modification de tests
- `chore:` tâches de maintenance
- `security:` correctif de sécurité

### Tags

```bash
# Créer une release
git tag -a v1.0.0 -m "Release v1.0.0 MVP CESIZen"
git push origin v1.0.0
```

---

## 🔧 Maintenance et sécurité

### Ticketing

**Outil** : GitHub Issues + GitHub Projects (tableau Kanban)

### Labels

- `bug` / `evolution` / `security` / `debt`
- `priority:critical` / `priority:high` / `priority:medium` / `priority:low`

### SLA de correction

| Priorité | Délai de prise en charge | Délai de correction |
|----------|--------------------------|---------------------|
| Critique (prod down) | 1h | 4h |
| Haute | 4h | 24h |
| Moyenne | 24h | 1 semaine |
| Basse | 1 semaine | Prochain sprint |

### Veille technologique

- **Dependabot** : PR automatiques de mise à jour
- **Sources** : Next.js releases, Node.js security, OWASP Top 10

---

## 🔒 Sécurité

### Risques identifiés

| Risque | Criticité | Mesure |
|--------|-----------|--------|
| Injection SQL | Critique | Drizzle ORM (requêtes paramétrées) |
| XSS | Élevé | React échappement + CSP headers |
| Fuite secrets | Critique | `.env` non versionné, GitHub Secrets |
| Session hijacking | Élevé | JWT signés + cookies Secure/HttpOnly |
| DOS | Moyen | Rate-limiting + bcrypt lent |
| Perte secrets.db | Critique | Backup automatique + restore |
| Seed en production | Critique | Protection NODE_ENV |

### Headers HTTP sécurisés

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

### RGPD

- Consentement explicite lors de l'inscription
- Droit à l'effacement (`/api/account` DELETE)
- Minimisation des données collectées
- Registre des traitements : `docs/rgpd.md`

---

## ✅ Checklist avant mise en production

- [ ] Tests unitaires passent (`npm run test`)
- [ ] Lint propre (`npm run lint`)
- [ ] Pipeline CI verte sur `develop`
- [ ] Variables `.env` renseignées et uniques
- [ ] Backup de la base de données prévu
- [ ] Backup de secrets.db configuré
- [ ] Plan de rollback connu (tag Docker + backup)
- [ ] SonarCloud scan propre
- [ ] Branch protection activée
- [ ] Definition of Done respectée

---

## 📚 Ressources

| Document | Contenu |
|----------|---------|
| `README.md` | Vue d'ensemble du projet |
| `docs/rapport.md` | Rapport complet Bloc 3 |
| `docs/deployment-plan.md` | Ce guide |
| `docs/rgpd.md` | Registre des traitements |
| `docs/workflow.md` | Flux de travail ticket → merge |
| `docs/tasks.md` | Checklist des actions à réaliser |
| `docs/test-commands.md` | Commandes de test |
| `docs/secrets-recovery.md` | Récupération de secrets.db |
| `docs/presentation.md` | Guide de soutenance |

---

*Guide mis à jour — Juin 2026*
