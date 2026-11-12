// Hors connexion : enregistre le service worker (généré à la construction, voir outils/service-worker.ts).
// Uniquement dans un navigateur, sur le site construit : l'appli native embarque déjà ses fichiers.
import { plateforme } from './plateforme';

// Les pages annexes, chacune dans son dossier : adresses sans « .html » (…/parents/, …/mot/, …/certificat/)
export const PAGES_ANNEXES = ['parents', 'mot', 'certificat'] as const;

// La racine du site, vue depuis n'importe quelle page (histoire ou page annexe)
export function racineSite(): string {
  const dossier = new URL('./', location.href);
  const annexe = new RegExp('/(' + PAGES_ANNEXES.join('|') + ')/$').test(dossier.pathname);
  return (annexe ? new URL('../', dossier) : dossier).href;
}

export function activerHorsLigne(): void {
  if (plateforme.natif || import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  const enregistrer = () => navigator.serviceWorker.register(racineSite() + 'sw.js').catch(e => console.warn('Hors connexion indisponible :', e));
  // Le script de la page s'exécute parfois après son chargement complet (événement « load » déjà passé)
  if (document.readyState === 'complete') enregistrer(); else window.addEventListener('load', enregistrer, { once: true });
}
