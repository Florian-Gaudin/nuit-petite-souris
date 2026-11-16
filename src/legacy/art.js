// Dessins SVG faits maison (aucune image externe) : symboles, icônes, portrait de Quenotte, décors communs.
window.ART = (function () {
  'use strict';

  // Petit générateur pseudo-aléatoire déterministe (les étoiles sont toujours au même endroit)
  function lcg(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
  function etoiles(n, w, h, seed, y0) {
    const r = lcg(seed); let out = ''; y0 = y0 || 0;
    for (let i = 0; i < n; i++) { const x = (r() * w).toFixed(0), y = (y0 + r() * (h * 0.6 - y0)).toFixed(0), rad = (0.6 + r() * 1.4).toFixed(1); out += `<circle class="etoile" cx="${x}" cy="${y}" r="${rad}" fill="#fff" opacity="${(0.4 + r() * 0.6).toFixed(2)}" style="animation-delay:${(r() * 4).toFixed(1)}s"/>`; }
    return out;
  }

  // Phase de la lune pour la date de la nuit (AAAA-MM-JJ)
  function lune(nuit) {
    const synodic = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14);
    const d = new Date(nuit + 'T23:00:00');
    const age = (((d.getTime() - ref) / 864e5) % synodic + synodic) % synodic;
    const illum = (1 - Math.cos(2 * Math.PI * age / synodic)) / 2;
    return { age, illum, croissante: age < synodic / 2 };
  }
  function luneSVG(nuit, cx, cy, r, id) {
    const m = lune(nuit);
    const off = 2 * r * m.illum;
    const dx = m.croissante ? -off : off;
    return `<mask id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/><circle cx="${(cx + dx).toFixed(1)}" cy="${cy}" r="${(r * 1.02).toFixed(1)}" fill="#000"/></mask>
      <circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="#FFF4D6" opacity=".07"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFF4D6" mask="url(#${id})"/>`;
  }

  const CIEL = `<linearGradient id="gciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141A3A"/><stop offset="1" stop-color="#2b3470"/></linearGradient>`;

  // Fond de scène : ciel (prolongé vers le haut pour les écrans en hauteur), étoiles, lune (optionnelle)
  function fond(nuit, seed, luneOpts) {
    const defs = `<defs>${CIEL}${luneOpts ? luneSVG(nuit, luneOpts.x, luneOpts.y, luneOpts.r, 'ml' + seed) : ''}</defs>`;
    return defs + `<rect x="0" y="-1100" width="1000" height="1100" fill="#141A3A"/><rect width="1000" height="600" fill="url(#gciel)"/>` + etoiles(170, 1000, 600, seed, -1100);
  }

  // Quenotte de profil, à l'échelle : w = largeur en unités de la scène (le symbole fait 130 × 100)
  function souris(x, y, w, attrs, symbole) {
    const s = (w / 130).toFixed(3);
    return `<g ${attrs || ''} transform="translate(${x},${y}) scale(${s})"><use href="#${symbole || 'souris-side'}" width="130" height="100"/></g>`;
  }
  // Position de la lanterne (et du sac) d'une souris placée avec souris(x, y, w)
  function pointSouris(x, y, w, quoi) {
    const s = w / 130;
    const p = quoi === 'sac' ? [38, 50] : [105, 89];
    return { x: x + p[0] * s, y: y + p[1] * s };
  }

  // ---------- Symboles réutilisés partout ----------
  function symboles() {
    const C = window.CONFIG, V = C.euros, K = C.billetCouleurs; // valeur et couleurs du billet (5 gris, 10 rouge, 20 bleu, 50 orange)
    return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFC857" stop-opacity=".6"/><stop offset="1" stop-color="#FFC857" stop-opacity="0"/></radialGradient>
<radialGradient id="halo-or" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".75"/><stop offset=".6" stop-color="#FFC857" stop-opacity=".35"/><stop offset="1" stop-color="#FFC857" stop-opacity="0"/></radialGradient>
<radialGradient id="gcire" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#ee6b74"/><stop offset="1" stop-color="#b4232f"/></radialGradient>
<radialGradient id="med-or" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFF1B8"/><stop offset=".45" stop-color="#F0C64A"/><stop offset="1" stop-color="#B98A18"/></radialGradient>
<linearGradient id="med-ruban" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8323a"/><stop offset=".5" stop-color="#e2545a"/><stop offset="1" stop-color="#b8323a"/></linearGradient>
<linearGradient id="sac-cuir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a06a42"/><stop offset="1" stop-color="#7a4c2c"/></linearGradient>

<symbol id="souris-face" viewBox="0 0 220 240">
  <circle cx="44" cy="178" r="52" fill="url(#glow)"/>
  <path d="M150 206 C 202 216, 206 164, 172 160" fill="none" stroke="#A79E95" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="161" cy="152" rx="16" ry="21" fill="#8B5A3C"/>
  <ellipse cx="110" cy="166" rx="50" ry="54" fill="#A79E95"/>
  <ellipse cx="110" cy="178" rx="30" ry="36" fill="#EFE8DD"/>
  <path d="M128 130 L 152 142" stroke="#6E4630" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="90" cy="218" rx="15" ry="8" fill="#E7B4B4"/><ellipse cx="130" cy="218" rx="15" ry="8" fill="#E7B4B4"/>
  <circle cx="68" cy="58" r="24" fill="#A79E95"/><circle cx="68" cy="58" r="14" fill="#F2A3B5"/>
  <circle cx="152" cy="58" r="24" fill="#A79E95"/><circle cx="152" cy="58" r="14" fill="#F2A3B5"/>
  <circle cx="110" cy="92" r="44" fill="#A79E95"/>
  <ellipse cx="110" cy="109" rx="18" ry="12" fill="#EFE8DD"/>
  <ellipse cx="110" cy="104" rx="6" ry="4.5" fill="#E98BA0"/>
  <path d="M103 113 q7 6 14 0" fill="none" stroke="#2B2B33" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="95" cy="90" r="5.5" fill="#2B2B33"/><circle cx="125" cy="90" r="5.5" fill="#2B2B33"/>
  <circle cx="97" cy="88" r="2" fill="#fff"/><circle cx="127" cy="88" r="2" fill="#fff"/>
  <g stroke="#6B6560" stroke-width="1.4" stroke-linecap="round"><path d="M92 107 L 64 101"/><path d="M92 111 L 64 113"/><path d="M128 107 L 156 101"/><path d="M128 111 L 156 113"/></g>
  <path d="M70 132 q40 20 80 0 v15 q-40 20 -80 0z" fill="#D64045"/>
  <path d="M76 141 q34 16 68 0" fill="none" stroke="#B5323B" stroke-width="2"/>
  <path d="M128 144 q8 20 4 38 h15 q4 -18 -4 -38z" fill="#D64045"/>
  <g stroke="#FFF4D6" stroke-width="2" stroke-linecap="round"><path d="M134 180 v6"/><path d="M140 181 v6"/></g>
  <ellipse cx="66" cy="152" rx="12" ry="9" fill="#A79E95" transform="rotate(-28 66 152)"/>
  <path d="M56 160 L 47 172" stroke="#6E4630" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M32 174 h26 l-3 -7 h-20z" fill="#6E4630"/>
  <rect x="31" y="174" width="28" height="28" rx="6" fill="#FFC857" stroke="#B9801A" stroke-width="2"/>
  <ellipse cx="45" cy="188" rx="6" ry="8" fill="#FFF4D6"/>
  <ellipse cx="154" cy="154" rx="12" ry="9" fill="#A79E95" transform="rotate(28 154 154)"/>
</symbol>

<symbol id="souris-side" viewBox="0 0 130 100">
  <path d="M18 70 C -4 72, -2 44, 22 52" fill="none" stroke="#A79E95" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="38" cy="56" rx="15" ry="18" fill="#8B5A3C"/>
  <g transform="rotate(-18 38 40)"><rect x="29" y="33" width="19" height="11" rx="1.5" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1"/><text x="38.5" y="41.5" font-family="Share Tech Mono, monospace" font-size="${V.length > 1 ? 6 : 7}" fill="${K.fonce}" text-anchor="middle">${V}€</text></g>
  <path d="M26 44 q12 -6 24 0" fill="none" stroke="#6E4630" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="60" cy="64" rx="38" ry="25" fill="#A79E95"/>
  <ellipse cx="66" cy="72" rx="24" ry="14" fill="#EFE8DD"/>
  <ellipse class="pied p1" cx="46" cy="90" rx="10" ry="5" fill="#E7B4B4"/><ellipse class="pied p2" cx="72" cy="90" rx="10" ry="5" fill="#E7B4B4"/>
  <circle cx="106" cy="27" r="11" fill="#A79E95"/><circle cx="106" cy="27" r="6" fill="#F2A3B5"/>
  <circle cx="96" cy="48" r="23" fill="#A79E95"/>
  <circle cx="86" cy="26" r="12" fill="#A79E95"/><circle cx="86" cy="26" r="7" fill="#F2A3B5"/>
  <circle cx="104" cy="46" r="3.2" fill="#2B2B33"/><circle cx="105.2" cy="44.8" r="1" fill="#fff"/>
  <circle cx="118" cy="54" r="3.5" fill="#E98BA0"/>
  <g stroke="#6B6560" stroke-width="1.2" stroke-linecap="round"><path d="M112 56 L126 50"/><path d="M112 58 L126 62"/></g>
  <path d="M74 60 q14 8 28 -2 l2 8 q-14 10 -30 2z" fill="#D64045"/>
  <path d="M74 60 q-14 2 -22 14 l6 3 q8 -10 18 -11z" fill="#D64045"/>
  <path d="M92 70 L104 84" stroke="#6E4630" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="98" y="82" width="14" height="14" rx="4" fill="#FFC857" stroke="#B9801A" stroke-width="1.5"/>
</symbol>
<symbol id="souris-side-sans" viewBox="0 0 130 100">
  <path d="M18 70 C -4 72, -2 44, 22 52" fill="none" stroke="#A79E95" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="38" cy="56" rx="15" ry="18" fill="#8B5A3C"/>
  <path d="M26 44 q12 -6 24 0" fill="none" stroke="#6E4630" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="60" cy="64" rx="38" ry="25" fill="#A79E95"/>
  <ellipse cx="66" cy="72" rx="24" ry="14" fill="#EFE8DD"/>
  <ellipse class="pied p1" cx="46" cy="90" rx="10" ry="5" fill="#E7B4B4"/><ellipse class="pied p2" cx="72" cy="90" rx="10" ry="5" fill="#E7B4B4"/>
  <circle cx="106" cy="27" r="11" fill="#A79E95"/><circle cx="106" cy="27" r="6" fill="#F2A3B5"/>
  <circle cx="96" cy="48" r="23" fill="#A79E95"/>
  <circle cx="86" cy="26" r="12" fill="#A79E95"/><circle cx="86" cy="26" r="7" fill="#F2A3B5"/>
  <circle cx="104" cy="46" r="3.2" fill="#2B2B33"/><circle cx="105.2" cy="44.8" r="1" fill="#fff"/>
  <circle cx="118" cy="54" r="3.5" fill="#E98BA0"/>
  <g stroke="#6B6560" stroke-width="1.2" stroke-linecap="round"><path d="M112 56 L126 50"/><path d="M112 58 L126 62"/></g>
  <path d="M74 60 q14 8 28 -2 l2 8 q-14 10 -30 2z" fill="#D64045"/>
  <path d="M74 60 q-14 2 -22 14 l6 3 q8 -10 18 -11z" fill="#D64045"/>
  <path d="M92 70 L104 84" stroke="#6E4630" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="98" y="82" width="14" height="14" rx="4" fill="#FFC857" stroke="#B9801A" stroke-width="1.5"/>
</symbol>

<symbol id="souris-cam" viewBox="0 0 130 100">
  <g fill="#0b3a14" stroke="#39FF14" stroke-width="2.5" stroke-linejoin="round">
    <path d="M18 70 C -4 72, -2 44, 22 52" fill="none"/>
    <ellipse cx="38" cy="56" rx="15" ry="18"/>
    <ellipse cx="60" cy="64" rx="38" ry="25"/>
    <circle cx="106" cy="27" r="11"/><circle cx="96" cy="48" r="23"/><circle cx="86" cy="26" r="12"/>
    <path d="M74 60 q14 8 28 -2 l2 8 q-14 10 -30 2z" fill="#2fbf2f"/>
    <path d="M74 60 q-14 2 -22 14 l6 3 q8 -10 18 -11z" fill="#2fbf2f"/>
  </g>
  <circle cx="104" cy="46" r="3.5" fill="#39FF14"/><circle cx="118" cy="54" r="3.5" fill="#39FF14"/>
  <path d="M92 70 L104 84" stroke="#39FF14" stroke-width="2.5"/>
  <rect x="98" y="82" width="14" height="14" rx="4" fill="#9fff8a"/><circle cx="105" cy="89" r="14" fill="#9fff8a" opacity=".18"/>
</symbol>

<symbol id="dent" viewBox="0 0 24 24"><path d="M7 3.5 q5 -3 10 0 q3.5 2.5 1.5 9 q-1 8 -3.5 8.5 q-2 0 -3 -4.5 q-1 4.5 -3 4.5 q-2.5 -.5 -3.5 -8.5 q-2 -6.5 1.5 -9z" fill="#fff" stroke="#cfd3ee" stroke-width=".8"/></symbol>
<symbol id="dent-cam" viewBox="0 0 24 24"><path d="M7 3.5 q5 -3 10 0 q3.5 2.5 1.5 9 q-1 8 -3.5 8.5 q-2 0 -3 -4.5 q-1 4.5 -3 4.5 q-2.5 -.5 -3.5 -8.5 q-2 -6.5 1.5 -9z" fill="#9fff8a" stroke="#39FF14" stroke-width="1.2"/></symbol>
${({
  // La pièce (même identifiant « billet » : le sac, la rivière et la caméra la montrent sans rien changer d'autre)
  piece: `<symbol id="billet" viewBox="0 0 64 34"><circle cx="32" cy="17" r="16" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1.5"/><circle cx="32" cy="17" r="10" fill="${K.clair}" stroke="${K.fonce}" stroke-width="1"/><text x="32" y="21.5" font-family="Share Tech Mono, monospace" font-size="12" font-weight="700" fill="${K.fonce}" text-anchor="middle">${V}</text></symbol>
<symbol id="bateau" viewBox="0 0 64 34"><path d="M34 3v17" stroke="#6E4630" stroke-width="2"/><path d="M35 4q14 6 12 14l-12 1z" fill="#5CB98A" stroke="#2F5D50" stroke-width="1"/><path d="M4 20q28 6 56 0q-4 12-28 12t-28-12z" fill="#A47B54" stroke="#6E4630" stroke-width="1.2"/><path d="M12 24q20 4 40 0" fill="none" stroke="#6E4630" stroke-width="1" opacity=".6"/><circle cx="22" cy="19" r="6" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1"/><circle cx="22" cy="19" r="3.4" fill="${K.clair}"/></symbol>`,
  billet: `<symbol id="billet" viewBox="0 0 64 34"><rect x="1" y="1" width="62" height="32" rx="3" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1.5"/><rect x="6" y="6" width="52" height="22" rx="2" fill="none" stroke="${K.fonce}" stroke-width="1" opacity=".55"/><circle cx="32" cy="17" r="7" fill="${K.clair}" stroke="${K.fonce}" opacity=".9"/><text x="${V.length > 1 ? 10 : 13}" y="22" font-family="Share Tech Mono, monospace" font-size="10" fill="${K.fonce}">${V}</text><text x="46" y="22" font-family="Share Tech Mono, monospace" font-size="10" fill="${K.fonce}">€</text></symbol>
<symbol id="bateau" viewBox="0 0 64 34"><path d="M2 20 L62 20 L52 32 L12 32 Z" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1"/><path d="M14 20 L32 3 L50 20 Z" fill="${K.clair}" stroke="${K.fonce}" stroke-width="1"/><path d="M32 3 L32 20" stroke="${K.fonce}" stroke-width="1"/><text x="${V.length > 1 ? 18 : 20}" y="29" font-family="Share Tech Mono, monospace" font-size="8" fill="${K.fonce}">${V}</text><text x="40" y="29" font-family="Share Tech Mono, monospace" font-size="8" fill="${K.fonce}">€</text></symbol>`,
  // Le petit paquet surprise : papier rouge, ruban et nœud dorés ; il traverse la rivière dans une coquille de noix
  paquet: `<symbol id="billet" viewBox="0 0 64 34"><path d="M32 9q-9-9-12-3t12 3q9-9 12-3t-12 3z" fill="${K.clair}" stroke="#9c7a2a" stroke-width="1"/><rect x="19" y="9" width="26" height="23" rx="2" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1.5"/><rect x="30" y="9" width="4" height="23" fill="${K.clair}"/><rect x="19" y="18" width="26" height="4" fill="${K.clair}"/><circle cx="25" cy="27" r="1.2" fill="#fff" opacity=".6"/><circle cx="40" cy="14" r="1.2" fill="#fff" opacity=".6"/></symbol>
<symbol id="bateau" viewBox="0 0 64 34"><path d="M34 3v17" stroke="#6E4630" stroke-width="2"/><path d="M35 4q14 6 12 14l-12 1z" fill="#5CB98A" stroke="#2F5D50" stroke-width="1"/><path d="M4 20q28 6 56 0q-4 12-28 12t-28-12z" fill="#A47B54" stroke="#6E4630" stroke-width="1.2"/><path d="M12 24q20 4 40 0" fill="none" stroke="#6E4630" stroke-width="1" opacity=".6"/><rect x="15" y="11" width="13" height="11" rx="1" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1"/><rect x="20" y="11" width="3" height="11" fill="${K.clair}"/><path d="M21.5 11q-4-4-5-1t5 1q4-4 5-1t-5 1z" fill="${K.clair}"/></symbol>`,
  // La boîte de chocolats : un ballotin doré entrouvert, trois chocolats (pièces, carrés ou rochers : on ne sait pas)
  chocolat: `<symbol id="billet" viewBox="0 0 64 34"><path d="M15 15L20 4l30 3-3 8z" fill="#F3D27E" stroke="${K.fonce}" stroke-width="1.2"/><circle cx="24" cy="14" r="4.6" fill="${K.clair}" stroke="#3d2215" stroke-width=".8"/><rect x="28.5" y="9.6" width="8" height="8" rx="1.5" fill="#8a5232" stroke="#3d2215" stroke-width=".8"/><circle cx="41" cy="14" r="4.6" fill="${K.clair}" stroke="#3d2215" stroke-width=".8"/><path d="M12 16h40l-5 16H17z" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1.5"/><path d="M14 21h36" stroke="#D64045" stroke-width="2.4"/><circle cx="22.5" cy="12.6" r="1.1" fill="#fff" opacity=".45"/><circle cx="39.5" cy="12.6" r="1.1" fill="#fff" opacity=".45"/></symbol>
<symbol id="bateau" viewBox="0 0 64 34"><path d="M34 3v17" stroke="#6E4630" stroke-width="2"/><path d="M35 4q14 6 12 14l-12 1z" fill="#5CB98A" stroke="#2F5D50" stroke-width="1"/><path d="M4 20q28 6 56 0q-4 12-28 12t-28-12z" fill="#A47B54" stroke="#6E4630" stroke-width="1.2"/><path d="M12 24q20 4 40 0" fill="none" stroke="#6E4630" stroke-width="1" opacity=".6"/><circle cx="18" cy="14" r="2.6" fill="${K.clair}"/><circle cx="24" cy="14" r="2.6" fill="${K.clair}"/><path d="M13 15h16l-2.5 7h-11z" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1"/></symbol>`,
})[C.cadeau] || `<symbol id="billet" viewBox="0 0 64 34"><rect x="1" y="1" width="62" height="32" rx="3" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1.5"/><rect x="6" y="6" width="52" height="22" rx="2" fill="none" stroke="${K.fonce}" stroke-width="1" opacity=".55"/><circle cx="32" cy="17" r="7" fill="${K.clair}" stroke="${K.fonce}" opacity=".9"/><text x="${V.length > 1 ? 10 : 13}" y="22" font-family="Share Tech Mono, monospace" font-size="10" fill="${K.fonce}">${V}</text><text x="46" y="22" font-family="Share Tech Mono, monospace" font-size="10" fill="${K.fonce}">€</text></symbol>
<symbol id="bateau" viewBox="0 0 64 34"><path d="M2 20 L62 20 L52 32 L12 32 Z" fill="${K.moyen}" stroke="${K.fonce}" stroke-width="1"/><path d="M14 20 L32 3 L50 20 Z" fill="${K.clair}" stroke="${K.fonce}" stroke-width="1"/><path d="M32 3 L32 20" stroke="${K.fonce}" stroke-width="1"/><text x="${V.length > 1 ? 18 : 20}" y="29" font-family="Share Tech Mono, monospace" font-size="8" fill="${K.fonce}">${V}</text><text x="40" y="29" font-family="Share Tech Mono, monospace" font-size="8" fill="${K.fonce}">€</text></symbol>`}
${({
  piece: '<symbol id="bateau-cam" viewBox="0 0 64 34"><path d="M34 3v17" stroke="#39FF14" stroke-width="2"/><path d="M35 4q14 6 12 14l-12 1z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M4 20q28 6 56 0q-4 12-28 12t-28-12z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><circle cx="22" cy="19" r="5" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/></symbol>',
  billet: '<symbol id="bateau-cam" viewBox="0 0 64 34"><path d="M2 20 L62 20 L52 32 L12 32 Z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M14 20 L32 3 L50 20 Z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M32 3 L32 20" stroke="#39FF14" stroke-width="2"/></symbol>',
  paquet: '<symbol id="bateau-cam" viewBox="0 0 64 34"><path d="M34 3v17" stroke="#39FF14" stroke-width="2"/><path d="M35 4q14 6 12 14l-12 1z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M4 20q28 6 56 0q-4 12-28 12t-28-12z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><rect x="15" y="10" width="13" height="11" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M21.5 10v11" stroke="#39FF14" stroke-width="1.5"/></symbol>',
  chocolat: '<symbol id="bateau-cam" viewBox="0 0 64 34"><path d="M34 3v17" stroke="#39FF14" stroke-width="2"/><path d="M35 4q14 6 12 14l-12 1z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M4 20q28 6 56 0q-4 12-28 12t-28-12z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M13 14h16l-2.5 7h-11z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><circle cx="18" cy="12" r="2" fill="#39FF14"/><circle cx="24" cy="12" r="2" fill="#39FF14"/></symbol>',
})[C.cadeau] || '<symbol id="bateau-cam" viewBox="0 0 64 34"><path d="M2 20 L62 20 L52 32 L12 32 Z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M14 20 L32 3 L50 20 Z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M32 3 L32 20" stroke="#39FF14" stroke-width="2"/></symbol>'}
<symbol id="mot-cam" viewBox="0 0 40 30"><rect x="1" y="1" width="38" height="28" rx="2" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><g fill="#39FF14"><rect x="6" y="6" width="5" height="5"/><rect x="13" y="6" width="3" height="3"/><rect x="6" y="13" width="3" height="3"/><rect x="11" y="12" width="4" height="4"/><rect x="6" y="19" width="5" height="5"/><rect x="13" y="20" width="3" height="3"/></g><path d="M22 9h12M22 15h12M22 21h8" stroke="#39FF14" stroke-width="1.5"/></symbol>
<symbol id="patte" viewBox="0 0 24 24"><ellipse cx="7" cy="8" rx="2.2" ry="3"/><ellipse cx="12" cy="6" rx="2.2" ry="3"/><ellipse cx="17" cy="8" rx="2.2" ry="3"/><path d="M12 11 q6 0 6 6 q0 4 -6 4 q-6 0 -6 -4 q0 -6 6 -6z"/></symbol>
<symbol id="etoile5" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="#FFC857" stroke="#B9801A" stroke-width="1"/></symbol>
<symbol id="main" viewBox="0 0 48 56"><path d="M18 52 L12 36 Q8 28 14 26 Q18 25 20 30 L20 10 Q20 5 24 5 Q28 5 28 10 L28 24 L30 14 Q31 10 35 11 Q38 12 37 17 L36 26 L38 20 Q40 16 43 18 Q46 20 44 25 L41 36 Q38 46 36 52 Z" fill="#FFF4D6" stroke="#B9801A" stroke-width="2.2" stroke-linejoin="round"/></symbol>
</defs></svg>`;
  }

  // Petites icônes de boutons (trait blanc)
  const ICONES = {
    crayon: '<path d="M4 20l1-5L15.5 4.5a2.1 2.1 0 0 1 3 3L8 18zM13.5 6.5l3 3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>',
    piece: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.5" fill="currentColor"/>',
    changer: '<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    famille: '<circle cx="8.5" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="16.5" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3 20a5.5 5.5 0 0 1 11 0M13 20a3.6 3.6 0 0 1 7.5 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    lanterne: '<path d="M9 3h6l1 3H8z M8 6h8v9a4 4 0 0 1-8 0z M12 21v-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="11" r="2" fill="currentColor"/>',
    vite: '<path d="M4 5l8 7-8 7zM12 5l8 7-8 7z" fill="currentColor"/>',
    suite: '<path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    patte: '<ellipse cx="7" cy="8" rx="2.2" ry="3" fill="currentColor"/><ellipse cx="12" cy="6" rx="2.2" ry="3" fill="currentColor"/><ellipse cx="17" cy="8" rx="2.2" ry="3" fill="currentColor"/><path d="M12 11q6 0 6 6 0 4-6 4-6 0-6-4 0-6 6-6z" fill="currentColor"/>',
    son: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    muet: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    imprimer: '<path d="M7 8V3h10v5M7 17h10v4H7zM5 8h14a2 2 0 0 1 2 2v7h-4v-3H7v3H3v-7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    reglages: '<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5a7.4 7.4 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    recommencer: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    plein: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    reduire: '<path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    etoile: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor"/>',
    billet: '<rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  };
  function icone(n, cls) { return `<svg class="ico ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[n] || ''}</svg>`; }

  // Icônes des badges (fond coloré rond)
  const DESSINS_BADGES = {
      detective: '<circle cx="24" cy="24" r="22" fill="#273066"/><path d="M19 12h10l1.5 4H17.5z M17.5 16h13v12a6.5 6.5 0 0 1-13 0z" fill="#FFC857"/><circle cx="24" cy="23" r="3" fill="#fff"/>',
      exploratrice: '<circle cx="24" cy="24" r="22" fill="#2F5D50"/><use href="#etoile5" x="8" y="8" width="20" height="20"/><use href="#etoile5" x="22" y="18" width="16" height="16"/><use href="#etoile5" x="12" y="26" width="12" height="12"/>',
      lynx: '<circle cx="24" cy="24" r="22" fill="#141A3A"/><use href="#etoile5" x="10" y="10" width="28" height="28"/><circle cx="24" cy="24" r="4" fill="#fff"/>',
      passechat: '<circle cx="24" cy="24" r="22" fill="#E8A552"/><circle cx="24" cy="26" r="11" fill="#C9833A"/><path d="M14 20l-2-9 8 5zM34 20l2-9-8 5z" fill="#C9833A"/><path d="M18 26q3 3 6 0M26 26q3 3 6 0" fill="none" stroke="#2B2B33" stroke-width="1.6"/><path d="M22 31h4l-2 2z" fill="#F2A3B5"/>',
      hibou: '<circle cx="24" cy="24" r="22" fill="#06180B"/><circle cx="24" cy="24" r="12" fill="none" stroke="#39FF14" stroke-width="2.5"/><circle cx="24" cy="24" r="5" fill="#39FF14"/>',
      amie: '<circle cx="24" cy="24" r="22" fill="#FFF6E0"/><rect x="11" y="16" width="26" height="18" rx="2" fill="#fff" stroke="#C9A227"/><path d="M11 17l13 10 13-10" fill="none" stroke="#C9A227" stroke-width="1.5"/><circle cx="24" cy="27" r="4" fill="#D64045"/>',
      jumelle: '<circle cx="24" cy="24" r="22" fill="#F2A3B5"/><g transform="translate(9 11) scale(0.95)"><use href="#dent" width="16" height="16"/><use href="#dent" x="16" width="16" height="16"/></g><path d="M24 33l-3-3a2 2 0 0 1 3-3 2 2 0 0 1 3 3z" fill="#D64045"/>',
      billet: '<circle cx="24" cy="24" r="22" fill="#3E7C8F"/><use href="#bateau" x="6" y="10" width="36" height="20"/><path d="M8 34q8-4 16 0t16 0" fill="none" stroke="#9fd0dd" stroke-width="2" stroke-linecap="round"/>',
      terrier: '<circle cx="24" cy="24" r="22" fill="#6b4a33"/><path d="M2 20h44" stroke="#3E7C50" stroke-width="4"/><path d="M10 40v-8a14 14 0 0 1 28 0v8z" fill="#2a1a10"/><circle cx="24" cy="33" r="6" fill="#C9A227" stroke="#8a6a12" stroke-width="1.6"/><path d="M21 31.5h6M21 34.5h6" stroke="#8a6a12" stroke-width="1.2"/><circle cx="14" cy="13" r="1.6" fill="#FFC857"/><circle cx="34" cy="11" r="1.2" fill="#FFC857"/>',
      pilote: '<circle cx="24" cy="24" r="22" fill="#5B8DD6"/><g fill="#fff" opacity=".9"><circle cx="12" cy="33" r="5"/><circle cx="18" cy="30" r="6"/><circle cx="24" cy="34" r="4.5"/></g><path d="M24 7a10 10 0 0 1 10 10c0 6-6 10-8 12h-4c-2-2-8-6-8-12A10 10 0 0 1 24 7z" fill="#D64045"/><path d="M24 7c-3 3-4 7-4 10s2 9 2 12h4c0-3 2-8 2-12s-1-7-4-10z" fill="#FFC857"/><rect x="21" y="32" width="6" height="5" rx="1" fill="#8B5A3C"/><path d="M22 29v3M26 29v3" stroke="#2a1a10" stroke-width=".8"/>',
      artiste: '<circle cx="24" cy="24" r="22" fill="#FFF6E0"/><path d="M12 30c-4-10 6-20 16-17 8 2 10 10 5 13-3 2-6-1-8 2s1 6-3 7c-4 1-8-1-10-5z" fill="#e8d4b8" stroke="#C9A227" stroke-width="1"/><circle cx="18" cy="21" r="2.4" fill="#D64045"/><circle cx="24" cy="17" r="2.4" fill="#5B8DD6"/><circle cx="30" cy="19" r="2.4" fill="#3E9A6B"/><circle cx="17" cy="28" r="2.4" fill="#FFC857"/><path d="M38 9l-12 18 -2 4 3.5-2.5 12-18z" fill="#E8833A" stroke="#8a4a1a" stroke-width=".8"/>',
      // Ardennais d'honneur : la feuille de chêne et un petit sanglier, sur un fond vert forêt
      ardennais: '<circle cx="24" cy="24" r="22" fill="#2F5D50"/><path transform="translate(9 4) scale(1.25)" d="M12 1C14 1 15 3 14.5 4.5C17 4 18 6 16 7.5C19 7.5 19.5 10 17 11C19.5 11.5 19 14.5 16 14C17 16 15.5 17.5 13.2 17L12.6 19V22.5H11.4V19L10.8 17C8.5 17.5 7 16 8 14C5 14.5 4.5 11.5 7 11C4.5 10 5 7.5 8 7.5C6 6 7 4 9.5 4.5C9 3 10 1 12 1Z" fill="#9BC53D" stroke="#3E6B1F"/><g transform="translate(24 36)"><ellipse cx="-2" cy="0" rx="10" ry="5.5" fill="#8a6044"/><path d="M6-4q6 0 8 5l2 1q0 2-2 2l-7 .5q-3-1-3-5z" fill="#8a6044"/><path d="M7-4l1.5-3 2 3z" fill="#5c3c28"/><path d="M-8 4v3M-3 5v3M2 5v3M6 4v3" stroke="#5c3c28" stroke-width="2" stroke-linecap="round"/></g>',
      mystere: '<circle cx="24" cy="24" r="22" fill="#5a5470"/><text x="24" y="32" font-family="Baloo 2, sans-serif" font-weight="800" font-size="24" fill="#cfd3ee" text-anchor="middle">?</text>',
      scene13: '<circle cx="24" cy="24" r="22" fill="#D64045"/><rect x="10" y="12" width="28" height="24" rx="2" fill="#141A3A"/><path d="M10 12q7 10 0 24zM38 12q-7 10 0 24z" fill="#9a2a32"/><text x="24" y="30" font-family="Baloo 2" font-weight="800" font-size="12" fill="#FFC857" text-anchor="middle">13</text>',
  };
  function badgeIcone(id, taille) {
    const t = taille || 44;
    return `<svg class="badge-ico" width="${t}" height="${t}" viewBox="0 0 48 48" aria-hidden="true">${DESSINS_BADGES[id] || ''}</svg>`;
  }

  // ---------- Les médailles de l'étagère : un ruban, un disque doré crénelé, l'emblème du badge au centre ----------
  // Une médaille pas encore gagnée : son crochet, et un rond en pointillés avec un point d'interrogation.
  // Le haut du dessin (y = -50) est le point d'accroche, sur la tringle de l'étagère.
  // gagnee === 'attend' : une médaille gagnée encore dans la sacoche, son crochet entouré d'une lueur dorée
  function medaille(id, gagnee) {
    const crochet = '<path d="M0-49v6" stroke="#d9b54a" stroke-width="2.4" stroke-linecap="round"/><circle cy="-48" r="2.6" fill="#d9b54a"/>';
    if (gagnee === 'attend') return `<svg class="medaille attend" viewBox="-32 -50 64 86" aria-hidden="true">${crochet}
<circle cy="4" r="24" fill="rgba(255,200,87,.07)" stroke="#d9b54a" stroke-width="1.8" stroke-dasharray="3 5" opacity=".75"/>
<g class="scintille" fill="#FFE7A0"><path d="M-9-3l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/><path d="M9 8l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z"/></g></svg>`;
    if (!gagnee) return `<svg class="medaille vide" viewBox="-32 -50 64 86" aria-hidden="true">${crochet}
<path d="M0-42l-6 16M0-42l6 16" stroke="#7d79a8" stroke-width="1.6" stroke-dasharray="2 3" stroke-linecap="round"/>
<circle cy="4" r="24" fill="rgba(255,255,255,.05)" stroke="#7d79a8" stroke-width="2" stroke-dasharray="4 4"/>
<text y="14" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="27" fill="#9a96c4">?</text></svg>`;
    return `<svg class="medaille" viewBox="-32 -50 64 86" aria-hidden="true">${crochet}
<path d="M-2-43h-11l9 24h11z" fill="url(#med-ruban)" stroke="#8f222a" stroke-width=".8"/><path d="M2-43h11l-9 24h-11z" fill="url(#med-ruban)" stroke="#8f222a" stroke-width=".8"/>
<path d="M-7.5-43l8.5 22M7.5-43l-8.5 22" stroke="#FFC857" stroke-width="1.5"/>
<circle cy="4" r="26.5" fill="#7d5e0e"/><circle cy="4" r="25.5" fill="url(#med-or)"/>
<circle cy="4" r="23.4" fill="none" stroke="#a37a14" stroke-width="1.4" stroke-dasharray="1.4 2.2"/>
<circle cy="4" r="20" fill="#7d5e0e" opacity=".6"/>
<g transform="translate(-19 -15) scale(.79)">${DESSINS_BADGES[id] || ''}</g>
<circle cy="4" r="19.2" fill="none" stroke="#FFF1B8" stroke-width="1" opacity=".75"/>
<path d="M-18-8a22 22 0 0 1 13-10" stroke="#fff" stroke-opacity=".75" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
  }

  // ---------- Quenotte de face, sa sacoche de cuir en bandoulière (la remise des badges) ----------
  // La sacoche (.sacoche) se touche ; son rabat (.rabat) se soulève quand une médaille en sort.
  function quenotteSacoche() {
    const nom = window.CONFIG.souris;
    return `<svg class="q-sacoche" viewBox="0 0 240 250" role="group" aria-label="${nom} et sa sacoche">
<ellipse cx="124" cy="240" rx="88" ry="8" fill="#000" opacity=".3"/>
<path d="M166 214 C 222 226, 226 170, 190 166" fill="none" stroke="#A79E95" stroke-width="7" stroke-linecap="round"/>
<ellipse cx="124" cy="172" rx="52" ry="56" fill="#A79E95"/>
<ellipse cx="124" cy="184" rx="31" ry="37" fill="#EFE8DD"/>
<ellipse cx="102" cy="229" rx="16" ry="8" fill="#E7B4B4"/><ellipse cx="146" cy="229" rx="16" ry="8" fill="#E7B4B4"/>
<ellipse cx="172" cy="164" rx="13" ry="10" fill="#A79E95" transform="rotate(30 172 164)"/>
<circle cx="80" cy="60" r="25" fill="#A79E95"/><circle cx="80" cy="60" r="15" fill="#F2A3B5"/>
<circle cx="168" cy="60" r="25" fill="#A79E95"/><circle cx="168" cy="60" r="15" fill="#F2A3B5"/>
<circle cx="124" cy="96" r="46" fill="#A79E95"/>
<ellipse cx="124" cy="114" rx="19" ry="12.5" fill="#EFE8DD"/>
<ellipse cx="124" cy="108" rx="6.5" ry="4.8" fill="#E98BA0"/>
<path d="M116 118 q8 7 16 0" fill="none" stroke="#2B2B33" stroke-width="2" stroke-linecap="round"/>
<g class="q-yeux"><circle cx="108" cy="93" r="5.8" fill="#2B2B33"/><circle cx="140" cy="93" r="5.8" fill="#2B2B33"/><circle cx="110" cy="91" r="2.1" fill="#fff"/><circle cx="142" cy="91" r="2.1" fill="#fff"/></g>
<ellipse cx="97" cy="109" rx="7" ry="4" fill="#F2A3B5" opacity=".55"/><ellipse cx="151" cy="109" rx="7" ry="4" fill="#F2A3B5" opacity=".55"/>
<g stroke="#6B6560" stroke-width="1.4" stroke-linecap="round"><path d="M104 111 L 76 105"/><path d="M104 115 L 76 117"/><path d="M144 111 L 172 105"/><path d="M144 115 L 172 117"/></g>
<path d="M82 136 q42 21 84 0 v15 q-42 21 -84 0z" fill="#D64045"/>
<path d="M88 145 q36 17 72 0" fill="none" stroke="#B5323B" stroke-width="2"/>
<path d="M142 148 q8 20 4 38 h15 q4 -18 -4 -38z" fill="#D64045"/>
<g stroke="#FFF4D6" stroke-width="2" stroke-linecap="round"><path d="M148 184 v6"/><path d="M154 185 v6"/></g>
<path d="M158 140 C 132 170, 98 182, 76 194" fill="none" stroke="#4a2e1e" stroke-width="8" stroke-linecap="round"/>
<path d="M158 140 C 132 170, 98 182, 76 194" fill="none" stroke="#8B5A3C" stroke-width="4.5" stroke-linecap="round"/>
<g class="sacoche" tabindex="0" role="button" aria-label="Ouvrir la sacoche de ${nom}">
  <circle class="sac-lueur" cx="62" cy="204" r="60" fill="url(#halo-or)"/>
  <rect x="20" y="178" width="86" height="58" rx="13" fill="url(#sac-cuir)" stroke="#4a2e1e" stroke-width="3"/>
  <rect x="27" y="186" width="72" height="43" rx="9" fill="none" stroke="#d4a676" stroke-width="1.3" stroke-dasharray="3 3" opacity=".75"/>
  <g class="sac-eclats" fill="#FFE7A0"><circle cx="42" cy="176" r="2.6"/><circle cx="63" cy="170" r="3.2"/><circle cx="84" cy="176" r="2.4"/></g>
  <g class="rabat"><path d="M20 190 q0-14 14-14 h58 q14 0 14 14 v12 q-43 19 -86 0z" fill="#8B5A3C" stroke="#4a2e1e" stroke-width="3"/>
  <path d="M28 196 q35 13 70 0" fill="none" stroke="#d4a676" stroke-width="1.3" stroke-dasharray="3 3" opacity=".75"/>
  <use href="#dent" x="54" y="179" width="18" height="18"/></g>
  <rect x="56" y="203" width="14" height="13" rx="3" fill="#FFC857" stroke="#9a7212" stroke-width="1.6"/><rect x="61" y="208" width="4" height="4" rx="1" fill="#9a7212"/>
</g>
<ellipse cx="80" cy="170" rx="14" ry="10" fill="#A79E95" transform="rotate(-36 80 170)"/>
</svg>`;
  }

  // ---------- Portrait de Quenotte pour le bandeau de narration ----------
  // L'expression se change avec l'attribut data-expr du SVG : sourire, joie, surprise, chuchote, clin, triste.
  function portrait() {
    return `<svg class="portrait" viewBox="0 0 120 120" data-expr="sourire" aria-hidden="true">
<circle cx="60" cy="62" r="56" fill="#273066"/>
<circle cx="30" cy="34" r="19" fill="#A79E95"/><circle cx="30" cy="34" r="11" fill="#F2A3B5"/>
<circle cx="90" cy="34" r="19" fill="#A79E95"/><circle cx="90" cy="34" r="11" fill="#F2A3B5"/>
<circle cx="60" cy="66" r="38" fill="#A79E95"/>
<ellipse cx="60" cy="82" rx="17" ry="11" fill="#EFE8DD"/>
<ellipse cx="60" cy="77" rx="6" ry="4.5" fill="#E98BA0"/>
<g class="yeux-ouverts"><circle cx="46" cy="62" r="5.5" fill="#2B2B33"/><circle cx="74" cy="62" r="5.5" fill="#2B2B33"/><circle cx="48" cy="60" r="2" fill="#fff"/><circle cx="76" cy="60" r="2" fill="#fff"/></g>
<g class="yeux-grands"><circle cx="46" cy="61" r="8" fill="#fff"/><circle cx="74" cy="61" r="8" fill="#fff"/><circle cx="47" cy="62" r="5" fill="#2B2B33"/><circle cx="75" cy="62" r="5" fill="#2B2B33"/></g>
<g class="yeux-doux" fill="none" stroke="#2B2B33" stroke-width="2.6" stroke-linecap="round"><path d="M40 61q6 5 12 0"/><path d="M68 61q6 5 12 0"/></g>
<g class="oeil-clin"><circle cx="46" cy="62" r="5.5" fill="#2B2B33"/><circle cx="48" cy="60" r="2" fill="#fff"/><path d="M68 62q6 5 12 0" fill="none" stroke="#2B2B33" stroke-width="2.6" stroke-linecap="round"/></g>
<g class="sourcils" fill="none" stroke="#6B6560" stroke-width="2.2" stroke-linecap="round"><path class="sg" d="M39 50q7-4 14 0"/><path class="sd" d="M67 50q7-4 14 0"/></g>
<g stroke="#6B6560" stroke-width="1.4" stroke-linecap="round"><path d="M44 84L22 78"/><path d="M44 88L22 90"/><path d="M76 84L98 78"/><path d="M76 88L98 90"/></g>
<path class="bouche-sourire" d="M52 88q8 7 16 0" fill="none" stroke="#2B2B33" stroke-width="2" stroke-linecap="round"/>
<path class="bouche-joie" d="M50 87q10 12 20 0z" fill="#9a2a32" stroke="#2B2B33" stroke-width="1.5"/>
<ellipse class="bouche-o" cx="60" cy="90" rx="4.5" ry="6" fill="#9a2a32" stroke="#2B2B33" stroke-width="1.5"/>
<path class="bouche-triste" d="M52 92q8-6 16 0" fill="none" stroke="#2B2B33" stroke-width="2" stroke-linecap="round"/>
<g class="patte-chut"><ellipse cx="60" cy="92" rx="11" ry="7" fill="#A79E95"/><ellipse cx="60" cy="92" rx="7" ry="4" fill="#E7B4B4"/></g>
<path d="M30 104q30 18 60 0 v8 q-30 18 -60 0z" fill="#D64045"/>
<circle class="joue" cx="40" cy="76" r="5" fill="#F2A3B5" opacity=".6"/><circle class="joue" cx="80" cy="76" r="5" fill="#F2A3B5" opacity=".6"/>
</svg>`;
  }

  // ---------- Chapitre 0 : ciel, colline, maison ----------
  function cielSVG(nuit) {
    return `<svg class="ciel-svg" viewBox="0 0 800 480" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
<defs>${CIEL}${luneSVG(nuit, 650, 86, 32, 'mlune0')}</defs>
<rect x="-200" y="-1500" width="1200" height="1500" fill="#141A3A"/>${etoiles(90, 800, 480, 3, -1500)}
<rect width="800" height="480" fill="url(#gciel)"/>
${etoiles(60, 800, 480, 7)}
<path d="M0 320 Q130 250 270 300 T560 290 T800 260 V480 H0Z" fill="#1E2658"/>
<g fill="#1E3F36"><path d="M0 400l30-90 30 90zM50 400l36-110 36 110zM120 400l30-90 30 90zM660 400l30-90 30 90zM720 400l36-110 36 110z"/></g>
<g id="chateau0" transform="translate(18,300)"><!-- Le château fort de Sedan, la maison de Quenotte, posé sur son glacis --><path d="M-14 116L8 84H124L146 116Z" fill="#2F5D50"/><rect x="30" y="30" width="72" height="22" fill="#c9a466"/><path d="M24 32L34 18H98L108 32Z" fill="#5b6182"/><rect x="14" y="46" width="104" height="40" fill="#c9a466"/><path d="M14 56h104M14 66h104M14 76h104" stroke="#a8844e" stroke-width=".8" opacity=".6"/><rect x="5" y="40" width="22" height="72" rx="11" fill="#b8925a"/><path d="M1 42L16 14L31 42Z" fill="#5b6182"/><rect x="104" y="34" width="24" height="78" rx="12" fill="#b8925a"/><path d="M100 36L116 8L132 36Z" fill="#5b6182"/><rect x="37" y="52" width="14" height="60" rx="7" fill="#b8925a"/><path d="M33 54L44 26L55 54Z" fill="#5b6182"/><rect x="72" y="28" width="14" height="20" fill="#b8925a"/><path d="M69 30L79 15L89 30Z" fill="#5fa3a3"/><path d="M60 86v-12a7 7 0 0 1 14 0v12z" fill="#5c3a24"/><g fill="#FFC857"><rect x="40" y="36" width="4" height="6"/><rect x="58" y="36" width="4" height="6"/><rect x="90" y="58" width="4" height="6"/><rect x="26" y="60" width="4" height="6"/></g><g fill="#3a2f22"><rect x="14" y="52" width="2.5" height="6"/><rect x="114" y="50" width="2.5" height="6"/><rect x="98" y="66" width="2.5" height="6"/></g></g>
<path d="M0 480V420Q180 350 400 286Q560 240 800 360V480Z" fill="#24483E"/>
${window.CONFIG.logement === 'appartement'
  // Un appartement : un petit immeuble, une seule fenêtre allumée (celle de l'enfant)
  ? `<g id="maison0" transform="translate(-75,-80)"><rect x="474" y="226" width="84" height="134" fill="#F3EFE6"/><rect x="468" y="218" width="96" height="10" fill="#A79E95"/>${[0, 1, 2].map(l => [0, 1, 2].map(c => `<rect x="${484 + c * 24}" y="${238 + l * 32}" width="16" height="20" rx="2" fill="${l === 1 && c === 0 ? '#FFC857' : '#2b3470'}"${l === 1 && c === 0 ? ' class="fenetre"' : ''}/>`).join('')).join('')}<rect x="506" y="334" width="20" height="26" fill="#6E4630"/></g>`
  : `<g id="maison0" transform="translate(-75,-80)"><rect x="470" y="298" width="90" height="62" fill="#F3EFE6"/><path d="M460 298l55-44 55 44z" fill="#D64045"/><rect x="532" y="262" width="12" height="26" fill="#A79E95"/><rect x="496" y="318" width="20" height="22" rx="2" fill="#FFC857" class="fenetre"/><rect x="528" y="330" width="16" height="30" fill="#6E4630"/>
<g class="fumee" fill="#cfd3ee" opacity=".5"><circle cx="540" cy="250" r="5"/><circle cx="546" cy="238" r="7"/><circle cx="554" cy="224" r="9"/></g></g>`}
${saisonSVG(nuit, 800, 480)}
<path class="chemin0" d="M85 466 C 165 450, 285 370, 420 292" fill="none" stroke="#D64045" stroke-width="4" stroke-dasharray="10 10" stroke-linecap="round"/>
<g class="qui"><animateMotion id="am0" dur="2.6s" begin="indefinite" fill="freeze" calcMode="spline" keySplines="0.4 0 0.6 1" keyTimes="0;1" path="M0 0 C 80 -16, 200 -96, 335 -174"/><circle cx="134" cy="455" r="30" fill="url(#glow)"/><use href="#souris-side" x="30" y="392" width="104" height="80"/></g>
</svg>`;
  }

  // ---------- Chapitre 2 : la scène du jeu ----------
  function jeuSVG() {
    return `<svg class="jeu" viewBox="0 0 1000 500" role="img" aria-label="La souris doit passer devant le chat endormi pour atteindre la porte${window.CONFIG.logement === 'appartement' ? ' de l’appartement' : ''}">
${window.CONFIG.logement === 'appartement' ? `<defs>${CIEL}</defs><rect x="-200" y="-1500" width="1400" height="2000" fill="#3a3550"/><rect x="-200" y="-1500" width="1400" height="1560" fill="#332e47"/>
<g>${[0, 1, 2, 3, 4].map(i => `<rect x="${i * 40}" y="${220 + i * 40}" width="${220 - i * 40}" height="40" fill="${i % 2 ? '#4a4360' : '#524a6a'}"/>`).join('')}</g><path d="M0 206L220 420" stroke="#8B5A3C" stroke-width="7" stroke-linecap="round"/>
<path d="M500 60v30" stroke="#6b6560" stroke-width="3"/><path d="M478 90h44l-8 18h-28z" fill="#FFC857"/><circle cx="500" cy="110" r="120" fill="#FFC857" opacity=".1"/>
<rect x="830" y="190" width="140" height="230" rx="4" fill="#5c3a24"/><rect x="842" y="202" width="116" height="218" rx="3" fill="#8B5A3C"/><rect x="886" y="222" width="28" height="18" rx="3" fill="#C9A227"/><circle cx="944" cy="318" r="6" fill="#C9A227"/>
<rect y="420" width="1000" height="80" fill="#2a2638"/><rect y="405" width="1000" height="18" fill="#524a6a"/><rect x="830" y="414" width="140" height="10" rx="4" fill="#8B5A3C"/>
<g fill="#B05E3B"><path d="M300 420l8-40h44l8 40zM520 420l8-40h44l8 40z"/></g><g fill="#3E7C50"><path d="M330 380q-26-30-22-66q20 24 22 66zM330 380q24-34 22-70q-18 26-22 70zM550 380q-26-30-22-66q20 24 22 66zM550 380q24-34 22-70q-18 26-22 70z"/></g>
` : `<defs>${CIEL}</defs>
<rect x="0" y="-1500" width="1000" height="1500" fill="#141A3A"/>${etoiles(70, 1000, 500, 9, -1500)}
<rect width="1000" height="500" fill="url(#gciel)"/>
${etoiles(40, 1000, 500, 5)}
<rect x="840" y="220" width="160" height="200" fill="#2A3470"/><rect x="840" y="210" width="160" height="14" fill="#3A4690"/>
<path d="M880 420v-120a40 40 0 0 1 80 0v120z" fill="#151a40"/><g stroke="#8B5A3C" stroke-width="4"><path d="M900 300v120M920 300v120M940 300v120"/></g>
<rect x="806" y="150" width="6" height="270" fill="#6b6560"/><circle cx="809" cy="140" r="18" fill="#FFC857"/><circle cx="809" cy="140" r="60" fill="#FFC857" opacity=".12"/>
<rect y="420" width="1000" height="80" fill="#1A2A26"/><rect y="405" width="1000" height="18" fill="#2b3b36"/>
<g fill="#8B5A3C"><path d="M300 420l8-40h44l8 40zM520 420l8-40h44l8 40z"/></g><g fill="#3E7C8F"><circle cx="330" cy="372" r="18"/><circle cx="550" cy="372" r="18"/></g>
`}<g id="chat" data-etat="dort" transform="translate(600,300)">
  <path id="queue" d="M20 90C-20 100-25 50 10 60" fill="none" stroke="#E8A552" stroke-width="14" stroke-linecap="round"/>
  <ellipse cx="90" cy="92" rx="80" ry="40" fill="#E8A552"/>
  <g fill="none" stroke="#C9833A" stroke-width="6" stroke-linecap="round"><path d="M50 64q6 12 2 24M74 60q6 14 2 28M98 60q6 14 2 28"/></g>
  <circle cx="156" cy="72" r="36" fill="#E8A552"/>
  <path d="M126 50l-4-30 26 14zM186 50l4-30-26 14z" fill="#E8A552"/><path d="M129 46l-2-14 12 7zM183 46l2-14-12 7z" fill="#F2A3B5"/>
  <g class="oeil-ferme" fill="none" stroke="#2B2B33" stroke-width="3" stroke-linecap="round"><path d="M136 72q8 6 16 0M164 72q8 6 16 0"/></g>
  <g class="oeil-ouvert"><circle cx="144" cy="72" r="7" fill="#fff"/><circle cx="172" cy="72" r="7" fill="#fff"/><circle cx="145" cy="73" r="3.5" fill="#2B2B33"/><circle cx="173" cy="73" r="3.5" fill="#2B2B33"/></g>
  <path d="M152 84h8l-4 5z" fill="#F2A3B5"/>
  <path class="bouche-fermee" d="M156 89q-5 6-10 2M156 89q5 6 10 2" fill="none" stroke="#2B2B33" stroke-width="2"/>
  <ellipse class="bouche-ouverte" cx="156" cy="95" rx="7" ry="9" fill="#9a2a32"/>
  <g stroke="#8A5A2B" stroke-width="1.5"><path d="M136 84l-24-4M136 88l-24 4M176 84l24-4M176 88l24 4"/></g>
  <path d="M126 100q30 12 60 0" fill="none" stroke="#D64045" stroke-width="5"/><circle cx="156" cy="108" r="6" fill="#FFC857"/>
  <g id="zzz"><text x="196" y="30" class="z">z</text><text x="216" y="10" class="z petit">z</text></g>
  <g id="bulle"><rect x="120" y="-34" width="96" height="42" rx="12" fill="#fff"/><path d="M150 8l10 14 6-14z" fill="#fff"/><text x="168" y="-5" class="bulle-txt">Mmh ?</text></g>
</g>
<g id="jeu-souris" transform="translate(40,300)"><circle cx="105" cy="89" r="26" fill="url(#glow)"/><use href="#souris-side" width="130" height="100"/></g>
</svg>`;
  }

  // ---------- Chapitre 3 : la caméra (salon avec la cheminée, puis chambre) ----------
  function camSVG() {
    return `<svg class="camsvg" viewBox="0 0 400 300" aria-hidden="true">
<g id="cam-salon">
  <rect width="400" height="300" fill="#06180B"/>
  <line x1="0" y1="250" x2="400" y2="250" stroke="#1d4d26" stroke-width="2"/>
  ${window.DESSINS.cachetteCam(window.CONFIG.profil.cachette)}
  <circle cx="200" cy="66" r="22" fill="none" stroke="#2fbf2f" stroke-width="2"/><path d="M200 66v-14M200 66l9 7" stroke="#39FF14" stroke-width="2" stroke-linecap="round"/>
  <path d="M330 250v-60h50v60M330 190q25-20 50 0" fill="none" stroke="#2fbf2f" stroke-width="2"/>
  <g id="bateau2" class="cam-bateau"><use href="#bateau-cam" width="46" height="25"/></g>
  <g id="cs2" class="cam-souris"><use href="#souris-cam" width="70" height="54"/></g>
</g>
<g id="cam-chambre" hidden>
  <rect width="400" height="300" fill="#06180B"/>
  <line x1="0" y1="236" x2="400" y2="236" stroke="#1d4d26" stroke-width="2"/>
  <!-- fenêtre et rideaux -->
  <rect x="292" y="32" width="76" height="86" fill="none" stroke="#2fbf2f" stroke-width="2"/><path d="M330 32v86M292 75h76" stroke="#2fbf2f" stroke-width="1.5"/>
  <path d="M284 24q10 52 0 104M376 24q-10 52 0 104M280 24h100" fill="none" stroke="#2fbf2f" stroke-width="2"/>
  ${window.CONFIG.profil.fratrie && window.CONFIG.profil.fratrie.dortACote ? window.DESSINS.fratrieCam(window.CONFIG.profil.fratrie.genre) : `<!-- table de nuit et veilleuse -->
  <rect x="320" y="178" width="50" height="58" rx="3" fill="none" stroke="#2fbf2f" stroke-width="2"/><path d="M320 202h50" stroke="#2fbf2f" stroke-width="1.5"/><circle cx="345" cy="191" r="2.2" fill="#39FF14"/>
  <path d="M332 162l5-18h16l5 18z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/><path d="M345 162v16" stroke="#2fbf2f" stroke-width="3"/>`}
  <!-- lit : tête de lit arrondie à barreaux, pied de lit, sommier, pieds -->
  <path d="M30 236V112q0-16 16-16h8q16 0 16 16v124" fill="#0b3a14" stroke="#2fbf2f" stroke-width="2"/>
  <path d="M42 112v84M50 108v88M58 112v84" stroke="#1d7a2c" stroke-width="1.5"/>
  <path d="M292 236v-66q0-10 10-10h4q10 0 10 10v66" fill="#0b3a14" stroke="#2fbf2f" stroke-width="2"/>
  <rect x="70" y="196" width="222" height="22" rx="4" fill="#0b3a14" stroke="#2fbf2f" stroke-width="2"/>
  <path d="M78 218v18M284 218v18" stroke="#2fbf2f" stroke-width="3" stroke-linecap="round"/>
  <!-- oreiller -->
  <path d="M72 170q-6-28 22-28h30q14 0 14 16v10q-10 8-34 8t-32-6z" fill="#0f4a1b" stroke="#39FF14" stroke-width="2"/>
  <path d="M84 148q16-3 40 0" fill="none" stroke="#1d7a2c" stroke-width="1.5"/>
  <!-- l'enfant endormi -->
  ${window.DESSINS.enfantCam(window.CONFIG.profil.genre)}
  <!-- la couverture qui épouse le corps, avec ses plis -->
  <path d="M112 197v-25q10-12 30-12q30-4 58 4q34 8 60 4q20-2 34 6v23z" fill="#0b3a14" stroke="#2fbf2f" stroke-width="2"/>
  <path d="M150 178q20 9 40 3M222 182q24 7 48 0M118 186q86 9 176 0" fill="none" stroke="#1d7a2c" stroke-width="1.5"/>
  <!-- le doudou choisi par les parents, serré contre l'enfant -->
  ${window.DESSINS.doudouCam(window.CONFIG.profil.doudou.type)}
  <!-- le bras de l'enfant par-dessus la couverture, qui tient le doudou -->
  <path d="M124 174q22-7 46-3q10 2 16-3" fill="none" stroke="#39FF14" stroke-width="5" stroke-linecap="round"/>
  <circle cx="188" cy="166" r="4.5" fill="#0f4a1b" stroke="#39FF14" stroke-width="1.8"/>
  <!-- une chaussette oubliée -->
  <path d="M30 262q-10 10 0 16 8 4 14-4l4-22h-10z" fill="none" stroke="#2fbf2f" stroke-width="1.5"/>
  <!-- la dent et le petit mot, qui dépassent du coin de l'oreiller -->
  <g id="dent1"><use href="#dent-cam" x="78" y="165" width="12" height="12"/></g>
  <g id="mot1" class="cam-mot"><use href="#mot-cam" x="70" y="163" width="26" height="19"/></g>
  <!-- la patte de Quenotte, qui monte du bas du gros plan : elle prend la dent, puis glisse le petit mot -->
  <g id="patte" class="cam-patte"><g class="patte-lettre" transform="rotate(-80)"><use href="#mot-cam" x="-13" y="-9" width="26" height="19"/></g>
    <path d="M4-5L90-10V10L4 5Z" fill="#0b3a14" stroke="#39FF14" stroke-width="1.4" stroke-linejoin="round"/>
    <ellipse cx="2" cy="0" rx="7" ry="6.2" fill="#0f4a1b" stroke="#39FF14" stroke-width="1.4"/>
    <g fill="#0f4a1b" stroke="#39FF14" stroke-width="1"><circle cx="-4.5" cy="-4.2" r="2"/><circle cx="-6" cy="0" r="2"/><circle cx="-4.5" cy="4.2" r="2"/></g></g>
</g>
</svg>`;
  }

  // ---------- Chapitre 4 : l'enveloppe ----------
  function enveloppeSVG(enfant) {
    return `<svg class="env" viewBox="0 0 400 280" role="group" aria-label="Une enveloppe fermée par un cachet de cire">
<rect x="40" y="60" width="320" height="200" rx="10" fill="#FFF6E0" stroke="#e6d6ae" stroke-width="2"/>
<path d="M40 70L200 190 360 70" fill="none" stroke="#e6d6ae" stroke-width="2"/>
<path d="M40 260L200 150 360 260" fill="#f7ecd0" stroke="#e6d6ae" stroke-width="2"/>
<text x="200" y="252" class="env-nom">pour ${enfant}</text>
<g id="rabat"><path d="M40 60L200 190 360 60Z" fill="#fbf1dc" stroke="#e6d6ae" stroke-width="2"/></g>
<g id="cachet" class="tap" role="button" aria-label="Ouvrir la lettre" tabindex="0"><circle cx="200" cy="190" r="40" fill="url(#gcire)" stroke="#8d1c26" stroke-width="2"/><use href="#dent" x="184" y="174" width="32" height="32"/></g>
</svg>`;
  }

  // ---------- Chapitre secret : trois tableaux ----------
  // ---------- La lampe de poche : la maison dans le noir, le doigt promène la lumière ----------
  function lampeSVG() {
    const C = window.CONFIG, nom = C.enfant;
    const porte = (x, plaque) => `<g transform="translate(${x},470)"><rect x="-60" y="-250" width="120" height="250" rx="6" fill="#8B5A3C" stroke="#5c3a24" stroke-width="4"/><rect x="-42" y="-228" width="84" height="90" rx="4" fill="#7a4e33"/><rect x="-42" y="-120" width="84" height="100" rx="4" fill="#7a4e33"/><circle cx="44" cy="-118" r="6" fill="#C9A227"/>${plaque || ''}</g>`;
    const plaque = `<g class="plaque"><rect x="-54" y="-212" width="108" height="46" rx="10" fill="#FFF6E0" stroke="#C9A227" stroke-width="3"/><text x="0" y="-196" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="13" font-weight="700" fill="#6b5a2a">Chambre de</text><text x="0" y="-176" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="${nom.length > 10 ? 15 : 19}" font-weight="800" fill="#D64045">${nom}</text></g>`;
    return `<svg class="lampe" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${C.laMaison.charAt(0).toUpperCase() + C.laMaison.slice(1)} dans le noir : trouve la porte de ta chambre">
<defs><radialGradient id="g-trou"><stop offset=".55" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
<mask id="m-lampe" maskUnits="userSpaceOnUse" x="-1000" y="-1000" width="3000" height="2600"><rect x="-1000" y="-1000" width="3000" height="2600" fill="#fff"/><circle class="trou" cx="150" cy="430" r="130" fill="url(#g-trou)"/></mask></defs>
<rect x="-1000" y="-1000" width="3000" height="1470" fill="#C9B79A"/><rect x="-1000" y="470" width="3000" height="1130" fill="#8a6a4e"/><path d="M-1000 470h3000" stroke="#6b4f39" stroke-width="6"/><path d="M0 470h1000" stroke="#6b4f39" stroke-width="6"/>
<g fill="#b8a585">${[60, 300, 540, 780].map(x => `<rect x="${x}" y="0" width="6" height="470"/>`).join('')}</g>
<g transform="translate(70,470)"><path d="M10 0v-210M-20 -200h60" stroke="#5c3a24" stroke-width="7" stroke-linecap="round"/><path d="M-26-196q-14 40 4 90h34q10-50-8-90z" fill="#3E7C8F"/><path d="M30-196q20 30 6 70" fill="none" stroke="#D64045" stroke-width="10" stroke-linecap="round"/></g>
<g transform="translate(180,470)"><path d="M-30 0q0-20 22-20h18v20zM12 0q0-18 20-18h16v18z" fill="#2b3470"/></g>
${porte(330, '<path d="M-20-200h40" stroke="#C9A227" stroke-width="4"/>')}
<g transform="translate(470,250)"><rect x="-70" y="-60" width="140" height="100" fill="#FFF6E0" stroke="#8B5A3C" stroke-width="8"/><path d="M-60 30l40-50 30 35 20-20 40 35" fill="none" stroke="#3E7C8F" stroke-width="6"/><circle cx="30" cy="-30" r="12" fill="#FFC857"/></g>
<g transform="translate(560,470)"><rect x="-30" y="-36" width="60" height="30" rx="6" fill="#D64045"/><circle cx="-16" cy="-4" r="9" fill="#2B2B33"/><circle cx="16" cy="-4" r="9" fill="#2B2B33"/></g>
${porte(720, plaque)}
<g transform="translate(900,470)"><path d="M-24 0l6-50h36l6 50z" fill="#B05E3B"/><path d="M0-50q-34-40-30-90q24 30 30 90zM0-50q30-44 26-96q-22 34-26 96z" fill="#2F5D50"/></g>
<rect class="noir" x="-1000" y="-1000" width="3000" height="2600" fill="#05060f" mask="url(#m-lampe)"/>
<rect class="fente" x="666" y="464" width="108" height="8" rx="3" fill="#FFC857"/>
<g class="lueur-lanterne"><circle class="faisceau" cx="150" cy="430" r="22" fill="url(#glow)"/></g>
</svg>`;
  }

  // ---------- Les saisons : selon le mois de la nuit, des flocons, des pétales, des lucioles ou des feuilles ----------
  function saison(nuit) {
    const m = nuit ? parseInt(String(nuit).slice(5, 7), 10) : (new Date().getMonth() + 1);
    return m === 12 || m <= 2 ? 'hiver' : m <= 5 ? 'printemps' : m <= 8 ? 'ete' : 'automne';
  }
  // Repère w × h (sol vers y = 0,8 h). Chaque particule a sa place fixe (mouvement réduit) et son trajet animé.
  function saisonSVG(nuit, w, h) {
    const s = saison(nuit);
    let graine = 11;
    const hasard = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
    let p = '';
    const n = s === 'ete' ? 16 : 34;
    for (let i = 0; i < n; i++) {
      const x = Math.round(hasard() * w), y = Math.round(s === 'ete' ? h * (0.45 + hasard() * 0.4) : hasard() * h * 0.95);
      const duree = (s === 'hiver' ? 7 : s === 'ete' ? 3 : 9) + hasard() * 5, retard = -hasard() * duree;
      // Trajet de chute : depuis le haut de l'image jusqu'en bas, en dérivant un peu
      const style = `--h0:${-(y + 60)}px;--h1:${h - y + 30}px;--x:${Math.round((hasard() - 0.5) * 120)}px;animation-duration:${duree.toFixed(1)}s;animation-delay:${retard.toFixed(1)}s`;
      const r = 1 + hasard();
      if (s === 'hiver') p += `<circle class="p" cx="${x}" cy="${y}" r="${(2.2 * r).toFixed(1)}" fill="#fff" opacity="${(0.55 + hasard() * 0.4).toFixed(2)}" style="${style}"/>`;
      else if (s === 'printemps') p += `<ellipse class="p" cx="${x}" cy="${y}" rx="${(4 * r).toFixed(1)}" ry="${(2.4 * r).toFixed(1)}" fill="${hasard() > 0.5 ? '#F2A3B5' : '#FBD3DC'}" style="${style}"/>`;
      else if (s === 'automne') p += `<path class="p" d="M${x} ${y}q6-8 12 0q-6 8-12 0z" fill="${['#C9833A', '#B05E3B', '#D9A441'][i % 3]}" style="${style}"/>`;
      else p += `<g class="p" style="${style}"><circle cx="${x}" cy="${y}" r="9" fill="url(#glow)"/><circle cx="${x}" cy="${y}" r="2.4" fill="#F4F19A"/></g>`;
    }
    return `<g class="saison saison-${s}" aria-hidden="true">${p}</g>`;
  }

  return { lampeSVG, saison, saisonSVG, symboles, icone, badgeIcone, medaille, quenotteSacoche, portrait, cielSVG, jeuSVG, camSVG, enveloppeSVG, lune, luneSVG, etoiles, fond, souris, pointSouris, CIEL };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
