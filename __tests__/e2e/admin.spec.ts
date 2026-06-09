import { test, expect } from '@playwright/test';

/**
 * E2E : Parcours Connexion admin → Lister utilisateurs → Créer → Désactiver → Supprimer
 * Valide : Requirements 5.1, 5.2, 5.3, 5.4
 */

const ADMIN = {
  email: 'admin@cesizen.fr',
  password: 'Admin1234!Secure',
};

const NEW_USER = {
  name: `User E2E ${Date.now()}`,
  email: `e2e-admin-${Date.now()}@test.com`,
  password: 'UserTest1234!',
};

test.describe('Administration des utilisateurs — Parcours complet', () => {
  test('Connexion admin → Lister → Créer → Désactiver → Supprimer', async ({ page }) => {
    // ── 1. Connexion en tant qu'admin ──
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(ADMIN.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Attendre la redirection vers l'admin (le login fait router.push('/admin'))
    await page.waitForURL('/admin', { timeout: 10_000 });

    // ── 2. Naviguer vers la gestion des utilisateurs ──
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: 'Utilisateurs' })).toBeVisible({
      timeout: 10_000,
    });

    // Vérifier que la liste des utilisateurs s'affiche (tableau ou cards)
    await expect(
      page.getByText('Nom').or(page.getByText(ADMIN.email))
    ).toBeVisible({ timeout: 10_000 });

    // ── 3. Créer un nouvel utilisateur ──
    await page.getByRole('button', { name: 'Créer un utilisateur' }).click();
    await expect(page.getByRole('heading', { name: 'Nouveau utilisateur' })).toBeVisible();

    await page.getByLabel('Nom').fill(NEW_USER.name);
    await page.getByLabel('Email').fill(NEW_USER.email);
    await page.getByLabel('Rôle').selectOption('utilisateur');
    await page.getByLabel('Mot de passe').fill(NEW_USER.password);
    await page.getByRole('button', { name: 'Créer' }).click();

    // Vérifier que l'utilisateur apparaît dans la liste
    await expect(page.getByText(NEW_USER.name)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(NEW_USER.email)).toBeVisible();

    // ── 4. Désactiver l'utilisateur ──
    // Trouver la ligne/card de l'utilisateur créé et cliquer "Désactiver"
    const userRow = page.getByText(NEW_USER.email).locator('..');
    await userRow.getByRole('button', { name: 'Désactiver' }).or(
      page.getByRole('button', { name: 'Désactiver' }).last()
    ).click();

    // Vérifier que le statut a changé en "Inactif"
    await expect(page.getByText('Inactif')).toBeVisible({ timeout: 10_000 });

    // ── 5. Supprimer l'utilisateur avec confirmation ──
    // Cliquer "Supprimer" pour afficher la confirmation
    const userRowAfter = page.getByText(NEW_USER.email).locator('..');
    await userRowAfter.getByRole('button', { name: 'Supprimer' }).or(
      page.getByRole('button', { name: 'Supprimer' }).last()
    ).click();

    // Confirmer la suppression
    await expect(page.getByText('Confirmer ?')).toBeVisible();
    await page.getByRole('button', { name: 'Oui' }).click();

    // Vérifier que l'utilisateur disparaît de la liste
    await expect(page.getByText(NEW_USER.email)).not.toBeVisible({ timeout: 10_000 });
  });
});
