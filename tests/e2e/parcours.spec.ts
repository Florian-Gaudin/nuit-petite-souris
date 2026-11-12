// L'histoire de bout en bout, comme un enfant : les sept scènes, le mini-jeu, la caméra, la lettre, le diplôme
import { test, expect, type Page } from '@playwright/test';
import { ouvrir, toucher } from './aide';

// Où toucher chaque élément obligatoire (au cœur du dessin)
const CIBLES: Record<string, string> = {
  lanterne: '.tap[data-el="lanterne"] circle:last-child',
  champignons: '.tap[data-el="champignons"] .champi:not(.allume) .chapeau',
  marionnettiste: '.tap[data-el="marionnettiste"] .geant',
  bruleur: '.tap[data-el="bruleur"] .flamme',
  girouette: '.tap[data-el="girouette"] .coq',
  yeux: '.tap[data-el="yeux"] .yeux-brillent',
  quenotte: '.tap[data-el="quenotte"] use',
};

// Joue la scène ouverte jusqu'au bouton de fin (Suite, éléments à toucher, plis du billet…)
async function jouerScene(page: Page): Promise<string> {
  for (let tour = 0; tour < 60; tour++) {
    const bouton = page.locator('#bandeau-actions:not([hidden]) button');
    if (await bouton.count()) return (await bouton.textContent()) || '';
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) { await page.locator('.bandeau-suite').click(); continue; }
    const cible = await page.evaluate(() => { const g = document.querySelector('.tap.cible') as HTMLElement | null; return g && !(window as any).NARR.lit ? g.dataset.el : null; });
    if (cible) {
      if (cible === 'billet') {
        const etape = await page.locator('.tap[data-el="billet"]').getAttribute('data-etape');
        await toucher(page, `.tap[data-el="billet"] .pli${etape}`);
      } else await toucher(page, CIBLES[cible]);
    }
    await page.waitForTimeout(250);
  }
  throw new Error('scène bloquée');
}

test('de l\'accueil au diplôme', async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await page.locator('#bandeau-actions button').click(); // « Viens, je te raconte ! »
  // La carte de France : l'étoile de la ville, puis « En route ! »
  await page.locator('.etoile-ville').click();
  await page.locator('#bandeau-actions button', { hasText: 'En route' }).click();
  // Les sept scènes du voyage
  const vues: string[] = [];
  for (let i = 0; i < 7; i++) {
    await page.waitForFunction(n => document.querySelectorAll('.pastille.active').length === 1 && (document.querySelector('.pastille.active') as HTMLElement).dataset.n === String(n), i);
    vues.push((await page.locator('svg.decor').getAttribute('class'))!.replace('decor decor-', '').split(' ')[0]);
    const fin = await jouerScene(page);
    if (i < 6) expect(fin).toContain('Scène suivante'); else expect(fin).toContain('Aider');
    await page.locator('#bandeau-actions button').click();
  }
  expect(vues).toEqual(['chateau', 'foret', 'meuse', 'place', 'montgolfiere', 'aiglemont', 'pantoufle']);

  // Le mini-jeu : rester appuyé jusqu'à la porte
  await expect(page.locator('#btn-avancer')).toBeVisible();
  const b = (await page.locator('#btn-avancer').boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await expect(page.locator('#btn-avancer')).toBeHidden({ timeout: 120_000 });
  await page.mouse.up();
  await page.locator('#bandeau-actions button', { hasText: 'caméra' }).click();

  // La caméra jusqu'au bout (avec les pauses des chuchotements)
  for (let tour = 0; tour < 400; tour++) {
    if (await page.locator('#bandeau-actions button', { hasText: 'lettre' }).count()) break;
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) await page.locator('.bandeau-suite').click();
    await page.waitForTimeout(250);
  }
  await page.locator('#bandeau-actions button', { hasText: 'lettre' }).click();

  // La lettre
  await toucher(page, '#cachet');
  await page.locator('#btn-tout').click();
  await expect(page.locator('.papier')).toContainText('Chère Clémentine');
  await page.locator('#bandeau-actions button', { hasText: 'billet' }).click();

  // Le diplôme
  await expect(page.locator('.diplome .dip-nom')).toHaveText('Clémentine');
  const badges = await page.evaluate(() => (window as any).APP.state.badges);
  for (const id of ['detective', 'passechat', 'hibou', 'amie', 'billet', 'jumelle']) expect(badges).toContain(id);
});
