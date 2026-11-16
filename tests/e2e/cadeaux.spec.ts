// Les cadeaux : pièce, billet, petit paquet surprise, boîte de chocolats ; le paquet et les chocolats traversent la rivière
// dans une coquille de noix, comme la pièce, et les chocolats ne sèchent jamais « au chaud »
import { test, expect, type Page } from '@playwright/test';
import { LEO, code, ouvrir, bandeau } from './aide';

const avancer = async (page: Page, jusqua: (p: Page) => Promise<boolean>) => {
  for (let i = 0; i < 60 && !(await jusqua(page)); i++) {
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) await page.locator('.bandeau-suite').click();
    await page.waitForTimeout(250);
  }
};

for (const [billet, nom, demande, reponse] of [
  [100, 'paquet', 'Un paquet, ça prend l\'eau', 'son joli papier'],
  [101, 'chocolat', 'Des chocolats, ça ne nage pas', 'restés bien à l\'abri'],
] as const) {
  test(`la rivière avec ${nom === 'paquet' ? 'le petit paquet surprise' : 'la boîte de chocolats'}`, async ({ page }) => {
    const p = code({ ...structuredClone(LEO), billet, cachette: 'cheminee' });
    await ouvrir(page, '?reset=1#p=' + p);
    await ouvrir(page, '?chapitre=1&scene=5#p=' + p);
    await avancer(page, async pg => (await pg.locator('.tap[data-el="billet"].cible').count()) > 0);
    await expect(bandeau(page)).toContainText(demande);
    if (process.env.CAPTURES) await page.screenshot({ path: `${process.env.CAPTURES}/meuse-${nom}-0.png` });
    for (let k = 0; k < 3; k++) {
      await page.locator('.tap[data-el="billet"]').click({ force: true });
      await page.waitForTimeout(700);
    }
    await expect(bandeau(page)).toContainText(reponse, { timeout: 15_000 });
    if (nom === 'chocolat') await expect(bandeau(page)).not.toContainText('au chaud');
    if (process.env.CAPTURES) await page.screenshot({ path: `${process.env.CAPTURES}/meuse-${nom}-1.png` });
    // Le diplôme le raconte aussi
    await page.goto('certificat/#p=' + p);
    await expect(page.locator('.dip-texte')).toContainText(nom === 'paquet' ? 'Son petit paquet surprise a traversé' : 'Sa boîte de chocolats a traversé');
  });
}
