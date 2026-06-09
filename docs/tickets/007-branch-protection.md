# Ticket #007 — Branch Protection Rules

## Informations

| Champ | Valeur |
|-------|--------|
| **Titre** | Activer les branch protection rules sur main et develop |
| **Type** | Sécurité / Process |
| **Priorité** | 🔴 **Critique** |
| **Statut** | ✅ **Fermé** |
| **Créé le** | 2026-06-09 |

## Description

Configurer les branch protection rules dans GitHub pour empêcher le push direct sur main et develop, garantissant que tout passe par Pull Request avec CI verte.

## Configuration

### `main` (strict)
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks:
  - 🔍 Lint & qualité du code
  - 🧪 Tests unitaires
  - 🏗️ Build Next.js
  - SonarCloud Code Analysis
  - 🎭 Tests E2E (Playwright)
- ✅ Block force pushes
- ✅ Dismiss stale PR approvals when new commits are pushed

### `develop` (permissive — solo)
- ✅ Require status checks (mismos 5 checks)
- ✅ Block force pushes
- ❌ No require approvals (travail solo)
- ❌ No require pull request (push direct autorisé)

## Résultat

- `main` : tout passe par PR + 1 review + CI verte
- `develop` : CI verte obligatoire, mais push direct autorisé
- Protection contre force push et commits accidentels

## Livrables
- ✅ GitHub Branch Rulesets configurés dans Settings > Branches

---

*Ticket fermé le 2026-06-09*
