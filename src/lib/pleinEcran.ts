// Le plein écran ne survit pas à un changement de page (règle des navigateurs).
// Si l'histoire était en plein écran, la page suivante (espace parents…) y revient au premier toucher.
// Dans l'appli installée sur l'écran d'accueil, tout est déjà en plein écran : rien à faire.
export const CLE_PLEIN = 'souris.plein';

export function pleinEcranAuPremierToucher(): void {
  let voulu = false;
  try { voulu = sessionStorage.getItem(CLE_PLEIN) === '1'; } catch { /* navigation privée */ }
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  if (!voulu || !(document.fullscreenEnabled || 'webkitRequestFullscreen' in el)) return;
  const entrer = () => {
    document.removeEventListener('click', entrer, true);
    if (document.fullscreenElement) return;
    try {
      const p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen?.();
      if (p && 'catch' in p) p.catch(() => { /* refusé : tant pis */ });
    } catch { /* pas de plein écran */ }
  };
  document.addEventListener('click', entrer, true);
}
