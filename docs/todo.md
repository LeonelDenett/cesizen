# Liste des actions à réaliser — Sécurité CESIZen

Document actionnable dérivé du référentiel `docs/features.md`. Chaque tâche est priorisée et accompagnée d'un livrable concret.

---

## Légende

- 🔴 **Critique** : risque immédiat pour la sécurité ou la conformité RGPD.
- 🟠 **Haute** : renforce significativement la posture de sécurité.
- 🟡 **Moyenne** : amélioration du processus ou de la documentation.
- 🟢 **Basse** : nice-to-have ou préparation à l'échelle.

---

## 1. Ségrégation des environnements

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟠 | Créer un fichier `docker-compose.staging.yml` (préproduction avec données anonymisées). | Fichier YAML + `.env.staging.example` |
| 🟠 | Mettre en place un **vault de secrets** (GitHub Secrets ou HashiCorp Vault) pour injecter des credentials uniques par environnement. | Variables dans GitHub Secrets ou vault local |
| 🟡 | Écrire un script de vérification pré-déploiement qui bloque si `DATABASE_URL` pointe vers la production en mode test. | `scripts/check-env-safety.sh` |

---

## 2. Isolation des données et volumes

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟡 | Documenter dans `docs/deployment-plan.md` que les volumes et les bases sont strictement séparés par réseau Docker. | Paragraphe ajouté au plan |

---

## 3. Cryptographie et mots de passe

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🔴 | **Implémenter un pepper** : ajouter `NEXTAUTH_PEPPER` (32+ caractères aléatoires) dans `.env`, concaténer au mot de passe avant le hash bcrypt. | Variable d'env + modification `lib/auth.ts` |
| 🔴 | **Durcir la politique de mots de passe** : min. 12 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 symbole, vérification côté serveur dans `authorize`. | Regex + tests dans `lib/auth.ts` |
| 🟠 | **Augmenter le cost factor bcrypt à 12** et mesurer l'impact sur le temps de connexion. | Constante modifiée + test de performance |
| 🟠 | **Stocker le pepper dans un vault externe** (pas dans le code source ni dans le même fichier `.env` que la base de production). | Configuration vault documentée |

---

## 4. Tests automatisés et qualité du code

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🔴 | **Rédiger `docs/testing-policy.md`** : couverture minimale (80 %), obligation de tests sur les routes API protégées, liste des scénarios de sécurité à tester. | ✅ Fait — `feature/testing-policy` |
| 🟠 | **Intégrer SonarCloud** dans la CI (scan SAST à chaque push). | Étape ajoutée à `.github/workflows/ci.yml` |
| 🟠 | **Ajouter des tests de sécurité dédiés** :<br>- Tentative de brute-force sur le login<br>- Injection SQL sur les champs de recherche<br>- XSS sur les champs de saisie libre | Fichiers de test Jest / Playwright |
| 🟠 | **Stabiliser les tests E2E** (ticket `#004`) puis retirer `continue-on-error: true` pour les rendre bloquants. | ✅ Fait — `feature/testing-policy` (mots de passe mis à jour, `continue-on-error` retiré, `tracker.spec.ts` supprimé) |
| 🟡 | **Intégrer GitHub CodeQL** (analyse statique de vulnérabilités TypeScript). | Workflow `.github/workflows/codeql.yml` |

---

## 5. Gestion des logs et journalisation

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🔴 | **Implémenter un logger structuré** (ex: Pino) avec sortie JSON et niveaux (ERROR, WARN, INFO, DEBUG). | `lib/logger.ts` + remplacement des `console.log` |
| 🔴 | **Créer la table `audit_logs`** en base de données :<br>`user_id`, `action`, `ip_address`, `user_agent`, `timestamp`, `success` (boolean). | Migration Drizzle `lib/db/migrations/XXXX_audit_logs.sql` |
| 🔴 | **Journaliser les connexions utilisateurs** : succès, échecs, déconnexions. | Appel au logger dans `lib/auth.ts` et dans les API routes d'auth |
| 🟠 | **Configurer la rotation et la persistance des logs Docker** (`json-file` avec `max-size`, `max-file`) ou forwarder vers **Grafana Loki / ELK**. | Configuration `docker-compose.yml` + documentation |
| 🟠 | **Mettre en place une alerte** : plus de 5 `FAILED_LOGIN` en 5 minutes → envoi d'un email à l'admin. | Script ou règle dans l'outil de monitoring choisi |

---

## 6. Hardening des dépendances et de l'image Docker

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟡 | **Documenter dans `docs/rapport.md`** pourquoi `drizzle-kit` et `tsx` restent dans l'image finale (nécessaires aux migrations via l'entrypoint). | Paragraphe ajouté |
| 🟡 | **Minimiser les devDependencies** en migrant les migrations vers un **conteneur d'init** séparé (si possible) ou utiliser `npm prune --production` après le build. | Optimisation du `Dockerfile` |

---

## 7. Architecture et ségrégation des conteneurs

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟢 | **Documenter l'architecture actuelle** : la monolithie fullstack est acceptable pour le projet CESI, mais prévoir une séparation future (web / api / worker). | Paragraphe dans `docs/adr/002-architecture-future.md` |

---

## 8. Definition of Done (DoD) — Critères de sécurité

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟠 | **Créer `docs/definition-of-done.md`** avec checklist obligatoire avant merge :<br>1. Tests de sécurité passés<br>2. Scan vulnérabilités sans faille High/Critical non justifiée<br>3. Pas de secrets dans le code (`git-secrets` ou `truffleHog`)<br>4. Review de code obligatoire<br>5. Mise à jour du rapport si mesure de sécurité modifiée<br>6. Vérification RGPD si nouvelle donnée collectée | Fichier markdown |

---

## 9. Sécurité du code source

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟠 | **Activer les branch protection rules** sur `main` et `develop` dans GitHub :<br>- Require a pull request before merging<br>- Require status checks to pass<br>- Require code owner review | Capture d'écran des réglages GitHub |
| 🟡 | **Exécuter `git-secrets` ou `truffleHog` en pre-commit** pour empêcher tout push de secret. | Hook `.git/hooks/pre-commit` ou GitHub Action |

---

## 10. Anonymisation et chiffrement des données

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟠 | **Anonymiser le seed** : utiliser `faker.js` pour générer des données fictives (pas de vrais noms/emails dans les seeds). | Modification `lib/db/seed.ts` |
| 🟠 | **Chiffrer les colonnes sensibles** (emails, données de santé) avec **pgcrypto** ou chiffrement applicatif AES-256-GCM. | Migration Drizzle + clé dans le vault |
| 🟡 | **Documenter le schéma de pseudonymisation** : explication des `uuid` et de la séparation identifiants techniques / données métier. | Paragraphe dans `docs/rgpd.md` |

---

## 11. Backup et restauration

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟠 | **Créer un conteneur `backup` avec cron quotidien** exécutant `pg_dump -Fc` + compression. | `docker-compose.yml` (service `backup`) + `scripts/backup.sh` |
| 🟠 | **Chiffrer les dumps** avec GPG ou `age` avant stockage. | Script modifié avec chiffrement |
| 🟡 | **Stocker les backups hors site** (S3 Glacier, Backblaze B2, serveur SFTP externe). | Configuration + documentation |
| 🟡 | **Tester mensuellement la restauration** sur un environnement isolé. | Procédure dans `docs/maintenance.md` |

---

## 12. Suppression des données et RGPD

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟠 | **Documenter dans `docs/rgpd.md`** la justification du **delete cascade** (exigence légale RGPD + intégrité référentielle). | Paragraphe ajouté |
| 🟡 | **Ajouter `ON DELETE CASCADE`** sur les clés étrangères du schema Drizzle pour éviter les orphelins. | Modification `lib/db/schema.ts` + migration |
| 🟡 | **Mettre en place un archivage de 30 jours** avant destruction définitive (preuve légale). | Table `deleted_accounts_archive` ou logique applicative |

---

## 13. Rôles, permissions et credentials

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟠 | **Créer `docs/roles-and-permissions.md`** avec :<br>- Matrice des droits (lecture / écriture / suppression) par entité<br>- Liste des endpoints API protégés par rôle<br>- Procédure de promotion / rétrogradation admin | Fichier markdown |

---

## 14. Journalisation réseau et monitoring

| Priorité | Action | Livrable |
|----------|--------|----------|
| 🟠 | **Ajouter un conteneur Nginx ou Traefik** en frontal :<br>- Terminaison TLS (Let's Encrypt)<br>- Logs d'accès formatés JSON<br>- Rate limiting | `docker-compose.yml` + `nginx.conf` / `traefik.yml` |
| 🟠 | **Centraliser les logs** : stack Grafana + Loki + Prometheus ou ELK. | `docker-compose.monitoring.yml` + documentation |
| 🟡 | **Configurer des alertes** :<br>- Erreurs 5xx > 1 %<br>- Temps de réponse > 500 ms<br>- Connexions échouées > 5 / min | Règles d'alerte dans l'outil de monitoring |

---

## 15. Récapitulatif par priorité

### 🔴 Critique (à faire en premier)
1. Implémenter le **pepper** dans le hachage des mots de passe.
2. Durcir la **politique de mots de passe** (12 caractères, complexité).
3. Mettre en place un **logger structuré** (Pino) et remplacer les `console.log`.
4. Créer la table **`audit_logs`** et journaliser les connexions.
5. Rédiger **`docs/testing-policy.md`** avec tests de sécurité obligatoires.

### 🟠 Haute (à faire dans la semaine suivante)
6. Augmenter le **cost factor bcrypt à 12**.
7. Intégrer **SonarCloud** et/ou **GitHub CodeQL** dans la CI.
8. Stabiliser les **tests E2E** et les rendre bloquants.
9. Activer les **branch protection rules** sur `main` et `develop`.
10. Créer le **DoD** (`docs/definition-of-done.md`).
11. Anonymiser le **seed** avec `faker.js`.
12. Mettre en place le **backup automatisé et chiffré**.
13. Ajouter un **reverse proxy** (Nginx / Traefik) avec logs.
14. Créer **`docs/roles-and-permissions.md`**.

### 🟡 Moyenne (à faire dans le mois)
15. Créer l'environnement **staging** (`docker-compose.staging.yml`).
16. Configurer la **rotation et persistance des logs Docker**.
17. Chiffrer les **colonnes sensibles** en base.
18. Documenter le **delete cascade** dans `docs/rgpd.md`.
19. Ajouter `ON DELETE CASCADE` sur les clés étrangères.
20. Mettre en place une **alerte de brute-force**.
21. Exécuter `git-secrets` ou `truffleHog` en pre-commit.

### 🟢 Basse (nice-to-have)
22. Migrer les migrations vers un **conteneur d'init** séparé.
23. Documenter l'architecture future (web / api / worker).
24. Tester mensuellement la **restauration des backups**.
25. Mettre en place un **archivage de 30 jours** avant suppression définitive.

---

> 📅 *Document généré le 2026-06-08 — À trier et intégrer dans un outil de gestion de tâches (GitHub Projects, Jira, Trello).*
