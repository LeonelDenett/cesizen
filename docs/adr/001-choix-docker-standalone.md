# ADR 001 — Choix du mode standalone Docker pour Next.js

## Contexte

Le projet CESIZen doit être déployé dans un environnement conteneurisé (Docker) avec une base de données PostgreSQL.

Next.js offre plusieurs stratégies de build pour le déploiement :
- **Mode classique** : nécessite un serveur Node.js + le dossier `node_modules` complet (image lourde).
- **Mode standalone** (`output: 'standalone'` dans `next.config.ts`) : génère un dossier `.next/standalone` avec uniquement les fichiers nécessaires au runtime, plus léger et plus rapide à démarrer.

## Décision

Adoption du **mode standalone** de Next.js combiné à un **Dockerfile multi-étapes**.

## Justification

| Critère | Mode classique | Mode standalone |
|---------|---------------|-----------------|
| Taille image | ~600–800 Mo | ~250–350 Mo |
| Surface d'attaque | Grande (node_modules complet) | Réduite (artefacts minimaux) |
| Temps de démarrage | Lent (npm install implicite) | Rapide (serveur.js natif) |
| Complexité Dockerfile | Moyenne | Maîtrisée via multi-étapes |

Le mode standalone permet de :
1. **Réduire la taille de l'image Docker** de ~60 %.
2. **Supprimer la dépendance à `node_modules`** en production (seul `server.js` et les assets statiques sont copiés).
3. **Accélérer le CI/CD** grâce à des builds et des pushes d'image plus rapides.
4. **Durcir la sécurité** : moins de fichiers dans l'image = moins de vulnérabilités potentielles.

## Conséquences

- Le fichier `next.config.ts` doit exporter `output: "standalone"`.
- Le `Dockerfile` doit copier `.next/standalone`, `.next/static` et `public` dans l'image finale.
- Les migrations et le seed ne sont pas inclus dans le build standalone : ils sont gérés par le script `scripts/entrypoint.sh` au démarrage du conteneur.

## Alternatives envisagées

- **Image Node.js classique avec `npm start`** : rejetée car image trop lourde et temps de démarrage plus long.
- **Export statique (`output: 'export'`)** : rejetée car l'application nécessite des API routes (authentification, base de données) qui ne peuvent pas être statiques.

## Statut

✅ Accepté — Implémenté dans le `Dockerfile` et le `next.config.ts`.

---
*Architecture Decision Record — CESIZen — Juin 2026*
