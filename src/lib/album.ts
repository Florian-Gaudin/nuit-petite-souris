// L'album des dents : chaque histoire créée sur l'appareil y entre tout de suite, « en cours » (QR code obtenu dans
// l'espace parents, histoire ouverte, dernière histoire mémorisée), puis elle est marquée terminée au diplôme.
// L'histoire elle-même (src/legacy/app.js) lit et écrit la même liste.
import { type Profil, encoderProfil, idProfil } from './profil';
import { stockage } from './stockage';

export const CLE_ALBUM = 'souris.album';
export interface EntreeAlbum { id: string; code: string; prenom: string; nuit: string; dent: number; deja: number[]; fini?: boolean }

export function lireAlbum(): EntreeAlbum[] {
  try { const a = JSON.parse(stockage.lire(CLE_ALBUM) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
}
const aujourdhui = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const nuitValide = (n: unknown): n is string => typeof n === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(n);
// La nuit retenue par l'histoire, si elle a déjà été ouverte sur cet appareil
function nuitProgression(id: string): string | null {
  try { const s = JSON.parse(stockage.lire('souris.progression.' + id) || 'null'); return s && nuitValide(s.nuit) ? s.nuit : null; } catch { return null; }
}

// Range (ou met à jour) une histoire ; une histoire déjà terminée le reste
export function rangerHistoire(p: Profil, opts: { nuit?: string | null; fini?: boolean } = {}): void {
  const id = idProfil(p), avant = lireAlbum(), ancien = avant.find(x => x.id === id);
  const nuit = [opts.nuit, ancien && ancien.nuit, p.nuit, nuitProgression(id)].find(nuitValide) || aujourdhui();
  const fini = !!(opts.fini || (ancien && ancien.fini !== false));
  const a = avant.filter(x => x.id !== id);
  a.push({ id, code: encoderProfil(p), prenom: p.prenom, nuit, dent: p.dents.nuit, deja: p.dents.deja, fini });
  stockage.ecrire(CLE_ALBUM, JSON.stringify(a.slice(-60)));
}

declare global {
  interface Window { ALBUM: { lire: typeof lireAlbum; ranger: typeof rangerHistoire } }
}
window.ALBUM = { lire: lireAlbum, ranger: rangerHistoire };
