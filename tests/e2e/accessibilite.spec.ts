// Accessibilité : audit automatique axe-core (règles WCAG 2.1 A et AA, la base du RGAA 4.1) sur chaque écran
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ouvrir } from './aide';

// L'histoire bloque encore le zoom à deux doigts (pour les jeux tactiles) : seul écart connu, signalé à part
const ECART_HISTOIRE = ['meta-viewport'];

async function audit(page: Page, nom: string, ignorer: string[] = []) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.filter(v => !ignorer.includes(v.id))
    .map(v => `${nom} · ${v.impact} · ${v.id} : ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
}

test('audit WCAG 2.1 AA : tous les écrans', async ({ page }) => {
  test.setTimeout(180000);
  const pb: string[] = [];
  await ouvrir(page, '?reset=1'); pb.push(...await audit(page, 'accueil', ECART_HISTOIRE));
  await ouvrir(page, '#exemple'); pb.push(...await audit(page, 'chapitre 0', ECART_HISTOIRE));
  for (const n of [1, 2, 3, 4]) { await ouvrir(page, `?chapitre=${n}#exemple`); pb.push(...await audit(page, 'chapitre ' + n, ECART_HISTOIRE)); }
  for (const p of ['parents/', 'mot/#exemple', 'certificat/#exemple', 'infos/']) {
    await page.goto(p); await page.waitForTimeout(800); pb.push(...await audit(page, p));
  }
  expect(pb, pb.join('\n')).toEqual([]);
});

test('la page Informations : depuis l\'accueil et les réglages', async ({ page }) => {
  await ouvrir(page, '?reset=1');
  await page.locator('.lien-infos').click();
  await expect(page.locator('h1')).toHaveText('Informations');
  await expect(page.locator('#confidentialite')).toContainText('Aucune donnée personnelle');
  await expect(page.locator('#mentions')).toContainText('GitHub, Inc.');
  await ouvrir(page, '#exemple');
  await page.locator('#btn-prefs').click();
  await page.locator('#pref-infos').click();
  await expect(page.locator('#accessibilite h2')).toHaveText('Accessibilité');
});
