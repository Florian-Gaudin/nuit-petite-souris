// Le récit adaptatif : Clémentine retrouve mot pour mot les textes d'origine ; Léo et Inès ont leur version
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { LEO, INES, code, ouvrir, rendu } from './aide';

const ORIGINE: { textes: { chemin: (string | number)[]; texte: string }[] } = JSON.parse(readFileSync(new URL('../fixtures/textes-origine.json', import.meta.url), 'utf8'));

test('Clémentine : textes identiques mot pour mot à la première histoire', async ({ page }) => {
  await ouvrir(page, '?reset=1');
  const ecarts: string[] = [];
  for (const { chemin, texte } of ORIGINE.textes) {
    const nouveau = chemin[0] === 'lettre' || chemin[0] === 'scene13'
      ? await page.evaluate(([liste, i]) => { const W = window as any; const l = W.DATA[liste].map((x: any) => { const r = W.RECIT.resoudre(x); return r == null ? null : String(typeof r === 'string' ? r : r.txt).replace(/\{(\w+)\}/g, (m: string, k: string) => W.CONFIG[k] ?? m); }).filter((x: any) => x != null); return l[i as number]; }, chemin)
      : await rendu(page, chemin);
    if (nouveau !== texte) ecarts.push(`${chemin.join('.')}\n  avant : ${texte}\n  après : ${nouveau}`);
  }
  expect(ecarts, ecarts.join('\n')).toEqual([]);
  expect(ORIGINE.textes.length).toBeGreaterThanOrEqual(21);
});

test('Léo : première dent, garçon, sans doudou, 50 € sur le bureau', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));
  expect(await rendu(page, ['scenes', 0, 'intro'])).toContain('Elle attend ta toute première dent');
  expect(await rendu(page, ['scenes', 0, 'elements', 'sac', 'bulle'])).toContain('billet de 50 euros');
  expect(await rendu(page, ['scenes', 2, 'elements', 'billet', 'reponse'])).toContain('je le ferai sécher sur ton bureau.');
  expect(await rendu(page, ['scenes', 6, 'elements', 'yeux', 'reponse'])).toContain('toute la maison va se réveiller');
  expect(await rendu(page, ['lettre', 0])).toBe('Cher Léo,');
  expect(await rendu(page, ['badges', 6, 'nom'])).toBe('Première dent');
  await page.goto('certificat.html#p=' + code(LEO));
  await expect(page.locator('.dip-texte')).toContainText('1re dent de lait');
  await expect(page.locator('.dip-texte')).toContainText('50 €');
  await expect(page.locator('.dip-sign')).toContainText('la lune');
});

test('Inès : troisième dent, licorne, frère Tom dans la chambre, 10 € sur le radiateur', async ({ page }) => {
  await ouvrir(page, '#p=' + code(INES));
  expect(await rendu(page, ['scenes', 0, 'elements', 'lanterne', 'demande'])).toContain('ta troisième dent est tombée');
  expect(await rendu(page, ['scenes', 5, 'elements', 'fenetre', 'bulle'])).toContain('Je vois Tom qui dort à côté de toi');
  expect(await rendu(page, ['scenes', 6, 'elements', 'yeux', 'reponse'])).toContain('ton frère Tom va se réveiller');
  expect(await rendu(page, ['camera', 'cheminee'])).toMatch(/^Voilà ton radiateur, bien éteint\..*au chaud/);
  expect(await rendu(page, ['badges', 6, 'nom'])).toBe('Collectionneuse');
  await page.goto('certificat.html#p=' + code(INES));
  await expect(page.locator('.dip-texte')).toContainText('3e dent de lait, une incisive latérale du bas');
  await expect(page.locator('.dip-sign')).toContainText('Paillette');
  await expect(page.locator('.machoire rect[fill="#D64045"]')).toHaveCount(1);
  await expect(page.locator('.machoire rect[fill="#F2A3B5"]')).toHaveCount(2);
});

test('dessins personnalisés : billet, doudou, cachette, frère dans la caméra', async ({ page }) => {
  await ouvrir(page, '?chapitre=1&scene=2#p=' + code(LEO));
  await expect(page.locator('#billet text').first()).toHaveText('50');
  await ouvrir(page, '?chapitre=3&t=34#p=' + code(INES));
  expect(await page.locator('#doudou').evaluate(g => g.childElementCount)).toBeGreaterThan(3);
  await expect(page.locator('#fratrie')).toHaveCount(1);
  await ouvrir(page, '?chapitre=3&t=34#p=' + code(LEO));
  expect(await page.locator('#doudou').evaluate(g => g.childElementCount)).toBe(0);
  await expect(page.locator('#fratrie')).toHaveCount(0);
});
