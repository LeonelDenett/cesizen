# Politique de tests — CESIZen

Document référentiel définissant les 3 types de tests obligatoires, les seuils de couverture, les scénarios de sécurité à tester et les règles d'intégration CI.

## 1. Périmètre

Tout code applicatif (`app/`, `lib/`, `components/`) doit être couvert par des tests. Les tests de sécurité sont obligatoires pour toute modification touchant à l'authentification, aux entrées utilisateurs ou aux routes API.

## 2. Seuils de couverture minimale

| Granularité | Seuil | Justification |
|-------------|-------|---------------|
| **Global** | ≥ 70 % (branches, fonctions, lignes, statements) | Objectif : 80 % — ticket `feature/testing-policy-coverage` |
| **Objectif 2026** | ≥ 80 % | Plan de montée en couverture via ajout de tests sur les routes API |
| **Authentification / Autorisation** | ≥ 95 % | Zone critique — aucun chemin non testé |
| **Validation & sanitization** | ≥ 90 % | Les entrées utilisateurs sont le principal vecteur d'attaque |
| **Routes API protégées** | 100 % | Toutes les routes `/api/*` avec `getCurrentUser` doivent être testées |

## 3. Les 3 types de tests obligatoires

### 3.1 Tests unitaires (`__tests__/unit/`)
- **Outil** : Jest + ts-jest + mocks
- **Objectif** : tester une fonction isolée avec ses dépendances mockées
- **Vitesse** : ⚡ Rapide (< 1 s par test)
- **Exemples** : `lib/actions/auth.ts`, `lib/validators/auth.ts`, `lib/logger.ts`, `lib/db/schema`
- **Règle** : tout fichier `lib/actions/*.ts` doit avoir un fichier de test unitaire correspondant

### 3.2 Tests d'intégration (`__tests__/integration/`)
- **Outil** : Jest + Next.js Request + base de données PostgreSQL réelle (test)
- **Objectif** : tester une route API ou un service de bout en bout sans navigateur
- **Vitesse** : 🚀 Moyen (2-5 s par test — connexion DB réelle)
- **Réalisme** : Élevé — exécute le vrai code Drizzle, le vrai middleware Next.js
- **Exemples** :
  - `POST /api/users` sans session → `401 Unauthorized`
  - `GET /api/users` avec session admin → `200 OK` avec liste paginée
  - `POST /api/info-pages` sans session → `401 Unauthorized`
- **Base de données** : `docker-compose.test.yml` (base `cesizen_test`, port `5478`)
- **Règle** : toute route API avec `getCurrentUser()` doit avoir au moins un test d'intégration

### 3.3 Tests E2E / Fonctionnels (`__tests__/e2e/`)
- **Outil** : Playwright (Chromium)
- **Objectif** : tester les parcours utilisateur complets avec un navigateur réel
- **Vitesse** : 🐌 Lent (10-30 s par test)
- **Réalisme** : Très élevé — simule un vrai utilisateur avec clics, saisies, navigation
- **Parcours testés** :
  - Authentification : inscription, connexion, déconnexion, réinitialisation de mot de passe
  - Administration : CRUD utilisateurs, gestion des rôles
  - CMS : création, publication, modification de pages d'information
- **Règle** : les tests E2E sont **bloquants** en CI (`continue-on-error: false`)

## 4. Tests de sécurité obligatoires

| Scénario | Type | Outil | Fichier | Priorité |
|----------|------|-------|---------|----------|
| Tentative de brute-force sur login | Intégration | Jest | `__tests__/security/brute-force.test.ts` | 🔴 Critique |
| Injection SQL sur champs de recherche | Intégration | Jest | `__tests__/security/sql-injection.test.ts` | 🔴 Critique |
| XSS sur champs de saisie libre | Intégration | Jest | `__tests__/security/xss.test.ts` | 🔴 Critique |
| CSRF sur mutations POST | E2E | Playwright | `__tests__/e2e/security.spec.ts` | 🟠 Haute |
| Rate limiting | Intégration | Jest | `__tests__/security/rate-limit.test.ts` | 🟠 Haute |
| Politique de mot de passe (12+ symboles) | Propriétés | fast-check | `__tests__/properties/auth.property.test.ts` | ✅ Déjà implémenté |
| Routes protégées sans auth | Intégration | Jest | `__tests__/integration/api/*.test.ts` | ✅ Déjà implémenté |

## 5. Règles de nommage et de structure

| Type | Chemin | Extension |
|------|--------|-----------|
| Unitaires | `__tests__/unit/<domaine>/<sujet>.test.ts` | `.test.ts` |
| Propriétés | `__tests__/properties/<domaine>.property.test.ts` | `.property.test.ts` |
| Intégration | `__tests__/integration/<couche>/<sujet>.test.ts` | `.test.ts` |
| Sécurité | `__tests__/security/<scenario>.test.ts` | `.test.ts` |
| E2E | `__tests__/e2e/<parcours>.spec.ts` | `.spec.ts` |

## 6. Commandes de test

```bash
# Tests unitaires (rapide)
npm test

# Tests unitaires avec couverture et seuil 80%
npm run test:coverage

# Tests E2E (lent — nécessite le serveur)
npm run test:e2e

# Tests d'intégration (nécessite la base de test)
npm run test -- __tests__/integration/
```

## 7. Intégration CI

### Pipeline bloquante
| Job | Condition de succès | Action si échec |
|-----|---------------------|-----------------|
| `lint` | 0 erreurs ESLint | ❌ Bloque le merge |
| `test-unit` | Couverture ≥ 80 % | ❌ Bloque le merge |
| `build` | Build Next.js sans erreur | ❌ Bloque le merge |
| `security-scan` | `npm audit` sans vulnérabilité High/Critical | ❌ Bloque le merge |
| `docker-build` | Image construite avec succès | ❌ Bloque le merge |
| `e2e` | Tous les tests Playwright passent | ❌ Bloque le merge |

### Seuil de couverture CI
```yaml
# .github/workflows/ci.yml
- run: npm run test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

## 8. Définition of Done (Test)

Avant merge sur `develop`, chaque Pull Request doit :

1. ✅ **Ajouter ou modifier les tests** correspondant au code changé.
2. ✅ **Vérifier la couverture** : `npm run test:coverage` doit passer sans baisse sous 80 %.
3. ✅ **Inclure un test de sécurité** si la PR touche à :
   - `lib/auth.ts` ou `lib/actions/auth.ts`
   - `lib/validators/*.ts`
   - `app/api/**/*.ts` (routes protégées)
   - Tout champ de saisie libre (texte, recherche, commentaire)
4. ✅ **Passer les tests E2E** : `npm run test:e2e` en local ou en CI.
5. ✅ **Documenter** dans `docs/rapport.md` si une nouvelle mesure de sécurité est testée.

## 9. Maintenance

- **Revue trimestrielle** : vérifier que les seuils de couverture sont toujours pertinents.
- **Audit des tests** : supprimer les tests obsolètes (fonctionnalités retirées, ex: `tracker.spec.ts`).
- **Ajout progressif** : chaque nouvelle fonctionnalité livre son test d'intégration avant le merge.

---

*Document généré le 2026-06-09 — Dernière mise à jour : `feature/testing-policy`.*
