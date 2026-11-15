// L'ouverture de l'histoire : la couverture d'un livre ancien (titre, prénom, miniature de Quenotte sur les
// remparts de Sedan), puis, une fois le livre ouvert, la page de garde : la carte de France où l'enfant touche
// son étoile, un zoom sur les Ardennes, et le chemin de Quenotte jusqu'à la maison de l'enfant.
window.OUVERTURE = (function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // La page fait 320 de large ; sa hauteur H suit la forme de l'écran (le livre occupe toute la largeur)
  const hauteur = h => Math.round(Math.max(480, Math.min(720, h || 640)));
  // La France (repère de la carte : 900 × 870) posée au milieu de la page
  const laFrance = H => ({ s: 0.34, x: 7, y: Math.max(92, Math.round((H - 296) / 2 - 6)) });
  const surPage = (F, x, y) => ({ x: F.x + x * F.s, y: F.y + y * F.s });
  // À la fin du zoom, la carte des Ardennes (environ 320 × 480 à partir de y = 88) est réduite si la page est courte
  const finZoom = H => { const k = Math.min(1, (H - 108) / 477); return { k, x: 160 + k * (244 - 160), y: 88 + k * (180 - 88) }; };
  // La carte illustrée des Ardennes : Sedan y est en (244, 180), et le zoom s'arrête sur elle
  const SEDAN = { x: 244, y: 180 }, ZOOM = 0.08;
  // Le chemin de Quenotte, dans l'ordre de l'histoire : Sedan, la forêt, Charleville, la montgolfière, la Meuse, la maison
  const ROUTE = 'M244 178C200 196 118 196 100 254S140 302 165 318S246 318 252 348S238 430 196 462S96 500 66 538';

  // ---------- La couverture ----------
  function couverture(o) {
    const H = hauteur(o.h), k = Math.min(1.12, (H - 130) / 450);
    return `<svg class="lv-svg" viewBox="0 0 320 ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
<defs>
  <radialGradient id="lv-bois" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#4a2e1a"/><stop offset="1" stop-color="#1a0f08"/></radialGradient>
  <linearGradient id="lv-cuir" x1="0" x2="1"><stop offset="0" stop-color="#4a1414"/><stop offset=".07" stop-color="#7a1f1f"/><stop offset=".5" stop-color="#862424"/><stop offset=".93" stop-color="#7a1f1f"/><stop offset="1" stop-color="#5a1818"/></linearGradient>
  <filter id="lv-grain-cuir" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  <linearGradient id="lv-or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e08a"/><stop offset=".5" stop-color="#C9A227"/><stop offset="1" stop-color="#8a6a12"/></linearGradient>
  <linearGradient id="lv-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141A3A"/><stop offset="1" stop-color="#3a3f7a"/></linearGradient>
  <clipPath id="lv-clip-mini"><rect x="64" y="222" width="192" height="210"/></clipPath>
  <clipPath id="lv-clip-titre"><rect x="40" y="96" width="240" height="70"/></clipPath>
  <g id="lv-fleuron"><circle r="6.5" fill="url(#lv-or)"/><circle cy="-12" r="5" fill="url(#lv-or)"/><circle cy="12" r="5" fill="url(#lv-or)"/><circle cx="-12" r="5" fill="url(#lv-or)"/><circle cx="12" r="5" fill="url(#lv-or)"/><circle r="2.8" fill="#2b3a8f"/></g>
</defs>
<rect width="320" height="${H}" fill="url(#lv-bois)"/>
<rect x="8" y="8" width="304" height="${H - 16}" rx="9" fill="url(#lv-cuir)"/><rect x="8" y="8" width="304" height="${H - 16}" rx="9" filter="url(#lv-grain-cuir)"/>
<path d="M16 8v${H - 16}" stroke="#3a0f0f" stroke-width="3" opacity=".6"/>
<rect x="24" y="22" width="276" height="${H - 44}" rx="4" fill="none" stroke="url(#lv-or)" stroke-width="3"/>
<rect x="32" y="30" width="260" height="${H - 60}" rx="3" fill="none" stroke="#C9A227" stroke-width="1"/>
<use href="#lv-fleuron" x="44" y="42"/><use href="#lv-fleuron" x="280" y="42"/><use href="#lv-fleuron" x="44" y="${H - 42}"/><use href="#lv-fleuron" x="280" y="${H - 42}"/>
<g transform="translate(160 ${(H / 2).toFixed(1)}) scale(${k.toFixed(3)}) translate(-160 -318)">
<g class="lv-titre-or"><text x="160" y="122" text-anchor="middle" font-family="Libre Baskerville,serif" font-size="25" fill="url(#lv-or)">La nuit de la</text>
<text x="160" y="156" text-anchor="middle" font-family="Libre Baskerville,serif" font-weight="700" font-size="28" fill="url(#lv-or)">Petite Souris</text></g>
<g clip-path="url(#lv-clip-titre)"><rect class="lv-balayage" x="40" y="96" width="40" height="70" fill="#fff" opacity=".18" transform="skewX(-20)"/></g>
<path d="M96 172h128" stroke="#C9A227" stroke-width="1.5"/><circle cx="160" cy="172" r="3.4" fill="#C9A227"/><circle cx="96" cy="172" r="2" fill="#C9A227"/><circle cx="224" cy="172" r="2" fill="#C9A227"/>
<text x="160" y="200" text-anchor="middle" font-family="Libre Baskerville,serif" font-style="italic" font-size="15" fill="#F3E3BF">L'histoire de ${esc(o.enfant)}</text>
<rect x="58" y="216" width="204" height="222" fill="url(#lv-or)"/><rect x="62" y="220" width="196" height="214" fill="#7a1f1f"/>
<g clip-path="url(#lv-clip-mini)">
  <rect x="64" y="222" width="192" height="210" fill="url(#lv-ciel)"/>
  <g fill="#FFF6E0">${[[82, 240, 1.3], [122, 234, 1.1], [214, 246, 1.4], [184, 232, 1], [98, 268, 1.1], [232, 274, 1], [150, 252, 1.2], [246, 236, 1]].map(([x, y, r]) => `<circle class="lv-scintille" cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
  <circle cx="210" cy="258" r="13" fill="#F3EFE6"/><circle cx="216" cy="254" r="12" fill="#2a2f62"/>
  <path d="M64 338q50-14 90-6t102-10v22H64z" fill="#1E2658"/>
  <g fill="#FFC857">${[198, 205, 212, 219, 226].map((x, i) => `<rect class="lv-scintille" x="${x}" y="${326 + (i % 2) * 2}" width="3" height="3"/>`).join('')}</g>
  <path d="M64 432V368h192v64z" fill="#c9a466"/>
  <g fill="#a8844e">${[64, 86, 108, 130, 152, 174, 196, 218, 240].map(x => `<rect x="${x}" y="360" width="12" height="10"/>`).join('')}</g>
  <rect x="64" y="350" width="28" height="82" rx="14" fill="#b8925a"/><path d="M60 352l18-32 18 32z" fill="#5b6182"/>
  <path d="M64 390h192M64 410h192" stroke="#a8844e" stroke-width="1" opacity=".6"/>
  <g transform="translate(122,322)">
    <circle class="lv-lanterne" cx="46" cy="30" r="24" fill="#FFC857"/>
    <path d="M2 30q-14 0-12 14" fill="none" stroke="#A79E95" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="20" cy="30" rx="20" ry="13" fill="#A79E95"/><ellipse cx="22" cy="34" rx="11" ry="7" fill="#EFE8DD"/>
    <circle cx="36" cy="20" r="11" fill="#A79E95"/><circle cx="32" cy="9" r="6" fill="#A79E95"/><circle cx="32" cy="9" r="3.4" fill="#F2A3B5"/>
    <circle cx="40" cy="18" r="1.8" fill="#2B2B33"/><circle cx="47" cy="23" r="2.2" fill="#E98BA0"/>
    <path d="M26 28q8 6 16-2" fill="none" stroke="#D64045" stroke-width="4" stroke-linecap="round"/>
    <path d="M46 28v8" stroke="#6b4a33" stroke-width="1.5"/><rect x="42" y="35" width="9" height="11" rx="2" fill="#FFC857" stroke="#b9801a"/>
  </g>
</g>
<text class="sous" x="160" y="474" text-anchor="middle" font-family="Libre Baskerville,serif" font-size="12" fill="#F3E3BF">${esc(o.ligne1)}</text>
<text x="160" y="492" text-anchor="middle" font-family="Libre Baskerville,serif" font-style="italic" font-size="11" fill="#F3E3BF">${esc(o.ligne2 || '')}</text>
${o.invite ? `<text class="lv-invite" x="160" y="536" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="700" font-size="12.5" fill="#E8C96A">${esc(o.invite)}</text>` : ''}
</g>
</svg>`;
  }

  // ---------- La page de garde : la France, puis les Ardennes en grand ----------
  function garde(o) {
    const H = hauteur(o.h), F = laFrance(H), K = window.CARTE, [cx, cy] = K.CHATEAU, et = o.etoile, ch = surPage(F, cx, cy);
    const T = { x: ch.x - SEDAN.x * ZOOM, y: ch.y - SEDAN.y * ZOOM };
    const lieu = (n, contenu) => `<g class="lv-lieu" data-ordre="${n}">${contenu}</g>`;
    const nomX = et ? Math.max(120, Math.min(780, et.x)) : 0, nomY = et ? (et.y > 220 ? et.y - 52 : et.y + 82) : 0;
    return `<svg class="carte-france lv-svg" viewBox="0 0 320 ${H}" data-h="${H}" preserveAspectRatio="xMidYMid meet" role="group" aria-label="La carte du voyage : le château fort de Sedan, maison de Quenotte, dans les Ardennes${et ? ', et ' + esc(o.ville) : ''}">
<defs>
  <radialGradient id="lv-parch" cx=".5" cy=".45" r=".78"><stop offset="0" stop-color="#f8eed2"/><stop offset=".65" stop-color="#ecd6a2"/><stop offset="1" stop-color="#c9a86a"/></radialGradient>
  <filter id="lv-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .32  0 0 0 0 .15  0 0 0 .09 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  ${o.trajet ? `<mask id="masque-trajet" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1100" height="1100"><path class="trace" d="${o.trajet}" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/></mask>` : ''}
  <clipPath id="lv-clip-page"><rect width="320" height="${H}"/></clipPath>
  <mask id="lv-masque-route" maskUnits="userSpaceOnUse" x="-50" y="-50" width="420" height="740"><path class="lv-trace-route" d="${ROUTE}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/></mask>
</defs>
<rect width="320" height="${H}" fill="url(#lv-parch)"/><rect width="320" height="${H}" filter="url(#lv-grain)"/>
<rect x="8" y="8" width="304" height="${H - 16}" fill="none" stroke="#8B5A3C" stroke-width="2"/><rect x="14" y="14" width="292" height="${H - 28}" fill="none" stroke="#8B5A3C" stroke-width=".8"/>
<g clip-path="url(#lv-clip-page)"><g class="lv-monde">
  <g class="lv-france" transform="translate(${F.x},${F.y}) scale(${F.s})">
    <path class="pays" d="${K.CONTOUR_FRANCE}" vector-effect="non-scaling-stroke"/><path class="pays" d="${K.CONTOUR_CORSE}" vector-effect="non-scaling-stroke"/>
    ${et && et.outreMer ? `<g class="outre-mer"><rect x="40" y="722" width="140" height="116" rx="16"/><text x="110" y="862">Outre-mer</text></g>` : ''}
    ${o.trajet ? `<path class="trajet" d="${o.trajet}" mask="url(#masque-trajet)" vector-effect="non-scaling-stroke"/>` : ''}
    <g class="chateau" transform="translate(${cx},${cy}) scale(.9)">
      <path d="M-34 0v-30h68v30z" fill="#c9a466"/><rect x="-44" y="-44" width="22" height="44" rx="10" fill="#b8925a"/><path d="M-48-42l15-26 15 26z" fill="#5b6182"/>
      <rect x="22" y="-48" width="24" height="48" rx="11" fill="#b8925a"/><path d="M18-46l16-28 16 28z" fill="#5b6182"/><path d="M-8 0v-14a8 8 0 0 1 16 0v14z" fill="#5c3a24"/>
    </g>
    <text class="nom-chateau" x="${cx}" y="${cy - 84}">Château fort de Sedan</text>
    ${et ? `<g class="etoile-ville" role="button" tabindex="0" aria-label="L'étoile de ${esc(o.ville)}" transform="translate(${et.x},${et.y})">
      <circle class="halo" r="54" fill="url(#glow)"/><circle class="cible" r="56" fill="transparent"/>
      <use href="#etoile5" x="-26" y="-26" width="52" height="52"/>
    </g>
    <text class="nom-ville" x="${nomX}" y="${nomY}">${esc(o.ville)}</text>
    <g class="main-aide" transform="translate(${et.x + 16},${et.y + 18})" aria-hidden="true"><use href="#main" x="-20" y="-6" width="60" height="70"/></g>` : ''}
  </g>
  <g class="lv-detail" transform="translate(${T.x.toFixed(2)},${T.y.toFixed(2)}) scale(${ZOOM})" opacity="0">
    ${lieu(1, `<g transform="translate(206,112)"><path d="M-8 70l12-16h76l12 16z" fill="#6f9a52"/><rect x="6" y="28" width="66" height="28" fill="#c9a466"/><path d="M2 30l8-13h58l8 13z" fill="#5b6182"/><path d="M6 38h66M6 46h66" stroke="#a8844e" stroke-width=".8" opacity=".7"/><rect x="0" y="22" width="16" height="34" rx="8" fill="#b8925a"/><path d="M-2 24l10-17 10 17z" fill="#5b6182"/><rect x="62" y="18" width="18" height="38" rx="9" fill="#b8925a"/><path d="M60 20l11-19 11 19z" fill="#5b6182"/><rect x="38" y="16" width="10" height="13" fill="#b8925a"/><path d="M36 18l7-11 7 11z" fill="#5fa3a3"/><path d="M34 56v-9a4 4 0 0 1 8 0v9z" fill="#5c3a24"/><g fill="#FFC857"><rect x="20" y="36" width="3" height="4"/><rect x="52" y="34" width="3" height="4"/></g></g><text x="245" y="198" text-anchor="middle" font-family="Libre Baskerville,serif" font-style="italic" font-size="11" fill="#5c3a24">Sedan</text><text x="245" y="210" text-anchor="middle" font-family="Libre Baskerville,serif" font-size="8" fill="#7a5a3a">le château de Quenotte</text>`)}
    ${lieu(2, `<g fill="#3E7C50"><path d="M34 236l11-30 11 30zM54 244l12-34 12 34zM76 232l10-28 10 28zM26 262l10-28 10 28zM58 270l11-30 11 30zM90 256l9-24 9 24z"/></g><g transform="translate(46,282)"><ellipse rx="13" ry="7" fill="#6b4a33"/><path d="M9-4q7 0 9 6l3 1q0 3-3 3l-8 1q-4-1-4-6z" fill="#7a5238"/><path d="M-8 5v4M-3 6v4M3 6v4M8 5v4" stroke="#3a2618" stroke-width="2" stroke-linecap="round"/></g><text x="64" y="300" font-family="Libre Baskerville,serif" font-style="italic" font-size="10" fill="#2F5D50">la forêt des Ardennes</text>`)}
    ${lieu(3, `<g transform="translate(140,300)"><rect y="10" width="50" height="22" fill="#c26a4f"/><path d="M0 10l12-10 13 6 12-6 13 10z" fill="#3c4566"/><g fill="#3a2a20"><path d="M5 32v-7a3.5 3.5 0 0 1 7 0v7zM16 32v-7a3.5 3.5 0 0 1 7 0v7zM27 32v-7a3.5 3.5 0 0 1 7 0v7zM38 32v-7a3.5 3.5 0 0 1 7 0v7z"/></g><g fill="#FFC857"><rect x="8" y="14" width="3" height="4"/><rect x="24" y="14" width="3" height="4"/><rect x="40" y="14" width="3" height="4"/></g></g><text x="165" y="346" text-anchor="middle" font-family="Libre Baskerville,serif" font-style="italic" font-size="11" fill="#5c3a24">Charleville</text><text x="165" y="357" text-anchor="middle" font-family="Libre Baskerville,serif" font-size="8" fill="#7a5a3a">la place Ducale</text>`)}
    ${lieu(4, `<path d="M-10 384C40 360 96 404 110 430S170 490 222 466S300 402 330 420" fill="none" stroke="#5f9fb0" stroke-width="13" stroke-linecap="round" opacity=".9"/><path d="M-10 384C40 360 96 404 110 430S170 490 222 466S300 402 330 420" fill="none" stroke="#b9e0ea" stroke-width="2" stroke-dasharray="5 9" stroke-linecap="round"/><text x="238" y="500" font-family="Libre Baskerville,serif" font-style="italic" font-size="10" fill="#3E7C8F">la Meuse</text>`)}
    ${lieu(5, `<g transform="translate(236,316)"><path d="M0 0a16 18 0 1 1 32 0q0 12-10 18h-12Q0 12 0 0z" fill="#D64045"/><path d="M16-18q-6 18 0 36q6-18 0-36z" fill="#FFC857"/><path d="M10 18v6M22 18v6" stroke="#6b4a33"/><rect x="9" y="24" width="14" height="9" rx="1" fill="#8B5A3C"/></g>`)}
    ${lieu(6, `<g transform="translate(34,516)"><rect x="6" y="14" width="38" height="26" fill="#F3EFE6" stroke="#8B5A3C"/><path d="M0 14l25-20 25 20z" fill="#D64045"/><rect class="lv-fenetre" x="12" y="20" width="10" height="10" fill="#3a3f7a"/><rect x="28" y="24" width="9" height="16" fill="#6E4630"/></g><text x="98" y="546" font-family="Libre Baskerville,serif" font-weight="700" font-size="12" fill="#7a1f1f">${esc(o.ville)}</text><text x="98" y="558" font-family="Libre Baskerville,serif" font-style="italic" font-size="8.5" fill="#7a5a3a">chez ${esc(o.enfant)}</text>`)}
    <path class="lv-route" visibility="hidden" d="${ROUTE}" fill="none" stroke="#D64045" stroke-width="3.2" stroke-dasharray="6 6" stroke-linecap="round" mask="url(#lv-masque-route)"/>
    <g class="lv-voyageuse" opacity="0"><circle r="21" fill="#FFC857" opacity=".35"/><g transform="translate(-18,-20) scale(.84)"><ellipse cx="20" cy="28" rx="20" ry="13" fill="#A79E95"/><circle cx="36" cy="18" r="11" fill="#A79E95"/><circle cx="32" cy="7" r="6" fill="#A79E95"/><circle cx="32" cy="7" r="3.4" fill="#F2A3B5"/><circle cx="40" cy="16" r="1.8" fill="#2B2B33"/><path d="M26 26q8 6 16-2" fill="none" stroke="#D64045" stroke-width="4" stroke-linecap="round"/></g></g>
  </g>
</g></g>
<g class="lv-entete"><path d="M40 30h240l-12 24 12 24H40l12-24z" fill="#7a1f1f" stroke="#C9A227" stroke-width="1.5"/>
<text x="160" y="52" text-anchor="middle" font-family="Libre Baskerville,serif" font-weight="700" font-size="15" fill="#F3E3BF">La nuit de la Petite Souris</text>
<text x="160" y="69" text-anchor="middle" font-family="Libre Baskerville,serif" font-style="italic" font-size="10.5" fill="#F3E3BF">Le voyage de Quenotte jusqu'à ${esc(o.enfant)}</text></g>
${et ? `<text class="lv-consigne" x="160" y="${F.y + 870 * F.s + 34}" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="14" fill="#7a1f1f">${esc(o.aide)}</text>` : ''}
</svg>`;
  }

  // ---------- Les animations de la page de garde ----------
  const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  function animer(duree, pas, reduit) {
    return new Promise(res => {
      if (reduit) { pas(1); res(); return; }
      let debut = null;
      const f = t => { if (debut == null) debut = t; const k = Math.min(1, (t - debut) / duree); pas(ease(k)); if (k < 1) requestAnimationFrame(f); else res(); };
      requestAnimationFrame(f);
    });
  }
  // Le zoom : la France s'efface, la carte des Ardennes grandit jusqu'à remplir la page
  function zoom(svg, reduit) {
    const H = hauteur(+svg.getAttribute('data-h')), F = laFrance(H), Z = finZoom(H);
    const K = window.CARTE, [cx, cy] = K.CHATEAU, ch = surPage(F, cx, cy);
    const monde = svg.querySelector('.lv-monde'), trajet = svg.querySelector('.lv-france .trajet'), france = svg.querySelector('.lv-france'), detail = svg.querySelector('.lv-detail'), entete = svg.querySelector('.lv-consigne');
    if (entete) entete.style.display = 'none';
    return animer(1900, e => {
      const k = Math.exp(e * Math.log(Z.k / ZOOM)), sx = ch.x + (Z.x - ch.x) * e, sy = ch.y + (Z.y - ch.y) * e;
      monde.setAttribute('transform', `translate(${(sx - k * ch.x).toFixed(2)},${(sy - k * ch.y).toFixed(2)}) scale(${k.toFixed(4)})`);
      france.setAttribute('opacity', String(Math.max(0, 1 - e * 1.3)));
      if (trajet) trajet.setAttribute('opacity', String(Math.max(0, 1 - e * 6)));
      detail.setAttribute('opacity', String(Math.min(1, e * 1.6)));
    }, reduit);
  }
  // Les lieux apparaissent un à un, puis Quenotte suit le chemin jusqu'à la maison, dont la fenêtre s'allume
  async function voyage(svg, reduit, attendre, encore) {
    const lieux = Array.prototype.slice.call(svg.querySelectorAll('.lv-lieu'));
    for (const l of lieux) { if (!encore()) return; l.classList.add('vu'); await attendre(reduit ? 0 : 330); }
    const route = svg.querySelector('.lv-route'), trace = svg.querySelector('.lv-trace-route'), q = svg.querySelector('.lv-voyageuse'), L = route.getTotalLength();
    trace.setAttribute('stroke-dasharray', L + ' ' + L); trace.setAttribute('stroke-dashoffset', String(L));
    route.setAttribute('visibility', 'visible'); q.setAttribute('opacity', '1');
    await animer(3200, e => {
      trace.setAttribute('stroke-dashoffset', String(L * (1 - e)));
      const p = route.getPointAtLength(e * L); q.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    }, reduit);
    const f = svg.querySelector('.lv-fenetre'); if (f) f.setAttribute('fill', '#FFC857');
  }

  return { couverture, garde, zoom, voyage, hauteur };
})();

export {};
