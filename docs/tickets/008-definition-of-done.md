# Ticket #008 — Definition of Done (DoD)

## Informations

| Champ | Valeur |
|-------|--------|
| **Titre** | Créer la Definition of Done (DoD) du projet |
| **Type** | Process / Qualité |
| **Priorité** | 🔴 **Critique** |
| **Statut** | ✅ **Fermé** |
| **Créé le** | 2026-06-09 |

## Description

Rédiger et mettre en place la **Definition of Done (DoD)** du projet CESIZen. Ce document définit les critères minimaux et obligatoires que chaque tâche doit respecter pour être considérée comme terminée et livrable.

## Livrables

1. ✅ `docs/definition-of-done.md` — Document complet en français

## Contenu du document

### 1. Critères universels
- Qualité du code (TypeScript strict, ESLint, pas de dead code)
- Tests et couverture (≥ 70%, pas de régression)
- CI/CD verte (8 jobs GitHub Actions)
- Sécurité (pas de secrets, validation Zod, headers HTTP, RGPD)
- Documentation (README, tickets, ADR)

### 2. Critères par type de tâche
- **Feature** : tests unitaires + E2E, validation Zod, responsive, accessibilité, messages d'erreur français
- **Bug** : test reproduisant le bug, pas de régression, ticket mis à jour
- **Sécurité** : analyse de risque, tests de sécurité, SonarCloud propre, audit log
- **DevOps** : Dockerfile testé, docker-compose fonctionnel, healthchecks, ports bindés sur 127.0.0.1
- **Tests** : non-régression, couverture stable, tests E2E stables

### 3. Processus de validation (workflow)
```
Développement local → Push branche feature → CI/CD → PR (review) → Validation develop → Livraison main
```

### 4. Matrice de validation
| Livrable | Tests | E2E | CI | SonarCloud | Docker | Doc |
|----------|-------|-----|----|------------|--------|-----|
| Feature CRUD | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Bug | ✅ | ✅ Si régression | ✅ | ✅ | ❌ | ✅ |
| Sécurité | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| DevOps | ✅ Si scripts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documentation | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 5. Exceptions
- **Hotfix critique** : CI minimum, correction rapide + PR complète sous 24h
- **Documentation pure** : pas de tests, review obligatoire
- **Dependabot** : revue manuelle de la CVE + merge si CI verte

### 6. Glossaire
CI/CD, SAST, E2E, DoD, TDD, ADR, CVE, RGPD, Flaky test, Dead code

## Résultat

- DoD complète et détaillée en français
- Applicable à toutes les tâches du projet
- Maintenue et révisée à chaque itération

## Critères d'acceptation

- [x] Document rédigé en français
- [x] Critères couvrant tous les types de tâches
- [x] Processus de validation clair avec diagramme
- [x] Exceptions et dérogations documentées
- [x] Glossaire inclus

---

*Ticket fermé le 2026-06-09*
