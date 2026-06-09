# Plan de déploiement CESIZen — Guide pratique

> Ce guide explique **pas à pas** comment déployer CESIZen en local avec Docker, comment fonctionne la pipeline CI/CD et comment maintenir le projet.

---

## Déployer en local avec Docker (5 minutes)

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
```

### 4. Lancer l'application

```bash
./scripts/deploy-local.sh
```

Ce script automatique va :
1. Vérifier que `.env` existe
2. Construire l'image Docker (`docker compose up --build -d`)
3. Attendre que PostgreSQL démarre (healthcheck)
4. Appliquer les migrations Drizzle
5. Exécuter le seed (données de démo)
6. Tester que l'application répond sur `/api/health`

### 5. Accéder à l'application

| URL | Description |
|-----|-------------|
| `http://localhost:3333` | Application web |
| `http://localhost:3333/api/health` | Healthcheck JSON |

### Comptes de démo

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@cesizen.fr` | `Admin123!` | Administrateur |
| `marie@cesizen.fr` | `User1234` | Utilisateur |

### Commandes utiles

```bash
# Voir les logs de l'application
docker compose logs -f app

# Voir les logs de la base
docker compose logs -f db

# Arrêter (sans perdre les données)
docker compose down

# Arrêter et supprimer TOUTES les données (⚠️)
docker compose down -v

# Redémarrer
docker compose up -d
```

---

## Les 3 environnements

| Environnement | Fichier | Port | Base | Usage |
|---------------|---------|------|------|-------|
| **Production** | `docker-compose.yml` | 3333 | `cesizen` | Déploiement réel avec persistance |
| **Développement** | `docker-compose.dev.yml` | 3000 | `cesizen` | Hot-reload du code source |
| **Tests** | `docker-compose.test.yml` | 3001 | `cesizen_test` | Exécuter les tests manuellement |

### Lancer en développement (hot-reload)

```bash
docker compose -f docker-compose.dev.yml up
```

Le code source est monté en volume : toute modification est immédiatement visible.

### Lancer les tests manuellement

```bash
docker compose -f docker-compose.test.yml up --build -d
docker compose -f docker-compose.test.yml exec app-test sh
# Dans le conteneur
npm run test          # Tests unitaires
npm run test:e2e      # Tests end-to-end
```

---

## Architecture Docker

```
┌─────────────────────────────────────────────────┐
│  Utilisateur (navigateur)                        │
└──────────────┬────────────────────────────────────┘
               │ http://localhost:3333
┌──────────────▼────────────────────────────────────┐
│  CESIZen App (Next.js standalone)                │
│  → Port 3000, utilisateur non-root               │
│  → Healthcheck sur /api/health                   │
└──────────────┬────────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────────┐
│  PostgreSQL 16 (Alpine)                          │
│  → Port 127.0.0.1:5477 (non exposé publiquement) │
│  → Volume persistant pgdata-prod                   │
└───────────────────────────────────────────────────┘
```

### Dockerfile (multi-étapes)

| Étape | Rôle | Image |
|-------|------|-------|
| `deps` | Installe les dépendances npm | `node:20-alpine` |
| `builder` | Compile Next.js en mode standalone | `node:20-alpine` |
| `runner` | Image finale allégée, user non-root | `node:20-alpine` |

---

## Pipeline CI/CD (GitHub Actions)

Fichier : `.github/workflows/ci.yml`

Déclencheurs : push sur `main` / `develop`, Pull Request, manuel.

```
┌──────────┐   ┌──────────┐   ┌──────────┐
│   Lint   │   │  Tests   │   │  Build   │
│ (ESLint) │   │  (Jest)  │   │(Next.js) │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
     └──────────────┴──────────────┘
                    │
          ┌─────────▼──────────┐
          │ Docker build + Trivy │
          └─────────┬──────────┘
                    │
          ┌─────────▼──────────┐
          │  Tests E2E         │
          │  (non-bloquant)    │
          └─────────┬──────────┘
                    │
          ┌─────────▼──────────┐
          │ Push image → GHCR  │
          │  (si main)         │
          └────────────────────┘
```

| Job | Description | Résultat attendu |
|-----|-------------|----------------|
| 🔍 Lint | ESLint sur tout le code | Vert |
| 🧪 Tests unitaires | Jest 171 tests + couverture | Vert |
| 🏗️ Build | `next build` en mode standalone | Vert |
| 🛡️ Sécurité | `npm audit` + Trivy scan | Jaune (warnings OK) |
| 🐳 Docker build | Construction de l'image | Vert |
| 🎭 Tests E2E | Playwright (non-bloquant) | Jaune |
| 🚀 Déploiement | Push vers `ghcr.io` | Vert (si main) |

---

## Versioning (Git)

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

## Maintenance et ticketing

### Outil

**GitHub Issues** + **GitHub Projects** (tableau Kanban)

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

### Flux de travail

1. Créer un ticket GitHub (titre, type, priorité)
2. Créer une branche `fix/XXX` ou `feature/XXX`
3. Commits atomiques avec référence au ticket
4. Pull Request → revue CI
5. Merge sur `develop` puis `main`

### Veille technologique

- **Dependabot** : PR automatiques de mise à jour (npm, Docker, GitHub Actions)
- **Sources** : Next.js releases, Node.js security, OWASP Top 10

---

## Sécurité

### Risques identifiés

| Risque | Criticité | Mesure |
|--------|-----------|--------|
| Injection SQL | Critique | Drizzle ORM (requêtes paramétrées) |
| XSS | Élevé | React échappement + CSP headers |
| Fuite secrets | Critique | `.env` non versionné, GitHub Secrets |
| Session hijacking | Élevé | JWT signés + cookies Secure/HttpOnly |
| DOS | Moyen | Rate-limiting + bcrypt lent |

### Headers HTTP sécurisés (configurés dans `next.config.ts`)

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

## Checklist avant mise en production

- [ ] Tests unitaires passent (`npm run test`)
- [ ] Lint propre (`npm run lint`)
- [ ] Pipeline CI verte sur `develop`
- [ ] Variables `.env` renseignées et uniques
- [ ] Backup de la base de données prévu
- [ ] Plan de rollback connu (tag Docker + backup)

---

## Ressources

| Document | Contenu |
|----------|---------|
| `README.md` | Vue d'ensemble du projet |
| `docs/rapport.md` | Rapport complet Bloc 3 |
| `docs/rgpd.md` | Registre des traitements |
| `docs/workflow.md` | Flux de travail ticket → merge |
| `docs/tasks.md` | Checklist des actions à réaliser |

---

*Guide mis à jour — Juin 2026*
