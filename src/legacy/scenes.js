// Chapitre 1 : les dix scènes interactives. Chaque scène a un élément obligatoire (ou une chaîne
// d'éléments) qui débloque « Continuer », et deux éléments bonus qui donnent des étoiles.
window.SCENES = (function () {
  'use strict';
  const D = window.DATA, A = window.ART, DEC = window.DECORS, SON = window.SON, NARR = window.NARR, MUS = window.MUSIQUE;
  const RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const DESSINS = { chateau: DEC.chateau, foret: DEC.foret, meuse: DEC.meuse, place: DEC.place, montgolfiere: DEC.montgolfiere, etoiles: DEC.etoiles, lievre: DEC.lievre, aiglemont: DEC.aiglemont, fenetre: DEC.fenetre, pantoufle: DEC.pantoufle };
  const ICONES_FRISE = {
    chateau: '<path d="M5 20V9h3V6h2v3h4V6h2v3h3v11zM10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    foret: '<path d="M12 3l6 9h-3l4 6H5l4-6H6zM12 18v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    meuse: '<path d="M3 10q3-3 6 0t6 0 6 0M3 15q3-3 6 0t6 0 6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    place: '<path d="M4 20v-8a4 4 0 0 1 8 0v8M12 20v-8a4 4 0 0 1 8 0v8M3 20h18M4 8h16" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    montgolfiere: '<path d="M12 3a7 7 0 0 0-7 7c0 4 4 7 5 9h4c1-2 5-5 5-9a7 7 0 0 0-7-7zM10 19h4v3h-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    etoiles: '<path d="M7 4l1 2.2 2.3.3-1.7 1.6.4 2.3L7 9.3 4.9 10.4l.4-2.3L3.6 6.5l2.3-.3zM17 12l1 2.2 2.3.3-1.7 1.6.4 2.3-2-1.1-2.1 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="currentColor"/><path d="M8 10l8 4" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 2"/>',
    lievre: '<path d="M8 21c-3 0-5-2-5-5s2-5 5-5c-1-3-1-6 0-8 1 0 2 3 3 7 0-4 1-7 2-7 1 2 1 5 0 8 3 0 5 2 5 5s-2 5-5 5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    aiglemont: '<path d="M4 11l8-7 8 7v9H4zM10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    fenetre: '<rect x="4" y="3" width="16" height="17" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v17M4 11.5h16" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 6q2 2 0 4M15 14q2 2 0 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    pantoufle: '<path d="M6 10l-1-5 4 3h6l4-3-1 5a6 6 0 0 1-12 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="10" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1" fill="currentColor"/>',
  };

  let ctx = null, root = null, wrap = null, svg = null, sc = null, courant = -1, jeton = 0;
  let cabaretT = null;
  let chaine = [], idx = 0, derniere = null, aideT1 = null, aideT2 = null, raf = null, bougeT = null, secretTaps = 0, secretT = null;
  let occupe = false, enSecret = false;
  let friseX = 0; // position de la frise, gardée d'une scène à l'autre pour la faire glisser
  // Partie utile de chaque décor (en largeur) : sur un écran en hauteur, on recadre dessus plutôt que d'ajouter du ciel
  const ZONES = { chateau: [260, 890], foret: [100, 930], meuse: [0, 1000], place: [230, 910], montgolfiere: [130, 780], etoiles: [150, 900], lievre: [0, 1000], aiglemont: [20, 860], fenetre: [150, 850], pantoufle: [90, 960] };
  const heureTexte = h => { const [hh, mm] = h.split(':'); return 'La nuit dernière à ' + parseInt(hh, 10) + ' h ' + mm; };
  // À la fin de certaines scènes, avant le « pont »
  const FIN = { place() { const g = $('.tap[data-el="marionnettiste"]', svg); if (g) g.classList.add('montre'); } };
  const T = s => ctx.T(s);
  // La feuille de chêne des secrets des Ardennes (repère 24 × 24)
  const FEUILLE = 'M12 1C14 1 15 3 14.5 4.5C17 4 18 6 16 7.5C19 7.5 19.5 10 17 11C19.5 11.5 19 14.5 16 14C17 16 15.5 17.5 13.2 17L12.6 19V22.5H11.4V19L10.8 17C8.5 17.5 7 16 8 14C5 14.5 4.5 11.5 7 11C4.5 10 5 7.5 8 7.5C6 6 7 4 9.5 4.5C9 3 10 1 12 1Z';
  const estArdennais = id => (sc.ardennes || []).indexOf(id) >= 0;
  const bulle = b0 => { const b = window.RECIT.resoudre(b0); return b ? { txt: T(b.txt), expr: b.expr } : null; };

  // ---------- Ce qui se passe à l'écran quand on touche un élément ----------
  const ACTIONS = {
    chateau: {
      lanterne() { svg.classList.add('allume'); SON.play('lanterne'); },
      feuillage(g, sub, etape, deuxieme) {
        if (deuxieme && !g.classList.contains('envol')) { g.classList.remove('encore'); g.classList.add('envol'); SON.play('hulotte'); setTimeout(() => SON.play('buisson'), 300); return; }
        g.classList.remove('secoue'); void g.getBBox(); g.classList.add('secoue'); SON.play('buisson'); setTimeout(() => SON.play('hulotte'), 500);
        if (!g.classList.contains('envol')) g.classList.add('encore');
      },
      sac() { SON.play('papier'); },
    },
    foret: {
      // Le sanglier se réveille en sursaut, grogne… et s'enfuit dans la forêt
      sanglier(g) {
        if (g.classList.contains('fuit')) return;
        g.classList.add('reveil', 'fuit'); SON.play('grogne');
        [500, 700, 900, 1100].forEach(t => setTimeout(() => SON.play('pas'), RM ? 0 : t));
      },
      champignons(g, sub, etape) { if (sub) sub.classList.add('allume'); SON.play('champignon'); if (etape >= 3) svg.classList.add('dore'); },
      buisson() { SON.play('buisson'); setTimeout(() => SON.play('renard'), 600); },
      luciole(g) { g.classList.add('vole'); SON.play('luciole'); },
    },
    meuse: {
      billet() { SON.play('pli'); },
      bulles(g) { g.classList.remove('saute'); void g.getBBox(); g.classList.add('saute'); SON.play('plouf'); },
      reflet(g) { g.classList.remove('ondule'); void g.getBBox(); g.classList.add('ondule'); SON.play('ronds'); },
    },
    place: {
      marionnettiste(g) { g.classList.remove('danse'); void g.getBBox(); g.classList.add('danse'); SON.play('pantin'); },
      fenetre() { SON.play('pigeon'); },
      galette(g) { g.classList.add('croque'); SON.play('croque'); },
      plaque(g) { g.classList.add('lue'); SON.play('bois'); },
      plume(g) { g.classList.remove('vole'); void g.getBBox(); g.classList.add('vole'); SON.play('plume'); },
    },
    montgolfiere: {
      bruleur(g, sub, etape) { SON.play('bruleur'); const f = $('.flamme', svg); f.classList.remove('feu'); void f.getBBox(); f.classList.add('feu'); },
      etoile(g) { g.classList.remove('file'); void g.getBBox(); g.classList.add('file'); SON.play('filante'); },
      oies(g) { g.classList.remove('passe'); void g.getBBox(); g.classList.add('passe'); SON.play('oies'); },
      sedan(g) { g.classList.add('allume'); SON.play('trompette', { max: 1 }); }, // une seule trompette à la fois
      ardoises(g) { g.classList.remove('luit'); void g.getBBox(); g.classList.add('luit'); SON.play('harpe'); },
      // Trois concerts au plus en même temps, calés l'un sur l'autre ; la musique de la scène se tait jusqu'à la fin du dernier
      cabaret(g) {
        const duree = SON.play('concert', { max: 3 });
        if (duree === false) return;
        g.classList.remove('joue'); void g.getBBox(); g.classList.add('joue');
        // Les lasers balaient le ciel le temps du morceau
        const s = svg; s.classList.add('concert');
        MUS.pause(true);
        clearTimeout(cabaretT); cabaretT = setTimeout(() => { if (s) s.classList.remove('concert'); MUS.pause(false); }, Math.max(9, duree || 0) * 1000);
      },
    },
    etoiles: {
      // Chaque toucher allume l'étoile suivante et trace le trait qui la relie ; la main d'aide passe à la suivante
      constellation(g, sub, etape) {
        const P = DEC.POINTS_DENT;
        const pt = $(`.pt-${etape}`, g); if (pt) pt.classList.add('allume');
        if (etape > 1) { const t = $(`.trait-${etape - 1}`, g); if (t) t.classList.add('on'); }
        SON.note(NOTES_DENT[(etape - 1) % NOTES_DENT.length]); // chaque étoile chante une note du thème
        if (etape >= P.length) { const t = $(`.trait-${P.length}`, g); if (t) t.classList.add('on'); g.classList.add('dessine'); return; } // pas de fanfare : la mélodie des étoiles suffit
        const suivant = P[etape], h = $('.halo', g);
        if (h) { h.setAttribute('cx', suivant[0]); h.setAttribute('cy', suivant[1]); }
        $$('.pt', g).forEach(p => p.classList.toggle('prochaine', p.classList.contains(`pt-${etape + 1}`)));
      },
      lune(g) { g.classList.remove('clin'); void g.getBBox(); g.classList.add('clin'); SON.play('ronds'); },
      mouton(g) { g.classList.remove('saute'); void g.getBBox(); g.classList.add('saute'); SON.play('mmh'); },
    },
    lievre: {
      // Trois touchers : il ouvre un œil, dresse les oreilles, se lève (data-etape sur le groupe)
      lievre(g, sub, etape) { SON.play(etape >= 3 ? 'allume' : 'mmh'); },
      herisson(g) { g.classList.remove('trottine'); void g.getBBox(); g.classList.add('trottine'); SON.play('buisson'); },
      epouvantail(g) { g.classList.remove('salue'); void g.getBBox(); g.classList.add('salue'); SON.play('grince'); },
    },
    aiglemont: {
      girouette(g) { g.classList.remove('tourne'); void g.getBBox(); g.classList.add('tourne'); SON.play('girouette'); },
      lampadaire() { SON.play('gresille'); },
      fenetre() { SON.play('allume'); },
    },
    fenetre: {
      vitre() { SON.play('allume'); },
      escargot(g) { g.classList.remove('rampe'); void g.getBBox(); g.classList.add('rampe'); SON.play('mmh'); },
      araignee(g) { g.classList.remove('descend'); void g.getBBox(); g.classList.add('descend'); SON.play('luciole'); },
    },
    pantoufle: {
      yeux() { $('.chat-dort', svg).classList.add('revele'); SON.play('mmh'); },
      quenotte() { SON.play('clic'); },
      fleurs() { SON.play('papier'); },
      fenetre() { SON.play('allume'); },
    },
  };
  // ---------- Au milieu des étoiles : après la Dent, deux constellations à tracer du doigt, puis un vœu ----------
  // Chaque étoile reliée chante une note du thème de Quenotte (transposé en la, comme la musique de la scène) :
  // finir une constellation, c'est jouer la mélodie. Pas de numéros : seule la première étoile brille ; l'aide
  // (l'étoile suivante qui palpite) n'arrive qu'après quelques secondes d'hésitation. Des étoiles leurres scintillent.
  // On trace sans lever le doigt, ou on touche les étoiles l'une après l'autre (au clavier : Entrée).
  const THEME_ETOILES = [76, 81, 83, 84, 83, 81, 79, 81, 83, 76];
  const NOTES_DENT = THEME_ETOILES.slice(0, 7);
  const CONSTELLATIONS = [
    // place : [x, y, échelle] dans le ciel pendant le jeu (agrandies et centrées)
    { cle: 'souris', place: [305, 50, 1.35], pts: [[330, 200], [280, 150], [250, 70], [205, 125], [130, 105], [55, 150], [60, 230], [150, 250], [250, 240], [300, 225]], leurres: 2, notes: THEME_ETOILES },
    { cle: 'montgolfiere', place: [340, 78, 1.25], pts: [[180, 10], [255, 35], [295, 105], [275, 180], [215, 248], [218, 312], [142, 312], [145, 248], [85, 180], [65, 105], [105, 35], [140, 15]], leurres: 4, notes: THEME_ETOILES.concat([79, 81]) },
  ];
  const HESITATION = 5000;
  function tracer(c, mien) {
    return new Promise(fini => {
      const NS = 'http://www.w3.org/2000/svg', [ox, oy, ech] = c.place;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'cst cst-' + c.cle); g.setAttribute('transform', `translate(${ox},${oy}) scale(${ech})`);
      // Les leurres : autour de la constellation, à l'écart des vraies étoiles
      const xs = c.pts.map(p => p[0]), ys = c.pts.map(p => p[1]);
      const [x0, x1, y0, y1] = [Math.min(...xs) - 40, Math.max(...xs) + 40, Math.min(...ys) - 30, Math.max(...ys) + 30];
      const leurres = []; let essai = 0;
      while (leurres.length < c.leurres && essai++ < 200) {
        const p = [x0 + Math.random() * (x1 - x0), y0 + Math.random() * (y1 - y0)];
        if (c.pts.concat(leurres).every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 70)) leurres.push(p);
      }
      const etoileG = (p, cls, i) => `<g class="${cls}"${i != null ? ` data-ordre="${i}"` : ''} transform="translate(${p[0]},${p[1]})"><circle r="30" fill="transparent"/><circle class="cst-lueur" r="20" fill="url(#halo-or)"/><use href="#etoile5" x="-12" y="-12" width="24" height="24"/></g>`;
      g.innerHTML = `<path class="cst-forme" d="M${c.pts.map(p => p.join(' ')).join('L')}Z"/><g class="cst-traits"></g><line class="cst-fil" x1="0" y1="0" x2="0" y2="0"/>`
        + leurres.map(p => etoileG(p, 'cst-leurre')).join('') + c.pts.map((p, i) => etoileG(p, 'cst-pt' + (i === 0 ? ' prochaine' : ''), i)).join('')
        + `<text class="cst-nom" x="${((Math.min(...xs) + Math.max(...xs)) / 2).toFixed(0)}" y="${Math.max(...ys) + 60}" text-anchor="middle" style="font-size:${(32 / ech).toFixed(1)}px;stroke-width:${(7 / ech).toFixed(1)}px">${T(sc.ciel[c.cle].nom)}</text>`;
      svg.appendChild(g);
      const traits = $('.cst-traits', g), fil = $('.cst-fil', g), pts = $$('.cst-pt', g);
      let n = 0, trace = false, hesiteT = null;
      const local = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(g.getScreenCTM().inverse()); };
      const indice = () => { clearTimeout(hesiteT); hesiteT = setTimeout(() => { if (pts[n]) pts[n].classList.add('prochaine'); }, HESITATION); };
      const ligne = (a, b) => { const l = document.createElementNS(NS, 'line'); l.setAttribute('class', 'cst-trait'); l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]); traits.appendChild(l); };
      const fin = () => { arret.abort(); clearTimeout(hesiteT); fil.style.display = 'none'; ligne(c.pts[c.pts.length - 1], c.pts[0]); g.classList.add('dessine'); fini(g); };
      const relier = () => {
        if (mien !== jeton || n >= pts.length) return;
        pts[n].classList.remove('prochaine'); pts[n].classList.add('allume');
        if (n > 0) ligne(c.pts[n - 1], c.pts[n]);
        SON.note(c.notes[n % c.notes.length]);
        n++;
        if (n >= pts.length) { fin(); return; }
        indice();
      };
      // Un leurre touché : un refus tout doux (un quart du volume), pour ne pas casser l'ambiance
      const refus = el => { SON.play('toc', { volume: 0.25 }); el.classList.remove('refus'); void el.getBBox(); el.classList.add('refus'); if (pts[n]) pts[n].classList.add('prochaine'); };
      const pres = p => n < pts.length && Math.hypot(p.x - c.pts[n][0], p.y - c.pts[n][1]) < 40;
      const arret = new AbortController(), opt = { signal: arret.signal };
      svg.addEventListener('pointerdown', e => {
        if (mien !== jeton) return;
        const p = local(e);
        if (pres(p)) { e.preventDefault(); trace = true; relier(); return; }
        const autre = e.target.closest && e.target.closest('.cst-leurre, .cst-pt:not(.allume)');
        if (autre && g.contains(autre)) refus(autre);
      }, opt);
      svg.addEventListener('pointermove', e => {
        if (!trace || mien !== jeton) return;
        const p = local(e);
        if (n > 0 && n < pts.length) { fil.style.display = ''; fil.setAttribute('x1', c.pts[n - 1][0]); fil.setAttribute('y1', c.pts[n - 1][1]); fil.setAttribute('x2', p.x.toFixed(1)); fil.setAttribute('y2', p.y.toFixed(1)); }
        if (pres(p)) relier();
      }, opt);
      ['pointerup', 'pointercancel'].forEach(t => svg.addEventListener(t, () => { trace = false; fil.style.display = 'none'; }, opt));
      window.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); relier(); } }, opt);
      fil.style.display = 'none';
      indice();
    });
  }
  // Après les trois constellations : chaque étoile touchée (n'importe laquelle) joue la note suivante de la mélodie,
  // tant qu'on reste dans la scène
  const MELODIE_LIBRE = THEME_ETOILES.concat([79, 81]);
  function etoilesMusicales(mien) {
    let k = 0;
    const cible = e => e.target && e.target.closest ? e.target.closest('.cst-pt, .tap[data-el="constellation"] .pt') : null;
    svg.addEventListener('pointerdown', e => {
      const et = cible(e); if (!et || mien !== jeton) return;
      e.stopPropagation(); e.preventDefault();
      SON.unlock(); SON.note(MELODIE_LIBRE[k++ % MELODIE_LIBRE.length]);
      et.classList.remove('chante'); void et.getBBox(); et.classList.add('chante');
    }, true);
    // Le toucher ne compte pas comme un toucher de la scène (la Dent déjà faite ne rejoue rien)
    svg.addEventListener('click', e => { if (cible(e) && mien === jeton) e.stopPropagation(); }, true);
    svg.classList.add('etoiles-musicales');
  }
  // Le vœu : une étoile filante passe et repasse ; on la touche, et elle emporte le vœu
  function voeu(mien) {
    return new Promise(fini => {
      const NS = 'http://www.w3.org/2000/svg';
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'cst-filante'); g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', 'Une étoile filante : touche-la et fais un vœu');
      g.innerHTML = '<g class="cst-filante-in"><circle r="56" fill="transparent"/><path d="M-10 6L-150 70" stroke="url(#halo-or)" stroke-width="10" stroke-linecap="round"/><path d="M-6 4L-110 50" stroke="#FFF4D6" stroke-width="3" stroke-linecap="round" opacity=".8"/><circle r="22" fill="url(#halo-or)"/><use href="#etoile5" x="-14" y="-14" width="28" height="28"/></g>';
      svg.appendChild(g);
      const ok = e => {
        if (e && e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        if (e) e.preventDefault();
        if (mien !== jeton || g.classList.contains('exauce')) return;
        g.classList.add('exauce'); SON.play('filante'); SON.play('etoile');
        setTimeout(() => g.remove(), RM ? 0 : 1600);
        fini();
      };
      g.addEventListener('click', ok); g.addEventListener('keydown', ok);
    });
  }
  async function cielDesConstellations() {
    const mien = jeton, ciel = sc.ciel;
    svg.classList.add('jeu-ciel'); aideStop();
    const dent = $('.tap[data-el="constellation"]', svg);
    await NARR.dire(bulle(ciel.suite)); if (mien !== jeton) return;
    if (dent) dent.classList.add('pale');
    const faites = [];
    for (const c of CONSTELLATIONS) {
      await NARR.dire(bulle(ciel[c.cle].demande), { vite: true }); if (mien !== jeton) return;
      const g = await tracer(c, mien); if (mien !== jeton) return;
      faites.push(g); // pas de son de succès : la mélodie des étoiles suffit, l'immersion reste
      await wait(RM ? 100 : 900); if (mien !== jeton) return;
      await NARR.dire(bulle(ciel[c.cle].legende)); if (mien !== jeton) return;
      await NARR.attendre(); if (mien !== jeton) return;
      g.classList.add('pale');
    }
    // Le vœu, puis le ciel entier qui brille, un moment, avec la musique seule
    await NARR.dire(bulle(ciel.voeu)); if (mien !== jeton) return;
    await voeu(mien); if (mien !== jeton) return;
    faites.concat(dent ? [dent] : []).forEach(x => x.classList.remove('pale'));
    svg.classList.add('ciel-entier');
    etoilesMusicales(mien);
    await NARR.dire(bulle(ciel.voeuFait)); if (mien !== jeton) return;
    await wait(RM ? 300 : 6000); if (mien !== jeton) return;
    svg.classList.remove('jeu-ciel');
  }
  // Petites animations qui suivent l'élément obligatoire, avant la réponse de Quenotte
  const APRES = {
    chateau: { lanterne: () => wait(RM ? 100 : 700) },
    meuse: { billet: traversee },
    place: { marionnettiste: () => wait(RM ? 100 : 900) },
    montgolfiere: { bruleur: async () => { svg.classList.add('vole'); SON.play('bruleur'); await wait(RM ? 100 : 3800); } },
    // La dent dessinée, puis la montgolfière traverse l'écran et s'en va par la droite
    // La dent dessinée, puis deux autres constellations et un vœu ; enfin la montgolfière s'en va par la droite
    etoiles: { constellation: async () => { const mien = jeton; await wait(RM ? 100 : 1400); if (mien !== jeton) return; await cielDesConstellations(); if (mien !== jeton) return; svg.classList.add('envol'); SON.play('bruleur'); await wait(RM ? 100 : 2600); } },
    lievre: { lievre: async () => {
      // Quenotte grimpe sur son dos, et ils filent en bondissant jusqu'au panneau de la ville
      svg.classList.add('galop');
      for (let i = 0; i < 6 && !RM; i++) { SON.play('pas'); await wait(430); }
      await wait(RM ? 100 : 300);
    } },
    aiglemont: { girouette: async () => { await wait(RM ? 100 : 2300); svg.classList.add('trouve'); SON.play('allume'); await wait(400); } },
    pantoufle: { yeux: () => wait(RM ? 100 : 900) },
  };
  // Quand un élément devient la cible, certains passent au premier plan (le billet, d'abord caché derrière Quenotte)
  const DEVANT = {
    meuse: { billet(g) { g.setAttribute('transform', 'translate(222,334)'); svg.insertBefore(g, $('.main-aide', svg)); g.classList.add('devant'); } },
  };
  // Éléments obligatoires que l'on peut retoucher après coup (ils rejouent leur animation)
  const REJOUE = { marionnettiste: 1, girouette: 1, yeux: 0, lanterne: 0 };

  async function traversee(g) {
    const nav = $('.navire', svg), rg = $('.rive-g', svg), rd = $('.rive-d', svg);
    g.classList.add('parti'); rg.classList.add('cache'); nav.classList.add('on');
    SON.play('plouf');
    const mien = jeton, x0 = 230, x1 = 770, dur = RM ? 300 : 4200, t0 = performance.now();
    setTimeout(() => { if (mien === jeton) SON.play('eau'); }, 1400);
    setTimeout(() => { if (mien === jeton) SON.play('eau'); }, 2900);
    await new Promise(res => {
      const step = now => {
        if (mien !== jeton) { res(); return; }
        const k = Math.min(1, (now - t0) / dur), x = x0 + (x1 - x0) * k, y = 440 + Math.sin(k * Math.PI * 6) * 6, r = Math.sin(k * Math.PI * 6) * 4;
        nav.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(1)})`);
        if (k < 1) raf = requestAnimationFrame(step); else res();
      };
      raf = requestAnimationFrame(step);
    });
    if (mien !== jeton) return;
    nav.classList.remove('on'); rd.classList.add('on'); svg.classList.add('arrive'); SON.play('pas');
    await wait(RM ? 100 : 500);
  }

  // ---------- La buée de la grande fenêtre : elle s'efface là où passe le doigt ----------
  // Une grille invisible mesure la part essuyée ; au-delà de 70 %, le reste s'évapore et la scène continue.
  function frotterBuee() {
    const vitre = $('.tap[data-el="vitre"]', svg), buee = vitre && $('.buee', vitre), essuyage = $('.essuyage', svg);
    if (!vitre || !buee || !essuyage) return;
    const X0 = 290, Y0 = 90, L = 420, H = 315, COL = 14, LIG = 10, R = 46;
    const essuye = new Set();
    let frotte = false, fini = false, sonT = 0;
    const point = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
    const surVitre = p => p.x >= X0 && p.x <= X0 + L && p.y >= Y0 && p.y <= Y0 + H;
    const efface = e => {
      if (fini) return;
      const p = point(e);
      if (p.x < X0 - R || p.x > X0 + L + R || p.y < Y0 - R || p.y > Y0 + H + R) return;
      essuyage.insertAdjacentHTML('beforeend', `<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${R}" fill="#000"/>`);
      for (let c = 0; c < COL; c++) for (let l = 0; l < LIG; l++) {
        const cx = X0 + (c + 0.5) * L / COL, cy = Y0 + (l + 0.5) * H / LIG;
        if (Math.hypot(cx - p.x, cy - p.y) < R) essuye.add(c + ',' + l);
      }
      if (performance.now() - sonT > 280) { SON.play('papier'); sonT = performance.now(); }
      if (essuye.size >= COL * LIG * 0.7) termine();
    };
    const termine = () => {
      fini = true; buee.classList.add('evapore'); svg.classList.add('vitre-propre');
      // On attend que la demande soit posée (élément « cible », texte écrit) avant de valider
      const valide = () => { if (!svg || !vitre.isConnected) return; if (vitre.classList.contains('cible') && !NARR.lit) vitre.dispatchEvent(new MouseEvent('click', { bubbles: true })); else setTimeout(valide, 250); };
      setTimeout(valide, RM ? 50 : 700);
    };
    // Sur tout le dessin : le doigt peut se poser n'importe où sur la vitre, même sur un autre élément
    svg.addEventListener('pointerdown', e => {
      if (fini || !surVitre(point(e))) return;
      e.preventDefault(); frotte = true; SON.unlock();
      try { svg.setPointerCapture(e.pointerId); } catch (er) { }
      efface(e);
    });
    svg.addEventListener('pointermove', e => { if (frotte) efface(e); });
    // Au clavier (ou lecteur d'écran) : Entrée ou Espace sur la vitre l'essuie d'un coup
    vitre.addEventListener('keydown', e => { if (!fini && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopImmediatePropagation(); termine(); } }, true);
    ['pointerup', 'pointercancel'].forEach(n => svg.addEventListener(n, () => { frotte = false; }));
  }

  // ---------- La main qui montre l'élément à toucher ----------
  function aideStop() {
    clearTimeout(aideT1); clearTimeout(aideT2);
    const m = svg && $('.main-aide', svg); if (m) m.classList.remove('on');
    if (svg) $$('.tap.grand', svg).forEach(g => g.classList.remove('grand'));
  }
  function aideLance() {
    aideStop();
    if (!svg || idx >= chaine.length) return;
    const g = $(`.tap[data-el="${chaine[idx]}"]`, svg); if (!g) return;
    aideT1 = setTimeout(() => {
      const m = $('.main-aide', svg); let b;
      try { b = (g.querySelector('.halo') || g).getBBox(); } catch (e) { return; }
      let cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      // L'élément est peut-être dans un groupe transformé (chat, sac, porte…) : on passe par les coordonnées écran
      try {
        const pt = svg.createSVGPoint(); const r = (g.querySelector('.halo') || g).getBoundingClientRect();
        pt.x = r.left + r.width / 2; pt.y = r.top + r.height / 2;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse()); cx = p.x; cy = p.y;
      } catch (e) { }
      m.setAttribute('transform', `translate(${(cx + 10).toFixed(0)},${(cy + 14).toFixed(0)})`);
      m.classList.add('on');
    }, 4000);
    aideT2 = setTimeout(() => g.classList.add('grand'), 8000);
  }

  // Pendant le conseil : une main montre chaque étoile à toucher
  function mainsIndices(on) {
    if (!svg) return;
    $$('.main-indice', svg).forEach(m => m.remove());
    if (!on) return;
    $$('.tap.bonus', svg).forEach(g => {
      const h = g.querySelector('.halo'); if (!h) return;
      let cx, cy;
      try {
        const r = h.getBoundingClientRect(), pt = svg.createSVGPoint(); pt.x = r.left + r.width / 2; pt.y = r.top + r.height / 2;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse()); cx = p.x; cy = p.y - (+h.getAttribute('r') || 40) * 0.8;
      } catch (e) { return; }
      svg.insertAdjacentHTML('beforeend', `<g class="main-aide main-indice on" transform="translate(${(cx + 14).toFixed(0)},${(cy + 16).toFixed(0)})" aria-hidden="true"><use href="#main" x="-20" y="-6" width="60" height="70"/></g>`);
    });
  }

  // ---------- Frise des six scènes ----------
  function frise(n) {
    return `<div class="frise" aria-label="Les étapes du voyage">${D.scenes.map((s, i) => {
      const ok = i <= ctx.state.scene;
      return `<button class="pastille ${i === n ? 'active' : ''} ${i < n ? 'faite' : ''}" data-n="${i}" ${ok ? '' : 'disabled'} aria-label="${T(s.titre)}" title="${T(s.titre)}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONES_FRISE[s.id]}</svg></button>`;
    }).join('<span class="frise-trait"></span>')}</div>`;
  }

  // ---------- Ouverture d'une scène ----------
  async function ouvrir(n) {
    fermer();
    const mien = ++jeton;
    courant = n; sc = D.scenes[n];
    NARR.fixer([sc, D.indices], T);
    root.innerHTML = frise(n) + `<div class="decor-wrap" id="decor-wrap"><h2 class="decor-titre"><span class="decor-heure">${heureTexte(sc.heure)}</span>${T(sc.titre)}</h2><div class="secrets" id="secrets" title="Secrets découverts dans cette image"><svg viewBox="0 0 24 24"><use href="#etoile5"/></svg><span id="secrets-n"></span>${(sc.ardennes || []).length ? `<svg class="feuille-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${FEUILLE}"/></svg><span id="ardennes-n"></span>` : ''}</div>${DESSINS[sc.id](ctx.state.nuit)}</div>`;
    wrap = $('#decor-wrap', root); svg = $('svg.decor', root);
    if (sc.id === 'fenetre') frotterBuee();
    if (sc.id === 'etoiles') { const p1 = $('.pt-1', svg); if (p1) p1.classList.add('prochaine'); }
    // La frise glisse depuis sa position précédente jusqu'à centrer la scène en cours
    const fr = $('.frise', root), act = fr && $('.pastille.active', fr);
    if (fr && act) {
      fr.scrollLeft = friseX;
      const cible = act.offsetLeft - (fr.clientWidth - act.offsetWidth) / 2;
      fr.scrollTo({ left: cible, behavior: RM ? 'auto' : 'smooth' });
      const bords = () => { fr.classList.toggle('plus-gauche', fr.scrollLeft > 4); fr.classList.toggle('plus-droite', fr.scrollLeft < fr.scrollWidth - fr.clientWidth - 4); };
      fr.addEventListener('scroll', () => { friseX = fr.scrollLeft; bords(); }, { passive: true });
      bords(); setTimeout(bords, RM ? 0 : 700);
      friseX = Math.max(0, Math.min(cible, fr.scrollWidth - fr.clientWidth));
    }
    // La saison de la nuit (flocons, pétales, lucioles, feuilles), sauf à l'intérieur (le palier d'un immeuble)
    if (!svg.classList.contains('palier') && sc.id !== 'etoiles') svg.insertAdjacentHTML('beforeend', A.saisonSVG(ctx.state.nuit, 1000, 600));
    svg.insertAdjacentHTML('beforeend', `<g class="main-aide" aria-hidden="true"><use href="#main" x="-20" y="-6" width="60" height="70"/></g>`);
    ctx.heure(sc.heure); MUS.ambiance(sc.ambiance);
    cadre(); window.addEventListener('resize', cadre);
    chaine = sc.oblig.slice(); idx = 0; secretTaps = 0; occupe = false;
    const vus = (ctx.state.etoiles && ctx.state.etoiles[sc.id]) || [], vusArd = ctx.state.ardennes || [];
    $$('.tap', svg).forEach(g => {
      const id = g.dataset.el;
      if (sc.bonus.indexOf(id) >= 0) {
        g.classList.add('bonus'); if (vus.indexOf(id) >= 0) g.classList.add('deja');
        // Une petite étoile qui clignote au-dessus de chaque secret
        const h = g.querySelector('.halo');
        if (h) { const cx = +h.getAttribute('cx'), cy = +h.getAttribute('cy'), r = +h.getAttribute('r'); g.insertAdjacentHTML('beforeend', `<g class="indice" transform="translate(${cx},${(cy - r * 0.8).toFixed(0)})"><use href="#etoile5" x="-15" y="-15" width="30" height="30"/></g>`); }
      }
      if (estArdennais(id)) {
        g.classList.add('bonus', 'ardennais'); if (vusArd.indexOf(sc.id + '.' + id) >= 0) g.classList.add('deja');
        const h = g.querySelector('.halo');
        if (h) { const cx = +h.getAttribute('cx'), cy = +h.getAttribute('cy'), r = +h.getAttribute('r'); g.insertAdjacentHTML('beforeend', `<g class="indice feuille" transform="translate(${cx},${(cy - r * 0.8).toFixed(0)})"><path transform="translate(-13,-13) scale(1.1)" d="${FEUILLE}" fill="#9BC53D" stroke="#3E6B1F" stroke-width="1"/></g>`); }
      }
      g.addEventListener('click', e => onTap(g, e));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(g, e); } });
    });
    // Un toucher à côté : la scène bouge doucement, rien de plus
    svg.addEventListener('pointerdown', e => {
      if (e.target.closest('.tap')) return;
      wrap.classList.remove('bouge'); void wrap.offsetWidth; wrap.classList.add('bouge');
    });
    $$('.pastille', root).forEach(p => p.onclick = () => { const k = +p.dataset.n; if (k <= ctx.state.scene && k !== courant) ctx.fondu(() => ouvrir(k)); });
    NARR.action(null); compteSecrets();
    await NARR.dire(derniere = bulle(sc.intro));
    if (mien !== jeton) return;
    // Le conseil des secrets : une seule fois, et jamais si l'enfant a déjà trouvé une étoile tout seul
    const conseil = () => courant === 0 && !ctx.state.indices && !Object.keys(ctx.state.etoiles || {}).some(k => (ctx.state.etoiles[k] || []).length);
    const direct = !sc.elements[chaine[0]].demande && !conseil();
    if (!direct) { const ok = await NARR.attendre(); if (mien !== jeton || !ok) return; }
    if (conseil()) {
      // Première scène : Quenotte explique les secrets à découvrir
      await NARR.dire(derniere = bulle(D.indices)); if (mien !== jeton) return;
      mainsIndices(true);
      const ok2 = await NARR.attendre();
      mainsIndices(false);
      ctx.state.indices = true; ctx.save();
      if (mien !== jeton || !ok2) return;
    }
    await demande();
  }
  // Cadrage : la scène occupe toute la largeur, et le ciel se prolonge vers le haut si l'écran est en hauteur
  function cadre() {
    if (!svg || !wrap) return;
    const W = wrap.clientWidth || 700;
    // Le bandeau change de hauteur avec son texte : on réserve sa hauteur maximale (pas de défilement, pas de décor qui saute)
    const mesure = (window.NARR && NARR.hauteurMax && NARR.hauteurMax()) || parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bandeau-h')) || 0;
    const band = mesure || (W > 700 ? 180 : 160);
    // Hauteur disponible : de la position réelle du cadre jusqu'au bandeau (marge de 30 px)
    const haut = wrap.getBoundingClientRect().top + (window.pageYOffset || 0);
    const dispo = window.innerHeight - haut - band - 30;
    const H = Math.max(200, dispo);
    const vwIdeal = 600 * W / H; // largeur de décor qui remplit la hauteur sans ciel en plus
    if (vwIdeal >= 1000) {
      // Écran large et bas (tablette en paysage) : la scène entière, un peu moins large, centrée
      svg.setAttribute('viewBox', '0 0 1000 600'); svg.style.width = Math.round(H / 0.6) + 'px'; svg.style.height = H + 'px';
      ciel(0, 600);
    } else {
      // Écran en hauteur : on recadre sur la partie utile (décor plus grand), puis on ajoute du ciel si besoin
      const z = ZONES[sc.id] || [0, 1000];
      const vw = Math.min(1000, Math.max(vwIdeal, z[1] - z[0]));
      const vh = Math.min(1700, vw * H / W);
      const x0 = Math.max(0, Math.min(1000 - vw, (z[0] + z[1]) / 2 - vw / 2));
      // Le ciel étoilé (tout en ciel) : la scène au milieu de l'écran, un tapis de nuages en dessous
      const y0 = sc.id === 'etoiles' ? Math.min(0, (600 - vh) / 2) : 600 - vh;
      svg.setAttribute('viewBox', `${x0.toFixed(0)} ${y0.toFixed(0)} ${vw.toFixed(0)} ${vh.toFixed(0)}`);
      svg.style.width = '100%'; svg.style.height = Math.round(vh * W / vw) + 'px';
      ciel(y0, vh);
    }
  }
  // Les éléments du ciel (data-ciel="x,part,ymax") montent avec le ciel visible : la lune reste haut dans l'image
  function ciel(y0, vh) {
    $$('[data-ciel]', svg).forEach(g => {
      const [x, part, ymax] = g.dataset.ciel.split(',').map(Number);
      g.setAttribute('transform', `translate(${x},${Math.min(ymax, y0 + vh * part).toFixed(0)})`);
    });
  }
  function compteSecrets() {
    const el = $('#secrets-n', root); if (!el) return;
    el.textContent = ((ctx.state.etoiles && ctx.state.etoiles[sc.id]) || []).filter(e => sc.bonus.indexOf(e) >= 0).length + '/' + sc.bonus.length;
    const ea = $('#ardennes-n', root);
    if (ea) ea.textContent = (sc.ardennes || []).filter(i => (ctx.state.ardennes || []).indexOf(sc.id + '.' + i) >= 0).length + '/' + sc.ardennes.length;
  }
  function fermer() {
    jeton++; aideStop(); window.removeEventListener('resize', cadre); cancelAnimationFrame(raf); clearTimeout(bougeT); clearTimeout(secretT);
    svg = null; wrap = null;
  }

  // Met en évidence l'élément obligatoire suivant et affiche sa demande
  async function demande() {
    const mien = jeton;
    $$('.tap.cible', svg).forEach(g => g.classList.remove('cible'));
    if (idx >= chaine.length) return;
    const id = chaine[idx], el = sc.elements[id], g = $(`.tap[data-el="${id}"]`, svg);
    if (g) { g.classList.add('cible'); const dv = DEVANT[sc.id] && DEVANT[sc.id][id]; if (dv && !g.classList.contains('devant')) dv(g); }
    aideLance();
    if (el.demande) {
      const b = bulle(el.demande), deja = derniere && derniere.txt === b.txt; // déjà lue : on la remet d'un coup
      await NARR.dire(derniere = b, deja ? { vite: 'instant' } : {}); if (mien !== jeton) return;
    } else if (derniere) NARR.dire(derniere, { vite: 'instant' });
    // La consigne est lue : l'élément s'anime pour de bon (les étoiles clignotent et montrent leurs numéros)
    if (g) g.classList.add('pret');
  }

  function onTap(g, e) {
    const id = g.dataset.el, el = sc.elements[id];
    if (!el) return;
    SON.unlock();
    if (sc.bonus.indexOf(id) >= 0 || estArdennais(id)) { bonus(g, id, el); return; }
    const pos = chaine.indexOf(id);
    // Les trois coups : une fois le Grand Marionnettiste touché, chaque toucher frappe un coup, même pendant son animation
    if (id === 'marionnettiste' && ctx.config.secret && g.classList.contains('vu') && !enSecret && !NARR.interrompu) {
      if (pos < idx && REJOUE[id]) { const act = ACTIONS[sc.id][id]; if (act) act(g); }
      secret(); return;
    }
    // Pendant la lecture d'un secret, l'histoire principale attend le bouton « Suite »
    if (enSecret || NARR.interrompu) { SON.play('toc'); g.classList.remove('refus'); void g.getBBox(); g.classList.add('refus'); return; }
    if (pos < idx) {
      // Élément obligatoire déjà fait : certains rejouent leur animation
      if (REJOUE[id]) { const act = ACTIONS[sc.id][id]; if (act) act(g); }
      return;
    }
    if (pos > idx) { SON.play('toc'); return; }
    // Pas avant la phrase qui le demande, et pas pendant qu'elle s'écrit : l'histoire se lit dans l'ordre
    if (pos === idx && (NARR.lit || (NARR.attend && !g.classList.contains('cible')))) { NARR.continuer(); return; }
    if (!g.classList.contains('cible') || NARR.lit) { SON.play('toc'); g.classList.remove('refus'); void g.getBBox(); g.classList.add('refus'); return; }
    if (id === 'marionnettiste' && ctx.config.secret) secret(); // le premier toucher compte déjà comme un coup
    obligatoire(g, id, el, e);
  }
  // Les trois coups du théâtre : chaque toucher sur le Grand Marionnettiste frappe un coup (clin d'œil, rideau qui frémit, lumière)
  function secret() {
    const g = $('.tap[data-el="marionnettiste"]', svg);
    const efface = () => { if (g) g.classList.remove('coup1', 'coup2', 'coup3'); };
    if (g && !g.querySelector('.coups')) {
      // Le compteur des coups (trois étoiles), le « TOC ! » et l'onde, ajoutés au Grand Marionnettiste
      const etoile = (x, i) => `<path class="c c${i}" transform="translate(${x},118) scale(1.25)" d="M0 -8l2.4 5 5.4.6-4 3.7 1.1 5.3L0 3.9l-4.9 2.7 1.1-5.3-4-3.7 5.4-.6z" fill="#FFC857" stroke="#9a6a12" stroke-width="1"/>`;
      g.insertAdjacentHTML('beforeend', `<g class="coups" pointer-events="none"><circle class="onde" cx="846" cy="182" r="30" fill="none" stroke="#FFC857" stroke-width="4"/><g class="pips"><circle cx="820" cy="118" r="9" fill="#151a40" opacity=".6"/><circle cx="846" cy="118" r="9" fill="#151a40" opacity=".6"/><circle cx="872" cy="118" r="9" fill="#151a40" opacity=".6"/>${etoile(820, 1)}${etoile(846, 2)}${etoile(872, 3)}</g><text class="toc" x="846" y="92" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="34" fill="#FFC857" stroke="#3b2a00" stroke-width="1.5">TOC !</text></g>`);
    }
    secretTaps++; clearTimeout(secretT);
    const n = Math.min(secretTaps, 3);
    SON.play('coup' + n);
    efface(); if (g) { g.classList.remove('frappe'); void g.getBBox(); g.classList.add('frappe'); for (let i = 1; i <= n; i++) g.classList.add('coup' + i); }
    if (n < 3 && ctx.toast) ctx.toast(D.theatre['toc' + n]);
    if (secretTaps >= 3) { secretTaps = 0; secretT = setTimeout(() => { efface(); ctx.scene13(); }, RM ? 0 : 1100); return; }
    secretT = setTimeout(() => { secretTaps = 0; efface(); if (g) g.classList.remove('frappe'); }, 6000);
  }

  // Un secret se touche à tout moment : l'histoire se met en pause le temps de son texte, puis reprend
  async function bonus(g, id, el) {
    const mien = jeton;
    const premiere = !g.classList.contains('vu') && !g.classList.contains('deja');
    const deuxieme = g.classList.contains('vu');
    g.classList.add('vu');
    const act = ACTIONS[sc.id][id]; if (act) act(g, null, 0, deuxieme);
    if (premiere) { if (estArdennais(id)) ctx.ardennais(sc.id, id); else ctx.etoile(sc.id, id); compteSecrets(); }
    if (ctx.carteArd) ctx.carteArd(sc.id, id);
    mainsIndices(false);
    enSecret = true; svg.classList.add('secret'); aideStop();
    const ok = await NARR.interrompre(bulle(deuxieme && el.bulle2 ? el.bulle2 : el.bulle));
    if (mien !== jeton || !ok) return; // scène changée, ou un autre secret a pris la place
    enSecret = false; svg.classList.remove('secret');
    if (!occupe && idx < chaine.length && $('.tap.cible', svg)) aideLance();
  }

  async function obligatoire(g, id, el, e) {
    if (occupe) return;
    const mien = jeton;
    aideStop();
    const act = ACTIONS[sc.id][id];
    if (el.etapes) {
      // Les étoiles à relier : il faut toucher celle qui clignote (au clavier, Entrée suffit)
      if (g.querySelector('.pt') && !(e && e.type === 'keydown')) {
        const pt = e && e.target && e.target.closest ? e.target.closest('.pt') : null;
        if (!pt || !pt.classList.contains('prochaine')) { SON.play('toc'); aideLance(); return; }
      }
      let sub = e && e.target && e.target.closest ? e.target.closest('[data-sub]') : null;
      if (sub && sub.classList.contains('allume')) sub = null;
      // Touché à côté (sur le halo) : c'est le plus proche du doigt qui répond, pas le suivant dans l'ordre
      if (!sub && g.querySelector('[data-sub]')) {
        const libres = $$('[data-sub]:not(.allume)', g);
        if (e && e.clientX != null && (e.clientX || e.clientY)) {
          const d = el2 => { const b = el2.getBoundingClientRect(); return Math.hypot(b.x + b.width / 2 - e.clientX, b.y + b.height / 2 - e.clientY); };
          sub = libres.sort((a, b) => d(a) - d(b))[0] || null;
        } else sub = libres[0] || null;
      }
      const etape = (+(g.dataset.etape || 0)) + 1;
      g.dataset.etape = etape;
      if (act) act(g, sub, etape);
      const txt = { txt: T(el.etapes[etape - 1]), expr: etape >= el.etapes.length ? 'joie' : 'surprise' };
      if (etape < el.etapes.length) { NARR.dire(txt, { vite: true }); aideLance(); return; }
      occupe = true; svg.classList.add('occupe');
      g.classList.add('vu', 'fait'); g.classList.remove('cible');
      await NARR.dire(txt, { vite: true }); if (mien !== jeton) return;
      await wait(500); if (mien !== jeton) return;
    } else {
      occupe = true; svg.classList.add('occupe');
      g.classList.add('vu', 'fait'); g.classList.remove('cible');
      if (act) act(g);
    }
    const apres = APRES[sc.id] && APRES[sc.id][id];
    if (apres) { await apres(g); if (mien !== jeton) return; }
    if (ctx.carteArd) ctx.carteArd(sc.id, id); // la carte du carnet qui raconte ce moment

    if (el.reponse) {
      await NARR.dire(derniere = bulle(el.reponse)); if (mien !== jeton) return;
      // Dernier élément et pas de pont : le bouton arrive tout de suite, sans toucher supplémentaire
      const direct = idx + 1 >= chaine.length && !sc.pont;
      if (!direct) { await NARR.attendre(); if (mien !== jeton) return; }
    }
    idx++;
    occupe = false; svg.classList.remove('occupe');
    if (idx < chaine.length) { await demande(); return; }
    await fini(mien);
  }

  // La souris trottine vers la droite et sort de l'image
  async function sortie() {
    if (!svg) return;
    // Le lièvre repart au galop, Quenotte sur le dos, et sort par la droite
    if (sc.id === 'lievre') {
      svg.classList.add('galop', 'repart');
      for (let i = 0; i < 4 && !RM; i++) { SON.play('pas'); await wait(330); }
      await wait(RM ? 100 : 300);
      return;
    }
    const q = sc.id === 'meuse' ? $('.rive-d', svg) : $('.quenotte:not(.rive-g)', svg);
    if (!q) return;
    const grp = document.createElementNS('http://www.w3.org/2000/svg', 'g'); grp.setAttribute('class', 'depart');
    q.parentNode.insertBefore(grp, q);
    const lueur = sc.id === 'meuse' ? null : $('.lueur', svg); if (lueur) grp.appendChild(lueur);
    grp.appendChild(q); q.classList.add('trotte');
    void grp.getBBox(); grp.classList.add('part');
    // Dans la forêt, Quenotte grimpe le sentier jusqu'en haut de la colline : un peu plus long
    const pas = sc.id === 'foret' ? 7 : 4;
    for (let i = 0; i < pas && !RM; i++) { SON.play('pas'); await wait(320); }
    await wait(RM ? 100 : 250);
  }
  async function fini(mien) {
    ctx.sceneFaite(courant);
    if (FIN[sc.id]) FIN[sc.id]();
    $$('.pastille', root).forEach(p => { if (+p.dataset.n <= ctx.state.scene) p.disabled = false; });
    if (sc.pont) { await NARR.dire(derniere = bulle(sc.pont)); if (mien !== jeton) return; }
    const dernier = courant >= D.scenes.length - 1;
    if (dernier) NARR.action(A.icone('patte') + ' ' + T(sc.bouton), () => ctx.finChapitre(), 'btn-rouge');
    else NARR.action('Scène suivante ' + A.icone('suite'), async () => { SON.play('clic'); NARR.action(null); const n = courant + 1; await sortie(); ctx.fondu(() => ouvrir(n)); });
  }

  // Passer la scène en cours (histoire déjà terminée) : la suivante, ou le chapitre suivant après la dernière
  function passer() {
    if (!sc) return;
    const n = courant;
    ctx.sceneFaite(n);
    if (n >= D.scenes.length - 1) { fermer(); ctx.finChapitre(); }
    else ctx.fondu(() => ouvrir(n + 1));
  }

  return {
    passer,
    monter(r, c, n) { root = r; ctx = c; ouvrir(Math.max(0, Math.min(D.scenes.length - 1, n))); },
    demonter() { fermer(); root = null; },
    get courante() { return courant; },
  };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
