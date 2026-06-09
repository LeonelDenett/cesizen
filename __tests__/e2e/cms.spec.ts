import { test, expect } from '@playwright/test';

/**
 * E2E : Parcours CMS simplifié — Connexion admin → Créer page → Publier
 * Valide : Requirements 7.1, 7.2
 */

const ADMIN = {
  email: 'admin@cesizen.fr',
  password: 'Admin1234!Secure',
};

const PAGE_TITLE = `Page E2E ${Date.now()}`;

test.describe('CMS — Parcours complet', () => {
  test('Connexion admin → Créer page → Publier', async ({ page }) => {
    // ── 1. Connexion en tant qu'admin ──
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(ADMIN.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Attendre la redirection côté client (router.push('/admin'))
    await expect(page.getByRole('heading', { name: 'Dashboard' }).first()).toBeVisible({ timeout: 10_000 });

    // ── 2. Naviguer vers la gestion des pages ──
    await page.goto('/admin/info-pages');
    await expect(page.getByRole('heading', { name: 'Articles' }).first()).toBeVisible({
      timeout: 10_000,
    });

    // ── 3. Créer une nouvelle page ──
    await page.getByRole('button', { name: 'Nouvel article' }).click();
    await expect(page.getByRole('heading', { name: 'Nouvel article' }).first()).toBeVisible();

    await page.getByLabel('Titre').fill(PAGE_TITLE);
    await page.getByLabel('Contenu').fill('Contenu de test pour la page E2E de CMS.');
    await page.getByRole('button', { name: 'Créer' }).click();

    // Attendre que la page apparaisse dans la liste (statut par défaut = Brouillon)
    await expect(page.getByText(PAGE_TITLE)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Brouillon').first()).toBeVisible();

    // ── 4. Modifier la page pour la publier ──
    // Trouver la carte contenant le titre et cliquer sur "Modifier"
    const pageCard = page.locator('div.bg-white').filter({ hasText: PAGE_TITLE });
    await pageCard.getByRole('button', { name: 'Modifier' }).click();

    await expect(page.getByRole('heading', { name: /Modifier :/ })).toBeVisible();

    // Ouvrir le panneau "Statut & publication" et changer le statut
    await page.getByRole('button', { name: /Statut & publication/ }).click();
    await page.getByLabel('Statut').selectOption('published');
    await page.getByRole('button', { name: 'Mettre à jour' }).click();

    // Attendre que la liste se recharge
    await expect(page.getByRole('heading', { name: 'Articles' }).first()).toBeVisible({ timeout: 10_000 });

    // Vérifier que la page créée apparaît maintenant comme "Publié" dans la liste
    await expect(page.getByText(PAGE_TITLE).first()).toBeVisible({ timeout: 10_000 });
    // Trouver la carte de la page et vérifier le statut
    const publishedCard = page.locator('div.bg-white').filter({ hasText: PAGE_TITLE }).first();
    await expect(publishedCard.getByText('Publié').first()).toBeVisible({ timeout: 10_000 });
  });
});
