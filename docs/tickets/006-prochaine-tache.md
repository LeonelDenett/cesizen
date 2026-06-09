# Ticket #006 — Prochaine tâche : à définir

## Statut : 🟡 **Ouvert**

## Description
Ce ticket est un placeholder pour la prochaine tâche de sécurité à implémenter. Voir le référentiel `docs/features.md` pour la liste complète.

## Tâches candidates (priorisées)

### 🔴 Critique
1. **Rédiger `docs/testing-policy.md`** — ✅ Fait (ticket #005)
2. **Implémenter le pepper** — ✅ Fait (ticket précédent)
3. **Durcir la politique de mots de passe** — ✅ Fait (ticket précédent)
4. **Mettre en place un logger structuré** — ✅ Fait (ticket précédent)

### 🟠 Haute
5. **Augmenter le cost factor bcrypt à 12** — ✅ Fait (ticket précédent)
6. **Intégrer SonarCloud dans la CI** — ✅ Fait (ticket #007)
7. **Stabiliser les tests E2E** — ✅ Fait (ticket #005)
8. **Activer les branch protection rules** sur `main` et `develop`
9. **Créer le DoD** (`docs/definition-of-done.md`)
10. **Anonymiser le seed** avec `faker.js`
11. **Mettre en place le backup automatisé et chiffré**
12. **Ajouter un reverse proxy** (Nginx / Traefik) avec logs
13. **Créer `docs/roles-and-permissions.md`**

### 🟡 Moyenne
14. **Créer l'environnement staging** (`docker-compose.staging.yml`)
15. **Configurer la rotation et persistance des logs Docker**
16. **Chiffrer les colonnes sensibles** en base
17. **Documenter le delete cascade** dans `docs/rgpd.md`
18. **Ajouter ON DELETE CASCADE** sur les clés étrangères
19. **Mettre en place une alerte de brute-force**
20. **Exécuter git-secrets ou truffleHog** en pre-commit

---

*Ticket créé le 2026-06-09 — À compléter par l'utilisateur*
