#!/usr/bin/env npx tsx
/**
 * =============================================================================
 * CESIZen - Wrapper pour exécuter le seed (scripts/seed-run.ts)
 * =============================================================================
 * Ce script est le POINT D'ENTRÉE pour exécuter le seed.
 * Il importe la fonction `seed` de `lib/db/seed.ts` et l'exécute.
 *
 * Usage :
 *   npm run db:seed          # via package.json
 *   npx tsx scripts/seed-run.ts  # directement
 *
 * Pourquoi ce wrapper ?
 *   Le fichier `lib/db/seed.ts` exporte la fonction `seed` pour les tests.
 *   S'il contenait `seed().then(() => process.exit(0))` en bas, les tests
 *   Jest qui l'importent verraient le process.exit(0) et crasheraient.
 *   Ce wrapper sépare la fonction (réutilisable) de l'exécution (standalone).
 * =============================================================================
 */

import { seed } from '../lib/db/seed';

seed()
  .then(() => {
    console.log('✅ Seed terminé avec succès');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur lors du seed :', err);
    process.exit(1);
  });
