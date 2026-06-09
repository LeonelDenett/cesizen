import { test, expect } from '@playwright/test';

/**
 * E2E : Parcours Connexion admin → Créer page → Publier → Vérifier Front-Office → Brouillon
 * Valide : Requirements 7.1, 7.2, 7.4, 6.2
 */

// Identifiants admin (doivent exister dans la BD via seed ou création préalable)
const ADMIN = {
  email: 'admin@cesizen.fr',
  password: 'Admin1234!Secure',
};

const PAGE_TITLE = `Page E2E ${Date.now()}`;
const PAGE_CONTENT = 'Contenu de test pour la page E2E de CMS.';

test.describe('CMS — Parcours complet', () => {
  test('Connexion admin → Créer page → Publier → Front-Office → Brouillon', async ({ page }) => {
    // ── 1. Connexion en tant qu'admin ──
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(ADMIN.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Attendre la redirection vers l'admin
    await page.waitForURL('/admin', { timeout: 10_000 });

    // ── 2. Naviguer vers la gestion des pages d'information ──
    await page.goto('/admin/info-pages');
    await expect(page.getByRole('heading', { name: "Pages d'information" })).toBeVisible({
      timeout: 10_000,
    });

    // ── 3. Créer une nouvelle page avec le statut "published" ──
    await page.getByRole('button', { name: 'Créer une page' }).click();
    await expect(page.getByRole('heading', { name: 'Nouvelle page' })).toBeVisible();

    await page.getByLabel('Titre').fill(PAGE_TITLE);
    await page.getByLabel('Contenu').fill(PAGE_CONTENT);
    await page.getByLabel('Statut').selectOption('published');
    await page.getByRole('button', { name: 'Créer' }).click();

    // Attendre que la page apparaisse dans la liste
    await expect(page.getByText(PAGE_TITLE)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Publié').first()).toBeVisible();

    // ── 4. Vérifier que la page apparaît dans le Front-Office ──
    // Générer le slug attendu (minuscules, espaces → tirets)
    const expectedSlug = PAGE_TITLE.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    await page.goto(`/info/${expectedSlug}`);
    await expect(page.getByText(PAGE_TITLE).or(page.getByText(PAGE_CONTENT))).toBeVisible({
      timeout: 10_000,
    });

    // ── 5. Changer la page en brouillon ──
    await page.goto('/admin/info-pages');
    await expect(page.getByText(PAGE_TITLE)).toBeVisible({ timeout: 10_000 });

    // Cliquer "Modifier" dans la ligne de la page créée
    const pageRow = page.getByText(PAGE_TITLE).locator('..');
    await pageRow.getByRole('button', { name: 'Modifier' }).or(
      page.getByRole('button', { name: 'Modifier' }).first()
    ).click();

    await expect(page.getByRole('heading', { name: 'Modifier la page' })).toBeVisible();
    await page.getByLabel('Statut').selectOption('draft');
    await page.getByRole('button', { name: 'Mettre à jour' }).click();

    // Vérifier que le statut a changé en "Brouillon"
    await expect(page.getByText('Brouillon').first()).toBeVisible({ timeout: 10_000 });

    // ── 6. Vérifier que la page n'est plus visible dans le Front-Office ──
    const response = await page.goto(`/info/${expectedSlug}`);
    // Devrait retourner 404 ou afficher page non trouvée
    const is404 = response?.status() === 404;
    const hasNotFoundText = await page.getByText('Page non trouvée')
      .or(page.getByText('404'))
      .or(page.getByText('not found'))
      .isVisible()
      .catch(() => false);

    expect(is404 || hasNotFoundText).toBeTruthy();
  });
});
