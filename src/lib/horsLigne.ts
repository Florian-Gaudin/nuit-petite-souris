// Hors connexion : enregistre le service worker (généré à la construction, voir outils/service-worker.ts).
// Uniquement dans un navigateur, sur le site construit : l'appli native embarque déjà ses fichiers.
import { plateforme } from './plateforme';

// Les pages annexes, chacune dans son dossier : adresses sans « .html » (…/parents/, …/mot/, …/certificat/)
export const PAGES_ANNEXES = ['parents', 'mot', 'certificat', 'infos'] as const;

// La racine du site, vue depuis n'importe quelle page (histoire ou page annexe)
export function racineSite(): string {
  const dossier = new URL('./', location.href);
  const annexe = new RegExp('/(' + PAGES_ANNEXES.join('|') + ')/$').test(dossier.pathname);
  return (annexe ? new URL('../', dossier) : dossier).href;
}

export function activerHorsLigne(): void {
  if (plateforme.natif || import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  const enregistrer = () => navigator.serviceWorker.register(racineSite() + 'sw.js').then(reg => {
    // L'appli installée reste souvent ouverte en arrière-plan : à chaque retour, on demande s'il existe une nouvelle version
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => { }); });
  }).catch(e => console.warn('Hors connexion indisponible :', e));
  // Une nouvelle version vient de prendre le relais : on recharge, mais seulement quand l'enfant n'est pas en pleine
  // lecture (l'appli revient au premier plan), pour ne jamais couper une scène
  const dejaControle = !!navigator.serviceWorker.controller;
  let aRecharger = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!dejaControle) return; // la toute première installation : rien à recharger
    if (document.visibilityState === 'hidden') location.reload(); else aRecharger = true;
  });
  document.addEventListener('visibilitychange', () => { if (aRecharger && document.visibilityState === 'visible') location.reload(); });
  // Le script de la page s'exécute parfois après son chargement complet (événement « load » déjà passé)
  if (document.readyState === 'complete') enregistrer(); else window.addEventListener('load', enregistrer, { once: true });
}
