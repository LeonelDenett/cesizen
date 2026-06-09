import { defineConfig, devices } from '@playwright/test';

// Load test environment variables for E2E
process.env.DATABASE_URL = 'postgresql://postgres:changeme@localhost:5477/cesizen';
process.env.NEXTAUTH_SECRET = 'cesizen-test-secret-key-2026';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.SECRETS_DB_PATH = './secrets.db';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'docker compose up db -d && sleep 5 && npx drizzle-kit migrate && npx tsx lib/db/seed.ts && DATABASE_URL=postgresql://postgres:changeme@localhost:5477/cesizen NEXTAUTH_SECRET=cesizen-test-secret-key-2026 NEXTAUTH_URL=http://localhost:3000 SECRETS_DB_PATH=./secrets.db npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
