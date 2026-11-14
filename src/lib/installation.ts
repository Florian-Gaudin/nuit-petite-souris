// Installer le site comme une appli (écran d'accueil, plein écran, hors connexion), sans passer par un store.
// Selon l'appareil : bouton d'installation du navigateur, gestes à faire sur iPhone/iPad,
// ou passage par Chrome sur Android (Samsung Internet fabrique une appli que Play Protect bloque).
import { racineSite } from './horsLigne';

export type Appareil = 'installee' | 'ios' | 'android-chrome' | 'android-autre' | 'ordinateur';

// L'invitation du navigateur (Chrome, Edge…), gardée pour le bouton « Installer l'appli »
interface InvitationInstallation extends Event { prompt(): Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
let invitation: InvitationInstallation | null = null;
const abonnes = new Set<() => void>();
const prevenir = () => abonnes.forEach(f => f());
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); invitation = e as InvitationInstallation; prevenir(); });
  window.addEventListener('appinstalled', () => { invitation = null; prevenir(); });
}

export function surChangement(f: () => void): () => void { abonnes.add(f); return () => abonnes.delete(f); }
export const installable = () => invitation !== null;

export async function installer(): Promise<boolean> {
  if (!invitation) return false;
  const inv = invitation;
  await inv.prompt();
  const { outcome } = await inv.userChoice;
  invitation = null; prevenir();
  return outcome === 'accepted';
}

// Lancée depuis l'icône de l'écran d'accueil ? L'appli installée démarre sur « ?source=appli » (manifeste) :
// la marque est retenue pour toute la visite. On ne se fie pas au seul « display-mode: fullscreen »,
// qui est vrai aussi dans un navigateur passé en plein écran par l'histoire.
const CLE_APPLI = 'souris.appli';
export function noterLancement(): void {
  const p = new URLSearchParams(location.search);
  if (p.get('source') !== 'appli') return;
  try { sessionStorage.setItem(CLE_APPLI, '1'); } catch { /* navigation privée */ }
  p.delete('source');
  const reste = p.toString();
  try { history.replaceState(null, '', location.pathname + (reste ? '?' + reste : '') + location.hash); } catch { /* adresse inchangée */ }
}
export function estAppliInstallee(): boolean {
  let marque = false;
  try { marque = sessionStorage.getItem(CLE_APPLI) === '1'; } catch { /* navigation privée */ }
  return marque || matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function appareil(ua = navigator.userAgent): Appareil {
  if (estAppliInstallee()) return 'installee';
  // iPadOS se présente comme un Mac : on le reconnaît à l'écran tactile
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) {
    const chrome = /Chrome\/\d/.test(ua) && !/SamsungBrowser|EdgA|OPR|Firefox|YaBrowser|MiuiBrowser|HuaweiBrowser|wv\)/.test(ua);
    return chrome ? 'android-chrome' : 'android-autre';
  }
  return 'ordinateur';
}

// Ouvre l'histoire dans Chrome depuis un autre navigateur Android (lien « intent »)
export function lienChrome(): string {
  const u = new URL(racineSite());
  return `intent://${u.host}${u.pathname}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(u.href)};end`;
}
