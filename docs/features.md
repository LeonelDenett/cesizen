# Référentiel de fonctionnalités de sécurité — CESIZen

Ce document recense **l'ensemble des exigences de sécurité** soulevées pour le projet CESIZen. Pour chaque point, on indique :

- **✅ Implémenté** : présent dans le projet actuel.
- **⚠️ Partiellement implémenté** : existe mais incomplet ou perfectible.
- **❌ Non implémenté** : absent du projet.
- **🔧 Recommandé / À ajouter** : action concrète suggérée.

---

## Table des matières

1. [Ségrégation des environnements](#1-ségrégation-des-environnements)
2. [Isolation des données et volumes](#2-isolation-des-données-et-volumes)
3. [Gestion des mots de passe et cryptographie](#3-gestion-des-mots-de-passe-et-cryptographie)
4. [Tests automatisés et qualité du code](#4-tests-automatisés-et-qualité-du-code)
5. [Gestion des logs et journalisation](#5-gestion-des-logs-et-journalisation)
6. [Hardening des dépendances et de l'image Docker](#6-hardening-des-dépendances-et-de-limage-docker)
7. [Architecture et ségrégation des conteneurs](#7-architecture-et-ségrégation-des-conteneurs)
8. [Definition of Done (DoD) — Critères de sécurité](#8-definition-of-done-dod--critères-de-sécurité)
9. [Sécurité du code source](#9-sécurité-du-code-source)
10. [Anonymisation et chiffrement des données](#10-anonymisation-et-chiffrement-des-données)
11. [Backup et restauration](#11-backup-et-restauration)
12. [Suppression des données et RGPD](#12-suppression-des-données-et-rgpd)
13. [Rôles, permissions et credentials](#13-rôles-permissions-et-credentials)
14. [Journalisation réseau et monitoring](#14-journalisation-réseau-et-monitoring)
15. [Récapitulatif global](#15-récapitulatif-global)

---

## 1. Ségrégation des environnements

| Critère | Statut | Détail |
|---------|--------|--------|
| **Environnements distincts** | ✅ | 3 fichiers Docker Compose : `docker-compose.dev.yml` (développement), `docker-compose.test.yml` (recette), `docker-compose.yml` (production). |
| **Environnement `staging` / `preprod`** | ❌ | Aucun environnement intermédiaire entre le développement et la production. |
| **Imperméabilité entre environnements** | ✅ | Chaque environnement possède son propre réseau Docker bridge (`cesizen-dev`, `cesizen-test`, `cesizen-prod`). Aucun pont réseau commun. |
| **Politique de mots de passe distincts par environnement** | ⚠️ | Les mêmes variables d'environnement sont utilisées (`.env`), mais les fichiers sont séparés. Aucune garantie technique qu'un secret de prod ne soit pas réutilisé en test si l'utilisateur copie le même fichier. |
| **🔧 Recommandation** | | Mettre en place un **vault de secrets** (GitHub Secrets, HashiCorp Vault, ou 1Password Secrets Automation) pour injecter des credentials **uniques et rotatifs** par environnement. Créer un fichier `docker-compose.staging.yml` pour simuler la production avec des données anonymisées. |

---

## 2. Isolation des données et volumes

| Critère | Statut | Détail |
|---------|--------|--------|
| **Volumes distincts** | ✅ | `pgdata-prod` (production), `pgdata-test` (test). Le développement utilise un montage de volume local (`./:/app`) sans persistance DB via volume nommé. |
| **Base de données dédiée par environnement** | ✅ | Nom de base différent : `cesizen` (prod), `cesizen_test` (test). Port différent : `127.0.0.1:5477` (prod) vs `127.0.0.1:5478` (test). |
| **Vérification que les données de test ne passent pas à la production** | ✅ | Par construction, les conteneurs et les volumes sont isolés. Le seed de test (`lib/db/seed.ts`) est exécuté uniquement dans l'environnement qui le lance. |
| **🔧 Recommandation** | | Ajouter un **script de vérification pré-déploiement** qui contrôle que le `DATABASE_URL` ne pointe pas vers une base de production lorsque `NODE_ENV=test`. |

---

## 3. Gestion des mots de passe et cryptographie

| Critère | Statut | Détail |
|---------|--------|--------|
| **Framework de stockage des comptes utilisateurs** | ✅ | **NextAuth.js** avec provider `Credentials`. Les comptes sont stockés en base PostgreSQL (table `users`). |
| **Algorithme de hachage** | ✅ | `bcryptjs` avec un **sel aléatoire** généré automatiquement pour chaque utilisateur. |
| **Cost factor (salt rounds)** | ⚠️ | ≥ 10 actuellement. |
| **Politique de complexité des mots de passe** | ❌ | Aucune règle explicite côté client ni côté serveur (hors longueur max 128 caractères). |
| **Sel + poivre (pepper)** | ⚠️ | Le **sel** est géré nativement par bcrypt (unique par utilisateur). Le **poivre** (secret global ajouté au hash) est **absent**. |
| **Stockage du sel / poivre dans une base séparée** | ❌ | Le sel est intégré au hash bcrypt dans la colonne `passwordHash`. Aucune base séparée ni aucun pepper. |
| **🔧 Recommandation** | | 1. **Augmenter le cost factor à 12** (équilibre sécurité / performance).<br>2. **Implémenter un pepper** : variable d'environnement `NEXTAUTH_PEPPER` (32+ caractères) ajoutée au mot de passe avant le hash. Le pepper ne doit **jamais** être stocké en base, uniquement en mémoire.<br>3. **Politique de mots de passe** : min. 12 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 symbole.<br>4. **Stockage du pepper dans un vault externe** : si la base est compromise, l'attaquant doit aussi compromettre le vault pour casser les mots de passe. |

---

## 4. Tests automatisés et qualité du code

| Critère | Statut | Détail |
|---------|--------|--------|
| **Tests unitaires** | ✅ | Jest + ts-jest + fast-check (property-based testing). Couverture des actions, validateurs, helpers. |
| **Tests End-to-End (E2E)** | ⚠️ | Playwright configuré mais tests instables (ticket `#004`). Exécution en CI avec `continue-on-error: true`. |
| **Tests automatisés spécifiques à l'authentification** | ⚠️ | Tests E2E sur le login existent, mais pas de tests de sécurité dédiés (brute-force, injection, session fixation). |
| **SonarQube / SonarCloud** | ❌ | Aucun scanner de qualité / vulnérabilités de code statique (SAST) autre que ESLint. |
| **Politique de tests automatisés formalisée** | ❌ | Aucun document `docs/testing-policy.md`. |
| **🔧 Recommandation** | | 1. **Intégrer SonarCloud** (gratuit pour les projets open-source / académiques) dans la CI.<br>2. **Ajouter des tests de sécurité** :<br>   - Tentative de brute-force sur `/api/auth/callback/credentials`<br>   - Injection SQL sur les champs de recherche<br>   - XSS sur les champs de saisie<br>3. **Rendre les tests E2E bloquants** une fois le ticket `#004` résolu.<br>4. **Rédiger `docs/testing-policy.md`** : couverture minimale (80 %), obligation de tests sur toute route API protégée. |

---

## 5. Gestion des logs et journalisation

| Critère | Statut | Détail |
|---------|--------|--------|
| **Système de logs applicatifs** | ❌ | Aucun logger structuré (Winston, Pino, Log4js). Utilisation de `console.log` basique. |
| **Fichier de logs persistent** | ❌ | Aucun volume ni fichier dédié. Les logs restent dans le conteneur et disparaissent avec `docker compose down`. |
| **Niveaux de logs formalisés** | ❌ | Pas de distinction ERROR / WARN / INFO / DEBUG structurée. |
| **Journalisation des connexions utilisateurs** | ❌ | Aucune table `audit_logs` ni `login_attempts`. On ne sait pas qui s'est connecté, depuis quelle IP, avec succès ou échec. |
| **Logs d'erreurs critiques vs légers** | ❌ | Pas de classification. |
| **🔧 Recommandation** | | 1. **Implémenter un logger structuré** (ex: Pino) avec sortie JSON.<br>2. **Créer une table `audit_logs`** :<br>   - `user_id`, `action` (LOGIN, LOGOUT, FAILED_LOGIN, DELETE_ACCOUNT), `ip_address`, `user_agent`, `timestamp`, `success` (boolean).<br>3. **Configurer un driver de logs Docker** (`json-file` avec `max-size` et `max-file`) ou forwarder vers **Grafana Loki / ELK**.<br>4. **Alertes** : plus de 5 `FAILED_LOGIN` en 5 minutes → alerte admin. |

---

## 6. Hardening des dépendances et de l'image Docker

| Critère | Statut | Détail |
|---------|--------|--------|
| **Suppression des librairies inutiles** | ⚠️ | Dockerfile multi-étapes utilisé, mais `node_modules` complet est copié dans le runner. Les `devDependencies` (TypeScript, ESLint, etc.) sont potentiellement présentes dans l'image finale car `npm ci` n'est pas suivi de `npm prune --production`. |
| **Séparation dev / prod dans les dépendances** | ⚠️ | `drizzle-kit` et `tsx` sont techniquement des devDependencies mais sont nécessaires au runtime pour les migrations et le seed dans l'entrypoint. Ce cas n'est pas documenté. |
| **Scan des dépendances vulnérables** | ✅ | `npm audit` et Trivy dans la CI. |
| **🔧 Recommandation** | | 1. **Documenter pourquoi** certaines devDependencies restent dans l'image (migrations).<br>2. **Minimiser** les devDependencies en migrant les scripts de migration vers un **Job Kubernetes / conteneur d'init** séparé.<br>3. **Activer Dependabot** (✅ déjà fait via `.github/dependabot.yml`). |

---

## 7. Architecture et ségrégation des conteneurs

| Critère | Statut | Détail |
|---------|--------|--------|
| **Un conteneur par rôle (web / BDD / back)** | ⚠️ | Architecture monolithique **fullstack** : le conteneur `app` embarque à la fois le frontend React, le backend API routes et la logique métier. Seule la BDD est séparée. |
| **Ségrégation stricte** | ❌ | Pas de conteneur dédié pour l'admin, le frontend statique ou les workers. |
| **🔧 Recommandation** | | Pour un projet CESI, la monolithie est acceptable. En production à grande échelle, on recommanderait :<br>- **Conteneur `web`** : frontend Next.js (SSG / SSR)<br>- **Conteneur `api`** : API routes uniquement<br>- **Conteneur `worker`** : tâches asynchrones (emails, cron RGPD)<br>- **Conteneur `db`** : PostgreSQL (déjà fait) |

---

## 8. Definition of Done (DoD) — Critères de sécurité

| Critère | Statut | Détail |
|---------|--------|--------|
| **DoD formalisé avec critères de sécurité** | ❌ | Aucun document `docs/definition-of-done.md`. |
| **🔧 Recommandation** | | Créer un DoD incluant obligatoirement :<br>1. **Tests de sécurité passés** : auth, injection SQL, XSS, CSRF.<br>2. **Scan de vulnérabilités** : `npm audit` et Trivy sans faille *High* ou *Critical* non justifiée.<br>3. **Pas de secrets dans le code** : vérifié par `git-secrets` ou `truffleHog`.<br>4. **Review de code** : au moins 1 approbation obligatoire avant merge.<br>5. **Documentation** : mise à jour du `docs/rapport.md` si une mesure de sécurité change.<br>6. **Vérification RGPD** : si nouvelle donnée collectée, mise à jour du registre. |

---

## 9. Sécurité du code source

| Critère | Statut | Détail |
|---------|--------|--------|
| **Dépôt privé** | ✅ | GitHub (non public par défaut pour un repo académique). |
| **Protection des branches** | ⚠️ | Non explicitement activée dans le rapport. La CI tourne sur PR, mais rien n'interdit de pousser directement sur `main`. |
| **Audit du code source** | ❌ | Pas d'outil d'analyse statique du code (SAST) comme SonarQube, Snyk Code ou CodeQL. |
| **🔧 Recommandation** | | 1. **Activer les branch protection rules** sur `main` et `develop` :<br>   - Require a pull request before merging<br>   - Require status checks to pass (CI)<br>   - Require code owner review<br>2. **Intégrer GitHub CodeQL** (gratuit) pour détecter les vulnérabilités dans le TypeScript. |

---

## 10. Anonymisation et chiffrement des données

| Critère | Statut | Détail |
|---------|--------|--------|
| **Pseudonymisation** | ✅ | Identifiants techniques (`uuid`) séparés des données métier (nom, email). |
| **Anonymisation pure** | ❌ | Aucun mécanisme pour anonymiser les données de test / staging (ex: remplacer les vrais emails par `user{n}@example.com`). |
| **Chiffrement des données en base** | ❌ | Les emails et autres données sensibles sont stockés **en clair** dans PostgreSQL. Seuls les mots de passe sont hashés. |
| **🔧 Recommandation** | | 1. **Anonymiser les seeds** : le script `seed.ts` doit utiliser des données fictives (faker.js).<br>2. **Chiffrement des colonnes sensibles** : utiliser **pgcrypto** (PostgreSQL) ou chiffrement applicatif (AES-256-GCM) pour les emails et les données de santé (émotions, logs de respiration).<br>3. **Clés de chiffrement** : stockées dans un vault, jamais en dur. |

---

## 11. Backup et restauration

| Critère | Statut | Détail |
|---------|--------|--------|
| **Backup automatisé des données** | ❌ | Aucun script de sauvegarde (`pg_dump`) ni politique de rétention. |
| **Protection des backups** | ❌ | Aucun chiffrement ni stockage hors site. |
| **Test de restauration** | ❌ | Jamais testé. |
| **🔧 Recommandation** | | 1. **Cron quotidien** `pg_dump -Fc` dans un conteneur `backup` dédié.<br>2. **Chiffrement** des dumps avec **GPG** ou **age** avant envoi.<br>3. **Stockage** : S3 Glacier, Backblaze B2, ou serveur SFTP externe.<br>4. **Test mensuel** de restauration sur un environnement isolé. |

---

## 12. Suppression des données et RGPD

| Critère | Statut | Détail |
|---------|--------|--------|
| **Droit à l'effacement** | ✅ | Endpoint `/api/account` (DELETE) supprimant le compte et les données associées. |
| **Delete cascade** | ⚠️ | Le code appelle explicitement les suppressions (émotions, favoris, logs), mais il n'est pas documenté si la base utilise `ON DELETE CASCADE` au niveau des contraintes. |
| **Justification du delete cascade** | ❌ | Non documentée. |
| **🔧 Recommandation** | | 1. **Documenter dans `docs/rgpd.md`** que le delete cascade est une exigence légale (RGPD — droit à l'effacement) et qu'il garantit l'intégrité référentielle.<br>2. **Ajouter `ON DELETE CASCADE`** sur les clés étrangères en base (Drizzle schema) pour éviter les orphelins.<br>3. **Archivage avant suppression** : conserver une trace anonymisée pendant 30 jours avant destruction définitive (preuve légale). |

---

## 13. Rôles, permissions et credentials

| Critère | Statut | Détail |
|---------|--------|--------|
| **Rôles définis** | ✅ | `utilisateur` (user) et `administrateur` (admin). |
| **Documentation des rôles et permissions** | ❌ | Aucune matrice de droits, aucun document listant les endpoints accessibles par rôle. |
| **Credentials des rôles** | ❌ | Pas de liste des privilèges (CRUD) par ressource. |
| **🔧 Recommandation** | | Créer `docs/roles-and-permissions.md` avec :<br>- Matrice des droits (lecture / écriture / suppression) par entité (articles, utilisateurs, émotions).<br>- Liste des endpoints API protégés par rôle.<br>- Procédure de promotion / rétrogradation d'un utilisateur au rôle admin. |

---

## 14. Journalisation réseau et monitoring

| Critère | Statut | Détail |
|---------|--------|--------|
| **Reverse proxy (Nginx / Traefik)** | ❌ | Aucun conteneur Nginx, Apache ni Traefik dans le projet. L'application est directement exposée (via `127.0.0.1`) ou en mode développement. |
| **Logs d'accès réseau** | ❌ | Absents. On ne peut pas tracer les requêtes HTTP entrantes, les IPs sources, les codes de retour. |
| **Monitoring administrateur** | ❌ | Pas de tableau de bord (Grafana, Prometheus) ni d'alertes. |
| **🔧 Recommandation** | | 1. **Ajouter un conteneur Nginx** ou **Traefik** en frontal :<br>   - Terminaison TLS (Let's Encrypt)<br>   - Logs d'accès formatés JSON<br>   - Rate limiting<br>2. **Centraliser les logs** : stack **Grafana + Loki + Prometheus** ou **ELK**.<br>3. **Alertes** : erreur 5xx > 1 %, temps de réponse > 500 ms, tentative de connexion échouée > 5 / min. |

---

## 15. Récapitulatif global

| Thème | Implémenté | Manquant / À ajouter |
|-------|------------|----------------------|
| Ségrégation des environnements | ✅ Réseaux isolés, 3 compose | ❌ Staging, vault de secrets |
| Isolation des données | ✅ Bases, volumes, ports distincts | 🔧 Script de vérification pré-déploiement |
| Cryptographie mots de passe | ✅ bcrypt + sel aléatoire | ❌ Pepper, politique de complexité, cost 12+ |
| Tests automatisés | ✅ Jest, Playwright | ❌ SonarQube, tests sécurité, DoD |
| Gestion des logs | ❌ Aucun | 🔧 Logger structuré, table `audit_logs`, alertes |
| Hardening dépendances | ⚠️ Multi-étapes mais node_modules complet | 🔧 `npm prune`, justification documentée |
| Architecture conteneurs | ⚠️ Monolithique acceptable | 🔧 Séparation web/api si scalabilité |
| Sécurité du code source | ⚠️ CI présente | ❌ Branch protection, CodeQL, SAST |
| Anonymisation / chiffrement | ⚠️ Pseudonymisation | ❌ Chiffrement colonnes sensibles, anonymisation seed |
| Backup | ❌ Aucun | 🔧 `pg_dump` chiffré + stockage externe |
| Suppression RGPD | ✅ Endpoint DELETE | ❌ Justification cascade documentée |
| Rôles et permissions | ✅ 2 rôles | ❌ Matrice de droits documentée |
| Monitoring réseau | ❌ Aucun proxy | 🔧 Nginx/Traefik + Grafana + alertes |

---

## Prochaines actions prioritaires (roadmap sécurité)

1. **🔴 Critique** : Mettre en place un **logger d'audit** (`audit_logs`) pour tracer les connexions et les actions sensibles.
2. **🔴 Critique** : Ajouter un **pepper** au hachage des mots de passe et durcir la politique de mots de passe.
3. **🟠 Haute** : Configurer **Nginx** en reverse proxy avec logs et rate limiting.
4. **🟠 Haute** : Intégrer **SonarCloud** ou **CodeQL** dans la CI.
5. **🟡 Moyenne** : Créer les documents manquants (`DoD.md`, `roles-and-permissions.md`, `testing-policy.md`).
6. **🟡 Moyenne** : Mettre en place un **backup automatisé et chiffré** de la base de données.
7. **🟢 Basse** : Créer un environnement **staging** avec données anonymisées.

---

> 📅 *Document généré le 2026-06-08 — À mettre à jour à chaque évolution du projet.*
