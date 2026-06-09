# Definition of Done (DoD) — CESIZen

## 1. Contexte et objectif

La **Definition of Done (DoD)** définit les critères minimaux et obligatoires qu'une tâche doit respecter pour être considérée comme **terminée** et **livrable**. Elle garantit la qualité, la maintenabilité et la sécurité du projet CESIZen à chaque étape du cycle de développement.

**Portée** : cette DoD s'applique à toutes les tâches (features, bugs, sécurité, infrastructure) réalisées sur le projet CESIZen.

**Objectifs** :
- Standardiser la qualité des livrables
- Réduire la dette technique
- Faciliter la revue de code
- Garantir la traçabilité (ticketing, audit)
- Assurer la conformité RGPD et sécurité

---

## 2. Critères universels (applicables à toutes les tâches)

Ces critères doivent être respectés **systématiquement**, quelle que soit la nature de la tâche.

### 2.1 Qualité du code

- [ ] Le code est écrit en **TypeScript** avec le mode strict activé
- [ ] Le code suit les conventions du projet (linting ESLint avec `eslint-config-next`)
- [ ] Le linter passe sans erreur : `npm run lint`
- [ ] Pas de `console.log` ou de débogage oublié dans le code
- [ ] Pas de code commenté ou mort (dead code)
- [ ] Les variables, fonctions et composants sont nommés de manière explicite (français ou anglais, cohérent)

### 2.2 Tests et couverture

- [ ] Les **tests unitaires** passent sans échec : `npm run test`
- [ ] La **couverture de tests** est maintenue au-dessus du seuil défini (≥ 70% global)
- [ ] Les tests de la tâche modifiée sont verts (pas de régression)
- [ ] Les nouvelles fonctionnalités incluent des tests unitaires
- [ ] Les cas limites (edge cases) sont testés

### 2.3 Intégration continue

- [ ] La **pipeline CI/CD** est verte sur la branche (GitHub Actions)
- [ ] Les jobs suivants passent :
  - `lint` (qualité du code)
  - `test-unit` (tests unitaires)
  - `build` (compilation Next.js)
  - `sonarqube` (analyse SAST)
  - `security-scan` (Trivy + npm audit)
  - `docker-build` (image Docker)
  - `e2e` (tests end-to-end, si applicable)
- [ ] Le **scan SonarCloud** ne rapporte pas de vulnérabilité critique non résolue

### 2.4 Sécurité et conformité

- [ ] Aucun **secret** (mot de passe, token, clé API) n'est présent dans le code
- [ ] Les variables sensibles passent par des variables d'environnement ou GitHub Secrets
- [ ] Les entrées utilisateur sont **validées avec Zod** (validation runtime)
- [ ] Les headers de sécurité HTTP sont respectés (CSP, X-Frame-Options, etc.)
- [ ] Les actions critiques (login, CRUD admin) sont journalisées dans `audit_logs`
- [ ] La conformité **RGPD** est respectée (minimisation, consentement, droit à l'effacement)

### 2.5 Documentation

- [ ] Le **README.md** est mis à jour si la procédure d'installation ou d'utilisation change
- [ ] Les **tickets** (GitHub Issues ou `docs/tickets/`) sont mis à jour avec le statut
- [ ] Les **ADR** (Architecture Decision Records) sont créés si la décision technique est importante (`docs/adr/`)
- [ ] Les **commentaires de code** expliquent le "pourquoi", pas le "quoi"
- [ ] Le **rapport de projet** (`docs/rapport.md`) est mis à jour si nécessaire

---

## 3. Critères par type de tâche

### 3.1 Feature / Évolution fonctionnelle

- [ ] La fonctionnalité répond au **besoin exprimé** dans le ticket
- [ ] Les **tests unitaires** couvrent la nouvelle logique métier
- [ ] Les **tests E2E** couvrent le parcours utilisateur (si applicable)
- [ ] La **validation Zod** est en place sur les formulaires et API routes
- [ ] L'**interface utilisateur** est responsive (mobile-first, Tailwind CSS)
- [ ] L'**accessibilité** (a11y) est respectée (labels ARIA, contraste, navigation clavier)
- [ ] Les **messages d'erreur** sont explicites et en français
- [ ] Les **données de démo** (seed) sont cohérentes et ne contiennent pas de vraies données personnelles
- [ ] Le **seed est bloqué en production** (vérification `NODE_ENV === 'production'`)

### 3.2 Bug / Correctif

- [ ] Le **bug est reproduit** par un test avant correction (TDD)
- [ ] Le **test reproduisant** passe après la correction
- [ ] Aucune **régression** n'est introduite (tests E2E passent)
- [ ] Le **ticket** est mis à jour avec la cause racine et la solution
- [ ] Le **correctif** est minimal (pas de refactorisation opportuniste)
- [ ] Le **log d'audit** est vérifié si le bug touche à la sécurité

### 3.3 Sécurité / Hardering

- [ ] Une **analyse de risque** est mise à jour (`docs/rapport.md` section sécurité)
- [ ] Les **tests de sécurité** passent (headers, injection SQL, XSS, CSRF)
- [ ] Le **scan SonarCloud** est propre (pas de vulnérabilité critique)
- [ ] Le **scan Trivy** est proche (pas de CVE critique dans les dépendances)
- [ ] Les **logs d'audit** sont activés pour les actions concernées
- [ ] La **politique de mots de passe** est respectée (12+ symboles, bcrypt cost 12)
- [ ] Le **pepper** est régénéré si le mécanisme d'authentification est modifié
- [ ] Les **headers HTTP** sont testés via `curl -I` ou navigateur

### 3.4 Infrastructure / DevOps

- [ ] Le **Dockerfile** est testé : `docker build .` passe
- [ ] Le **docker-compose** est testé : `docker compose up -d` fonctionne
- [ ] Les **healthchecks** (app + DB) répondent correctement
- [ ] La **CI/CD** est mise à jour si le pipeline change
- [ ] Les **variables d'environnement** sont documentées (README ou `.env.example`)
- [ ] La **rétrocompatibilité** est assurée (pas de breaking change sans migration)
- [ ] Les **limites de ressources** Docker sont configurées (CPU/RAM)
- [ ] Les **ports** sont bindés sur `127.0.0.1` en production (pas d'exposition publique)

### 3.5 Tests / Qualité logicielle

- [ ] Les **tests de non-régression** passent (Playwright + Jest)
- [ ] La **couverture** ne baisse pas (ou est justifiée si elle baisse)
- [ ] Les **tests de propriété** (property-based) passent (fast-check)
- [ ] Les **tests E2E** sont stables (pas de flaky tests)
- [ ] Le **rapport de couverture** est généré et archivé (`coverage/`)

---

## 4. Processus de validation (workflow)

```
┌─────────────────────────────────────────────────────────┐
│  1. Développement local                                 │
│     ├─ Code + Tests unitaires                           │
│     ├─ Linter : npm run lint                            │
│     ├─ Tests : npm run test                             │
│     └─ E2E local : npm run test:e2e:local               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  2. Push sur branche feature                            │
│     ├─ Créer la branche : feature/XXX-description      │
│     ├─ Commits atomiques avec référence au ticket      │
│     └─ Push sur GitHub                                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  3. CI/CD automatique (GitHub Actions)                   │
│     ├─ Lint → Tests → Build → SonarCloud → Docker → E2E │
│     └─ Si la pipeline est verte : continuer              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  4. Pull Request (obligatoire pour main)               │
│     ├─ Description de la PR liée au ticket               │
│     ├─ Review de code (1 approbation minimum)            │
│     ├─ Discussion et résolution des commentaires       │
│     └─ Merge squash sur develop                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  5. Validation sur develop                              │
│     ├─ Tests E2E complets                               │
│     ├─ Vérification manuelle (si nécessaire)           │
│     └─ PR vers main (si livraison)                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  6. Livraison (main)                                    │
│     ├─ Pipeline CI/CD complète (8 jobs)                 │
│     ├─ Déploiement automatique (GHCR)                   │
│     └─ Ticket fermé + documentation mise à jour       │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Matrice de validation par type de livrable

| Type de livrable | Tests unitaires | Tests E2E | CI/CD | SonarCloud | Docker | Doc |
|------------------|-----------------|-----------|-------|------------|--------|-----|
| Feature CRUD | ✅ Obligatoire | ✅ Obligatoire | ✅ | ✅ | ❌ | ✅ |
| Feature UI | ✅ | ✅ Si parcours | ✅ | ✅ | ❌ | ✅ |
| Bug / Correctif | ✅ (test reproduit) | ✅ Si régression | ✅ | ✅ | ❌ | ✅ |
| Sécurité | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (risques) |
| DevOps / Docker | ✅ Si scripts | ✅ | ✅ | ✅ | ✅ Obligatoire | ✅ |
| Tests / Coverage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Documentation | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Obligatoire |

---

## 6. Exceptions et dérogations

### 6.1 Hotfix critique (production down)

- **Contexte** : incident bloquant en production
- **Dérogation** : CI minimum (lint + tests unitaires + build)
- **Condition** : correction rapide suivie d'une PR complète sous 24h
- **Processus** : push direct sur `main` (si bypass activé) ou PR accélérée

### 6.2 Documentation pure

- **Contexte** : modification du README, du rapport, ou des tickets
- **Dérogation** : pas de tests, pas de CI Docker
- **Condition** : review obligatoire (1 approbation)
- **Processus** : PR classique mais pipeline réduite (lint + build uniquement)

### 6.3 Mise à jour de dépendances (Dependabot)

- **Contexte** : PR automatique de Dependabot
- **Dérogation** : pas de tests E2E si le changement est mineur (patch)
- **Condition** : tests unitaires passent + build OK
- **Processus** : revue manuelle de la CVE + merge si CI verte

---

## 7. Glossaire

| Terme | Définition |
|-------|------------|
| **CI/CD** | Intégration Continue / Déploiement Continu (GitHub Actions) |
| **SAST** | Static Application Security Testing (analyse statique du code) |
| **E2E** | End-to-End (tests de bout en bout avec Playwright) |
| **DoD** | Definition of Done (définition de "terminé") |
| **TDD** | Test-Driven Development (développement piloté par les tests) |
| **ADR** | Architecture Decision Record (document de décision technique) |
| **CVE** | Common Vulnerabilities and Exposures (faille de sécurité connue) |
| **RGPD** | Règlement Général sur la Protection des Données |
| **Flaky test** | Test instable qui échoue aléatoirement |
| **Dead code** | Code inutilisé ou jamais exécuté |

---

## 8. Révision et maintenance

Cette DoD est un document vivant. Elle doit être :

- **Révisée** à chaque sprint ou itération majeure
- **Mise à jour** si de nouveaux outils sont intégrés (ex: nouveau scanner de sécurité)
- **Validée** par l'équipe (ou le responsable projet)
- **Versionnée** : date de dernière mise à jour en bas du document

**Dernière mise à jour** : Juin 2026
**Responsable** : Concepteur Développeur d'Applications — CESI

---

*Document de référence pour la qualité et la livraison du projet CESIZen*
