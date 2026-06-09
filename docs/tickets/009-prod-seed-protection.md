# Ticket #009 — Protection contre le passage des données de développement en production

## Informations

| Champ | Valeur |
|-------|--------|
| **Titre** | Bloquer le seed en production et séparer la fonction du script d'exécution |
| **Type** | Sécurité / Process |
| **Priorité** | 🔴 **Critique** |
| **Statut** | ✅ **Fermé** |
| **Créé le** | 2026-06-09 |

## Description

Le fichier `lib/db/seed.ts` était à la fois une **fonction exportable** (pour les tests) et un **script exécutable** (via `npx tsx lib/db/seed.ts`). Ce double rôle posait deux problèmes critiques :

1. **Risque de production** : Le seed était exécuté automatiquement dans le `entrypoint.sh` Docker, ce qui écrasait les données réelles des utilisateurs avec des données de développement (comptes demo, mots de passe connus).
2. **Crash des tests** : Le `process.exit(0)` en bas du fichier tuait le worker Jest dès que le test importait `seed.ts`.

## Problèmes identifiés

### 1. Seed automatique en production
Le `entrypoint.sh` contenait :
```bash
npx tsx lib/db/seed.ts
```
Ce qui injectait à chaque redémarrage du conteneur :
- `admin@cesizen.fr` avec `Admin1234!Secure`
- `marie@cesizen.fr` avec `User1234!Secure`
- 13 articles, 13 menu items, 6 exercices de respiration

### 2. Aucune barrière de protection
Le `seed.ts` ne vérifiait pas `NODE_ENV`. Il s'exécutait silencieusement même en production.

### 3. Script non séparable
La ligne `seed().then(() => process.exit(0))` en bas du fichier empêchait toute importation saine dans les tests.

## Actions réalisées

### 1. Protection du seed (`lib/db/seed.ts`)
- Ajout d'une vérification `NODE_ENV === 'production'` au début de la fonction `seed()`
- Si production : `throw new Error('SEED_PRODUCTION_BLOCKED')` avec message explicite
- Le seed est maintenant **interdit en production**

### 2. Suppression du seed automatique (`scripts/entrypoint.sh`)
- Suppression du bloc `npx tsx lib/db/seed.ts`
- Remplacé par un message d'avertissement : "Seed ignoré en production"
- Le conteneur Docker ne seed plus jamais automatiquement

### 3. Séparation fonction vs exécution
- **Fichier fonction** : `lib/db/seed.ts` — exporte `seed()`, réutilisable, sans `process.exit()`
- **Fichier script** : `scripts/seed-run.ts` — wrapper qui importe `seed()` et appelle `process.exit(0)`
- Cette séparation permet d'importer `seed.ts` dans les tests sans crash

### 4. Mise à jour de toutes les références
| Fichier | Avant | Après |
|---------|-------|-------|
| `package.json` | `npx tsx lib/db/seed.ts` | `npx tsx scripts/seed-run.ts` |
| `.github/workflows/ci.yml` | `npx tsx lib/db/seed.ts` | `npx tsx scripts/seed-run.ts` |
| `playwright.config.ts` | `npx tsx lib/db/seed.ts` | `npx tsx scripts/seed-run.ts` |
| `scripts/test-e2e-full.sh` | `npx tsx lib/db/seed.ts` | `npx tsx scripts/seed-run.ts` |
| `dev.sh` | `npx tsx lib/db/seed.ts` | `npx tsx scripts/seed-run.ts` |
| `docs/rapport.md` | `lib/db/seed.ts` | `scripts/seed-run.ts` |
| `docs/E2E-TESTING.md` | `lib/db/seed.ts` | `scripts/seed-run.ts` |

### 5. Tests de protection (`__tests__/seed-prod-guard.test.ts`)
- ✅ `seed()` bloque en production (`NODE_ENV === 'production'`)
- ✅ `seed()` autorise en développement (`NODE_ENV === 'development'`)
- ✅ `seed()` autorise en test (`NODE_ENV === 'test'`)
- ✅ `seed()` autorise si `NODE_ENV` est indéfini
- ✅ `entrypoint.sh` ne contient plus `npx tsx lib/db/seed.ts`
- ✅ `entrypoint.sh` contient un avertissement de sécurité

## Résultat

| Scénario | Avant | Après |
|----------|-------|-------|
| Conteneur redémarré en prod | Données écrasées | Seed ignoré, données préservées |
| Test importe `seed.ts` | Worker Jest tué | Importation saine |
| `npm run db:seed` | `lib/db/seed.ts` | `scripts/seed-run.ts` (même comportement) |
| CI E2E | `lib/db/seed.ts` | `scripts/seed-run.ts` (même comportement) |

## Critères d'acceptation

- [x] `seed.ts` bloque en production avec erreur claire
- [x] `entrypoint.sh` ne seed plus automatiquement
- [x] `seed.ts` importable dans les tests sans crash
- [x] `scripts/seed-run.ts` wrapper créé pour l'exécution standalone
- [x] Toutes les références mises à jour (package.json, CI, scripts, docs)
- [x] Tests unitaires passent (25/25 suites, 166+ tests)
- [x] Tests de protection seed-prod-guard passent

## Documentation

- `docs/rapport.md` : mise à jour de la section Seed
- `docs/E2E-TESTING.md` : mise à jour des commandes de seed
- `docs/definition-of-done.md` : ajout d'un critère "Le seed ne doit jamais s'exécuter en production"

---

*Ticket fermé le 2026-06-09*
*Résolution : Le seed est maintenant une fonction pure, le script wrapper est standalone, et la production est protégée.*
