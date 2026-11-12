// Le profil de l'enfant, transporté par le QR code (#p=…)
import { test, expect, type Page } from '@playwright/test';
import LZString from 'lz-string';
import { LEO, code, ouvrir, bandeau } from './aide';

const origine = (page: Page) => page.evaluate(() => (window as any).PROFIL?.origine).catch(() => null);

test('sans profil : l\'écran de choix, puis l\'exemple de Clémentine', async ({ page }) => {
  await ouvrir(page, '?reset=1');
  expect(await origine(page)).toBe('choix');
  await expect(page.locator('#fil')).toBeHidden();
  await expect(page.locator('.carte-choix')).toHaveCount(2); // pas encore d'histoire à reprendre
  await expect(page.locator('.carte-choix.parents')).toHaveAttribute('href', 'parents/');
  await page.locator('.carte-choix.voyage').click();
  await expect.poll(() => origine(page)).toBe('exemple');
  await expect(bandeau(page)).toContainText('Coucou Clémentine');
  await expect(page.locator('#fil')).toBeVisible();
});

test('le QR de Léo : profil lu, mémorisé, progression séparée', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));
  expect(await origine(page)).toBe('adresse');
  await expect(bandeau(page)).toContainText('Coucou Léo');
  await expect(page.locator('.choix')).toHaveCount(0);
  // Sans « # » : l'écran de choix propose de reprendre l'histoire de Léo
  await ouvrir(page, './');
  expect(await origine(page)).toBe('choix');
  await expect(page.locator('.carte-choix')).toHaveCount(3);
  await page.locator('.carte-choix.reprendre', { hasText: 'Léo' }).click();
  await expect.poll(() => origine(page)).toBe('adresse');
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
  expect(await origine(page)).toBe('choix');
  await expect(page.locator('.carte-choix.reprendre')).toContainText('Léo');
  expect(await page.locator('img[src="x"]').count()).toBe(0);
  expect(alertes).toEqual([]);
});

test('le mot A6 et le diplôme suivent le profil', async ({ page }) => {
  await page.goto('mot/#p=' + code(LEO));
  await expect(page.locator('#titre')).toContainText('Léo');
  await expect(page.locator('#cadeau')).toContainText('sur ton bureau');
  await expect(page.locator('#qr svg path')).toHaveCount(1);
  await page.goto('certificat/#p=' + code(LEO));
  await expect(page.locator('.dip-nom')).toHaveText('Léo');
  await expect(page.locator('#retour')).toHaveAttribute('href', '../#p=' + code(LEO));
});
