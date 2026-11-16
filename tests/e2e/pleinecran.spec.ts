// Le plein écran automatique : chaque page y passe au premier toucher, sauf si « Plein écran » a été décoché à la main
import { test, expect, type Page } from '@playwright/test';
import { ouvrir } from './aide';

const PAGES = ['./?reset=1', './#exemple', 'parents/', 'infos/', 'decouvrir/', 'mot/#exemple', 'certificat/#exemple'];
// L'histoire attend son moteur ; les autres pages, leur chargement
const aller = (page: Page, p: string) => (p.startsWith('./') ? ouvrir(page, p) : page.goto(p).then(() => page.waitForLoadState('networkidle')));
const plein = (page: Page) => page.evaluate(() => !!document.fullscreenElement);

test('toutes les pages passent en plein écran au premier toucher', async ({ page }) => {
  for (const p of PAGES) {
    await aller(page, p);
    expect(await plein(page), p).toBe(false);
    await page.mouse.click(3, 300); // un toucher dans la marge, sans effet sur la page
    await expect.poll(() => plein(page), { message: p }).toBe(true);
  }
});

test('décoché dans les réglages : plus de plein écran automatique, sur aucune page, jusqu\'à ce qu\'on le recoche', async ({ page }) => {
  await ouvrir(page, './?reset=1');
  await page.mouse.click(3, 300);
  await expect.poll(() => plein(page)).toBe(true);
  await page.locator('#btn-prefs').click();
  await page.locator('#pref-plein').click();
  await expect.poll(() => plein(page)).toBe(false);
  for (const p of PAGES) {
    await aller(page, p);
    await page.mouse.click(3, 300);
    await page.waitForTimeout(300);
    expect(await plein(page), p).toBe(false);
  }
  // Recoché : le plein écran revient, et l'automatique aussi
  await ouvrir(page, './?reset=1');
  await page.locator('#btn-prefs').click();
  await page.locator('#pref-plein').click();
  await expect.poll(() => plein(page)).toBe(true);
  await aller(page, 'infos/');
  await page.mouse.click(3, 300);
  await expect.poll(() => plein(page)).toBe(true);
});
