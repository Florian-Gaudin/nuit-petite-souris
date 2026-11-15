// La 13e scène : un petit théâtre de marionnettes à fils, au rez-de-chaussée d'une maison de la place Ducale.
// Le Grand Marionnettiste, à la fenêtre du dessus, tient les fils. Cinq tableaux : le salut de la troupe,
// la danse du doudou, le chat endormi, Bayard et les quatre chevaliers souris, puis le final (on applaudit).
// Tout se joue au doigt, à la souris ou au clavier ; les animations réduites sont respectées.
window.THEATRE = (function () {
  'use strict';
  const RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SOL = 495; // le plancher de la scène (repère du théâtre, avant le décalage dans la maison)
  const DECALAGE = 140; // le théâtre est posé dans la maison, sous la fenêtre du Grand Marionnettiste

  // ---------- Les marionnettes : chaque dessin a le point d'attache de son fil en 0,0 ----------
  function dessinDoudou(type) {
    if (!type || type === 'aucun') {
      // Pas de doudou : le petit pantin rouge et jaune de la place Ducale
      return `<circle cx="0" cy="18" r="16" fill="#FFC857"/><circle cx="-5" cy="16" r="2" fill="#2B2B33"/><circle cx="5" cy="16" r="2" fill="#2B2B33"/><path d="M-5 24q5 4 10 0" fill="none" stroke="#2B2B33" stroke-width="1.6" stroke-linecap="round"/>
<rect x="-13" y="34" width="26" height="38" rx="6" fill="#D64045"/><path d="M-13 42l-16 18M13 42l16 18M-7 72l-6 26M7 72l6 26" stroke="#FFC857" stroke-width="6" stroke-linecap="round"/>`;
    }
    const tete = window.DESSINS.doudouIcone(type).replace('<svg ', '<svg x="-34" y="-2" width="68" height="68" ');
    return `<path d="M-20 56q20-12 40 0l10 44h-60z" fill="#FFC857" stroke="#b9801a" stroke-width="2"/><path d="M-18 64l-18 16M18 64l18 16" stroke="#b9801a" stroke-width="5" stroke-linecap="round"/>${tete}`;
  }
  // Le chat couché, la tête à droite
  const dessinChat = () => `<g class="chat-m">
<path d="M-66 86q-36 4-30-28q3-14 15-11" fill="none" stroke="#C9833A" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="-10" cy="78" rx="60" ry="24" fill="#E8A552"/>
<path d="M-38 58q7 16 0 36M-18 55q7 18 0 42M2 56q6 16 0 38" fill="none" stroke="#C9833A" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="8" cy="100" rx="13" ry="6" fill="#E8A552"/><ellipse cx="34" cy="100" rx="13" ry="6" fill="#E8A552"/>
<path d="M30 50L33 27L47 41Z" fill="#E8A552"/><path d="M49 41L63 27L66 50Z" fill="#E8A552"/>
<path d="M33.5 45L35 33L42 40Z" fill="#F2A3B5"/><path d="M54 40L61 33L62.5 45Z" fill="#F2A3B5"/>
<circle cx="48" cy="62" r="24" fill="#E8A552"/>
<g class="yeux-fermes" fill="none" stroke="#2B2B33" stroke-width="2.4" stroke-linecap="round"><path class="f1" d="M37 61q5 4 10 0"/><path class="f2" d="M51 61q5 4 10 0"/></g>
<g class="yeux-ouverts"><g class="o1"><circle cx="42" cy="60" r="5.2" fill="#fff"/><ellipse cx="42.5" cy="60.5" rx="2" ry="3.4" fill="#2B2B33"/></g><g class="o2"><circle cx="56" cy="60" r="5.2" fill="#fff"/><ellipse cx="56.5" cy="60.5" rx="2" ry="3.4" fill="#2B2B33"/></g></g>
<path d="M45 68h6l-3 3.4z" fill="#E98BA0"/><path d="M48 71.4q-2.6 3-5.6 1.4M48 71.4q2.6 3 5.6 1.4" fill="none" stroke="#7a5a3a" stroke-width="1.4" stroke-linecap="round"/>
<path d="M36 69l-16-3M36 72l-16 2M60 69l16-3M60 72l16 2" stroke="#7a5a3a" stroke-width="1.2" stroke-linecap="round"/>
<text class="zzz" x="70" y="26" font-family="Baloo 2, sans-serif" font-weight="800" font-size="20" fill="#cfd3ee">z<tspan dx="2" dy="-8" font-size="15">z</tspan><tspan dx="2" dy="-7" font-size="11">z</tspan></text>
</g>`;
  const dessinDent = () => `<use href="#dent" x="-30" y="0" width="60" height="60"/>
<circle cx="-8" cy="22" r="2.6" fill="#2B2B33"/><circle cx="8" cy="22" r="2.6" fill="#2B2B33"/><path d="M-6 30q6 5 12 0" fill="none" stroke="#2B2B33" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="-14" cy="28" r="3" fill="#F2A3B5" opacity=".7"/><circle cx="14" cy="28" r="3" fill="#F2A3B5" opacity=".7"/>
<path d="M-22 30l-16 12M22 30l16 12M-8 56l-4 18M8 56l4 18" stroke="#cfd3ee" stroke-width="4" stroke-linecap="round"/>`;
  // Une souris en armure, tournée vers l'avant du cheval : casque à plumet (les oreilles dépassent), cuirasse, lance
  const chevalier = (x, plumet) => `<g class="chevalier" transform="translate(${x},0) scale(1.15)">
<path d="M-14 30q-16 6-11 19" fill="none" stroke="#A79E95" stroke-width="2.6" stroke-linecap="round"/>
<path d="M12 26l14-32" stroke="#8B5A3C" stroke-width="2.4" stroke-linecap="round"/><path d="M26-6l4-8 0 9z" fill="#e8e2ee"/>
<path d="M-12 12h24l4 22h-32z" fill="#b8bdcc" stroke="#6b7088" stroke-width="1.4"/><path d="M-8 20h16" stroke="#6b7088" stroke-width="1.2"/>
<circle cx="0" cy="0" r="12" fill="#A79E95"/>
<ellipse cx="9" cy="4" rx="8" ry="5.5" fill="#c7beb4"/><circle cx="16" cy="3" r="2.6" fill="#E98BA0"/><circle cx="4" cy="-1" r="2.2" fill="#2B2B33"/>
<path d="M13 6l10-2M13 8l10 2" stroke="#6B6560" stroke-width=".9" stroke-linecap="round"/>
<path d="M-10-3a10 9 0 0 1 20 0z" fill="#dfe2ee" stroke="#8a90a8" stroke-width="1.3"/>
<path d="M-1-11q-3-14 10-16q-5 7-3 15z" fill="${plumet}"/>
<circle cx="-11" cy="-9" r="7" fill="#A79E95"/><circle cx="-11" cy="-9" r="3.8" fill="#F2A3B5"/><circle cx="11" cy="-11" r="7" fill="#A79E95"/><circle cx="11" cy="-11" r="3.8" fill="#F2A3B5"/>
</g>`;
  const dessinBayard = () => `<g class="bayard-m" transform="scale(1.3)">
<path d="M-72 36q-36 6-34 50q10-18 30-30z" fill="#4a3222"/>
<g class="pattes" fill="#5c3c28"><rect class="p1" x="-56" y="70" width="13" height="58" rx="5"/><rect class="p2" x="-34" y="70" width="13" height="58" rx="5"/><rect class="p3" x="30" y="70" width="13" height="58" rx="5"/><rect class="p4" x="52" y="70" width="13" height="58" rx="5"/></g>
<g fill="#2a1a10"><rect x="-58" y="122" width="17" height="9" rx="2"/><rect x="-36" y="122" width="17" height="9" rx="2"/><rect x="28" y="122" width="17" height="9" rx="2"/><rect x="50" y="122" width="17" height="9" rx="2"/></g>
<ellipse cx="0" cy="58" rx="80" ry="32" fill="#6b4a33"/>
<path d="M54 44l34-46 26 10-18 54z" fill="#6b4a33"/>
<ellipse cx="112" cy="0" rx="30" ry="15" fill="#6b4a33" transform="rotate(28 112 0)"/>
<path d="M92-22l4-16 9 13z" fill="#5c3c28"/><circle cx="110" cy="-6" r="3" fill="#2B2B33"/><circle cx="128" cy="12" r="2" fill="#2B2B33"/>
<path d="M60 38q12-30 34-48q-8 22-14 52z" fill="#2a1a10"/>
<path d="M-50 40h96l-6 34h-84z" fill="#2b3470"/><path d="M-50 40h96" stroke="#C9A227" stroke-width="3"/><path d="M-44 74h84" stroke="#C9A227" stroke-width="3"/>
<g fill="#C9A227"><path d="M-30 50l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1z"/><path d="M14 50l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1z"/></g>
<g class="chevaliers" transform="translate(0,6)">${chevalier(-66, '#D64045')}${chevalier(-28, '#3E7C8F')}${chevalier(10, '#FFC857')}${chevalier(48, '#3E9A6B')}</g>
</g>`;
  const dessinChateau = () => `<g class="th-chateau">
<rect x="-64" y="-118" width="128" height="118" fill="#8a8395"/><rect x="-80" y="-158" width="38" height="158" fill="#9a93a5"/><rect x="42" y="-158" width="38" height="158" fill="#9a93a5"/>
<path d="M-80-158h8v-10h8v10h6v-10h8v10h8v-10h0M42-158h8v-10h8v10h6v-10h8v10h8v-10" fill="none" stroke="#9a93a5" stroke-width="8"/>
<path d="M-64-118h10v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10" fill="none" stroke="#8a8395" stroke-width="8"/>
<path d="M-18 0v-40a18 18 0 0 1 36 0v40z" fill="#5c3a24"/><rect x="-66" y="-120" width="22" height="30" rx="10" fill="#FFC857"/><rect x="44" y="-120" width="22" height="30" rx="10" fill="#FFC857"/>
<path d="M-61-168v-30l22 8-22 8" fill="#D64045" stroke="#5c5a6a" stroke-width="2"/><path d="M-61-168v-30" stroke="#5c5a6a" stroke-width="2"/>
<path d="M-130 0h260" stroke="#5c3a24" stroke-width="4"/>
</g>`;

  // ---------- La maison du Grand Marionnettiste (place Ducale) : sa tête dans la lucarne du toit d'ardoise,
  // l'horloge et ses volutes vert-de-gris, le grand cadre de cuivre, la façade de brique et de pierre ocre,
  // et, sous l'arche de pierre, ses deux grandes bottes dorées ----------
  function maison() {
    const H = 860, PIERRE = '#d9b77a', PIERRE2 = '#c9a466';
    let briques = '';
    for (let y = 312; y < 700; y += 13) briques += `<path d="M14 ${y}h572" stroke="#8f4030" stroke-width="1" opacity=".45"/>`;
    let chaines = '';
    for (let y = 312, i = 0; y < 690; y += 34, i++) {
      const l = i % 2 ? 24 : 38;
      chaines += `<rect x="14" y="${y}" width="${l}" height="30" fill="${PIERRE}"/><rect x="${586 - l}" y="${y}" width="${l}" height="30" fill="${PIERRE}"/>`;
    }
    let grille = '';
    for (let x = 222; x <= 378; x += 13) grille += `<path d="M${x} 725V842" stroke="#2b3250" stroke-width="3"/>`;
    const botte = x => `<path d="M${x - 18} 728h36l-4 84q16 4 20 22h-58q-2-14 10-20z" fill="#C9A227" stroke="#8a6a12" stroke-width="2"/><path d="M${x - 14} 740h28" stroke="#e8c96a" stroke-width="3" opacity=".7"/>`;
    return `<path d="M-10 300L70 130H530L610 300Z" fill="#4a4f6e"/><g stroke="#5b6182" stroke-width="1.4" opacity=".7">${[160, 190, 220, 250, 280].map(y => `<path d="M${-10 + (300 - y) * 0.47} ${y}H${610 - (300 - y) * 0.47}"/>`).join('')}</g>
<path d="M206 156L300 104L394 156Z" fill="#3c4566"/><rect x="216" y="150" width="168" height="152" fill="#e8dcc4"/><rect x="228" y="160" width="144" height="142" fill="#0d1030"/>
<rect x="14" y="300" width="572" height="400" fill="#b5563f"/>${briques}${chaines}
<rect x="8" y="296" width="584" height="14" fill="${PIERRE}"/>
<rect x="14" y="690" width="572" height="152" fill="${PIERRE}"/><g stroke="${PIERRE2}" stroke-width="2">${[730, 770, 810].map(y => `<path d="M14 ${y}h572"/>`).join('')}</g>
<path d="M190 842V760a110 72 0 0 1 220 0v82z" fill="${PIERRE2}"/><path d="M206 842V764a94 60 0 0 1 188 0v78z" fill="#0d1030"/>
${botte(268)}${botte(332)}${grille}<path d="M206 790h188" stroke="#2b3250" stroke-width="3"/>
<rect x="0" y="842" width="600" height="${H - 842}" fill="#4d4a5a"/>`;
  }

  // ---------- Le théâtre : le Grand Marionnettiste à sa fenêtre, ses deux croix de bois, la scène et son rideau ----------
  function svgTheatre(C, affiche) {
    let feux = '';
    for (let x = 90; x <= 510; x += 30) feux += `<circle cx="${x}" cy="530" r="5" fill="#FFC857"/>`;
    let lambrequin = 'M70 235';
    for (let x = 70; x < 530; x += 23) lambrequin += `h23q-11.5 20-23 0h23`;
    return `<svg class="th-svg" viewBox="0 0 600 860" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Un petit théâtre de marionnettes dans une maison de la place Ducale : le Grand Marionnettiste tient les fils de sa troupe">
<defs>
  <linearGradient id="th-velours" x1="0" x2="46" gradientUnits="userSpaceOnUse" spreadMethod="repeat"><stop offset="0" stop-color="#D64045"/><stop offset=".5" stop-color="#a8303a"/><stop offset="1" stop-color="#D64045"/></linearGradient>
  <clipPath id="th-ouverture"><rect x="70" y="235" width="460" height="280"/></clipPath>
  <radialGradient id="th-projo" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFC857" stop-opacity=".28"/><stop offset="1" stop-color="#FFC857" stop-opacity="0"/></radialGradient>
</defs>
<rect width="600" height="860" fill="#10163a"/>${window.ART.etoiles(30, 600, 140, 1307)}
${maison()}
<g transform="translate(0,${DECALAGE})">
<rect x="70" y="235" width="460" height="260" fill="#1b2250"/>${window.ART.etoiles(30, 460, 260, 1313).replace(/cx="(\d+)"/g, (m, x) => `cx="${+x + 70}"`).replace(/cy="(\d+)"/g, (m, y) => `cy="${+y + 235}"`)}
<circle cx="440" cy="290" r="22" fill="#F3EFE6" opacity=".9"/><circle cx="450" cy="284" r="20" fill="#1b2250"/>
<path d="M70 470q60-30 120-8t120-6 110 4 110-10v45H70z" fill="#141a40"/>
<rect x="70" y="${SOL}" width="460" height="20" fill="#6b4a33"/><path d="M70 ${SOL + 7}h460M70 ${SOL + 14}h460" stroke="#4a3222" stroke-width="1.5"/>
<rect x="70" y="235" width="460" height="260" fill="url(#th-projo)"/>
<g clip-path="url(#th-ouverture)">
<g class="th-decor-chateau" transform="translate(452,${SOL})">${dessinChateau()}</g>
<g class="th-troupe">
  <g class="marionnette" data-p="souris"><g class="corps">${window.ART.souris(-50, -6, 100)}</g></g>
  <g class="marionnette" data-p="doudou"><g class="corps">${dessinDoudou(C.profil && C.profil.doudou && C.profil.doudou.type)}</g></g>
  <g class="marionnette" data-p="chat"><g class="corps">${dessinChat()}</g></g>
  <g class="marionnette" data-p="dent"><g class="corps">${dessinDent()}</g></g>
  <g class="marionnette" data-p="bayard"><g class="corps">${dessinBayard()}</g></g>
</g>
<g class="th-flottants"></g>
<rect class="th-rideau g" x="70" y="235" width="232" height="280" fill="url(#th-velours)"/><rect class="th-rideau d" x="298" y="235" width="232" height="280" fill="url(#th-velours)"/>
</g>
<path d="M40 205h520v345H40zM70 235v280h460V235z" fill="#2a8c7e" fill-rule="evenodd"/><path d="M40 205h520v345H40z" fill="none" stroke="#1d6157" stroke-width="4"/><path d="M52 217h496v321H52z" fill="none" stroke="#4fb8a6" stroke-width="2" opacity=".55"/><path d="M70 235v280h460V235z" fill="none" stroke="#1d6157" stroke-width="4"/>
<path d="${lambrequin}V235z" fill="#9a2a32"/><path d="M70 235h460v8H70z" fill="#9a2a32"/>
<text class="th-affiche" x="300" y="226" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="15" fill="#FFF6E0">${esc(affiche)}</text>
<g class="th-feux">${feux}</g>
<g class="th-geant">
  <g class="horloge" transform="translate(0,-14)"><path d="M300 196q-40-24-78-4q-14 8-6 18q8 8 16-2q10-10 26-2q20 10 42 14zM300 196q40-24 78-4q14 8 6 18q-8 8-16-2q-10-10-26-2q-20 10-42 14z" fill="#2a8c7e" stroke="#1d6157" stroke-width="2"/>
  <circle cx="300" cy="182" r="21" fill="#2a8c7e" stroke="#1d6157" stroke-width="2"/><circle cx="300" cy="182" r="16" fill="#F3EFE6"/><path d="M300 182v-11M300 182l8 4" stroke="#2B2B33" stroke-width="2" stroke-linecap="round"/></g>
  <path class="bras g" d="M236 158L150 170" stroke="#2b3470" stroke-width="22" stroke-linecap="round"/><path class="bras d" d="M364 158L450 170" stroke="#2b3470" stroke-width="22" stroke-linecap="round"/>
  <g class="tete">
    <circle cx="300" cy="92" r="52" fill="#F3EFE6"/>
    <path d="M246 74q4-46 54-50q50 4 54 50q-24-14-54-12q-30-2-54 12z" fill="#9a2a32"/><circle cx="300" cy="24" r="6" fill="#9a2a32"/>
    <circle class="joue" cx="266" cy="108" r="9" fill="#F2A3B5" opacity=".6"/><circle class="joue" cx="334" cy="108" r="9" fill="#F2A3B5" opacity=".6"/>
    <path d="M270 70q10-6 20 0M310 70q10-6 20 0" fill="none" stroke="#6B4A33" stroke-width="3" stroke-linecap="round"/>
    <circle cx="280" cy="86" r="11" fill="#fff"/><circle cx="320" cy="86" r="11" fill="#fff"/>
    <g class="pupilles"><circle cx="280" cy="88" r="5.5" fill="#2B2B33"/><circle cx="320" cy="88" r="5.5" fill="#2B2B33"/></g>
    <path d="M300 92q-4 10 0 14" fill="none" stroke="#c9b9a6" stroke-width="3" stroke-linecap="round"/>
    <ellipse class="bouche" cx="300" cy="126" rx="10" ry="5" fill="#7a2a32"/>
    <path d="M300 112q-14-6-30 2q-10 6-18-2q4 14 20 14q18 0 28-10q10 10 28 10q16 0 20-14q-8 8-18 2q-16-8-30-2z" fill="#6B4A33"/>
  </g>
  <g class="croix g"><circle class="main" cx="0" cy="0" r="13" fill="#F3EFE6"/><rect x="-46" y="2" width="92" height="9" rx="4" fill="#8B5A3C"/><rect x="-5" y="-12" width="10" height="34" rx="4" fill="#8B5A3C"/></g>
  <g class="croix d"><circle class="main" cx="0" cy="0" r="13" fill="#F3EFE6"/><rect x="-46" y="2" width="92" height="9" rx="4" fill="#8B5A3C"/><rect x="-5" y="-12" width="10" height="34" rx="4" fill="#8B5A3C"/></g>
</g>
<g class="th-fils" stroke="#e8e2ee" stroke-width="1.2" opacity=".85"></g>
<g class="th-bulles"></g>
</g>
</svg>`;
  }

  // ---------- Les figures de la danse : chacune son mouvement et sa musique ----------
  // f(k) avec k de 0 à 1 : décalage (dx, dy), rotation, étirement (sx, sy)
  const FIGURES = [
    { id: 'saut', duree: 650, son: 'ressort', f: k => ({ dy: -95 * Math.sin(Math.PI * k) }) },
    { id: 'pirouette', duree: 800, son: 'harpe', f: k => ({ dy: -22 * Math.sin(Math.PI * k), rot: 360 * k }) },
    { id: 'salto', duree: 900, son: 'tambour', f: k => ({ dy: -120 * Math.sin(Math.PI * k), rot: -360 * k }) },
    { id: 'ecart', duree: 900, son: 'contrebasse', f: k => { const s = Math.sin(Math.PI * k); return { dy: 14 * s, sx: 1 + 0.45 * s, sy: 1 - 0.3 * s }; } },
    { id: 'balancier', duree: 1200, son: 'flute', f: k => { const s = Math.sin(2 * Math.PI * k); return { dx: 60 * s, rot: 22 * s }; } },
    { id: 'envol', duree: 1500, son: 'harpe', f: k => { const s = Math.sin(Math.PI * k); return { dy: -150 * s, rot: 10 * Math.sin(4 * Math.PI * k), sx: 1 + 0.1 * s, sy: 1 + 0.1 * s }; } },
    { id: 'toupie', duree: 900, son: 'tambour', f: k => ({ rot: 720 * k, sx: 1 - 0.15 * Math.sin(Math.PI * k) }) },
  ];

  // ---------- Le spectacle ----------
  function ouvrir(o) {
    const T = o.T, D = window.DATA.theatre, C = window.CONFIG, SON = window.SON, MUS = window.MUSIQUE;
    const son = n => { if (SON) SON.play(n); };
    const avantMusique = MUS && MUS.ambianceCourante;
    const precedent = document.activeElement;
    const v = document.createElement('div');
    v.className = 'theatre';
    v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'La treizième scène du Grand Marionnettiste');
    v.innerHTML = `<button type="button" class="th-quitter">${esc(D.boutons.quitter)} ✕</button>
<div class="th-scene">${svgTheatre(C, T(D.affiche))}</div>
<div class="th-bas"><p class="th-qui"></p><p class="th-txt" aria-live="polite"></p><div class="th-actions"></div></div>`;
    document.body.appendChild(v);
    const $ = (s, r) => (r || v).querySelector(s);
    const svg = $('.th-svg'), filsG = $('.th-fils'), flottants = $('.th-flottants'), bulles = $('.th-bulles');
    const croix = { g: { el: $('.croix.g'), x: 150, y: 178, dy: 0 }, d: { el: $('.croix.d'), x: 450, y: 178, dy: 0 } };
    const bras = { g: $('.bras.g'), d: $('.bras.d') };
    let ouvert = true, raf = 0, focusX = 300, parleT = 0;
    const minuteurs = [];
    const plus = (fn, ms) => { const t = setTimeout(() => { if (ouvert) fn(); }, RM ? Math.min(ms, 120) : ms); minuteurs.push(t); return t; };

    // Les marionnettes et leurs fils (Bayard, plus lourd, en a deux)
    const P = {};
    [['souris', 'g', 420], ['doudou', 'g', 395], ['chat', 'd', 393], ['dent', 'd', 420], ['bayard', '2', SOL - 170]].forEach(([id, c, y], i) => {
      const el = $(`.marionnette[data-p="${id}"]`);
      const fils = (c === '2' ? ['g', 'd'] : [c]).map(cr => { const l = document.createElementNS(NS, 'line'); filsG.appendChild(l); return { cr, l }; });
      P[id] = { id, el, corps: el.querySelector('.corps'), fils, x: 300, y, tx: 300, ty: y, vis: false, salut: -1e9, cabre: -1e9, anim: null, phase: i * 1.7, ox: 0, oy: 0 };
    });
    const place = (id, x, vis, y) => { const p = P[id]; p.tx = x; if (y != null) p.ty = y; if (vis != null) { if (vis && !p.vis) { p.x = x; if (y != null) p.y = y; } p.vis = vis; } };

    // ---------- La boucle : balancement, figures, saluts, fils tendus ----------
    let avant = performance.now();
    const boucle = now => {
      if (!ouvert) return;
      const dt = Math.min(0.05, (now - avant) / 1000); avant = now;
      for (const id in P) {
        const p = P[id];
        const k = RM ? 1 : Math.min(1, dt * (p.vitesse || 3));
        p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k;
        let dx = 0, oy = 0, rot = 0, sx = 1, sy = 1;
        if (!RM) { oy = Math.sin(now / 520 + p.phase) * 2.5; rot = Math.sin(now / 760 + p.phase) * 2.5; }
        // La révérence : on se penche bien bas, puis on se relève
        const ts = now - p.salut; if (ts < 1000) { const s = Math.sin(Math.PI * ts / 1000); rot -= 40 * s; oy += 20 * s; }
        const tc = now - p.cabre; if (tc < 900) { const s = Math.sin(Math.PI * tc / 900); rot -= 16 * s; oy -= 10 * s; }
        if (p.anim) {
          const ka = (now - p.anim.t0) / p.anim.duree;
          if (ka >= 1) p.anim = null;
          else if (!RM) { const r = p.anim.f(ka); dx += r.dx || 0; oy += r.dy || 0; rot += r.rot || 0; sx *= r.sx || 1; sy *= r.sy || 1; }
        }
        if (p.bosse) oy -= p.bosse;
        p.el.setAttribute('transform', `translate(${(p.x + dx).toFixed(1)},${(p.y + oy).toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sx.toFixed(3)},${sy.toFixed(3)})`);
        p.el.style.opacity = p.vis ? '1' : '0';
        p.el.style.pointerEvents = p.vis ? '' : 'none'; // une marionnette cachée ne gêne pas les autres
        p.ox = p.x + dx; p.oy = p.y + oy;
      }
      // Les mains suivent les fils tirés (et respirent un peu)
      for (const c of ['g', 'd']) {
        const cr = croix[c], sway = RM ? 0 : Math.sin(now / 900 + (c === 'g' ? 0 : 2)) * 3;
        const y = cr.y + cr.dy + sway;
        cr.el.setAttribute('transform', `translate(${cr.x},${y.toFixed(1)}) rotate(${(sway * 1.5).toFixed(1)})`);
        bras[c].setAttribute('d', `M${c === 'g' ? 236 : 364} 158L${cr.x} ${y.toFixed(1)}`);
        cr.yc = y;
      }
      for (const id in P) {
        const p = P[id], deux = p.fils.length > 1;
        p.fils.forEach((f, i) => {
          const cr = croix[f.cr];
          const bout = cr.x + (p.ox < cr.x ? -42 : 42) * (deux ? 0.3 : 1);
          f.l.setAttribute('x1', bout.toFixed(1)); f.l.setAttribute('y1', (cr.yc + 6).toFixed(1));
          f.l.setAttribute('x2', (p.ox + (deux ? (i ? 52 : -52) : 0)).toFixed(1)); f.l.setAttribute('y2', (p.oy + (deux ? 44 : 0)).toFixed(1));
          f.l.style.opacity = p.vis ? '1' : '0';
        });
      }
      // Le Grand Marionnettiste regarde l'action, et parle
      const px = Math.max(-6, Math.min(6, (focusX - 300) / 40));
      $('.pupilles').setAttribute('transform', `translate(${px.toFixed(1)},0)`);
      svg.classList.toggle('parle', now < parleT);
      raf = requestAnimationFrame(boucle);
    };
    raf = requestAnimationFrame(boucle);

    // ---------- Le texte, les boutons, les bulles et les petits mots qui s'envolent ----------
    const dire = (txt, qui) => {
      $('.th-qui').textContent = qui === undefined ? D.marionnettiste : qui;
      $('.th-txt').textContent = txt;
      if (qui === undefined) parleT = performance.now() + Math.min(3200, 600 + txt.length * 28);
    };
    // Les boutons du spectacle ne font pas de « clic » : seuls les sons du théâtre
    const actions = liste => {
      const z = $('.th-actions'); z.innerHTML = '';
      liste.forEach(a => {
        const b = document.createElement('button'); b.type = 'button';
        b.className = 'btn ' + (a.cls || 'btn-or'); b.textContent = a.txt; if (a.id) b.id = a.id;
        b.onclick = () => a.fn(b);
        z.appendChild(b);
      });
      const premier = z.querySelector('button, input'); if (premier) premier.focus({ preventScroll: true });
    };
    const flotte = (txt, x, y, cls) => {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'th-flotte ' + (cls || '')); t.textContent = txt;
      flottants.appendChild(t); setTimeout(() => t.remove(), 1700);
    };
    // Une bulle de parole au-dessus d'une marionnette
    const bulle = (txt, x, y) => {
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'th-bulle');
      const larg = Math.max(70, txt.length * 8.6 + 24), bx = Math.max(50 + larg / 2, Math.min(550 - larg / 2, x));
      g.innerHTML = `<rect x="${bx - larg / 2}" y="${y - 40}" width="${larg}" height="32" rx="14" fill="#FFF6E0" stroke="#C9A227" stroke-width="2"/><path d="M${x - 7} ${y - 9}l7 12 7-12z" fill="#FFF6E0"/><text x="${bx}" y="${y - 19}" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="15" fill="#1F2235">${esc(txt)}</text>`;
      bulles.appendChild(g); setTimeout(() => g.remove(), RM ? 1800 : 2300);
    };
    const suite = fn => actions([{ txt: D.boutons.suite + ' ▸', fn }]);
    // Une marionnette qu'on peut toucher (ou activer au clavier)
    const touchable = (id, label, fn) => {
      const el = P[id].el;
      el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', label);
      el.classList.add('touchable');
      el.onclick = e => { e.stopPropagation(); fn(); };
      el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
    };
    const plusTouchable = id => { const el = P[id].el; ['role', 'tabindex', 'aria-label'].forEach(a => el.removeAttribute(a)); el.classList.remove('touchable', 'salue-ok'); el.onclick = el.onkeydown = null; };
    const chat = $('.chat-m');

    // ---------- 0. Les trois coups ont été frappés : le rideau s'ouvre ----------
    const lever = () => {
      place('souris', 140, true); place('doudou', 240, true); place('chat', 362, true); place('dent', 462, true);
      chat.classList.add('eveille');
      if (MUS) MUS.ambiance('theatre');
      plus(() => { svg.classList.add('ouvert'); son('applaudir'); }, 500);
      dire(T(D.ouverture));
      plus(() => suite(salut), 400);
    };

    // ---------- 1. Le salut de la troupe : chaque marionnette fait sa révérence et dit bonsoir ----------
    const salut = () => {
      actions([]);
      const noms = { souris: C.souris, doudou: C.poupee || D.pantin, chat: D.chat, dent: D.dent };
      const vus = new Set();
      const reste = () => { const n = 4 - vus.size; dire(n === 4 ? T(D.salut) : n > 1 ? D.salutReste.replace('{n}', n) : D.salutDernier); };
      reste();
      ['souris', 'doudou', 'chat', 'dent'].forEach(id => touchable(id, 'Saluer ' + noms[id], () => {
        const p = P[id]; p.salut = performance.now(); focusX = p.x;
        son('bois');
        bulle(T(D.saluts[id]), p.x, id === 'chat' ? p.y + 20 : p.y - 6);
        p.el.classList.add('salue-ok');
        if (vus.has(id)) return;
        vus.add(id); reste();
        if (vus.size === 4) plus(() => { dire(T(D.salutFini)); son('accord'); suite(danse); }, 900);
      }));
      P.souris.el.focus({ preventScroll: true });
    };

    // ---------- 2. La danse du doudou : à chaque fil tiré, une figure différente ----------
    const danse = () => {
      ['souris', 'doudou', 'chat', 'dent'].forEach(plusTouchable);
      place('souris', 140, false); place('chat', 362, false); place('dent', 462, false); place('doudou', 300, true);
      focusX = 300;
      dire(T(D.danse));
      const ordre = FIGURES.slice().sort(() => Math.random() - 0.5).slice(0, 5);
      let n = 0, occupe = false;
      const tirer = () => {
        if (n >= 5 || occupe) return;
        const fig = ordre[n++];
        occupe = true; plus(() => { occupe = false; }, Math.min(fig.duree, 700));
        P.doudou.anim = { f: fig.f, duree: fig.duree, t0: performance.now() };
        croix.g.dy = -40; plus(() => { croix.g.dy = 0; }, 320);
        son(fig.son);
        flotte('★', 300 + (Math.random() * 140 - 70), 300, 'etoile');
        if (n < 5) dire(D.figures[fig.id] + ' ' + D.danseEncore[(n - 1) % D.danseEncore.length]);
        else plus(() => { dire(T(D.danseBravo)); son('applaudir'); suite(chatDort); svg.onpointerdown = svg.onpointermove = null; }, fig.duree);
      };
      actions([{ txt: '▲ ' + D.boutons.fil, fn: tirer }]);
      // Au doigt : on tire le fil vers le haut, n'importe où sur la scène
      let depart = null;
      svg.onpointerdown = e => { depart = e.clientY; };
      svg.onpointermove = e => { if (depart != null && depart - e.clientY > 40) { depart = null; tirer(); } };
      svg.onpointerup = svg.onpointercancel = () => { depart = null; };
    };

    // ---------- 3. Le chat endormi : tirer le fil tout doucement ----------
    const chatDort = () => {
      svg.onpointerdown = svg.onpointermove = null;
      place('doudou', 300, false); place('souris', 110, true); place('chat', 330, true);
      chat.classList.remove('eveille', 'oeil');
      P.souris.vitesse = 8;
      dire(T(D.chatTableau));
      const z = $('.th-actions'); z.innerHTML = '';
      const lab = document.createElement('label'); lab.className = 'th-fil';
      lab.innerHTML = `<span>${esc(D.boutons.filQuenotte)}</span><input type="range" min="0" max="100" step="2" value="0">`;
      z.appendChild(lab);
      const r = lab.querySelector('input'); r.focus({ preventScroll: true });
      let histoire = [{ v: 0, t: performance.now() }], reveil = false, fini = false;
      const avance = val => {
        const x = 110 + (val / 100) * 410;
        place('souris', x);
        P.souris.bosse = Math.max(0, 1 - Math.abs(x - 330) / 110) * 46; // sur la pointe des pattes, par-dessus le chat
        focusX = x;
      };
      r.oninput = () => {
        if (fini) return;
        const val = +r.value, now = performance.now();
        if (reveil) { r.value = String(histoire[histoire.length - 1].v); return; }
        histoire = histoire.filter(h => now - h.t < 350);
        const mini = Math.min(...histoire.map(h => h.v));
        histoire.push({ v: val, t: now });
        if (val - mini > 16) {
          // Trop vite : le chat ouvre un œil, la salle rit, Quenotte recule un peu
          reveil = true; chat.classList.add('oeil');
          son('oh'); plus(() => son('rires'), 450);
          flotte(D.rires, 300, 470, 'rire');
          dire(T(D.chatReveil));
          const recule = Math.max(0, val - 26); r.value = String(recule); avance(recule);
          histoire = [{ v: recule, t: now }];
          plus(() => { chat.classList.remove('oeil'); reveil = false; histoire = [{ v: +r.value, t: performance.now() }]; dire(T(D.chatEncore)); }, 1400);
          return;
        }
        avance(val);
        if (val % 10 === 0) son('pointe');
        if (val >= 100) {
          fini = true; P.souris.bosse = 0;
          dire(T(D.chatOuf)); son('applaudir');
          plus(() => suite(bayard), 500);
        }
      };
    };

    // ---------- 4. Bayard et les quatre chevaliers souris ----------
    const bayard = () => {
      place('souris', 520, false); place('chat', 330, false);
      P.souris.vitesse = 3;
      dire(T(D.bayard));
      // Le temps de lire : Bayard n'entre en scène qu'après « Suite »
      suite(() => {
        actions([]);
        const b = P.bayard; b.x = -190; b.tx = -190; b.vis = true; b.vitesse = 1.3;
        dire(T(D.bayardArrive));
        plus(() => {
          place('bayard', 300); focusX = 300;
          svg.classList.add('galop');
          let n = 0; const galop = () => { son('galop'); if (++n < 5) plus(galop, 480); };
          galop();
          plus(() => {
            svg.classList.remove('galop');
            son('hennir');
            dire(T(D.bayardFin));
            touchable('bayard', 'Bayard', () => { b.cabre = performance.now(); svg.classList.remove('salue'); void svg.getBBox(); svg.classList.add('salue'); son('hennir'); });
            suite(final);
          }, 2600);
        }, 300);
      });
    };

    // ---------- 5. Le final : la dent monte au château, et on applaudit ----------
    const final = () => {
      plusTouchable('bayard');
      const b = P.bayard; b.tx = 800; b.vitesse = 1.6;
      plus(() => { b.vis = false; }, 1600);
      svg.classList.add('final');
      place('souris', 110, true); place('doudou', 200, true); place('chat', 292, true);
      chat.classList.add('eveille');
      place('dent', 384, true, 420); P.dent.vitesse = 1.8;
      focusX = 384;
      dire(T(D.final));
      // Le temps de lire : la dent grimpe après « Suite »
      suite(() => {
        actions([]);
        plus(() => { place('dent', 452, null, 300); focusX = 452; son('harpe'); }, 100);
        plus(() => { place('dent', 452, null, 262); son('accord'); applaudir(); }, 1600);
      });
    };
    // Les applaudissements : plus on applaudit, plus la salle s'enflamme (sifflets, rires, hourras)
    const applaudir = () => {
      dire(T(D.applaudir));
      let n = 0;
      const clap = () => {
        n++;
        son('applaudir');
        if (n >= 2) plus(() => son('sifflet'), 150);
        if (n >= 3) plus(() => son('hourra'), 260);
        if (n >= 4) son('foule');
        if (n >= 5) plus(() => son('rires'), 420);
        if (n >= 6) plus(() => son('sifflet'), 520);
        ['souris', 'doudou', 'chat', 'dent'].forEach((id, i) => { setTimeout(() => { P[id].salut = performance.now(); }, RM ? 0 : i * 90); });
        const cris = D.cris;
        for (let i = 0; i < Math.min(4, 1 + Math.floor(n / 2)); i++) setTimeout(() => flotte(cris[Math.floor(Math.random() * cris.length)], 110 + Math.random() * 380, 470 - Math.random() * 60, 'cri'), RM ? 0 : i * 160);
        const encouragement = D.encouragements[n - 1];
        if (encouragement) dire(T(encouragement));
        if (n === 3) actions([{ txt: '👏 ' + D.boutons.applaudir, id: 'th-clap', fn: clap }, { txt: D.boutons.fermer, cls: 'btn-or', id: 'th-fermer', fn: () => fermer(true) }]);
        if (n === D.encouragements.length + 1) { svg.classList.add('ravi'); dire(T(D.merci)); }
      };
      actions([{ txt: '👏 ' + D.boutons.applaudir, id: 'th-clap', fn: clap }]);
      svg.onclick = () => { if ($('#th-clap')) clap(); };
    };

    // ---------- Fermer le rideau ----------
    const fermer = (fini) => {
      if (!ouvert) return;
      svg.onclick = null;
      svg.classList.remove('ouvert');
      actions([]);
      document.removeEventListener('keydown', clavier);
      setTimeout(() => {
        ouvert = false; cancelAnimationFrame(raf); minuteurs.forEach(clearTimeout);
        v.classList.add('part');
        setTimeout(() => v.remove(), RM ? 0 : 400);
        if (MUS && avantMusique) MUS.ambiance(avantMusique);
        if (precedent && precedent.focus) try { precedent.focus({ preventScroll: true }); } catch (e) { }
        if (fini && o.fin) o.fin();
      }, RM ? 50 : 1000);
    };
    const clavier = e => { if (e.key === 'Escape') fermer(false); };
    document.addEventListener('keydown', clavier);
    $('.th-quitter').onclick = () => fermer(false);

    requestAnimationFrame(() => v.classList.add('on'));
    lever();
  }

  return { ouvrir };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
