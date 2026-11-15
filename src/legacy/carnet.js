// Le carnet des Ardennes : les cartes « Le savais-tu ? » (après le diplôme), et le livre de la légende
// des quatre fils Aymon en douze tableaux, jouée par la troupe de souris du Grand Marionnettiste.
// Tous les textes sont dans src/contenu/ardennes.js. Ici : l'affichage et les illustrations (originales).
window.CARNET = (function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const FEUILLE = 'M12 1C14 1 15 3 14.5 4.5C17 4 18 6 16 7.5C19 7.5 19.5 10 17 11C19.5 11.5 19 14.5 16 14C17 16 15.5 17.5 13.2 17L12.6 19V22.5H11.4V19L10.8 17C8.5 17.5 7 16 8 14C5 14.5 4.5 11.5 7 11C4.5 10 5 7.5 8 7.5C6 6 7 4 9.5 4.5C9 3 10 1 12 1Z';
  const feuille = (taille) => `<svg class="feuille-ico" width="${taille}" height="${taille}" viewBox="0 0 24 24" aria-hidden="true"><path d="${FEUILLE}" fill="#9BC53D" stroke="#3E6B1F"/></svg>`;

  // ---------- Une souris de la troupe, vue de face (accessoires au choix) ----------
  function souris(x, y, s, o) {
    o = o || {};
    const visage = o.yeuxFermes
      ? '<path d="M-6-8q2 2 4 0M2-8q2 2 4 0" fill="none" stroke="#2B2B33" stroke-width="1.4" stroke-linecap="round"/>'
      : '<circle cx="-4" cy="-8" r="1.8" fill="#2B2B33"/><circle cx="4" cy="-8" r="1.8" fill="#2B2B33"/>';
    const sourcils = o.fache ? '<path d="M-8-13l5 2M8-13l-5 2" stroke="#2B2B33" stroke-width="1.6" stroke-linecap="round"/>' : '';
    return `<g transform="translate(${x},${y}) scale(${s})">
${o.cape ? `<path d="M-15 0q15-6 30 0l9 36h-48z" fill="${o.cape}"/>` : ''}
<path d="M-12 4q12-6 24 0l4 30h-32z" fill="${o.robe || '#A79E95'}"/>
${o.voile ? '<path d="M-15-12q15-16 30 0l7 34q-22 6-44 0z" fill="#fff" opacity=".85"/>' : ''}
<circle cx="-11" cy="-16" r="8" fill="#A79E95"/><circle cx="11" cy="-16" r="8" fill="#A79E95"/><circle cx="-11" cy="-16" r="4.4" fill="#F2A3B5"/><circle cx="11" cy="-16" r="4.4" fill="#F2A3B5"/>
<circle cx="0" cy="-6" r="12" fill="#A79E95"/>${visage}${sourcils}<circle cx="0" cy="-2" r="2.2" fill="#E98BA0"/>
<path d="M-4 0l-10-1M-4 2l-10 2M4 0l10-1M4 2l10 2" stroke="#6B6560" stroke-width=".8"/>
${o.casque ? `<path d="M-11-9a11 10 0 0 1 22 0z" fill="#dfe2ee" stroke="#8a90a8" stroke-width="1.2"/><path d="M-1-18q-3-12 9-14q-5 6-3 13z" fill="${o.casque}"/>` : ''}
${o.couronne ? '<path d="M-9-15l2-9 4 6 3-7 3 7 4-6 2 9z" fill="#FFC857" stroke="#b9801a" stroke-width="1"/>' : ''}
${o.chapeau ? '<ellipse cx="0" cy="-16" rx="17" ry="4" fill="#6b4a33"/><path d="M-8-16q8-12 16 0z" fill="#6b4a33"/>' : ''}
${o.epee ? '<path d="M14 10l18-26" stroke="#cfd3ee" stroke-width="3" stroke-linecap="round"/><path d="M12 6l8 6" stroke="#8B5A3C" stroke-width="3"/>' : ''}
${o.lance ? '<path d="M14 26l12-50" stroke="#8B5A3C" stroke-width="2.4"/><path d="M26-24l3-8 1 9z" fill="#cfd3ee"/>' : ''}
${o.baguette ? '<path d="M14 8l14-18" stroke="#8B5A3C" stroke-width="2"/><path d="M28-14l2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z" fill="#FFC857"/>' : ''}
${o.baton ? '<path d="M16 32V-20" stroke="#8B5A3C" stroke-width="3" stroke-linecap="round"/>' : ''}
${o.pierre ? '<rect x="-14" y="-40" width="28" height="18" rx="2" fill="#cbbfa8" stroke="#8a7a5c" stroke-width="1.4"/>' : ''}
</g>`;
  }
  const ciel = (haut, bas) => `<defs><linearGradient id="lv-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${haut}"/><stop offset="1" stop-color="${bas}"/></linearGradient></defs><rect width="320" height="200" fill="url(#lv-ciel)"/>`;
  const etoiles = n => { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${(i * 73) % 320}" cy="${(i * 37) % 90}" r="${i % 3 ? 0.9 : 1.4}" fill="#FFF6E0" opacity=".8"/>`; return s; };
  const bayard = (x, y, s, avec) => `<g transform="translate(${x},${y}) scale(${s})">${window.THEATRE.dessins.bayard(avec !== false)}</g>`;
  const chateau = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">${window.THEATRE.dessins.chateau()}</g>`;
  const sapins = (xs, y, h, c) => xs.map(x => `<path d="M${x} ${y}l${h * 0.35}-${h} ${h * 0.35} ${h}z" fill="${c}"/>`).join('');

  // ---------- Les illustrations du livre ----------
  const VIGNETTES = [
    // Couverture : Bayard et les quatre chevaliers souris
    () => ciel('#1b2250', '#3a2f6b') + etoiles(24) + '<path d="M0 170q80-30 160-10t160-14v54H0z" fill="#1E3F36"/>' + bayard(150, 60, 0.62),
    // 1. Charlemagne fait chevaliers les quatre frères
    () => '<rect width="320" height="200" fill="#4a3260"/><g fill="#5c3f75">' + [40, 120, 200, 280].map(x => `<path d="M${x - 26} 200V60a26 26 0 0 1 52 0v140z"/>`).join('') + '</g><rect y="170" width="320" height="30" fill="#6b4a33"/>'
      + '<path d="M150 20v40l-12-8-12 8V20zM270 20v40l-12-8-12 8V20z" fill="#D64045"/>'
      + souris(70, 130, 1.5, { couronne: true, cape: '#6b3fa0', epee: true })
      + [[150, '#D64045'], [190, '#3E7C8F'], [230, '#FFC857'], [270, '#3E9A6B']].map(([x, p]) => souris(x, 150, 1.05, { casque: p })).join(''),
    // 2. La fée Oriande offre Bayard à Renaut
    () => ciel('#141a40', '#2b356f') + etoiles(30) + '<circle cx="270" cy="34" r="16" fill="#F3EFE6"/><rect y="168" width="320" height="32" fill="#1E3F36"/>' + sapins([10, 290], 170, 70, '#173229')
      + souris(70, 136, 1.4, { robe: '#F2A3B5', baguette: true }) + '<g fill="#FFC857">' + [[110, 80], [128, 66], [118, 100], [140, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2"/>`).join('') + '</g>'
      + bayard(205, 70, 0.6, false),
    // 3. La partie d'échecs qui tourne mal
    () => '<rect width="320" height="200" fill="#4a3260"/><rect y="150" width="320" height="50" fill="#6b4a33"/><rect x="110" y="118" width="100" height="40" fill="#8B5A3C"/>'
      + '<g>' + [...Array(16)].map((_, i) => `<rect x="${120 + (i % 8) * 10}" y="${108 + Math.floor(i / 8) * 6}" width="10" height="6" fill="${(i + Math.floor(i / 8)) % 2 ? '#2B2B33' : '#F3EFE6'}"/>`).join('') + '</g>'
      + souris(70, 128, 1.35, { casque: '#D64045', fache: true }) + souris(250, 128, 1.35, { cape: '#9a2a32', fache: true })
      + '<path d="M160 70l-6 16h12z" fill="#2B2B33"/><text x="160" y="56" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="26" fill="#FFC857">!</text>',
    // 4. Bayard emporte les quatre frères jusqu'en Ardenne
    () => ciel('#2b356f', '#5b6fb0') + '<path d="M0 150q60-50 120-20t110-30 90 10v90H0z" fill="#2F5D50"/><path d="M0 180c60-20 90 10 150-4s110-26 170-6v30H0z" fill="#7FB8C7" opacity=".8"/>'
      + chateau(268, 112, 0.32) + bayard(110, 70, 0.5),
    // 5. Un pèlerin révèle la cachette à Charlemagne
    () => ciel('#3e7c8f', '#9fd0dd') + '<rect y="160" width="320" height="40" fill="#5c8a4a"/><g fill="#F3EFE6" stroke="#c9b9a6">' + [[240, 160], [290, 160], [200, 166]].map(([x, y]) => `<path d="M${x - 22} ${y}l22-34 22 34z"/>`).join('') + '</g>'
      + souris(80, 128, 1.4, { chapeau: true, baton: true, robe: '#8a7a5c' }) + souris(160, 128, 1.4, { couronne: true, cape: '#6b3fa0' })
      + '<g fill="#fff"><circle cx="110" cy="80" r="3"/><circle cx="120" cy="76" r="3"/><circle cx="130" cy="72" r="3"/></g>',
    // 6. La grande bataille, puis la fuite sur Bayard
    () => ciel('#2b356f', '#6b4a6e') + '<rect x="0" y="40" width="90" height="160" fill="#8a8395"/><path d="M0 40h10v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h10" fill="none" stroke="#8a8395" stroke-width="10"/><path d="M28 200v-60a17 17 0 0 1 34 0v60z" fill="#2b2b33"/><rect y="180" width="320" height="20" fill="#5c8a4a"/>'
      + souris(110, 150, 1, { casque: '#8a90a8', lance: true }) + souris(140, 156, 1, { casque: '#8a90a8', lance: true })
      + '<g fill="#FFC857">' + [[125, 100], [170, 120]].map(([x, y]) => `<path transform="translate(${x},${y})" d="M0-8l2 6 6 0-5 4 2 6-5-4-5 4 2-6-5-4 6 0z"/>`).join('') + '</g>' + bayard(250, 82, 0.42),
    // 7. L'hiver dans la forêt, puis le retour chez leur maman
    () => ciel('#3a4366', '#8a93b8') + '<rect y="160" width="320" height="40" fill="#F3EFE6"/>' + '<g stroke="#4a3a2c" stroke-width="4" stroke-linecap="round">' + [30, 80].map(x => `<path d="M${x} 162V90M${x} 120l-14-14M${x} 104l12-12"/>`).join('') + '</g>'
      + '<g fill="#fff">' + [...Array(18)].map((_, i) => `<circle cx="${(i * 47) % 320}" cy="${(i * 29) % 150}" r="2"/>`).join('') + '</g>'
      + [110, 130, 150, 170].map((x, i) => souris(x, 150, 0.8, { casque: ['#D64045', '#3E7C8F', '#FFC857', '#3E9A6B'][i] })).join('')
      + '<rect x="220" y="100" width="90" height="62" fill="#c9b9a6"/><path d="M212 100l53-34 53 34z" fill="#6b4a33"/><rect x="240" y="116" width="22" height="20" fill="#FFC857"/>' + souris(290, 150, 1, { robe: '#3E7C8F' }),
    // 8. Le grand combat gagné chez le roi Yon
    () => ciel('#3e7c8f', '#9fd0dd') + '<rect y="150" width="320" height="50" fill="#c9a466"/><path d="M0 150h320" stroke="#8B5A3C" stroke-width="6"/>'
      + '<g>' + [[40, '#D64045'], [110, '#FFC857'], [210, '#3E7C8F'], [280, '#3E9A6B']].map(([x, c]) => `<path d="M${x} 150V60" stroke="#6b4a33" stroke-width="3"/><path d="M${x} 62h28l-8 8 8 8h-28z" fill="${c}"/>`).join('') + '</g>'
      + souris(160, 120, 1.5, { casque: '#D64045', lance: true }) + '<path d="M196 92h20v6a10 10 0 0 1-20 0zM202 108h8v8h-8z" fill="#FFC857"/>'
      + '<g fill="#A79E95">' + [20, 50, 80, 230, 260, 290].map(x => `<circle cx="${x}" cy="186" r="9"/>`).join('') + '</g>',
    // 9. Le mariage de Renaut, et le château de Montauban
    () => ciel('#F2A3B5', '#FFF6E0') + chateau(250, 160, 0.4) + '<rect y="160" width="320" height="40" fill="#5c8a4a"/>'
      + souris(100, 130, 1.4, { casque: '#D64045' }) + souris(150, 130, 1.4, { voile: true, robe: '#FFF6E0' })
      + '<g fill="#D64045">' + [[125, 70], [140, 56], [110, 54]].map(([x, y]) => `<path transform="translate(${x},${y})" d="M0 6l-6-6a3.5 3.5 0 0 1 6-4 3.5 3.5 0 0 1 6 4z"/>`).join('') + '</g>',
    // 10. La paix, puis un très long voyage par-delà la mer
    () => ciel('#9fd0dd', '#FFF6E0') + '<rect y="150" width="160" height="50" fill="#5c8a4a"/><rect x="160" y="140" width="160" height="60" fill="#3E7C8F"/>'
      + souris(50, 122, 1.2, { couronne: true, cape: '#6b3fa0' }) + souris(100, 122, 1.2, { casque: '#D64045' }) + '<circle cx="75" cy="128" r="5" fill="#A79E95"/>'
      + '<path d="M210 140h80l-12 16h-56z" fill="#8B5A3C"/><path d="M250 140V80" stroke="#6b4a33" stroke-width="3"/><path d="M252 84l30 20h-30z" fill="#FFF6E0"/><path d="M180 160q10-4 20 0t20 0 20 0 20 0 20 0" fill="none" stroke="#9fd0dd" stroke-width="2"/>',
    // 11. Renaut aide à bâtir la cathédrale de Cologne
    () => ciel('#9fd0dd', '#FFF6E0') + '<rect y="170" width="320" height="30" fill="#c9b9a6"/>'
      + '<path d="M170 170V80l20-30 20 30v90zM240 170V100l16-20 16 20v70zM200 170V110h50v60z" fill="#b8a585"/><g stroke="#8B5A3C" stroke-width="2.5">' + [170, 190, 210, 240, 270].map(x => `<path d="M${x - 4} 172V66"/>`).join('') + '<path d="M160 120h120M160 90h70"/></g>'
      + souris(90, 140, 1.4, { pierre: true, robe: '#8a7a5c' }),
    // 12. Le Rhin emporte Renaut, entouré de lumières et de chants
    () => ciel('#0d1030', '#1b2250') + etoiles(36) + '<rect y="110" width="320" height="90" fill="#1d3a5a"/><path d="M0 112q40-6 80 0t80 0 80 0 80 0" fill="none" stroke="#7FB8C7" stroke-width="2" opacity=".6"/>'
      + '<g>' + [[60, 128], [120, 140], [180, 124], [240, 138], [290, 126]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#FFC857" opacity=".25"/><circle cx="${x}" cy="${y}" r="3.4" fill="#FFC857"/>`).join('') + '</g>'
      + '<path d="M140 150h44l-6 8h-32z" fill="#cfd3ee" opacity=".85"/><path d="M162 150v-14" stroke="#cfd3ee" stroke-width="2"/>'
      + '<g fill="#E8833A">' + [[110, 172], [160, 180], [210, 170]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="5"/><path d="M${x - 10} ${y}l-8-5v10z"/>`).join('') + '</g>'
      + '<g fill="#FFF6E0" font-family="Baloo 2, sans-serif" font-size="14">' + [[70, 70], [250, 60], [160, 50]].map(([x, y]) => `<text x="${x}" y="${y}">♪</text>`).join('') + '</g>',
    // Fin : Bayard galope encore, la nuit, dans la forêt des Ardennes
    () => ciel('#0d1030', '#1b2250') + etoiles(30) + '<circle cx="60" cy="40" r="18" fill="#F3EFE6"/><rect y="170" width="320" height="30" fill="#14271f"/>' + sapins([0, 30, 250, 280, 300], 172, 80, '#0f2a22') + bayard(150, 74, 0.52, false),
  ];

  // Petites icônes des cartes
  const ICONES = {
    foret: '<ellipse cx="22" cy="30" rx="16" ry="9" fill="#4a3222"/><path d="M34 24q8-2 10 6l-10 2z" fill="#5c3c28"/><path d="M28 24l2-6 3 6z" fill="#3a2618"/>',
    place: '<rect x="4" y="14" width="40" height="28" fill="#D6B493"/><path d="M4 14l20-10 20 10z" fill="#2A3470"/><g fill="#151a40"><path d="M8 42v-10a6 6 0 0 1 12 0v10zM28 42v-10a6 6 0 0 1 12 0v10z"/></g>',
    rimbaud: '<path d="M10 40C18 24 28 14 42 6C38 18 28 30 12 42z" fill="#FFF6E0" stroke="#8a90a8"/><path d="M10 42L40 8" stroke="#8a90a8"/>',
    meuse: '<path d="M2 30c10-14 18 10 28-4s14-12 16-6" fill="none" stroke="#3E7C8F" stroke-width="6" stroke-linecap="round"/>',
    sedan: '<path d="M6 40V24h36v16z" fill="#c9a466"/><rect x="4" y="18" width="10" height="22" rx="5" fill="#b8925a"/><path d="M3 18l6-8 6 8z" fill="#5b6182"/><rect x="34" y="16" width="10" height="24" rx="5" fill="#b8925a"/><path d="M33 16l6-8 6 8z" fill="#5b6182"/>',
    ardoise: '<path d="M4 30l20-18 20 18z" fill="#4a5478"/><rect x="8" y="30" width="32" height="12" fill="#cfc3a8"/><path d="M14 22l6-4" stroke="#e8e2ee" stroke-width="2"/>',
    cabaret: '<g fill="#3E9A6B"><path d="M14 34V12l18-4v22"/><circle cx="11" cy="34" r="5"/><circle cx="29" cy="30" r="5"/></g>',
    marionnette: '<path d="M24 2v10" stroke="#8a90a8"/><circle cx="24" cy="16" r="5" fill="#FFC857"/><rect x="20" y="21" width="8" height="12" rx="2" fill="#D64045"/><path d="M20 24l-7 6M28 24l7 6M22 33l-3 9M26 33l3 9" stroke="#FFC857" stroke-width="2.4" stroke-linecap="round"/>',
    galette: '<ellipse cx="24" cy="28" rx="18" ry="8" fill="#E8B04A"/><ellipse cx="24" cy="26" rx="14" ry="5" fill="#F6CF7A"/><g fill="#fff"><circle cx="18" cy="26" r="1.2"/><circle cx="26" cy="25" r="1.2"/><circle cx="30" cy="27" r="1.2"/></g>',
    legende: '<path d="M8 40V14q8-6 16 0 8-6 16 0v26q-8-6-16 0-8-6-16 0z" fill="#FFF6E0" stroke="#8B5A3C" stroke-width="2"/><path d="M24 14v26" stroke="#8B5A3C" stroke-width="2"/>',
  };
  const icone = id => `<svg viewBox="0 0 48 48" aria-hidden="true">${ICONES[id] || ''}</svg>`;

  // ---------- La fenêtre du carnet ----------
  function ouvrir(o) {
    const AR = window.ARDENNES, T = o.T || (s => s), state = o.state || {}, son = o.son || (() => { });
    const trouves = state.ardennes || [];
    const precedent = document.activeElement;
    const fen = document.createElement('div');
    fen.className = 'atelier carnet';
    fen.setAttribute('role', 'dialog'); fen.setAttribute('aria-modal', 'true'); fen.setAttribute('aria-label', AR.titre);
    fen.innerHTML = `<div class="atelier-in"><div class="carnet-corps"></div><div class="actions-dessin"><button type="button" class="btn btn-or" data-a="fermer">Fermer le carnet</button></div></div>`;
    document.body.appendChild(fen);
    const corps = fen.querySelector('.carnet-corps');
    const titreFocus = () => { const h = corps.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } corps.scrollTop = 0; fen.querySelector('.atelier-in').scrollTop = 0; };
    let vue = 'grille', page = 0;

    const grille = () => {
      vue = 'grille';
      corps.innerHTML = `<h2>${feuille(26)} ${esc(AR.titre)}</h2><p class="carnet-intro">${esc(T(AR.intro))}</p>
<ul class="carnet-grille">${AR.cartes.map((c, i) => `<li><button type="button" class="carte-ard${c.secret && trouves.indexOf(c.secret) >= 0 ? ' trouvee' : ''}" data-i="${i}">${icone(c.id)}<span>${esc(c.titre)}</span>${c.secret && trouves.indexOf(c.secret) >= 0 ? `<em class="tampon-ard" title="${esc(AR.trouve)}">${feuille(16)}<span class="visuellement-cache">${esc(AR.trouve)}</span></em>` : ''}</button></li>`).join('')}</ul>`;
      corps.querySelectorAll('.carte-ard').forEach(b => b.onclick = () => { son('papier'); carte(+b.dataset.i); });
      titreFocus();
    };
    const carte = i => {
      vue = 'carte'; page = i;
      const c = AR.cartes[i], n = AR.cartes.length;
      const photo = c.photo && c.photo.fichier ? `<figure class="carte-photo"><img src="cartes/${esc(c.photo.fichier)}" alt="${esc(c.photo.description || c.titre)}">${c.photo.credit ? `<figcaption>${esc(c.photo.credit)}</figcaption>` : ''}</figure>` : `<div class="carte-dessin">${icone(c.id)}</div>`;
      const poeme = c.poeme ? `<blockquote class="carte-poeme"><p class="carte-poeme-titre">${esc(c.poeme.titre)}</p>${c.poeme.vers.map(v => `<span>${esc(v)}</span>`).join('')}</blockquote>` : '';
      const trouvee = c.secret && trouves.indexOf(c.secret) >= 0;
      corps.innerHTML = `<p class="carnet-chemin">Le savais-tu ? · ${i + 1} / ${n}</p><h2>${esc(c.titre)}</h2>${photo}
<div class="carte-texte" aria-live="polite">${c.texte.map(t => `<p>${esc(T(t))}</p>`).join('')}${poeme}${c.aVoir ? `<p class="carte-avoir"><strong>${esc(AR.aVoir)} :</strong> ${esc(c.aVoir)}</p>` : ''}${trouvee ? `<p class="carte-trouvee">${feuille(18)} ${esc(AR.trouve)}</p>` : ''}</div>
<div class="carnet-nav">${i > 0 ? '<button type="button" class="btn btn-petit" data-a="prec">◂ Carte précédente</button>' : ''}${c.livre ? `<button type="button" class="btn btn-or" data-a="livre">${esc(AR.livre.ouvrir)}</button>` : ''}${i < n - 1 ? '<button type="button" class="btn btn-petit" data-a="suiv">Carte suivante ▸</button>' : ''}<button type="button" class="btn btn-petit" data-a="grille">Toutes les cartes</button></div>`;
      const act = (a, f) => { const b = corps.querySelector(`[data-a="${a}"]`); if (b) b.onclick = f; };
      act('prec', () => { son('papier'); carte(i - 1); }); act('suiv', () => { son('papier'); carte(i + 1); });
      act('grille', grille); act('livre', () => { son('papier'); livre(0); });
      titreFocus();
    };
    // Les pages du livre : la couverture, les douze tableaux, la fin, puis la treizième scène
    const L = AR.livre, NB = L.tableaux.length + 3;
    const livre = p => {
      vue = 'livre'; page = Math.max(0, Math.min(NB - 1, p));
      let titre, heure = '', textes, dessin;
      if (page === 0) { titre = L.titre; textes = L.couverture; dessin = VIGNETTES[0](); }
      else if (page <= L.tableaux.length) { const t = L.tableaux[page - 1]; titre = `Tableau ${page}`; heure = t.heure; textes = [t.texte]; dessin = VIGNETTES[page](); }
      else if (page === L.tableaux.length + 1) { titre = 'Et Bayard ?'; textes = [L.fin]; dessin = VIGNETTES[VIGNETTES.length - 1](); }
      else {
        const vue13 = !!state.secret;
        titre = L.treizieme.titre; textes = [vue13 ? L.treizieme.trouvee : L.treizieme.cachee];
        dessin = vue13
          ? `<rect width="320" height="200" fill="#2a8c7e"/><rect x="30" y="20" width="260" height="160" fill="#1b2250"/><path d="M30 20h80q-10 80 0 160H30zM290 20h-80q10 80 0 160h80z" fill="#D64045"/><text x="160" y="96" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="17" fill="#FFC857">Ce soir :</text><text x="160" y="120" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="15" fill="#FFF6E0">${esc(T('{enfant} et la dent d\'or'))}</text>`
          : `<rect width="320" height="200" fill="#2a8c7e"/><rect x="30" y="20" width="260" height="160" fill="#D64045"/><path d="M160 20v160" stroke="#a8303a" stroke-width="4"/><text x="160" y="118" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="56" fill="#FFC857">?</text>`;
      }
      corps.innerHTML = `<p class="carnet-chemin">${esc(L.titre)} · page ${page + 1} sur ${NB}</p><h2>${esc(titre)}</h2>${heure ? `<p class="livre-heure">${esc(heure)}</p>` : ''}
<div class="livre-vignette"><svg viewBox="0 0 320 200" role="img" aria-label="${esc(titre)}">${dessin}</svg></div>
<div class="livre-texte" aria-live="polite">${textes.map(t => `<p>${esc(T(t))}</p>`).join('')}</div>
<div class="carnet-nav">${page > 0 ? '<button type="button" class="btn btn-petit" data-a="prec">◂ Page précédente</button>' : ''}${page < NB - 1 ? `<button type="button" class="btn btn-or" data-a="suiv">${page === 0 ? 'Commencer ▸' : 'Page suivante ▸'}</button>` : ''}<button type="button" class="btn btn-petit" data-a="grille">Toutes les cartes</button></div>`;
      const act = (a, f) => { const b = corps.querySelector(`[data-a="${a}"]`); if (b) b.onclick = f; };
      act('prec', () => { son('papier'); livre(page - 1); }); act('suiv', () => { son('papier'); livre(page + 1); }); act('grille', grille);
      titreFocus();
    };

    const fermer = () => { document.removeEventListener('keydown', clavier); fen.remove(); if (precedent && precedent.focus) try { precedent.focus({ preventScroll: true }); } catch (e) { } };
    const clavier = e => {
      if (e.key === 'Escape') { e.preventDefault(); fermer(); return; }
      if (vue === 'livre' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) { e.preventDefault(); son('papier'); livre(page + (e.key === 'ArrowRight' ? 1 : -1)); }
    };
    document.addEventListener('keydown', clavier);
    fen.querySelector('[data-a="fermer"]').onclick = fermer;
    if (o.vue === 'livre') livre(0); else grille();
  }

  return { ouvrir };
})();

export {};
