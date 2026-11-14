// L'histoire de bout en bout, comme un enfant : les dix scènes, le mini-jeu, la caméra, la lettre, le diplôme
import { test, expect, type Page } from '@playwright/test';
import { ouvrir, toucher } from './aide';

// Où toucher chaque élément obligatoire (au cœur du dessin)
const CIBLES: Record<string, string> = {
  lanterne: '.tap[data-el="lanterne"] circle:last-child',
  champignons: '.tap[data-el="champignons"] .champi:not(.allume) .chapeau',
  marionnettiste: '.tap[data-el="marionnettiste"] .geant',
  bruleur: '.tap[data-el="bruleur"] .flamme',
  girouette: '.tap[data-el="girouette"] .coq',
  lievre: '.tap[data-el="lievre"] .corps-lievre',
  constellation: '.tap[data-el="constellation"] .pt.prochaine use',
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
    if (cible === 'vitre') {
      // La buée : on frotte toute la vitre
      const b = (await page.locator('.decor-fenetre .voile').boundingBox())!;
      await page.mouse.move(b.x + 10, b.y + 10); await page.mouse.down();
      for (let i = 0; i < 16; i++) await page.mouse.move(b.x + 10 + (i % 2) * (b.width - 20), b.y + 10 + i * (b.height - 20) / 15, { steps: 6 });
      await page.mouse.up();
    } else if (cible) {
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
  test.setTimeout(420_000); // toute l'histoire, mini-jeux compris
  await ouvrir(page, '?reset=1#exemple');
  await page.locator('#bandeau-actions button').click(); // « Viens, je te raconte ! »
  // La carte de France : l'étoile de la ville, puis « En route ! »
  await page.locator('.etoile-ville').click();
  await page.locator('#bandeau-actions button', { hasText: 'En route' }).click();
  // Les dix scènes du voyage
  const vues: string[] = [];
  for (let i = 0; i < 10; i++) {
    await page.waitForFunction(n => document.querySelectorAll('.pastille.active').length === 1 && (document.querySelector('.pastille.active') as HTMLElement).dataset.n === String(n), i);
    vues.push((await page.locator('svg.decor').getAttribute('class'))!.replace('decor decor-', '').split(' ')[0]);
    const fin = await jouerScene(page);
    if (i < 9) expect(fin).toContain('Scène suivante'); else expect(fin).toContain('Aider');
    await page.locator('#bandeau-actions button').click();
  }
  expect(vues).toEqual(['chateau', 'foret', 'place', 'montgolfiere', 'etoiles', 'meuse', 'lievre', 'aiglemont', 'fenetre', 'pantoufle']);

  // Le mini-jeu : rester appuyé jusqu'à la porte
  await expect(page.locator('#btn-avancer')).toBeVisible();
  const b = (await page.locator('#btn-avancer').boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await expect(page.locator('#btn-avancer')).toBeHidden({ timeout: 120_000 });
  await page.mouse.up();
  // La lampe de poche : la lumière promenée jusqu'à la plaque de la chambre
  await page.locator('#bandeau-actions button', { hasText: 'Entrer dans la maison' }).click();
  await expect(page.locator('svg.lampe')).toBeVisible();
  const plaque = (await page.locator('svg.lampe .plaque').boundingBox())!;
  await page.mouse.move(80, 500);
  await page.mouse.move(plaque.x + plaque.width / 2, plaque.y + plaque.height / 2, { steps: 8 });
  await page.waitForTimeout(500);
  await page.mouse.move(plaque.x + plaque.width / 2 + 2, plaque.y + plaque.height / 2);
  await expect(page.locator('svg.lampe.trouvee')).toHaveCount(1);
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
  // L'épilogue : le retour en montgolfière (les nuages passent), puis la dent rangée dans la boîte à trésors
  // Le retour en montgolfière : l'histoire, les consignes, puis le départ ; elle se pose près du château
  await page.locator('#bandeau-actions button', { hasText: 'Suite' }).click({ timeout: 30_000 });
  await page.locator('#bandeau-actions button', { hasText: "C'est parti" }).click({ timeout: 30_000 });
  await page.locator('#bandeau-actions button', { hasText: 'Entrer dans le terrier' }).click({ timeout: 60_000 });
  // Le terrier : on suit le chemin jusqu'à la porte du château (flèches du clavier)
  await expect(page.locator('#voile-noir.on')).toHaveCount(0);
  const solution = (await page.locator('svg.terrier').getAttribute('data-solution'))!;
  const fleches: Record<string, string> = { N: 'ArrowUp', S: 'ArrowDown', E: 'ArrowRight', O: 'ArrowLeft' };
  await page.waitForTimeout(300);
  for (const d of solution) { await page.keyboard.press(fleches[d]); await page.waitForTimeout(120); }
  await expect(page.locator('svg.terrier.ouverte')).toHaveCount(1);
  await page.locator('#bandeau-actions button', { hasText: 'boîte à trésors' }).click({ timeout: 30_000 });
  await expect(page.locator('#voile-noir.on')).toHaveCount(0); // la fin du fondu au noir
  await page.waitForTimeout(300);
  const dent = (await page.locator('.dent-a-ranger').boundingBox())!, place = (await page.locator('.place-nuit').boundingBox())!;
  await page.mouse.move(dent.x + dent.width / 2, dent.y + dent.height / 2);
  await page.mouse.down();
  await page.mouse.move(place.x + place.width / 2, place.y + place.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.locator('#bandeau-actions button', { hasText: 'Voir mon diplôme' }).click();

  // Le diplôme
  await expect(page.locator('.diplome .dip-nom')).toHaveText('Clémentine');
  const badges = await page.evaluate(() => (window as any).APP.state.badges);
  for (const id of ['detective', 'passechat', 'hibou', 'amie', 'billet', 'jumelle']) expect(badges).toContain(id);
});
