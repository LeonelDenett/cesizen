# CESIZen — Dossier complet du projet

> Document de référence pour la soutenance orale (20 min) et le dossier écrit (15-20 pages).
> Conçu également comme prompt pour Gemini afin de générer une présentation avec slides.
> Projet individuel — Activité 2 : Développer et tester les applications informatiques.

---

## I. Introduction et contexte

### Le projet
CESIZen est une application web de **santé mentale et gestion du stress**, développée dans le cadre du titre **Concepteur Développeur d'Applications (CDA)** au CESI. Le projet simule une commande du **Ministère de la Santé et de la Prévention** à destination du grand public français.

### L'enjeu
Le stress chronique touche des millions de personnes. CESIZen propose une plateforme accessible pour **comprendre ses émotions, pratiquer des exercices de respiration, consulter des ressources santé** et suivre son bien-être au quotidien.

### Les 3 acteurs du système
| Acteur | Accès | Fonctionnalités |
|--------|-------|-----------------|
| Visiteur anonyme | Front-Office | Consulter les articles, lancer les exercices de respiration, voir les informations santé |
| Utilisateur connecté | Front-Office | Tracker d'émotions, défis de respiration, favoris, profil, réinitialisation mot de passe |
| Administrateur | Back-Office | Gestion des utilisateurs, articles (CRUD), exercices de respiration, suivi anonymisé de l'activité |

### Modules développés
- **Comptes utilisateurs** (obligatoire) — inscription, connexion, profil, rôles, réinitialisation MDP
- **Informations** (obligatoire) — CMS d'articles santé, menu dynamique, favoris
- **Exercices de respiration** (au choix) — cohérence cardiaque configurable, animation interactive
- **Tracker d'émotions** (au choix, bonus) — journal de bord à 2 niveaux d'émotions
- **Défis de respiration** (bonus) — objectifs personnalisés avec suivi de progression

> Le cahier des charges demandait 2 modules obligatoires + 1 au choix. Ce projet en implémente 2 obligatoires + 2 au choix + 1 bonus.

---

## II. Comparatif des solutions techniques (3 architectures)

Le cahier des charges exige un comparatif de minimum 3 architectures logicielles avec critères explicités.

### Architecture 1 : PHP/Laravel + MySQL + Blade
| Critère | Évaluation |
|---------|-----------|
| Performance | Moyenne — rendu serveur classique, pas de SSR optimisé |
| Type-safety | Faible — PHP est dynamiquement typé, erreurs détectées à l'exécution |
| Écosystème | Mature — large communauté, beaucoup de packages |
| Migrations DB | Bonnes — Eloquent ORM avec migrations intégrées |
| Mobile First | Moyen — nécessite un framework CSS séparé |
| Courbe d'apprentissage | Faible — bien documenté, beaucoup de tutoriels |
| Déploiement | Simple — hébergement PHP classique |

### Architecture 2 : React SPA + Express.js + MongoDB
| Critère | Évaluation |
|---------|-----------|
| Performance | Bonne côté client — mais SEO limité sans SSR |
| Type-safety | Moyenne — TypeScript possible mais pas natif |
| Écosystème | Très large — npm, React, Express |
| Migrations DB | Faible — MongoDB est schemaless, pas de migrations formelles |
| Mobile First | Bon — React + Tailwind |
| Courbe d'apprentissage | Moyenne — 2 projets séparés (front + back) à maintenir |
| Déploiement | Complexe — 2 serveurs distincts, CORS à gérer |

### Architecture 3 : Next.js + PostgreSQL + Drizzle ORM (solution retenue ✅)
| Critère | Évaluation |
|---------|-----------|
| Performance | Excellente — SSR, Server Components, streaming, optimisation automatique des images |
| Type-safety | Excellente — TypeScript de bout en bout, schéma DB typé, requêtes type-safe |
| Écosystème | Très large — React, npm, Vercel, communauté Next.js en forte croissance |
| Migrations DB | Excellentes — schéma as code, migrations auto-générées, snapshots versionnés |
| Mobile First | Excellent — Tailwind CSS v4 natif, responsive utilities |
| Courbe d'apprentissage | Moyenne — un seul projet fullstack, mais concepts avancés (App Router, Server Components) |
| Déploiement | Simple — Docker standalone, ou Vercel en 1 clic |

### Justification du choix
Next.js 16 avec Drizzle ORM a été retenu car :
1. **Fullstack en un seul projet** : pas de séparation front/back, pas de CORS, pas de duplication de types
2. **Type-safety complète** : une erreur dans le nom d'une colonne DB est détectée à la compilation, pas en production
3. **MVC naturel** : l'architecture App Router implémente le pattern MVC sans configuration supplémentaire
4. **Performance native** : Server Components réduisent le JavaScript envoyé au client de 30-50%
5. **Migrations versionnées** : le schéma DB évolue avec le code, traçabilité complète via Git

---

## III. Architecture MVC avec Next.js

Le cahier des charges exige le respect du Design Pattern MVC.

### Comment Next.js implémente le MVC

```
┌──────────────────────────────────────────────────────────────┐
│                        MODEL (Modèle)                        │
│                                                              │
│  lib/db/schema/*.ts    → Définition des tables (Drizzle)     │
│  lib/db/index.ts       → Connexion PostgreSQL (Pool pg)      │
│  lib/validators/*.ts   → Schémas de validation (Zod)         │
│  drizzle/              → Migrations SQL versionnées           │
│                                                              │
│  Rôle : structure des données et leurs modes d'accès         │
├──────────────────────────────────────────────────────────────┤
│                        VIEW (Vue)                            │
│                                                              │
│  app/(public)/**       → Pages publiques (Server Components) │
│  app/(admin)/**        → Pages admin (Client Components)     │
│  components/**         → Composants réutilisables (React)    │
│  app/globals.css       → Styles globaux (Tailwind CSS)       │
│                                                              │
│  Rôle : présentation de l'application, son interface         │
├──────────────────────────────────────────────────────────────┤
│                     CONTROLLER (Contrôleur)                  │
│                                                              │
│  app/api/**            → API Routes REST (GET/POST/PUT/DEL)  │
│  lib/actions/*.ts      → Server Actions (formulaires)        │
│  middleware.ts         → Middleware (auth, sécurité, routing) │
│  lib/auth.ts           → Logique d'authentification          │
│                                                              │
│  Rôle : logique métier de l'application                      │
└──────────────────────────────────────────────────────────────┘
```

### Flux de données concret

**Formulaire d'inscription (Server Action)** :
```
RegisterForm.tsx (View) → registerUser() (Controller) → Zod validation → bcrypt hash → db.insert(users) (Model) → PostgreSQL
```

**Chargement des articles (API Route)** :
```
ArticlesPage.tsx (View) → fetch('/api/info-pages') → GET handler (Controller) → db.select().from(infoPages) (Model) → JSON response
```

**Exercice de respiration (Client-side + API)** :
```
BreathingExercise.tsx (View) → onComplete callback → fetch('/api/breathing-logs') POST (Controller) → db.insert(breathingLogs) (Model)
```

### Séparation Front-Office / Back-Office

Next.js App Router utilise les **Route Groups** pour séparer les vues sans affecter les URLs :

```
app/
├── (public)/          → Front-Office (visiteurs + utilisateurs)
│   ├── layout.tsx     → Header + Footer + main
│   ├── page.tsx       → Accueil
│   ├── respiration/   → Exercices
│   ├── articles/      → Articles santé
│   └── login/         → Connexion
├── (admin)/           → Back-Office (administrateurs uniquement)
│   └── admin/
│       ├── layout.tsx → Header admin + Sidebar + protection rôle
│       ├── users/     → Gestion utilisateurs
│       ├── info-pages/→ Gestion articles
│       └── respiration/→ Gestion exercices + suivi
└── api/               → API Routes (Controller)
```

Chaque layout applique sa propre logique de protection :
- `(public)/layout.tsx` : Header public, Footer, accessible à tous
- `(admin)/admin/layout.tsx` : vérifie `getCurrentUser()` + `role === 'administrateur'`, redirige sinon

---

## IV. Base de données — MLD (12 tables, 4 migrations)

### Modèle Logique de Données

| Table | Colonnes clés | Relations |
|-------|--------------|-----------|
| `users` | id (UUID PK), name, email (UNIQUE), password_hash, role (ENUM: utilisateur/administrateur), is_active, timestamps | — |
| `sessions` | id (UUID PK), user_id (FK→users CASCADE), expires_at | N:1 → users |
| `password_reset_tokens` | id (UUID PK), user_id (FK→users CASCADE), token, expires_at, used | N:1 → users |
| `info_pages` | id (UUID PK), title, slug (UNIQUE), content (TEXT), category (ENUM), image_url, status (ENUM: published/draft), timestamps | — |
| `menu_items` | id (UUID PK), label, page_id (FK→info_pages), display_order | N:1 → info_pages |
| `favorites` | id (UUID PK), user_id (FK→users CASCADE), page_id (FK→info_pages CASCADE) | N:1 → users, N:1 → info_pages |
| `emotions_level1` | id (UUID PK), name (UNIQUE), display_order | — |
| `emotions_level2` | id (UUID PK), emotion_level1_id (FK→emotions_level1), name, display_order | N:1 → emotions_level1 |
| `emotion_logs` | id (UUID PK), user_id (FK→users CASCADE), emotion_level1_id (FK), emotion_level2_id (FK), log_date, note | N:1 → users, N:1 → emotions |
| `breathing_exercises` | id (UUID PK), code (UNIQUE), name, description, inspire, hold, expire, category (ENUM: basic/advanced), benefit, color, is_active, display_order, timestamps | — |
| `breathing_challenges` | id (UUID PK), user_id (FK→users CASCADE), exercise_id, exercise_name, times_per_day, days_per_week, cycles_per_session, is_active, timestamps | N:1 → users |
| `breathing_logs` | id (UUID PK), user_id (FK→users CASCADE), challenge_id (FK→breathing_challenges SET NULL), exercise_id, cycles, duration_seconds, completed_at | N:1 → users, N:1 → challenges |

### Système de migrations Drizzle

```
drizzle/
├── 0000_narrow_cannonball.sql   → Tables initiales (users, sessions, emotions, info_pages, menu_items)
├── 0001_ambitious_gamora.sql    → Table favorites
├── 0002_polite_preak.sql        → Tables breathing_challenges + breathing_logs
├── 0003_freezing_shiva.sql      → Table breathing_exercises (exercices administrables)
└── meta/                        → Snapshots JSON pour le diff automatique
```

**Workflow** : modifier le schéma TypeScript → `npm run db:generate` (Drizzle compare et génère le SQL) → `npm run db:migrate` (applique sur PostgreSQL). Le schéma et la DB sont toujours synchronisés.

---

## V. Fonctionnalités détaillées

### Module Comptes Utilisateurs (obligatoire)
- Inscription avec validation Zod (email unique, mot de passe : 8+ chars, majuscule, minuscule, chiffre)
- Connexion via NextAuth.js avec JWT signé (expiration 24h)
- Profil utilisateur modifiable (nom, email)
- Réinitialisation de mot de passe par token UUID (expiration 1h, usage unique)
- Rôles : `utilisateur` / `administrateur` (enum PostgreSQL)
- Admin : créer, activer/désactiver (supprime les sessions), supprimer des comptes
- Protection : un admin ne peut pas supprimer son propre compte

### Module Informations (obligatoire)
- 13 articles santé en 5 catégories : alimentation, sport, méditation, stress, général
- Chaque article : image Unsplash, contenu Markdown, statut publié/brouillon
- Menu dynamique configurable par l'admin (label, page liée, ordre)
- Système de favoris (toggle) pour les utilisateurs connectés
- Filtrage par catégorie côté client
- Admin : CRUD complet en cards avec image, statut collapsible

### Module Exercices de Respiration (au choix)
- 6 exercices : 3 de base (7-4-8, 5-5, 4-6) + 3 avancés (4-7-8, 3-6-3, 5-5-10)
- Conformes au cahier des charges : inspiration, apnée, expiration configurables
- Animation visuelle : cercle qui s'agrandit (inspire), maintient (hold), rétrécit (expire)
- Compteur de cycles configurable (3, 6 ou 10)
- Exercices stockés en DB, administrables depuis le back-office (CRUD complet)
- L'admin peut créer de nouveaux exercices sans toucher au code

### Module Tracker d'Émotions (au choix, bonus)
- Référentiel conforme au cahier des charges : 6 émotions de base × 6 détaillées = 36 émotions
- Journal de bord avec date et note optionnelle
- 30 jours de données de démo pour l'utilisateur test

### Fonctionnalité bonus : Défis de Respiration
- L'utilisateur crée un défi : quel exercice, combien de fois/jour, combien de jours/semaine, combien de cycles
- Barres de progression quotidienne et hebdomadaire en temps réel
- Sessions complétées automatiquement enregistrées via l'API
- Bouton "Go" pour lancer l'exercice directement depuis le défi
- Suivi anonymisé côté admin (Utilisateur 1, Utilisateur 2...)

---

## VI. Sécurité et protection des données

Le cahier des charges exige l'identification des vulnérabilités, une matrice de risques, le chiffrement HTTPS, la protection des données personnelles et un protocole de notification d'incidents.

### Matrice des vulnérabilités et contre-mesures

| Vulnérabilité | Criticité | Contre-mesure implémentée | Fichier |
|--------------|-----------|--------------------------|---------|
| Injection SQL | Critique | Drizzle ORM — requêtes paramétrées (prepared statements), jamais de concaténation de chaînes | `lib/db/schema/*.ts`, toutes les API routes |
| XSS (Cross-Site Scripting) | Critique | Sanitization serveur (`sanitize()` strip HTML), React échappe le JSX, CSP header restreint les scripts | `lib/utils.ts`, `proxy.ts` |
| Brute-force login | Élevée | Rate limiting : max 10 tentatives/IP/15 min, réponse 429 | `proxy.ts` (middleware) |
| CSRF | Élevée | NextAuth gère les tokens CSRF automatiquement pour login/logout | `next-auth` intégré |
| Clickjacking | Moyenne | Header `X-Frame-Options: DENY` sur toutes les réponses | `proxy.ts` |
| MIME sniffing | Moyenne | Header `X-Content-Type-Options: nosniff` | `proxy.ts` |
| Man-in-the-middle | Critique | HSTS (`Strict-Transport-Security: max-age=31536000`), SSL `verify-full` sur la DB | `proxy.ts`, `.env.local` |
| Énumération de comptes | Moyenne | Message uniforme sur le reset password (même réponse que l'email existe ou non) | `lib/actions/auth.ts` |
| Élévation de privilèges | Critique | Double vérification : middleware (proxy.ts) + API route (`getCurrentUser()` + check rôle) — défense en profondeur | `proxy.ts`, chaque API route |
| Mot de passe faible | Élevée | Politique Zod : min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre | `lib/validators/auth.ts` |
| Fuite de données admin | Moyenne | Anonymisation des données utilisateur dans le back-office respiration | `app/api/admin/breathing/route.ts` |
| Session hijacking | Élevée | JWT signé avec secret, expiration 24h, pas de stockage côté serveur | `lib/auth.ts` |

### Headers de sécurité HTTP (sur chaque réponse)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://images.unsplash.com data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`

### Chiffrement
- **En transit** : HTTPS forcé via HSTS, connexion DB en `sslmode=verify-full`
- **Au repos** : mots de passe hachés avec bcryptjs (coût 10, salt aléatoire)
- **Tokens** : UUID v4 aléatoires (`crypto.randomUUID()`), expiration 1h, usage unique

### Conformité RGPD
| Principe RGPD | Implémentation |
|--------------|----------------|
| Minimisation des données | Seuls nom, email et hash sont stockés. Pas d'adresse, téléphone, etc. |
| Droit à l'effacement | Route `DELETE /api/account` — cascade delete sur toutes les tables liées (favorites, logs, challenges) |
| Anonymisation | Données de respiration vues par l'admin : "Utilisateur 1", "Utilisateur 2" — jamais de nom/email |
| Consentement | Modal RGPD sur la page d'accueil informant de la collecte |
| Hébergement UE | Neon PostgreSQL en `eu-central-1` (Francfort, Allemagne) — aucun transfert hors UE |
| Chiffrement | SSL/TLS sur toutes les connexions, mots de passe hachés |
| Portabilité | Les données utilisateur sont exportables via les API (JSON) |

### Protocole de notification d'incidents
En cas d'incident de sécurité :
1. Détection via les logs serveur et le monitoring Neon
2. Classification : bloquant critique / bloquant fort / majeur / mineur
3. Notification immédiate au responsable technique
4. Correction selon les SLA du cahier des charges (1h pour critique, 40h pour mineur)
5. Post-mortem et mise à jour des contre-mesures

---

## VII. Accessibilité (RGAA / WCAG 2.1)

Le RGAA (Référentiel Général d'Amélioration de l'Accessibilité) est le standard français obligatoire pour les services publics, basé sur WCAG 2.1 niveau AA.

### Navigation au clavier
- **Skip-to-content** : lien "Aller au contenu principal" visible au focus (Tab), présent sur les layouts public et admin
- **Focus visible** : outline vert 3px sur tous les éléments interactifs via `:focus-visible` global
- **`aria-current="page"`** sur les liens de navigation actifs

### Lecteurs d'écran (NVDA, VoiceOver, JAWS)
- **`aria-live="polite"`** sur l'exercice de respiration : annonce la phase, le countdown et le cycle
- **`aria-label`** sur tous les boutons sans texte visible (burger, fermer, retour, favoris)
- **`aria-hidden="true"`** sur les éléments décoratifs (cercles de fond, glow)
- **`role="progressbar"`** avec `aria-valuenow/min/max` sur la progression des cycles
- **`role="radiogroup"` + `role="radio"` + `aria-checked`** sur le sélecteur de cycles
- **`role="region"` avec `aria-label`** sur la zone d'exercice

### Structure sémantique (RGAA critères 8.x, 9.x)
- `lang="fr"` sur `<html>` (critère 8.3)
- Hiérarchie de titres : `<h1>` unique par page, `<h2>`, `<h3>` en cascade (critère 9.1)
- `<nav aria-label="...">` pour chaque zone de navigation (critère 12.1)
- Landmarks HTML5 : `<main>`, `<header>`, `<footer>`, `<aside>` (critère 12.6)
- `<label htmlFor="...">` associé à chaque champ de formulaire (critère 11.1)

### Mouvement et animations (RGAA critère 13.8)
- `prefers-reduced-motion: reduce` : toutes les animations désactivées pour les utilisateurs qui le demandent
- Aucune animation automatique infinie (sauf l'exercice de respiration qui est déclenché par l'utilisateur)

### Contraste (RGAA critères 3.2, 3.3)
- Texte principal : `text-gray-900` sur blanc → ratio > 7:1 (AAA)
- Texte secondaire : `text-gray-600` minimum → ratio > 4.5:1 (AA)
- Boutons : `bg-green-700` + texte blanc → ratio > 4.5:1 (AA)

### Images (RGAA critère 1.1)
- `alt` sur toutes les images (`<Image alt="...">`)
- Emojis décoratifs sans rôle sémantique
- SVG d'icônes avec `aria-hidden="true"` implicite

---

## VIII. Performance du choix technique

### Pourquoi Next.js est performant

| Fonctionnalité | Impact performance |
|---------------|-------------------|
| Server Components | Le HTML est rendu côté serveur. Seul le JavaScript interactif est envoyé au client → bundle JS réduit de 30-50% |
| Streaming SSR | Les pages commencent à s'afficher avant que toutes les données soient chargées |
| Image Optimization | `next/image` génère automatiquement des formats WebP, lazy loading, srcset responsive |
| Code Splitting | Chaque page ne charge que son propre code, pas celui des autres pages |
| Route Groups | Les layouts `(public)` et `(admin)` ont des bundles séparés — un visiteur ne télécharge jamais le code admin |
| Standalone Output | Le build production ne contient que les fichiers nécessaires → image Docker légère |

### Pourquoi Drizzle ORM est performant

| Fonctionnalité | Impact performance |
|---------------|-------------------|
| Requêtes paramétrées | Pas d'overhead d'abstraction — les requêtes sont proches du SQL natif |
| Pas de lazy loading | Pas de requêtes N+1 accidentelles comme avec Prisma ou Sequelize |
| Connection pooling | Pool `pg` avec Neon Pooler → réutilisation des connexions |
| Migrations incrémentales | Seules les différences sont appliquées, pas de reconstruction complète |

### Pourquoi Tailwind CSS est performant
- **Purge automatique** : seules les classes utilisées sont incluses dans le CSS final
- **Pas de CSS-in-JS** : pas de runtime JavaScript pour les styles
- **Taille finale** : ~10-15 KB de CSS gzippé pour toute l'application

---

## IX. Tests et validation

Le cahier des charges exige 3 types de tests, un outil d'automatisation et un cahier de tests.

### 3 niveaux de tests implémentés

| Type | Outil | Fichiers | Rôle |
|------|-------|----------|------|
| Tests unitaires | Jest | `__tests__/unit/` | Tester les fonctions isolées (actions, proxy, utils) |
| Tests par propriétés | Jest + fast-check | `__tests__/properties/` | Générer des centaines de cas aléatoires pour vérifier les invariants |
| Tests E2E (fonctionnels) | Playwright | `__tests__/e2e/` | Simuler un utilisateur réel dans un navigateur |

### Couverture des modules testés
- **Comptes utilisateurs** : auth.property.test.ts, security.property.test.ts, auth.spec.ts (E2E)
- **Informations** : info-pages.property.test.ts, info-pages.test.ts (unit), cms.spec.ts (E2E)
- **Exercices de respiration** : couvert par les tests de sécurité (API routes protégées)
- **Tracker d'émotions** : emotions.property.test.ts, tracker.property.test.ts, tracker.spec.ts (E2E)
- **Admin** : admin.spec.ts (E2E), users.property.test.ts

### Outils d'automatisation
- **Jest** : exécution automatique des tests unitaires et property-based (`npm run test`)
- **Playwright** : exécution automatique des tests E2E dans Chrome/Firefox/Safari (`npm run test:e2e`)
- **Scripts npm** : `npm run test` et `npm run test:e2e` intégrables dans un pipeline CI/CD

### Tests de non-régression
Les tests par propriétés (fast-check) servent de tests de non-régression : ils génèrent des inputs aléatoires à chaque exécution, vérifiant que les invariants du système tiennent toujours après chaque modification du code.

---

## X. Déploiement

### Environnements

| Environnement | Configuration | Base de données |
|--------------|--------------|-----------------|
| Développement | `npm run dev` + `docker-compose.dev.yml` | PostgreSQL local ou Neon |
| Tests | Jest + Playwright avec mocks | Mocks / DB de test |
| Production | `Dockerfile` + `docker-compose.yml` | Neon PostgreSQL (eu-central-1) |

### Architecture de déploiement
- **Docker** : `Dockerfile` multi-stage (build + runtime) avec `output: "standalone"`
- **Docker Compose** : orchestration app + DB pour production et développement
- **Neon PostgreSQL** : DB cloud avec connection pooling (pooler pour l'app, direct pour les migrations)

### Versioning
- **Git** : gestion des sources avec historique complet
- **Migrations versionnées** : chaque migration SQL est commitée avec le code
- **Snapshots Drizzle** : fichiers JSON dans `drizzle/meta/` pour le diff automatique

### Scripts
```bash
npm run dev          # Serveur de développement (port 3333)
npm run build        # Build production optimisé
npm run start        # Serveur production
npm run db:generate  # Générer les migrations depuis le schéma
npm run db:migrate   # Appliquer les migrations sur PostgreSQL
npm run db:seed      # Peupler la base avec les données de démo
npm run test         # Tests unitaires + property-based (Jest)
npm run test:e2e     # Tests end-to-end (Playwright)
npm run lint         # Vérification ESLint
```

---

## XI. Interface utilisateur — Responsive Mobile First

### Approche Mobile First
Conformément au cahier des charges, l'application est conçue **Mobile First** :
- Les styles de base ciblent le mobile (< 640px)
- Les breakpoints Tailwind (`sm:`, `md:`, `lg:`) ajoutent progressivement les styles desktop
- Chaque page a été testée sur mobile, tablette et desktop

### Pages publiques (Front-Office)
- Accueil : bento grid responsive (1 col mobile → 3 cols desktop)
- Exercices de respiration : cards + animation interactive plein écran
- Articles santé : grid filtrable par catégorie + favoris + images Unsplash
- Pages d'information : contenu Markdown rendu dynamiquement
- Login / Register / Reset password : formulaires accessibles
- À propos, Mentions légales, Confidentialité

### Back-Office admin
- Dashboard avec cards d'accès rapide
- Gestion des utilisateurs : table responsive (cards sur mobile)
- Gestion des articles : cards avec image, CRUD, statut collapsible
- Gestion de la respiration : 3 tabs (exercices CRUD, défis anonymisés, sessions)
- Sidebar desktop + menu burger mobile avec drawer animé
- Stats en temps réel : défis actifs, sessions aujourd'hui, utilisateurs engagés

### Animations et transitions
- Fade/slide-up sur les changements de page
- Scale-in sur l'ouverture d'un exercice
- Slide-in sur le drawer mobile admin
- `prefers-reduced-motion` respecté (tout désactivé si demandé)

---

## XII. Maintenance corrective et évolutive

### SLA conformes au cahier des charges

| Sévérité | Prise en compte | Correction |
|----------|----------------|------------|
| Bloquant critique | 1h ouvrée | 3h ouvrées |
| Bloquant fort | 2h ouvrées | 6h ouvrées |
| Majeur | 7h ouvrées | 16h ouvrées |
| Mineur (par lots) | 1 jour ouvré | 40h ouvrées |

### Maintenance évolutive facilitée par le stack
- **TypeScript** : les erreurs sont détectées à la compilation, pas en production
- **Drizzle migrations** : ajouter une table = modifier le schéma + `db:generate` + `db:migrate`
- **Tests automatisés** : chaque modification est validée par les tests avant déploiement
- **Architecture modulaire** : chaque module (users, info-pages, respiration) est isolé dans ses propres fichiers

---

## XIII. Points clés pour la soutenance

### Ce qui différencie ce projet
1. **4 modules implémentés** au lieu du minimum de 3 (2 obligatoires + 2 au choix + 1 bonus)
2. **Stack moderne et type-safe** : Next.js 16 + Drizzle + TypeScript — erreurs détectées à la compilation
3. **MVC naturel** : le pattern est respecté grâce à l'architecture App Router, pas forcé artificiellement
4. **Migrations as code** : le schéma DB est versionné avec le code source
5. **9 couches de sécurité** : middleware, headers, ORM paramétré, sanitization, bcrypt, JWT, Zod, RBAC, rate limiting
6. **Conformité RGPD** : anonymisation, droit à l'effacement, hébergement UE, chiffrement
7. **Accessibilité RGAA** : skip-to-content, aria-live, focus-visible, reduced-motion, landmarks
8. **3 types de tests** : unitaires, property-based (fast-check) et E2E (Playwright)
9. **Responsive Mobile First** : chaque page fonctionne du mobile au desktop, y compris l'admin
10. **Fonctionnalité bonus** : défis de respiration personnalisés avec suivi de progression

---

## XIV. Guide d'installation

### Prérequis
- Node.js 18+
- PostgreSQL (local ou Neon cloud)
- npm

### Installation
```bash
git clone <repository-url>
cd cesizen
npm install
```

### Configuration
Créer un fichier `.env.local` :
```env
NEXTAUTH_SECRET=votre-secret-jwt
NEXTAUTH_URL=http://localhost:3333
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=verify-full
```

### Base de données
```bash
npm run db:migrate    # Créer les tables
npm run db:seed       # Peupler avec les données de démo
```

### Lancement
```bash
npm run dev           # Développement (http://localhost:3333)
npm run build && npm run start  # Production
```

### Comptes de démo
- Admin : `admin@cesizen.fr` / `Admin123!`
- Utilisateur : `marie@cesizen.fr` / `User1234`

### Docker
```bash
docker-compose up     # Production
docker-compose -f docker-compose.dev.yml up  # Développement
```

---

## XV. Prompt pour Gemini — Génération de slides

```
À partir du document suivant, génère une présentation de soutenance de 20 minutes avec des slides détaillés pour le projet CESIZen — application de santé mentale développée dans le cadre du titre CDA au CESI.

La présentation doit couvrir ces slides (3-5 bullet points max par slide, avec notes présentateur) :

1. Titre : CESIZen — L'application de votre santé mentale
2. Contexte : projet CDA CESI, simulation Ministère de la Santé, enjeu santé mentale
3. Objectifs et acteurs (visiteur anonyme, utilisateur connecté, administrateur)
4. Modules développés : 2 obligatoires + 2 au choix + 1 bonus (au-delà du cahier des charges)
5. Comparatif technique : PHP/Laravel vs React+Express vs Next.js+Drizzle (tableau)
6. Justification du choix : type-safety, fullstack, MVC naturel, migrations as code
7. Architecture MVC : schéma Model/View/Controller avec Next.js App Router
8. Séparation Front-Office / Back-Office : Route Groups, layouts protégés
9. Base de données : MLD 12 tables, relations, enums PostgreSQL
10. Migrations Drizzle : schéma as code, 4 migrations versionnées, workflow
11. Démo fonctionnalités : comptes, articles, respiration interactive, tracker, défis
12. Sécurité : matrice des 12 vulnérabilités avec contre-mesures (tableau)
13. Headers HTTP de sécurité : 7 headers dont CSP et HSTS
14. RGPD : anonymisation, droit à l'effacement, hébergement UE, chiffrement
15. Accessibilité RGAA : skip-to-content, aria-live, focus-visible, reduced-motion
16. Performance : Server Components, Image Optimization, Tailwind purge, connection pooling
17. Tests : 3 niveaux (unitaires Jest, property fast-check, E2E Playwright)
18. Déploiement : Docker, Neon PostgreSQL, 3 environnements
19. Responsive Mobile First : breakpoints, menu burger admin, cards adaptatives
20. Conclusion : points forts, perspectives d'évolution

Style : professionnel mais accessible, palette verte/nature cohérente avec l'app. Suggérer des captures d'écran à chaque slide fonctionnel.
```
