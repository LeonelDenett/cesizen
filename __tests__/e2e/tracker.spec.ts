import { test, expect } from '@playwright/test';

/**
 * E2E: Flujo Login → Agregar emoción → Ver journal → Editar → Eliminar → Ver reporte
 * Validates: Requirements 8.1, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 11.1
 */

const USER = {
  email: `e2e-tracker-${Date.now()}@test.com`,
  password: 'TrackerTest1',
  name: 'Tracker User',
};

test.describe('Tracker d\'émotions — Flujo completo', () => {
  test.beforeAll(async ({ browser }) => {
    // Registrar usuario de prueba
    const page = await browser.newPage();
    await page.goto('/register');
    await page.getByLabel('Nom').fill(USER.name);
    await page.getByLabel('Email').fill(USER.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(USER.password);
    await page.getByLabel('Confirmer le mot de passe').fill(USER.password);
    await page.getByRole('button', { name: 'Créer un compte' }).click();
    await expect(page.getByText('Vous pouvez maintenant vous connecter')).toBeVisible({
      timeout: 10_000,
    });
    await page.close();
  });

  test('Login → Agregar emoción → Journal → Editar → Eliminar → Reporte', async ({ page }) => {
    // ── 1. Login ──
    await page.goto('/login');
    await page.getByLabel('Email').fill(USER.email);
    await page.getByLabel('Mot de passe').fill(USER.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('/', { timeout: 10_000 });

    // ── 2. Agregar nueva entrada de emoción ──
    await page.goto('/tracker/new');
    await expect(page.getByRole('heading', { name: 'Nouvelle entrée' })).toBeVisible({
      timeout: 10_000,
    });

    // Seleccionar Émotion Niveau 1
    await page.getByLabel('Émotion Niveau 1').selectOption({ index: 1 });

    // Esperar que Niveau 2 se habilite y seleccionar
    await expect(page.getByLabel('Émotion Niveau 2')).toBeEnabled();
    await page.getByLabel('Émotion Niveau 2').selectOption({ index: 1 });

    // Rellenar fecha y nota
    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel('Date').fill(today);
    await page.getByLabel('Note').fill('Entrée de test E2E');

    // Enviar formulario
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    // Esperar redirección al journal
    await page.waitForURL('/tracker', { timeout: 10_000 });

    // ── 3. Verificar que la entrada aparece en el journal ──
    await expect(page.getByRole('heading', { name: 'Journal de bord' })).toBeVisible();
    await expect(page.getByText('Entrée de test E2E')).toBeVisible();

    // ── 4. Editar la entrada ──
    await page.getByRole('link', { name: 'Modifier' }).first().click();
    await expect(page.getByRole('heading', { name: "Modifier l'entrée" })).toBeVisible({
      timeout: 10_000,
    });

    // Cambiar la nota
    await page.getByLabel('Note').fill('Note modifiée E2E');
    await page.getByRole('button', { name: 'Modifier' }).click();

    // Esperar redirección al journal
    await page.waitForURL('/tracker', { timeout: 10_000 });
    await expect(page.getByText('Note modifiée E2E')).toBeVisible();

    // ── 5. Eliminar la entrada con confirmación ──
    // Playwright intercepta el dialog confirm()
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Supprimer' }).first().click();

    // Verificar que la entrada desaparece
    await expect(page.getByText('Note modifiée E2E')).not.toBeVisible({ timeout: 10_000 });

    // ── 6. Ver reporte ──
    await page.goto('/tracker/report');
    await expect(page.getByRole('heading', { name: "Rapport d'émotions" })).toBeVisible({
      timeout: 10_000,
    });

    // Seleccionar un período
    await page.getByRole('button', { name: 'Mois' }).click();

    // El reporte debería cargarse (puede mostrar "Aucune donnée" si la entrada fue eliminada)
    await expect(
      page.getByText('Distribution des émotions').or(
        page.getByText('Aucune donnée disponible pour cette période')
      )
    ).toBeVisible({ timeout: 10_000 });
  });
});
