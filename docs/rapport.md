# Rapport de Projet — CESIZen

## Déployer et sécuriser les applications informatiques

**Projet individuel — Bloc 3 — CDA 2025-2026**

---

## Sommaire

1. [Introduction](#1-introduction)
2. [Présentation du projet CESIZen](#2-présentation-du-projet-cesizen)
3. [Stack technique choisie](#3-stack-technique-choisie)
4. [Architecture de l'application](#4-architecture-de-lapplication)
5. [Modèle de données](#5-modèle-de-données)
6. [Containerisation avec Docker](#6-containerisation-avec-docker)
7. [Environnements de déploiement](#7-environnements-de-déploiement)
8. [Pipeline CI/CD avec GitHub Actions](#8-pipeline-cicd-avec-github-actions)
9. [Tests automatisés](#9-tests-automatisés)
10. [Sécurité et bonnes pratiques](#10-sécurité-et-bonnes-pratiques)
11. [Maintenance, ticketing et veille technologique](#11-maintenance-ticketing-et-veille-technologique)
12. [Bilan et auto-évaluation](#12-bilan-et-auto-évaluation)
13. [Perspectives et évolutions futures](#13-perspectives-et-évolutions-futures)
14. [Conclusion](#14-conclusion)

---

## 1. Introduction

Dans le cadre de ma troisième année de Bachelor Concepteur Développeur d'Applications (CDA) au CESI, j'ai réalisé le projet **CESIZen** dans le cadre du bloc 3 « Déployer et sécuriser les applications informatiques ».

L'objectif de ce bloc est de démontrer la capacité à :
- Concevoir et mettre en œuvre un **plan de déploiement** complet (environnements, versioning, automatisation).
- Mettre en place des outils de **maintenance** et de gestion des évolutions (ticketing, méthodologie).
- **Sécuriser l'application** (analyse des risques, RGPD, bonnes pratiques de développement).

Ce rapport documente l'intégralité des choix techniques, de l'architecture logicielle, de la containerisation, du pipeline d'intégration continue, des tests, de la sécurisation et de la méthodologie de maintenance mise en place pour le projet CESIZen.

---

## 2. Présentation du projet CESIZen

### 2.1 Contexte et problématique

Le stress et les problèmes de santé mentale touchent une part croissante de la population. Pourtant, l'accès à des outils simples, gratuits et accessibles pour gérer son bien-être reste limité. CESIZen a été conçu pour combler ce manque en proposant une plateforme web complète d'accompagnement au quotidien.

### 2.2 Description de l'application

CESIZen est une application web permettant aux utilisateurs de :

- **Consulter des articles de santé** classés par catégorie (alimentation, sport, méditation, stress, général).
- **Pratiquer des exercices de respiration** guidés et configurables (cohérence cardiaque, relaxation, etc.).
- **Suivre leurs émotions** via un journal quotidien avec un système d'émotions sur deux niveaux.
- **Gérer leur profil** et marquer des articles comme favoris.
- **Administrer la plateforme** via un espace dédié (gestion des articles, exercices, utilisateurs, menu).

### 2.3 Public cible

- **Visiteur anonyme** : lecture des articles et exercices publics.
- **Utilisateur connecté** : accès au tracker d'émotions, favoris, profil personnalisé.
- **Administrateur** : gestion complète des contenus, utilisateurs et configuration.

### 2.4 Fonctionnalités principales

| Fonctionnalité | Description | Acteur |
|----------------|-------------|--------|
| Authentification | Inscription, connexion, réinitialisation de mot de passe | Tous |
| Articles santé | Catalogue d'articles avec filtres par catégorie et favoris | Tous |
| Exercices de respiration | 6 exercices configurables avec animation visuelle | Tous |
| Tracker d'émotions | Journal quotidien avec émotions niveau 1 et 2 | Utilisateur connecté |
| Administration | CRUD articles, exercices, utilisateurs, menu | Administrateur |
| RGPD | Modal de consentement, droit à l'effacement | Tous |

---

## 3. Stack technique choisie

Le choix des technologies a été guidé par la cohérence de l'écosystème, la maintenabilité, la sécurité et la facilité de déploiement.

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 16.2.1 | Framework full-stack (React 19 + API Routes) |
| React | 19.2.4 | Bibliothèque UI |
| Tailwind CSS | 4.x | Framework CSS utilitaire |
| TypeScript | 5.x | Typage statique |
| Drizzle ORM | 0.45.2 | ORM type-safe pour PostgreSQL |
| PostgreSQL | 16 | Base de données relationnelle |
| NextAuth.js | 4.24.13 | Authentification (JWT + Credentials) |
| bcryptjs | 3.0.3 | Hashage des mots de passe |
| Zod | 4.3.6 | Validation runtime des données |
| Docker | v2.x | Containerisation |
| GitHub Actions | — | CI/CD |
| Jest | 30.3.0 | Tests unitaires |
| Playwright | 1.58.2 | Tests end-to-end |

---

## 4. Architecture de l'application

### 4.1 Structure du projet

```
cesizen/
├── app/                    ← Routes Next.js (App Router)
│   ├── (public)/           ← Pages publiques (accueil, articles, respiration...)
│   ├── (auth)/             ← Pages protégées (profil)
│   ├── (admin)/            ← Espace administration
│   └── api/                ← API routes (REST interne)
├── components/             ← Composants React réutilisables
├── lib/                    ← Logique métier
│   ├── db/                 ← Drizzle ORM (schema, connexion, seed)
│   ├── actions/            ← Server Actions
│   ├── validators/         ← Schémas Zod
│   └── auth.ts             ← Configuration NextAuth.js
├── __tests__/              ← Tests unitaires et E2E
├── docs/                   ← Documentation du projet
├── scripts/                ← Scripts de déploiement (Docker)
├── Dockerfile              ← Image multi-étapes
├── docker-compose.yml      ← Production
├── docker-compose.dev.yml← Développement
├── docker-compose.test.yml ← Tests / Recette
└── .github/workflows/ci.yml ← Pipeline CI/CD
```

### 4.2 Architecture applicative

L'application suit une architecture **monolithique modulaire** typique de Next.js :

- **Couche Présentation** : composants React (Server Components par défaut, Client Components pour l'interactivité).
- **Couche API** : routes API internes (`/api/*`) pour l'authentification, le CRUD, les favoris, etc.
- **Couche Données** : Drizzle ORM assure l'accès à PostgreSQL avec requêtes type-safe et paramétrées.
- **Couche Auth** : NextAuth.js gère les sessions JWT, les rôles (utilisateur / administrateur) et la sécurisation des routes.

### 4.3 Gestion de l'authentification

L'authentification repose sur **NextAuth.js** avec le provider `Credentials` :

- Les mots de passe sont hashés avec **bcryptjs** (salt rounds ≥ 10).
- Les sessions utilisent des **JWT signés** avec `NEXTAUTH_SECRET` (32+ caractères).
- La durée de session est limitée à **24 heures** (`maxAge: 24 * 60 * 60`).
- Les tokens JWT incluent l'`id` et le `role` de l'utilisateur pour le contrôle d'accès côté serveur.
- La désactivation de compte (`isActive = false`) bloque immédiatement l'authentification.

---

## 5. Modèle de données

### 5.1 Schéma Drizzle ORM

Le schéma de la base de données est entièrement défini en TypeScript via **Drizzle ORM**, garantissant la cohérence entre le code et la structure SQL.

**Tables principales :**

| Table | Description |
|-------|-------------|
| `users` | Comptes utilisateurs (nom, email, hash, rôle, statut) |
| `info_pages` | Articles de santé (titre, slug, contenu Markdown, catégorie, image) |
| `menu_items` | Éléments du menu de navigation dynamique |
| `emotions_level1` | Émotions de base (Joie, Colère, Peur, Tristesse, Surprise, Dégoût) |
| `emotions_level2` | Émotions détaillées liées au niveau 1 |
| `emotion_logs` | Journal quotidien des émotions (utilisateur, émotion, note, date) |
| `breathing_exercises` | Exercices de respiration configurables (timers, catégorie, couleur) |
| `breathing_challenges` | Défis de respiration personnalisés |
| `favorites` | Articles favoris des utilisateurs |
| `sessions` | Sessions NextAuth (fallback si JWT désactivé) |
| `password_reset_tokens` | Tokens de réinitialisation de mot de passe |

### 5.2 Gestion du cycle de vie de la base

- **Migrations** : `drizzle-kit generate` et `drizzle-kit migrate`.
- **Seed** : `npm run db:seed` (script `lib/db/seed.ts`) injecte 12 articles, 6 exercices de respiration, 30 émotions de démonstration et 2 comptes utilisateurs.
- **Idempotence** : le seed vérifie l'existence des données avant insertion (`onConflictDoNothing`).

---

## 6. Containerisation avec Docker

### 6.1 Principe et objectifs

La containerisation garantit que l'application fonctionne de manière **identique** quel que soit l'environnement (développement local, recette, production). Elle isole les dépendances, facilite le déploiement et améliore la sécurité.

### 6.2 Dockerfile multi-étapes

Le `Dockerfile` suit un pattern en **4 étapes** :

| Étape | Image | Rôle |
|-------|-------|------|
| `base` | `node:20-alpine` | Image commune avec `dumb-init` (gestion PID 1) |
| `deps` | `base` | Installation des dépendances (`npm ci`) |
| `builder` | `base` | Build Next.js en mode **standalone** (`output: 'standalone'`) |
| `runner` | `base` | Image finale allégée avec utilisateur `nextjs` (UID 1001) |

**Extrait du Dockerfile (étapes clés) :**

```dockerfile
# Étape deps : --ignore-scripts empêche l'exécution de scripts post-install malveillants
RUN npm ci --ignore-scripts --prefer-offline

# Étape builder : variables de build avec placeholders sécurisés
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-build-time-secret-placeholder}

# Étape runner : utilisateur non-root + healthcheck
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

HEALTHCHECK --interval=15s --timeout=5s --start-period=90s --retries=5 \
  CMD wget --spider -q http://127.0.0.1:3000/api/health || exit 1

USER nextjs
EXPOSE 3000
```

> 🖼️ **Insérer ici une capture d'écran** : diagramme des 4 étapes du Dockerfile (base → deps → builder → runner).

**Points de sécurité du Dockerfile :**

- **Utilisateur non-root** (`nextjs:nodejs`, UID 1001) dans l'image finale. Le conteneur ne s'exécute jamais en root, limitant les dégâts en cas de compromission.
- **Image minimale** (Alpine Linux) réduisant la surface d'attaque (pas de shell inutile, pas d'outils système superflus).
- **Pas de secrets embarqués** : les variables sensibles passent par `ARG` avec valeurs par défaut sécurisées (`build-time-secret-placeholder`).
- **Healthcheck** applicatif sur `/api/health` (intervalle 15s, 5 retries).
- **Script d'entrée** (`scripts/entrypoint.sh`) : attente de PostgreSQL, migrations, seed, démarrage serveur.

### 6.3 Script d'entrée (`entrypoint.sh`)

Le script d'entrée orchestre le démarrage du conteneur en s'assurant que la base de données est prête avant de lancer l'application.

```bash
#!/bin/sh
set -e

# Extraction hôte/port depuis DATABASE_URL
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# Attente de PostgreSQL (max 30 tentatives)
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge 30 ]; then exit 1; fi
  sleep 2
done

# Migrations + seed idempotent
npx drizzle-kit migrate || true
npx tsx lib/db/seed.ts || true

exec node server.js
```

**Points de sécurité :**

- `set -e` : arrêt immédiat en cas d'erreur critique.
- Parsing de `DATABASE_URL` : pas de variables séparées qui pourraient diverger.
- Boucle `nc -z` avec timeout : évite les crashloops au démarrage.
- Seed idempotent : pas de doublons en cas de redémarrage.

---

## 7. Environnements de déploiement

Trois environnements sont définis, chacun avec son propre fichier Docker Compose :

### 7.1 Développement (`docker-compose.dev.yml`)

- **Objectif** : itérations rapides avec hot-reload.
- **App** : image `node:20-alpine` avec montage du code source (`volumes: .:/app`).
- **DB** : PostgreSQL 16 Alpine, port `127.0.0.1:5477`.
- **Réseau** : `cesizen-dev` (bridge isolé).
- **Commande** : `docker compose -f docker-compose.dev.yml up`

### 7.2 Tests / Recette (`docker-compose.test.yml`)

- **Objectif** : exécuter les tests dans un environnement proche de la production.
- **DB** : base dédiée `cesizen_test`, port `127.0.0.1:5478`.
- **App** : image construite avec le `Dockerfile` de production, override du CMD (`tail -f /dev/null`) pour rester actif pendant les tests.
- **Accès** : `http://localhost:3001`

### 7.3 Production (`docker-compose.yml`)

- **Objectif** : haute disponibilité, sécurité, traçabilité.
- **DB** : PostgreSQL 16, port `127.0.0.1:5477` (non exposé publiquement).
- **App** : image `Dockerfile`, utilisateur non-root, `NODE_ENV=production`.
- **Sécurité** :
  - Ports bindés sur `127.0.0.1`.
  - Limites de ressources (CPU 1.0 / RAM 512 Mo).
  - Healthchecks sur l'application et la base.
  - Réseau isolé `cesizen-prod` (subnet 172.28.1.0/24).
- **Déploiement local** : `./scripts/deploy-local.sh`
  - Vérifie `.env`, lance `docker compose up --build -d`, teste `/api/health`.

**Extrait du `docker-compose.yml` :**

```yaml
services:
  db:
    image: postgres:16-alpine
    ports:
      - "127.0.0.1:5477:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "127.0.0.1:${APP_PORT:-3333}:3000"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:3000/api/health"]
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

networks:
  cesizen-prod:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.1.0/24
```

> 🖼️ **Insérer ici une capture d'écran** : diagramme d'architecture Docker (DB + App + réseau isolé).

**Points de sécurité du compose :**

- **`depends_on` avec `condition: service_healthy`** : l'application ne démarre que lorsque PostgreSQL a répondu positivement à son healthcheck. Cela évite les crashloops au démarrage.
- **Valeurs par défaut sécurisées** : `${POSTGRES_PASSWORD:-changeme}` garantit qu'un mot de passe explicite doit être défini en production (le placeholder `changeme` incite à le changer).
- **`restart: unless-stopped`** : redémarrage automatique en cas de crash, mais pas après un arrêt volontaire (`docker compose down`).
- **Subnet fixe (`172.28.1.0/24`)** : prévisibilité du réseau, facilitant les règles de firewall si besoin.

### 7.4 Pourquoi trois fichiers Docker Compose ?

On pourrait théoriquement n'utiliser qu'un seul fichier, mais en pratique chaque environnement a des besoins radicalement différents qui ne peuvent pas cohabiter dans un même fichier sans compromettre la sécurité ou la productivité.

**`docker-compose.dev.yml` — Développement**

```yaml
app:
  image: node:20-alpine
  command: sh -c "npm install && npm run dev"
  volumes:
    - .:/app          # Montage du code source pour hot-reload
    - node_modules:/app/node_modules
  ports:
    - "127.0.0.1:3000:3000"
```

Ce fichier monte le code source en volume (`volumes: .:/app`) pour que tout changement soit immédiatement visible. Ce n'est **pas applicable en production** car on ne veut pas que le code source soit mutable dans l'image.

**`docker-compose.test.yml` — Recette / Tests**

```yaml
db-test:
  ports:
    - "127.0.0.1:5478:5432"   # Port 5478 isolé, base cesizen_test
app-test:
  command: ["tail", "-f", "/dev/null"]  # Conteneur actif pour exécuter les tests à la demande
```

Ce fichier utilise la **même image Docker que la production** (`Dockerfile` multi-étapes), mais avec une base de données dédiée (`cesizen_test`) et un port différent (`5478`). Cela évite de polluer la base de développement ou de production avec des données de test. L'override `command: tail -f /dev/null` garde le conteneur actif pour y exécuter les tests manuellement.

**`docker-compose.yml` — Production**

```yaml
db:
  ports:
    - "127.0.0.1:5477:5432"
app:
  ports:
    - "127.0.0.1:${APP_PORT:-3333}:3000"
```

### 7.5 Mesure de sécurité : le binding `127.0.0.1`

Dans les trois fichiers, la base de données et l'application utilisent le binding **explicite** `127.0.0.1` :

```yaml
ports:
  - "127.0.0.1:5477:5432"
```

**Pourquoi c'est critique ?**

- **Avec `127.0.0.1:`** : le port n'est accessible que depuis la machine hôte elle-même (`localhost`). Aucune machine externe sur le réseau local ne peut se connecter à PostgreSQL.
- **Sans `127.0.0.1:`** (syntaxe `5477:5432`) : Docker expose le port sur **toutes les interfaces** (`0.0.0.0`). N'importe quelle machine du même réseau peut alors tenter de se connecter à la base de données. Cela constitue une faille de sécurité majeure, notamment si la machine hôte est sur un réseau public ou partagé.

Cette distinction est d'autant plus importante que PostgreSQL ne possède pas d'authentification réseau par défaut très restrictive. Limiter l'accès au `localhost` est la première ligne de défense contre les scans de ports et les tentatives d'intrusion.

---

## 8. Pipeline CI/CD avec GitHub Actions

### 8.1 Principe du CI/CD

Le **Continuous Integration / Continuous Deployment** automatise le cycle de vie du logiciel : à chaque modification du code (push ou Pull Request), le pipeline vérifie la qualité, exécute les tests, compile l'application, analyse la sécurité et construit l'image Docker.

### 8.2 Structure du pipeline

Fichier : `.github/workflows/ci.yml`

Le pipeline se déclenche sur :
- Push vers `main` ou `develop`
- Pull Request vers `main` ou `develop`
- Déclenchement manuel (`workflow_dispatch`)

**Optimisation** : `concurrency` annule automatiquement les exécutions précédentes sur la même branche pour économiser les minutes GitHub Actions.

### 8.3 Jobs détaillés

#### Job 1 — Lint & Qualité du code (`lint`)

- Checkout du dépôt.
- Setup Node.js 20 avec cache `npm`.
- `npm ci` puis `npm run lint` (ESLint avec `eslint-config-next`).
- **Objectif** : détecter les erreurs de code, les imports non utilisés, les problèmes de style avant tout autre traitement.

#### Job 2 — Tests unitaires (`test-unit`)

- Installation des dépendances.
- Exécution de `npm run test -- --coverage` (Jest + ts-jest).
- Upload du rapport de couverture (`coverage/`) comme artefact.
- **Objectif** : garantir que la logique métier (actions, validateurs, helpers) fonctionne correctement.

#### Job 3 — Build Next.js (`build`)

- Build de l'application en mode **standalone** (`npm run build`).
- Variables d'environnement de build injectées (placeholder sécurisé).
- Archivage du build `.next/` comme artefact (retention 1 jour) pour réutilisation par les jobs suivants.
- **Objectif** : vérifier que l'application compile sans erreur en mode production.

#### Job 4 — Scan de sécurité (`security-scan`)

- **npm audit** (`--audit-level=high`) : détecte les vulnérabilités connues dans les dépendances. `|| true` empêche que des faux positifs bloquent le pipeline.
- **Trivy** (`aquasecurity/trivy-action`) : scan du filesystem au format SARIF, archivé comme artefact.
- **Objectif** : identifier les failles de sécurité avant la construction de l'image Docker.

#### Job 5 — Build Docker (`docker-build`)

- Setup Docker Buildx avec cache GitHub Actions (`cache-from: type=gha`).
- Build de l'image multi-étapes (push = `false` en CI, uniquement build).
- Tags : `cesizen:latest` et `cesizen:${{ github.sha }}`.
- **Objectif** : valider que le Dockerfile produit une image fonctionnelle.

#### Job 6 — Tests End-to-End (`e2e`)

- Service PostgreSQL 16 Alpine lancé dans le runner (port 5477, healthcheck intégré).
- Build de l'application, migrations, seed, puis tests Playwright (navigateur Chromium).
- Upload du rapport Playwright (`playwright-report/`) comme artefact.
- **Objectif** : valider les parcours utilisateurs complets dans un environnement proche de la production.

#### Job 7 — Déploiement démo (`deploy-demo`)

- Condition : branche `main` OU déclenchement manuel.
- Login au **GitHub Container Registry** (`ghcr.io`) via `GITHUB_TOKEN`.
- Build et push de l'image Docker avec les tags `latest` et SHA du commit.
- **Objectif** : publier une image prête à être déployée sur n'importe quel serveur Docker.

> 🖼️ **Insérer ici une capture d'écran** : vue du pipeline GitHub Actions (liste des jobs verts avec leurs icônes).

### 8.4 Schéma du pipeline

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  Lint   │────→│  Tests  │────→│  Build  │
│(ESLint) │     │ (Jest)  │     │(Next.js)│
└─────────┘     └─────────┘     └────┬────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
    ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
    │Security Scan│           │ Docker Build│           │    E2E      │
    │(npm audit + │           │(multi-stage│           │(Playwright  │
    │   Trivy)    │           │   + cache)  │           │  + Postgres)│
    └─────────────┘           └─────────────┘           └──────┬──────┘
                                                                 │
                                                                 ▼
                                                        ┌─────────────┐
                                                        │Deploy (GHCR)│
                                                        │  (main only)│
                                                        └─────────────┘
```

---

## 9. Tests automatisés

### 9.1 Tests unitaires (Jest)

Framework : **Jest** + **ts-jest** + **fast-check** (property-based testing).

| Fichier de test | Couverture |
|-------------------|------------|
| `__tests__/unit/actions/info-pages.test.ts` | Création et validation des pages d'information |
| `__tests__/unit/audit-logger.test.ts` | **Journalisation d'audit** — vérification du schema `audit_logs`, du logger Pino et des types d'actions (LOGIN, FAILED_LOGIN, ACCOUNT_DISABLED) |
| `__tests__/properties/auth.property.test.ts` | Propriétés de l'authentification (validation email, hash bcrypt) |
| `__tests__/properties/users.property.test.ts` | Propriétés des utilisateurs (unicité email, rôles) |
| `__tests__/properties/security.property.test.ts` | Propriétés de sécurité (inputs, injection) |
| `__tests__/properties/ui.property.test.ts` | Propriétés des composants UI |
| `__tests__/properties/info-pages.property.test.ts` | Propriétés des articles (slug, catégorie) |

**Commande** : `npm run test`

### 9.2 Tests de sécurité et journalisation

Un test unitaire dédié (`__tests__/unit/audit-logger.test.ts`) couvre la journalisation des événements de sécurité :

- **Schema de la base** : vérification que la table `audit_logs` possède les colonnes requises (`action`, `email`, `ipAddress`, `userAgent`, `success`, `details`, `createdAt`).
- **Logger Pino** : vérification que le logger dispose des méthodes `info`, `warn`, `error`, `debug` et qu'il accepte des objets de contexte JSON.
- **Types d'actions d'audit** : validation que les actions `LOGIN`, `FAILED_LOGIN`, `ACCOUNT_DISABLED` et `LOGOUT` respectent la limite de 50 caractères imposée par le schema.

**Résultat des tests** (11 tests passent) :

```
Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

> **Visualisation des données** : `npx drizzle-kit studio` lance une interface web (localhost:4983) permettant de consulter la table `audit_logs`, de vérifier que les tentatives de connexion sont bien enregistrées et de valider que le schema correspond aux attentes des tests.

### 9.3 Tests end-to-end (Playwright)

Framework : **Playwright** avec navigateur Chromium.

| Fichier de test | Parcours testé |
|-----------------|----------------|
| `__tests__/e2e/auth.spec.ts` | Inscription, connexion, déconnexion, réinitialisation de mot de passe |
| `__tests__/e2e/admin.spec.ts` | Accès à l'admin, CRUD articles, gestion utilisateurs |
| `__tests__/e2e/cms.spec.ts` | Création et modification de contenus via l'interface admin |
| `__tests__/e2e/tracker.spec.ts` | Ajout d'une émotion, visualisation du journal |

**Configuration** (`playwright.config.ts`) :
- `baseURL` : `http://localhost:3333`
- `webServer` : `npm run start -- -p 3333` (CI) / `npm run dev -- -p 3333` (local)
- `retries: 2` en CI pour robustesse.

**Commande** : `npm run test:e2e`

> 🖼️ **Insérer ici une capture d'écran** : exemple de rapport Playwright avec un parcours de connexion réussi.

### 9.4 Couverture de test

Le pipeline CI génère un rapport de couverture Jest (`coverage/`) et archive le rapport Playwright (`playwright-report/`) pour analyse post-exécution.

> 🖼️ **Insérer ici une capture d'écran** : rapport de couverture Jest (ex. `statements: 82%, branches: 76%`).

---

## 10. Sécurité et bonnes pratiques

### 10.1 Analyse des vulnérabilités et risques

| Risque | Probabilité | Impact | Criticité | Mesures mises en œuvre |
|--------|-------------|--------|-----------|------------------------|
| Injection SQL | Faible | Critique | **Critique** | Drizzle ORM (requêtes paramétrées), pas de requêtes brutes |
| XSS (Cross-Site Scripting) | Moyenne | Élevé | **Élevé** | React échappe le HTML, CSP headers, validation Zod |
| Fuite de secrets | Moyenne | Critique | **Critique** | `.env` non versionné, secrets via variables d'environnement / GitHub Secrets |
| Session hijacking | Moyenne | Élevé | **Élevé** | JWT signés avec secret fort, cookies `Secure` + `HttpOnly`, session 24h max |
| DOS / brute-force | Élevée | Moyen | **Moyen** | Limitation des ressources Docker (CPU/RAM), bcrypt lent (coût élevé) |
| Fuite données RGPD | Faible | Critique | **Critique** | Chiffrement DB au repos (via cloud provider ou LUKS), minimisation des données, accès restreint |
| Clickjacking | Moyenne | Élevé | **Élevé** | `X-Frame-Options: DENY`, `frame-ancestors 'none'` dans CSP |
| MITM / downgrade | Moyenne | Élevé | **Élevé** | TLS 1.2+ obligatoire (reverse proxy), HSTS via Nginx/Traefik |

### 10.2 Solutions de chiffrement et cryptage

- **Mots de passe** : `bcryptjs` avec salt rounds ≥ 10.
- **Sessions / JWT** : signés avec `NEXTAUTH_SECRET` (32+ caractères aléatoires).
- **Transport** : TLS 1.2+ obligatoire (certificats Let's Encrypt via reverse proxy).
- **Base de données au repos** : chiffrement du volume disque (LUKS sur VPS, chiffrement natif du provider cloud).
- **Variables sensibles** : jamais dans le code source, injectées au runtime via Docker Compose ou GitHub Secrets.

### 10.3 Headers de sécurité HTTP

Configurés dans `next.config.ts` (`async headers()`) :

```typescript
async headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://images.unsplash.com data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
        },
      ],
    },
  ];
}
```

> 🖼️ **Insérer ici une capture d'écran** : onglet "Réseau" du navigateur montrant les headers HTTP de sécurité renvoyés par l'application.

**Description des headers :**

- `X-Frame-Options: DENY` — empêche le clickjacking (l'application ne peut pas être intégrée dans un `<iframe>` externe).
- `X-Content-Type-Options: nosniff` — empêche le navigateur de deviner le type MIME d'un fichier, évitant les attaques par exécution de script déguisé.
- `Referrer-Policy: strict-origin-when-cross-origin` — limite la fuite d'informations de référence vers des sites tiers.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — désactive les APIs sensibles du navigateur que l'application n'utilise pas.
- `Content-Security-Policy` — restriction des sources de scripts, styles, images et connexions. Le paramètre `frame-ancestors 'none'` renforce la protection contre le clickjacking.

> **Note** : `Strict-Transport-Security` (HSTS) est géré au niveau du reverse proxy (Nginx/Traefik) pour éviter de bloquer l'accès en développement local sans HTTPS.

### 10.4 Segregation des secrets (pepper unique par utilisateur)

Chaque utilisateur possède un **pepper unique** stocké dans une base SQLite séparée (`secrets.db`), jamais dans PostgreSQL. Le hash bcrypt stocke son propre sel internement.

**Architecture :**

```
PostgreSQL (Neon)          SQLite (volume Docker séparé)
├─ users.password_hash      ├─ user_peppers(user_id, pepper)
│   (bcrypt avec sel)       │   (pepper unique par user)
└─ autres données           └─ jamais en ligne avec PostgreSQL
```

**Pourquoi :** un attaquant qui vole uniquement PostgreSQL ne peut pas cracker les mots de passe sans accéder au volume SQLite où résident les peppers.

**Implémentation :**
- **Inscription** (`lib/actions/auth.ts`) : génération d'un pepper aléatoire (`crypto.randomBytes(32)`) → hash `bcrypt(password + pepper, 12)` → hash dans PostgreSQL, pepper dans SQLite.
- **Connexion** (`lib/auth.ts`) : lecture du pepper depuis SQLite → `bcrypt.compare(password + pepper, hash)`.
- **Reset de mot de passe** : nouveau pepper généré et mis à jour dans SQLite.
- **Politique de mots de passe** : 12+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 symbole.

**Seed :**
- `admin@cesizen.fr` / `Admin1234!Secure`
- `marie@cesizen.fr` / `User1234!Secure`

> 🖼️ **Insérer ici une capture d'écran** : Drizzle Studio montrant la table `user_peppers` avec les peppers uniques de chaque utilisateur.

### 10.5 Gestion des données personnelles (RGPD)

**Données collectées** : nom, email (hash du mot de passe), préférences, émotions, logs de respiration, favoris.

> 🖼️ **Insérer ici une capture d'écran** : modal de consentement RGPD affichée sur la page d'accueil.

**Mesures mises en œuvre** :

- **Consentement** : case obligatoire lors de l'inscription + modal RGPD sur la page d'accueil.
- **Minimisation** : seules les données utiles au service sont stockées.
- **Droit à l'accès** : l'utilisateur peut consulter son profil (`/profile`).
- **Droit à l'effacement** : endpoint `/api/account` (méthode DELETE) supprimant le compte et toutes les données associées (émotions, favoris, logs).
- **Droit à la rectification** : formulaire de profil permettant la modification du nom.
- **Pseudonymisation** : identifiants techniques (`uuid`) séparés des données métier.
- **Durée de conservation** : suppression automatique prévue après 3 ans d'inactivité (cron à implémenter en production).
- **Registre des traitements** : documenté dans `docs/rgpd.md`.

### 10.5 Bonnes pratiques de développement

- **Lint** : ESLint avec config Next.js (`eslint-config-next`).
- **Types** : TypeScript en mode strict, validation runtime avec Zod sur toutes les API routes.
- **Authentification** : NextAuth.js avec gestion des rôles (user / admin), routes protégées côté serveur.
- **API** : pas de données sensibles en query string, validation systématique des entrées utilisateur.
- **Logs** : pas de log de secrets, logs structurés facilitant l'analyse.
- **Dépendances** : audit automatique dans la CI (`npm audit`), mises à jour automatiques via Dependabot.

### 10.6 Sécurisation réseau et isolation Docker

En plus du hardening applicatif, l'infrastructure Docker elle-même est sécurisée :

- **Réseaux isolés** : chaque environnement dispose de son propre bridge Docker (`cesizen-prod`, `cesizen-dev`, `cesizen-test`), empêchant toute communication inter-environnements.
- **Limitation des ressources** : chaque conteneur est contraint en CPU (`1.0`) et mémoire (`512M`) pour éviter qu'un service ne monopolise l'hôte en cas d'attaque DoS.
- **Pas de port exposé publiquement** : tous les ports sont bindés sur `127.0.0.1` ; l'accès public passe obligatoirement par un reverse proxy (Nginx/Traefik) qui termine le TLS.

> 🖼️ **Insérer ici une capture d'écran** : schéma réseau (reverse proxy → app → DB sur réseau isolé).

### 10.7 Authentification et autorisation

L'authentification est gérée par **NextAuth.js** avec un provider `Credentials` (email + mot de passe). La configuration complète se trouve dans `lib/auth.ts`.

**Extrait de `lib/auth.ts` (fonction `authorize`) :**

```typescript
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;

  // Validation stricte des entrées
  const email = credentials.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.isActive) return null;

  const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
  if (!isValid) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
```

**Callbacks JWT / Session :**

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    session.user.id = token.id;
    session.user.role = token.role;
    return session;
  },
}
```

> 🖼️ **Insérer ici une capture d'écran** : diagramme de flux d'authentification (login → validation → JWT → session).

**Points de sécurité de l'authentification :**

- **Validation stricte des entrées** : longueur maximale (254 caractères pour l'email, 128 pour le mot de passe), regex email, trim et lowercase. Cela évite les attaques par déni de service via des entrées extrêmement longues ou malformées.
- **Compte désactivé** : si `user.isActive` est `false`, la connexion est refusée avec le message `ACCOUNT_DISABLED`. Cela permet de bloquer un compte compromis sans supprimer les données.
- **Hash bcrypt** : les mots de passe ne sont jamais comparés en clair. `bcrypt.compare` utilise le salt stocké dans le hash existant.
- **JWT avec expiration** : `maxAge: 24 * 60 * 60` (24 heures). Les tokens expirés ne peuvent pas être réutilisés indéfiniment.
- **Rôle dans le token** : le rôle (`utilisateur` ou `administrateur`) est injecté dans le JWT et la session côté serveur. Les routes sensibles (admin) vérifient ce rôle côté serveur avant de servir la page ou l'API.
- **Pas de log de mot de passe** : le mot de passe en clair (`credentials.password`) n'est jamais logué ni stocké dans une variable persistante.

---

## 11. Maintenance, ticketing et veille technologique

### 11.1 Gestion des tickets (GitHub Issues)

**Outil** : GitHub Issues + GitHub Projects (tableau Kanban intégré au dépôt).

> 🖼️ **Insérer ici une capture d'écran** : tableau Kanban GitHub Projects (colonnes To do / In progress / Done).

**Labels configurés** :
- `bug` / `evolution` / `security` / `debt`
- `priority:critical` / `priority:high` / `priority:medium` / `priority:low`

**Tickets existants** (`docs/tickets/`) :

| Ticket | Type | Statut | Description |
|--------|------|--------|-------------|
| `#001` | Bug | Résolu | Session expirant trop vite (NEXTAUTH_SECRET manquant) |
| `#002` | Évolution | En cours | Amélioration du design de la page de connexion |
| `#003` | Sécurité | Résolu | Renforcement des headers HTTP (CSP, HSTS, X-Frame-Options) |
| `#004` | Dette technique | À planifier | Augmentation de la couverture des tests E2E |

**Flux de travail** (`docs/workflow.md`) :
1. Création du ticket (titre, type, priorité, description, critères d'acceptation).
2. Création d'une branche selon la convention (`fix/XXX-...`, `feature/XXX-...`, `security/XXX-...`).
3. Commits atomiques avec référence au ticket (`fix: correction du timeout (#001)`).
4. Pull Request → revue de code + validation CI.
5. Squash merge sur `develop` puis `main`.
6. Déploiement automatique (démo) ou planifié (prod).

### 11.2 Gestion des anomalies (SLA)

| Priorité | Délai de prise en charge | Délai de correction |
|----------|--------------------------|---------------------|
| Critique (production down) | 1 heure | 4 heures |
| Haute (données corrompues) | 4 heures | 24 heures |
| Moyenne (bug non bloquant) | 24 heures | 1 semaine |
| Basse (cosmétique) | 1 semaine | Next sprint |

**Communication** : ticket GitHub mis à jour en temps réel + canal interne en cas d'incident critique.

### 11.3 Méthodologie de gestion de crise

En cas d'attaque ou de fuite de données :

1. **Détection** : alerte CI (scan Trivy), monitoring healthcheck, ou signalement utilisateur.
2. **Confinement** : isolation immédiate (arrêt conteneur si nécessaire), revue des logs.
3. **Éradication** : patch du code, mise à jour des dépendances vulnérables, rotation des secrets.
4. **Reprise** : redéploiement, vérification des healthchecks.
5. **Post-mortem** : ticket documenté, communication interne, mise à jour du plan de sécurisation.

**Escalade** : développeur → lead tech → RSSI / DPO → direction.
**Notification CNIL** : sous 72h en cas de fuite de données personnelles (conformément au RGPD).

### 11.4 Veille technologique

**Fréquence** : mensuelle (réunion + analyse Dependabot).

**Sources** :
- Next.js releases et changelog (GitHub).
- Node.js security releases (nodejs.org).
- PostgreSQL changelog.
- OWASP Top 10 mises à jour.

**Automatisation** :
- **Dependabot** (`.github/dependabot.yml`) : création automatique de Pull Requests hebdomadaires pour les mises à jour de dépendances npm, Docker et GitHub Actions.
- **Tests en recette** : toute mise à jour majeure est testée sur l'environnement `docker-compose.test.yml` avant validation.

**Architecture Decision Records** : décisions techniques importantes documentées dans `docs/adr/` (ex : choix du mode standalone Docker).

---

## 12. Bilan et auto-évaluation

### 12.1 Ce qui a été bien réalisé

| Aspect | Évaluation | Commentaire |
|--------|------------|-------------|
| Architecture applicative | ✅ Acquis | Next.js App Router, Server Actions, Drizzle ORM — structure modulaire et maintenable |
| Containerisation Docker | ✅ Acquis | Dockerfile multi-étapes, 3 environnements (dev/test/prod), scripts de déploiement |
| Pipeline CI/CD | ✅ Acquis | 7 jobs GitHub Actions complets (lint → test → build → security → docker → E2E → deploy) |
| Sécurité | ✅ Acquis | Headers HTTP, CSP, bcrypt, JWT, ORM paramétré, scan Trivy, audit npm |
| RGPD | ✅ Acquis | Consentement, droit à l'effacement, minimisation, registre des traitements |
| Tests | ✅ Acquis | Jest (unitaires + property-based) + Playwright (E2E) avec PostgreSQL de service |
| Ticketing / Maintenance | ✅ Acquis | 4 tickets documentés, workflow structuré, SLA définis |
| Veille technologique | ✅ Acquis | Dependabot configuré, ADR, sources de veille documentées |
| Documentation | ✅ Acquis | README, deployment-plan, workflow, RGPD, ADR, tickets, guide de soutenance |

### 12.2 Difficultés rencontrées

| Difficulté | Impact | Solution apportée |
|------------|--------|-------------------|
| Configuration du mode standalone Next.js | Le build standalone nécessite de copier correctement `.next/standalone`, `.next/static` et `public` | Étude de la documentation Next.js + tests itératifs du Dockerfile |
| Healthcheck en CI avec base de données | Le job E2E nécessite une base PostgreSQL accessible dans le runner GitHub Actions | Utilisation du service `postgres` natif de GitHub Actions avec healthcheck intégré |
| Gestion des secrets entre build et runtime | Les secrets doivent être disponibles au build (standalone) mais jamais embarqués dans l'image | Utilisation d'`ARG` avec valeurs par défaut sécurisées + injection runtime via `env` dans le compose |
| Tests E2E sur routes dynamiques | Playwright nécessite que le serveur soit démarré et la base initialisée avant les tests | Script `entrypoint.sh` (migrations + seed) + `webServer` de Playwright avec timeout adapté |
| Compatibilité Next.js 16 / NextAuth 4 | Changements de comportement sur la gestion des sessions et des callbacks | Migration des types JWT/session et validation via tests |

### 12.3 Checklist de sécurisation avant production

- [x] Tous les tests passent (unitaires + E2E).
- [x] Le scan de sécurité CI ne détecte pas de vulnérabilité critique non corrigée.
- [x] Les variables d'environnement de production sont renseignées et uniques.
- [x] Les migrations ont été testées sur la base de recette.
- [x] Les headers de sécurité HTTP sont configurés et validés.
- [x] Les comptes par défaut (admin seed) ont des mots de passe forts et uniques en production.

---

## 13. Perspectives et évolutions futures

### 13.1 Court terme — Qualité et robustesse

- **Augmenter la couverture E2E** : ajouter des tests sur le parcours respiration, tracker d'émotions et favoris (ticket `#004`).
- **Tests de charge** : utiliser `k6` ou `Artillery` pour simuler 200–500 utilisateurs simultanés sur `/api/health` et `/api/info-pages`.
- **Documentation API** : générer une documentation OpenAPI/Swagger des routes internes (`/api/*`).

### 13.2 Moyen terme — Fonctionnalités

- **Notifications** : rappels quotidiens pour le tracker d'émotions (via email ou push web).
- **Tableaux de bord analytiques** : graphiques d'évolution des émotions sur plusieurs semaines/mois.
- **Internationalisation (i18n)** : support multilingue (français, anglais, espagnol).
- **Import/Export de données** : permettre à l'utilisateur de télécharger ses données au format JSON/CSV (RGPD, portabilité).

### 13.3 Long terme — Infrastructure et déploiement

- **Déploiement en production** : activation du job de déploiement SSH dans la CI (serveur VPS OVH, Scaleway ou AWS EC2).
- **Observabilité** : intégration d'un outil de monitoring (Prometheus + Grafana ou Datadog) pour suivre les healthchecks, les erreurs 500 et les temps de réponse.
- **Reverse proxy et HTTPS** : mise en place de Traefik ou Nginx avec certificats Let's Encrypt automatiques.
- **Scalabilité** : passage à plusieurs replicas de l'application (Docker Swarm ou Kubernetes) derrière un load balancer.
- **Backup automatique** : snapshots quotidiens de la base PostgreSQL vers un stockage objet (S3, Swift) avec chiffrement.

---

## 14. Conclusion

Le projet CESIZen constitue une mise en pratique complète du cycle de vie d'une application moderne : du développement full-stack avec Next.js et Drizzle ORM, jusqu'à la containerisation Docker, l'automatisation CI/CD avec GitHub Actions, et la sécurisation des données et de l'infrastructure.

Les choix techniques réalisés — notamment l'adoption du mode **standalone** de Next.js, de l'ORM **Drizzle** pour la sécurité des requêtes SQL, et de la **stratégie JWT** pour l'authentification — démontrent une attention particulière portée à la performance, à la maintenabilité et à la sécurité.

La chaîne CI/CD en **7 jobs** (lint, tests unitaires, build, scan sécurité, Docker build, tests E2E, déploiement) garantit que chaque modification du code est validée de manière exhaustive avant d'atteindre la branche principale. L'intégration de **Trivy** et de `npm audit` dans le pipeline renforce la détection précoce des vulnérabilités.

La conformité **RGPD** est assurée par une approche de minimisation des données, un consentement explicite, un droit à l'effacement implémenté, et un registre des traitements documenté.

Les perspectives d'évolution — déploiement production, observabilité, tests de charge, internationalisation — montrent que CESIZen repose sur une base technique solide et évolutive.

Ce projet illustre l'approche holistique du métier de **Concepteur Développeur d'Applications** : concevoir une application fonctionnelle, mais aussi penser son déploiement, sa sécurité, sa maintenabilité et son opérabilité dans la durée.

---

*Rapport rédigé dans le cadre du Bloc 3 — CESI CDA 2025-2026*
