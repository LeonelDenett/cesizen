import { defineConfig, devices } from '@playwright/test';

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
  // En local, le serveur doit être lancé manuellement avec la base locale
  // docker compose -f docker-compose.e2e.yml up -d
  // npm run dev (avec DATABASE_URL local)
  webServer: process.env.CI ? {
    command: 'npm run build && npx drizzle-kit migrate && npx tsx scripts/seed-run.ts && node .next/standalone/server.js',
    url: 'http://localhost:3000',
    timeout: 180_000,
  } : undefined,
});
