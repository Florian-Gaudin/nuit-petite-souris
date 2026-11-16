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
  // Le 2e et le 3e concert attendent la mesure suivante du premier (4 temps à 124 battements par minute)
  const mesure = 4 * 60 / 124;
  expect((r[1] as number) - (r[0] as number)).toBeGreaterThan(mesure - 0.2);
  expect((r[1] as number) - (r[0] as number)).toBeLessThan(mesure + 0.05);
});
