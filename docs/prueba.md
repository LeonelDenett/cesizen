# CESIZen — Documentation Technique (Édition Intégrée)

**Projet individuel** : [Nom Prénom]
**Client** : Ministère de la Santé et de la Prévention
**Date** : 2026

---

## SOMMAIRE

1. Architecture & Solutions Techniques
2. Modèle Logique de Données (MLD)
3. Modules & Cas d'utilisation
4. Cahier de tests (Exhaustif)
5. PV & Recettes
6. Tutoriel d'installation de l'application
7. Exploitation & Sécurité
8. Application web

---

## 1. Architecture & Solutions Techniques

### 1.1 Partie Backend

Le choix s'est porté sur **Next.js API Routes** pour sa capacité à unifier le développement Fullstack en TypeScript, offrant une sécurité native et une maintenabilité supérieure.

| Critères | Solution A : Express.js | Solution B : Spring Boot | Solution C : Next.js API Routes (Retenu) |
|---|:---:|:---:|:---:|
| Prise en main | 5/5 | 1/5 | 4/5 |
| Performances | 2/5 | 5/5 | 5/5 |
| Sécurité | 1/5 | 4/5 | 5/5 |
| Maintenabilité | 1/5 | 5/5 | 5/5 |
| Coût / accessibilité | 5/5 | 2/5 | 4/5 |
| **Total** | **14/25** | **17/25** | **23/25** |

**Express.js** : Prise en main simple mais aucune structure imposée. Sécurité reposant sur des bibliothèques tierces (helmet, cors), pas de typage natif, maintenabilité faible pour un projet de taille moyenne.

**Spring Boot** : Référence Java avec excellente scalabilité et Spring Security. Complexité de configuration importante, temps de développement plus long, écosystème lourd pour un projet individuel.

**Next.js API Routes (Retenu)** : Backend et frontend dans un seul projet TypeScript. Drizzle ORM fournit un accès type-safe à PostgreSQL avec requêtes préparées (anti SQL injection natif). NextAuth.js gère l'authentification avec protection CSRF automatique. Le proxy middleware (`proxy.ts`) assure la sécurité des routes avec rate limiting et headers de sécurité.

### 1.2 Partie Frontend

| Critères | Solution A : React (CRA) | Solution B : Angular | Solution C : Next.js + Tailwind (Retenu) |
|---|:---:|:---:|:---:|
| Prise en main | 4/5 | 2/5 | 4/5 |
| Performances | 3/5 | 4/5 | 5/5 |
| Sécurité | 3/5 | 4/5 | 5/5 |
| Maintenabilité | 3/5 | 4/5 | 5/5 |
| Coût / accessibilité | 4/5 | 3/5 | 5/5 |
| **Total** | **17/25** | **17/25** | **24/25** |

**React (CRA)** : Bonne prise en main mais pas de SSR natif (pénalise SEO et performances). Routing via bibliothèque tierce, pas de convention de structure.

**Angular** : Framework complet avec structure imposée mais courbe d'apprentissage raide (RxJS, modules). Bundle size important, productivité moindre en solo.

**Next.js + Tailwind CSS v4 (Retenu)** : SSR/SSG natif via React Server Components, routing basé sur le système de fichiers, Tailwind CSS v4 pour le responsive Mobile First. Un seul framework, un seul langage, un seul déploiement. Performances optimales grâce à Turbopack.

### 1.3 Stack Technique Complète

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Runtime | Node.js (Alpine) | 20 |
| Framework | Next.js (App Router) | 16.2.1 |
| Langage | TypeScript | 5.x |
| Base de données | PostgreSQL | 16 |
| ORM | Drizzle ORM | 0.45 |
| Authentification | NextAuth.js | 4.24 |
| Validation | Zod | 4.3 |
| Hashing | bcryptjs (coût 10) | 3.x |
| CSS | Tailwind CSS | v4 |
| Icônes | Google Material Symbols | Rounded |
| Tests unitaires | Jest + fast-check | 30 / 4.6 |
| Tests E2E | Playwright | 1.58 |
| Conteneurisation | Docker + Compose | 28.x / 2.40 |

### 1.4 Structure MVC

| Couche | Implémentation | Fichiers |
|--------|----------------|----------|
| **Model** | Drizzle ORM schemas | `lib/db/schema/*.ts` |
| **View** | React Server/Client Components | `app/**/*.tsx`, `components/**/*.tsx` |
| **Controller** | API Routes + Server Actions | `app/api/**/*.ts`, `lib/actions/*.ts` |
| **Middleware** | Proxy de sécurité | `proxy.ts` |


---

## 2. Modèle Logique de Données (MLD)

La base de données PostgreSQL 16 contient 7 tables structurées pour garantir la sécurité et la conformité RGPD.

### 2.1 Schéma relationnel

```sql
-- Table des utilisateurs
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'utilisateur',  -- ENUM: utilisateur | administrateur
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- Table des sessions
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at    TIMESTAMP NOT NULL
);

-- Table des tokens de réinitialisation de mot de passe
CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- Table des pages d'information (CMS)
CREATE TABLE info_pages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  content     TEXT NOT NULL,
  category    page_category NOT NULL DEFAULT 'general',  -- ENUM: alimentation | sport | meditation | stress | general
  image_url   VARCHAR(500),
  status      page_status NOT NULL DEFAULT 'draft',      -- ENUM: published | draft
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- Table des éléments de menu
CREATE TABLE menu_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label         VARCHAR(255) NOT NULL,
  page_id       UUID NOT NULL REFERENCES info_pages(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- Table des favoris
CREATE TABLE favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  page_id     UUID NOT NULL REFERENCES info_pages(id) ON DELETE CASCADE,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);
```

### 2.2 Relations

| Relation | Type | Contrainte |
|----------|------|------------|
| users → sessions | 1:N | CASCADE DELETE |
| users → password_reset_tokens | 1:N | CASCADE DELETE |
| users → favorites | 1:N | CASCADE DELETE |
| info_pages → menu_items | 1:N | CASCADE DELETE |
| info_pages → favorites | 1:N | CASCADE DELETE |

### 2.3 Décisions de conception

- **UUIDs** : Clés primaires non séquentielles (sécurité, pas de séquences prévisibles)
- **CASCADE DELETE** sur users : Conformité RGPD — suppression d'un compte entraîne la suppression de toutes les données associées (droit à l'oubli)
- **Slug unique** sur info_pages : URLs amigables pour le SEO (`/info/gestion-du-stress`)
- **Enum au niveau DB** : Contraintes de validité des rôles et statuts
- **display_order** : Tri personnalisé des menus sans dépendre de l'ordre d'insertion

---

## 3. Modules & Cas d'utilisation

### 3.1 Périmètre Fonctionnel

| Module | Statut | Fonctionnalités |
|--------|--------|-----------------|
| **Comptes utilisateurs** | Obligatoire ✅ | Inscription, connexion JWT, profil, reset password, admin CRUD, isolation admin |
| **Informations (CMS)** | Obligatoire ✅ | 13 articles, favoris, filtres catégorie, menu dynamique, pages légales |
| **Exercices de respiration** | Au choix ✅ | 6 exercices interactifs, cercle animé, phases visuelles, statistiques |

### 3.2 Scénarios détaillés

#### Visiteur anonyme

**Cas 1 : Consulter le site**

| N° | Action | Résultat attendu | Statut |
|----|--------|------------------|--------|
| 1 | Le visiteur accède au site | Page d'accueil bento grid affichée | ✅ |
| 2 | Le visiteur clique sur "Exercices de respiration" | Page avec 6 exercices (3 base + 3 avancés) | ✅ |
| 3 | Le visiteur sélectionne un exercice (ex: 7-4-8) | Interface plein écran, fond vert foncé, cercle animé | ✅ |
| 4 | Le visiteur appuie sur le cercle | Exercice démarre : Inspirez (7s) → Retenez (4s) → Expirez (8s) | ✅ |
| 5 | Le visiteur termine les cycles | Écran "Bravo" avec nombre de cycles et durée | ✅ |
| 6 | Le visiteur clique sur "Articles" | Catalogue avec images Unsplash, filtres par catégorie | ✅ |
| 7 | Le visiteur clique sur un article | Article complet : hero image, contenu markdown, sidebar similaires | ✅ |
| 8 | Le visiteur clique sur "Informations santé" | Page avec numéros d'urgence, ressources, liens utiles | ✅ |

**Cas 2 : Créer un compte**

| N° | Action | Résultat attendu | Statut |
|----|--------|------------------|--------|
| 1 | Le visiteur clique sur l'icône personne (header) | Redirection vers `/login` | ✅ |
| 2 | Le visiteur clique sur "Créer un compte" | Page d'inscription affichée | ✅ |
| 3 | Le visiteur remplit prénom, nom, email, mot de passe | Validation Zod en temps réel | ✅ |
| 4 | Le visiteur entre un mot de passe faible (< 8 chars) | Message d'erreur avec critères non remplis | ✅ |
| 5 | Le visiteur entre un email déjà utilisé | Message "Cet email est déjà utilisé" | ✅ |
| 6 | Le visiteur soumet un formulaire valide | Compte créé, message de succès, lien vers connexion | ✅ |

#### Utilisateur connecté

**Cas 3 : Se connecter / Se déconnecter**

| N° | Action | Résultat attendu | Statut |
|----|--------|------------------|--------|
| 1 | L'utilisateur entre email + mot de passe | Validation côté client (regex email, longueur max) | ✅ |
| 2 | L'utilisateur soumet des credentials valides | Connexion réussie, JWT créé, redirection accueil | ✅ |
| 3 | L'utilisateur soumet des credentials invalides | Message générique "Email ou mot de passe incorrect" | ✅ |
| 4 | L'avatar avec initiales apparaît dans le header | Dropdown : "Mon compte" + "Déconnexion" | ✅ |
| 5 | L'utilisateur clique sur "Déconnexion" | Session détruite, redirection accueil, icône personne | ✅ |

**Cas 4 : Gérer son compte (RGPD)**

| N° | Action | Résultat attendu | Statut |
|----|--------|------------------|--------|
| 1 | L'utilisateur clique sur avatar → "Mon compte" | Modal centré avec infos personnelles | ✅ |
| 2 | L'utilisateur consulte ses droits RGPD | Droit d'accès, rectification, effacement, portabilité | ✅ |
| 3 | L'utilisateur clique sur "Supprimer mon compte" | Zone dangereuse : confirmation en 2 étapes | ✅ |
| 4 | L'utilisateur confirme la suppression | Compte + données supprimés (CASCADE), déconnexion forcée | ✅ |
| 5 | L'utilisateur annule la suppression | Aucune action, modal reste ouvert | ✅ |

**Cas 5 : Gérer les favoris**

| N° | Action | Résultat attendu | Statut |
|----|--------|------------------|--------|
| 1 | L'utilisateur connecté consulte les articles | Bouton ❤️ visible sur chaque card | ✅ |
| 2 | L'utilisateur clique sur ❤️ | Article ajouté aux favoris (toggle, stocké en DB) | ✅ |
| 3 | L'utilisateur reclique sur ❤️ | Article retiré des favoris | ✅ |
| 4 | Un visiteur non connecté voit les articles | Pas de bouton ❤️ visible | ✅ |

**Cas 6 : Réinitialiser son mot de passe**

| N° | Action | Résultat attendu | Statut |
|----|--------|------------------|--------|
| 1 | L'utilisateur clique sur "Mot de passe oublié" | Page de réinitialisation affichée | ✅ |
| 2 | L'utilisateur entre un email existant | Réponse uniforme (ne révèle pas si le compte existe) | ✅ |
| 3 | L'utilisateur entre un email inexistant | Même réponse uniforme (sécurité) | ✅ |
| 4 | L'utilisateur utilise le token reçu | Formulaire nouveau mot de passe | ✅ |
| 5 | L'utilisateur définit un nouveau mot de passe | Hash bcrypt mis à jour, token invalidé | ✅ |
| 6 | L'utilisateur utilise un token expiré (> 1h) | Message "Lien expiré", proposition de nouveau lien | ✅ |

#### Administrateur

**Cas 7 : Accéder au back-office**

| N° | Action | Résultat attendu | Statut |
|----|--------|------------------|--------|
| 1 | L'admin se connecte | Redirection automatique vers `/admin` | ✅ |
| 2 | Le dashboard s'affiche | Header vert foncé + sidebar + cards d'actions | ✅ |
| 3 | L'admin tente d'accéder à `/articles` | Redirection vers `/admin` (isolation) | ✅ |
| 4 | Un utilisateur normal tente `/admin` | Redirection vers `/` | ✅ |
| 5 | Un visiteur non connecté tente `/admin` | Redirection vers `/login` | ✅ |

**Cas 8 : Gérer les utilisateurs**

| N° | Action | Résultat attendu | Statut |
|----|--------|------------------|--------|
| 1 | L'admin accède à "Utilisateurs" | Liste de tous les comptes | ✅ |
| 2 | L'admin crée un nouveau compte | Compte créé avec rôle spécifié | ✅ |
| 3 | L'admin désactive un compte | is_active = false, sessions supprimées | ✅ |
| 4 | L'admin supprime un compte | Compte + données supprimés (CASCADE RGPD) | ✅ |
| 5 | L'admin tente de supprimer son propre compte | Opération refusée avec message d'erreur | ✅ |

**Cas 9 : Gérer les articles (CMS)**

| N° | Action | Résultat attendu | Statut |
|----|--------|------------------|--------|
| 1 | L'admin accède à "Articles" | Liste avec titre, slug, statut, date | ✅ |
| 2 | L'admin crée un article | Titre, contenu, catégorie, statut configurable | ✅ |
| 3 | L'admin publie un article | Article visible sur le front-office | ✅ |
| 4 | L'admin passe un article en brouillon | Article masqué du front-office, existe en DB | ✅ |
| 5 | L'admin supprime un article | Article + entrée de menu associée supprimés | ✅ |


---

## 4. Cahier de tests (Exhaustif)

### 4.1 Tests Backend — Utilisateurs (API)

| ID | Méthode | Scénario | Entrée / Préconditions | Résultat attendu |
|----|---------|----------|------------------------|------------------|
| USR-01 | POST /api/auth/register | Inscription nominale | Email valide, MdP ≥ 8 chars (maj+min+chiffre), nom | 201, compte créé, rôle "utilisateur" |
| USR-02 | POST /api/auth/register | Email dupliqué | Email déjà existant en DB | 409, "Cet email est déjà utilisé" |
| USR-03 | POST /api/auth/register | Mot de passe faible | MdP < 8 chars | 400, critères non remplis |
| USR-04 | POST /api/auth/register | Nom manquant | Email + MdP uniquement | 400, erreur de validation |
| USR-05 | POST /api/auth/register | Email invalide | email = "not-an-email" | 400, erreur de validation |
| USR-06 | POST /api/auth/register | Hash bcrypt vérifié | Tout MdP valide | password_hash commence par $2b$, ≠ plaintext |
| USR-07 | GET /api/users | Liste utilisateurs (admin) | Session admin active | 200, tableau avec nom, email, rôle, statut |
| USR-08 | GET /api/users | Accès non-admin | Session utilisateur normal | 403, "Accès interdit" |
| USR-09 | GET /api/users | Sans authentification | Pas de token | 401, "Non autorisé" |
| USR-10 | POST /api/users | Création par admin | Session admin, rôle spécifié | 201, compte créé avec le rôle demandé |
| USR-11 | PATCH /api/users/:id | Désactivation compte | Session admin, id existant | 200, is_active=false, sessions supprimées |
| USR-12 | DELETE /api/users/:id | Suppression compte | Session admin, id existant | 200, compte + données supprimés (CASCADE) |
| USR-13 | DELETE /api/users/:id | Auto-suppression admin | Admin tente de supprimer son propre id | 403, "Un administrateur ne peut pas supprimer son propre compte" |
| USR-14 | DELETE /api/users/:id | Utilisateur inexistant | id invalide | 404, "Utilisateur introuvable" |

### 4.2 Tests Backend — Authentification

| ID | Méthode | Scénario | Entrée / Préconditions | Résultat attendu |
|----|---------|----------|------------------------|------------------|
| AUTH-01 | POST /api/auth/login | Connexion nominale | Email + MdP corrects | 200, session JWT créée |
| AUTH-02 | POST /api/auth/login | Email inconnu | Email inexistant | 401, "Email ou mot de passe incorrect" |
| AUTH-03 | POST /api/auth/login | Mauvais mot de passe | Email valide, MdP erroné | 401, même message générique |
| AUTH-04 | POST /api/auth/login | Compte désactivé | is_active = false | Erreur "Compte désactivé" |
| AUTH-05 | POST /api/auth/login | Email manquant | MdP uniquement | 400, erreur de validation |
| AUTH-06 | POST /api/auth/login | Rate limiting | 11ème tentative en 15 min | 429, "Trop de tentatives" |
| AUTH-07 | POST /api/auth/login | Injection SQL dans email | email = "'; DROP TABLE users;--" | 400, rejeté par validation regex |
| AUTH-08 | POST /api/auth/login | XSS dans email | email = "<script>alert(1)</script>" | 400, tags HTML strippés |
| AUTH-09 | POST /api/auth/login | Admin → redirection | Rôle "administrateur" | Redirection vers /admin |
| AUTH-10 | POST /api/auth/reset-password | Reset nominale | Email existant | 200, réponse uniforme |
| AUTH-11 | POST /api/auth/reset-password | Email inexistant | Email non enregistré | 200, même réponse (sécurité) |
| AUTH-12 | POST /api/auth/reset-password/confirm | Token valide | Token UUID non expiré | 200, MdP mis à jour, token invalidé |
| AUTH-13 | POST /api/auth/reset-password/confirm | Token expiré | Token > 1h | 400, "Lien expiré" |
| AUTH-14 | POST /api/auth/reset-password/confirm | Token déjà utilisé | used = true | 400, "Lien déjà utilisé" |

### 4.3 Tests Backend — CMS & Favoris

| ID | Méthode | Scénario | Entrée / Préconditions | Résultat attendu |
|----|---------|----------|------------------------|------------------|
| CMS-01 | GET /api/info-pages | Liste publique | Aucune auth requise | 200, uniquement les pages "published" |
| CMS-02 | GET /api/info-pages?all=true | Liste admin | Session admin | 200, toutes les pages (published + draft) |
| CMS-03 | POST /api/info-pages | Création article | Session admin, titre + contenu | 201, slug auto-généré |
| CMS-04 | PUT /api/info-pages/:slug | Modification article | Session admin, nouveau contenu | 200, updatedAt mis à jour |
| CMS-05 | PUT /api/info-pages/:slug | Passage en brouillon | Session admin, status="draft" | 200, article masqué en front |
| CMS-06 | DELETE /api/info-pages/:slug | Suppression article | Session admin | 200, article + menu_item supprimés |
| CMS-07 | POST /api/info-pages | Accès non-admin | Session utilisateur | 403, "Accès interdit" |
| FAV-01 | GET /api/favorites | Liste favoris | Session active | 200, tableau des favoris de l'utilisateur |
| FAV-02 | POST /api/favorites | Ajout favori | Session active, pageId valide | 201, favori créé |
| FAV-03 | POST /api/favorites | Toggle favori | Favori déjà existant | 200, favori supprimé (toggle) |
| FAV-04 | GET /api/favorites | Sans auth | Pas de token | 401, "Non autorisé" |

### 4.4 Tests Frontend (Interface Utilisateur)

| ID | Composant | Scénario | Résultat UI attendu | Type |
|----|-----------|----------|---------------------|------|
| F-AUTH-01 | Formulaire inscription | Validation email temps réel | Message rouge si format invalide | Widget |
| F-AUTH-02 | Formulaire inscription | Mot de passe faible | Critères affichés en rouge | Widget |
| F-AUTH-03 | Formulaire inscription | Prénom + Nom séparés | Deux champs côte à côte | Widget |
| F-AUTH-04 | Formulaire connexion | Eye toggle mot de passe | Bascule visible/masqué | Widget |
| F-AUTH-05 | Formulaire connexion | Sanitization HTML | Tags `<script>` strippés | Sécurité |
| F-BRT-01 | Liste exercices | Affichage 6 exercices | 3 base + 3 avancés avec descriptions | Widget |
| F-BRT-02 | Exercice interactif | Lancement par clic sur cercle | Cercle s'agrandit (inspire), réduit (expire) | Intégration |
| F-BRT-03 | Exercice interactif | Sélection cycles (3/6/10) | Boutons ronds, sélection active | Widget |
| F-BRT-04 | Exercice interactif | Fin d'exercice | Écran "Bravo" avec stats | Widget |
| F-ART-01 | Grille articles | Filtrage par catégorie | Grille mise à jour sans rechargement | Intégration |
| F-ART-02 | Grille articles | Images Unsplash | Images haute résolution, lazy loading | Widget |
| F-ART-03 | Article individuel | Hero image + sidebar | Image plein écran, articles similaires à droite | Widget |
| F-ART-04 | Article individuel | Rendu markdown | Titres, listes, gras correctement formatés | Widget |
| F-FAV-01 | Bouton favori | Toggle ❤️ connecté | Changement immédiat d'état | Intégration |
| F-FAV-02 | Bouton favori | Non connecté | Bouton ❤️ non visible | Widget |
| F-ACC-01 | Modal compte | Affichage droits RGPD | 4 droits listés avec checkmarks | Widget |
| F-ACC-02 | Modal compte | Suppression 2 étapes | Confirmation rouge, puis bouton définitif | Intégration |
| F-ADM-01 | Route protection | User normal → /admin | Redirection vers / | Sécurité |
| F-ADM-02 | Route protection | Admin → /articles | Redirection vers /admin | Sécurité |
| F-ADM-03 | Route protection | Non connecté → /admin | Redirection vers /login | Sécurité |
| F-SEC-01 | Headers sécurité | Toutes les réponses | X-Frame-Options: DENY, X-XSS-Protection | Sécurité |
| F-SEC-02 | Rate limiting | 10+ tentatives login | 429 affiché | Sécurité |
| F-A11Y-01 | Navigation clavier | Tab sur formulaires | Focus visible et ordre cohérent | Accessibilité |
| F-A11Y-02 | Contrastes | Texte sur fond | Ratio ≥ 4.5:1 | Accessibilité |
| F-RESP-01 | Mobile | Page d'accueil | Bento grid 1 colonne, tout visible | Responsive |
| F-RESP-02 | Tablet | Page d'accueil | Bento grid 2 colonnes | Responsive |
| F-RESP-03 | Desktop | Page d'accueil | Bento grid 3 colonnes | Responsive |

### 4.5 Tests E2E (Playwright)

| ID | Flux | Description | Statut |
|----|------|-------------|--------|
| E2E-01 | Authentification | Inscription → Connexion → Avatar affiché → Déconnexion | ✅ |
| E2E-02 | Credentials invalides | Connexion avec mauvais MdP → Message générique affiché | ✅ |
| E2E-03 | CMS Admin | Login admin → Créer article → Publier → Vérifier front → Brouillon | ✅ |
| E2E-04 | Admin Users | Login admin → Lister users → Créer → Désactiver → Supprimer | ✅ |
| E2E-05 | Respiration | Accéder → Sélectionner 5-5 → Lancer → Compléter 3 cycles | ✅ |
| E2E-06 | Articles | Accéder → Filtrer "Sport" → Ouvrir article → Sidebar visible | ✅ |

### 4.6 Tests Property-Based (fast-check, 100 itérations)

| ID | Propriété | Validation |
|----|-----------|------------|
| P-01 | Tout mot de passe faible est rejeté par le validateur | Req 1.3 |
| P-02 | Email dupliqué → rejet, DB inchangée | Req 1.2, 3.3 |
| P-03 | Inscription valide → rôle "utilisateur", hash bcrypt | Req 1.1, 1.4 |
| P-04 | Credentials valides → objet user retourné | Req 2.1 |
| P-05 | Credentials invalides → null (même réponse) | Req 2.2 |
| P-06 | Réponse reset uniforme (email existe ou non) | Req 4.1 |
| P-07 | Page publiée accessible par slug | Req 6.2 |
| P-08 | Page brouillon masquée du front | Req 7.4 |
| P-09 | Routes protégées → 401 sans token | Req 14.6 |
| P-10 | Format date français JJ/MM/AAAA | Req 16.3 |


---

## 5. PV & Recettes

### PROCÈS-VERBAL DE RECETTE (PV)

**PROJET** : CESIZen — L'application de votre santé mentale
**RÉFÉRENCE** : PV-2026-001
**DATE** : [Date]

#### 1. PARTIES CONCERNÉES

| | FOURNISSEUR (Prestataire) | CLIENT |
|---|---|---|
| Nom | [Nom Prénom] | Ministère de la Santé et de la Prévention |
| Adresse | | 14 Avenue Duquesne, 75350 Paris |
| Contact | [email] | |
| Représentant | [Nom] | |

#### 2. INFORMATIONS SUR LE PRODUIT

- **Nom du produit** : Plateforme CESIZen
- **Version** : V1.0 — Prototype fonctionnel (Livrable Activité 2)
- **Environnement** : Web (navigateurs modernes : Chrome, Firefox, Edge, Safari), approche Mobile First

#### 3. DESCRIPTION DÉTAILLÉE DES LIVRABLES

**3.1 Composants Logiciels (Prototype)**
- Application Web : Interface publique (Front-Office) et interface d'administration (Back-Office) basées sur une architecture MVC (Next.js App Router)
- 3 modules fonctionnels opérationnels : Comptes utilisateurs, Informations (CMS), Exercices de respiration

**3.2 Documentation Technique et Fonctionnelle**
- Modélisation physique de la base de données : MLD PostgreSQL (7 tables, relations CASCADE)
- Comparatif des solutions techniques : 3 architectures backend + 3 frontend, 5 critères chacun
- Guide d'installation : Docker + script automatique `dev.sh`
- Cahier de tests : Tests unitaires (Jest), property-based (fast-check), fonctionnels, E2E (Playwright)

**3.3 Prestations de Services**
- Démonstration : Soutenance orale de 20 minutes
- Prototype fonctionnel déployable via Docker Compose

#### 4. DÉCISION DE RÉCEPTION

Après vérification de la conformité des livrables par rapport au cahier des charges initial, le Client déclare :

☐ **RECONNAÎTRE** avoir reçu le livrable mentionné ci-dessus qui correspond en tout point à ses attentes (**Recette sans réserve**).

☐ **RECONNAÎTRE** avoir reçu le livrable mentionné ci-dessus qui correspond à ses attentes sous réserves listées dans la section 5 (**Recette provisoire**).

☐ **RECONNAÎTRE** avoir reçu le livrable mentionné ci-dessus qui ne correspond pas à ses attentes pour les motifs listés en section 5 (**Refus de recette**).

☐ **NE PAS AVOIR REÇU** le livrable.

#### 5. RÉSERVES OU RÉCLAMATIONS ÉMISES

En cas de recette sous réserve, les points suivants devront être corrigés par le prestataire :

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

#### 6. SIGNATURES

L'acceptation de la recette (même avec réserves) déclenche la fin de la phase de réalisation et, le cas échéant, le démarrage de la période de garantie.

Fait à __________, le __________, en 2 exemplaires originaux.

| Pour le Prestataire | Pour le Client (Le Ministère) |
|---|---|
| (Signature et Cachet) | (Signature et Cachet) |
| Nom : | Nom : |
| Qualité : | Qualité : |

---

## 6. Tutoriel d'installation de l'application

### 6.1 Prérequis

- **OS supportés** : Windows 10/11, macOS, Linux
- **Docker** et **Docker Compose** installés
- **Node.js 20+** (pour le développement local)
- **Git** installé

Vérification rapide de l'environnement :
```bash
docker --version        # Docker 28.x+
docker compose version  # Compose 2.x+
node --version          # Node 20+
git --version
```

### 6.2 Récupération du projet

```bash
git clone <url-du-repo>
cd cesizen
npm install
```

### 6.3 Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine :
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5477/cesizen
NEXTAUTH_SECRET=votre-cle-secrete-a-changer-en-production
NEXTAUTH_URL=http://localhost:3333
```

### 6.4 Lancer l'application

**Option 1 : Script automatique (recommandé)**
```bash
chmod +x dev.sh
./dev.sh
```

Ce script effectue automatiquement :
1. Lancement de PostgreSQL dans Docker (port 5477)
2. Attente que la base soit prête
3. Exécution des migrations Drizzle
4. Exécution du seed (données initiales : 13 articles, 6 émotions, 2 comptes)
5. Lancement de Next.js sur `http://localhost:3333`

**Option 2 : Docker Compose (production)**
```bash
docker compose up --build
```

**Option 3 : Manuel**
```bash
# Terminal 1 : Base de données
docker compose -f docker-compose.dev.yml up -d db

# Terminal 2 : Migrations + Seed + App
export DATABASE_URL="postgresql://postgres:postgres@localhost:5477/cesizen"
npx drizzle-kit migrate
npx tsx lib/db/seed.ts
npm run dev -- -p 3333
```

### 6.5 Comptes de test

| Rôle | Email | Mot de passe | Accès |
|------|-------|-------------|-------|
| Administrateur | admin@cesizen.fr | Admin123! | Back-office `/admin` |
| Utilisateur | marie@cesizen.fr | User1234 | Front-office |

### 6.6 Dépannage

| Problème | Solution |
|----------|----------|
| Port occupé | Modifier le port dans `docker-compose.dev.yml` et `dev.sh` |
| Erreur de migration | `DATABASE_URL=... npx drizzle-kit generate && npx drizzle-kit migrate` |
| Cache corrompu | `rm -rf .next && npm run dev` |
| DB inaccessible | Vérifier que Docker est lancé : `docker ps` |
| Erreur npm install | `rm -rf node_modules package-lock.json && npm install` |

---

## 7. Exploitation & Sécurité

### 7.1 Architecture d'exploitation

- **Frontend + Backend** : Next.js 16.2.1 (un seul processus Node.js)
- **Base de données** : PostgreSQL 16 (conteneur Docker)
- **Authentification** : NextAuth.js avec JWT (tokens signés, expiration configurable)
- **Proxy middleware** : `proxy.ts` — sécurité des routes, rate limiting, headers

### 7.2 Supervision & Indicateurs

| Indicateur | Description | Seuil d'alerte |
|------------|-------------|----------------|
| Disponibilité | Health check de l'application | < 99.5% |
| Taux d'erreur HTTP | Erreurs 5xx par endpoint | > 1% |
| Temps de réponse | Endpoints critiques (auth, API) | > 500ms |
| Tentatives login | Rate limiting par IP | > 10 / 15 min |
| Espace disque | Conteneur PostgreSQL | > 80% |

### 7.3 Opérations de maintenance

**Maintenance préventive (hebdomadaire) :**
- Vérification des logs serveur (`.next/dev/logs/`)
- Vérification de l'espace disque PostgreSQL
- Mise à jour des dépendances npm (`npm audit`)
- Vérification des certificats TLS

**Maintenance corrective :**
1. Qualifier l'incident (front, API, base de données)
2. Consulter les logs
3. Redémarrer si nécessaire : `docker compose restart`
4. Appliquer correctif et redéployer

### 7.4 Architecture de Sécurité

Le fichier `proxy.ts` agit comme middleware de sécurité principal :

```typescript
// Couches de sécurité implémentées dans proxy.ts

// 1. Rate limiting — 10 tentatives max par IP / 15 min
if (isRateLimited(ip)) {
  return NextResponse.json({ error: "Trop de tentatives" }, { status: 429 });
}

// 2. Isolation admin — admin ne peut pas accéder au site public
if (token?.role === "administrateur" && !pathname.startsWith("/admin")) {
  return NextResponse.redirect(new URL("/admin", request.url));
}

// 3. Protection des routes admin — uniquement rôle administrateur
if (isAdminRoute(pathname) && token?.role !== "administrateur") {
  return NextResponse.redirect(new URL("/", request.url));
}

// 4. Headers de sécurité sur toutes les réponses
response.headers.set("X-Content-Type-Options", "nosniff");
response.headers.set("X-Frame-Options", "DENY");
response.headers.set("X-XSS-Protection", "1; mode=block");
response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
```

**Récapitulatif des mesures de sécurité :**

| Mesure | Implémentation |
|--------|----------------|
| Chiffrement HTTPS | Configuration serveur |
| Hashing mots de passe | bcrypt, coût 10 |
| Protection CSRF | NextAuth.js automatique |
| Anti SQL injection | Drizzle ORM (requêtes préparées) |
| Anti XSS | Sanitization des inputs, headers |
| Rate limiting | 10 tentatives / 15 min par IP |
| Isolation admin | Proxy middleware |
| Headers sécurité | X-Frame-Options, X-XSS-Protection, etc. |
| Validation | Zod côté client et serveur |
| CASCADE DELETE | Conformité RGPD (droit à l'oubli) |

---

## 8. Application web

**URL de l'application** : http://localhost:3333

**Dépôt Git** : [URL du dépôt]

L'application est déployée via une approche monolithique modulaire (Next.js App Router) qui gère à la fois le Server-Side Rendering (SSR) pour le SEO et les API Routes pour la logique métier.

**Modules livrés :**
- ✅ Comptes utilisateurs (Obligatoire)
- ✅ Informations / CMS (Obligatoire)
- ✅ Exercices de respiration (Au choix)
