// Les clins d'œil ardennais : secrets à la feuille de chêne, badge « Ardennais d'honneur », diplôme
import { test, expect, type Page } from '@playwright/test';
import { ouvrir } from './aide';

const CAPTURES = process.env.CAPTURES;
const SECRETS: [number, string][] = [[1, 'sanglier'], [2, 'plaque'], [2, 'plume'], [3, 'sedan'], [3, 'ardoises'], [3, 'cabaret']];

async function toucherSecret(page: Page, scene: number, id: string) {
  await ouvrir(page, `?chapitre=1&scene=${scene}#exemple`);
  const g = page.locator(`.tap.ardennais[data-el="${id}"]`);
  await expect(g).toHaveCount(1);
  await expect(g.locator('.indice.feuille')).toHaveCount(1);
  await g.focus(); await page.keyboard.press('Enter'); // au clavier
  await expect(page.locator('#bandeau-texte')).not.toBeEmpty();
}

test('les six secrets des Ardennes : compteur, bulle, puis le badge', async ({ page }) => {
  test.setTimeout(120000);
  await ouvrir(page, '?reset=1#exemple');
  for (const [n, id] of SECRETS) {
    await toucherSecret(page, n, id);
    if (CAPTURES) await page.screenshot({ path: CAPTURES + '/ard-' + id + '.png' });
  }
  const st = await page.evaluate(() => (window as any).APP.state);
  expect(st.ardennes.length).toBe(6);
  await expect.poll(() => page.evaluate(() => (window as any).APP.state.badges)).toContain('ardennais');
  // Les étoiles ne changent pas : toujours deux secrets étoilés par image
  await ouvrir(page, '?chapitre=1&scene=3#exemple');
  await expect(page.locator('#secrets-n')).toHaveText('0/2');
  await expect(page.locator('#ardennes-n')).toHaveText('3/3');
});

test('le diplôme : sanglier dans le tampon, fait au château de Quenotte, badge accordé', async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await page.evaluate(() => { const A = (window as any).APP; A.state.unlocked = 5; A.state.fini = true; A.show(5, { diplome: true }); });
  await expect(page.locator('.dip-date')).toContainText('Fait au château de Quenotte');
  await expect(page.locator('.badge-dip', { hasText: "Ardennaise d'honneur" })).toHaveCount(1); // Clémentine
  await expect(page.locator('.dip-compte')).toContainText('/13');
  if (CAPTURES) await page.locator('.dip-pied').screenshot({ path: CAPTURES + '/ard-diplome.png' });
});

test("le terrier : les quatre trésors des Ardennes, dans la barre et au fond des impasses", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await page.evaluate(() => { const A = (window as any).APP; A.state.fini = true; A.state.unlocked = 5; A.show(5); });
  await page.locator('#btn-passer').click();
  await expect(page.locator('svg.terrier')).toBeVisible();
  const ids = await page.locator('.tresor').evaluateAll(l => l.map(e => (e as HTMLElement).dataset.id));
  expect(ids).toEqual(['ardoise', 'fer', 'pantin', 'plume']);
  await expect(page.locator('.surprise')).toHaveCount(4);
});
