// La fin de l'histoire : le diplôme seul, la remise des badges (la sacoche de Quenotte, l'étagère), l'écran de fin
import { test, expect, type Page } from '@playwright/test';
import { ouvrir } from './aide';

const CAPTURES = process.env.CAPTURES;
const capture = async (page: Page, nom: string) => { if (CAPTURES) await page.screenshot({ path: CAPTURES + '/' + nom + '.png' }); };
const etat = (page: Page) => page.evaluate(() => (window as any).APP.state);

async function finir(page: Page, badges: string[]) {
  await ouvrir(page, '?reset=1#exemple');
  await page.evaluate(b => { const A = (window as any).APP; A.state.unlocked = 5; A.state.badges = b; A.show(5, { diplome: true }); }, badges);
}

test('la première fois : le diplôme seul, puis Quenotte accroche les badges un par un, puis l\'écran de fin', async ({ page }) => {
  await finir(page, ['detective', 'passechat']);
  // 1. Le diplôme seul : épuré (une ligne de bilan, aucun badge), sans « Passer »
  await expect(page.locator('.diplome .dip-nom')).toHaveText('Clémentine');
  await expect(page.locator('.dip-bilan')).toContainText('3 badges gagnés'); // + la dent jumelle, remise à la fin
  await expect(page.locator('.diplome .medaille')).toHaveCount(0);
  await expect(page.locator('#toast.on')).toHaveCount(0); // la dent jumelle n'est pas annoncée : Quenotte la remettra
  await expect(page.locator('#btn-passer')).toBeHidden();
  await capture(page, 'fin-1-diplome');
  await page.locator('#bandeau-actions button', { hasText: 'Voir la surprise' }).click();

  // 2. La remise : trois crochets attendent, la sacoche brille
  await expect(page.locator('.ceremonie.pleine')).toBeVisible();
  await expect(page.locator('#bandeau-texte')).toContainText('tu as gagné 3 badges');
  await expect(page.locator('.case-med.attend')).toHaveCount(3);
  await expect(page.locator('.case-med.a-gagner')).toHaveCount(10);
  await expect(page.locator('.etagere-compte')).toHaveText('0 / 13');
  await capture(page, 'fin-2-ceremonie');
  await page.locator('.sacoche').click();
  await expect(page.locator('#bandeau-texte')).toContainText('Détective de nuit ! Tu as guidé Quenotte');
  await expect(page.locator('.case-med[data-badge="detective"]:not(.attend)')).toHaveCount(1);
  await expect(page.locator('.etagere-compte')).toHaveText('1 / 13');
  await expect(page.locator('#bandeau-actions button', { hasText: 'Le badge suivant' })).toBeVisible();
  // Une médaille à gagner : Quenotte dit comment l'obtenir
  await page.locator('.case-med[data-badge="pilote"]').click();
  await expect(page.locator('#bandeau-texte')).toContainText('sans perdre une seule vie');
  // « Passer » accroche toutes les autres
  await page.locator('#btn-passer').click();
  await expect(page.locator('.case-med.attend')).toHaveCount(0);
  await expect(page.locator('.etagere-compte')).toHaveText('3 / 13');
  await expect(page.locator('#bandeau-texte')).toContainText('Ton étagère brille');
  expect((await etat(page)).remis.sort()).toEqual(['detective', 'jumelle', 'passechat']);
  await page.locator('#bandeau-actions button', { hasText: 'Continuer' }).click();

  // 3. L'écran de fin : le diplôme, son impression, les quatre tuiles
  await expect(page.locator('#btn-imprimer')).toHaveAttribute('href', /certificat\/\?badges=/);
  await expect(page.locator('#btn-tresors')).toContainText('3 badges sur 13');
  await expect(page.locator('#btn-tresors .mini-med')).toHaveCount(3);
  await expect(page.locator('#btn-tresors .tuile-nouveau')).toHaveCount(0);
  for (const id of ['#btn-carnet5', '#btn-dessin5', '#btn-album5', '#btn-revoir5']) await expect(page.locator(id)).toBeVisible();
  await capture(page, 'fin-3-ecran');
  // Le diplôme s'agrandit, et se referme avec Échap
  await page.locator('#btn-dip-grand').click();
  await expect(page.locator('.fen-diplome .diplome')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.fen-diplome')).toHaveCount(0);

  // La cérémonie n'a lieu qu'une fois : ensuite, le ruban mène directement à l'écran de fin
  expect((await etat(page)).ceremonie).toBe(true);
  await page.evaluate(() => (window as any).APP.show(5, { diplome: true }));
  await expect(page.locator('#btn-tresors')).toBeVisible();
  await expect(page.locator('.ceremonie')).toHaveCount(0);
});

test('un badge gagné après la remise : « Nouveau » sur Mes trésors, et il s\'accroche à l\'ouverture', async ({ page }) => {
  await finir(page, ['detective']);
  await page.evaluate(() => { const A = (window as any).APP; A.state.ceremonie = true; A.state.remis = ['detective', 'jumelle']; A.state.badges.push('artiste'); A.show(5, { diplome: true }); });
  await expect(page.locator('#btn-tresors .tuile-nouveau')).toHaveText('Nouveau');
  await page.locator('#btn-tresors').click();
  await expect(page.locator('.fen-tresors .case-med[data-badge="artiste"]:not(.attend)')).toHaveCount(1);
  await expect(page.locator('.tresors-info')).toContainText('Artiste de la nuit');
  await expect(page.locator('.tresors-info')).toContainText('Nouveau');
  await expect(page.locator('.ciel-etoile')).toHaveCount(20);
  await capture(page, 'fin-4-tresors');
  expect((await etat(page)).remis).toContain('artiste');
  // Fermer : l'écran de fin se redessine, sans « Nouveau »
  await page.locator('.fen-tresors .fermer-x').click();
  await expect(page.locator('#btn-tresors .tuile-nouveau')).toHaveCount(0);
  // Rejouer la remise des badges : toutes les médailles retournent dans la sacoche
  await page.locator('#btn-tresors').click();
  await page.locator('.fen-tresors [data-a="rejouer"]').click();
  await expect(page.locator('.ceremonie.pleine')).toBeVisible();
  await expect(page.locator('.case-med.attend')).toHaveCount(3);
  await expect(page.locator('.etagere-compte')).toHaveText('0 / 13');
  await page.locator('.sacoche').click();
  await expect(page.locator('.etagere-compte')).toHaveText('1 / 13');
  await page.locator('#btn-passer').click();
  await page.locator('#bandeau-actions button', { hasText: 'Continuer' }).click();
  await expect(page.locator('#btn-tresors')).toBeVisible();
});

test('le diplôme imprimé : seulement les médailles gagnées, jamais celles qui manquent', async ({ page }) => {
  await page.goto('certificat/?badges=detective,amie&etoiles=4#exemple');
  await expect(page.locator('.dip-nom')).toHaveText('Clémentine');
  await expect(page.locator('.dip-medaille')).toHaveCount(3); // + la dent jumelle
  await expect(page.locator('.dip-medaille figcaption')).toHaveText(['Détective de nuit', 'Amie de Quenotte', 'Dent jumelle']);
  await expect(page.locator('.medaille.vide')).toHaveCount(0);
  await expect(page.locator('.dip-bilan')).toContainText('4 étoiles trouvées sur 20');
});

test('les étoiles trouvées sortent de la sacoche en constellation et s\'allument dans le ciel de l\'étagère', async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await page.evaluate(() => {
    const W = window as any, A = W.APP; A.state.unlocked = 5; A.state.badges = ['detective'];
    const e: any = {}; let n = 0; for (const s of W.DATA.scenes) { e[s.id] = []; for (const b of s.bonus) if (n < 5) { e[s.id].push(b); n++; } } A.state.etoiles = e;
    A.show(5, { diplome: true, temps: 'ceremonie' });
  });
  await expect(page.locator('.ciel-cases .ciel-etoile')).toHaveCount(20);
  await expect(page.locator('.ciel-compte')).toHaveText('0 / 20');
  await page.locator('.sacoche').click(); // Détective de nuit
  // « Passer » accroche la médaille qui reste… et arrive aux étoiles, sans les sauter
  await page.locator('#btn-passer').click();
  await expect(page.locator('.case-med.attend')).toHaveCount(0);
  await expect(page.locator('#bandeau-texte')).toContainText('les 5 étoiles que tu as trouvées');
  await expect(page.locator('.ciel-compte')).toHaveText('0 / 20');
  await page.locator('#bandeau-actions button', { hasText: 'Les étoiles' }).click();
  await expect(page.locator('#bandeau-texte')).toContainText('la Dent de Clémentine');
  await expect(page.locator('.ciel-compte')).toHaveText('5 / 20');
  await expect(page.locator('.ciel-cases .ciel-etoile:not(.eteinte)')).toHaveCount(5);
  await expect(page.locator('#bandeau-texte')).toContainText('Ton étagère brille');
  expect((await etat(page)).etoilesRemises).toBe(true);
});

test('Mes trésors : le cadre des explications garde la même hauteur, et chaque explication y tient en entier', async ({ page }) => {
  await finir(page, ['detective']);
  await page.evaluate(() => { const A = (window as any).APP; A.state.ceremonie = true; A.state.remis = ['detective', 'jumelle']; A.show(5, { diplome: true }); });
  await page.locator('#btn-tresors').click();
  const info = page.locator('.tresors-info');
  const hauteurs = new Set<number>();
  for (const c of await page.locator('.fen-tresors .case-med').all()) {
    await c.click();
    const [h, contenu] = await info.evaluate(e => [e.offsetHeight, e.scrollHeight]);
    expect(contenu, await c.getAttribute('data-badge') || '').toBeLessThanOrEqual(h);
    hauteurs.add(h);
  }
  expect(hauteurs.size).toBe(1);
});

test('le menu des réglages : « Mon diplôme » (un toucher le referme), « Mes badges et mes étoiles », « Pour les grands » replié', async ({ page }) => {
  await finir(page, ['detective']);
  await page.evaluate(() => { const A = (window as any).APP; A.state.ceremonie = true; A.state.fini = true; A.show(1, { scene: 0 }); });
  await page.locator('#btn-prefs').click();
  await expect(page.locator('#pref-parents')).toBeHidden();
  await expect(page.locator('#g-grands')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#pref-diplome').click();
  await expect(page.locator('.fen-diplome .diplome')).toBeVisible();
  await page.locator('.fen-diplome .dip-fermer').click();
  await expect(page.locator('.fen-diplome')).toHaveCount(0);
  await page.locator('#btn-prefs').click();
  await page.locator('#pref-tresors').click();
  await expect(page.locator('.fen-tresors .etagere')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('#btn-prefs').click();
  await page.locator('#g-grands').click();
  await expect(page.locator('#pref-parents')).toBeVisible();
});

test('le menu, Mes trésors : chaque entrée reste grisée tant qu\'aucun de ses éléments n\'est découvert', async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=0#exemple');
  // Rien de découvert : les quatre trésors sont là, grisés et sans effet
  await page.locator('#btn-prefs').click();
  for (const id of ['#pref-diplome', '#pref-tresors', '#pref-carnet', '#pref-album']) await expect(page.locator(id)).toBeDisabled();
  await page.locator('#pref-fermer').click();
  // Un premier badge pendant le voyage : « Mes badges et mes étoiles » apparaît, pas encore le diplôme ni le carnet
  await page.evaluate(() => { const A = (window as any).APP; A.state.badges = ['detective']; });
  await page.locator('#btn-prefs').click();
  await expect(page.locator('#pref-tresors')).toBeEnabled();
  for (const id of ['#pref-diplome', '#pref-carnet', '#pref-album']) await expect(page.locator(id)).toBeDisabled();
  // L'étagère montre la médaille, sans voler la remise des badges de la fin
  await page.locator('#pref-tresors').click();
  await expect(page.locator('.fen-tresors .case-med[data-badge="detective"]:not(.attend):not(.a-gagner)')).toHaveCount(1);
  await expect(page.locator('.tresors-info .info-etat')).toHaveCount(0);
  expect((await etat(page)).remis || []).toEqual([]);
  await page.keyboard.press('Escape');
  // Une carte du carnet trouvée : le carnet apparaît
  await page.evaluate(() => { const A = (window as any).APP; A.state.ardennes = ['chateau.cuisine']; });
  await page.locator('#btn-prefs').click();
  await expect(page.locator('#pref-carnet')).toBeEnabled();
  await expect(page.locator('#pref-diplome')).toBeDisabled();
});
