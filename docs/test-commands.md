# Commandes de test — CESIZen

> Ce document liste toutes les commandes de test disponibles pour la présentation et la validation du projet.
> Chaque commande est classée par catégorie avec son objectif et le résultat attendu.

---

## 🎯 Tests à "aficher" en présentation (les plus impressionnants)

### 1. Test de protection du seed en production
```bash
npm run test -- __tests__/seed-prod-guard.test.ts
```
**Résultat attendu :** `5 passed` — le seed se bloque en production (NODE_ENV=production)
**Pourquoi l'afficher :** Démontre que les données de développement ne peuvent jamais écraser la production

### 2. Test de backup et restauration de secrets.db
```bash
npm run test -- __tests__/secrets-backup.test.ts
```
**Résultat attendu :** `10 passed` — backup, restore, limite de 10 backups, récupération après perte
**Pourquoi l'afficher :** Démontre la fiabilité du système de récupération des secrets

### 3. Tests de sécurité (propriétés)
```bash
npm run test -- __tests__/properties/security.property.test.ts
```
**Résultat attendu :** `passed` — tests de sécurité basés sur des propriétés (fast-check)
**Pourquoi l'afficher :** Démontre l'utilisation du property-based testing pour la sécurité

### 4. Tests de l'authentification (pepper + bcrypt)
```bash
npm run test -- __tests__/unit/audit-logger.test.ts
```
**Résultat attendu :** `11 passed` — vérification du logger d'audit, des actions et des types
**Pourquoi l'afficher :** Démontre la journalisation d'audit des événements de sécurité

### 5. Tests E2E (en direct — 30 secondes)
```bash
npm run test:e2e:local
```
**Résultat attendu :** `4 passed` — admin, auth, auth-invalid, cms
**Pourquoi l'afficher :** Démontre les parcours utilisateurs complets dans un navigateur réel

---

## 🧪 Tests unitaires (Jest)

### Tous les tests unitaires
```bash
npm run test
```
**Résultat attendu :** `Test Suites: 25 passed, 25 total / Tests: 171 passed, 171 total`

### Avec couverture
```bash
npm run test:coverage
```
**Résultat attendu :** `Statements: 85%, Branches: 74%, Functions: 85%, Lines: 87%`
**Seuil requis :** ≥ 70% global

### Tests de propriétés (Property-based testing)
```bash
npm run test -- __tests__/properties/auth.property.test.ts
npm run test -- __tests__/properties/users.property.test.ts
npm run test -- __tests__/properties/security.property.test.ts
npm run test -- __tests__/properties/ui.property.test.ts
npm run test -- __tests__/properties/info-pages.property.test.ts
```
**Outil :** fast-check — génère des données aléatoires pour tester les invariants

### Tests d'intégration API
```bash
npm run test -- __tests__/integration/api/auth.routes.test.ts
```

### Tests unitaires par module
```bash
# Tests de compte
npm run test -- __tests__/unit/api/account.test.ts

# Tests d'exercices de respiration
npm run test -- __tests__/unit/api/breathing-exercises.test.ts

# Tests d'utilisateurs
npm run test -- __tests__/unit/api/users.test.ts

# Tests de pages d'information
npm run test -- __tests__/unit/api/info-pages.test.ts

# Tests de favoris
npm run test -- __tests__/unit/api/favorites.test.ts
```

---

## 🎭 Tests End-to-End (Playwright)

### Tests E2E simples
```bash
npm run test:e2e
```
**Nécessite :** `npm run dev` + base de données en cours d'exécution

### Tests E2E avec Docker complet
```bash
npm run test:e2e:docker
```
**Lance :** Docker Compose + PostgreSQL + migrations + seed + Playwright

### Tests E2E automatisés en local
```bash
npm run test:e2e:local
```
**Équivalent à :** `bash scripts/test-e2e-full.sh`
**Lance :**
1. Docker Compose E2E (PostgreSQL)
2. Drizzle migrations
3. Seed
4. `npm run dev`
5. Playwright tests
6. Cleanup

---

## 🔍 Tests de sécurité et qualité

### Linter
```bash
npm run lint
```
**Résultat attendu :** `0 errors, 0 warnings` (ou warnings acceptables)

### Audit de sécurité des dépendances
```bash
npm audit
npm audit --audit-level=high
```

### Scan de vulnérabilités (Trivy)
```bash
# Scan du filesystem
npx trivy filesystem .

# Scan de l'image Docker
npx trivy image cesizen:latest
```

---

## 🐳 Tests Docker

### Build de l'image
```bash
docker build -t cesizen:latest .
```

### Test de l'image
```bash
docker run -p 3333:3000 cesizen:latest
```

### Vérifier le healthcheck
```bash
curl http://localhost:3333/api/health
```
**Résultat attendu :** `{"status":"ok","service":"cesizen"}`

### Test du backup de secrets
```bash
# Dans le conteneur
docker exec cesizen-app-prod ./scripts/backup-secrets.sh

# Vérifier le backup
docker exec cesizen-app-prod ls -la /backups/secrets/
```

---

## 📊 Commandes pour la présentation (timing rapide)

| Commande | Durée | Impact visuel |
|----------|-------|---------------|
| `npm run lint` | 5s | ✅ Vert = qualité |
| `npm run test -- __tests__/seed-prod-guard.test.ts` | 10s | 🔒 Sécurité prod |
| `npm run test -- __tests__/secrets-backup.test.ts` | 1s | 💾 Backup fiable |
| `npm run test` | 10s | 🧪 171 tests pass |
| `npm run test:coverage` | 15s | 📈 85% couverture |
| `npm run test:e2e:local` | 30s | 🎭 4 parcours E2E |

---

## 🏆 Top 3 commandes pour impressionner

### 1. Tests de sécurité (5 secondes)
```bash
npm run test -- __tests__/seed-prod-guard.test.ts
```
> "Regardez : le seed est bloqué en production. Si quelqu'un essaie d'exécuter le seed en prod, ça échoue immédiatement."

### 2. Backup de secrets (1 seconde)
```bash
npm run test -- __tests__/secrets-backup.test.ts
```
> "Et si le fichier de secrets est perdu ? On a un test qui vérifie qu'on peut le restaurer depuis un backup."

### 3. Pipeline complète (15 secondes)
```bash
npm run test && npm run test:coverage
```
> "171 tests, 85% de couverture. Tous les cas sont testés : unitaires, intégration, propriétés, E2E."

---

## 🏆 Top 5 commandes pour la soutenance (ordre de présentation)

### 1. Linter (5 secondes) — Qualité du code
```bash
npm run lint
```
> "Mon linter passe à 0 erreur. C'est la première barrière de qualité."

### 2. Tests de sécurité du seed (10 secondes) — Protection production
```bash
npm run test -- __tests__/seed-prod-guard.test.ts
```
> "Regardez : le seed est bloqué en production. Si quelqu'un essaie d'exécuter le seed en prod, ça échoue immédiatement."

### 3. Tests de backup (1 seconde) — Fiabilité
```bash
npm run test -- __tests__/secrets-backup.test.ts
```
> "Et si le fichier de secrets est perdu ? On a un test qui vérifie qu'on peut le restaurer depuis un backup."

### 4. Tests complets (10 secondes) — Couverture
```bash
npm run test
```
> "171 tests, 25 suites, 0 échec. Tous les cas sont testés : unitaires, intégration, propriétés, E2E."

### 5. Couverture (15 secondes) — Métriques
```bash
npm run test:coverage
```
> "85% de couverture. Les seuils sont définis à 70%, on est bien au-dessus."

---

## 📊 Récapitulatif des tests (à afficher sur un slide)

| Catégorie | Nombre | Outil | Résultat |
|-----------|--------|-------|----------|
| **Unitaires** | 171 | Jest | ✅ Pass |
| **Intégration** | 10 fichiers | Jest + DB | ✅ Pass |
| **Property-based** | 5 fichiers | fast-check | ✅ Pass |
| **E2E** | 4 parcours | Playwright | ✅ Pass |
| **Sécurité seed** | 5 | Jest | ✅ Pass |
| **Backup secrets** | 10 | Jest | ✅ Pass |
| **Audit logger** | 11 | Jest | ✅ Pass |
| **Total** | **≥ 171** | — | **✅ 0 échec** |

---

*Document de référence pour la soutenance — Juin 2026*
