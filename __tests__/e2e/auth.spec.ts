import { test, expect } from '@playwright/test';

/**
 * E2E: Flujo Registro → Login → Perfil → Logout
 * Validates: Requirements 1.1, 2.1, 3.1, 2.2
 */

const TEST_USER = {
  name: 'Test Utilisateur',
  email: `e2e-auth-${Date.now()}@test.com`,
  password: 'TestPass1234',
};

test.describe('Authentification — Flujo completo', () => {
  test('Registro → Login → Perfil → Logout', async ({ page }) => {
    // ── 1. Registro ──
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();

    await page.getByLabel('Nom').fill(TEST_USER.name);
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirmer le mot de passe').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Créer un compte' }).click();

    // Esperar mensaje de éxito y enlace para conectarse
    await expect(page.getByText('Vous pouvez maintenant vous connecter')).toBeVisible({
      timeout: 10_000,
    });

    // ── 2. Login ──
    await page.getByRole('link', { name: 'Se connecter' }).click();
    await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();

    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Mot de passe').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Esperar redirección a la página principal (usuario normal → /)
    await page.waitForURL('/', { timeout: 10_000 });
    await expect(page.getByText('CESIZen')).toBeVisible();

    // ── 3. Perfil ──
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Mon profil' })).toBeVisible({
      timeout: 10_000,
    });

    // Verificar que los datos del usuario se muestran
    await expect(page.getByText(TEST_USER.name)).toBeVisible();
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
    await expect(page.getByText('Membre depuis')).toBeVisible();

    // ── 4. Logout ──
    await page.getByRole('button', { name: 'Déconnexion' }).click();

    // Verificar redirección a la página pública
    await page.waitForURL('/', { timeout: 10_000 });

    // Verificar que el botón de login aparece (usuario desconectado)
    await expect(page.getByRole('link', { name: 'Se connecter' })).toBeVisible();
  });

  test('Login con credenciales inválidas muestra error genérico', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('inexistant@test.com');
    await page.getByLabel('Mot de passe').fill('MauvaisMotDePasse1');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible({
      timeout: 10_000,
    });
  });
});
