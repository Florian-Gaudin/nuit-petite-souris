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
  // Depuis la couverture : « Retour à l'accueil » dans le menu des réglages
  await ouvrir(page, '#p=' + code(LEO));
  await page.locator('#btn-prefs').click(); await page.locator('#g-grands').click(); await page.locator('#pref-changer').click();
  await expect(page.locator('.ecran-choix')).toBeVisible();
  await expect(page.locator('.carte-choix.reprendre')).toContainText('Léo');
  // En pleine histoire : le menu Préférences
  await ouvrir(page, '?chapitre=1&scene=2#p=' + code(LEO));
  await page.locator('#btn-prefs').click();
  // « Pour les grands » est replié pendant l'histoire
  await expect(page.locator('#pref-changer')).toBeHidden();
  await page.locator('#g-grands').click();
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

test("l'écran de choix tient sans défiler : pour un parent qui découvre, puis avec une histoire (options ouvertes ou non)", async ({ page }) => {
  // Le toucher sur « Autres options » passerait en plein écran, et une fenêtre en plein écran ne se redimensionne pas
  await page.addInitScript(() => { try { localStorage.setItem('souris.plein.refuse', '1'); } catch { /* */ } });
  const tient = async (etat: string) => {
    const { haut, fenetre, bas } = await page.evaluate(() => ({
      haut: document.documentElement.scrollHeight, fenetre: innerHeight,
      bas: Math.max(...[...document.querySelectorAll('.carte-choix, .don-accueil, .choix-etapes, .lien-video')].filter(e => e.checkVisibility()).map(e => e.getBoundingClientRect().bottom)),
    }));
    expect(haut, `${etat} : la page défile`).toBeLessThanOrEqual(fenetre);
    expect(bas, `${etat} : un élément dépasse`).toBeLessThanOrEqual(fenetre);
  };
  const tailles = [[320, 568], [360, 640], [375, 667], [412, 915], [768, 1024], [1280, 720], [740, 360]];
  for (const [w, h] of tailles) {
    await page.setViewportSize({ width: w, height: h });
    await ouvrir(page, '?reset=1');
    await expect(page.locator('.choix-etapes li')).toHaveCount(3);
    await tient(`${w}×${h} sans histoire`);
  }
  await ouvrir(page, '#p=' + code(LEO)); // un profil mémorisé : un seul gros bouton, le reste replié
  for (const [w, h] of tailles) {
    await page.setViewportSize({ width: w, height: h });
    await ouvrir(page, './');
    await expect(page.locator('.choix-etapes')).toHaveCount(0);
    await tient(`${w}×${h} avec histoire`);
    await page.locator('.autres-options summary').click();
    await expect(page.locator('.carte-choix.voyage')).toBeVisible();
    await tient(`${w}×${h} options ouvertes`);
  }
});

test("l'écran de choix : l'histoire de l'enfant en jaune en haut, sinon l'espace parents ; l'exemple en dernier", async ({ page }) => {
  await ouvrir(page, '?reset=1');
  const ordre = () => page.locator('.carte-choix').evaluateAll(l => l.map(e => e.className.replace('carte-choix ', '')));
  expect(await ordre()).toEqual(['parents principale', 'voyage']);
  await expect(page.locator('.carte-choix.voyage')).toContainText("Pour tester l'aventure avec l'histoire de Clémentine");
  await ouvrir(page, '#p=' + code(LEO));
  await ouvrir(page, './');
  expect(await ordre()).toEqual(['reprendre principale', 'parents', 'voyage']);
  await expect(page.locator('.carte-choix.principale')).toContainText('Léo');
  await expect(page.locator('.carte-choix.voyage')).toBeHidden(); // replié sous « Autres options »
  await page.locator('.autres-options summary').click();
  await expect(page.locator('.carte-choix.voyage')).toBeVisible();
  await expect(page.locator('.lien-video')).toHaveAttribute('href', 'decouvrir/');
});

test('débuter, changer d\'histoire, reprendre : sur place, sans recharger (le plein écran est gardé)', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));                 // Léo est mémorisé
  await ouvrir(page, '?reset=1');                        // l'écran de choix, l'exemple chargé en décor
  await page.evaluate(() => { (window as any).MARQUE = 1; });
  const marque = () => page.evaluate(() => (window as any).MARQUE);
  // Débuter le voyage : l'exemple est déjà chargé
  await page.locator('.autres-options summary').click();
  await page.locator('.carte-choix.voyage').click();
  await expect(bandeau(page)).toContainText('Coucou Clémentine');
  expect(new URL(page.url()).hash).toBe('#exemple');
  expect(await marque()).toBe(1);
  // Changer d'histoire, puis revenir : toujours la même page
  await page.locator('#btn-prefs').click(); await page.locator('#g-grands').click(); await page.locator('#pref-changer').click();
  await expect(page.locator('.ecran-choix')).toBeVisible();
  await expect(page.locator('.carte-choix.voyage')).toContainText('Clémentine');
  expect(await marque()).toBe(1);
  // Reprendre Léo : un autre profil, la page se recharge (seul cas inévitable)
  await page.locator('.carte-choix.reprendre').click();
  await expect(bandeau(page)).toContainText('Coucou Léo');
  // Puis changer d'histoire et reprendre Léo : sur place cette fois
  await page.evaluate(() => { (window as any).MARQUE = 2; });
  await page.locator('#btn-prefs').click(); await page.locator('#g-grands').click(); await page.locator('#pref-changer').click();
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

test("l'accueil : le bouton des réglages avec l'essentiel, et le thème de Quenotte au premier toucher", async ({ page }) => {
  await ouvrir(page, '?reset=1');
  await page.locator('#btn-prefs').click();
  await expect(page.locator('#pref-son')).toBeVisible();
  for (const id of ['#pref-grand', '#pref-parents', '#pref-infos', '#pref-changer', '#pref-reset']) await expect(page.locator(id)).toBeHidden();
  await page.locator('#pref-fermer').click();
  expect(await page.evaluate(() => (window as any).MUSIQUE.ambianceCourante)).toBe('accueil');
  // Dans l'histoire, le menu complet revient
  await page.locator('.carte-choix.voyage').click();
  await page.locator('#btn-prefs').click();
  await expect(page.locator('#g-grands')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#g-grands').click();
  await expect(page.locator('#pref-reset')).toBeVisible();
});

test("l'album des dents : une histoire créée y entre dès son ouverture, « en cours », et peut être supprimée", async ({ page }) => {
  await ouvrir(page, '?reset=1#p=' + code(LEO));
  await ouvrir(page, './');
  await page.locator('#lien-album').click();
  await expect(page.locator('.album-page h3')).toHaveText('Léo');
  await expect(page.locator('.album-encours')).toHaveText('en cours');
  await expect(page.locator('.album-page a')).toHaveText('Reprendre');
  await page.locator('.album .supprimer').click();
  await page.locator('.album .supprimer').click();
  await expect(page.locator('.album-page')).toHaveCount(0);
  await page.locator('.album [data-a="fermer"]').click();
  // L'accueil ne propose plus de reprendre Léo, et l'album vide n'a plus de bouton
  await expect(page.locator('.carte-choix.reprendre')).toHaveCount(0);
  await expect(page.locator('.carte-choix.parents.principale')).toBeVisible();
  await expect(page.locator('#lien-album')).toHaveCount(0);
  await ouvrir(page, './');
  await expect(page.locator('.carte-choix.reprendre')).toHaveCount(0);
});

for (const [nom, url] of [['Informations', 'infos/'], ['de présentation', 'decouvrir/']]) test(`la page ${nom} : un bouton « Accueil » toujours visible, qui ramène à l'écran d'accueil`, async ({ page }) => {
  await page.goto(url);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator('.accueil-flottant')).toBeInViewport();
  await page.locator('.accueil-flottant').click();
  await expect(page.locator('.ecran-choix')).toBeVisible();
});
