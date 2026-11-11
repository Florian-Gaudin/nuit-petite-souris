// Tests de bout en bout (navigateur réel, format téléphone).
// En local : le Chrome installé sur l'ordinateur. Sur GitHub : le Chromium de Playwright.
import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 240_000,
  expect: { timeout: 15_000 },
  workers: CI ? 2 : 3,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['list']] : 'list',
  use: {
    ...devices['Pixel 7'],
    baseURL: 'http://localhost:4173/',
    channel: CI ? undefined : 'chrome',
    // Mouvement réduit : le texte s'affiche d'un coup et les animations sont courtes (tests rapides)
    reducedMotion: 'reduce',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !CI,
    timeout: 180_000,
  },
});
