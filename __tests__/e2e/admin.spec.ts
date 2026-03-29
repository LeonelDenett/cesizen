import { test, expect } from '@playwright/test';

/**
 * E2E: Flujo Login admin → Listar usuarios → Crear → Desactivar → Eliminar
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */

const ADMIN = {
  email: 'admin@cesizen.fr',
  password: 'Admin1234',
};

const NEW_USER = {
  name: `User E2E ${Date.now()}`,
  email: `e2e-admin-${Date.now()}@test.com`,
  password: 'UserTest1234',
};

test.describe('Administration des utilisateurs — Flujo completo', () => {
  test('Login admin → Listar → Crear → Desactivar → Eliminar', async ({ page }) => {
    // ── 1. Login como admin ──
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Mot de passe').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('/admin**', { timeout: 10_000 });

    // ── 2. Navegar a la gestión de usuarios ──
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: 'Utilisateurs' })).toBeVisible({
      timeout: 10_000,
    });

    // Verificar que la lista de usuarios se muestra (tabla o cards)
    await expect(
      page.getByText('Nom').or(page.getByText(ADMIN.email))
    ).toBeVisible({ timeout: 10_000 });

    // ── 3. Crear un nuevo usuario ──
    await page.getByRole('button', { name: 'Créer un utilisateur' }).click();
    await expect(page.getByRole('heading', { name: 'Nouveau utilisateur' })).toBeVisible();

    await page.getByLabel('Nom').fill(NEW_USER.name);
    await page.getByLabel('Email').fill(NEW_USER.email);
    await page.getByLabel('Rôle').selectOption('utilisateur');
    await page.getByLabel('Mot de passe').fill(NEW_USER.password);
    await page.getByRole('button', { name: 'Créer' }).click();

    // Verificar que el usuario aparece en la lista
    await expect(page.getByText(NEW_USER.name)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(NEW_USER.email)).toBeVisible();

    // ── 4. Desactivar el usuario ──
    // Encontrar la fila/card del usuario creado y clicar "Désactiver"
    const userRow = page.getByText(NEW_USER.email).locator('..');
    await userRow.getByRole('button', { name: 'Désactiver' }).or(
      page.getByRole('button', { name: 'Désactiver' }).last()
    ).click();

    // Verificar que el estado cambió a "Inactif"
    await expect(page.getByText('Inactif')).toBeVisible({ timeout: 10_000 });

    // ── 5. Eliminar el usuario con confirmación ──
    // Clicar "Supprimer" para mostrar la confirmación
    const userRowAfter = page.getByText(NEW_USER.email).locator('..');
    await userRowAfter.getByRole('button', { name: 'Supprimer' }).or(
      page.getByRole('button', { name: 'Supprimer' }).last()
    ).click();

    // Confirmar la eliminación
    await expect(page.getByText('Confirmer ?')).toBeVisible();
    await page.getByRole('button', { name: 'Oui' }).click();

    // Verificar que el usuario desaparece de la lista
    await expect(page.getByText(NEW_USER.email)).not.toBeVisible({ timeout: 10_000 });
  });
});
