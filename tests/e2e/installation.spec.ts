// L'aide à l'installation de l'appli, selon l'appareil (espace parents)
import { test, expect, type Page } from '@playwright/test';

const SAMSUNG = 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

async function espaceParents(page: Page) {
  await page.goto('parents/');
  await page.evaluate(() => sessionStorage.setItem('souris.parents', '1'));
  await page.reload();
  await expect(page.locator('.installer')).toBeVisible();
}

test.describe('Samsung Internet', () => {
  test.use({ userAgent: SAMSUNG });
  test('conseille Chrome, avec un lien qui l\'ouvre', async ({ page }) => {
    await espaceParents(page);
    await expect(page.locator('.installer .attention')).toContainText('Appli non sécurisée bloquée');
    const lien = await page.locator('.installer a', { hasText: 'Ouvrir dans Chrome' }).getAttribute('href');
    expect(lien).toMatch(/^intent:\/\/.+;package=com\.android\.chrome;/);
  });
});

test.describe('iPad', () => {
  test.use({ userAgent: IPAD });
  test('les gestes de Safari', async ({ page }) => {
    await espaceParents(page);
    await expect(page.locator('.installer ol')).toContainText("Sur l'écran d'accueil");
    await expect(page.locator('.installer .attention')).toHaveCount(0);
  });
});

test('Chrome sur Android : pas d\'avertissement', async ({ page }) => {
  await espaceParents(page);
  await expect(page.locator('.installer .attention')).toHaveCount(0);
  await expect(page.locator('.installer')).toContainText('Ajouter à l\'écran d\'accueil');
});
