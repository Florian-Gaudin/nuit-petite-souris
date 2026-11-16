// Les dix décors illustrés du chapitre 1 (SVG 1000 × 600, sol vers y = 480).
// Chaque élément à toucher est un <g class="tap" data-el="…"> qui commence par un halo.
window.DECORS = (function () {
  'use strict';
  const A = window.ART;

  const halo = (cx, cy, r) => `<circle class="halo" cx="${cx}" cy="${cy}" r="${r}" fill="url(#halo-or)"/>`;
  // La position (transform) va sur un groupe autour : les petites animations de l'élément (tremblement
  // de refus…) ne peuvent plus l'envoyer dans le coin de l'image
  const tap = (el, label, contenu, attrs) => {
    attrs = attrs || '';
    const pos = attrs.match(/transform="[^"]*"/);
    const g = `<g class="tap" data-el="${el}" role="button" tabindex="0" aria-label="${label}" ${pos ? attrs.replace(pos[0], '') : attrs}>${contenu}</g>`;
    return pos ? `<g ${pos[0]}>${g}</g>` : g;
  };
  const sapin = (x, y, h, fill) => `<path d="M${x} ${y}l${h * 0.32}-${h} ${h * 0.32} ${h}z" fill="${fill}"/>`;
  function sapins(xs, y, h, fill) { return xs.map(x => sapin(x, y, h, fill)).join(''); }
  function lueur(x, y, r) { return `<circle class="lueur" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="url(#halo-or)"/>`; }

  // ---------- 1. Le château ----------
  function chateau(nuit) {
    const sx = 380, sy = 362, sw = 170;
    const L = A.pointSouris(sx, sy, sw, 'lanterne');
    return `<svg class="decor decor-chateau" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Le château fort de Sedan, la maison de Quenotte, la nuit">
${A.fond(nuit, 21, { x: 830, y: 95, r: 34 })}
<path d="M0 360Q150 300 300 340T600 330T1000 300V600H0Z" fill="#1E2658"/>
<g>${sapins([0, 60, 130, 200, 700, 760, 900, 960], 470, 150, '#1E3F36')}${sapins([30, 100, 170, 730, 820, 930], 480, 110, '#24483E')}</g>
<path d="M0 600V470Q250 450 500 470T1000 460V600Z" fill="#24483E"/>
<path d="M0 600V500Q500 480 1000 500V600Z" fill="#1A2A26"/>
<g id="chateau-svg" transform="translate(480,500) scale(.84) translate(-480,-500)">
  <!-- Le château fort de Sedan : le glacis vert, les longs corps de logis, les tours rondes coiffées d'ardoise -->
  <path d="M150 500L215 420H745L810 500Z" fill="#2F5D50"/><path d="M215 420H745" stroke="#24483E" stroke-width="4"/>
  <rect x="300" y="236" width="370" height="70" fill="#c9a466"/><path d="M286 238L318 196H652L684 238Z" fill="#5b6182"/>
  <g fill="#4a5478"><path d="M341 222l9-14 9 14z"/><rect x="344" y="222" width="12" height="10"/><path d="M411 222l9-14 9 14z"/><rect x="414" y="222" width="12" height="10"/><path d="M481 222l9-14 9 14z"/><rect x="484" y="222" width="12" height="10"/><path d="M551 222l9-14 9 14z"/><rect x="554" y="222" width="12" height="10"/><path d="M611 222l9-14 9 14z"/><rect x="614" y="222" width="12" height="10"/></g>
  <rect x="262" y="300" width="436" height="185" fill="#c9a466"/><path d="M262 322h436" stroke="#a8844e" stroke-width="1.5" opacity=".45"/><path d="M262 342h436" stroke="#a8844e" stroke-width="1.5" opacity=".45"/><path d="M262 362h436" stroke="#a8844e" stroke-width="1.5" opacity=".45"/><path d="M262 382h436" stroke="#a8844e" stroke-width="1.5" opacity=".45"/><path d="M262 402h436" stroke="#a8844e" stroke-width="1.5" opacity=".45"/><path d="M262 422h436" stroke="#a8844e" stroke-width="1.5" opacity=".45"/><path d="M262 442h436" stroke="#a8844e" stroke-width="1.5" opacity=".45"/><path d="M262 462h436" stroke="#a8844e" stroke-width="1.5" opacity=".45"/>
  <g fill="#a8844e"><rect x="264" y="300" width="12" height="9"/><rect x="285" y="300" width="12" height="9"/><rect x="306" y="300" width="12" height="9"/><rect x="327" y="300" width="12" height="9"/><rect x="348" y="300" width="12" height="9"/><rect x="369" y="300" width="12" height="9"/><rect x="390" y="300" width="12" height="9"/><rect x="411" y="300" width="12" height="9"/><rect x="432" y="300" width="12" height="9"/><rect x="453" y="300" width="12" height="9"/><rect x="474" y="300" width="12" height="9"/><rect x="495" y="300" width="12" height="9"/><rect x="516" y="300" width="12" height="9"/><rect x="537" y="300" width="12" height="9"/><rect x="558" y="300" width="12" height="9"/><rect x="579" y="300" width="12" height="9"/><rect x="600" y="300" width="12" height="9"/><rect x="621" y="300" width="12" height="9"/><rect x="642" y="300" width="12" height="9"/><rect x="663" y="300" width="12" height="9"/><rect x="684" y="300" width="12" height="9"/></g>
  <rect x="223" y="262" width="66" height="223" rx="33" fill="#b8925a"/><rect x="223" y="272" width="22" height="213" fill="#a07a48" opacity=".5"/><path d="M215 268L256 198L297 268Z" fill="#5b6182"/><path d="M256 198v-14" stroke="#4a5478" stroke-width="3"/><rect x="664" y="250" width="72" height="235" rx="36" fill="#b8925a"/><rect x="664" y="260" width="24" height="225" fill="#a07a48" opacity=".5"/><path d="M656 256L700 186L744 256Z" fill="#5b6182"/><path d="M700 186v-14" stroke="#4a5478" stroke-width="3"/><rect x="315" y="300" width="46" height="185" rx="23" fill="#b8925a"/><rect x="315" y="310" width="15.333333333333334" height="175" fill="#a07a48" opacity=".5"/><path d="M307 306L338 236L369 306Z" fill="#5b6182"/><path d="M338 236v-14" stroke="#4a5478" stroke-width="3"/>
  <rect x="566" y="268" width="56" height="40" fill="#b8925a"/><path d="M558 270L594 222L630 270Z" fill="#5fa3a3"/>
  <g fill="#3a2f22"><rect x="248" y="330" width="8" height="16" rx="4"/><rect x="248" y="400" width="8" height="16" rx="4"/><rect x="692" y="320" width="8" height="16" rx="4"/><rect x="692" y="392" width="8" height="16" rx="4"/><rect x="336" y="360" width="8" height="16" rx="4"/><rect x="300" y="380" width="8" height="16" rx="4"/><rect x="610" y="360" width="8" height="16" rx="4"/><rect x="560" y="340" width="8" height="16" rx="4"/><rect x="390" y="330" width="8" height="16" rx="4"/></g>
  <g fill="#FFC857"><rect x="300" y="254" width="10" height="14" rx="2"/><rect x="400" y="254" width="10" height="14" rx="2"/><rect x="520" y="254" width="10" height="14" rx="2"/><rect x="600" y="254" width="10" height="14" rx="2"/><rect x="632" y="290" width="10" height="14" rx="2"/></g>
  <path d="M420 486v-78a45 45 0 0 1 90 0v78z" fill="#a8844e"/>
  <path d="M440 485v-62a25 25 0 0 1 50 0v62z" fill="#6E4630"/><circle cx="480" cy="452" r="3" fill="#C9A227"/>
  <g class="tresor"><circle cx="465" cy="355" r="40" fill="url(#halo-or)" opacity=".7"/><rect x="445" y="332" width="40" height="48" rx="6" fill="#FFC857"/><path d="M445 356h40M465 332v48" stroke="#B9801A" stroke-width="2"/><use href="#dent" x="455" y="346" width="20" height="20"/></g>
</g>
<rect x="790" y="300" width="26" height="185" fill="#4a3324"/><path d="M780 485q23-20 46 0z" fill="#4a3324"/>
${tap('cuisine', 'La fenêtre des cuisines du château', `${halo(318, 438, 50)}
  <g class="cuisine"><rect x="292" y="420" width="52" height="40" rx="6" fill="#3a2f22"/><path d="M296 424h44v32h-44z" fill="#FFB547"/><path d="M296 424h44v10h-44z" fill="#FFD27A"/>
  <path d="M318 424v32M296 440h44" stroke="#6E4630" stroke-width="3"/><rect x="288" y="456" width="60" height="7" rx="2" fill="#8B5A3C"/>
  <g transform="translate(318,450)"><path d="M-15-6h30v6a10 10 0 0 1-10 10h-10a10 10 0 0 1-10-10z" fill="#1F2235"/><rect x="-17" y="-9" width="34" height="4" rx="2" fill="#2b2b33"/><path d="M-19-4h-4M19-4h4" stroke="#1F2235" stroke-width="3" stroke-linecap="round"/></g>
  <g class="vapeur" fill="none" stroke="#f3efe6" stroke-width="3" stroke-linecap="round" opacity=".75"><path d="M312 436q-5-7 0-14t0-14"/><path d="M324 436q5-7 0-14t0-14"/></g></g>`)}
${tap('feuillage', 'Le feuillage de l’arbre', `${halo(803, 255, 105)}
  <g class="feuillage"><circle cx="755" cy="285" r="56" fill="#1E3F36"/><circle cx="850" cy="280" r="58" fill="#1E3F36"/><circle cx="800" cy="228" r="66" fill="#24483E"/><circle cx="765" cy="238" r="42" fill="#2F5D50"/><circle cx="836" cy="236" r="38" fill="#2F5D50"/></g>
  <g transform="translate(800,250)"><g class="hulotte"><path class="aile ag" d="M-16 6q-26 6-22 34q14-6 22-24z" fill="#8B5A3C"/><path class="aile ad" d="M16 6q26 6 22 34q-14-6-22-24z" fill="#8B5A3C"/><ellipse cx="0" cy="20" rx="19" ry="24" fill="#8B5A3C"/><ellipse cx="0" cy="24" rx="10" ry="16" fill="#C9A98A"/><circle cx="0" cy="-4" r="18" fill="#A0724A"/><path d="M-16-14l-6-14 14 6zM16-14l6-14-14 6z" fill="#A0724A"/><circle cx="-7" cy="-6" r="7.5" fill="#FFF4D6"/><circle cx="7" cy="-6" r="7.5" fill="#FFF4D6"/><circle cx="-7" cy="-6" r="3.5" fill="#2B2B33"/><circle cx="7" cy="-6" r="3.5" fill="#2B2B33"/><path d="M-3 1l3 6 3-6z" fill="#FFC857"/></g></g>`)}
<rect class="noir" x="0" y="-1100" width="1000" height="1700" fill="#050816" opacity=".45"/>
${lueur(L.x, L.y, 150)}
${A.souris(sx, sy, sw, 'class="quenotte"', 'souris-side-sans')}
${tap('lanterne', 'La lanterne de Quenotte', `${halo(L.x.toFixed(0), L.y.toFixed(0), 40)}<circle cx="${L.x.toFixed(0)}" cy="${L.y.toFixed(0)}" r="44" fill="transparent"/>`)}
${tap('sac', 'Le sac de Quenotte', `${halo(0, 10, 56)}
  <g class="billet-sac"><use href="#billet" x="-26" y="-14" width="52" height="28" transform="rotate(-12)"/></g>
  <path d="M-36 44C-40 10-28-12 0-12s40 22 36 56z" fill="#8B5A3C" stroke="#5c3a24" stroke-width="2"/>
  <path d="M-22-6q22-14 44 0q-22 10-44 0z" fill="#6E4630"/><path d="M-18-2q18 8 36 0" stroke="#C9A227" stroke-width="3" fill="none" stroke-linecap="round"/>`, 'transform="translate(650,440)"')}
</svg>`;
  }

  // ---------- 2. La forêt des Ardennes ----------
  function foret(nuit) {
    const sx = 104, sy = 418, sw = 170;
    const L = A.pointSouris(sx, sy, sw, 'lanterne');
    const champi = (x, y, s, i) => `<g class="champi" data-sub="${i}" transform="translate(${x},${y}) scale(${s})"><circle class="champi-lueur" cx="0" cy="-16" r="70" fill="url(#halo-or)"/><rect x="-10" y="-10" width="20" height="34" rx="7" fill="#E9E2D6"/><path class="chapeau" d="M-36-6q36-48 72 0z" fill="#6b4a5a"/><circle class="pois" cx="-12" cy="-22" r="4" fill="#9a7a8a"/><circle class="pois" cx="10" cy="-30" r="3" fill="#9a7a8a"/><circle class="pois" cx="18" cy="-14" r="3.5" fill="#9a7a8a"/></g>`;
    let fars = '';
    [60, 150, 240, 330, 420, 520, 610, 700, 790, 880, 960].forEach((x, i) => { fars += `<rect x="${x}" y="-1100" width="${18 + (i % 3) * 5}" height="1600" fill="#141c3c"/>`; });
    return `<svg class="decor decor-foret" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="La grande forêt des Ardennes, la nuit">
${A.fond(nuit, 31, null)}
<rect x="0" y="-1100" width="1000" height="1700" fill="#0d1430" opacity=".45"/>
${fars}
<defs><linearGradient id="foret-rayon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ecff" stop-opacity=".3"/><stop offset="1" stop-color="#e8ecff" stop-opacity=".06"/></linearGradient></defs>
<!-- Les grands troncs, plantés à différentes hauteurs de la colline -->
<g fill="#1a1226"><rect x="196" y="-300" width="46" height="820"/><rect x="368" y="-300" width="40" height="770"/><rect x="900" y="-300" width="54" height="480"/></g>
<!-- La colline : elle monte du bas à gauche vers le haut à droite, avec une clairière à mi-pente -->
<path d="M-20 610V556Q120 546 240 516Q360 482 430 446L660 428Q720 420 760 330Q800 232 880 192Q940 166 1020 162V610Z" fill="#14271f"/>
<path d="M-20 610V580Q200 570 320 540Q420 510 470 470L640 452Q740 440 790 360Q830 290 900 250Q960 226 1020 224V610Z" fill="#10201a" opacity=".7"/>
<!-- Le sentier en lacets, du pied de la colline jusqu'au sommet -->
<path d="M140 566Q300 560 330 520Q350 488 440 470Q560 450 640 436Q700 424 700 392Q700 350 760 316Q820 270 860 214" fill="none" stroke="#2b3b36" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M140 566Q300 560 330 520Q350 488 440 470Q560 450 640 436Q700 424 700 392Q700 350 760 316Q820 270 860 214" fill="none" stroke="#3a4e46" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>
<!-- La clairière et le rayon de lune qui perce les arbres -->
<path class="rayon-lune" d="M482-60H578L700 450H420Z" fill="url(#foret-rayon)"/>
<ellipse cx="560" cy="440" rx="140" ry="20" fill="#3d5e4c" opacity=".85"/>
<g fill="#0f2a22"><rect x="0" y="-1100" width="1000" height="1140"/><ellipse cx="100" cy="30" rx="260" ry="115"/><ellipse cx="220" cy="-150" rx="320" ry="130" fill="#132e26"/><ellipse cx="700" cy="-230" rx="360" ry="140" fill="#0c2219"/><ellipse cx="420" cy="-420" rx="420" ry="160" fill="#11291f"/><ellipse cx="880" cy="-520" rx="300" ry="150" fill="#0c2219"/><ellipse cx="120" cy="-600" rx="300" ry="130" fill="#132e26"/><ellipse cx="500" cy="10" rx="310" ry="125"/><ellipse cx="900" cy="30" rx="260" ry="115"/></g>
<g class="brume" fill="#cfd3ee" opacity=".08"><ellipse cx="260" cy="560" rx="220" ry="24"/><ellipse cx="560" cy="452" rx="200" ry="22"/><ellipse cx="860" cy="230" rx="160" ry="20"/></g>
${tap('champignons', 'Les champignons lumineux', `${halo(300, 528, 60)}${halo(452, 490, 56)}${halo(752, 344, 56)}${champi(300, 544, 1.1, 0)}${champi(452, 506, 1, 1)}${champi(752, 360, .95, 2)}`)}
${tap('buisson', 'Un buisson qui tremble', `${halo(0, -10, 85)}
  <g class="renard"><path d="M40 10q40-30 40 10" fill="none" stroke="#E07A3F" stroke-width="12" stroke-linecap="round"/><path d="M72 18q14-6 10 8" fill="none" stroke="#FFF4D6" stroke-width="10" stroke-linecap="round"/><ellipse cx="10" cy="14" rx="42" ry="20" fill="#E07A3F"/><ellipse cx="4" cy="22" rx="24" ry="10" fill="#FFF4D6"/><circle cx="-36" cy="2" r="19" fill="#E07A3F"/><path d="M-48-10l-6-20 16 10zM-24-10l6-20-16 10z" fill="#E07A3F"/><path d="M-52 6q-10 4-14 10 6 2 14 0z" fill="#FFF4D6"/><circle cx="-58" cy="12" r="3" fill="#2B2B33"/><circle cx="-40" cy="-1" r="3.2" fill="#2B2B33"/><circle cx="-39" cy="-2" r="1" fill="#fff"/><g fill="#E07A3F"><rect x="-18" y="26" width="10" height="14" rx="4"/><rect x="18" y="26" width="10" height="14" rx="4"/></g></g>
  <g class="buisson"><circle cx="-40" cy="-6" r="34" fill="#1E3F36"/><circle cx="0" cy="-26" r="42" fill="#24483E"/><circle cx="44" cy="-6" r="36" fill="#1E3F36"/><circle cx="6" cy="4" r="34" fill="#2F5D50"/></g>`, 'transform="translate(842,200)"')}
${tap('sanglier', 'Un sanglier endormi sous les fougères', `${halo(0, -14, 70)}<g class="sanglier">
  <path d="M-46 4q-14-4-12-16" fill="none" stroke="#3a2618" stroke-width="4" stroke-linecap="round"/>
  <g class="pattes-sanglier"><g fill="#6e4a32" stroke="#e3c49a" stroke-width="1.5"><rect x="-36" y="-2" width="11" height="22" rx="4"/><rect x="-18" y="0" width="11" height="20" rx="4"/><rect x="10" y="-2" width="11" height="22" rx="4"/><rect x="26" y="0" width="11" height="20" rx="4"/></g><g fill="#2a1a10"><rect x="-36" y="16" width="11" height="5" rx="2"/><rect x="-18" y="16" width="11" height="5" rx="2"/><rect x="10" y="16" width="11" height="5" rx="2"/><rect x="26" y="16" width="11" height="5" rx="2"/></g></g>
  <ellipse cx="-4" cy="-10" rx="44" ry="24" fill="#8a5e40" stroke="#e3c49a" stroke-width="2"/>
  <path d="M30-30l4-12 8 9z" fill="#6e4a32" stroke="#e3c49a" stroke-width="1.2"/><path d="M-36-30q14-10 30-6q16-8 30 2" fill="none" stroke="#2a1a10" stroke-width="5" stroke-linecap="round"/>
  <path class="tete" d="M30-24q20-4 30 14l8 4q2 8-6 10l-24 2q-14-4-14-16z" fill="#9a6c4c" stroke="#e3c49a" stroke-width="2"/><ellipse cx="66" cy="-2" rx="6" ry="5" fill="#8a6a5a"/><path d="M50 2q6 2 6-6" fill="none" stroke="#FFF6E0" stroke-width="3" stroke-linecap="round"/>
  <path d="M34-24l6-12 6 12z" fill="#3a2618"/><path class="oeil" d="M44-12q3 2 6 0" fill="none" stroke="#1a110a" stroke-width="2" stroke-linecap="round"/>
  <g class="zz" fill="#cfd3ee" font-family="Baloo 2, sans-serif" font-weight="800"><text x="58" y="-34" font-size="14">z</text><text x="68" y="-46" font-size="10">z</text></g>
</g>${'<path transform="translate(-74,14) scale(0.7)" d="M0 0q-6-30 6-60M0-10l-16-10M0-22l-14-12M2-34l-12-12M3-46l-9-10M0-10l14-12M1-22l13-13M3-34l10-12" fill="none" stroke="#2F5D50" stroke-width="4" stroke-linecap="round"/><path transform="translate(96,14) scale(0.8)" d="M0 0q-6-30 6-60M0-10l-16-10M0-22l-14-12M2-34l-12-12M3-46l-9-10M0-10l14-12M1-22l13-13M3-34l10-12" fill="none" stroke="#2F5D50" stroke-width="4" stroke-linecap="round"/><path transform="translate(118,14) scale(0.65)" d="M0 0q-6-30 6-60M0-10l-16-10M0-22l-14-12M2-34l-12-12M3-46l-9-10M0-10l14-12M1-22l13-13M3-34l10-12" fill="none" stroke="#2F5D50" stroke-width="4" stroke-linecap="round"/>'}`, 'transform="translate(540,424) scale(1.6)"')}
${tap('luciole', 'Une luciole', `<animateMotion dur="18s" repeatCount="indefinite" path="M220 420C330 300 480 360 620 300S820 120 880 110S760 320 560 360S300 480 220 420"/>${halo(0, 0, 44)}<circle r="34" fill="transparent"/><circle class="lum" r="16" fill="url(#halo-or)"/><circle r="4.5" fill="#FFF4D6"/>`)}
<rect class="dore" x="0" y="-1100" width="1000" height="1700" fill="#FFC857" opacity="0"/>
${lueur(L.x, L.y, 120)}
${A.souris(sx, sy, sw, 'class="quenotte trotte"')}
</svg>`;
  }

  // ---------- 3. La Meuse ----------
  function meuse(nuit) {
    const sx = 20, sy = 296, sw = 150;
    const L = A.pointSouris(sx, sy, sw, 'lanterne');
    // Sur l'autre rive : des champs, et très loin les lumières de la ville de l'enfant
    let lum = '';
    for (let i = 0; i < 6; i++) lum += `<rect x="${880 + i * 11}" y="${282 - (i % 2) * 4}" width="3" height="4" fill="#FFC857"/>`;
    const nomRiviere = window.CONFIG.Riviere;
    return `<svg class="decor decor-meuse" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="${nomRiviere} sous la lune, avec ${window.CONFIG.leCadeau} et son bateau">
${A.fond(nuit, 41, null)}
<g class="lune-haute" data-ciel="560,.2,60" transform="translate(560,60)"><circle r="60" fill="#FFF4D6" opacity=".07"/><path d="M10 -36A38 38 0 1 0 10 36A40 40 0 0 1 10 -36Z" fill="#FFF4D6"/></g>
<defs><linearGradient id="geau" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a8ea3"/><stop offset="1" stop-color="#2b5f70"/></linearGradient></defs>
<g class="grands-arbres">
  <rect x="96" y="40" width="34" height="300" fill="#1a1226"/><rect x="900" y="20" width="38" height="300" fill="#1a1226"/>
  <path d="M112 120q-40-30-80-20M112 60q30-40 70-40M918 100q-50-40-90-30M918 60q30-50 80-60" fill="none" stroke="#1a1226" stroke-width="10" stroke-linecap="round"/>
  <g fill="#14271f"><circle cx="60" cy="20" r="110"/><circle cx="150" cy="-60" r="120"/><circle cx="60" cy="-170" r="120"/><circle cx="170" cy="-230" r="110"/><circle cx="80" cy="-330" r="100"/><circle cx="940" cy="0" r="120"/><circle cx="850" cy="-80" r="110"/><circle cx="960" cy="-190" r="130"/><circle cx="860" cy="-280" r="110"/><circle cx="950" cy="-380" r="100"/></g>
  <g fill="#1E3F36"><circle cx="110" cy="-20" r="70"/><circle cx="40" cy="-110" r="60"/><circle cx="150" cy="-180" r="70"/><circle cx="900" cy="-40" r="70"/><circle cx="960" cy="-130" r="60"/><circle cx="880" cy="-220" r="70"/></g>
  <g class="lucioles-riviere" fill="#FFC857"><circle cx="220" cy="120" r="3"/><circle cx="260" cy="60" r="3"/><circle cx="760" cy="90" r="3"/><circle cx="720" cy="30" r="3"/><circle cx="300" cy="-40" r="3"/><circle cx="690" cy="-80" r="3"/></g>
</g>
<path d="M0 330Q200 280 400 320T1000 290V600H0Z" fill="#1E2658"/>
<g class="lumieres"><path d="M700 330Q800 290 900 296T1000 288V330Z" fill="#1E3F36"/><path d="M720 318q80-16 160-12M760 324q90-10 180-8" fill="none" stroke="#2F5D50" stroke-width="3"/><g fill="#1b2250"><rect x="874" y="278" width="22" height="16"/><path d="M872 278l13-10 13 10z"/><rect x="900" y="282" width="26" height="12"/><rect x="930" y="276" width="16" height="18"/><path d="M928 276l10-12 10 12z"/></g>${lum}</g>
<rect y="330" width="1000" height="270" fill="url(#geau)"/>
<g class="vagues" fill="none" stroke="#7FB8C7" stroke-width="2.5" stroke-linecap="round" opacity=".5"><path d="M-100 400q20-8 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0"/><path d="M-100 470q20-8 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0" opacity=".7"/><path d="M-100 540q20-8 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0" opacity=".5"/></g>
${tap('reflet', 'Le reflet de la lune', `${halo(590, 420, 70)}<g transform="translate(590,421) scale(1.2,-.42)"><path class="reflet" d="M10 -36A38 38 0 1 0 10 36A40 40 0 0 1 10 -36Z" fill="#FFF4D6" opacity=".6"/></g><g class="ronds" fill="none" stroke="#FFF4D6" stroke-width="2"><ellipse cx="590" cy="420" rx="30" ry="9"/><ellipse cx="590" cy="420" rx="30" ry="9"/><ellipse cx="590" cy="420" rx="30" ry="9"/></g>`)}
${tap('bulles', 'Des bulles dans l’eau', `${halo(410, 440, 60)}<g class="bulles-eau" fill="none" stroke="#cfe9f0" stroke-width="2"><circle cx="398" cy="462" r="5"/><circle cx="416" cy="470" r="7"/><circle cx="430" cy="455" r="4"/></g>
  <g class="poisson"><g class="poisson-in"><ellipse cx="0" cy="0" rx="28" ry="13" fill="#9fd0dd" stroke="#5f9fb0" stroke-width="2"/><path d="M26-2l16-12v28l-16-12z" fill="#9fd0dd" stroke="#5f9fb0" stroke-width="2"/><circle cx="-14" cy="-3" r="3" fill="#2B2B33"/><path d="M-6-13q6-8 12 0" fill="none" stroke="#5f9fb0" stroke-width="2"/></g></g>`, 'transform="translate(0,0)"')}
<path d="M0 600V380Q120 360 240 400L300 600Z" fill="#24483E"/><path d="M0 600V440Q120 430 230 470L260 600Z" fill="#1A2A26"/>
<path d="M1000 600V360Q900 350 780 400L720 600Z" fill="#24483E"/><path d="M1000 600V430Q900 420 790 460L760 600Z" fill="#1A2A26"/>
<g fill="#2F5D50"><ellipse cx="60" cy="390" rx="40" ry="18"/><ellipse cx="900" cy="372" rx="46" ry="18"/></g>
${window.CONFIG.cadeau !== 'billet' ? tap('billet', window.CONFIG.unCadeau.charAt(0).toUpperCase() + window.CONFIG.unCadeau.slice(1) + ', et son bateau à construire', `<g class="billet-in">${halo(0, 0, 84)}
  <g class="pli pli0"><use href="#billet" x="-50" y="-27" width="100" height="54"/></g>
  <g class="pli pli1"><path d="M-62 0q62 14 124 0q-8 30-62 30t-62-30z" fill="#A47B54" stroke="#6E4630" stroke-width="2"/><path d="M-44 10q44 9 88 0" fill="none" stroke="#6E4630" stroke-width="2" opacity=".6"/><use href="#billet" x="-44" y="-22" width="52" height="28"/></g>
  <g class="pli pli2"><path d="M8 4v-60" stroke="#6E4630" stroke-width="5" stroke-linecap="round"/><path d="M-62 0q62 14 124 0q-8 30-62 30t-62-30z" fill="#A47B54" stroke="#6E4630" stroke-width="2"/><use href="#billet" x="-44" y="-22" width="52" height="28"/></g>
  <g class="pli pli3"><use href="#bateau" x="-70" y="-40" width="140" height="74"/></g></g>`, 'transform="translate(170,316)" data-etape="0"') : tap('billet', 'Le billet de ' + window.CONFIG.euros + ' euros à plier', `<g class="billet-in">${halo(0, 0, 84)}
  <g class="pli pli0"><use href="#billet" x="-70" y="-37" width="140" height="74"/></g>
  <g class="pli pli1"><rect x="-70" y="-20" width="140" height="40" rx="3" fill="${window.CONFIG.billetCouleurs.moyen}" stroke="${window.CONFIG.billetCouleurs.fonce}" stroke-width="2"/><path d="M-70 0h140" stroke="${window.CONFIG.billetCouleurs.fonce}" stroke-width="2" stroke-dasharray="6 4" opacity=".6"/><text x="0" y="12" font-family="Share Tech Mono, monospace" font-size="18" fill="${window.CONFIG.billetCouleurs.fonce}" text-anchor="middle">${window.CONFIG.euros} €</text></g>
  <g class="pli pli2"><path d="M-62 18L0-44l62 62z" fill="${window.CONFIG.billetCouleurs.clair}" stroke="${window.CONFIG.billetCouleurs.fonce}" stroke-width="2"/><rect x="-62" y="18" width="124" height="16" fill="${window.CONFIG.billetCouleurs.moyen}" stroke="${window.CONFIG.billetCouleurs.fonce}" stroke-width="2"/><path d="M0-44v62" stroke="${window.CONFIG.billetCouleurs.fonce}" stroke-width="2" opacity=".6"/></g>
  <g class="pli pli3"><use href="#bateau" x="-70" y="-40" width="140" height="74"/></g></g>`, 'transform="translate(170,316)" data-etape="0"')}
${lueur(L.x, L.y, 110)}
${A.souris(sx, sy, sw, 'class="quenotte rive-g"')}
<g class="navire" transform="translate(230,440)"><use href="#bateau" x="-70" y="-40" width="140" height="74"/>${A.souris(-52, -106, 110)}</g>
${A.souris(800, 296, 150, 'class="quenotte rive-d"')}
</svg>`;
  }

  // ---------- 4. La place Ducale ----------
  function place(nuit) {
    const sx = 270, sy = 376, sw = 150;
    const L = A.pointSouris(sx, sy, sw, 'lanterne');
    let maisons = '';
    for (let i = 0; i < 5; i++) {
      const x = i * 152, mur = i % 2 ? '#C79B74' : '#D6B493';
      maisons += `<path d="M${x} 232L${x + 76} 168l76 64z" fill="#2A3470"/><rect x="${x + 64}" y="196" width="24" height="26" fill="#3A4690"/><rect x="${x + 70}" y="202" width="12" height="14" fill="#141A3A"/>
<rect x="${x}" y="232" width="152" height="130" fill="${mur}"/>
<g fill="#1b2250" stroke="#F3EFE6" stroke-width="2"><rect x="${x + 20}" y="246" width="24" height="40"/><rect x="${x + 64}" y="246" width="24" height="40"/><rect x="${x + 108}" y="246" width="24" height="40"/><rect x="${x + 20}" y="300" width="24" height="44"/><rect x="${x + 64}" y="300" width="24" height="44"/><rect x="${x + 108}" y="300" width="24" height="44"/></g>
<rect x="${x}" y="362" width="152" height="120" fill="#B98B68"/><path d="M${x + 12} 482v-66a64 64 0 0 1 128 0v66z" fill="#151a40"/><rect x="${x}" y="362" width="12" height="120" fill="#A07A58"/>`;
    }
    return `<svg class="decor decor-place" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="La place Ducale de Charleville et ses arcades, avec le Grand Marionnettiste">
${A.fond(nuit, 51, { x: 150, y: 100, r: 26 })}
${maisons}
<rect x="800" y="90" width="92" height="392" fill="#232c66"/><path d="M790 90l56-60 56 60z" fill="#3A4690"/><rect x="800" y="90" width="92" height="8" fill="#3A4690"/>
<rect y="482" width="1000" height="118" fill="#4d4a5a"/><g fill="none" stroke="#5c5a6a" stroke-width="2"><path d="M0 520q50-10 100 0t100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0"/><path d="M0 560q50-10 100 0t100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0"/></g>
${tap('marionnettiste', 'Le Grand Marionnettiste', `${halo(846, 230, 95)}
  <rect x="815" y="150" width="62" height="150" fill="#151a40"/><g class="drapes"><path d="M815 150h20q-7 32 0 66h-20z" fill="#D64045"/><path d="M877 150h-20q7 32 0 66h20z" fill="#D64045"/></g>
  <g class="geant"><circle cx="846" cy="182" r="16" fill="#F3EFE6"/><circle cx="841" cy="180" r="1.9" fill="#2B2B33"/><circle class="oeil-d" cx="851" cy="180" r="1.9" fill="#2B2B33"/><path class="clin" d="M848 180.5h6" stroke="#2B2B33" stroke-width="1.6" stroke-linecap="round"/><rect x="836" y="198" width="20" height="46" rx="7" fill="#F3EFE6"/><path class="bras-g" d="M836 208l-16 20" stroke="#F3EFE6" stroke-width="5" stroke-linecap="round"/><path class="bras-d" d="M856 208l16 20" stroke="#F3EFE6" stroke-width="5" stroke-linecap="round"/><path d="M840 244l-4 18M852 244l4 18" stroke="#F3EFE6" stroke-width="5" stroke-linecap="round"/><path d="M840 182q3 3 6 0M846 182q3 3 6 0" stroke="#2B2B33" stroke-width="1.5" fill="none"/></g>
  <g class="pantin"><path d="M846 262v40" stroke="#cfd3ee" stroke-width="1"/><g transform="translate(846,302)"><circle cx="0" cy="0" r="7" fill="#FFC857"/><rect x="-5" y="7" width="10" height="16" rx="3" fill="#D64045"/><path d="M-5 11l-8 8M5 11l8 8M-3 23l-3 10M3 23l3 10" stroke="#FFC857" stroke-width="3" stroke-linecap="round"/></g></g>`)}
${tap('fenetre', 'Une fenêtre qui clignote', `${halo(0, 0, 48)}<rect class="vitre" x="-12" y="-22" width="24" height="44" fill="#FFC857"/><g class="pigeon"><ellipse cx="0" cy="10" rx="15" ry="9" fill="#9aa0b5"/><circle cx="-12" cy="2" r="7" fill="#9aa0b5"/><path d="M-19 2l-6 2 6 2z" fill="#FFC857"/><circle cx="-13" cy="0" r="1.6" fill="#2B2B33"/><path d="M-4 8q10-6 16 0" fill="none" stroke="#6b7390" stroke-width="2"/></g>`, 'transform="translate(380,322)"')}
${tap('galette', 'Une galette au sucre', `${halo(0, 0, 50)}<g class="galette"><ellipse cx="0" cy="8" rx="34" ry="12" fill="#b9801a"/><ellipse cx="0" cy="2" rx="34" ry="13" fill="#E8B04A"/><ellipse cx="0" cy="0" rx="28" ry="9" fill="#F6CF7A"/><g fill="#FFF6E0">${[[-14, -2], [-4, 2], [6, -3], [15, 1], [-8, -5], [10, 4], [0, -6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8"/>`).join('')}</g><path d="M10 4l24 4-6 6z" fill="#3a2a10" opacity=".35"/></g>`, 'transform="translate(560,520)"')}
${tap('plaque', 'Une vieille pierre gravée', `${halo(0, 0, 50)}<g class="plaque"><rect x="-30" y="-14" width="60" height="28" rx="3" fill="#e8dcc4" stroke="#8a7a5c" stroke-width="2"/><text x="0" y="6" text-anchor="middle" font-family="Libre Baskerville, serif" font-size="15" fill="#5c4a2c">1606</text></g>`, 'transform="translate(684,390)"')}
${tap('plume', "Une grande plume à une fenêtre", `${halo(0, 0, 44)}<g class="plume"><path d="M-6 16C0-4 10-22 30-34C24-18 14-2 -2 18z" fill="#FFF6E0" stroke="#cfd3ee" stroke-width="1.4"/><path d="M-6 18L28-32" stroke="#8a90a8" stroke-width="1.4"/><path d="M-8 20l-4 8" stroke="#2B2B33" stroke-width="2" stroke-linecap="round"/></g>`, 'transform="translate(736,262)"')}
${lueur(L.x, L.y, 110)}
${A.souris(sx, sy, sw, 'class="quenotte trotte"')}
</svg>`;
  }

  // ---------- 5. Aiglemont ----------
  function aiglemont(nuit) {
    const sx = 40, sy = 376, sw = 150;
    const L = A.pointSouris(sx, sy, sw, 'lanterne');
    const volet = (x, y) => `<rect x="${x}" y="${y}" width="26" height="36" fill="#2b3470"/><g fill="#3E7C8F" stroke="#2b5a66" stroke-width="1.5"><rect x="${x}" y="${y}" width="13" height="36"/><rect x="${x + 13}" y="${y}" width="13" height="36"/></g>`;
    const maison = (x, y, w, h, toit) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#E9E2D6"/><path d="M${x - 10} ${y - h}l${w / 2 + 10}-${h * 0.55} ${w / 2 + 10} ${h * 0.55}z" fill="${toit}"/><rect x="${x + w / 2 - 12}" y="${y - 50}" width="24" height="50" fill="#6E4630"/>${volet(x + 14, y - h + 18)}${volet(x + w - 40, y - h + 18)}`;
    // Un immeuble : façade, fenêtres éteintes, toit plat, porte d'entrée
    const immeuble = (x, base, w, haut, teinte) => {
      let fen = '';
      for (let y = haut + 22; y < base - 70; y += 46) for (let fx = x + 18; fx < x + w - 30; fx += 40) fen += `<rect x="${fx}" y="${y}" width="22" height="28" rx="2" fill="#2b3470"/>`;
      return `<rect x="${x}" y="${haut}" width="${w}" height="${base - haut}" fill="${teinte}"/><rect x="${x - 6}" y="${haut - 8}" width="${w + 12}" height="10" fill="#8a8395"/>${fen}<rect x="${x + w / 2 - 16}" y="${base - 52}" width="32" height="52" fill="#4a3324"/><rect x="${x + w / 2 - 22}" y="${base - 58}" width="44" height="6" fill="#8a8395"/>`;
    };
    const appart = window.CONFIG.logement === 'appartement';
    // En ville : de hauts immeubles (ils montent plus haut que l'image, et se voient en entier quand l'écran est en hauteur)
    const tour = (x, w, haut, teinte, ombre, cols, k) => {
      let f = '';
      const pas = (w - 24) / cols;
      for (let y = haut + 26, r = 0; y < 404; y += 52, r++) for (let c = 0; c < cols; c++) {
        const fx = x + 12 + c * pas + (pas - 24) / 2, allume = (r * 5 + c * 3 + k) % 9 === 0;
        f += `<rect x="${fx.toFixed(0)}" y="${y}" width="24" height="32" rx="2" fill="${allume ? '#FFC857' : '#2b3470'}"/><rect x="${(fx - 2).toFixed(0)}" y="${y + 32}" width="28" height="4" fill="${ombre}"/>`;
        if (r % 2 === 1) f += `<path d="M${(fx - 4).toFixed(0)} ${y + 30}h32M${(fx - 4).toFixed(0)} ${y + 20}h32" stroke="#4a4e5e" stroke-width="2"/><path d="M${(fx + 2).toFixed(0)} ${y + 20}v10M${(fx + 12).toFixed(0)} ${y + 20}v10M${(fx + 22).toFixed(0)} ${y + 20}v10" stroke="#4a4e5e" stroke-width="1.5"/>`;
      }
      return `<rect x="${x}" y="${haut}" width="${w}" height="${472 - haut}" fill="${teinte}"/><rect x="${x}" y="${haut}" width="10" height="${472 - haut}" fill="${ombre}" opacity=".6"/><rect x="${x - 6}" y="${haut - 10}" width="${w + 12}" height="12" fill="#6b6f82"/>${f}`
        // le rez-de-chaussée : une porte vitrée et son auvent
        + `<rect x="${x}" y="410" width="${w}" height="62" fill="${ombre}"/><rect x="${x + w / 2 - 20}" y="420" width="40" height="52" fill="#3a3f5c"/><rect x="${x + w / 2 - 16}" y="424" width="32" height="30" fill="#FFC857" opacity=".35"/><path d="M${x + w / 2 - 30} 418h60l-6-12h-48z" fill="#D64045"/>`;
    };
    // Au loin, d'autres tours, quelques fenêtres encore allumées
    let loin = '';
    [[-30, 120, -240], [80, 90, -60], [160, 130, -320], [290, 100, -120], [380, 120, -260], [500, 90, -40], [580, 140, -380], [720, 110, -160], [820, 120, -300], [930, 100, -80]].forEach(([x, w, h], k) => {
      loin += `<rect x="${x}" y="${h}" width="${w}" height="${472 - h}" fill="${k % 2 ? '#1b2250' : '#212a5e'}"/>`;
      for (let y = h + 18; y < 440; y += 28) for (let fx = x + 12; fx < x + w - 14; fx += 22) if ((Math.sin(fx * 12.9898 + y * 78.233 + k * 3.7) * 43758.5453) % 1 > .86) loin += `<rect x="${fx}" y="${y}" width="9" height="12" fill="#FFC857" opacity=".55"/>`;
    });
    // Un lampadaire de rue (décor) : son halo éclaire le trottoir
    const reverbere = x => `<ellipse cx="${x}" cy="486" rx="70" ry="12" fill="#FFC857" opacity=".18"/><rect x="${x - 3}" y="330" width="6" height="146" fill="#4a4e5e"/><path d="M${x} 334q0-18 20-18h8" fill="none" stroke="#4a4e5e" stroke-width="5"/><path d="M${x + 18} 314h22l-4 10h-14z" fill="#3b4254"/><ellipse cx="${x + 29}" cy="326" rx="9" ry="4" fill="#FFC857"/><circle class="lueur" cx="${x + 29}" cy="330" r="46" fill="url(#halo-or)"/>`;
    const batiments = appart
      ? `${loin}
${tour(10, 250, -150, '#cdbfae', '#a8998a', 4, 1)}${tour(296, 250, 92, '#d9c9b5', '#b3a28e', 4, 4)}${tour(600, 270, 156, '#e3d6c3', '#bcae99', 5, 2)}
<!-- le trottoir, la bordure, la rue et son passage piéton -->
<rect y="472" width="1000" height="30" fill="#6b6f82"/><path d="M0 474h1000" stroke="#8a8ea0" stroke-width="3"/><g stroke="#5d6174" stroke-width="2">${[60, 160, 260, 360, 460, 560, 660, 760, 860, 960].map(x => `<path d="M${x} 474v28"/>`).join('')}</g>
<rect y="502" width="1000" height="8" fill="#4a4e5e"/><rect y="510" width="1000" height="200" fill="#262a38"/>
<g fill="#e8e8ee" opacity=".55">${[0, 1, 2, 3, 4].map(i => `<rect x="${548 + i * 18}" y="516" width="10" height="84"/>`).join('')}</g>
<path d="M0 566h1000" stroke="#e8e8ee" stroke-width="4" stroke-dasharray="40 30" opacity=".35"/>
<!-- un arbre dans sa grille, un banc, une poubelle -->
<g transform="translate(560,472)"><rect x="-4" y="-60" width="8" height="60" fill="#5c3a24"/><circle cx="0" cy="-74" r="26" fill="#24483E"/><circle cx="-16" cy="-62" r="18" fill="#2F5D50"/><circle cx="16" cy="-60" r="18" fill="#1E3F36"/><rect x="-16" y="-2" width="32" height="4" fill="#4a4e5e"/></g>
<g transform="translate(470,472)"><rect x="-28" y="-20" width="56" height="6" rx="2" fill="#8B5A3C"/><rect x="-28" y="-34" width="56" height="5" rx="2" fill="#8B5A3C"/><path d="M-22-14v14M22-14v14" stroke="#3b4254" stroke-width="4"/></g>
<g transform="translate(900,472)"><rect x="-12" y="-34" width="24" height="34" rx="3" fill="#3E7C50"/><rect x="-14" y="-38" width="28" height="6" rx="2" fill="#2F5D50"/></g>
${reverbere(392)}${reverbere(838)}`
      : `${maison(80, 480, 150, 100, '#D64045')}
${maison(330, 450, 170, 110, '#3E7C8F')}
${maison(640, 400, 190, 130, '#D64045')}
<rect x="920" y="300" width="100" height="70" fill="#E9E2D6"/><path d="M910 300l60-40 60 40z" fill="#3E7C8F"/>${volet(940, 318)}`;
    return `<svg class="decor decor-aiglemont" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="${appart ? 'Les immeubles endormis' : 'Les maisons endormies'} et la girouette">
${A.fond(nuit, 61, { x: 880, y: 80, r: 30 })}
${appart ? '' : `<path d="M0 600V440Q300 400 600 350T1000 290V600Z" fill="#1E3F36"/>
<path d="M0 600V480Q300 440 600 400T1000 340V600Z" fill="#24483E"/>
<path d="M-20 580Q300 520 600 470T1020 400" fill="none" stroke="#1A2A26" stroke-width="56" stroke-linecap="round"/>`}
<circle class="lueur-maison" cx="735" cy="${appart ? 312 : 380}" r="200" fill="url(#halo-or)"/>
${batiments}
${tap('fenetre', 'La fenêtre de la chambre', `${halo(0, 0, 44)}<rect class="vitre" x="-18" y="-24" width="36" height="48" rx="3" fill="#FFC857"/>${window.DESSINS.silhouetteFenetre({ type: window.CONFIG.profil.doudou.type, fratrie: !!(window.CONFIG.profil.fratrie && window.CONFIG.profil.fratrie.dortACote) })}<path d="M-18 0h36M0-24v48" stroke="#F3EFE6" stroke-width="2.5"/><rect x="-18" y="-24" width="36" height="48" rx="3" fill="none" stroke="#F3EFE6" stroke-width="3"/>`, 'transform="translate(735,312)"')}
${tap('girouette', 'La girouette', `${halo(0, -24, 52)}<rect x="-3" y="-14" width="6" height="40" fill="#6b6560"/><g class="coq"><path d="M-34-24h68" stroke="#F3EFE6" stroke-width="4" stroke-linecap="round"/><path d="M24-34l12 10-12 10z" fill="#F3EFE6"/><path d="M-6-28q-6-18 8-22 10-2 14 8 2 8-6 14z" fill="#D64045"/><path d="M-10-46l4-8 4 8 4-8 2 10z" fill="#FFC857"/><circle cx="8" cy="-40" r="1.8" fill="#2B2B33"/></g>`, appart ? 'transform="translate(420,66)"' : 'transform="translate(415,318)"')}
${tap('lampadaire', 'Un lampadaire qui grésille', `${halo(0, -162, 52)}<rect x="-4" y="-150" width="8" height="150" fill="#6b6560"/><path d="M-20-150h40l-6-28h-28z" fill="#3b4254"/><circle class="lampe-lueur" cx="0" cy="-164" r="80" fill="url(#halo-or)"/><circle class="ampoule" cx="0" cy="-164" r="11" fill="#FFC857"/>`, 'transform="translate(230,470)"')}
${lueur(L.x, L.y, 100)}
${A.souris(sx, sy, sw, 'class="quenotte trotte"')}
</svg>`;
  }

  // ---------- 6. Pantoufle ----------
  function pantoufle(nuit) {
    const sx = 120, sy = 376, sw = 150;
    const L = A.pointSouris(sx, sy, sw, 'lanterne');
    let cloture = '';
    for (let x = 20; x <= 330; x += 32) cloture += `<rect x="${x}" y="400" width="10" height="82" rx="3"/>`;
    const appart = window.CONFIG.logement === 'appartement';
    const pendule = `<g class="pendule"><circle cx="900" cy="218" r="26" fill="#FFF6E0" stroke="#8B5A3C" stroke-width="4"/><path d="M900 218l7-13M900 218l-3 19" stroke="#2B2B33" stroke-width="3" stroke-linecap="round"/><circle cx="900" cy="218" r="2.5" fill="#2B2B33"/></g>`;
    // Dehors (maison) : le ciel, le jardin, la façade et la fenêtre du salon
    const dehors = `${A.fond(nuit, 71, { x: 120, y: 90, r: 24 })}
<path d="M0 600V430Q200 410 400 420T1000 400V600Z" fill="#1E3F36"/>
<rect x="560" y="110" width="440" height="390" fill="#E9E2D6"/><rect x="540" y="84" width="460" height="30" fill="#D64045"/><rect x="560" y="114" width="440" height="6" fill="#c9bfae"/>
${tap('fenetre', 'La fenêtre du salon', `${halo(900, 218, 64)}<rect class="vitre" x="860" y="170" width="80" height="96" fill="#2b3470"/>${pendule}<path d="M900 170v96M860 218h80" stroke="#F3EFE6" stroke-width="3"/><rect x="860" y="170" width="80" height="96" fill="none" stroke="#F3EFE6" stroke-width="4"/>`)}
<g fill="#6b6560">${cloture}<rect x="20" y="420" width="320" height="8"/><rect x="20" y="460" width="320" height="8"/></g>
<rect y="490" width="1000" height="110" fill="#1A2A26"/>
<g fill="#2F5D50"><ellipse cx="420" cy="482" rx="60" ry="34"/><ellipse cx="90" cy="486" rx="70" ry="34"/><ellipse cx="960" cy="486" rx="50" ry="28"/></g>`;
    // Dedans (appartement) : le palier, l'escalier, l'applique, l'horloge au mur
    let marches = '';
    for (let i = 0; i < 6; i++) marches += `<rect x="${i * 46}" y="${250 + i * 40}" width="${330 - i * 46}" height="40" fill="${i % 2 ? '#4a4360' : '#524a6a'}"/>`;
    const palier = `<rect width="1000" height="600" fill="#3a3550"/><rect y="0" width="1000" height="80" fill="#332e47"/>
<circle class="applique" cx="700" cy="250" r="150" fill="url(#halo-or)" opacity=".35"/><path d="M688 262h24l-4-20h-16z" fill="#FFC857"/>
<g>${marches}</g><path d="M0 236L330 476" stroke="#8B5A3C" stroke-width="8" stroke-linecap="round"/><g stroke="#8B5A3C" stroke-width="4">${[40, 110, 180, 250].map(x => `<path d="M${x} ${265 + x * 0.73}v-40"/>`).join('')}</g>
${tap('fenetre', 'L’horloge du palier', `${halo(900, 218, 64)}<rect x="866" y="184" width="68" height="68" rx="12" fill="#6E4630"/>${pendule}`)}
<rect y="482" width="1000" height="118" fill="#2a2638"/><rect y="478" width="1000" height="8" fill="#524a6a"/>`;
    return `<svg class="decor decor-pantoufle${appart ? ' palier' : ''}" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="${appart ? 'Le palier, la porte de l’appartement et le chat endormi sur le paillasson' : 'Le jardin, la porte de la maison et le chat endormi sur le seuil'}">
${appart ? palier : dehors}
${appart ? tap('fleurs', 'Une plante verte', `${halo(0, -40, 56)}<path d="M-22 8l5-34h34l5 34z" fill="#B05E3B"/><g class="fleur"><path d="M0-26q-30-30-34-70q24 20 34 70z" fill="#2F5D50"/></g><g class="fleur"><path d="M0-26q30-34 30-80q-20 28-30 80z" fill="#3E7C50"/></g><g class="fleur"><path d="M0-26q-6-40 6-76q10 40-6 76z" fill="#4f8a5f"/></g>`, 'transform="translate(364,482)"') : tap('fleurs', 'Un pot de fleurs', `${halo(0, -22, 50)}<path d="M-24 8l6-34h36l6 34z" fill="#B05E3B"/><g class="fleur"><path d="M-6-26v-18" stroke="#2F5D50" stroke-width="3"/><circle cx="-6" cy="-46" r="11" fill="#D64045"/><circle cx="-6" cy="-46" r="4" fill="#FFC857"/></g><g class="fleur"><path d="M10-26v-14" stroke="#2F5D50" stroke-width="3"/><circle cx="10" cy="-42" r="10" fill="#F2A3B5"/><circle cx="10" cy="-42" r="3.5" fill="#FFC857"/></g><g class="fleur"><path d="M-18-26v-10" stroke="#2F5D50" stroke-width="3"/><circle cx="-18" cy="-38" r="8" fill="#FFC857"/><circle cx="-18" cy="-38" r="3" fill="#D64045"/></g>`, 'transform="translate(364,482)"')}
<g transform="translate(700,482)">${appart ? '<rect x="-14" y="-212" width="28" height="18" rx="3" fill="#C9A227"/><text x="0" y="-198" font-family="Baloo 2, sans-serif" font-size="14" font-weight="800" fill="#4a3324" text-anchor="middle">12</text>' : ''}<path d="M-74 0v-170a74 74 0 0 1 148 0V0z" fill="#4a3324"/><g class="battant"><path d="M-60 0v-168a60 60 0 0 1 120 0V0z" fill="#8B5A3C"/><rect x="-42" y="-150" width="34" height="62" rx="4" fill="#6E4630"/><rect x="8" y="-150" width="34" height="62" rx="4" fill="#6E4630"/><rect x="-42" y="-74" width="34" height="56" rx="4" fill="#6E4630"/><rect x="8" y="-74" width="34" height="56" rx="4" fill="#6E4630"/><circle cx="44" cy="-80" r="6" fill="#C9A227"/></g></g>
<rect x="600" y="482" width="200" height="14" fill="${appart ? '#8B5A3C' : '#A79E95'}" rx="${appart ? 4 : 0}"/>
<g class="chat-dort" transform="translate(616,420) scale(.9)">
  <path class="queue" d="M-70 50C-110 60-115 10-80 20" fill="none" stroke="#20222e" stroke-width="14" stroke-linecap="round"/>
  <ellipse class="fourrure" cx="0" cy="48" rx="82" ry="36" fill="#20222e"/>
  <g class="rayures" fill="none" stroke="#C9833A" stroke-width="6" stroke-linecap="round"><path d="M-40 22q6 12 2 24M-16 18q6 14 2 28M8 18q6 14 2 28"/></g>
  <circle class="fourrure" cx="70" cy="22" r="36" fill="#20222e"/>
  <path class="fourrure" d="M40 0l-4-30 26 14zM100 0l4-30-26 14z" fill="#20222e"/><path class="oreilles" d="M43-4l-2-14 12 7zM97-4l2-14-12 7z" fill="#F2A3B5"/>
  <g class="moustaches" stroke="#cfd3ee" stroke-width="2" stroke-linecap="round"><path d="M50 34l-26-4M50 38l-26 4M90 34l26-4M90 38l26 4"/></g>
  <path class="nez" d="M66 34h8l-4 5z" fill="#F2A3B5"/><path class="bouche" d="M70 39q-5 6-10 2M70 39q5 6 10 2" fill="none" stroke="#2B2B33" stroke-width="2"/>
  ${tap('yeux', 'Deux yeux qui brillent dans le noir', `${halo(70, 20, 52)}<g class="yeux-brillent"><ellipse cx="58" cy="20" rx="9" ry="6.5" fill="#FFC857"/><ellipse cx="84" cy="20" rx="9" ry="6.5" fill="#FFC857"/><ellipse cx="58" cy="20" rx="2.2" ry="5" fill="#2B2B33"/><ellipse cx="84" cy="20" rx="2.2" ry="5" fill="#2B2B33"/></g><g class="yeux-fermes" fill="none" stroke="#2B2B33" stroke-width="3" stroke-linecap="round"><path d="M50 22q8 6 16 0M76 22q8 6 16 0"/></g>`)}
  <path d="M40 50q30 12 60 0" fill="none" stroke="#D64045" stroke-width="5"/><circle cx="70" cy="58" r="6" fill="#FFC857"/>
  <g class="zzz"><text x="110" y="-20" class="z">z</text><text x="130" y="-40" class="z petit">z</text></g>
</g>
${lueur(L.x, L.y, 100)}
${tap('quenotte', 'Quenotte', `${halo(195, 430, 95)}${A.souris(sx, sy, sw, 'class="quenotte"')}`)}
</svg>`;
  }


  // ---------- Le lièvre, à travers les champs, jusqu'au panneau de la ville ----------
  function lievre(nuit) {
    const sx = 30, sy = 380, sw = 150;
    const L = A.pointSouris(sx, sy, sw, 'lanterne');
    const ville = window.CONFIG.ville;
    // Le panneau d'entrée de ville : le nom est resserré s'il est long
    const largeur = Math.min(176, ville.length * 15);
    // Les sillons suivent la courbe de la colline du milieu
    let sillons = '';
    for (let i = 0; i < 6; i++) sillons += `<path d="M-20 ${452 + i * 22}Q200 ${408 + i * 24} 420 ${426 + i * 22}Q640 ${446 + i * 20} 760 ${358 + i * 26}Q840 ${310 + i * 26} 1020 ${326 + i * 25}" fill="none" stroke="#1A2A26" stroke-width="4" opacity=".5"/>`;
    // Le village tout en haut de la colline, avec ses fenêtres allumées et son clocher
    const maisons = [[720, 208, 34, 22], [758, 200, 30, 30], [880, 202, 36, 24], [920, 208, 30, 18], [960, 204, 34, 22]].map(([x, y, w, h]) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#1b2250"/><path d="M${x - 3} ${y - h}l${w / 2 + 3}-${h * 0.6} ${w / 2 + 3} ${h * 0.6}z" fill="#141a3c"/><rect x="${x + w / 2 - 2}" y="${y - h + 6}" width="4" height="5" fill="#FFC857"/>`).join('');
    const corps = '#A47B54', ventre = '#D9BE97';
    const lievreDessin = `<ellipse cx="-34" cy="-14" rx="28" ry="15" fill="#8E6844"/><ellipse class="corps-lievre" cx="0" cy="-36" rx="60" ry="34" fill="${corps}"/><ellipse cx="10" cy="-22" rx="38" ry="16" fill="${ventre}"/><circle cx="-60" cy="-46" r="11" fill="#F3EFE6"/>
<g class="oreilles-couchees"><ellipse cx="22" cy="-80" rx="36" ry="8" fill="${corps}" transform="rotate(-12 22 -80)"/><ellipse cx="22" cy="-80" rx="26" ry="3.5" fill="#E9A9B5" transform="rotate(-12 22 -80)"/></g>
<g class="oreilles-hautes"><ellipse cx="46" cy="-112" rx="9" ry="34" fill="${corps}" transform="rotate(-12 46 -112)"/><ellipse cx="46" cy="-112" rx="4" ry="24" fill="#E9A9B5" transform="rotate(-12 46 -112)"/><ellipse cx="64" cy="-110" rx="9" ry="34" fill="${corps}" transform="rotate(14 64 -110)"/><ellipse cx="64" cy="-110" rx="4" ry="24" fill="#E9A9B5" transform="rotate(14 64 -110)"/></g>
<circle cx="58" cy="-62" r="26" fill="${corps}"/><circle cx="82" cy="-58" r="4.5" fill="#E98BA0"/><path d="M80-52l14 3M80-56l14-4" stroke="#6b5040" stroke-width="1.5"/>
<path class="oeil-ferme" d="M58-66q6 5 12 0" fill="none" stroke="#2B2B33" stroke-width="3" stroke-linecap="round"/><g class="oeil-ouvert"><circle cx="64" cy="-66" r="5" fill="#2B2B33"/><circle cx="66" cy="-68" r="1.6" fill="#fff"/></g>
<ellipse cx="34" cy="-4" rx="18" ry="6" fill="#8E6844"/>
<g class="zzz"><text x="70" y="-110" class="z">z</text><text x="88" y="-128" class="z petit">z</text></g>`;
    return `<svg class="decor decor-lievre" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Un lièvre endormi dans les champs, et le panneau de ${ville}">
${A.fond(nuit, 91, { x: 560, y: 90, r: 28 })}
<!-- Au loin, la grande colline et le village -->
<path d="M-20 600V440Q200 380 420 300Q600 232 760 210Q880 196 1020 204V600Z" fill="#2a3468"/>
<g class="village">${maisons}<rect x="800" y="150" width="26" height="56" fill="#1b2250"/><path d="M796 150l17-46 17 46z" fill="#141a3c"/><path d="M813 96v-10M808 90h10" stroke="#9aa0b5" stroke-width="2"/><rect x="809" y="166" width="8" height="12" rx="4" fill="#FFC857"/></g>
<!-- La colline du milieu, ses haies et ses sillons -->
<path d="M-20 600V430Q200 384 420 402Q640 422 760 332Q840 284 1020 302V600Z" fill="#1E3F36"/>${sillons}
<g fill="#173229"><circle cx="150" cy="418" r="22"/><circle cx="176" cy="414" r="18"/><circle cx="700" cy="372" r="20"/><circle cx="724" cy="364" r="16"/><circle cx="960" cy="306" r="20"/></g>
<!-- Le champ du premier plan -->
<path d="M-20 600V508Q300 478 600 528T1020 512V600Z" fill="#24483E"/>
<!-- Le chemin qui serpente jusqu'au panneau -->
<path d="M30 576Q260 548 380 510Q520 468 600 424Q700 370 760 336Q820 302 900 300" fill="none" stroke="#3a4e46" stroke-width="26" stroke-linecap="round"/>
<path d="M30 576Q260 548 380 510Q520 468 600 424Q700 370 760 336Q820 302 900 300" fill="none" stroke="#52665c" stroke-width="2" stroke-dasharray="3 12" stroke-linecap="round"/>
${tap('epouvantail', 'Un épouvantail', `${halo(640, 330, 70)}<path d="M640 300v150" stroke="#6E4630" stroke-width="7"/><path d="M590 332h100" stroke="#6E4630" stroke-width="6" stroke-linecap="round"/><path d="M612 326h56l8 56h-72z" fill="#3E7C8F"/><path d="M612 326l-20 26M668 326l20 26" stroke="#3E7C8F" stroke-width="10" stroke-linecap="round"/><path d="M590 352l-8 8M690 352l8 8" stroke="#E2C27A" stroke-width="4" stroke-linecap="round"/><circle cx="640" cy="304" r="20" fill="#E2C27A"/><path d="M632 300h4M646 300h4M632 312q8 5 16 0" stroke="#6E4630" stroke-width="2.5" stroke-linecap="round"/><g class="chapeau"><ellipse cx="640" cy="288" rx="32" ry="7" fill="#6E4630"/><path d="M624 288q2-26 16-26t16 26z" fill="#8B5A3C"/><path d="M624 282h32" stroke="#D64045" stroke-width="4"/></g>`, 'transform="translate(-50,-56)"')}
<g class="panneau" transform="translate(890,312) scale(.82)"><path d="M-70 0v-118M70 0v-118" stroke="#9aa0b5" stroke-width="7"/><rect x="-100" y="-196" width="200" height="80" rx="8" fill="#F3EFE6" stroke="#D64045" stroke-width="7"/><text x="0" y="-146" font-family="Baloo 2, Trebuchet MS, sans-serif" font-size="26" font-weight="800" fill="#1F2235" text-anchor="middle" textLength="${largeur}" lengthAdjust="spacingAndGlyphs">${ville}</text></g>
${tap('herisson', 'Un hérisson', `${halo(230, 520, 54)}<g class="herisson-in"><path d="M196 532q4-40 40-40q30 0 38 34z" fill="#6b5040"/><g stroke="#3b2a20" stroke-width="3" stroke-linecap="round"><path d="M206 512l-8-10M220 500l-4-12M236 496l2-13M252 500l8-11M264 510l10-6"/></g><path d="M268 526q14-2 18 6q-8 6-20 2z" fill="#D9BE97"/><circle cx="285" cy="530" r="3" fill="#2B2B33"/><circle cx="272" cy="524" r="2" fill="#2B2B33"/></g>`, 'transform="translate(420,34)"')}
<!-- Quenotte vient de descendre de la montgolfière : elle arrive à pied par la gauche -->
<g class="arrivee">${lueur(L.x, L.y, 100)}
${A.souris(sx, sy, sw, 'class="quenotte"')}</g>
<g class="monture"><g class="monture-in" transform="translate(400,478)">
${tap('lievre', 'Un lièvre endormi', `${halo(10, -50, 90)}${lievreDessin}`, 'data-etape="0"')}
<g class="cavaliere">${A.souris(-40, -146, 96)}</g>
</g></g>
</svg>`;
  }

  // ---------- Au milieu des étoiles : la constellation-dent ----------
  // Sept étoiles à relier dans l'ordre ; celle à toucher clignote. À la fin, la dent s'illumine.
  const POINTS_DENT = [[420, 110], [700, 110], [740, 250], [660, 450], [560, 330], [460, 450], [380, 250]];
  function etoilesDecor(nuit) {
    const P = POINTS_DENT;
    const traits = P.map((p, i) => { const q = P[(i + 1) % P.length]; return `<line class="trait trait-${i + 1}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`; }).join('');
    const points = P.map((p, i) => `<g class="pt pt-${i + 1}" data-sub="${i + 1}" transform="translate(${p[0]},${p[1]})"><circle r="34" fill="transparent"/><circle class="pt-lueur" r="22" fill="url(#halo-or)"/><use href="#etoile5" x="-14" y="-14" width="28" height="28"/><text y="-24" class="pt-num">${i + 1}</text></g>`).join('');
    const dent = 'M' + P.map(p => p.join(' ')).join('L') + 'Z';
    return `<svg class="decor decor-etoiles" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="La montgolfière au milieu des étoiles, sept étoiles à relier">
${A.fond(nuit, 97, null)}
<rect width="1000" height="600" fill="#0e1330" opacity=".35"/>${A.etoiles(120, 1000, 600, 98)}
${tap('lune', 'La lune', `${halo(860, 470, 62)}<g class="lune-visage"><circle cx="860" cy="470" r="42" fill="#FFF4D6"/><circle cx="846" cy="462" r="5" fill="#c9b98f"/><path class="oeil-lune" d="M868 458q6-5 12 0" fill="none" stroke="#8a7a52" stroke-width="3" stroke-linecap="round"/><circle class="oeil-lune-ouvert" cx="874" cy="460" r="4" fill="#8a7a52"/><path d="M846 484q12 8 24 0" fill="none" stroke="#8a7a52" stroke-width="3" stroke-linecap="round"/></g>`)}
${tap('mouton', 'Un nuage en forme de mouton', `${halo(230, 190, 70)}<g class="mouton"><g fill="#cfd3ee" opacity=".9"><circle cx="200" cy="190" r="26"/><circle cx="230" cy="176" r="30"/><circle cx="262" cy="190" r="26"/><circle cx="232" cy="206" r="26"/></g><ellipse cx="284" cy="186" rx="14" ry="11" fill="#2b3470"/><circle cx="288" cy="183" r="2" fill="#fff"/><path d="M212 228v14M248 228v14" stroke="#2b3470" stroke-width="5" stroke-linecap="round"/></g>`)}
<rect y="590" width="1000" height="1300" fill="#1b2250"/>${A.etoiles(60, 1000, 600, 99).replace(/cy="(\d+(?:\.\d+)?)"/g, (m, y) => 'cy="' + (+y + 640) + '"')}
<g class="mer-nuages" fill="#cfd3ee" opacity=".22"><ellipse cx="80" cy="690" rx="150" ry="48"/><ellipse cx="330" cy="720" rx="190" ry="60.800000000000004"/><ellipse cx="600" cy="690" rx="170" ry="54.4"/><ellipse cx="880" cy="720" rx="180" ry="57.6"/><ellipse cx="200" cy="790" rx="200" ry="64"/><ellipse cx="500" cy="800" rx="220" ry="70.4"/><ellipse cx="800" cy="800" rx="200" ry="64"/></g>
<g class="ballon-flotte" transform="translate(250,575) scale(.82)"><g class="flotte-in">${enveloppe}${nacelle}</g></g>
${tap('constellation', 'Les étoiles à relier', `<circle class="halo" cx="${P[0][0]}" cy="${P[0][1]}" r="46" fill="url(#halo-or)"/><path class="dent-ciel" d="${dent}"/><g class="traits">${traits}</g>${points}`, 'data-etape="0"')}
</svg>`;
  }

  // ---------- La grande fenêtre embuée : la chambre de l'enfant, en couleurs (repère 400 × 300, comme la caméra) ----------
  // Même disposition que le plan filmé : le lit, l'enfant endormi, son doudou, la table de nuit (ou le lit du frère ou de la sœur).
  const PELAGES = { ours: ['#c99a6b', '#a77a50'], lapin: ['#efe6dc', '#d8c9ba'], chat: ['#b8aca2', '#9a8e84'], chien: ['#d1a574', '#b08552'], bebe: ['#f2c9a5', '#f29ab0'], licorne: ['#f6eef8', '#e7b3d8'], dinosaure: ['#86c06c', '#5e9a4a'], linge: ['#e9e1f2', '#cbbfe0'], aucun: ['#000', '#000'] };
  function chambreVraie() {
    const P = window.CONFIG.profil, fr = P.fratrie && P.fratrie.dortACote ? P.fratrie : null;
    const peau = '#f2c9a5', cheveux = '#6b4423', trait = '#4a2f22';
    let s = `<defs><linearGradient id="ch-mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3466"/><stop offset="1" stop-color="#51477d"/></linearGradient>
<linearGradient id="ch-couette" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a98e0"/><stop offset="1" stop-color="#3f6db8"/></linearGradient>
<radialGradient id="ch-lampe" cx="87%" cy="54%" r="60%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".6"/><stop offset=".5" stop-color="#ffd27a" stop-opacity=".18"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
<rect width="400" height="238" fill="url(#ch-mur)"/>`;
    // le papier peint à petites étoiles
    for (let y = 18, r = 0; y < 226; y += 32, r++) for (let x = 12 + (r % 2) * 20; x < 400; x += 40) s += `<path transform="translate(${x},${y}) scale(.55)" d="M0-6l1.8 3.8 4.2.5-3.1 2.9.8 4.2L0 3.3l-3.7 2.1.8-4.2-3.1-2.9 4.2-.5z" fill="#6d62a3" opacity=".75"/>`;
    // la plinthe, le parquet, le tapis
    s += `<rect y="230" width="400" height="8" fill="#e8e0d0"/><rect y="238" width="400" height="62" fill="#80583e"/>${[252, 268, 286].map(y => `<path d="M0 ${y}h400" stroke="#6a4630" stroke-width="1.5"/>`).join('')}${[40, 130, 220, 310].map((x, i) => `<path d="M${x + (i % 2) * 30} 238v14M${x + 50} 252v16M${x + 10} 268v18" stroke="#6a4630" stroke-width="1.2"/>`).join('')}
<ellipse cx="196" cy="272" rx="122" ry="18" fill="#c96b7f"/><ellipse cx="196" cy="272" rx="102" ry="13" fill="none" stroke="#f0b3c0" stroke-width="2" stroke-dasharray="6 5"/>`;
    // au mur : un cadre avec la lune, une étagère et ses jouets
    s += `<rect x="150" y="38" width="72" height="54" rx="3" fill="#f3e3bf" stroke="#C9A227" stroke-width="3"/><rect x="156" y="44" width="60" height="42" fill="#1E2658"/><path d="M192 54a11 11 0 1 0 9 17a9 9 0 0 1-9-17z" fill="#ffe9a8"/><g fill="#fff"><circle cx="166" cy="52" r="1.2"/><circle cx="208" cy="78" r="1.2"/><circle cx="172" cy="76" r="1"/></g>
<rect x="244" y="74" width="84" height="6" rx="2" fill="#8B5A3C"/><rect x="250" y="54" width="10" height="20" fill="#D64045"/><rect x="262" y="58" width="8" height="16" fill="#FFC857"/><rect x="272" y="52" width="9" height="22" fill="#3E9A6B"/><circle cx="304" cy="64" r="9" fill="#5fa3d6"/><path d="M295 64h18M304 55v18" stroke="#fff" stroke-width="1.5" opacity=".7"/>`;
    // à droite : la table de nuit et sa lampe, ou le petit lit du frère ou de la sœur
    if (fr) {
      const ch = fr.genre === 'f'
        ? `<path d="M362 172q-10-12-22-2M366 168q6-12 20-6" fill="none" stroke="${cheveux}" stroke-width="4" stroke-linecap="round"/><path d="M362 175q4-12 20-7q0 7-9 7q-6 0-11 4z" fill="${cheveux}"/>`
        : `<path d="M361 176q2-12 13-12q10 0 12 8l-3-1 1 3-4-2-1 3-3-3-2 3-2-3-3 4z" fill="${cheveux}"/>`;
      s += `<path d="M318 236v-58q0-8 8-8h2q8 0 8 8v58" fill="#8B5A3C"/><rect x="334" y="200" width="62" height="18" rx="3" fill="#a8744a"/><path d="M340 218v18M390 218v18" stroke="#6E4630" stroke-width="3"/>
<path d="M358 196q-2-18 14-18h14q8 0 8 10v8z" fill="#fbf7ee"/><circle cx="373" cy="184" r="11" fill="${peau}"/>${ch}<path d="M368 185q3 2 6 0" fill="none" stroke="${trait}" stroke-width="1.6" stroke-linecap="round"/><circle cx="378" cy="189" r="2.4" fill="#f29a9a" opacity=".6"/>
<path d="M336 200v-14q14-8 30 0v14z" fill="#e2a33e"/><path d="M340 192q12-4 22 0" fill="none" stroke="#c4852a" stroke-width="1.5"/>`;
    } else {
      s += `<rect x="322" y="176" width="54" height="60" rx="4" fill="#a8744a"/><rect x="320" y="172" width="58" height="8" rx="3" fill="#8B5A3C"/><path d="M326 206h46" stroke="#8B5A3C" stroke-width="2"/><circle cx="349" cy="192" r="2.5" fill="#FFC857"/><circle cx="349" cy="220" r="2.5" fill="#FFC857"/>
<path d="M349 172v-12" stroke="#7a6a5a" stroke-width="3"/><path d="M333 160l6-22h20l6 22z" fill="#ffd27a"/><ellipse cx="349" cy="160" rx="16" ry="3" fill="#e8b850"/>`;
    }
    // le lit : tête de lit à barreaux, pied de lit, sommier, drap
    s += `<path d="M30 236V112q0-16 16-16h8q16 0 16 16v124" fill="#8B5A3C"/><path d="M42 112v84M50 108v88M58 112v84" stroke="#6E4630" stroke-width="2.5"/>
<path d="M292 236v-66q0-10 10-10h4q10 0 10 10v66" fill="#8B5A3C"/>
<rect x="70" y="196" width="222" height="22" rx="4" fill="#a8744a"/><path d="M78 218v18M284 218v18" stroke="#6E4630" stroke-width="4" stroke-linecap="round"/>
<rect x="70" y="188" width="222" height="12" rx="3" fill="#f3efe6"/>
<path d="M72 170q-6-28 22-28h30q14 0 14 16v10q-10 8-34 8t-32-6z" fill="#fbf7ee"/><path d="M76 168q30 10 62 0" fill="none" stroke="#e2dacb" stroke-width="3"/><path d="M84 148q16-3 40 0" fill="none" stroke="#e2dacb" stroke-width="1.5"/>`;
    // l'enfant endormi (fille : cheveux longs étalés ; garçon : cheveux courts)
    const visage = `<path d="M105 157q4 3 8 0" fill="none" stroke="${trait}" stroke-width="1.8" stroke-linecap="round"/><path d="M109 166q3 2 6 0" fill="none" stroke="${trait}" stroke-width="1.5" stroke-linecap="round"/><circle cx="116" cy="162" r="3" fill="#f29a9a" opacity=".6"/>`;
    s += P.genre === 'f'
      ? `<path d="M94 146q-22-6-28 10q-4 12 4 20M90 160q-14 4-16 16M96 144q-6-8-20-8" fill="none" stroke="${cheveux}" stroke-width="5" stroke-linecap="round"/><circle cx="104" cy="157" r="15" fill="${peau}"/><path d="M90 151q6-12 26-8q2 6-6 8q-8 0-14 6z" fill="${cheveux}"/>${visage}`
      : `<circle cx="104" cy="157" r="15" fill="${peau}"/><path d="M89 152q2-14 16-14q12 0 14 8l-4-1 1 4-5-3-1 4-4-4-2 4-3-4-3 5z" fill="${cheveux}"/>${visage}`;
    // la couette à pois, avec ses plis
    s += `<path d="M112 197v-25q10-12 30-12q30-4 58 4q34 8 60 4q20-2 34 6v23z" fill="url(#ch-couette)"/><g fill="#fff" opacity=".5">${[[140, 178], [170, 186], [200, 176], [232, 188], [262, 180], [284, 190], [150, 192], [214, 192]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2"/>`).join('')}</g>
<path d="M150 178q20 9 40 3M222 182q24 7 48 0" fill="none" stroke="#335c9e" stroke-width="2"/><path d="M112 192h182" stroke="#2f5592" stroke-width="3" opacity=".5"/>`;
    // le doudou, serré contre l'enfant (le dessin de la caméra, en couleurs de pelage)
    const [p1, p2] = PELAGES[P.doudou.type] || PELAGES.ours;
    s += window.DESSINS.doudouCam(P.doudou.type).replace(/ id="[^"]*"/g, '').split('#0f4a1b').join(p1).split('#0b3a14').join(p2).split('#39FF14').join('#5a4636').split('#2fbf2f').join('#5a4636').split('#1d7a2c').join('#7a6656');
    // le bras par-dessus la couette (manche de pyjama), et une chaussette oubliée
    s += `<path d="M124 174q22-7 46-3q10 2 16-3" fill="none" stroke="#f3d27a" stroke-width="7" stroke-linecap="round"/><path d="M176 170q6 1 10-2" fill="none" stroke="${peau}" stroke-width="6" stroke-linecap="round"/><circle cx="188" cy="166" r="4.5" fill="${peau}"/>
<path d="M30 262q-10 10 0 16 8 4 14-4l4-22h-10z" fill="#e05a6a"/><path d="M36 256h10" stroke="#fff" stroke-width="2"/>
<rect width="400" height="300" fill="#140f35" opacity=".28"/><rect width="400" height="300" fill="url(#ch-lampe)"/>`;
    return s;
  }
  function fenetreDecor(nuit) {
    const appart = window.CONFIG.logement === 'appartement';
    const sx = 40, sy = 446, sw = 120;
    // La vitre : x 290 → 710, y 90 → 405 (la chambre 400 × 300 y tient, à l'échelle 1,05)
    return `<svg class="decor decor-fenetre" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="La grande fenêtre embuée de ta chambre">
${A.fond(nuit, 101, { x: 900, y: 70, r: 26 })}
<defs><mask id="m-buee" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="600"><rect width="1000" height="600" fill="#fff"/><g class="essuyage"></g></mask>
<clipPath id="c-vitre"><rect x="290" y="90" width="420" height="315" rx="6"/></clipPath>
<radialGradient id="g-veilleuse" cx="78%" cy="55%" r="60%"><stop offset="0" stop-color="#FFC857" stop-opacity=".45"/><stop offset="1" stop-color="#FFC857" stop-opacity="0"/></radialGradient></defs>
<rect x="120" y="20" width="760" height="600" fill="${appart ? '#D8D0C4' : '#E9E2D6'}"/>
${appart ? '<g fill="#cfc6b8"><rect x="120" y="20" width="760" height="10"/></g>' : '<g fill="#3E7C8F" stroke="#2b5a66" stroke-width="3"><rect x="170" y="80" width="100" height="335" rx="4"/><rect x="730" y="80" width="100" height="335" rx="4"/></g><g stroke="#2b5a66" stroke-width="2" opacity=".6">' + [110, 160, 210, 260, 310, 360].map(y => `<path d="M180 ${y}h80M740 ${y}h80"/>`).join('') + '</g>'}
${tap('vitre', 'La vitre embuée', `<circle class="halo" cx="500" cy="248" r="150" fill="url(#halo-or)" opacity=".5"/>
  <g clip-path="url(#c-vitre)"><g transform="translate(290,90) scale(1.05)">${chambreVraie()}</g></g>
  <g class="buee" mask="url(#m-buee)"><rect class="voile" x="290" y="90" width="420" height="315" rx="6" fill="#dfe6f2"/><g fill="#fff" opacity=".8">${[[340, 140], [620, 130], [420, 300], [560, 350], [680, 250], [330, 380]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5"/><path d="M${x} ${y + 4}v${10 + (x % 17)}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`).join('')}</g></g>`)}
<g fill="none" stroke="#F3EFE6" stroke-width="12"><rect x="284" y="84" width="432" height="327" rx="8"/></g><path d="M500 84v327M284 248h432" stroke="#F3EFE6" stroke-width="8"/>
<rect x="250" y="410" width="500" height="22" rx="4" fill="#c9bfae"/>
${appart ? '<g stroke="#4a4360" stroke-width="5">' + [270, 320, 370, 420, 470, 520, 570, 620, 670, 720].map(x => `<path d="M${x} 432v100"/>`).join('') + '<path d="M250 432h500M250 532h500"/></g>' : ''}
${tap('araignee', 'Une petite araignée', `${halo(250, 52, 40)}<g class="toile" fill="none" stroke="#9aa0b5" stroke-width="1.2" opacity=".9"><path d="M222 26l40 40M222 26l52 14M222 26l14 50"/><path d="M238 32q6 8 4 18M252 38q6 12 2 24M230 42q10 6 18 4"/></g><g class="araignee-in"><path d="M262 64v-26" stroke="#9aa0b5" stroke-width="1"/><circle cx="262" cy="68" r="6" fill="#2B2B33"/><path d="M256 66l-7-5M256 70l-7 4M268 66l7-5M268 70l7 4" stroke="#2B2B33" stroke-width="2"/></g>`)}
${tap('escargot', 'Un escargot', `${halo(660, 400, 46)}<g class="escargot-in"><path d="M626 410q30 4 56 0q4-8-8-8h-40z" fill="#B9A27A"/><circle cx="652" cy="392" r="16" fill="#B05E3B"/><path d="M652 392m-9 0a9 9 0 1 0 9-9a5 5 0 1 1-5 5" fill="none" stroke="#8B5A3C" stroke-width="2.5"/><path d="M630 402l-8-14M636 400l-2-14" stroke="#B9A27A" stroke-width="2.5" stroke-linecap="round"/></g>`)}
${lueur(A.pointSouris(sx, sy, sw, 'lanterne').x, A.pointSouris(sx, sy, sw, 'lanterne').y, 90)}
${A.souris(sx, sy, sw, 'class="quenotte"')}
</svg>`;
  }

  // ---------- 5. La montgolfière, au-dessus des Ardennes ----------
  // ---------- La montgolfière (dessin partagé : la scène du décollage et celle des étoiles) ----------
  // Enveloppe rayée rouge et jaune, aux couleurs de l'écharpe de Quenotte
  const enveloppe = '<g class="enveloppe">'
    + '<path d="M-40 -95C-112 -150-112 -300 0 -312C112 -300 112 -150 40 -95Z" fill="#D64045" stroke="#9a2a32" stroke-width="3"/>'
    + '<path d="M-14 -95C-40 -160-36 -292 0 -312C36 -292 40 -160 14 -95Z" fill="#FFC857"/>'
    + '<path d="M-31 -96C-80 -160-80 -290-18 -309M31 -96C80 -160 80 -290 18 -309" fill="none" stroke="#FFC857" stroke-width="7"/>'
    + '<ellipse cx="0" cy="-305" rx="22" ry="7" fill="#9a2a32" opacity=".6"/>'
    + '<path d="M-60 -250C-72 -210-66 -160-50 -130" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".25"/>'
    + '</g>';
  const nacelle = '<path d="M-26 -42L-38 -94M26 -42L38 -94M-10 -42L-14 -94M10 -42L14 -94" stroke="#6b4a32" stroke-width="2"/>'
    + '<rect x="-12" y="-104" width="24" height="10" rx="2" fill="#7d8597"/>'
    + '<g class="flamme"><path d="M0 -150C-14 -128-10 -110 0 -104C10 -110 14 -128 0 -150Z" fill="#FFC857"/><path d="M0 -136C-6 -124-4 -112 0 -108C4 -112 6 -124 0 -136Z" fill="#fff4d6"/></g>'
    + A.souris(-46, -88, 92)
    + '<rect x="-30" y="-44" width="60" height="44" rx="5" fill="#B07A4F" stroke="#6b4a32" stroke-width="3"/>'
    + '<path d="M-30 -30h60M-30 -16h60M-15 -44v44M0 -44v44M15 -44v44" stroke="#8B5A3C" stroke-width="2" opacity=".7"/>';

  function montgolfiere(nuit) {
    let lumieresCharleville = '', lumieresVille = '';
    for (let i = 0; i < 12; i++) lumieresCharleville += '<rect x="' + (40 + i * 13) + '" y="' + (486 - (i % 3) * 6) + '" width="4" height="5" fill="#FFC857"/>';
    for (let i = 0; i < 7; i++) lumieresVille += '<rect x="' + (850 + i * 14) + '" y="' + (452 - (i % 2) * 5) + '" width="4" height="5" fill="#FFC857"/>';
    return '<svg class="decor decor-montgolfiere" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Une montgolfière rouge et jaune au-dessus des Ardennes, la nuit">'
      + A.fond(nuit, 81, { x: 860, y: 96, r: 30 })
      // le paysage vu d'en haut : collines, forêt, la Meuse qui brille, Charleville et la ville d'arrivée au loin
      + '<path d="M0 470Q180 420 360 450T720 430T1000 420V600H0Z" fill="#1E2658"/>'
      + '<path d="M0 500Q220 470 460 500T1000 470V600H0Z" fill="#1E3F36"/>'
      + '<g fill="#173229">' + [30, 90, 150, 520, 580, 640, 700].map(x => '<path d="M' + x + ' 520l18-44 18 44z"/>').join('') + '</g>'
      + '<path class="meuse-vue" d="M-10 560C120 540 160 590 300 570S520 530 600 560S820 600 1010 560" fill="none" stroke="#7FB8C7" stroke-width="10" stroke-linecap="round" opacity=".75"/>'
      + '<path d="M-20 600V446Q150 406 250 406Q370 408 450 462Q500 494 560 504V600Z" fill="#1E3F36"/><path d="M60 432Q250 396 420 452" fill="none" stroke="#2F5D50" stroke-width="4" opacity=".6"/>'
      + '<g class="lumieres-loin">' + lumieresCharleville + lumieresVille + '</g>'
      + '<path d="M840 456l8-8 8 8M868 452l8-9 8 9M900 456l7-7 7 7" fill="none" stroke="#3E7C8F" stroke-width="2"/>'
      // secrets des Ardennes : le château fort de Sedan, les toits d'ardoise, le Cabaret Vert
      + tap('sedan', 'Le château fort de Sedan, au loin', halo(705, 470, 72) + '<g class="sedan" transform="translate(705,486)">'
        + '<path d="M-80 18l10-26h150l10 26z" fill="#2F5D50"/>'
        + '<path d="M-66-8v-26h60v-12h56v38z" fill="#c9a466"/><path d="M-70-34l34-14 34 14zM-8-46l30-12 30 12z" fill="#5b6182"/>'
        + '<rect x="-74" y="-30" width="18" height="30" rx="8" fill="#b8925a"/><path d="M-77-30l12-16 12 16z" fill="#5b6182"/>'
        + '<rect x="28" y="-40" width="20" height="40" rx="9" fill="#b8925a"/><path d="M25-40l13-18 13 18z" fill="#5b6182"/>'
        + '<path d="M-2-24l8-12 8 12z" fill="#5fa3a3"/>'
        + '<g class="fenetres" fill="#FFC857">' + [[-58, -18], [-40, -20], [-24, -18], [6, -30], [18, -28], [34, -26]].map(([x, y]) => '<rect x="' + x + '" y="' + y + '" width="3" height="5"/>').join('') + '</g>'
        + '<path d="M-66 0h116" stroke="#9c7a48" stroke-width="2"/></g>')
      + tap('ardoises', "Des toits d'ardoise qui brillent", halo(232, 512, 60) + '<g class="ardoises">'
        + [[198, 518, 30], [232, 510, 36], [270, 520, 28]].map(([x, y, l]) => '<rect x="' + (x - l / 2) + '" y="' + y + '" width="' + l + '" height="16" fill="#cfc3a8"/><path d="M' + (x - l / 2 - 4) + ' ' + y + 'l' + (l / 2 + 4) + '-16 ' + (l / 2 + 4) + ' 16z" fill="#4a5478"/><path class="reflet" d="M' + (x - 6) + ' ' + (y - 10) + 'l8-5" stroke="#e8e2ee" stroke-width="2" stroke-linecap="round"/>').join('')
        + '</g>')
      + tap('cabaret', 'Une scène de concert qui brille, au loin', halo(470, 540, 58) + '<g class="cabaret" transform="translate(470,548)">'
        + '<path d="M-26 10l-30-60M26 10l30-60M0 10v-66" stroke="#7CD65A" stroke-width="10" opacity=".25" stroke-linecap="round"/>'
        + '<rect x="-24" y="-4" width="48" height="14" fill="#1a2a20"/><path d="M-26-4h52l-6-12h-40z" fill="#2F5D50"/><g fill="#7CD65A"><circle cx="-14" cy="-10" r="2.4"/><circle cx="0" cy="-10" r="2.4"/><circle cx="14" cy="-10" r="2.4"/></g>'
        + '<g class="notes" fill="#7CD65A"><path d="M-10-24v-14l10-3v14"/><circle cx="-12" cy="-24" r="3.4"/><circle cx="-2" cy="-27" r="3.4"/><path d="M16-30v-12" stroke="#7CD65A" stroke-width="2"/><circle cx="14" cy="-30" r="3.2"/></g></g>')
      // Pendant la musique du Cabaret Vert : des rayons qui balaient le ciel, et de doux flashs
      + '<g class="lasers" aria-hidden="true" pointer-events="none">'
        + '<rect class="flash" x="0" y="-1100" width="1000" height="1700" fill="#c8ffd0"/>'
        + [['#7CD65A', -38, 0], ['#5fe0ff', -18, 1], ['#ffffff', 0, 2], ['#7CD65A', 18, 3], ['#5fe0ff', 38, 4]].map(([c, a, k]) => '<g transform="translate(470,540)"><g class="rayon r' + k + '" style="--a:' + a + 'deg"><path d="M-3 0L-26-900L26-900L3 0Z" fill="' + c + '" opacity=".38"/><path d="M-1 0L-6-900L6-900L1 0Z" fill="' + c + '" opacity=".85"/></g></g>').join('')
        + '</g>'
      // secret : une étoile qui scintille… et file quand on la touche
      + tap('etoile', 'Une étoile qui scintille', halo(210, 84, 46) + '<g class="filante"><path d="M0 0L-120 60" stroke="#FFF4D6" stroke-width="3" stroke-linecap="round" opacity=".8"/><circle r="5" fill="#FFF4D6"/></g><path class="etoile-vive" d="M210 70l3.5 8 8.5 1-6.2 6 1.6 8.6-7.4-4.2-7.4 4.2 1.6-8.6-6.2-6 8.5-1z" fill="#FFF4D6"/>')
      // secret : un vol d'oies sauvages
      + tap('oies', "Un vol d'oies sauvages", halo(498, 300, 66) + '<g class="vol-oies">' + [[0, 0], [-26, -14], [-52, -28], [-26, 14], [-52, 28]].map(([dx, dy]) => '<path transform="translate(' + (525 + dx) + ' ' + (300 + dy) + ')" d="M0 0q-9-9-18-4q9-1 14 6q-12 2-20 10q12-4 24-10z" fill="#cfd3ee"/>').join('') + '</g>')
      // la montgolfière et son brûleur (élément à toucher trois fois)
      + '<g class="quenotte ballon" transform="translate(250,412)"><g class="ballon-in">'
      + tap('bruleur', 'Le brûleur de la montgolfière', halo(0, -122, 50) + enveloppe + nacelle, 'data-etape="0"')
      + '</g></g>'
      + '</svg>';
  }

  return { ballonSVG: () => enveloppe + nacelle, chateau, foret, meuse, place, montgolfiere, etoiles: etoilesDecor, POINTS_DENT, lievre, aiglemont, fenetre: fenetreDecor, pantoufle };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
