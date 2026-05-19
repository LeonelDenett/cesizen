# Ticket #001 - Bug d'authentification

## Informations

| Champ | Valeur |
|-------|--------|
| **Titre** | La session expire trop rapidement |
| **Type** | Bug |
| **Priorité** | Haute |
| **Statut** | Résolu |
| **Créé le** | 2026-04-15 |
| **Résolu le** | 2026-04-20 |

## Description

Les utilisateurs sont déconnectés après quelques minutes d'inactivité alors que la durée de session devrait être de 24h.

## Reproduction

1. Se connecter avec un utilisateur valide
2. Attendre 5 minutes sans activité
3. Rafraîchir la page
4. L'utilisateur est déconnecté

## Cause identifiée

La variable `NEXTAUTH_SECRET` n'était pas correctement injectée dans l'environnement de production, ce qui causait une regeneration du token à chaque requête.

## Solution appliquée

- Ajout de la variable `NEXTAUTH_SECRET` dans le fichier `.env.local`
- Modification du `docker-compose.yml` pour utiliser les variables d'environnement externes
- Nettoyage des variables sensibles dans le Dockerfile

## Branche

`fix/001-session-timeout`

## Commit

`fix: correction du timeout de session (#001)`

## Validation

- Tests unitaires ✓
- Tests E2E ✓
- Vérification manuelle ✓