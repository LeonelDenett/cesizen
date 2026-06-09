# Ticket #005 — Politique de tests et couverture 70%

## Statut : ✅ **Fermé** (merge dans `develop`)

## Branches
- `feature/testing-policy` (seuil 50% + 3 types de tests)
- `feature/testing-coverage` (seuil 70% + tests API complets)

## Description
Implémenter une politique de tests complète avec 3 types de tests (unitaires, intégration, E2E), corriger les mots de passe des E2E, supprimer les tests tracker obsolètes, et monter la couverture de tests à 70%.

## Livrables
1. ✅ `docs/testing-policy.md` — document référentiel
2. ✅ Tests d'intégration API (`__tests__/integration/api/`)
3. ✅ Tests unitaires pour helpers, utils, routes API
4. ✅ E2E corrigés (mots de passe 12+ symboles)
5. ✅ `tracker.spec.ts` supprimé
6. ✅ Seuil CI : 70% (bloquant)
7. ✅ `.github/workflows/ci.yml` — E2E bloquants (`continue-on-error: false`)

## Résultat
- **171 tests** passent, 0 échec
- Couverture globale : **85.59%** statements, 74.26% branches, 85.45% functions, 87.06% lines
- Les tests API sont tous couverts à 85%+ (admin-breathing, breathing-*, favorites, menu-items, info-pages, users)

## Commits
- `feat(tests): implement testing policy with 3 test types and 50% threshold`
- `test(api): ajouter tests pour toutes les routes API et monter couverture à 70%`

## Notes
- Fichiers `docs/features.md` et `docs/todo.md` ne doivent pas être commités (ajoutés à `.gitignore`)
- `secrets.db` et `server-e2e.log` ne doivent pas être commités (ajoutés à `.gitignore`)

---

*Ticket fermé le 2026-06-09*
