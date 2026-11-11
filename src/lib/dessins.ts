// Dessins personnalisés selon le profil : doudou, cachette filmée, enfant et frère ou sœur endormis.
// Caméra : style vision nocturne (repère 400 × 300). Fenêtre d'Aiglemont : silhouettes sombres.
import type { Cachette, Genre, TypeDoudou } from './profil';

const VERT = '#39FF14', VERT2 = '#2fbf2f', FOND = '#0f4a1b', FOND2 = '#0b3a14', TRAIT = '#1d7a2c';
const trait = (w = 2) => `stroke="${VERT}" stroke-width="${w}"`;
const forme = (w = 2) => `fill="${FOND}" ${trait(w)}`;

// ---------- Le doudou dans la caméra, serré contre l'enfant (repère autour de 196,140) ----------
export function doudouCam(type: TypeDoudou): string {
  const corps = `<ellipse cx="198" cy="158" rx="13" ry="11" ${forme()}/>`;
  const patte = `<circle cx="209" cy="163" r="4.5" ${forme(1.6)}/>`;
  const yeux = `<path d="M188 136q2.5 2 5 0M198.5 136q2.5 2 5 0" fill="none" ${trait(1.6)} stroke-linecap="round"/>`;
  const tete = `<circle cx="195.5" cy="138" r="12" ${forme()}/>`;
  const museau = `<ellipse cx="196" cy="143" rx="5.5" ry="4" fill="${FOND2}" ${trait(1.5)}/><circle cx="196" cy="141.5" r="1.6" fill="${VERT}"/>`;
  const dessins: Record<TypeDoudou, string> = {
    ours: `${corps}<circle cx="186" cy="127" r="5.5" ${forme()}/><circle cx="205" cy="127" r="5.5" ${forme()}/>${tete}${museau}${yeux}${patte}`,
    lapin: `${corps}<ellipse cx="189" cy="116" rx="4" ry="12" ${forme()} transform="rotate(-12 189 116)"/><ellipse cx="202" cy="116" rx="4" ry="12" ${forme()} transform="rotate(12 202 116)"/>${tete}<path d="M193 143h6l-3 3z" fill="${VERT}"/>${yeux}${patte}`,
    chat: `${corps}<path d="M185 131l1-12 9 8M206 131l-1-12-9 8" ${forme()} stroke-linejoin="round"/>${tete}<path d="M193 142h5l-2.5 2.5z" fill="${VERT}"/><path d="M186 144l-9-1M186 147l-9 2M205 144l9-1M205 147l9 2" ${trait(1)}/>${yeux}${patte}`,
    chien: `${corps}${tete}<ellipse cx="183" cy="139" rx="4.5" ry="9" ${forme()} transform="rotate(15 183 139)"/><ellipse cx="208" cy="139" rx="4.5" ry="9" ${forme()} transform="rotate(-15 208 139)"/>${museau}${yeux}${patte}`,
    bebe: `<path d="M186 166q12-22 24 0z" ${forme()}/>${tete}<path d="M184 134q11-16 23 0" fill="${FOND2}" ${trait(2)}/><circle cx="195.5" cy="124" r="3" ${forme(1.5)}/><path d="M192 145q3.5 2 7 0" fill="none" ${trait(1.5)} stroke-linecap="round"/>${yeux}${patte}`,
    licorne: `${corps}<path d="M195 112l3 15h-6z" fill="${FOND2}" ${trait(1.6)}/><path d="M186 130l1-9 6 6M205 130l-1-9-6 6" ${forme(1.6)}/>${tete}<path d="M184 132q-6 8-3 16M186 128q-8 2-8 10" fill="none" ${trait(1.6)} stroke-linecap="round"/><ellipse cx="197" cy="144" rx="5" ry="3" fill="${FOND2}" ${trait(1.3)}/>${yeux}${patte}`,
    dinosaure: `${corps}<path d="M184 128l3-7 3 6 3-8 3 8 3-6 3 7" fill="none" ${trait(1.6)} stroke-linejoin="round"/><ellipse cx="196" cy="138" rx="14" ry="11" ${forme()}/><path d="M188 143l2 2 2-2 2 2 2-2 2 2" fill="none" ${trait(1.2)}/>${yeux}${patte}`,
    aucun: '',
  };
  return `<g id="doudou">${dessins[type]}</g>`;
}

// ---------- Silhouette dans la fenêtre d'Aiglemont (repère centré sur la vitre 36 × 48) ----------
export function silhouetteFenetre(o: { type: TypeDoudou; fratrie: boolean }): string {
  const c = 'fill="#2b2b33"';
  if (o.fratrie) return `<g class="nicolas"><circle cx="-6" cy="-6" r="7" ${c}/><rect x="-13" y="1" width="14" height="22" rx="5" ${c}/><circle cx="8" cy="2" r="5" ${c}/><rect x="3" y="7" width="10" height="16" rx="4" ${c}/></g>`;
  const oreilles: Record<TypeDoudou, string> = {
    ours: `<circle cx="-6" cy="-11" r="3.5" ${c}/><circle cx="6" cy="-11" r="3.5" ${c}/>`,
    lapin: `<ellipse cx="-4" cy="-17" rx="2.5" ry="7" ${c}/><ellipse cx="4" cy="-17" rx="2.5" ry="7" ${c}/>`,
    chat: `<path d="M-8-8l1-8 5 4zM8-8l-1-8-5 4z" ${c}/>`,
    chien: `<ellipse cx="-9" cy="-3" rx="3" ry="6" ${c}/><ellipse cx="9" cy="-3" rx="3" ry="6" ${c}/>`,
    bebe: `<path d="M-8-6q8-12 16 0z" ${c}/>`,
    licorne: `<path d="M0-22l2 10h-4z" ${c}/><path d="M-7-9l1-6 4 3zM7-9l-1-6-4 3z" ${c}/>`,
    dinosaure: `<path d="M-6-11l2-5 2 4 2-5 2 5 2-4" fill="none" stroke="#2b2b33" stroke-width="2"/>`,
    aucun: '',
  };
  if (o.type === 'aucun') return '<g class="nicolas"></g>';
  return `<g class="nicolas">${oreilles[o.type]}<circle cx="0" cy="-4" r="8" ${c}/><rect x="-8" y="4" width="16" height="20" rx="5" ${c}/><path d="M-8 10l-6 8M8 10l6 8" stroke="#2b2b33" stroke-width="4" stroke-linecap="round"/></g>`;
}

// ---------- Le meuble où sèche le billet, filmé dans le salon ----------
// Tous ont un dessus vers y = 108-120 sur x ≈ 90-310 : la souris et le bateau-billet y montent au même endroit.
export function cachetteCam(k: Cachette): string {
  const dessus = `<rect x="86" y="108" width="228" height="14" rx="3" fill="${FOND}" ${trait()}/>`;
  const v = `stroke="${VERT2}"`;
  switch (k) {
    case 'cheminee':
      return `<rect x="100" y="120" width="200" height="130" fill="none" ${v} stroke-width="2"/><rect x="140" y="160" width="120" height="90" fill="#0b2a10" ${v} stroke-width="2"/>`
        + `<g ${v} stroke-width="1.5" fill="none"><path d="M150 250v-30h40v30M200 250v-40h44v40"/><path d="M160 232h20M210 226h24"/></g>${dessus}`;
    case 'radiateur': {
      let colonnes = '';
      for (let x = 112; x <= 288; x += 16) colonnes += `<rect x="${x}" y="126" width="12" height="104" rx="5" fill="${FOND2}" ${v} stroke-width="1.5"/>`;
      return `${colonnes}<path d="M108 236h184M120 236v12M280 236v12" ${v} stroke-width="2"/><circle cx="292" cy="236" r="4" fill="none" ${v} stroke-width="1.5"/>`
        + `<rect x="96" y="108" width="208" height="12" rx="3" fill="${FOND}" ${trait()}/>`;
    }
    case 'table-de-nuit':
      return `<rect x="104" y="122" width="192" height="104" rx="4" fill="${FOND2}" ${v} stroke-width="2"/><path d="M104 158h192M104 192h192" ${v} stroke-width="1.5"/>`
        + `<circle cx="200" cy="140" r="3" fill="${VERT}"/><circle cx="200" cy="175" r="3" fill="${VERT}"/><circle cx="200" cy="209" r="3" fill="${VERT}"/><path d="M114 226v24M286 226v24" ${v} stroke-width="3"/>${dessus}`;
    case 'bureau':
      return `<path d="M98 122v128M302 122v128" ${v} stroke-width="3"/><rect x="226" y="122" width="72" height="66" fill="${FOND2}" ${v} stroke-width="1.5"/><path d="M226 155h72" ${v} stroke-width="1.5"/><circle cx="262" cy="138" r="2.5" fill="${VERT}"/><circle cx="262" cy="171" r="2.5" fill="${VERT}"/>`
        + `<path d="M140 250v-40h40v40M140 210v-34" fill="none" ${v} stroke-width="2"/>${dessus}`;
    case 'etagere': {
      let livres = '';
      [[128, 18], [148, 14], [164, 20], [186, 12], [200, 16]].forEach(([x, w], i) => { livres += `<rect x="${x}" y="${170 - 26 + (i % 2) * 4}" width="${w}" height="${26 - (i % 2) * 4}" fill="${FOND}" ${v} stroke-width="1.2"/>`; });
      [[220, 14], [236, 18], [256, 14]].forEach(([x, w]) => { livres += `<rect x="${x}" y="196" width="${w}" height="26" fill="${FOND}" ${v} stroke-width="1.2"/>`; });
      return `<rect x="110" y="120" width="180" height="130" fill="none" ${v} stroke-width="2"/><path d="M110 170h180M110 222h180" ${v} stroke-width="2"/>${livres}<circle cx="150" cy="208" r="10" fill="none" ${v} stroke-width="1.5"/>${dessus}`;
    }
  }
}

// ---------- L'enfant endormi sur l'oreiller (fille : cheveux longs étalés ; garçon : cheveux courts) ----------
export function enfantCam(g: Genre): string {
  const tete = `<circle cx="104" cy="157" r="15" ${forme()}/>`;
  const visage = `<path d="M105 157q4 3 8 0" fill="none" ${trait()} stroke-linecap="round"/><path d="M118 159q3 2 1 5" fill="none" ${trait(1.6)} stroke-linecap="round"/><path d="M109 166q3 2 6 0" fill="none" ${trait(1.6)} stroke-linecap="round"/>`;
  if (g === 'f') {
    return `<path d="M94 146q-22-6-28 10q-4 12 4 20M90 160q-14 4-16 16M96 144q-6-8-20-8" fill="none" stroke="${VERT2}" stroke-width="2" stroke-linecap="round"/>${tete}`
      + `<path d="M90 151q6-12 26-8q2 6-6 8q-8 0-14 6" fill="${FOND2}" ${trait(1.8)} stroke-linejoin="round"/>${visage}`;
  }
  return `${tete}<path d="M89 152q2-14 16-14q12 0 14 8l-4-1 1 4-5-3-1 4-4-4-2 4-3-4-3 5z" fill="${FOND2}" ${trait(1.8)} stroke-linejoin="round"/>${visage}`;
}

// ---------- Le frère ou la sœur, dans un petit lit à droite (à la place de la table de nuit) ----------
export function fratrieCam(g: Genre): string {
  const cheveux = g === 'f'
    ? `<path d="M362 170q-8-12-20-4M366 168q4-12 18-8" fill="none" stroke="${VERT2}" stroke-width="2" stroke-linecap="round"/><path d="M362 172q4-10 18-6q0 6-8 6q-6 0-10 4" fill="${FOND2}" ${trait(1.6)}/>`
    : `<path d="M361 174q2-11 13-11q9 0 11 7l-3-1 1 3-4-2-1 3-3-3-2 3-2-3-3 4z" fill="${FOND2}" ${trait(1.6)}/>`;
  return `<g id="fratrie">`
    + `<path d="M318 236v-58q0-8 8-8h2q8 0 8 8v58" fill="${FOND2}" stroke="${VERT2}" stroke-width="2"/>`
    + `<rect x="334" y="200" width="62" height="18" rx="3" fill="${FOND2}" stroke="${VERT2}" stroke-width="2"/><path d="M340 218v18M390 218v18" stroke="${VERT2}" stroke-width="3"/>`
    + `<path d="M358 196q-2-18 14-18h14q8 0 8 10v8z" fill="${FOND}" ${trait(1.6)}/>`
    + `<circle cx="373" cy="183" r="11" ${forme()}/>${cheveux}<path d="M368 184q3 2 6 0" fill="none" ${trait(1.6)} stroke-linecap="round"/>`
    + `<path d="M336 200v-14q14-8 30 0v14z" fill="${FOND2}" stroke="${VERT2}" stroke-width="2"/>`
    + `</g>`;
}

declare global { interface Window { DESSINS: { doudouCam: typeof doudouCam; silhouetteFenetre: typeof silhouetteFenetre; cachetteCam: typeof cachetteCam; enfantCam: typeof enfantCam; fratrieCam: typeof fratrieCam } } }
window.DESSINS = { doudouCam, silhouetteFenetre, cachetteCam, enfantCam, fratrieCam };
