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

    // Attendre le message de succès
    await expect(page.getByText('Compte créé avec succès')).toBeVisible({
      timeout: 10_000,
    });

    // ── 2. Connexion ──
    await page.getByRole('link', { name: 'Se connecter' }).first().click();
    await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible();

    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Attendre la redirection vers la page d'accueil (utilisateur normal → /)
    await page.waitForURL('/', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Votre compagnon bien-être' }).first()).toBeVisible();

    // ── 3. Profil ──
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Mon profil' })).toBeVisible({
      timeout: 10_000,
    });

    // Vérifier que les données de l'utilisateur s'affichent
    await expect(page.getByText(TEST_USER.name)).toBeVisible();
    await expect(page.getByText(TEST_USER.email)).toBeVisible();

    // ── 4. Déconnexion ──
    await page.getByRole('button', { name: 'Déconnexion' }).click();

    // Vérifier la redirection vers la page publique
    await page.waitForURL('/', { timeout: 10_000 });

    // Vérifier que le bouton de connexion apparaît (utilisateur déconnecté)
    await expect(page.getByRole('link', { name: 'Se connecter' }).first()).toBeVisible();
  });

  test('Connexion avec identifiants invalides affiche une erreur générique', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('inexistant@test.com');
    await page.getByLabel('Mot de passe', { exact: true }).fill('MauvaisMotDePasse1');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible({
      timeout: 10_000,
    });
  });
});
