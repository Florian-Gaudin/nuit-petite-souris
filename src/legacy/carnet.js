// Le carnet des Ardennes : les cartes « Le savais-tu ? » (après le diplôme), et le livre de la légende
// des quatre fils Aymon en douze tableaux, jouée par la troupe de souris du Grand Marionnettiste.
// Tous les textes sont dans src/contenu/ardennes.js. Ici : l'affichage et les illustrations (originales).
window.CARNET = (function () {
  'use strict';
  const RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
  // Une classe d'animation en boucle autour d'un dessin (le dessin garde sa propre position) ; --r : décalage
  const anim = (cls, contenu, retard) => `<g class="${cls}"${retard != null ? ` style="animation-delay:${retard}s"` : ''}>${contenu}</g>`;
  const scintillent = (n, graine) => { let s = ''; for (let i = 0; i < n; i++) s += anim('lva-scintille', `<circle cx="${(i * 73 + graine) % 320}" cy="${(i * 37 + graine) % 90}" r="${i % 3 ? 1 : 1.5}" fill="#FFF6E0"/>`, -(i * 0.37 % 2).toFixed(2)); return s; };
  const neige = () => [...Array(18)].map((_, i) => anim('lva-tombe', `<circle cx="${(i * 47) % 320}" cy="0" r="2" fill="#fff"/>`, -(i * 0.43 % 6).toFixed(2))).join('');
  const galop = (x, y, s, avec) => anim('lva-galop', bayard(x, y, s, avec));
  const VIGNETTES = [
    // Couverture : Bayard galope, les étoiles scintillent
    () => ciel('#1b2250', '#3a2f6b') + scintillent(24, 0) + '<path d="M0 170q80-30 160-10t160-14v54H0z" fill="#1E3F36"/>' + galop(150, 60, 0.62),
    // 1. Charlemagne fait chevaliers les quatre frères : l'épée se lève et s'abaisse, les bannières ondulent
    () => '<rect width="320" height="200" fill="#4a3260"/><g fill="#5c3f75">' + [40, 120, 200, 280].map(x => `<path d="M${x - 26} 200V60a26 26 0 0 1 52 0v140z"/>`).join('') + '</g><rect y="170" width="320" height="30" fill="#6b4a33"/>'
      + anim('lva-drapeau', '<path d="M150 20v40l-12-8-12 8V20z" fill="#D64045"/>') + anim('lva-drapeau', '<path d="M270 20v40l-12-8-12 8V20z" fill="#D64045"/>', -0.7)
      + anim('lva-souffle', souris(70, 130, 1.5, { couronne: true, cape: '#6b3fa0', epee: true }))
      + [[150, '#D64045'], [190, '#3E7C8F'], [230, '#FFC857'], [270, '#3E9A6B']].map(([x, p], i) => anim('lva-flotte', souris(x, 150, 1.05, { casque: p }), -i * 0.6)).join(''),
    // 2. La fée Oriande offre Bayard à Renaut : la baguette scintille, Bayard respire
    () => ciel('#141a40', '#2b356f') + scintillent(30, 11) + anim('lva-lueur', '<circle cx="270" cy="34" r="16" fill="#F3EFE6"/>') + '<rect y="168" width="320" height="32" fill="#1E3F36"/>' + sapins([10, 290], 170, 70, '#173229')
      + anim('lva-balance', souris(70, 136, 1.4, { robe: '#F2A3B5', baguette: true }))
      + [[110, 80], [128, 66], [118, 100], [140, 90]].map(([x, y], i) => anim('lva-scintille', `<circle cx="${x}" cy="${y}" r="2.4" fill="#FFC857"/>`, -i * 0.45)).join('')
      + anim('lva-souffle', bayard(205, 70, 0.6, false)),
    // 3. La partie d'échecs qui tourne mal : les deux joueurs s'agitent, le « ! » palpite
    () => '<rect width="320" height="200" fill="#4a3260"/><rect y="150" width="320" height="50" fill="#6b4a33"/><rect x="110" y="118" width="100" height="40" fill="#8B5A3C"/>'
      + '<g>' + [...Array(16)].map((_, i) => `<rect x="${120 + (i % 8) * 10}" y="${108 + Math.floor(i / 8) * 6}" width="10" height="6" fill="${(i + Math.floor(i / 8)) % 2 ? '#2B2B33' : '#F3EFE6'}"/>`).join('') + '</g>'
      + anim('lva-agite', souris(70, 128, 1.35, { casque: '#D64045', fache: true })) + anim('lva-agite', souris(250, 128, 1.35, { cape: '#9a2a32', fache: true }), -0.35)
      + anim('lva-flotte', '<path d="M160 70l-6 16h12z" fill="#2B2B33"/>') + anim('lva-pulse', '<text x="160" y="56" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="26" fill="#FFC857">!</text>'),
    // 4. Bayard emporte les quatre frères jusqu'en Ardenne : il galope, la rivière coule
    () => ciel('#2b356f', '#5b6fb0') + '<path d="M0 150q60-50 120-20t110-30 90 10v90H0z" fill="#2F5D50"/><path d="M0 180c60-20 90 10 150-4s110-26 170-6v30H0z" fill="#7FB8C7" opacity=".8"/>'
      + '<path class="lva-courant" d="M0 186c60-20 90 10 150-4s110-26 170-6" fill="none" stroke="#cfe9f0" stroke-width="2" stroke-dasharray="10 10"/>'
      + chateau(268, 112, 0.32) + galop(110, 70, 0.5),
    // 5. Un pèlerin révèle la cachette à Charlemagne : il parle, les mots s'envolent
    () => ciel('#3e7c8f', '#9fd0dd') + '<rect y="160" width="320" height="40" fill="#5c8a4a"/><g fill="#F3EFE6" stroke="#c9b9a6">' + [[240, 160], [290, 160], [200, 166]].map(([x, y]) => `<path d="M${x - 22} ${y}l22-34 22 34z"/>`).join('') + '</g>'
      + anim('lva-balance', souris(80, 128, 1.4, { chapeau: true, baton: true, robe: '#8a7a5c' })) + anim('lva-souffle', souris(160, 128, 1.4, { couronne: true, cape: '#6b3fa0' }), -1)
      + [[110, 80], [120, 76], [130, 72]].map(([x, y], i) => anim('lva-parole', `<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`, (i * 0.4).toFixed(1))).join(''),
    // 6. La grande bataille, puis la fuite sur Bayard : les lances s'entrechoquent, Bayard s'enfuit au galop
    () => ciel('#2b356f', '#6b4a6e') + '<rect x="0" y="40" width="90" height="160" fill="#8a8395"/><path d="M0 40h10v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h10" fill="none" stroke="#8a8395" stroke-width="10"/><path d="M28 200v-60a17 17 0 0 1 34 0v60z" fill="#2b2b33"/><rect y="180" width="320" height="20" fill="#5c8a4a"/>'
      + anim('lva-agite', souris(110, 150, 1, { casque: '#8a90a8', lance: true })) + anim('lva-agite', souris(140, 156, 1, { casque: '#8a90a8', lance: true }), -0.3)
      + [[125, 100], [170, 120]].map(([x, y], i) => anim('lva-pulse', `<path transform="translate(${x},${y})" d="M0-8l2 6 6 0-5 4 2 6-5-4-5 4 2-6-5-4 6 0z" fill="#FFC857"/>`, -i * 0.5)).join('') + galop(250, 82, 0.42),
    // 7. L'hiver dans la forêt, puis le retour chez leur maman : la neige tombe, la fenêtre brille
    () => ciel('#3a4366', '#8a93b8') + '<rect y="160" width="320" height="40" fill="#F3EFE6"/>' + '<g stroke="#4a3a2c" stroke-width="4" stroke-linecap="round">' + [30, 80].map(x => `<path d="M${x} 162V90M${x} 120l-14-14M${x} 104l12-12"/>`).join('') + '</g>'
      + neige()
      + [110, 130, 150, 170].map((x, i) => anim('lva-grelotte', souris(x, 150, 0.8, { casque: ['#D64045', '#3E7C8F', '#FFC857', '#3E9A6B'][i] }), -i * 0.15)).join('')
      + '<rect x="220" y="100" width="90" height="62" fill="#c9b9a6"/><path d="M212 100l53-34 53 34z" fill="#6b4a33"/>' + anim('lva-lueur', '<rect x="240" y="116" width="22" height="20" fill="#FFC857"/>') + anim('lva-souffle', souris(290, 150, 1, { robe: '#3E7C8F' })),
    // 8. Le grand combat gagné chez le roi Yon : les drapeaux claquent, la foule acclame
    () => ciel('#3e7c8f', '#9fd0dd') + '<rect y="150" width="320" height="50" fill="#c9a466"/><path d="M0 150h320" stroke="#8B5A3C" stroke-width="6"/>'
      + [[40, '#D64045'], [110, '#FFC857'], [210, '#3E7C8F'], [280, '#3E9A6B']].map(([x, c], i) => `<path d="M${x} 150V60" stroke="#6b4a33" stroke-width="3"/>` + anim('lva-drapeau', `<path d="M${x} 62h28l-8 8 8 8h-28z" fill="${c}"/>`, -i * 0.35)).join('')
      + anim('lva-souffle', souris(160, 120, 1.5, { casque: '#D64045', lance: true })) + anim('lva-pulse', '<path d="M196 92h20v6a10 10 0 0 1-20 0zM202 108h8v8h-8z" fill="#FFC857"/>')
      + [20, 50, 80, 230, 260, 290].map((x, i) => anim('lva-saute', `<circle cx="${x}" cy="186" r="9" fill="#A79E95"/>`, -i * 0.2)).join(''),
    // 9. Le mariage de Renaut, et le château de Montauban : des cœurs s'envolent
    () => ciel('#F2A3B5', '#FFF6E0') + chateau(250, 160, 0.4) + '<rect y="160" width="320" height="40" fill="#5c8a4a"/>'
      + anim('lva-balance', souris(100, 130, 1.4, { casque: '#D64045' })) + anim('lva-balance', souris(150, 130, 1.4, { voile: true, robe: '#FFF6E0' }), -1.2)
      + [[125, 80], [140, 70], [110, 66], [132, 90]].map(([x, y], i) => anim('lva-monte', `<path transform="translate(${x},${y})" d="M0 6l-6-6a3.5 3.5 0 0 1 6-4 3.5 3.5 0 0 1 6 4z" fill="#D64045"/>`, -i * 0.9)).join(''),
    // 10. La paix, puis un très long voyage par-delà la mer : le bateau tangue sur les vagues
    () => ciel('#9fd0dd', '#FFF6E0') + '<rect y="150" width="160" height="50" fill="#5c8a4a"/><rect x="160" y="140" width="160" height="60" fill="#3E7C8F"/>'
      + anim('lva-souffle', souris(50, 122, 1.2, { couronne: true, cape: '#6b3fa0' })) + anim('lva-souffle', souris(100, 122, 1.2, { casque: '#D64045' }), -1) + '<circle cx="75" cy="128" r="5" fill="#A79E95"/>'
      + anim('lva-tangue', '<path d="M210 140h80l-12 16h-56z" fill="#8B5A3C"/><path d="M250 140V80" stroke="#6b4a33" stroke-width="3"/><path d="M252 84l30 20h-30z" fill="#FFF6E0"/>')
      + '<path class="lva-courant" d="M170 162q10-4 20 0t20 0 20 0 20 0 20 0 20 0 20 0" fill="none" stroke="#9fd0dd" stroke-width="2" stroke-dasharray="10 10"/>',
    // 11. Renaut aide à bâtir la cathédrale de Cologne : il porte sa pierre, pas à pas
    () => ciel('#9fd0dd', '#FFF6E0') + '<rect y="170" width="320" height="30" fill="#c9b9a6"/>'
      + '<path d="M170 170V80l20-30 20 30v90zM240 170V100l16-20 16 20v70zM200 170V110h50v60z" fill="#b8a585"/><g stroke="#8B5A3C" stroke-width="2.5">' + [170, 190, 210, 240, 270].map(x => `<path d="M${x - 4} 172V66"/>`).join('') + '<path d="M160 120h120M160 90h70"/></g>'
      + anim('lva-marche', souris(90, 140, 1.4, { pierre: true, robe: '#8a7a5c' })),
    // 12. Le Rhin emporte Renaut, entouré de lumières et de chants : les lumières vacillent, les poissons nagent
    () => ciel('#0d1030', '#1b2250') + scintillent(36, 5) + '<rect y="110" width="320" height="90" fill="#1d3a5a"/>'
      + '<path class="lva-courant" d="M0 112q40-6 80 0t80 0 80 0 80 0" fill="none" stroke="#7FB8C7" stroke-width="2" stroke-dasharray="10 10" opacity=".6"/>'
      + [[60, 128], [120, 140], [180, 124], [240, 138], [290, 126]].map(([x, y], i) => anim('lva-lueur', `<circle cx="${x}" cy="${y}" r="10" fill="#FFC857" opacity=".25"/><circle cx="${x}" cy="${y}" r="3.4" fill="#FFC857"/>`, -i * 0.5)).join('')
      + anim('lva-tangue', '<path d="M140 150h44l-6 8h-32z" fill="#cfd3ee" opacity=".85"/><path d="M162 150v-14" stroke="#cfd3ee" stroke-width="2"/>')
      + [[110, 172], [160, 180], [210, 170]].map(([x, y], i) => anim('lva-nage', `<ellipse cx="${x}" cy="${y}" rx="11" ry="5" fill="#E8833A"/><path d="M${x - 10} ${y}l-8-5v10z" fill="#E8833A"/>`, -i * 1.1)).join('')
      + [[70, 70], [250, 60], [160, 50]].map(([x, y], i) => anim('lva-monte', `<text x="${x}" y="${y}" fill="#FFF6E0" font-family="Baloo 2, sans-serif" font-size="14">♪</text>`, -i * 1.2)).join(''),
    // Fin : Bayard galope encore, la nuit, dans la forêt des Ardennes
    () => ciel('#0d1030', '#1b2250') + scintillent(30, 17) + anim('lva-lueur', '<circle cx="60" cy="40" r="18" fill="#F3EFE6"/>') + '<rect y="170" width="320" height="30" fill="#14271f"/>' + sapins([0, 30, 250, 280, 300], 172, 80, '#0f2a22') + galop(150, 74, 0.52, false),
  ];

  // ---------- Les illustrations des cartes : de petites scènes (repère 120 × 90) ----------
  const etoilesC = n => { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${(i * 37) % 120}" cy="${(i * 23) % 40}" r="${i % 3 ? 0.5 : 0.9}" fill="#FFF6E0" opacity=".8"/>`; return s; };
  const sapinC = (x, y, h, c) => `<path d="M${x} ${y}l${h * 0.3}-${h} ${h * 0.3} ${h}z" fill="${c}"/>`;
  const ICONES = {
    // La forêt des Ardennes et son sanglier
    foret: '<rect width="120" height="90" fill="#16213f"/>' + etoilesC(14) + '<circle cx="98" cy="16" r="7" fill="#F3EFE6"/>'
      + [[2, 74, 46], [16, 76, 56], [92, 74, 50], [104, 78, 58]].map(([x, y, h]) => sapinC(x, y, h, '#173229')).join('') + [[30, 70, 34], [74, 72, 38]].map(([x, y, h]) => sapinC(x, y, h, '#1E3F36')).join('')
      + '<rect y="72" width="120" height="18" fill="#24483E"/>'
      + '<g transform="translate(58,66)"><ellipse cx="-4" cy="0" rx="24" ry="13" fill="#6b4a33"/><path d="M-22-8q8-8 18-5q8-6 18 0" fill="none" stroke="#3a2618" stroke-width="3" stroke-linecap="round"/><path d="M14-10q12-2 18 8l4 2q1 4-3 5l-14 1q-8-2-8-9z" fill="#7a5238"/><ellipse cx="34" cy="2" rx="3.5" ry="3" fill="#a07a68"/><path d="M26 5q4 1 4-4" fill="none" stroke="#FFF6E0" stroke-width="2" stroke-linecap="round"/><path d="M16-10l3-7 4 7z" fill="#3a2618"/><circle cx="24" cy="-3" r="1.4" fill="#1a110a"/><path d="M-20 10v6M-12 11v6M4 11v6M12 10v6" stroke="#3a2618" stroke-width="3" stroke-linecap="round"/><path d="M-28-2q-6 2-5 7" fill="none" stroke="#3a2618" stroke-width="2"/></g>'
      + '<path d="M8 86q4-14 0-20M8 76l-6-4M8 72l6-4M112 86q-4-12 0-18M112 76l6-4M112 72l-6-3" fill="none" stroke="#3E7C50" stroke-width="2" stroke-linecap="round"/>',
    // La place Ducale : façades de brique et de pierre, arcades, toits d'ardoise
    place: '<rect width="120" height="90" fill="#2b356f"/>' + etoilesC(10) + '<circle cx="104" cy="14" r="6" fill="#F3EFE6"/>'
      + [0, 40, 80].map((x, k) => `<path d="M${x} 34l20-${k === 1 ? 20 : 14} 20 ${k === 1 ? 20 : 14}z" fill="#3c4566"/><rect x="${x + 16}" y="${k === 1 ? 18 : 24}" width="8" height="8" fill="#e8dcc4"/><rect x="${x}" y="34" width="40" height="30" fill="${k % 2 ? '#b5563f' : '#c26a4f'}"/><rect x="${x}" y="34" width="4" height="30" fill="#e8dcc4"/><rect x="${x + 36}" y="34" width="4" height="30" fill="#e8dcc4"/><g fill="#FFC857">${[8, 18, 28].map(wx => `<rect x="${x + wx}" y="40" width="5" height="8"/>`).join('')}</g><g fill="#1b2250">${[8, 18, 28].map(wx => `<rect x="${x + wx}" y="52" width="5" height="8"/>`).join('')}</g>`).join('')
      + '<rect y="64" width="120" height="16" fill="#d9b77a"/><g fill="#151a40">' + [0, 20, 40, 60, 80, 100].map(x => `<path d="M${x + 3} 80v-9a7 7 0 0 1 14 0v9z"/>`).join('') + '</g><rect y="80" width="120" height="10" fill="#4d4a5a"/>',
    // Arthur Rimbaud : la plume, l'encrier, le poème et un petit bateau rêvé
    rimbaud: '<rect width="120" height="90" fill="#6b4a33"/><rect y="62" width="120" height="28" fill="#5c3c28"/>'
      + '<g transform="rotate(-6 54 46)"><rect x="24" y="14" width="60" height="62" rx="2" fill="#FFF6E0"/><g stroke="#8a7a9c" stroke-width="1.6" stroke-linecap="round">' + [24, 31, 38, 45, 52].map(y => `<path d="M31 ${y}h${y % 2 ? 40 : 34}"/>`).join('') + '</g><path d="M58 66l12-4 4-12 2 12h-14z" fill="#3E7C8F"/><path d="M68 62v-14" stroke="#3E7C8F"/><path d="M52 68q8 3 18 0" fill="none" stroke="#7FB8C7" stroke-width="1.6"/></g>'
      + '<rect x="90" y="54" width="18" height="16" rx="3" fill="#2B2B33"/><rect x="94" y="50" width="10" height="5" fill="#45454f"/>'
      + '<path d="M98 50C92 30 96 14 112 4C110 18 106 34 100 50z" fill="#FFF6E0" stroke="#cfd3ee"/><path d="M99 52L111 6" stroke="#8a90a8"/>',
    // La Meuse vue d'en haut : ses grandes boucles entre les collines boisées
    meuse: '<rect width="120" height="90" fill="#5c8a4a"/>'
      + '<g fill="#3E7C50">' + [[14, 14, 12], [40, 70, 14], [96, 20, 14], [104, 74, 12], [62, 40, 8], [20, 50, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('') + '</g>'
      + '<path d="M-4 18C30 6 46 30 34 44S20 74 54 72S92 40 76 28S80 6 124 14" fill="none" stroke="#3E7C8F" stroke-width="11" stroke-linecap="round"/><path d="M-4 18C30 6 46 30 34 44S20 74 54 72S92 40 76 28S80 6 124 14" fill="none" stroke="#9fd0dd" stroke-width="2.4" stroke-dasharray="6 9" stroke-linecap="round"/>'
      + '<g>' + [[58, 52], [64, 56], [52, 58]].map(([x, y]) => `<rect x="${x}" y="${y}" width="5" height="4" fill="#e8dcc4"/><path d="M${x - 1} ${y}l3.5-3 3.5 3z" fill="#4a5478"/>`).join('') + '</g>',
    // Le château fort de Sedan : tours rondes, toits d'ardoise, la petite tour vert-de-gris
    sedan: '<rect width="120" height="90" fill="#9fb8d6"/><rect y="56" width="120" height="34" fill="#7aa35a"/>'
      + '<path d="M4 82l14-24h84l14 24z" fill="#5c8a4a"/>'
      + '<rect x="30" y="30" width="58" height="14" fill="#c9a466"/><path d="M26 31l6-9h54l6 9z" fill="#5b6182"/>'
      + '<rect x="20" y="40" width="80" height="34" fill="#c9a466"/><g stroke="#a8844e" stroke-width=".8" opacity=".6">' + [46, 52, 58, 64, 70].map(y => `<path d="M20 ${y}h80"/>`).join('') + '</g>'
      + [[20, 34, 14], [100, 30, 16], [44, 42, 10]].map(([x, y, w]) => `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${74 - y}" rx="${w / 2}" fill="#b8925a"/><path d="M${x - w / 2 - 2} ${y + 2}L${x} ${y - 14}L${x + w / 2 + 2} ${y + 2}z" fill="#5b6182"/>`).join('')
      + '<rect x="70" y="26" width="12" height="14" fill="#b8925a"/><path d="M68 27l8-10 8 10z" fill="#5fa3a3"/>'
      + '<path d="M54 74v-10a6 6 0 0 1 12 0v10z" fill="#5c3a24"/><g fill="#3a2f22">' + [[30, 50], [84, 48], [60, 50], [40, 58]].map(([x, y]) => `<rect x="${x}" y="${y}" width="2.5" height="5"/>`).join('') + '</g>',
    // L'ardoise : les toits couverts d'écailles de pierre, et une pile d'ardoises violettes
    ardoise: '<rect width="120" height="90" fill="#9fb8d6"/>'
      + '<path d="M-6 66L40 20L86 66z" fill="#4a5478"/><g fill="none" stroke="#6b7398" stroke-width="1.2">' + [30, 38, 46, 54, 62].map(y => `<path d="M${40 - (y - 20)} ${y}h${2 * (y - 20)}"/>`).join('') + '</g>'
      + '<g fill="#5b6182">' + [34, 42, 50, 58].map((y, r) => [...Array(2 * (y - 20) / 8 | 0)].map((_, k) => `<path d="M${40 - (y - 20) + k * 8 + (r % 2) * 4} ${y}q4 6 8 0" />`).join('')).join('') + '</g>'
      + '<rect x="4" y="66" width="72" height="24" fill="#e8dcc4"/><rect x="34" y="72" width="12" height="18" fill="#5c3a24"/>'
      + '<g transform="translate(96,72)">' + [0, 5, 10, 15].map(d => `<path d="M-16 ${-d}l26-4 8 6-26 4z" fill="${d % 10 ? '#7a6a9c' : '#6b5b8a'}" stroke="#45395e" stroke-width="1"/>`).join('') + '</g>',
    // Le Cabaret Vert : la grande scène, les lumières vertes, la foule qui danse
    cabaret: '<rect width="120" height="90" fill="#0d1a14"/>' + etoilesC(8)
      + '<g opacity=".35" stroke="#7CD65A" stroke-width="6" stroke-linecap="round"><path d="M40 40L10 4M60 40V0M80 40L110 4"/></g>'
      + '<path d="M24 48h72l-6-14H30z" fill="#2F5D50"/><rect x="24" y="48" width="72" height="12" fill="#1a2a20"/><g fill="#7CD65A">' + [32, 44, 56, 68, 80, 90].map(x => `<circle cx="${x}" cy="40" r="2"/>`).join('') + '</g>'
      + '<g fill="#cfd3ee"><circle cx="50" cy="44" r="3"/><rect x="48" y="46" width="4" height="4"/><circle cx="70" cy="44" r="3"/><rect x="68" y="46" width="4" height="4"/></g>'
      + '<g fill="#7CD65A"><path d="M14 30v-12l8-2v12" stroke="#7CD65A" stroke-width="1.6" fill="none"/><circle cx="12" cy="30" r="2.6"/><circle cx="20" cy="28" r="2.6"/><path d="M104 24v-10" stroke="#7CD65A" stroke-width="1.6"/><circle cx="102" cy="24" r="2.6"/></g>'
      + '<g fill="#1f2b4a">' + [...Array(12)].map((_, k) => `<circle cx="${6 + k * 10}" cy="${74 + (k % 3) * 2}" r="6"/><path d="M${6 + k * 10 - 7} 90q7-12 14 0z"/>`).join('') + '<path d="M18 70l-4-10M48 70l-2-12M88 70l4-11M108 72l3-10" stroke="#1f2b4a" stroke-width="3" stroke-linecap="round"/></g>',
    // La marionnette : le cadre vert-de-gris, la croix de bois, le pantin à fils
    marionnette: '<rect width="120" height="90" fill="#2a8c7e"/><rect x="10" y="10" width="100" height="74" fill="#1b2250"/><path d="M10 10h22q-6 36 0 74H10zM110 10H88q6 36 0 74h22z" fill="#D64045"/>'
      + '<rect x="40" y="12" width="40" height="5" rx="2" fill="#8B5A3C"/><rect x="57" y="6" width="6" height="18" rx="2" fill="#8B5A3C"/>'
      + '<path d="M42 15L48 52M78 15L72 52M60 22V34M50 15L52 72M70 15L68 72" stroke="#e8e2ee" stroke-width=".8"/>'
      + '<circle cx="60" cy="40" r="7" fill="#FFC857"/><circle cx="57.5" cy="39" r="1.2" fill="#2B2B33"/><circle cx="62.5" cy="39" r="1.2" fill="#2B2B33"/><path d="M57 43q3 2 6 0" fill="none" stroke="#2B2B33" stroke-width="1"/>'
      + '<rect x="54" y="47" width="12" height="16" rx="3" fill="#D64045"/><path d="M54 50L48 52M66 50L72 52M57 63L52 72M63 63L68 72" stroke="#FFC857" stroke-width="3" stroke-linecap="round"/>'
      + '<rect x="10" y="78" width="100" height="6" fill="#6b4a33"/>',
    // La cacasse à cul nu : la cocotte en fonte qui fume, sur la table de l'auberge
    cacasse: '<rect width="120" height="90" fill="#6b4a33"/><rect y="62" width="120" height="28" fill="#8B5A3C"/><path d="M0 62h120" stroke="#5a3b26" stroke-width="2"/>'
      + '<g fill="none" stroke="#f3efe6" stroke-width="3" stroke-linecap="round" opacity=".8"><path d="M48 30q-6-7 0-14t0-12"/><path d="M60 28q6-7 0-14t0-12"/><path d="M72 30q-6-7 0-14t0-12"/></g>'
      + '<ellipse cx="60" cy="40" rx="34" ry="8" fill="#2b2b33"/><ellipse cx="60" cy="40" rx="29" ry="5.5" fill="#c9a466"/>'
      + '<g fill="#E8B84A" stroke="#b9801a" stroke-width="1"><ellipse cx="48" cy="39" rx="6" ry="3.5"/><ellipse cx="62" cy="38" rx="7" ry="3.8"/><ellipse cx="73" cy="40" rx="5.5" ry="3.2"/></g>'
      + '<path d="M26 40h68v14a16 16 0 0 1-16 16H42a16 16 0 0 1-16-16z" fill="#1F2235"/><path d="M20 46h7M93 46h7" stroke="#1F2235" stroke-width="5" stroke-linecap="round"/>'
      + '<path d="M32 46h56" stroke="#3a3d55" stroke-width="2"/>',
    // La galette au sucre, sur une nappe à carreaux
    galette: '<rect width="120" height="90" fill="#FFF6E0"/><g fill="#D64045" opacity=".35">' + [...Array(36)].map((_, k) => (k + Math.floor(k / 6)) % 2 ? `<rect x="${(k % 6) * 20}" y="${Math.floor(k / 6) * 15}" width="20" height="15"/>` : '').join('') + '</g>'
      + '<ellipse cx="60" cy="54" rx="46" ry="20" fill="#fff" stroke="#cfd3ee" stroke-width="2"/>'
      + '<ellipse cx="60" cy="52" rx="34" ry="13" fill="#b9801a"/><ellipse cx="60" cy="48" rx="34" ry="13" fill="#E8B04A"/><ellipse cx="60" cy="46" rx="27" ry="9" fill="#F6CF7A"/>'
      + '<g fill="#fff">' + [[48, 44], [56, 48], [64, 43], [72, 47], [52, 50], [68, 50], [60, 45], [44, 48], [76, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('') + '</g>'
      + '<path d="M60 47L94 52l-6 8z" fill="#FFF6E0" opacity=".9"/><path d="M92 62l10-3v6z" fill="#E8B04A" stroke="#b9801a"/>',
    // La légende : un livre ancien ouvert, et sur ses pages Bayard au galop avec les quatre frères (le dessin du théâtre)
    legende: () => '<rect width="120" height="90" fill="#3a2f6b"/>' + etoilesC(12)
      + '<path d="M4 86V18q28-9 56 0 28-9 56 0v68q-28-9-56 0-28-9-56 0z" fill="#7a1f1f"/>'
      + '<path d="M7 83V20q26-8 53 0 27-8 53 0v63q-26-8-53 0-27-8-53 0z" fill="#f0dfb4" stroke="#C9A227" stroke-width="1.2"/>'
      + '<path d="M60 20v63" stroke="#8B5A3C" stroke-width="1.6"/><path d="M56 21v61M64 21v61" stroke="#c9a978" stroke-width="3" opacity=".5"/>'
      + '<rect x="12" y="24" width="9" height="9" fill="#2b3a8f" stroke="#C9A227" stroke-width="1"/><text x="16.5" y="31.4" text-anchor="middle" font-family="Libre Baskerville, serif" font-weight="700" font-size="7.5" fill="#FFF6E0">B</text>'
      + '<g stroke="#8a6a4a" stroke-width=".9" opacity=".55">' + [26, 30, 34].map(y => `<path d="M24 ${y}h28M68 ${y}h38"/>`).join('') + '</g>'
      + '<path d="M10 80q50-10 100 0" fill="none" stroke="#9ab86a" stroke-width="3" opacity=".7"/>'
      + `<g transform="translate(57,40) scale(.225)">${window.THEATRE.dessins.bayard(true)}</g>`,
  };
  const icone = id => { const d = ICONES[id]; return `<svg viewBox="0 0 120 90" aria-hidden="true">${typeof d === 'function' ? d() : d || ''}</svg>`; };

  // Le livre de la légende, fermé : la couverture à toucher pour l'ouvrir
  const livreFerme = () => `<svg viewBox="0 0 200 250" aria-hidden="true">
<defs><linearGradient id="lf-cuir" x1="0" x2="1"><stop offset="0" stop-color="#4a1414"/><stop offset=".08" stop-color="#7a1f1f"/><stop offset=".92" stop-color="#7a1f1f"/><stop offset="1" stop-color="#5a1818"/></linearGradient>
<linearGradient id="lf-or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e08a"/><stop offset=".5" stop-color="#C9A227"/><stop offset="1" stop-color="#8a6a12"/></linearGradient></defs>
<rect x="18" y="12" width="172" height="232" rx="6" fill="#e9d8ad"/><path d="M186 16v224" stroke="#c9b086" stroke-width="2"/>
<rect x="10" y="8" width="172" height="232" rx="6" fill="url(#lf-cuir)"/><path d="M18 8v232" stroke="#3a0f0f" stroke-width="3" opacity=".6"/>
<rect x="22" y="18" width="150" height="212" rx="3" fill="none" stroke="url(#lf-or)" stroke-width="2.5"/>
<g fill="url(#lf-or)">${[[30, 26], [164, 26], [30, 222], [164, 222]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>
<text x="97" y="52" text-anchor="middle" font-family="Libre Baskerville,serif" font-size="12" fill="url(#lf-or)">La légende des</text>
<text x="97" y="72" text-anchor="middle" font-family="Libre Baskerville,serif" font-weight="700" font-size="15" fill="url(#lf-or)">quatre fils Aymon</text>
<path d="M52 82h90" stroke="#C9A227" stroke-width="1.2"/>
<rect x="38" y="92" width="118" height="106" fill="url(#lf-or)"/><rect x="41" y="95" width="112" height="100" fill="#1b2250"/>
<g transform="translate(92,128) scale(.3)">${window.THEATRE.dessins.bayard(true)}</g>
<text x="97" y="216" text-anchor="middle" font-family="Libre Baskerville,serif" font-style="italic" font-size="9.5" fill="#F3E3BF">douze tableaux</text>
</svg>`;

  // Une carte est découverte quand l'enfant a vécu son moment pendant le voyage ; le livre, après la scène 13
  const decouverte = (c, state) => c.livre ? !!state.secret : !!(c.secret && (state.ardennes || []).indexOf(c.secret) >= 0);
  function compte(state) { const AR = window.ARDENNES; return { n: AR.cartes.filter(c => decouverte(c, state || {})).length, total: AR.cartes.length }; }
  // Un éventail de trois petites cartes (les premières découvertes), pour la page du diplôme
  function apercu(state) {
    const AR = window.ARDENNES, cartes = AR.cartes.filter(c => !c.livre);
    const vues = cartes.filter(c => decouverte(c, state || {}));
    return (vues.length >= 3 ? vues : vues.concat(cartes.filter(c => vues.indexOf(c) < 0))).slice(0, 3).map((c, k) => `<span class="mini-carte m${k}">${icone(c.id)}</span>`).join('');
  }

  // ---------- La fenêtre du carnet ----------
  function ouvrir(o) {
    const AR = window.ARDENNES, T = o.T || (s => s), state = o.state || {}, son = o.son || (() => { });
    const trouves = state.ardennes || [];
    const precedent = document.activeElement;
    const fen = document.createElement('div');
    fen.className = 'atelier carnet';
    fen.setAttribute('role', 'dialog'); fen.setAttribute('aria-modal', 'true'); fen.setAttribute('aria-label', AR.titre);
    fen.innerHTML = `<div class="atelier-in"><button type="button" class="carnet-x" data-a="fermer" aria-label="Fermer le carnet">✕</button><div class="carnet-corps"></div></div>`;
    document.body.appendChild(fen);
    const corps = fen.querySelector('.carnet-corps');
    const titreFocus = () => { const h = corps.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } corps.scrollTop = 0; fen.querySelector('.atelier-in').scrollTop = 0; };
    let vue = 'grille', page = 0;

    const grille = () => {
      vue = 'grille'; fen.classList.remove('mode-livre');
      corps.innerHTML = `<h2>${feuille(26)} ${esc(AR.titre)}</h2><p class="carnet-intro">${esc(T(AR.intro))}</p>
<p class="carnet-compte">${feuille(18)} ${esc(AR.decouvertes.replace('{n}', compte(state).n).replace('{total}', compte(state).total))}</p>
${(() => { const li = AR.cartes.map((c, i) => {
        const ok = decouverte(c, state);
        if (c.livre) return `<li class="li-livre"><button type="button" class="carte-ard carte-livre${ok ? '' : ' verrouillee'}" data-i="${i}"${ok ? '' : ' disabled'}>${ok ? `<span class="ruban-livre" aria-hidden="true">${esc(AR.livre.ruban)}</span>${[[8, 20], [92, 14], [70, 80], [18, 78], [50, 8]].map(([x, y], k) => `<i class="etincelle" style="left:${x}%;top:${y}%;animation-delay:${(k * .45).toFixed(2)}s" aria-hidden="true"></i>`).join('')}` : ''}<span class="livre-mini">${livreFerme()}</span><span class="livre-txt"><strong>${esc(c.titre)}</strong><small>${esc(ok ? AR.livre.sousTitre : AR.livre.verrou)}</small></span></button></li>`;
        return ok
          ? `<li><button type="button" class="carte-ard trouvee" data-i="${i}">${icone(c.id)}<span>${esc(c.titre)}</span><em class="tampon-ard" title="${esc(AR.trouve)}">${feuille(16)}<span class="visuellement-cache">${esc(AR.trouve)}</span></em></button></li>`
          : `<li><button type="button" class="carte-ard verrouillee" data-i="${i}" disabled>${icone(c.id)}<span>${esc(c.titre)}</span><em class="verrou" title="${esc(AR.verrou)}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg><span class="visuellement-cache">${esc(AR.verrou)}</span></em></button></li>`;
      });
      // Le livre de la légende, à part et en tête ; dessous, la grille des cartes (toutes de la même taille)
      return '<ul class="carnet-une">' + li.filter(x => x.indexOf('li-livre') >= 0).join('') + '</ul><ul class="carnet-grille">' + li.filter(x => x.indexOf('li-livre') < 0).join('') + '</ul>'; })()}`;
      corps.querySelectorAll('.carte-ard:not([disabled])').forEach(b => b.onclick = () => { son('papier'); carte(+b.dataset.i); });
      titreFocus();
    };
    const carte = i => {
      vue = 'carte'; page = i; fen.classList.remove('mode-livre');
      const c = AR.cartes[i], ouvertes = AR.cartes.map((x, k) => decouverte(x, state) ? k : -1).filter(k => k >= 0);
      const rang = ouvertes.indexOf(i), avant = rang > 0 ? ouvertes[rang - 1] : -1, apres = rang >= 0 && rang < ouvertes.length - 1 ? ouvertes[rang + 1] : -1;
      const photo = c.livre ? `<div class="livre-scene"><button type="button" class="livre-ferme" data-a="livre" aria-label="${esc(AR.livre.ouvrir)}"><span class="livre-pages" aria-hidden="true"></span><span class="livre-couv">${livreFerme()}<span class="livre-dos" aria-hidden="true"></span></span><span class="livre-reflet" aria-hidden="true"></span>${[[4, 18], [94, 30], [10, 82], [90, 76], [50, 2]].map(([x, y], k) => `<i class="etincelle" style="left:${x}%;top:${y}%;animation-delay:${(k * .5).toFixed(1)}s" aria-hidden="true"></i>`).join('')}<svg class="main-livre" viewBox="0 0 48 48" aria-hidden="true"><path d="M20 44c-5-3-9-9-10-14-.5-2.5 2-4 4-2l3 3V10a3 3 0 0 1 6 0v12a3 3 0 0 1 6 0v2a3 3 0 0 1 6 0v2a3 3 0 0 1 6 0v8c0 5-3 9-7 10z" fill="#fff" stroke="#3b2a00" stroke-width="2.2" stroke-linejoin="round"/></svg></button>
<div class="bulle-quenotte"><span class="bulle-portrait" aria-hidden="true">${window.ART && window.ART.portrait ? window.ART.portrait() : ''}</span><p>${esc(T(AR.livre.invitation))}</p></div></div>` : c.photo && c.photo.fichier ? `<figure class="carte-photo"><img src="cartes/${esc(c.photo.fichier)}" alt="${esc(c.photo.description || c.titre)}">${c.photo.credit ? `<figcaption>${esc(c.photo.credit)}</figcaption>` : ''}</figure>` : `<div class="carte-dessin">${icone(c.id)}</div>`;
      const poeme = c.poeme ? `<blockquote class="carte-poeme"><p class="carte-poeme-titre">${esc(c.poeme.titre)}</p>${c.poeme.vers.map(v => `<span>${esc(v)}</span>`).join('')}</blockquote>` : '';
      const recette = c.recette ? `<div class="carte-poeme carte-recette"><p class="carte-poeme-titre">${esc(c.recette.titre)}</p><ol>${c.recette.etapes.map(v => `<li>${esc(v)}</li>`).join('')}</ol></div>` : '';
      const trouvee = c.secret && trouves.indexOf(c.secret) >= 0;
      corps.innerHTML = `<p class="carnet-chemin">Le savais-tu ? · ${rang + 1} / ${ouvertes.length}</p><h2>${esc(c.titre)}</h2>${photo}
<div class="carte-texte" aria-live="polite">${c.texte.map(t => `<p>${esc(T(t))}</p>`).join('')}${poeme}${recette}${c.aVoir ? `<p class="carte-avoir"><strong>${esc(AR.aVoir)} :</strong> ${esc(c.aVoir)}</p>` : ''}${c.aGouter ? `<p class="carte-avoir"><strong>${esc(AR.aGouter)} :</strong> ${esc(c.aGouter)}</p>` : ''}${trouvee ? `<p class="carte-trouvee">${feuille(18)} ${esc(AR.trouve)}</p>` : ''}</div>
<nav class="carnet-barre" aria-label="Les cartes du carnet">
  <button type="button" class="barre-fleche" data-a="prec" aria-label="Carte précédente"${avant >= 0 ? '' : ' disabled'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <button type="button" class="barre-grille" data-a="grille" aria-label="Toutes les cartes"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="currentColor"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor"/></svg><span>${rang + 1} / ${ouvertes.length}</span></button>
  <button type="button" class="barre-fleche" data-a="suiv" aria-label="Carte suivante"${apres >= 0 ? '' : ' disabled'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
</nav>`;
      voisines = { avant, apres };
      const act = (a, f) => { const b = corps.querySelector(`[data-a="${a}"]`); if (b) b.onclick = f; };
      act('prec', () => { son('papier'); carte(avant); }); act('suiv', () => { son('papier'); carte(apres); });
      act('grille', grille);
      // Le livre : un toucher, la couverture s'ouvre, puis les pages ; une main vient le montrer si l'on hésite
      act('livre', () => {
        const b = corps.querySelector('.livre-ferme'); if (!b || b.classList.contains('ouvre')) return;
        son('page'); b.classList.add('ouvre'); clearTimeout(mainT);
        // Pendant que la couverture s'ouvre, les flèches et les glissements ne changent pas de carte
        vue = 'ouverture';
        if (RM) livre(0); else setTimeout(() => { if (fen.isConnected && vue === 'ouverture') livre(0); }, 850);
      });
      clearTimeout(mainT);
      if (c.livre) mainT = setTimeout(() => { const b = corps.querySelector('.livre-ferme'); if (b && vue === 'carte') b.classList.add('montre-main'); }, 3000);
      titreFocus();
    };
    let voisines = { avant: -1, apres: -1 }, mainT = null;
    // Les pages du livre : la couverture, les douze tableaux, la fin, puis la treizième scène
    const L = AR.livre, NB = L.tableaux.length + 3;
    const livre = p => {
      vue = 'livre'; page = Math.max(0, Math.min(NB - 1, p)); fen.classList.add('mode-livre');
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
      // Un livre ancien : parchemin, cadre enluminé, lettrine au début du texte, miniature dorée
      const ORDINAUX = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième', 'Sixième', 'Septième', 'Huitième', 'Neuvième', 'Dixième', 'Onzième', 'Douzième'];
      if (page >= 1 && page <= L.tableaux.length) titre = ORDINAUX[page - 1] + ' tableau';
      const avecLettrine = (t, k) => {
        const txt = T(t);
        if (k > 0 || !/^\p{L}/u.test(txt)) return `<p>${esc(txt)}</p>`;
        // La lettrine est décorative : le texte complet reste lu tel quel par les lecteurs d'écran
        return `<p class="avec-lettrine"><span class="lettrine" aria-hidden="true">${esc(txt[0])}</span><span class="visuellement-cache">${esc(txt[0])}</span>${esc(txt.slice(1))}</p>`;
      };
      corps.innerHTML = `<div class="livre-haut"><p class="carnet-chemin">Page ${page + 1} sur ${NB}</p><button type="button" class="btn btn-petit" data-a="grille">Toutes les cartes</button></div>
<article class="livre-ancien${sens ? ' ' + sens : ''}">
  <div class="livre-page">
    ${heure ? `<p class="livre-heure">${esc(heure)}</p>` : ''}<h2>${esc(titre)}</h2>
    <div class="livre-vignette"><svg viewBox="0 0 320 200" role="img" aria-label="${esc(titre)}">${dessin}</svg></div>
    <div class="livre-texte" aria-live="polite">${textes.map(avecLettrine).join('')}</div>
    ${page === 0 ? '<p class="livre-astuce">Fais glisser la page du bout du doigt pour la tourner.</p>' : ''}
    <p class="livre-folio" aria-hidden="true">— ${page + 1} —</p>
  </div>
</article>
<div class="carnet-pages livre-bas">${page > 0 ? '<button type="button" class="btn btn-petit" data-a="prec">◂ Précédente</button>' : ''}${page < NB - 1 ? `<button type="button" class="btn btn-or" data-a="suiv">${page === 0 ? 'Commencer ▸' : 'Suivante ▸'}</button>` : ''}</div>`;
      sens = '';
      const act = (a, f) => { const b = corps.querySelector(`[data-a="${a}"]`); if (b) b.onclick = f; };
      act('prec', () => tourner(-1)); act('suiv', () => tourner(1)); act('grille', grille);
      // Tourner la page en la faisant glisser du doigt (vers la gauche : page suivante)
      titreFocus();
    };
    // La page tourne (animation de feuille qui pivote, sauf si les animations sont réduites)
    let sens = '';
    const tourner = d => {
      const p = page + d;
      if (p < 0 || p > NB - 1) return;
      son('page'); sens = d > 0 ? 'vers-suivante' : 'vers-precedente';
      livre(p);
    };

    // Tourner la page en glissant du doigt (ou de la souris), depuis n'importe quel endroit de l'écran du livre
    let x0 = null, y0 = 0;
    const changerCarte = d => { const k = d > 0 ? voisines.apres : voisines.avant; if (k >= 0) { son('papier'); carte(k); } };
    const geste = (x, y) => {
      if (x0 == null || vue === 'grille' || vue === 'ouverture') { x0 = null; return; }
      const dx = x - x0, dy = y - y0; x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) { if (vue === 'livre') tourner(dx < 0 ? 1 : -1); else changerCarte(dx < 0 ? 1 : -1); }
    };
    fen.addEventListener('touchstart', e => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
    fen.addEventListener('touchend', e => { const t = e.changedTouches[0]; geste(t.clientX, t.clientY); });
    fen.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && !e.target.closest('button')) { x0 = e.clientX; y0 = e.clientY; } });
    fen.addEventListener('pointerup', e => { if (e.pointerType === 'mouse') geste(e.clientX, e.clientY); });
    const fermer = () => { clearTimeout(mainT); document.removeEventListener('keydown', clavier); fen.remove(); if (precedent && precedent.focus) try { precedent.focus({ preventScroll: true }); } catch (e) { } if (o.apres) o.apres(); };
    const clavier = e => {
      if (e.key === 'Escape') { e.preventDefault(); fermer(); return; }
      if (vue !== 'grille' && vue !== 'ouverture' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) {
        e.preventDefault(); const d = e.key === 'ArrowRight' ? 1 : -1;
        if (vue === 'livre') tourner(d); else changerCarte(d);
      }
    };
    document.addEventListener('keydown', clavier);
    fen.querySelector('[data-a="fermer"]').onclick = fermer;
    if (o.vue === 'livre') livre(0); else grille();
  }

  return { ouvrir, compte, apercu };
})();

export {};
