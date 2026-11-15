// Le don : une ligne discrète sur l'accueil, qui mène (derrière le verrou des parents) à la carte de don
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// L'adresse réglée dans src/lib/don.ts (lue dans le fichier : le module, lui, a besoin d'un navigateur)
const LIEN_DON = /export const LIEN_DON(?:: string)? = '([^']*)'/.exec(readFileSync(new URL('../../src/lib/don.ts', import.meta.url), 'utf8'))![1];
import { ouvrir, tenirVerrou } from './aide';

test('le don : discret sur l\'accueil, complet dans l\'espace parents', async ({ page }) => {
  await ouvrir(page, '?reset=1');
  if (!LIEN_DON) {
    // Tant que l'adresse de la page de don n'est pas réglée, rien ne s'affiche
    await expect(page.locator('.don-accueil')).toHaveCount(0);
    await page.goto('parents/');
    await tenirVerrou(page);
    await expect(page.locator('#don')).toHaveCount(0);
    return;
  }
  // L'accueil mène à l'espace parents (verrou), jamais directement au paiement
  await expect(page.locator('.don-accueil a')).toHaveAttribute('href', 'parents/#don');
  await page.locator('.don-accueil a').click();
  await expect(page.locator('.tenir')).toBeVisible();
  await tenirVerrou(page);
  await expect(page.locator('#don a')).toHaveAttribute('href', LIEN_DON);
});
