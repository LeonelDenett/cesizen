# Checklist de mise en œuvre — CESIZen Bloc 3

> Ce document liste les actions concrètes à réaliser pour que le projet soit conforme au rapport et à la grille d'évaluation. Chaque case cochée = un point validé pour la soutenance.

---

## 1. Versioning Git (Outil de versioning configuré — 2 pts)

- [x] Repository Git initialisé et push sur GitHub
- [x] Branche `main` (code stable)
- [ ] **Créer la branche `develop`** et la pousser sur GitHub
- [ ] **Créer un tag semver** `v1.0.0` sur `main`
- [x] Commits avec noms explicites (feat:, fix:, docs:, refactor:)

**Commandes à exécuter :**
```bash
# Depuis develop (après avoir commité le fix ts-node)
git push -u origin develop

# Merge develop → main
git checkout main
git merge develop

# Push main
git push origin main

# Tag sur main
git tag -a v1.0.0 -m "Release v1.0.0 — MVP CESIZen"
git push origin v1.0.0
```

---

## 2. CI/CD — Pipeline GitHub Actions (Plan de déploiement — 6 pts)

- [x] Fichier `.github/workflows/ci.yml` créé avec 7 jobs
- [x] Pipeline déclenchée automatiquement sur push/PR vers `main` ou `develop`
- [ ] **Vérifier que la pipeline passe** (jobs lint, test, build au minimum)
- [x] Job Docker build + push vers GHCR configuré

**Vérification :**
- Aller sur `https://github.com/LeonelDenett/cesizen/actions`
- Vérifier que le workflow "CI/CD - CESIZen" est vert sur le dernier push

---

## 3. Tests (Bonnes pratiques de développement — 1 pt)

- [x] Tests unitaires Jest configurés (`jest.config.ts`)
- [x] Property-based tests (fast-check) sur auth, users, security
- [ ] **Fix appliqué** : ajout de `ts-node` pour que Jest puisse lire `jest.config.ts`
- [x] Tests E2E Playwright configurés
- [x] Coverage Jest généré dans la CI

**Commande de validation locale :**
```bash
npm run test -- --coverage
# Doit afficher : Test Suites: 6 passed, 51 passed
```

---

## 4. Ticketing — GitHub Issues (Outil de gestion des évolutions — 6 pts)

- [x] Fichiers de tickets créés dans `docs/tickets/`
- [ ] **Créer les 4 Issues sur GitHub** manuellement via le navigateur
  - Issue #1 — Bug d'authentification (statut : **Closed**)
  - Issue #2 — Évolution UI (statut : **Open**)
  - Issue #3 — Correctif de sécurité headers HTTP (statut : **Closed**)
  - Issue #4 — Dette technique tests E2E (statut : **Open**)
- [ ] **Créer les labels** sur GitHub : `bug`, `evolution`, `security`, `debt`, `priority:critical`, `priority:high`, `priority:medium`, `priority:low`

**Pourquoi ?** : 2 tickets fermés prouvent que la méthodologie fonctionne. 2 tickets ouverts prouvent la planification future.

---

## 5. GitHub Project — Kanban (Outil de gestion des évolutions — 3 pts bonus)

- [ ] **Créer un Project "Board"** sur GitHub
  - Nom : "CESIZen — Maintenance & Évolutions"
  - Colonnes : `Backlog`, `En cours`, `Revue`, `Terminé`
- [ ] Placer les issues ouvertes (#2, #4) dans `Backlog`
- [ ] Placer les issues fermées (#1, #3) dans `Terminé`

**Lien :** `https://github.com/LeonelDenett/cesizen/projects`

---

## 6. Sécurité (Plan de sécurisation — 8 pts + RGPD — 2 pts)

- [x] Analyse des vulnérabilités dans `docs/deployment-plan.md` (tableau risques)
- [x] Headers HTTP renforcés (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [x] Dockerfile durci (utilisateur non-root, Alpine, healthcheck)
- [x] Scan Trivy + npm audit dans la CI
- [x] RGPD : consentement, minimisation, droit à l'effacement (`/api/account`)
- [x] Registre des traitements dans `docs/rgpd.md`
- [ ] **Créer les labels** `security` et `priority:critical` sur GitHub (si pas déjà fait au point 4)

---

## 7. Containerisation & Environnements (Mise en place environnements — 2 pts)

- [x] Dockerfile multi-étapes (base → deps → builder → runner)
- [x] `docker-compose.yml` — Production
- [x] `docker-compose.dev.yml` — Développement
- [x] `docker-compose.test.yml` — Tests / Recette
- [x] Script `scripts/deploy-local.sh` (déploiement local automatisé)
- [x] Script `scripts/entrypoint.sh` (migrations + seed au démarrage)
- [ ] **Démonstration obligatoire** : `./scripts/deploy-local.sh` doit fonctionner le jour J

**Validation :**
```bash
./scripts/deploy-local.sh
curl http://127.0.0.1:3333/api/health
# Doit répondre : {"status":"ok","service":"cesizen"}
```

---

## 8. Documentation (Qualité du dossier — 1 pt)

- [x] `docs/rapport.md` — Rapport de projet complet
- [x] `docs/deployment-plan.md` — Plan de déploiement, maintenance, sécurisation
- [x] `docs/workflow.md` — Flux de travail ticket → merge
- [x] `docs/rgpd.md` — Registre des traitements RGPD
- [x] `docs/adr/001-choix-docker-standalone.md` — Décision d'architecture
- [x] `docs/tickets/` — 4 exemples de tickets
- [x] `documents/guia.md` — Guide pratique pour la soutenance orale
- [x] `README.md` — Instructions de lancement et architecture
- [x] `.env.example` — Template de variables d'environnement

---

## 9. Veille technologique (Garanties d'évolutivité — 3 pts)

- [x] `docs/adr/` — Architecture Decision Records
- [x] `.github/dependabot.yml` — Mises à jour automatiques npm + Docker + Actions
- [ ] **Activer Dependabot** dans GitHub (Settings → Code security → Dependabot)

---

## 10. Démonstration finale — Checklist avant la soutenance

> À cocher le jour J, 30 minutes avant de rentrer dans la salle.

- [ ] `docker compose down -v` puis `./scripts/deploy-local.sh` → tout fonctionne
- [ ] `npm run lint` passe sans erreur
- [ ] `npm run test` passe (51 tests)
- [ ] GitHub Actions est vert sur le dernier commit de `main`
- [ ] Le site est accessible sur `http://127.0.0.1:3333`
- [ ] Les 5 onglets du navigateur sont ouverts (repo, issues, project, actions, app locale)
- [ ] Ce fichier `docs/tasks.md` est cohérent avec l'état réel du projet

---

*Document de suivi — Dernière mise à jour : juin 2026*
