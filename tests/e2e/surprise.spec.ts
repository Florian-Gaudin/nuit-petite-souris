// Mode surprise : avant le matin prévu, Quenotte dit de revenir au réveil ; les parents ont un aperçu
import { test, expect } from '@playwright/test';
import { LEO, code, ouvrir, bandeau } from './aide';
import { nuitParDefaut } from '../../src/lib/profil';

// Une nuit dont le réveil n'est pas encore arrivé : ce soir (ou la nuit en cours)
const ceSoir = () => { const d = new Date(); if (d.getHours() < 5) d.setDate(d.getDate() - 1); return nuitParDefaut(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20)); };

test('trop tôt : « reviens me voir », pas de bouton pour commencer', async ({ page }) => {
  const profil = { ...LEO, nuit: ceSoir() };
  await ouvrir(page, '#p=' + code(profil));
  expect(await page.evaluate(() => (window as any).PROFIL.surprise)).toBe(true);
  await expect(bandeau(page)).toContainText('Je ne suis pas encore passée chez toi');
  await expect(bandeau(page)).toContainText('reviens me voir');
  await expect(page.locator('#bandeau-actions button')).toHaveCount(0);
  await expect(page.locator('.sous')).toContainText('Rendez-vous');
});

test('aperçu pour les parents : l\'histoire est visible tout de suite', async ({ page }) => {
  const profil = { ...LEO, nuit: ceSoir() };
  await ouvrir(page, '?apercu=1#p=' + code(profil));
  expect(await page.evaluate(() => (window as any).PROFIL.surprise)).toBe(false);
  await expect(page.locator('#bandeau-actions button')).toContainText('Viens, je te raconte');
});

test('au réveil : l\'histoire s\'ouvre normalement', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO)); // nuit du 10 novembre 2026 : réveil passé
  expect(await page.evaluate(() => (window as any).PROFIL.surprise)).toBe(false);
  await expect(page.locator('#bandeau-actions button')).toContainText('Viens, je te raconte');
});
