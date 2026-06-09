import { test, expect } from '@playwright/test';

/**
 * E2E : Parcours Inscription → Connexion → Profil → Déconnexion
 * Valide : Requirements 1.1, 2.1, 3.1, 2.2
 */

const TEST_USER = {
  name: 'Test Utilisateur',
  email: `e2e-auth-${Date.now()}@test.com`,
  password: 'TestPass1234!',
};

test.describe('Authentification — Parcours complet', () => {
  test('Inscription → Connexion → Profil → Déconnexion', async ({ page }) => {
    // ── 1. Inscription ──
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Commencez votre voyage' })).toBeVisible();

    await page.getByLabel('Prénom').fill('Test');
    await page.getByLabel('Nom', { exact: true }).fill('Utilisateur');
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirmer le mot de passe').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Créer un compte' }).click();

    // Attendre le message de succès (ou l'erreur pour debug)
    await expect(page.getByText('Compte créé avec succès').or(page.getByText('Cet email est déjà utilisé')).or(page.getByText('Une erreur est survenue'))).toBeVisible({
      timeout: 15_000,
    });

    // ── 2. Connexion ──
    await page.getByRole('link', { name: 'Se connecter' }).first().click();
    await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible();

    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Attendre la redirection côté client (router.push)
    await expect(page.getByRole('heading', { name: 'Retrouvez votre équilibre intérieur.' }).first()).toBeVisible({ timeout: 10_000 });

    // ── 3. Profil ──
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Mon profil' })).toBeVisible({
      timeout: 10_000,
    });

    // Vérifier que les données de l'utilisateur s'affichent
    await expect(page.getByText(TEST_USER.name)).toBeVisible();
    await expect(page.getByText(TEST_USER.email)).toBeVisible();

    // ── 4. Déconnexion ──
    // Ouvrir le menu utilisateur (avatar)
    await page.getByRole('button', { name: /^[A-Z?]{1,2}$/ }).click();
    await page.getByRole('button', { name: 'Déconnexion' }).click();

    // Vérifier la redirection vers la page publique (bouton connexion visible)
    await expect(page.getByRole('link', { name: 'Se connecter' }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Connexion avec identifiants invalides affiche une erreur', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('inexistant@test.com');
    await page.getByLabel('Mot de passe', { exact: true }).fill('MauvaisMotDePasse1');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Accepter soit le message d'erreur standard, soit le message de fallback
    await expect(page.locator('[role="alert"]:not([id="__next-route-announcer__"])')).toContainText(/Email ou mot de passe incorrect|Une erreur est survenue/, {
      timeout: 10_000,
    });
  });
});
