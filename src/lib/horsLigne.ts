// Hors connexion : enregistre le service worker (généré à la construction, voir outils/service-worker.ts).
// Uniquement dans un navigateur, sur le site construit : l'appli native embarque déjà ses fichiers.
import { plateforme } from './plateforme';

export function activerHorsLigne(): void {
  if (plateforme.natif || import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(e => console.warn('Hors connexion indisponible :', e));
  });
}
