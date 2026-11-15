// La 13e scène : les trois coups sur le Grand Marionnettiste, puis le théâtre de marionnettes en cinq tableaux
import { test, expect, type Page } from '@playwright/test';
import { ouvrir, toucher } from './aide';

const CAPTURES = process.env.CAPTURES;
const capture = async (page: Page, nom: string) => { if (CAPTURES) await page.screenshot({ path: CAPTURES + '/' + nom + '.png' }); };

async function troisCoups(page: Page) {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=2#exemple');
  const m = page.locator('.tap[data-el="marionnettiste"]'), corps = '.tap[data-el="marionnettiste"] .geant';
  // L'arrivée sur la place : on lit l'histoire jusqu'à ce que Quenotte demande de toucher le Grand Marionnettiste
  for (let i = 0; i < 20 && !(await m.evaluate(g => g.classList.contains('cible') && !(window as any).NARR.lit)); i++) {
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) await page.locator('.bandeau-suite').click();
    await page.waitForTimeout(300);
  }
  await toucher(page, corps);
  await expect(m).toHaveClass(/coup1/); // un clin d'œil
  await toucher(page, corps);
  await expect(m).toHaveClass(/coup2/); // le rideau de sa fenêtre frémit
  await toucher(page, corps);
  await expect(page.locator('.theatre')).toBeVisible();
}

test('les trois coups ouvrent le théâtre ; le spectacle complet donne le badge', async ({ page }) => {
  test.setTimeout(120000);
  await troisCoups(page);
  const txt = page.locator('.th-txt');
  await expect(txt).toContainText('treizième scène');
  await expect(page.locator('.th-affiche')).toContainText('Clémentine et la dent d');
  await page.waitForTimeout(400); await capture(page, 't0-ouverture');
  // 1. Le salut : chaque marionnette salue quand on la touche
  await page.locator('.th-actions button').click();
  await expect(txt).toContainText('Voici ma troupe');
  for (const id of ['souris', 'doudou', 'chat', 'dent']) await page.locator(`.marionnette[data-p="${id}"]`).click();
  await expect(txt).toContainText('Quelle belle troupe');
  await capture(page, 't1-salut');
  // 2. La danse du doudou : tirer le fil cinq fois
  await page.locator('.th-actions button').click();
  await expect(txt).toContainText('Premier numéro');
  for (let i = 0; i < 5; i++) { await page.locator('.th-actions button').click(); await page.waitForTimeout(150); }
  await expect(txt).toContainText('doigts de marionnettiste');
  await capture(page, 't2-danse');
  // 3. Le chat endormi : trop vite, il ouvre un œil ; tout doucement, Quenotte passe
  await page.locator('.th-actions button').click();
  await expect(txt).toContainText('Deuxième numéro');
  const fil = page.locator('.th-fil input');
  await fil.fill('60');
  await expect(txt).toContainText('a ouvert un œil');
  await expect(page.locator('.chat-m')).toHaveClass(/oeil/);
  await capture(page, 't3-reveil');
  await expect(txt).toContainText('rendormi', { timeout: 5000 });
  await fil.focus();
  for (let i = 0; i < 55; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(70); }
  await expect(txt).toContainText("n'a rien entendu");
  // 4. Bayard et les quatre chevaliers souris
  await page.locator('.th-actions button').click();
  await expect(txt).toContainText('Bayard', { timeout: 8000 });
  await expect(txt).toContainText('Touche Bayard', { timeout: 8000 });
  await page.locator('.marionnette[data-p="bayard"]').click();
  await capture(page, 't4-bayard');
  // 5. Le final : la dent monte au château, on applaudit, puis on ferme le rideau
  await page.locator('.th-actions button').click();
  await expect(txt).toContainText('vedette de la soirée');
  await expect(page.locator('#th-clap')).toBeVisible({ timeout: 8000 });
  for (let i = 0; i < 6; i++) await page.locator('#th-clap').click();
  await expect(txt).toContainText('Quelle salle formidable');
  await capture(page, 't5-final');
  await page.locator('#th-fermer').click();
  await expect(page.locator('.theatre')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (window as any).APP.state.badges)).toContain('scene13');
});

test('quitter le spectacle en cours : pas de badge ; le diplôme montre le badge secret en grisé avec son indice', async ({ page }) => {
  await troisCoups(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('.theatre')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).APP.state.badges)).not.toContain('scene13');
  await page.evaluate(() => { const A = (window as any).APP; A.state.unlocked = 5; A.state.fini = true; A.show(5, { diplome: true }); });
  const b = page.locator('.badge-dip', { hasText: 'Scène secrète' });
  await expect(b).toHaveClass(/off/);
  await expect(b).toHaveAttribute('data-info', /trois coups/);
  await expect(page.locator('.dip-compte')).toContainText('/12');
});
