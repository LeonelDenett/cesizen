# Plan de déploiement, maintenance et sécurisation — CESIZen

## Table des matières
1. [Contexte et dimensionnement](#1-contexte-et-dimensionnement)
2. [Architecture et environnements](#2-architecture-et-environnements)
3. [Ressources nécessaires](#3-ressources-nécessaires)
4. [Versioning des sources et documentations](#4-versioning-des-sources-et-documentations)
5. [Automatisation et intégration continue](#5-automatisation-et-intégration-continue)
6. [Environnement de démonstration](#6-environnement-de-démonstration)
7. [Maintenance et pérennité](#7-maintenance-et-pérennité)
8. [Sécurité et bonnes pratiques](#8-sécurité-et-bonnes-pratiques)
9. [Plan de sécurisation](#9-plan-de-sécurisation)

---

## 1. Contexte et dimensionnement

**Projet** : CESIZen — Application web de gestion du bien-être (respiration, émotions, challenges)  
**Stack** : Next.js 16 (React 19), Tailwind CSS, PostgreSQL 16, Drizzle ORM, NextAuth.js  
**Public cible** : Utilisateurs finaux recherchant des exercices de relaxation et de suivi émotionnel.  
**Contraintes** :
- Données personnelles et sensibles (émotions, sessions utilisateur) → exigences RGPD élevées.
- Disponibilité attendue : 99 % en production.
- Déploiement externalisé possible sur VPS, cloud (OVH, Scaleway, AWS) ou PaaS (Railway, Render).

**Dimensionnement estimé (MVP → production)** :
| Indicateur | Phase MVP | Production V1 |
|------------|-----------|---------------|
| Utilisateurs simultanés | 10–50 | 200–500 |
| Requêtes/minute | < 100 | 500–1 000 |
| Stockage base | < 1 Go | 5–10 Go |
| Bande passante | < 10 Go/mois | 50–100 Go/mois |

---

## 2. Architecture et environnements

### 2.1 Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Utilisateur                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (TLS 1.2+)
┌───────────────────────────▼─────────────────────────────────────┐
│  Reverse proxy / Load balancer (Nginx / Traefik / Caddy)       │
│  → Terminaison TLS, rate-limiting, headers sécurisés          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│  Conteneur CESIZen (Next.js standalone)                          │
│  → Port 3000, utilisateur non-root (nextjs), healthcheck        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│  PostgreSQL 16 (conteneur ou service managé)                    │
│  → Chiffrement au repos (LUKS / cloud), backups automatiques    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Environnement de développement

**Objectif** : itérations rapides avec hot-reload et persistance des données locales.

- **Fichier** : `docker-compose.dev.yml`
- **Services** :
  - `app` : image Node.js 20 Alpine, montage du code source (`volumes: .:/app`), hot-reload via `npm run dev`.
  - `db` : PostgreSQL 16 Alpine, port exposé `127.0.0.1:5477`, persistance via volume `pgdata-dev`.
- **Réseau isolé** : `cesizen-dev` (bridge).
- **Variables** : chargées depuis `.env.local` (non versionnée).
- **Accès** : http://localhost:3000

**Commandes** :
```bash
docker compose -f docker-compose.dev.yml up
```

### 2.3 Environnement de tests / recette

**Objectif** : valider les fonctionnalités dans un environnement proche de la production, sans impacter le dev ni la prod.

- **Fichier** : `docker-compose.test.yml`
- **Particularités** :
  - Base de données dédiée `cesizen_test` (port 5478).
  - Image Docker construite avec le `Dockerfile` de production (multi-étapes, standalone).
  - Conteneur `app-test` reste actif (`tail -f /dev/null`) pour permettre l'exécution manuelle ou automatique des tests E2E et unitaires.
- **Accès** : http://localhost:3001

**Commandes** :
```bash
docker compose -f docker-compose.test.yml up --build -d
docker compose -f docker-compose.test.yml exec app-test sh
# npm run test
# npm run test:e2e
```

### 2.4 Environnement de production

**Objectif** : haute disponibilité, sécurité, traçabilité.

- **Fichier** : `docker-compose.yml`
- **Services** :
  - `app` : image construite via `Dockerfile`, utilisateur `nextjs` (UID 1001), `NODE_ENV=production`.
  - `db` : PostgreSQL 16, port `127.0.0.1:5477` (pas d'exposition publique), volume `pgdata-prod`.
- **Sécurité** :
  - Ports bindés sur `127.0.0.1` (pas de 0.0.0.0 sauf si reverse proxy sur la même machine).
  - Healthcheck applicatif sur `/api/health` (HTTP 200).
  - Healthcheck base de données (`pg_isready`).
  - Limitation des ressources (CPU 1.0 / RAM 512 Mo par conteneur).
- **Réseau isolé** : `cesizen-prod` (subnet 172.28.1.0/24).
- **Accès** : via reverse proxy externe (Nginx/Traefik) sur le port `APP_PORT` (défaut 3333).

**Commandes** :
```bash
cp .env.example .env
# Éditer .env avec les secrets
./scripts/deploy-local.sh
```

---

## 3. Ressources nécessaires

### Infrastructure (VM / VPS cloud type)

| Environnement | CPU | RAM | Disque | Réseau |
|---------------|-----|-----|--------|--------|
| Développement | 2 cœurs | 4 Go | 20 Go SSD | LAN / local |
| Tests / Recette | 2 cœurs | 4 Go | 20 Go SSD | LAN / local |
| Production (V1) | 2–4 cœurs | 4–8 Go | 40 Go SSD | Public + firewall |

### Outils et licences (gratuites / open-source)

- **Versioning** : Git + GitHub (plan gratuit, repos privés illimités).
- **CI/CD** : GitHub Actions (plan gratuit, 2 000 minutes/mois).
- **Registry** : GitHub Container Registry (GHCR) — inclus.
- **Ticketing** : GitHub Issues + Projects (tableau Kanban) — inclus.
- **Scan sécurité** : Trivy (open-source), `npm audit` (inclus).
- **Chiffrement** : Let's Encrypt (certificats TLS gratuits), `bcryptjs` pour les mots de passe.

---

## 4. Versioning des sources et documentations

### 4.1 Stratégie de branches (Git Flow simplifié)

```
main        → code stable, tags de version (v1.0.0, v1.1.0)
  │
  ├─ develop  → intégration continue, préparation des releases
  │   ├─ feature/XXX-xxx   → évolutions
  │   ├─ fix/XXX-xxx       → corrections de bugs
  │   └─ security/XXX-xxx  → correctifs de sécurité
```

### 4.2 Convention de commits (Conventional Commits)

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatage (pas de changement logique)
- `refactor:` refonte de code
- `test:` ajout/modification de tests
- `chore:` tâches de maintenance
- `security:` correctif de sécurité

Exemple : `fix: correction timeout session (#001)`

### 4.3 Tags et versions

- Format : `vMAJEUR.MINEUR.CORRECTIF` (semver).
- Un tag déclenche automatiquement la création d'une release GitHub + build d'image Docker versionnée.

### 4.4 Documentation versionnée

- Le dossier `docs/` est versionné dans Git.
- Chaque évolution majeure inclut une mise à jour de la documentation dans la même PR.

---

## 5. Automatisation et intégration continue

### 5.1 Pipeline CI/CD (GitHub Actions)

Fichier : `.github/workflows/ci.yml`

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Lint     │    │ Test unit.  │    │   Build     │
│   (ESLint)  │    │   (Jest)    │    │  (Next.js)  │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                   ┌──────▼──────┐
                   │ Docker Build│
                   │ + Trivy    │
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │   Tests E2E │
                   │ (Playwright)│
                   └──────┬──────┘
                          │
              ┌───────────▼───────────┐
              │  Déploiement démo     │
              │  (GHCR / VPS simulé)  │
              └───────────────────────┘
```

### 5.2 Jobs détaillés

| Job | Objectif | Outil |
|-----|----------|-------|
| `lint` | Vérification qualité du code | ESLint |
| `test-unit` | Tests unitaires + couverture | Jest |
| `build` | Compilation Next.js standalone | `npm run build` |
| `security-scan` | Audit dépendances + scan fichiers | `npm audit`, Trivy |
| `docker-build` | Build image multi-étapes, cache GH Actions | Docker Buildx |
| `e2e` | Tests end-to-end avec PostgreSQL de service | Playwright |
| `deploy-demo` | Push image vers GHCR (main ou manuel) | docker/build-push-action |

### 5.3 Optimisations

- **Cache** : `actions/setup-node` avec cache `npm` + cache Docker Buildx (`type=gha`).
- **Artifacts** : le build `.next` est archivé et réutilisé par les jobs `e2e` et `docker-build`.
- **Concurrence** : annulation automatique des exécutions précédentes sur la même branche (`concurrency`).

---

## 6. Environnement de démonstration

Un environnement de production simulé est entièrement **déployable en local** et démontrable :

1. **Cloner** le dépôt.
2. **Configurer** `.env` à partir de `.env.example`.
3. **Lancer** : `./scripts/deploy-local.sh`
   - Vérifie la présence de `.env`.
   - Lance `docker compose up --build -d`.
   - Attend le démarrage et appelle `/api/health`.
4. **Résultat** : l'application est accessible sur `http://127.0.0.1:3333` (port configurable via `APP_PORT`).

Le pipeline GitHub Actions pousse également l'image de démonstration vers **GitHub Container Registry** (`ghcr.io`) sur chaque merge dans `main`, ce qui prouve la chaîne CI/CD complète.

---

## 7. Maintenance et pérennité

### 7.1 Gestion des tickets (GitHub Issues)

**Outil** : GitHub Issues + GitHub Projects (tableau Kanban)

**Labels configurés** :
- `bug` / `evolution` / `security` / `debt`
- `priority:critical` / `priority:high` / `priority:medium` / `priority:low`

**Flux de travail** (voir `docs/workflow.md`) :
1. Création du ticket avec description, type, priorité.
2. Création d'une branche selon la convention (`fix/XXX`, `feature/XXX`).
3. Commits atomiques avec référence au ticket.
4. Pull Request → revue de code + validation CI.
5. Squash merge sur `develop` puis `main`.
6. Déploiement automatique (démo) ou planifié (prod).

### 7.2 Gestion des anomalies

| Priorité | Délai de prise en charge | Délai de correction |
|----------|--------------------------|---------------------|
| Critique (production down) | 1 heure | 4 heures |
| Haute (données corrompues) | 4 heures | 24 heures |
| Moyenne (bug non bloquant) | 24 heures | 1 semaine |
| Basse (cosmétique) | 1 semaine | Next sprint |

**Communication** :
- Ticket GitHub mis à jour en temps réel.
- Si incident critique : création d'une issue dédiée + message sur canal interne (Discord/Slack).

### 7.3 Gestion des évolutions

- Backlog priorisé dans GitHub Projects.
- Estimation en story points (sprints de 2 semaines).
- Avant merge : tests + documentation + revue pair obligatoire.

### 7.4 Veille technologique

**Fréquence** : mensuelle  
**Sources** :
- Next.js releases (GitHub)
- Node.js security releases (nodejs.org)
- PostgreSQL changelog
- OWASP Top 10 mises à jour

**Méthodologie** :
1. Veille automatique via Dependabot (PR hebdomadaires de mises à jour).
2. Réunion mensuelle de 30 min pour évaluer les mises à jour majeures.
3. Test en recette avant mise à jour critique en production.
4. Documentation des décisions dans `docs/adr/` (Architecture Decision Records).

---

## 8. Sécurité et bonnes pratiques

### 8.1 Vulnérabilités, risques et criticité

| Risque | Probabilité | Impact | Criticité | Mesures préventives |
|--------|-------------|--------|-----------|---------------------|
| Injection SQL | Faible | Critique | **Critique** | ORM paramétré (Drizzle), pas de requêtes brutes |
| XSS | Moyenne | Élevé | **Élevé** | Échappement React, CSP, validation Zod |
| Fuite de secrets | Moyenne | Critique | **Critique** | `.env` non versionné, secrets via variables d'env |
| Session hijacking | Moyenne | Élevé | **Élevé** | NextAuth avec secret fort, cookies `Secure` / `HttpOnly` |
| DOS / brute-force | Élevée | Moyen | **Moyen** | Rate-limiting (reverse proxy), bcrypt lent |
| Fuite données RGPD | Faible | Critique | **Critique** | Chiffrement DB, anonymisation, accès restreint |

### 8.2 Solutions de chiffrement et cryptage

- **Mots de passe** : `bcryptjs` avec salt rounds ≥ 10.
- **Sessions / JWT** : signés avec `NEXTAUTH_SECRET` (32+ caractères aléatoires).
- **Transport** : TLS 1.2+ obligatoire (certificats Let's Encrypt).
- **Base de données au repos** : chiffrement du volume disque (LUKS sur VPS, chiffrement natif du cloud provider).
- **Variables sensibles** : jamais dans le code source, injectées au runtime via Docker Compose ou GitHub Secrets.

### 8.3 Gestion des données personnelles (RGPD)

**Données collectées** : email, mot de passe (hash), préférences, émotions, logs de respiration.

**Mesures mises en œuvre** :
- **Consentement** : case obligatoire lors de l'inscription (modal RGPD).
- **Minimisation** : seules les données utiles au service sont stockées.
- **Droit à l'effacement** : endpoint `/api/account` permettant la suppression complète du compte.
- **Pseudonymisation** : identifiants techniques séparés des données métier.
- **Durée de conservation** : suppression automatique des comptes inactifs après 3 ans (à implémenter via cron).
- **Registre des traitements** : documenté dans `docs/rgpd.md` (à créer si audit).

### 8.4 Structuration des développements et bonnes pratiques

- **Lint** : ESLint avec config Next.js (`eslint-config-next`).
- **Types** : TypeScript strict, validation runtime avec Zod sur toutes les API routes.
- **Authentification** : NextAuth.js avec gestion des rôles (user / admin).
- **API** : routes sécurisées par session ou middleware, pas de données sensibles en query string.
- **Logs** : pas de log de secrets, logs structurés (JSON) pour faciliter l'analyse.
- **Dépendances** : audit automatique dans la CI, mise à jour via Dependabot.

---

## 9. Plan de sécurisation

### 9.1 Actions préventives déployées

1. **Conteneur durci** :
   - Utilisateur non-root (`nextjs`, UID 1001).
   - Image minimale (Alpine).
   - Pas de shell superflu (utilisation de `dumb-init` pour le PID 1).
2. **Network** :
   - Base de données non exposée sur l'extérieur (port `127.0.0.1:5477`).
   - Réseau Docker isolé (`cesizen-prod`).
3. **Application** :
   - Headers de sécurité via Next.js (`X-Content-Type-Options`, `X-Frame-Options`, etc.).
   - Healthcheck applicatif `/api/health` pour détecter les défaillances.
4. **CI/CD** :
   - Scan de vulnérabilités (Trivy + npm audit) bloquant ou informatif.
   - Pas de secrets dans les logs GitHub Actions (masquage automatique).

### 9.2 Méthodologie de gestion d'incident de sécurité

**Phases** :
1. **Détection** : alerte CI (scan), monitoring healthcheck, ou signalement utilisateur.
2. **Containment** : isolation immédiate (arrêt conteneur si nécessaire), revue des logs.
3. **Éradication** : patch du code, mise à jour de dépendances vulnérables, rotation des secrets.
4. **Reprise** : redéploiement, vérification des healthchecks.
5. **Post-mortem** : ticket documenté, communication interne, mise à jour du plan.

**Communication** :
- **Interne** : canal d'urgence (Slack/Discord) + réunion de crise.
- **Externe** : si données personnelles impactées → notification à la CNIL sous 72h + utilisateurs concernés.
- **Escalade** : développeur → lead tech → RSSI / DPO → direction.

### 9.3 Checklist de sécurisation avant chaque mise en production

- [ ] Tous les tests passent (unitaires + E2E).
- [ ] Le scan de sécurité CI ne détecte pas de vulnérabilité **critique** non corrigée.
- [ ] Les variables d'environnement de production sont renseignées et uniques.
- [ ] Les migrations ont été testées sur la base de recette.
- [ ] Un backup de la base de production est réalisé avant le déploiement.
- [ ] Le plan de rollback est connu (tag Docker + backup DB).

---

## Annexes

### A. Commandes de déploiement rapide

```bash
# Développement
docker compose -f docker-compose.dev.yml up

# Tests / Recette
docker compose -f docker-compose.test.yml up --build -d

# Production (local)
./scripts/deploy-local.sh

# Build & push image (manuel)
PUSH=true ./scripts/build-and-push.sh
```

### B. Schéma récapitulatif des environnements

| Critère | Développement | Tests / Recette | Production |
|---------|---------------|-----------------|------------|
| Fichier compose | `docker-compose.dev.yml` | `docker-compose.test.yml` | `docker-compose.yml` |
| Base de données | `cesizen` (dev) | `cesizen_test` | `cesizen` (prod) |
| Image app | `node:20-alpine` (volume local) | Build `Dockerfile` | Build `Dockerfile` |
| Hot reload | Oui | Non | Non |
| Healthcheck | Non | Oui | Oui |
| Limites ressources | Non | Non | Oui |
| Réseau isolé | `cesizen-dev` | `cesizen-test` | `cesizen-prod` |

---

*Document versionné — Dernière mise à jour : juin 2026*
