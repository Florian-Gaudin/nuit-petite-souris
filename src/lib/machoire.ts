// Le schéma des dents du diplôme : les 20 dents de lait, la dent de la nuit en rouge (avec une étoile),
// celles déjà tombées en rose.
import type { Profil } from './profil';
import { nomDent } from './profil';
import { PLACES, ETOILE } from './geometrieDents';

export function svgMachoire(p: Profil): string {
  const deja = new Set(p.dents.deja);
  let dents = '';
  for (const t of PLACES) {
    const nuit = t.d === p.dents.nuit, tombee = deja.has(t.d);
    const fond = nuit ? '#D64045' : tombee ? '#F2A3B5' : '#fff';
    const trait = nuit ? '#9a2a32' : tombee ? '#c46a7e' : '#b9a77a';
    dents += `<g transform="translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) rotate(${t.angle.toFixed(1)})"><rect x="${-t.l / 2}" y="${-t.h / 2}" width="${t.l}" height="${t.h}" rx="7" fill="${fond}" stroke="${trait}" stroke-width="2"/>${nuit ? `<path d="${ETOILE}" fill="#FFC857"/>` : ''}</g>`;
  }
  const n = p.dents.deja.length;
  const resume = `Schéma des dents de lait. Tombée cette nuit : ${nomDent(p.dents.nuit)}.` + (n ? ` Déjà tombées avant : ${n}.` : '');
  return `<svg class="machoire" viewBox="0 18 340 268" role="img" aria-label="${resume}">${dents}</svg>`
    + `<div class="machoire-legende"><span class="pastille-dent rouge"></span> cette nuit` + (n ? ` · <span class="pastille-dent rose"></span> déjà tombée${n > 1 ? 's' : ''}` : '') + `</div>`;
}

declare global { interface Window { MACHOIRE: (p: Profil) => string } }
window.MACHOIRE = svgMachoire;
