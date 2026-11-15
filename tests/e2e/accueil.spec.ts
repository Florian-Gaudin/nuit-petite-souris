// L'accueil : écran de lancement, écran de choix, accès direct par QR code, carte de France avant le château
import { test, expect, type Page } from '@playwright/test';
import { type Profil } from '../../src/lib/profil';
import { LEO, code, ouvrir, bandeau, tenirVerrou } from './aide';

const avecVille = (ville: Profil['ville']): Profil => ({ ...structuredClone(LEO), ville });

// Ouvre l'histoire et passe l'accueil (« Viens, je te raconte ! ») : la carte s'affiche
async function versLaCarte(page: Page, p: Profil) {
  await ouvrir(page, '?reset=1#p=' + code(p));
  await page.locator('#bandeau-actions button').click();
  await expect(page.locator('.carte-france')).toBeVisible();
}

test('écran de lancement : le logo au moins un instant, une seule fois par visite', async ({ page }) => {
  await page.goto('#exemple');
  await expect(page.locator('#lancement')).toBeVisible();
  const debut = Date.now();
  await expect(page.locator('#lancement')).toHaveCount(0, { timeout: 10_000 });
  expect(Date.now() - debut).toBeGreaterThan(300); // pas un simple éclair
  // Passer d'une histoire à l'autre dans la même visite : pas de nouvel écran de lancement
  await ouvrir(page, './');
  expect(await page.evaluate(() => document.documentElement.classList.contains('deja-lance'))).toBe(true);
  await expect(page.locator('#lancement')).toHaveCount(0);
});

test('par le QR code : directement l\'accueil personnalisé, sans écran de choix', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));
  await expect(page.locator('.ecran-choix')).toHaveCount(0);
  await expect(page.locator('.sous')).toContainText('Lyon');
  await expect(bandeau(page)).toHaveText("Coucou Léo ! Moi, c'est Quenotte, la souris des dents de lait. Cette nuit, j'ai eu besoin de toi. Viens, je te raconte !");
});

test('« Changer d\'histoire » ramène à l\'écran de choix', async ({ page }) => {
  // Depuis l'accueil : le lien sous le titre
  await ouvrir(page, '#p=' + code(LEO));
  await page.locator('.retour-choix').click();
  await expect(page.locator('.ecran-choix')).toBeVisible();
  await expect(page.locator('.carte-choix.reprendre')).toContainText('Léo');
  // En pleine histoire : le menu Préférences
  await ouvrir(page, '?chapitre=1&scene=2#p=' + code(LEO));
  await page.locator('#btn-prefs').click();
  await page.locator('#pref-changer').click();
  await expect(page.locator('.ecran-choix')).toBeVisible();
  // L'histoire de Léo reprend où elle en était
  await page.locator('.carte-choix.reprendre').click();
  await expect.poll(() => page.evaluate(() => (window as any).APP?.state.scene).catch(() => null)).toBe(2);
});

test('la carte : le château des Ardennes, l\'étoile de Lyon, un chemin courbe, puis le château', async ({ page }) => {
  await versLaCarte(page, LEO);
  await expect(bandeau(page)).toContainText('château fort de Sedan');
  await expect(page.locator('.nom-chateau')).toHaveText('Château fort de Sedan');
  // Le chemin : une courbe (le point de contrôle s'écarte franchement de la ligne droite)
  const d = (await page.locator('.trajet').getAttribute('d'))!;
  const [x0, y0, qx, qy, x1, y1] = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  expect(d).toMatch(/^M[\d. ]+Q/);
  const ecart = Math.abs((x1 - x0) * (y0 - qy) - (x0 - qx) * (y1 - y0)) / Math.hypot(x1 - x0, y1 - y0);
  expect(ecart).toBeGreaterThan(40);
  // L'étoile se touche : le chemin apparaît, le nom de la ville aussi
  await expect(page.locator('.origine')).not.toHaveClass(/arrive/);
  await page.locator('.etoile-ville').click();
  await expect(page.locator('.origine')).toHaveClass(/arrive/);
  await expect(page.locator('.nom-ville')).toHaveText('Lyon');
  await expect(bandeau(page)).toHaveText("Ce soir, c'est ta dent que je viens chercher, à Lyon !");
  await page.locator('#bandeau-actions button', { hasText: 'En route' }).click();
  await expect(page.locator('svg.decor-chateau')).toBeVisible();
});

test('la carte : l\'outre-mer dans son encadré, un département inconnu sans étoile', async ({ page }) => {
  await versLaCarte(page, avecVille({ nom: 'Saint-Denis', codePostal: '97400', departement: '974' }));
  await expect(page.locator('.outre-mer')).toBeVisible();
  await page.locator('.etoile-ville').click();
  await expect(page.locator('.nom-ville')).toHaveText('Saint-Denis');

  await versLaCarte(page, avecVille({ nom: 'Quelque part', codePostal: '', departement: '' }));
  await expect(page.locator('.etoile-ville')).toHaveCount(0);
  await expect(page.locator('#bandeau-actions button', { hasText: 'En route' })).toBeVisible();
  await expect(bandeau(page)).toContainText('à Quelque part');
});

test("l'écran de choix tient sans défiler, avec ses trois cartes et le don", async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO)); // un profil mémorisé : la carte « Reprendre » s'ajoute
  for (const [w, h] of [[320, 568], [360, 640], [375, 667], [412, 915], [768, 1024], [1280, 720], [740, 360]]) {
    await page.setViewportSize({ width: w, height: h });
    await ouvrir(page, './');
    await expect(page.locator('.carte-choix')).toHaveCount(3);
    const { haut, fenetre, bas } = await page.evaluate(() => ({
      haut: document.documentElement.scrollHeight, fenetre: innerHeight,
      bas: Math.max(...[...document.querySelectorAll('.carte-choix, .don-accueil')].map(e => e.getBoundingClientRect().bottom)),
    }));
    expect(haut, `${w}×${h} : la page défile`).toBeLessThanOrEqual(fenetre);
    expect(bas, `${w}×${h} : un élément dépasse`).toBeLessThanOrEqual(fenetre);
  }
});

test('débuter, changer d\'histoire, reprendre : sur place, sans recharger (le plein écran est gardé)', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));                 // Léo est mémorisé
  await ouvrir(page, '?reset=1');                        // l'écran de choix, l'exemple chargé en décor
  await page.evaluate(() => { (window as any).MARQUE = 1; });
  const marque = () => page.evaluate(() => (window as any).MARQUE);
  // Débuter le voyage : l'exemple est déjà chargé
  await page.locator('.carte-choix.voyage').click();
  await expect(bandeau(page)).toContainText('Coucou Clémentine');
  expect(new URL(page.url()).hash).toBe('#exemple');
  expect(await marque()).toBe(1);
  // Changer d'histoire, puis revenir : toujours la même page
  await page.locator('.retour-choix').click();
  await expect(page.locator('.ecran-choix')).toBeVisible();
  await expect(page.locator('.carte-choix.voyage')).toContainText('Clémentine');
  expect(await marque()).toBe(1);
  // Reprendre Léo : un autre profil, la page se recharge (seul cas inévitable)
  await page.locator('.carte-choix.reprendre').click();
  await expect(bandeau(page)).toContainText('Coucou Léo');
  // Puis changer d'histoire et reprendre Léo : sur place cette fois
  await page.evaluate(() => { (window as any).MARQUE = 2; });
  await page.locator('.retour-choix').click();
  await expect(page.locator('.carte-choix.reprendre')).toContainText('Léo');
  await expect(page.locator('.carte-choix.voyage')).toContainText('Clémentine');
  await page.locator('.carte-choix.reprendre').click();
  await expect(bandeau(page)).toContainText('Coucou Léo');
  expect(await marque()).toBe(2);
});

test('les textes ne se sélectionnent pas (pas de « Toucher pour rechercher »), les champs de saisie si', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#bandeau-texte')!).userSelect)).toBe('none');
  await page.goto('parents/');
  await tenirVerrou(page);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('h1')!).userSelect)).toBe('none');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('input[type=text]')!).userSelect)).toBe('text');
});
