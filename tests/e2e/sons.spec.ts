// Les sons qu'on peut toucher en boucle : jamais une cacophonie
import { test, expect } from '@playwright/test';
import { ouvrir } from './aide';

test('au-dessus des Ardennes : une trompette du château à la fois, trois concerts du Cabaret Vert au plus, calés sur la même mesure', async ({ page }) => {
  await ouvrir(page, '?chapitre=1&scene=5#exemple');
  await page.evaluate(() => (window as any).SON.unlock());
  await page.waitForFunction(() => (window as any).SON.play('clic') > 0, null, { timeout: 15000 }); // la planche des bruitages est prête
  const r: (number | false)[] = await page.evaluate(() => { const S = (window as any).SON; return [1, 2, 3, 4].map(() => S.play('concert', { max: 3 })).concat([S.play('trompette', { max: 1 }), S.play('trompette', { max: 1 })]); });
  expect(r[3]).toBe(false);
  expect(r[5]).toBe(false);
  // Le 2e et le 3e concert commencent sur une mesure du premier (4 temps à 124 battements par minute) : ils finissent
  // en même temps que lui, ou une mesure après au plus (la durée rendue part du moment du toucher)
  const mesure = 4 * 60 / 124;
  for (const k of [1, 2]) {
    const ecart = (r[k] as number) - (r[0] as number);
    expect(ecart).toBeGreaterThan(-0.02);
    expect(ecart).toBeLessThan(mesure + 0.02);
  }
});
