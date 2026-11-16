// La bande-son dans le navigateur : au premier toucher, la planche des bruitages et la musique de l'ambiance se
// téléchargent et se décodent ; les sons se jouent sans erreur ; le Cabaret Vert reste joué en code.
import { test, expect } from '@playwright/test';
import { ouvrir } from './aide';

test('la bande-son se charge, se décode et se joue', async ({ page }) => {
  const reponses: Record<string, number> = {}, erreurs: string[] = [];
  page.on('response', r => { const u = r.url(); if (u.includes('/audio/')) reponses[u.split('/audio/')[1]] = r.status(); });
  page.on('pageerror', e => erreurs.push(String(e)));
  await ouvrir(page, '?reset=1#exemple');
  await page.locator('#bandeau-actions button').click(); // le premier toucher débloque le son
  await expect.poll(() => reponses['bruitages.mp3']).toBe(200);
  await expect.poll(() => reponses['musique/accueil.mp3']).toBe(200);
  const r = await page.evaluate(async () => {
    const W = window as any, index = await W.SON.index();
    const planche = await W.SON.decoder(await (await fetch('audio/' + index.bruitages.fichier)).arrayBuffer());
    const m = index.musique.chateau, morceau = await W.SON.decoder(await (await fetch('audio/' + m.fichier)).arrayBuffer());
    ['clic', 'page', 'pas', 'badge', 'concert'].forEach(n => W.SON.play(n));
    return { planche: planche.duration, attendu: index.bruitages.duree, morceau: morceau.duration, fin: m.finBoucle };
  });
  expect(Math.abs(r.planche - r.attendu)).toBeLessThan(0.1);   // le décodage tombe juste
  expect(r.morceau).toBeGreaterThanOrEqual(r.fin);              // la boucle tient dans le fichier
  expect(erreurs).toEqual([]);
});
