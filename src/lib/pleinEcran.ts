// Le plein écran automatique, sur toutes les pages : aucun navigateur ne l'autorise sans geste, on le demande donc
// à chaque toucher tant qu'il n'est pas actif (il ne survit pas à un changement de page, ni au bouton retour).
// Seule exception : « Plein écran » décoché à la main dans les réglages. Ce choix est gardé sur l'appareil jusqu'à ce
// qu'on le recoche ; quitter le plein écran par la touche Échap ou le geste retour ne compte pas comme un refus :
// le toucher suivant le remet.
// Dans l'appli installée (écran d'accueil, appli native), tout est déjà en plein écran : rien à faire.
export const CLE_REFUS = 'souris.plein.refuse';

type El = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type Doc = Document & { webkitFullscreenElement?: Element | null; webkitFullscreenEnabled?: boolean };

export const pleinEcranPossible = (): boolean => {
  const d = document as Doc;
  return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
};
export const pleinEcranActif = (): boolean => {
  const d = document as Doc;
  return !!(d.fullscreenElement || d.webkitFullscreenElement);
};
export function pleinEcranRefuse(): boolean {
  try { return localStorage.getItem(CLE_REFUS) === '1'; } catch { return false; }
}
// Décoché à la main dans les réglages (true), ou recoché (false)
export function refuserPleinEcran(non: boolean): void {
  try { if (non) localStorage.setItem(CLE_REFUS, '1'); else localStorage.removeItem(CLE_REFUS); } catch { /* navigation privée */ }
}
export function entrerPleinEcran(): void {
  const el = document.documentElement as El;
  try {
    const p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen?.();
    if (p && 'catch' in p) p.catch(() => { /* refusé : tant pis */ });
  } catch { /* pas de plein écran */ }
}
const installee = (): boolean => {
  try { return matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true; } catch { return false; }
};

export function pleinEcranAuPremierToucher(): void {
  if (!pleinEcranPossible() || installee()) return;
  const entrer = (e: Event) => {
    // Le bouton des réglages et son menu (où l'on peut décocher le plein écran) ne déclenchent rien
    const t = e.target as Element | null;
    if (t && t.closest && t.closest('.prefs')) return;
    // À chaque toucher : sorti du plein écran autrement que par le menu (retour du téléphone, Échap), il revient
    if (pleinEcranActif() || pleinEcranRefuse()) return;
    entrerPleinEcran();
  };
  document.addEventListener('click', entrer, true);
}

declare global {
  interface Window { PLEIN_ECRAN: { refuse: typeof pleinEcranRefuse; refuser: typeof refuserPleinEcran } }
}
window.PLEIN_ECRAN = { refuse: pleinEcranRefuse, refuser: refuserPleinEcran };
