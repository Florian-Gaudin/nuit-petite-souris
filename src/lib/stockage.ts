// Stockage de la progression et des réglages.
// Sur le web : la mémoire du navigateur (localStorage).
// Dans l'appli native (Capacitor) : le stockage natif (Preferences), plus sûr que la mémoire
// d'une WebView, que le système peut vider. Les valeurs natives sont chargées une fois au
// démarrage (initStockage) puis lues de façon synchrone, comme avant.
import { Capacitor } from '@capacitor/core';

const cache = new Map<string, string>();
let natif = false;

async function preferences() {
  return (await import('@capacitor/preferences')).Preferences;
}

export async function initStockage(): Promise<void> {
  natif = Capacitor.isNativePlatform();
  if (!natif) return;
  const P = await preferences();
  const { keys } = await P.keys();
  for (const key of keys) {
    const { value } = await P.get({ key });
    if (value != null) cache.set(key, value);
  }
}

export const stockage = {
  lire(cle: string): string | null {
    if (natif) return cache.get(cle) ?? null;
    try { return localStorage.getItem(cle); } catch { return null; }
  },
  ecrire(cle: string, valeur: string): void {
    if (natif) {
      cache.set(cle, valeur);
      void preferences().then(P => P.set({ key: cle, value: valeur }));
      return;
    }
    try { localStorage.setItem(cle, valeur); } catch { /* stockage indisponible (navigation privée) */ }
  },
  effacer(cle: string): void {
    if (natif) {
      cache.delete(cle);
      void preferences().then(P => P.remove({ key: cle }));
      return;
    }
    try { localStorage.removeItem(cle); } catch { /* idem */ }
  },
};

declare global {
  interface Window { STOCKAGE: typeof stockage }
}
window.STOCKAGE = stockage;
