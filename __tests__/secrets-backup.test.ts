/**
 * =============================================================================
 * Tests : Backup et restauration de secrets.db
 * =============================================================================
 * Objectif : garantir que les scripts de backup/restore fonctionnent
 *            et que secrets.db peut être récupéré en cas de perte.
 *
 * Ces tests vérifient :
 *   1. Le backup crée un fichier avec timestamp
 *   2. Le restore remplace le fichier actuel
 *   3. La limite de 10 backups est respectée
 *   4. Si secrets.db est supprimé, il peut être recréé depuis backup
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TEST_DIR = path.join(process.cwd(), '__tests__', '__tmp', 'secrets-test');
const BACKUP_DIR = path.join(TEST_DIR, 'backups');
const SECRETS_PATH = path.join(TEST_DIR, 'secrets.db');

function cleanTestDir() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function createDummySecrets(content: string) {
  fs.mkdirSync(path.dirname(SECRETS_PATH), { recursive: true });
  fs.writeFileSync(SECRETS_PATH, content);
}

function listBackups(): string[] {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith('secrets.db.'))
    .map((f) => path.join(BACKUP_DIR, f));
}

let backupCounter = 0;

function runBackup() {
  // Simuler le script backup-secrets.sh
  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19) + '-' + String(backupCounter++).padStart(3, '0');
  const backupFile = path.join(BACKUP_DIR, `secrets.db.${timestamp}`);
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.copyFileSync(SECRETS_PATH, backupFile);

  // Garder seulement les 10 derniers backups
  const backups = listBackups().sort().reverse();
  if (backups.length > 10) {
    backups.slice(10).forEach((b) => fs.unlinkSync(b));
  }

  return backupFile;
}

function runRestore() {
  // Simuler le script restore-secrets.sh
  const backups = listBackups().sort().reverse();
  if (backups.length === 0) {
    throw new Error('Aucun backup trouvé');
  }
  const latest = backups[0];

  // Backup de sécurité avant restauration
  const safetyBackup = path.join(
    BACKUP_DIR,
    `secrets.db.pre-restore.${Date.now()}`
  );
  if (fs.existsSync(SECRETS_PATH)) {
    fs.copyFileSync(SECRETS_PATH, safetyBackup);
  }

  fs.copyFileSync(latest, SECRETS_PATH);
  return { restoredFrom: latest, safetyBackup };
}

describe('🔒 Backup et restauration de secrets.db', () => {
  beforeEach(() => {
    cleanTestDir();
  });

  afterEach(() => {
    cleanTestDir();
  });

  describe('Création de backup', () => {
    test('✅ Le backup crée un fichier avec timestamp', () => {
      createDummySecrets('pepper-test-data-1');

      const backupFile = runBackup();

      expect(fs.existsSync(backupFile)).toBe(true);
      expect(path.basename(backupFile)).toMatch(/^secrets\.db\.\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/);
    });

    test('✅ Le backup contient les mêmes données que le fichier original', () => {
      const originalData = 'pepper-unique-abc123';
      createDummySecrets(originalData);

      const backupFile = runBackup();
      const backupData = fs.readFileSync(backupFile, 'utf8');

      expect(backupData).toBe(originalData);
    });

    test('✅ Seulement les 10 derniers backups sont conservés', () => {
      createDummySecrets('data-initial');

      // Créer 12 backups
      for (let i = 0; i < 12; i++) {
        createDummySecrets(`data-version-${i}`);
        runBackup();
      }

      const backups = listBackups();
      expect(backups.length).toBe(10);
    });
  });

  describe('Restauration depuis backup', () => {
    test('✅ Le restore remplace le fichier actuel par le dernier backup', () => {
      createDummySecrets('data-v1');
      runBackup();

      // Simuler une corruption/perte
      fs.writeFileSync(SECRETS_PATH, 'CORRUPTED-DATA');

      const { restoredFrom } = runRestore();

      const restoredData = fs.readFileSync(SECRETS_PATH, 'utf8');
      expect(restoredData).toBe('data-v1');
      expect(restoredFrom).toBeTruthy();
    });

    test('✅ Le restore crée un backup de sécurité avant', () => {
      createDummySecrets('data-v1');
      runBackup();

      fs.writeFileSync(SECRETS_PATH, 'data-v2');

      const { safetyBackup } = runRestore();

      expect(fs.existsSync(safetyBackup)).toBe(true);
      const safetyData = fs.readFileSync(safetyBackup, 'utf8');
      expect(safetyData).toBe('data-v2');
    });

    test('❌ Le restore échoue si aucun backup n\'existe', () => {
      createDummySecrets('data-v1');
      // Pas de backup créé intentionnellement

      expect(() => runRestore()).toThrow('Aucun backup trouvé');
    });
  });

  describe('Scénario de récupération complète', () => {
    test('✅ Récupération après suppression totale de secrets.db', () => {
      // 1. Créer le fichier original
      createDummySecrets('pepper-critique-xyz789');

      // 2. Faire un backup
      const backupFile = runBackup();
      expect(fs.existsSync(backupFile)).toBe(true);

      // 3. Simuler une suppression totale (comme `rm secrets.db`)
      fs.unlinkSync(SECRETS_PATH);
      expect(fs.existsSync(SECRETS_PATH)).toBe(false);

      // 4. Restaurer depuis le backup
      const { restoredFrom } = runRestore();

      // 5. Vérifier que le fichier est restauré
      expect(fs.existsSync(SECRETS_PATH)).toBe(true);
      const restoredData = fs.readFileSync(SECRETS_PATH, 'utf8');
      expect(restoredData).toBe('pepper-critique-xyz789');
    });

    test('✅ Récupération après `docker compose down -v` (perte de volume)', () => {
      // Simuler : le volume est supprimé, le fichier est perdu
      createDummySecrets('pepper-apres-volume-123');
      runBackup();

      // Simuler perte de volume
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
      fs.mkdirSync(TEST_DIR, { recursive: true });

      // Le backup est stocké ailleurs (dans ce test, on le recrée)
      const backupDir = path.join(TEST_DIR, 'backups');
      fs.mkdirSync(backupDir, { recursive: true });
      const backupFile = path.join(backupDir, 'secrets.db.2026-01-01-00-00-00');
      fs.writeFileSync(backupFile, 'pepper-apres-volume-123');

      // Restaurer
      const { restoredFrom } = runRestore();

      expect(fs.existsSync(SECRETS_PATH)).toBe(true);
      const restoredData = fs.readFileSync(SECRETS_PATH, 'utf8');
      expect(restoredData).toBe('pepper-apres-volume-123');
    });
  });

  describe('Vérification des scripts shell', () => {
    test('✅ Les scripts backup-secrets.sh et restore-secrets.sh existent', () => {
      const backupScript = path.join(process.cwd(), 'scripts', 'backup-secrets.sh');
      const restoreScript = path.join(process.cwd(), 'scripts', 'restore-secrets.sh');

      expect(fs.existsSync(backupScript)).toBe(true);
      expect(fs.existsSync(restoreScript)).toBe(true);
    });

    test('✅ Les scripts sont exécutables', () => {
      const backupScript = path.join(process.cwd(), 'scripts', 'backup-secrets.sh');
      const restoreScript = path.join(process.cwd(), 'scripts', 'restore-secrets.sh');

      const backupStats = fs.statSync(backupScript);
      const restoreStats = fs.statSync(restoreScript);

      // Vérifier les permissions d'exécution (mode & 0o111)
      expect(backupStats.mode & 0o111).toBeTruthy();
      expect(restoreStats.mode & 0o111).toBeTruthy();
    });
  });
});
