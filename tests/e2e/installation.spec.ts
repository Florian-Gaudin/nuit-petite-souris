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
    await expect(page.locator('.installer')).toContainText("passez par Chrome");
    await expect(page.locator('.installer')).not.toContainText('sécurisée');
    const lien = await page.locator('.installer a', { hasText: 'Ouvrir dans Chrome' }).getAttribute('href');
    expect(lien).toMatch(/^intent:\/\/.+\/parents\/\?installer#Intent;scheme=https;package=com\.android\.chrome;/);
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

test("Chrome sur Android : toujours un bouton, l'explication seulement après le clic", async ({ page }) => {
  await espaceParents(page);
  const bouton = page.locator('.installer button', { hasText: "Installer l'appli" });
  await expect(bouton).toBeVisible();
  await expect(page.locator('.installer')).not.toContainText('menu');
  // Chrome ne propose pas l'installation (déjà installée, ou refusée récemment) : l'explication vient après le clic
  await bouton.click();
  await expect(page.locator('.installer .secours')).toContainText("Ajouter à l'écran d'accueil");
});

test("dans le navigateur : l'aide reste proposée ; lancée depuis l'icône : appli reconnue", async ({ page }) => {
  // Dans le navigateur (même passé en plein écran par l'histoire), l'appli n'est pas « installée »
  await espaceParents(page);
  await expect(page.locator('.installer')).not.toContainText('déjà installée');
  // Lancée depuis l'icône (adresse de démarrage du manifeste) : reconnue pour toute la visite
  await page.goto('./?source=appli#exemple');
  await page.waitForFunction(() => !!(window as any).APP);
  expect(new URL(page.url()).search).toBe('');
  await page.goto('parents/');
  await expect(page.locator('.installer')).toContainText('déjà installée');
});

test("le message « C'est fait » attend la vraie installation", async ({ page }) => {
  await espaceParents(page);
  // Une invitation d'installation simulée : la fenêtre du navigateur est acceptée…
  await page.evaluate(() => {
    const e: any = new Event('beforeinstallprompt', { cancelable: true });
    e.prompt = async () => {}; e.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(e);
  });
  await page.locator('.installer button', { hasText: "Installer l'appli" }).click();
  // … mais tant que le navigateur n'a pas confirmé, pas de message
  await expect(page.locator('.installer .ok')).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.locator('.installer .ok')).toContainText("C'est fait");
});

test("« Ouvrir dans Chrome » mène à la page d'installation, sans le verrou", async ({ page }) => {
  await page.goto('parents/?installer');
  await expect(page.locator('.installer')).toBeVisible();
  await expect(page.locator('.tenir')).toHaveCount(0);
  await page.evaluate(() => {
    const e: any = new Event('beforeinstallprompt', { cancelable: true });
    e.prompt = async () => {}; e.userChoice = Promise.resolve({ outcome: 'dismissed' });
    window.dispatchEvent(e);
  });
  await expect(page.locator('.installer button', { hasText: "Installer l'appli" })).toBeVisible();
});

test.describe('Samsung Internet, invitation reçue', () => {
  test.use({ userAgent: SAMSUNG });
  test("pas de bouton « Installer l'appli », seulement Chrome", async ({ page }) => {
    await espaceParents(page);
    await page.evaluate(() => {
      const e: any = new Event('beforeinstallprompt', { cancelable: true });
      e.prompt = async () => {}; e.userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(e);
    });
    await expect(page.locator('.installer a', { hasText: 'Ouvrir dans Chrome' })).toBeVisible();
    await expect(page.locator('.installer button')).toHaveCount(0);
    expect(await page.locator('.installer a', { hasText: 'Ouvrir dans Chrome' }).getAttribute('href')).toContain('/parents/?installer#Intent');
  });
});
