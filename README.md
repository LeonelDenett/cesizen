# Cesizen - Application de gestion de notes

Application Next.js pour la gestion de notes avec authentification et base de données PostgreSQL.

## Stack technique

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de données:** PostgreSQL avec Drizzle ORM
- **Authentification:** NextAuth.js
- **Tests:** Jest, Playwright

## Installation

### Prérequis

- Node.js 20+
- Docker et Docker Compose

### Configuration

1. Copier le fichier d'exemple:
```bash
cp .env.example .env.local
```

2. Modifier les variables d'environnement dans `.env.local`:
```env
POSTGRES_PASSWORD=votre-mot-de-passe-securise
NEXTAUTH_SECRET=votre-secret-min-32-caracteres
```

### Lancement en développement

```bash
# Avec Docker Compose
docker-compose -f docker-compose.dev.yml up

# Ou en local
npm install
npm run dev
```

### Lancement en production

```bash
# Build et lancement
docker-compose up --build
```

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Mode développement |
| `npm run build` | Build production |
| `npm run start` | Lancement production |
| `npm run lint` | Vérification du code |
| `npm run test` | Tests unitaires |
| `npm run test:e2e` | Tests E2E |
| `npm run db:generate` | Génération migrations Drizzle |
| `npm run db:migrate` | Application migrations |
| `npm run db:seed` | Seed de la base de données |

## CI/CD

### GitHub Actions

Le pipeline se déclenche sur:
- Push vers `main` ou `develop`
- Pull requests vers `main` ou `develop`

Étapes:
1. **Installation** - Dépendances npm
2. **Lint** - Vérification ESLint
3. **Test** - Tests unitaires Jest
4. **Build** - Build Next.js
5. **Docker** - Construction image
6. **E2E** - Tests Playwright

## Structure du projet

```
├── .github/workflows/    # GitHub Actions
├── docs/                 # Documentation
│   ├── tickets/          # Suivi des tickets
│   └── workflow.md       # Flux de travail
├── lib/                  # Code backend
│   └── db/               # Schéma et config Drizzle
├── public/               # Assets statiques
├── src/                  # Code source Next.js
├── Dockerfile            # Image de production
├── docker-compose.yml   # Configuration production
└── .env.example          # Template de configuration
```

## Gestion des tickets

Voir [docs/workflow.md](docs/workflow.md) pour le flux de travail ticket → merge.

Tickets disponibles dans [docs/tickets/](docs/tickets/).

## Sécurité

- Les variables sensibles sont dans `.env.local` (non versionné)
- Ports exposés uniquement sur `127.0.0.1`
- Secrets non inclus dans les couches Docker
- Utilisateur non-root dans le conteneur