# CESIZen — Application de bien-être

Application Next.js pour la gestion du bien-être (exercices de respiration, suivi des émotions, défis) avec authentification et base de données PostgreSQL.

## Stack technique

- **Frontend :** Next.js 16, React 19, Tailwind CSS
- **Backend :** Next.js API Routes
- **Base de données :** PostgreSQL 16 avec Drizzle ORM
- **Authentification :** NextAuth.js
- **Tests :** Jest (unitaires), Playwright (E2E)
- **Déploiement :** Docker multi-étapes + Docker Compose
- **CI/CD :** GitHub Actions

---

## Prérequis

- Node.js 20+
- Docker & Docker Compose
- (Optionnel) npm ou pnpm

---

## Configuration

1. Copier le fichier d'exemple :
```bash
cp .env.example .env.local   # dev local
cp .env.example .env         # Docker Compose production
```

2. Modifier les variables sensibles :
```env
POSTGRES_PASSWORD=votre-mot-de-passe-securise
NEXTAUTH_SECRET=votre-secret-min-32-caracteres
APP_PORT=3333
```

> **Attention** : `.env.local` et `.env` ne doivent **jamais** être versionnés.

---

## Lancement en développement

### Avec Docker Compose (recommandé)

```bash
docker compose -f docker-compose.dev.yml up
```

Accès : [http://localhost:3000](http://localhost:3000)  
La base de données est exposée sur `127.0.0.1:5477`.

### En local (hors Docker)

```bash
npm install
npm run dev
```

Nécessite un PostgreSQL local accessible via `DATABASE_URL`.

---

## Lancement en production (local / démonstration)

Un script automatisé est fourni :

```bash
./scripts/deploy-local.sh
```

Ce script :
- vérifie la présence du fichier `.env`,
- lance `docker compose up --build -d`,
- attend le démarrage et teste l'endpoint `/api/health`.

Accès : [http://127.0.0.1:3333](http://127.0.0.1:3333) (ou le port défini dans `APP_PORT`).

### Arrêt

```bash
docker compose down        # arrêt
docker compose down -v     # arrêt + suppression des volumes (données)
```

---

## Tests

### Unitaires

```bash
npm run test
```

### End-to-end (Playwright)

```bash
npx playwright install --with-deps   # première installation uniquement
npm run test:e2e
```

### Environnement de test isolé (Docker)

```bash
docker compose -f docker-compose.test.yml up --build -d
docker compose -f docker-compose.test.yml exec app-test sh
# npm run test
# npm run test:e2e
```

---

## CI/CD (GitHub Actions)

Le pipeline se déclenche sur :
- Push / Pull Request vers `main` ou `develop`
- Déclenchement manuel (`workflow_dispatch`)

### Étapes du pipeline

| Étape | Description | Outil |
|-------|-------------|-------|
| 🔍 **Lint** | Vérification ESLint | ESLint |
| 🧪 **Tests unitaires** | Jest + couverture | Jest |
| 🏗️ **Build** | Compilation Next.js standalone | Next.js |
| 🛡️ **Scan sécurité** | Audit npm + scan Trivy | npm audit, Trivy |
| 🐳 **Docker build** | Image multi-étapes avec cache | Docker Buildx |
| 🎭 **Tests E2E** | Playwright avec base PostgreSQL | Playwright |
| 🚀 **Déploiement démo** | Push image vers GHCR | GitHub Actions |

### Image Docker

```bash
# Construction locale
docker build -t cesizen:latest .

# Build + push (script fourni)
PUSH=true ./scripts/build-and-push.sh
```

---

## Architecture Docker

### Dockerfile (multi-étapes)

1. **Base** : `node:20-alpine`
2. **Deps** : installation des dépendances (`npm ci`)
3. **Builder** : build Next.js en mode `standalone`
4. **Runner** : image allégée avec utilisateur non-root (`nextjs`), healthcheck et script d'entrée (`entrypoint.sh`)

### Points de sécurité

- Utilisateur non-root (UID 1001)
- Aucun secret compilé dans l'image (passage par `ARG` + valeurs par défaut)
- Healthcheck applicatif sur `/api/health`
- Ports bindés sur `127.0.0.1` (pas d'exposition publique directe)
- Réseaux Docker isolés par environnement

---

## Documentation du projet

- [`docs/deployment-plan.md`](docs/deployment-plan.md) : Plan de déploiement, sécurisation et maintenance
- [`docs/workflow.md`](docs/workflow.md) : Flux de travail (ticket → merge)
- [`docs/tickets/`](docs/tickets/) : Exemples de tickets (bug / évolution)

---

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Mode développement |
| `npm run build` | Build production |
| `npm run start` | Démarrage production |
| `npm run lint` | Vérification du code |
| `npm run test` | Tests unitaires |
| `npm run test:e2e` | Tests E2E |
| `npm run db:generate` | Génération des migrations Drizzle |
| `npm run db:migrate` | Application des migrations |
| `npm run db:seed` | Seed de la base de données |

---

## Sécurité & RGPD

- Les données sensibles sont dans `.env.local` (non versionné).
- Les mots de passe sont hashés avec **bcryptjs**.
- Les sessions sont signées avec **NEXTAUTH_SECRET** (32+ caractères).
- L'application inclut une **modal de consentement RGPD**.
- Endpoint `/api/account` permettant la suppression de compte (droit à l'effacement).

---

## Licence

Projet académique — CESI.
