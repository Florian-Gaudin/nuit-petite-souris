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
  await expect(page.locator('.dip-date')).toContainText('Fait au château fort de Sedan');
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

async function diplome(page: Page, secret = false) {
  await ouvrir(page, '?reset=1#exemple');
  await page.evaluate(s => { const A = (window as any).APP; A.state.unlocked = 5; A.state.fini = true; A.state.secret = s; A.show(5, { diplome: true }); }, secret);
}

test('le carnet des Ardennes : depuis le diplôme et le menu, cartes, poème, livre au clavier', async ({ page }) => {
  test.setTimeout(120000);
  await diplome(page);
  await page.locator('#btn-carnet5').click();
  await expect(page.locator('.carnet h2')).toContainText('Le carnet des Ardennes');
  await expect(page.locator('.carte-ard')).toHaveCount(10);
  if (CAPTURES) await page.screenshot({ path: CAPTURES + '/carnet-grille.png' });
  await page.locator('.carte-ard', { hasText: 'Rimbaud' }).click();
  await expect(page.locator('.carte-poeme')).toContainText('Par les soirs bleus');
  if (CAPTURES) await page.screenshot({ path: CAPTURES + '/carnet-rimbaud.png' });
  await page.locator('[data-a="grille"]').click();
  await page.locator('.carte-ard', { hasText: 'légende' }).click();
  await page.locator('[data-a="livre"]').click();
  await expect(page.locator('.carnet-chemin')).toContainText('Page 1 sur 15');
  for (let p = 2; p <= 15; p++) {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.carnet-chemin')).toContainText(`Page ${p} sur 15`);
    if (CAPTURES && [2, 4, 7, 13, 14].includes(p)) await page.locator('.livre-vignette').screenshot({ path: CAPTURES + `/livre-${p}.png` });
  }
  await expect(page.locator('.livre-texte')).toContainText('encore cachée'); // la treizième scène, pas encore trouvée
  await page.keyboard.press('Escape');
  await expect(page.locator('.carnet')).toHaveCount(0);
  // Le menu des réglages, une fois l'histoire terminée
  await page.locator('#btn-prefs').click();
  await page.locator('#pref-carnet').click();
  await expect(page.locator('.carnet')).toBeVisible();
});

test("le livre : la treizième page s'ouvre quand la scène secrète a été trouvée", async ({ page }) => {
  await diplome(page, true);
  await page.locator('#btn-carnet5').click();
  await page.locator('.carte-ard', { hasText: 'légende' }).click();
  await page.locator('[data-a="livre"]').click();
  for (let p = 2; p <= 15; p++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.livre-texte')).toContainText('sauf toi, Clémentine');
});

test('le livre ancien : lettrine, et la page se tourne en la faisant glisser', async ({ page }) => {
  await diplome(page);
  await page.locator('#btn-carnet5').click();
  await page.locator('.carte-ard', { hasText: 'légende' }).click();
  await page.locator('[data-a="livre"]').click();
  await expect(page.locator('.livre-ancien .lettrine')).toHaveText('V'); // « Voici l'histoire… »
  await expect(page.locator('.livre-texte p').first()).toContainText("Voici l'histoire"); // texte complet pour les lecteurs d'écran
  if (CAPTURES) await page.screenshot({ path: CAPTURES + '/livre-ancien-1.png' });
  const glisser = async (de: number, a: number) => {
    const b = (await page.locator('.livre-ancien').boundingBox())!;
    const y = b.y + b.height / 2;
    await page.mouse.move(b.x + b.width * de, y); await page.mouse.down();
    await page.mouse.move(b.x + b.width * a, y, { steps: 8 }); await page.mouse.up();
  };
  await glisser(0.8, 0.2); // vers la gauche : page suivante
  await expect(page.locator('.carnet-chemin')).toContainText('Page 2 sur 15');
  await expect(page.locator('.livre-page h2')).toHaveText('Premier tableau');
  await expect(page.locator('.livre-ancien .lettrine')).toHaveText('L');
  if (CAPTURES) await page.screenshot({ path: CAPTURES + '/livre-ancien-2.png' });
  await glisser(0.2, 0.8); // vers la droite : page précédente
  await expect(page.locator('.carnet-chemin')).toContainText('Page 1 sur 15');
  // Un vrai geste tactile, sur le texte de la page (qui peut défiler)
  const cdp = await page.context().newCDPSession(page);
  const t = (type: string, x: number, y: number) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const z = (await page.locator('.livre-texte').boundingBox())!;
  const y = z.y + Math.min(30, z.height / 2);
  await t('touchStart', z.x + z.width * 0.85, y);
  for (let i = 1; i <= 8; i++) await t('touchMove', z.x + z.width * (0.85 - i * 0.08), y + i);
  await t('touchEnd', 0, 0);
  await expect(page.locator('.carnet-chemin')).toContainText('Page 2 sur 15');
});

test('le livre occupe tout l\'écran, et sa page garde la même taille sur les quinze pages', async ({ page }) => {
  await diplome(page);
  await page.locator('#btn-carnet5').click();
  await page.locator('.carte-ard', { hasText: 'légende' }).click();
  await page.locator('[data-a="livre"]').click();
  await expect(page.locator('.carnet.mode-livre')).toHaveCount(1);
  const tailles = new Set<string>();
  for (let p = 1; p <= 15; p++) {
    const b = (await page.locator('.livre-page').boundingBox())!;
    tailles.add(Math.round(b.width) + '×' + Math.round(b.height));
    if (process.env.CAPTURES && (p === 2 || p === 15)) await page.screenshot({ path: process.env.CAPTURES + `/livre-plein-${p}.png` });
    if (p < 15) await page.keyboard.press('ArrowRight');
  }
  expect([...tailles]).toHaveLength(1);
  // Toutes les cartes : on sort du plein écran ; et les cartes ont toutes la même hauteur
  await page.locator('[data-a="grille"]').click();
  await expect(page.locator('.carnet.mode-livre')).toHaveCount(0);
  const hauteurs = await page.locator('.carte-ard').evaluateAll(l => [...new Set(l.map(e => Math.round(e.getBoundingClientRect().height)))]);
  expect(hauteurs).toHaveLength(1);
});

test('le Cabaret Vert : des lasers balaient le ciel pendant la musique', async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=3#exemple');
  await expect(page.locator('svg.decor-montgolfiere .lasers .rayon')).toHaveCount(5);
  await page.locator('.tap[data-el="cabaret"]').dispatchEvent('click');
  await expect(page.locator('svg.decor-montgolfiere.concert')).toHaveCount(1);
});

test("la forêt : le sanglier touché s'enfuit", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=1#exemple');
  const s = page.locator('.tap[data-el="sanglier"]');
  await s.dispatchEvent('click');
  await expect(s).toHaveClass(/fuit/);
  expect(await page.evaluate(() => (window as any).APP.state.ardennes)).toContain('foret.sanglier'); // le secret est bien compté
});
