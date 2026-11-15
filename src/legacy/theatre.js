// La 13e scène : un petit théâtre de marionnettes à fils, tenu par le Grand Marionnettiste.
// Cinq tableaux : le salut de la troupe, la danse du doudou, le chat endormi, Bayard et les quatre
// chevaliers souris, puis le final (la dent monte au château, on applaudit).
// Tout se joue au doigt, à la souris ou au clavier ; les animations réduites sont respectées.
window.THEATRE = (function () {
  'use strict';
  const RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SOL = 495; // le plancher de la scène

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
  const dessinChat = () => `<g class="chat-m">
<path d="M-72 82q-32-6-22-42" fill="none" stroke="#C9833A" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="-12" cy="78" rx="62" ry="24" fill="#E8A552"/>
<path d="M-40 60q6 14 0 34M-20 56q6 16 0 40M0 56q6 16 0 40" fill="none" stroke="#C9833A" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="18" cy="100" rx="12" ry="6" fill="#E8A552"/><ellipse cx="-36" cy="100" rx="12" ry="6" fill="#E8A552"/>
<path d="M28 46l3-24 16 15zM52 40l15-17 4 23z" fill="#E8A552"/><path d="M32 40l2-11 7 7zM56 36l7-8 2 11z" fill="#F2A3B5"/>
<circle cx="46" cy="60" r="25" fill="#E8A552"/>
<g class="yeux-fermes" fill="none" stroke="#2B2B33" stroke-width="2.4" stroke-linecap="round"><path class="f1" d="M33 58q5 4 10 0"/><path class="f2" d="M50 56q5 4 10 0"/></g>
<g class="yeux-ouverts"><g class="o1"><circle cx="38" cy="57" r="5" fill="#fff"/><circle cx="39" cy="58" r="2.6" fill="#2B2B33"/></g><g class="o2"><circle cx="55" cy="55" r="5" fill="#fff"/><circle cx="56" cy="56" r="2.6" fill="#2B2B33"/></g></g>
<path d="M44 66h6l-3 3z" fill="#F2A3B5"/><path d="M30 68l-14-2M30 72l-14 3M62 66l14-3M62 70l14 1" stroke="#7a5a3a" stroke-width="1.2"/>
<text class="zzz" x="66" y="22" font-family="Baloo 2, sans-serif" font-weight="800" font-size="20" fill="#cfd3ee">z<tspan dx="2" dy="-8" font-size="15">z</tspan><tspan dx="2" dy="-7" font-size="11">z</tspan></text>
</g>`;
  const dessinDent = () => `<use href="#dent" x="-30" y="0" width="60" height="60"/>
<circle cx="-8" cy="22" r="2.6" fill="#2B2B33"/><circle cx="8" cy="22" r="2.6" fill="#2B2B33"/><path d="M-6 30q6 5 12 0" fill="none" stroke="#2B2B33" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="-14" cy="28" r="3" fill="#F2A3B5" opacity=".7"/><circle cx="14" cy="28" r="3" fill="#F2A3B5" opacity=".7"/>
<path d="M-22 30l-16 12M22 30l16 12M-8 56l-4 18M8 56l4 18" stroke="#cfd3ee" stroke-width="4" stroke-linecap="round"/>`;
  // Une souris en armure : casque à plumet, cuirasse, petite lance
  const chevalier = (x, plumet) => `<g class="chevalier" transform="translate(${x},0)">
<path d="M10 34l26-46" stroke="#8B5A3C" stroke-width="2.4" stroke-linecap="round"/><path d="M36-12l4-8 1 9z" fill="#cfd3ee"/>
<path d="M-11 18h22l3 18h-28z" fill="#9aa0b5" stroke="#6b7088" stroke-width="1.2"/>
<circle cx="-9" cy="-2" r="5" fill="#A79E95"/><circle cx="9" cy="-2" r="5" fill="#A79E95"/><circle cx="-9" cy="-2" r="2.4" fill="#F2A3B5"/><circle cx="9" cy="-2" r="2.4" fill="#F2A3B5"/>
<circle cx="0" cy="8" r="10" fill="#A79E95"/><circle cx="-3.5" cy="8" r="1.6" fill="#2B2B33"/><circle cx="3.5" cy="8" r="1.6" fill="#2B2B33"/><circle cx="0" cy="12" r="1.6" fill="#E98BA0"/>
<path d="M-11 6a11 11 0 0 1 22 0v2h-22z" fill="#cfd3ee" stroke="#8a90a8" stroke-width="1.2"/><path d="M0-5v13" stroke="#8a90a8" stroke-width="1.2"/>
<path d="M0-5q-2-14 10-16q-4 6-2 14z" fill="${plumet}"/>
</g>`;
  const dessinBayard = () => `<g class="bayard-m">
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
<g class="chevaliers" transform="translate(0,4)">${chevalier(-48, '#D64045')}${chevalier(-20, '#3E7C8F')}${chevalier(8, '#FFC857')}${chevalier(36, '#3E9A6B')}</g>
</g>`;
  const dessinChateau = () => `<g class="th-chateau">
<rect x="-64" y="-118" width="128" height="118" fill="#8a8395"/><rect x="-80" y="-158" width="38" height="158" fill="#9a93a5"/><rect x="42" y="-158" width="38" height="158" fill="#9a93a5"/>
<path d="M-80-158h8v-10h8v10h6v-10h8v10h8v-10h0M42-158h8v-10h8v10h6v-10h8v10h8v-10" fill="none" stroke="#9a93a5" stroke-width="8"/>
<path d="M-64-118h10v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10" fill="none" stroke="#8a8395" stroke-width="8"/>
<path d="M-18 0v-40a18 18 0 0 1 36 0v40z" fill="#5c3a24"/><rect x="-66" y="-120" width="22" height="30" rx="10" fill="#FFC857"/><rect x="44" y="-120" width="22" height="30" rx="10" fill="#FFC857"/>
<path d="M-61-168v-30l22 8-22 8" fill="#D64045" stroke="#5c5a6a" stroke-width="2"/><path d="M-61-168v-30" stroke="#5c5a6a" stroke-width="2"/>
<path d="M-130 0h260" stroke="#5c3a24" stroke-width="4"/>
</g>`;

  // ---------- Le théâtre : le Grand Marionnettiste en haut, ses deux croix de bois, la scène et son rideau ----------
  function svgTheatre(C, affiche) {
    let feux = '';
    for (let x = 90; x <= 510; x += 30) feux += `<circle cx="${x}" cy="530" r="5" fill="#FFC857"/>`;
    let lambrequin = 'M70 235';
    for (let x = 70; x < 530; x += 23) lambrequin += `h23q-11.5 20-23 0h23`;
    return `<svg class="th-svg" viewBox="0 0 600 560" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Un petit théâtre de marionnettes : le Grand Marionnettiste tient les fils de sa troupe">
<defs>
  <linearGradient id="th-velours" x1="0" x2="46" gradientUnits="userSpaceOnUse" spreadMethod="repeat"><stop offset="0" stop-color="#D64045"/><stop offset=".5" stop-color="#a8303a"/><stop offset="1" stop-color="#D64045"/></linearGradient>
  <clipPath id="th-ouverture"><rect x="70" y="235" width="460" height="280"/></clipPath>
  <radialGradient id="th-projo" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFC857" stop-opacity=".28"/><stop offset="1" stop-color="#FFC857" stop-opacity="0"/></radialGradient>
</defs>
<rect width="600" height="560" fill="#0b0d1f"/>
<rect x="70" y="235" width="460" height="260" fill="#1b2250"/>${window.ART.etoiles(30, 460, 260, 1313).replace(/cx="(\d+)"/g, (m, x) => `cx="${+x + 70}"`).replace(/cy="(\d+)"/g, (m, y) => `cy="${+y + 235}"`)}
<circle cx="440" cy="290" r="22" fill="#F3EFE6" opacity=".9"/><circle cx="450" cy="284" r="20" fill="#1b2250"/>
<path d="M70 470q60-30 120-8t120-6 110 4 110-10v45H70z" fill="#141a40"/>
<rect x="70" y="${SOL}" width="460" height="20" fill="#6b4a33"/><path d="M70 ${SOL + 7}h460M70 ${SOL + 14}h460" stroke="#4a3222" stroke-width="1.5"/>
<rect x="70" y="235" width="460" height="260" fill="url(#th-projo)"/>
<g clip-path="url(#th-ouverture)">
<g class="th-decor-chateau" transform="translate(452,${SOL})">${dessinChateau()}</g>
<g class="th-troupe">
  <g class="marionnette" data-p="souris">${window.ART.souris(-50, -6, 100)}</g>
  <g class="marionnette" data-p="doudou">${dessinDoudou(C.profil && C.profil.doudou && C.profil.doudou.type)}</g>
  <g class="marionnette" data-p="chat">${dessinChat()}</g>
  <g class="marionnette" data-p="dent">${dessinDent()}</g>
  <g class="marionnette" data-p="bayard">${dessinBayard()}</g>
</g>
<g class="th-flottants"></g>
<rect class="th-rideau g" x="70" y="235" width="232" height="280" fill="url(#th-velours)"/><rect class="th-rideau d" x="298" y="235" width="232" height="280" fill="url(#th-velours)"/>
</g>
<path d="M40 205h520v345H40zM70 235v280h460V235z" fill="#C9A227" fill-rule="evenodd"/><path d="M40 205h520v345H40z" fill="none" stroke="#8a6a12" stroke-width="3"/>
<path d="${lambrequin}V235z" fill="#9a2a32"/><path d="M70 235h460v8H70z" fill="#9a2a32"/>
<text class="th-affiche" x="300" y="226" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="15" fill="#2a1a10">${esc(affiche)}</text>
<g class="th-feux">${feux}</g>
<g class="th-geant">
  <path d="M170 205q10-58 80-66q50-6 100 0q70 8 80 66z" fill="#2b3470"/><path d="M286 139l14 22 14-22z" fill="#F3EFE6"/>
  <path class="bras g" d="M230 168L150 170" stroke="#2b3470" stroke-width="22" stroke-linecap="round"/><path class="bras d" d="M370 168L450 170" stroke="#2b3470" stroke-width="22" stroke-linecap="round"/>
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
</svg>`;
  }

  // ---------- Le spectacle ----------
  function ouvrir(o) {
    const T = o.T, D = window.DATA.theatre, C = window.CONFIG, SON = window.SON, MUS = window.MUSIQUE;
    const avantMusique = MUS && MUS.ambianceCourante;
    const precedent = document.activeElement;
    const v = document.createElement('div');
    v.className = 'theatre';
    v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'La treizième scène du Grand Marionnettiste');
    v.innerHTML = `<button type="button" class="th-quitter">${esc(D.boutons.quitter)} ✕</button>
<div class="th-scene">${svgTheatre(C, T(D.affiche))}</div>
<div class="th-bas"><p class="th-qui"></p><p class="th-txt" aria-live="polite"></p><div class="th-actions"></div></div>`;
    document.body.appendChild(v);
    const $ = (s, r) => (r || v).querySelector(s), $$ = (s, r) => Array.prototype.slice.call((r || v).querySelectorAll(s));
    const svg = $('.th-svg'), filsG = $('.th-fils'), flottants = $('.th-flottants');
    const croix = { g: { el: $('.croix.g'), x: 150, y: 178, dy: 0 }, d: { el: $('.croix.d'), x: 450, y: 178, dy: 0 } };
    const bras = { g: $('.bras.g'), d: $('.bras.d') };
    let ouvert = true, raf = 0, focusX = 300, parleT = 0, minuteurs = [];
    const plus = (fn, ms) => { const t = setTimeout(() => { if (ouvert) fn(); }, RM ? Math.min(ms, 120) : ms); minuteurs.push(t); return t; };

    // Les marionnettes et leurs fils (Bayard, plus lourd, en a deux)
    const P = {};
    [['souris', 'g', 420], ['doudou', 'g', 395], ['chat', 'd', 393], ['dent', 'd', 420], ['bayard', '2', 363]].forEach(([id, c, y], i) => {
      const el = $(`.marionnette[data-p="${id}"]`);
      const fils = (c === '2' ? ['g', 'd'] : [c]).map(cr => { const l = document.createElementNS(NS, 'line'); filsG.appendChild(l); return { cr, l }; });
      P[id] = { id, el, fils, x: 300, y, tx: 300, ty: y, vis: false, salut: -1e9, saut: -1e9, cabre: -1e9, phase: i * 1.7, ox: 0, oy: 0 };
    });
    const place = (id, x, vis, y) => { const p = P[id]; p.tx = x; if (y != null) p.ty = y; if (vis != null) { if (vis && !p.vis) { p.x = x; if (y != null) p.y = y; } p.vis = vis; } };

    // ---------- La boucle : balancement, sauts, saluts, fils tendus ----------
    let avant = performance.now();
    const boucle = now => {
      if (!ouvert) return;
      const dt = Math.min(0.05, (now - avant) / 1000); avant = now;
      for (const id in P) {
        const p = P[id];
        const k = RM ? 1 : Math.min(1, dt * (p.vitesse || 3));
        p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k;
        let oy = 0, rot = 0;
        if (!RM) { oy = Math.sin(now / 520 + p.phase) * 2.5; rot = Math.sin(now / 760 + p.phase) * 2.5; }
        const ts = now - p.salut; if (ts < 700) { const s = Math.sin(Math.PI * ts / 700); rot -= 24 * s; oy += 14 * s; }
        const tj = now - p.saut; if (tj < 560) { const s = Math.sin(Math.PI * tj / 560); oy -= 80 * s; rot += RM ? 0 : 360 * tj / 560; }
        const tc = now - p.cabre; if (tc < 900) { const s = Math.sin(Math.PI * tc / 900); rot -= 16 * s; oy -= 10 * s; }
        if (p.bosse) oy -= p.bosse;
        p.el.setAttribute('transform', `translate(${(p.x).toFixed(1)},${(p.y + oy).toFixed(1)}) rotate(${rot.toFixed(1)})`);
        p.el.style.opacity = p.vis ? '1' : '0';
        p.el.style.pointerEvents = p.vis ? '' : 'none'; // une marionnette cachée ne gêne pas les autres
        p.ox = p.x; p.oy = p.y + oy;
      }
      // Les mains suivent les fils tirés (et respirent un peu)
      for (const c of ['g', 'd']) {
        const cr = croix[c], sway = RM ? 0 : Math.sin(now / 900 + (c === 'g' ? 0 : 2)) * 3;
        const y = cr.y + cr.dy + sway;
        cr.el.setAttribute('transform', `translate(${cr.x},${y.toFixed(1)}) rotate(${(sway * 1.5).toFixed(1)})`);
        bras[c].setAttribute('d', `M${c === 'g' ? 230 : 370} 168L${cr.x} ${y.toFixed(1)}`);
        cr.yc = y;
      }
      for (const id in P) {
        const p = P[id];
        p.fils.forEach((f, i) => {
          const cr = croix[f.cr];
          const bout = cr.x + (p.ox < cr.x ? -42 : 42) * (p.fils.length > 1 ? 0.3 : 1);
          const ax = p.ox + (p.fils.length > 1 ? (i ? 40 : -40) : 0);
          f.l.setAttribute('x1', bout.toFixed(1)); f.l.setAttribute('y1', (cr.yc + 6).toFixed(1));
          f.l.setAttribute('x2', ax.toFixed(1)); f.l.setAttribute('y2', (p.oy + (p.fils.length > 1 ? 34 : 0)).toFixed(1));
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

    // ---------- Le texte, les boutons, les petits mots qui s'envolent ----------
    const dire = (txt, qui) => {
      $('.th-qui').textContent = qui === undefined ? D.marionnettiste : qui;
      $('.th-txt').textContent = txt;
      if (qui === undefined) parleT = performance.now() + Math.min(3200, 600 + txt.length * 28);
    };
    const actions = liste => {
      const z = $('.th-actions'); z.innerHTML = '';
      liste.forEach(a => {
        const b = document.createElement('button'); b.type = 'button';
        b.className = 'btn ' + (a.cls || 'btn-or'); b.textContent = a.txt; if (a.id) b.id = a.id;
        b.onclick = () => { if (SON) SON.play('clic'); a.fn(b); };
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
    const suite = fn => actions([{ txt: D.boutons.suite + ' ▸', fn }]);
    // Une marionnette qu'on peut toucher (ou activer au clavier)
    const touchable = (id, label, fn) => {
      const el = P[id].el;
      el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', label);
      el.classList.add('touchable');
      el.onclick = e => { e.stopPropagation(); fn(); };
      el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
    };
    const plusTouchable = id => { const el = P[id].el; ['role', 'tabindex', 'aria-label'].forEach(a => el.removeAttribute(a)); el.classList.remove('touchable'); el.onclick = el.onkeydown = null; };
    const chat = $('.chat-m');

    // ---------- 0. Les trois coups sont frappés : le rideau s'ouvre ----------
    const lever = () => {
      place('souris', 140, true); place('doudou', 240, true); place('chat', 362, true); place('dent', 462, true);
      chat.classList.add('eveille');
      if (MUS) MUS.ambiance('theatre');
      plus(() => { svg.classList.add('ouvert'); if (SON) SON.play('applaudir'); }, 500);
      dire(T(D.ouverture));
      plus(() => suite(salut), 400);
    };

    // ---------- 1. Le salut de la troupe ----------
    const salut = () => {
      dire(T(D.salut));
      actions([]);
      const noms = { souris: C.souris, doudou: C.poupee || D.pantin, chat: C.chat, dent: D.dent };
      const vus = new Set();
      ['souris', 'doudou', 'chat', 'dent'].forEach(id => touchable(id, 'Saluer ' + noms[id], () => {
        const p = P[id]; p.salut = performance.now(); focusX = p.x;
        if (SON) SON.play('pantin');
        flotte(noms[id], p.x, p.y - 18, 'nom');
        vus.add(id);
        if (vus.size === 4 && !salut.fini) {
          salut.fini = true;
          plus(() => { dire(T(D.salutFini)); suite(danse); }, 700);
        }
      }));
      const premier = P.souris.el; if (premier.focus) premier.focus({ preventScroll: true });
    };

    // ---------- 2. La danse du doudou : on tire le fil ----------
    const danse = () => {
      ['souris', 'doudou', 'chat', 'dent'].forEach(plusTouchable);
      place('souris', 140, false); place('chat', 362, false); place('dent', 462, false); place('doudou', 300, true);
      focusX = 300;
      dire(T(D.danse));
      let sauts = 0;
      const sauter = () => {
        if (sauts >= 5) return;
        P.doudou.saut = performance.now(); croix.g.dy = -40; plus(() => { croix.g.dy = 0; }, 300);
        if (SON) SON.play('pantin');
        sauts++;
        flotte('★', 300 + (Math.random() * 120 - 60), 300, 'etoile');
        if (sauts < 5) dire(D.danseEncore[(sauts - 1) % D.danseEncore.length]);
        else plus(() => { dire(T(D.danseBravo)); if (SON) SON.play('applaudir'); suite(chatDort); svg.onpointerdown = null; }, 600);
      };
      actions([{ txt: '▲ ' + D.boutons.fil, fn: sauter }]);
      // Au doigt : on tire le fil vers le haut, n'importe où sur la scène
      let depart = null;
      svg.onpointerdown = e => { depart = e.clientY; };
      svg.onpointermove = e => { if (depart != null && depart - e.clientY > 40) { depart = null; sauter(); } };
      svg.onpointerup = svg.onpointercancel = () => { depart = null; };
    };

    // ---------- 3. Le chat endormi : tirer le fil tout doucement ----------
    const chatDort = () => {
      svg.onpointerdown = svg.onpointermove = null;
      place('doudou', 300, false); place('souris', 110, true); place('chat', 330, true);
      chat.classList.remove('eveille', 'oeil');
      P.souris.vitesse = 8;
      dire(T(D.chat));
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
          if (SON) SON.play('rire');
          flotte(D.rires, 300, 470, 'rire');
          dire(T(D.chatReveil));
          const recule = Math.max(0, val - 26); r.value = String(recule); avance(recule);
          histoire = [{ v: recule, t: now }];
          plus(() => { chat.classList.remove('oeil'); reveil = false; histoire = [{ v: +r.value, t: performance.now() }]; dire(T(D.chatEncore)); }, 1400);
          return;
        }
        avance(val);
        if (SON && val % 10 === 0) SON.play('pas');
        if (val >= 100) {
          fini = true; P.souris.bosse = 0;
          dire(T(D.chatOuf)); if (SON) SON.play('applaudir');
          plus(() => suite(bayard), 500);
        }
      };
    };

    // ---------- 4. Bayard et les quatre chevaliers souris ----------
    const bayard = () => {
      place('souris', 520, false); place('chat', 330, false);
      P.souris.vitesse = 3;
      const b = P.bayard; b.x = -160; b.tx = -160; b.vis = true; b.vitesse = 1.3;
      dire(T(D.bayard));
      actions([]);
      plus(() => {
        place('bayard', 300); focusX = 300;
        svg.classList.add('galop');
        let n = 0; const galop = () => { if (SON) SON.play('galop'); if (++n < 5) plus(galop, 480); };
        galop();
        plus(() => {
          svg.classList.remove('galop');
          if (SON) SON.play('hennir');
          dire(T(D.bayardFin));
          touchable('bayard', 'Bayard', () => { b.cabre = performance.now(); svg.classList.remove('salue'); void svg.getBBox(); svg.classList.add('salue'); if (SON) SON.play('hennir'); });
          suite(final);
        }, 2600);
      }, 900);
    };

    // ---------- 5. Le final : la dent monte au château, et on applaudit ----------
    const final = () => {
      plusTouchable('bayard');
      const b = P.bayard; b.tx = 780; b.vitesse = 1.6;
      plus(() => { b.vis = false; }, 1600);
      svg.classList.add('final');
      place('souris', 110, true); place('doudou', 200, true); place('chat', 292, true);
      chat.classList.add('eveille');
      place('dent', 384, true, 420); P.dent.vitesse = 1.8;
      focusX = 384;
      dire(T(D.final));
      actions([]);
      // La dent grimpe, marche après marche, jusqu'en haut du château
      plus(() => { place('dent', 452, null, 300); focusX = 452; if (SON) SON.play('etoile'); }, 1300);
      plus(() => { place('dent', 452, null, 262); if (SON) SON.play('fanfare'); applaudir(); }, 2700);
    };
    const applaudir = () => {
      dire(T(D.applaudir));
      let n = 0;
      const clap = () => {
        n++;
        if (SON) SON.play('applaudir');
        const now = performance.now();
        ['souris', 'doudou', 'chat', 'dent'].forEach((id, i) => { setTimeout(() => { P[id].salut = performance.now(); }, RM ? 0 : i * 90); });
        flotte('👏', 120 + Math.random() * 360, 470, 'clap');
        const bouton = $('#th-clap'); if (bouton) bouton.textContent = `👏 ${D.boutons.applaudir} (${n})`;
        if (n === 3) actions([{ txt: `👏 ${D.boutons.applaudir} (${n})`, id: 'th-clap', fn: clap }, { txt: D.boutons.fermer, cls: 'btn-or', id: 'th-fermer', fn: () => fermer(true) }]);
        if (n === 6) { svg.classList.add('ravi'); dire(T(D.merci)); }
        void now;
      };
      actions([{ txt: `👏 ${D.boutons.applaudir}`, id: 'th-clap', fn: clap }]);
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
