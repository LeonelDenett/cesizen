/**
 * =============================================================================
 * Tests : Protection contre le passage des données de développement en production
 * =============================================================================
 * Objectif : garantir que les données de développement (seed) ne sont jamais
 *            injectées en production, et que le conteneur Docker ne seed pas.
 *
 * Ces tests vérifient :
 *   1. Le seed se bloque si NODE_ENV === 'production'
 *   2. Le seed s'exécute normalement en développement
 *   3. Le entrypoint.sh ne contient plus de seed automatique
 * =============================================================================
 */

import { seed } from '../lib/db/seed';

describe('🔒 Protection données développement vs production', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('SEED (lib/db/seed.ts)', () => {
    test('❌ BLOQUE le seed si NODE_ENV === production', async () => {
      process.env.NODE_ENV = 'production';

      await expect(seed()).rejects.toThrow('SEED_PRODUCTION_BLOCKED');
    });

    test('✅ NE BLOQUE PAS le seed si NODE_ENV === development', async () => {
      process.env.NODE_ENV = 'development';

      try {
        await seed();
      } catch (error) {
        // Si le seed échoue, ce ne doit PAS être l'erreur de production
        expect((error as Error).message).not.toContain('SEED_PRODUCTION_BLOCKED');
      }
    }, 10000);

    test('✅ NE BLOQUE PAS le seed si NODE_ENV === test', async () => {
      process.env.NODE_ENV = 'test';

      try {
        await seed();
      } catch (error) {
        expect((error as Error).message).not.toContain('SEED_PRODUCTION_BLOCKED');
      }
    }, 10000);

    test('✅ NE BLOQUE PAS le seed si NODE_ENV est non défini', async () => {
      delete process.env.NODE_ENV;

      try {
        await seed();
      } catch (error) {
        expect((error as Error).message).not.toContain('SEED_PRODUCTION_BLOCKED');
      }
    }, 10000);
  });

  describe('ENTRYPOINT (scripts/entrypoint.sh)', () => {
    test('Le fichier entrypoint.sh ne contient plus de seed automatique', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const entrypointPath = path.join(process.cwd(), 'scripts', 'entrypoint.sh');
      const content = fs.readFileSync(entrypointPath, 'utf8');

      // Le seed automatisé ne doit plus être présent
      expect(content).not.toContain('npx tsx lib/db/seed.ts');
      expect(content).not.toContain('🌱 Exécution du seed');

      // Mais doit contenter un avertissement de sécurité
      expect(content).toContain('production');
      expect(content).toContain('protégé');
    });
  });
});
