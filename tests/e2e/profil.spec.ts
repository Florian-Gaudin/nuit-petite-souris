// Le profil de l'enfant, transporté par le QR code (#p=…)
import { test, expect } from '@playwright/test';
import LZString from 'lz-string';
import { LEO, code, ouvrir, bandeau } from './aide';

test('sans profil : l\'exemple de Clémentine, avec le lien vers l\'espace parents', async ({ page }) => {
  await ouvrir(page, '?reset=1');
  expect(await page.evaluate(() => (window as any).PROFIL.origine)).toBe('exemple');
  await expect(bandeau(page)).toContainText('Clémentine');
  await expect(page.locator('.lien-parents')).toBeVisible();
});

test('le QR de Léo : profil lu, mémorisé, progression séparée', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));
  expect(await page.evaluate(() => (window as any).PROFIL.origine)).toBe('adresse');
  await expect(bandeau(page)).toContainText('Coucou Léo');
  await expect(page.locator('.lien-parents')).toHaveCount(0);
  // Sans « # », le profil est retrouvé en mémoire
  await ouvrir(page, './');
  expect(await page.evaluate(() => (window as any).PROFIL.origine)).toBe('memoire');
  await expect(bandeau(page)).toContainText('Léo');
  // Recommencer garde le profil
  await ouvrir(page, '?reset=1#p=' + code(LEO));
  expect(new URL(page.url()).hash).toBe('#p=' + code(LEO));
});

test('un QR falsifié est ignoré, sans injecter de code dans la page', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));
  const faux = LZString.compressToEncodedURIComponent('1|<img src=x onerror=alert(1)>|g|7||Pantoufle|81|0|50|3|Lyon|69001|69||');
  const alertes: string[] = [];
  page.on('dialog', d => { alertes.push(d.message()); d.dismiss(); });
  await ouvrir(page, './#p=' + faux);
  expect(await page.evaluate(() => (window as any).PROFIL.origine)).toBe('memoire');
  await expect(bandeau(page)).toContainText('Léo');
  expect(await page.locator('img[src="x"]').count()).toBe(0);
  expect(alertes).toEqual([]);
});

test('le mot A6 et le diplôme suivent le profil', async ({ page }) => {
  await page.goto('mot.html#p=' + code(LEO));
  await expect(page.locator('#titre')).toContainText('Léo');
  await expect(page.locator('#cadeau')).toContainText('sur ton bureau');
  await expect(page.locator('#qr svg path')).toHaveCount(1);
  await page.goto('certificat.html#p=' + code(LEO));
  await expect(page.locator('.dip-nom')).toHaveText('Léo');
  await expect(page.locator('a[href^="index.html"]')).toHaveAttribute('href', 'index.html#p=' + code(LEO));
});
