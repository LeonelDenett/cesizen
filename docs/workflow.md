# Flux de travail - Ticket à la validation

## Vue d'ensemble

Ce document décrit le flux de travail utilisé pour gérer les bugs, évolutions et dette technique du projet.

```
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐
│ Ticket  │ -> │ Branche  │ -> │ Commit  │ -> │  PR/MR   │ -> │ Merge   │
│ créer   │    │ créer    │    │ travail │    │ revue    │    │ main    │
└─────────┘    └──────────┘    └─────────┘    └──────────┘    └─────────┘
                                                                 │
                                                                 v
                                                        ┌─────────────┐
                                                        │  Déploiement │
                                                        │  (optionnel) │
                                                        └─────────────┘
```

## Étapes détaillées

### 1. Création du ticket

**Outil:** GitHub Issues ou GitLab Issues

**Contenu requis:**
- Titre clair et descriptif
- Type: Bug / Évolution / Dette technique / Risque
- Priorité: Critique / Haute / Moyenne / Basse
- Description détaillée
- Steps de reproduction (pour les bugs)
- Critères d'acceptation

### 2. Création de la branche

**Convention de nommage:**
- `fix/XXX-description` pour les bugs
- `feature/XXX-description` pour les évolutions
- `security/XXX-description` pour les correctifs de sécurité
- `refactor/XXX-description` pour la dette technique

**Commande:**
```bash
git checkout -b fix/001-session-timeout
```

### 3. Travail et commits

**Règles:**
- Commits atomiques et descriptifs
- Référence du ticket dans le message: `fix: correction du timeout (#001)`
- Un commit par tâche logique

**Exemple:**
```bash
git add src/lib/auth/session.ts
git commit -m "fix: utilise NEXTAUTH_SECRET de l'env (#001)"
```

### 4. Pull Request / Merge Request

**Avant création:**
- Tous les tests passent localement
- Le code respecte les conventions (lint)
- La branche est à jour avec main/develop

**Contenu du PR/MR:**
- Titre: Description courte
- Description: Lien vers le ticket, captures d'écran, notes
- Checklist:
  - [ ] Tests ajoutés/mis à jour
  - [ ] Documentation mise à jour
  - [ ] Code review effectué

### 5. Review et validation

**Processus:**
1. Auto-review avec le pipeline CI
2. Review par un pair
3. Corrections si nécessaire
4. Approbation

### 6. Merge

**Standards:**
- Squash merge obligatoire
- Message de commit final reflète le ticket
- Suppression de la branche après merge

## Pipeline CI

Le pipeline vérifie automatiquement:

| Étape | Description |
|-------|-------------|
| install | Installation des dépendances |
| lint | Vérification du code (ESLint) |
| test | Tests unitaires (Jest) |
| build | Build de l'application Next.js |
| docker | Construction de l'image Docker |
| e2e | Tests end-to-end (Playwright) |

## Exemple concret - Ticket #001

### Ticket initial
- **Titre:** La session expire trop rapidement
- **Type:** Bug
- **Priorité:** Haute

### Branche créée
```
fix/001-session-timeout
```

### Commits
```
a1b2c3d fix: ajout de NEXTAUTH_SECRET dans le compose
e5f6g7h fix: suppression des secrets du Dockerfile
i8j9k0l fix: nettoyage des variables après build (#001)
```

### PR标题
```
Fix #001: Correction du timeout de session
```

### Merge
```
Merge pull request #12 from fix/001-session-timeout
```

## Outils utilisés

- **GitHub Actions** pour les pipelines CI/CD
- **GitHub Issues** pour le suivi des tickets
- **Conventional Commits** pour les messages de commit