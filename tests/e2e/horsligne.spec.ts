// Hors connexion : après une première visite, l'histoire et l'espace parents s'ouvrent sans réseau
import { test, expect } from '@playwright/test';
import { LEO, code, ouvrir, bandeau } from './aide';

test('l\'histoire fonctionne au réveil, même sans réseau', async ({ page, context }) => {
  await ouvrir(page, '#p=' + code(LEO));
  // Le service worker s'installe et garde tout le site en mémoire
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.waitForFunction(async () => {
    const cles = await caches.keys();
    for (const k of cles) if ((await (await caches.open(k)).keys()).length > 30) return true;
    return false;
  });
  await context.setOffline(true);
  // Le QR scanné au réveil, sans réseau
  await ouvrir(page, '#p=' + code(LEO));
  await expect(bandeau(page)).toContainText('Coucou Léo');
  await page.goto('certificat/#p=' + code(LEO));
  await expect(page.locator('.dip-nom')).toHaveText('Léo');
  await page.goto('parents/');
  await expect(page.locator('.tenir, form.carte').first()).toBeVisible();
  await context.setOffline(false);
});
