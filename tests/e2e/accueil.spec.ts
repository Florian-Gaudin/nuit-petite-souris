// L'accueil : écran de lancement, écran de choix, accès direct par QR code, carte de France avant le château
import { test, expect, type Page } from '@playwright/test';
import { type Profil } from '../../src/lib/profil';
import { LEO, code, ouvrir, bandeau } from './aide';

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
  await expect(page.locator('.choix')).toHaveCount(0);
  await expect(page.locator('.sous')).toContainText('Lyon');
  await expect(bandeau(page)).toHaveText("Coucou Léo ! Moi, c'est Quenotte, la souris des dents de lait. Cette nuit, j'ai eu besoin de toi. Viens, je te raconte !");
});

test('« Changer d\'histoire » ramène à l\'écran de choix', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));
  await page.locator('#btn-prefs').click();
  await page.locator('#pref-changer').click();
  await expect(page.locator('.choix')).toBeVisible();
  await expect(page.locator('.carte-choix.reprendre')).toContainText('Léo');
});

test('la carte : le château des Ardennes, l\'étoile de Lyon, un chemin courbe, puis le château', async ({ page }) => {
  await versLaCarte(page, LEO);
  await expect(bandeau(page)).toContainText('château caché au fond de la forêt des Ardennes');
  await expect(page.locator('.nom-chateau')).toHaveText('Château de Quenotte');
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
