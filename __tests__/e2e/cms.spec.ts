import { test, expect } from '@playwright/test';

/**
 * E2E: Flujo Login admin → Crear página → Publicar → Verificar Front-Office → Borrador
 * Validates: Requirements 7.1, 7.2, 7.4, 6.2
 */

// Credenciales admin (deben existir en la BD via seed o creación previa)
const ADMIN = {
  email: 'admin@cesizen.fr',
  password: 'Admin1234',
};

const PAGE_TITLE = `Page E2E ${Date.now()}`;
const PAGE_CONTENT = 'Contenu de test pour la page E2E de CMS.';

test.describe('CMS — Flujo completo', () => {
  test('Login admin → Crear página → Publicar → Front-Office → Borrador', async ({ page }) => {
    // ── 1. Login como admin ──
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Mot de passe').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Admin redirigido al Back-Office
    await page.waitForURL('/admin**', { timeout: 10_000 });

    // ── 2. Navegar a la gestión de páginas de información ──
    await page.goto('/admin/info-pages');
    await expect(page.getByRole('heading', { name: "Pages d'information" })).toBeVisible({
      timeout: 10_000,
    });

    // ── 3. Crear una nueva página con estado "published" ──
    await page.getByRole('button', { name: 'Créer une page' }).click();
    await expect(page.getByRole('heading', { name: 'Nouvelle page' })).toBeVisible();

    await page.getByLabel('Titre').fill(PAGE_TITLE);
    await page.getByLabel('Contenu').fill(PAGE_CONTENT);
    await page.getByLabel('Statut').selectOption('published');
    await page.getByRole('button', { name: 'Créer' }).click();

    // Esperar que la página aparezca en la lista
    await expect(page.getByText(PAGE_TITLE)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Publié').first()).toBeVisible();

    // ── 4. Verificar que la página aparece en el Front-Office ──
    // Generar el slug esperado (minúsculas, espacios → guiones)
    const expectedSlug = PAGE_TITLE.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    await page.goto(`/info/${expectedSlug}`);
    await expect(page.getByText(PAGE_TITLE).or(page.getByText(PAGE_CONTENT))).toBeVisible({
      timeout: 10_000,
    });

    // ── 5. Cambiar la página a borrador ──
    await page.goto('/admin/info-pages');
    await expect(page.getByText(PAGE_TITLE)).toBeVisible({ timeout: 10_000 });

    // Clicar "Modifier" en la fila de la página creada
    const pageRow = page.getByText(PAGE_TITLE).locator('..');
    await pageRow.getByRole('button', { name: 'Modifier' }).or(
      page.getByRole('button', { name: 'Modifier' }).first()
    ).click();

    await expect(page.getByRole('heading', { name: 'Modifier la page' })).toBeVisible();
    await page.getByLabel('Statut').selectOption('draft');
    await page.getByRole('button', { name: 'Mettre à jour' }).click();

    // Verificar que el estado cambió a "Brouillon"
    await expect(page.getByText('Brouillon').first()).toBeVisible({ timeout: 10_000 });

    // ── 6. Verificar que la página ya no es visible en el Front-Office ──
    const response = await page.goto(`/info/${expectedSlug}`);
    // Debería retornar 404 o mostrar página no encontrada
    const is404 = response?.status() === 404;
    const hasNotFoundText = await page.getByText('Page non trouvée')
      .or(page.getByText('404'))
      .or(page.getByText('not found'))
      .isVisible()
      .catch(() => false);

    expect(is404 || hasNotFoundText).toBeTruthy();
  });
});
