// L'espace parents : verrou, cinq étapes, ville (service simulé), QR code, aperçu
import { test, expect, type Page } from '@playwright/test';
import { toucher } from './aide';

const COMMUNES = [{ nom: 'Charleville-Mézières', codesPostaux: ['08000'], codeDepartement: '08' }, { nom: 'Charleville', codesPostaux: ['51120'], codeDepartement: '51' }];

async function deverrouiller(page: Page) {
  await page.goto('parents.html');
  const b = (await page.locator('.tenir').boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(3500);
  await page.mouse.up();
  await expect(page.locator('form.carte')).toBeVisible();
}

test('création complète d\'un profil jusqu\'au QR code', async ({ page }) => {
  // Le service des communes est simulé : le test ne dépend pas du réseau
  await page.route('https://geo.api.gouv.fr/**', r => r.fulfill({ json: COMMUNES }));
  await deverrouiller(page);
  const suivant = page.locator('button[type=submit]');

  // 1. L'enfant
  await suivant.click();
  await expect(page.locator('.erreurs')).toContainText('prénom');
  await page.locator('input[type=text]').first().fill('Léa');
  await page.getByText('une fille', { exact: true }).click();
  await page.locator('.option.icone', { hasText: 'Lapin' }).click();
  await page.getByLabel('Le nom du doudou').fill('Pompon');
  await page.getByText('Oui, Quenotte pourra en parler').click();
  await page.getByText('un frère', { exact: true }).click();
  await page.getByLabel('Son prénom').fill('Tom');
  await suivant.click();

  // 2. La dent : la 51 cette nuit, sa jumelle 61 déjà tombée
  await expect(page.locator('.bouche .dent')).toHaveCount(20);
  await toucher(page, '.bouche .dent[aria-label^="incisive centrale du haut, à droite"]');
  await toucher(page, '.bouche .dent[aria-label^="incisive centrale du haut, à gauche"]');
  await expect(page.locator('.resume')).toContainText('2e dent');
  await expect(page.locator('.resume')).toContainText('jumelle');
  await suivant.click();

  // 3. Le cadeau
  await page.locator('.option.billet', { hasText: '20 €' }).click();
  await page.locator('.option.icone', { hasText: 'Le radiateur' }).click();
  await suivant.click();

  // 4. La maison
  await page.locator('.ville input').fill('Charleville');
  await page.locator('#liste-villes li button').first().click();
  await expect(page.locator('.choisie')).toContainText('Charleville-Mézières (08000)');
  await page.getByLabel('Le chat du voisin, qui dort devant la porte').fill('Félix');
  await suivant.click();

  // 5. La nuit
  await page.locator('input[type=date]').fill('2026-12-24');
  await suivant.click();

  // Le QR code et ses liens
  await expect(page.locator('.resultat h2')).toContainText('Léa');
  await expect(page.locator('.resultat .qr svg path')).toHaveCount(1);
  const recap = page.locator('.recap');
  for (const mot of ['Pompon', '20 €', 'radiateur', 'Charleville-Mézières', '24 décembre']) await expect(recap).toContainText(mot);
  const histoire = await page.locator('a[href^="index.html?apercu"]').getAttribute('href');
  const mot = await page.locator('a[href^="mot.html#p="]').getAttribute('href');
  expect(histoire).toContain('apercu=1');
  expect(histoire!.split('#')[1]).toBe(mot!.split('#')[1]);

  // L'histoire, ouverte depuis l'aperçu
  await page.goto(histoire!);
  await page.waitForFunction(() => !!(window as any).APP);
  const p = await page.evaluate(() => (window as any).PROFIL.profil);
  expect(p).toMatchObject({ prenom: 'Léa', genre: 'f', doudou: { type: 'lapin', nom: 'Pompon' }, fratrie: { prenom: 'Tom', genre: 'g', dortACote: true }, chat: 'Félix', billet: 20, cachette: 'radiateur', nuit: '2026-12-24' });
  expect(p.dents).toEqual({ nuit: 51, deja: [61] });
  expect(p.ville).toEqual({ nom: 'Charleville-Mézières', codePostal: '08000', departement: '08' });
});

test('ville : service lent ou coupé, le nom tapé est gardé', async ({ page }) => {
  await page.route('https://geo.api.gouv.fr/**', () => { /* ne répond jamais */ });
  await page.goto('parents.html');
  await page.evaluate(() => {
    sessionStorage.setItem('souris.parents', '1');
    localStorage.setItem('souris.parents.brouillon', JSON.stringify({ prenom: 'Léa', genre: 'f', doudouType: 'lapin', doudouNom: 'Pompon', dentNuit: 51, dentsDeja: [61], billet: 20, cachette: 'radiateur' }));
  });
  await page.reload();
  await page.locator('.etapes button').nth(3).click();
  await page.locator('.ville input').fill('Reims');
  await expect(page.locator('.ville .message')).toContainText('Recherche');
  await expect(page.locator('.ville .message')).toContainText('lentement', { timeout: 10_000 });
  await page.locator('.etapes button').nth(4).click();
  await expect(page.locator('.carte h2')).toHaveText('La nuit');
});
