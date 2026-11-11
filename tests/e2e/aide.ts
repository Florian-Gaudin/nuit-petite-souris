// Outils communs aux tests de bout en bout
import { expect, type Page } from '@playwright/test';
import { type Profil, PROFIL_EXEMPLE, encoderProfil } from '../../src/lib/profil';

// Trois enfants, trois histoires
export const LEO: Profil = { ...structuredClone(PROFIL_EXEMPLE), prenom: 'Léo', genre: 'g', doudou: { type: 'aucun', nom: '' }, dents: { nuit: 81, deja: [] }, billet: 50, cachette: 'bureau', ville: { nom: 'Lyon', codePostal: '69001', departement: '69' }, nuit: '2026-11-10' };
export const INES: Profil = { ...structuredClone(PROFIL_EXEMPLE), prenom: 'Inès', doudou: { type: 'licorne', nom: 'Paillette' }, fratrie: { prenom: 'Tom', genre: 'g', dortACote: true }, dents: { nuit: 72, deja: [81, 71] }, billet: 10, cachette: 'radiateur', ville: { nom: 'Sedan', codePostal: '08200', departement: '08' }, nuit: '2026-11-10' };
export const code = (p: Profil) => encoderProfil(p);

// Ouvre une page de l'histoire et attend que le moteur soit prêt
export async function ouvrir(page: Page, chemin: string) {
  await page.goto(chemin);
  await page.waitForFunction(() => !!(window as any).APP && !!document.querySelector('#bandeau-texte'));
}

export const bandeau = (page: Page) => page.locator('#bandeau-texte');

// Rend un texte de DATA comme le moteur : version choisie selon le profil, puis mots remplacés
export async function rendu(page: Page, chemin: (string | number)[]): Promise<string | null> {
  return page.evaluate(ch => {
    const W = window as any;
    const brut = ch.reduce((x: any, k) => x?.[k], W.DATA);
    const r = W.RECIT.resoudre(brut);
    if (r == null) return null;
    const s = typeof r === 'string' ? r : r.txt;
    return s.replace(/\{(\w+)\}/g, (m: string, k: string) => (W.CONFIG[k] != null ? W.CONFIG[k] : m));
  }, chemin);
}

// Clique au centre d'un élément (vrai clic de souris, comme un doigt)
export async function toucher(page: Page, selecteur: string) {
  const el = page.locator(selecteur).first();
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  expect(b, 'élément visible : ' + selecteur).not.toBeNull();
  await page.mouse.click(b!.x + b!.width / 2, b!.y + b!.height / 2);
}

export async function attendreChargement(page: Page) {
  await expect(page.locator('#bandeau-texte')).toBeVisible();
}
