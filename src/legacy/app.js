// La nuit de la Petite Souris — application (chapitres, progression, fil rouge, narration)
(function () {
  'use strict';
  const C = window.CONFIG, D = window.DATA, A = window.ART, SON = window.SON, MUS = window.MUSIQUE, NARR = window.NARR;
  const RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function T(s) {
    const r = window.RECIT.resoudre(s); // un texte peut avoir plusieurs versions (dent, doudou, frère ou sœur)
    if (r == null) return '';
    return String(typeof r === 'string' ? r : r.txt).replace(/\{(\w+)\}/g, (m, k) => (C[k] != null ? C[k] : m));
  }
  const B = b0 => { const b = window.RECIT.resoudre(b0); return b ? { txt: T(b.txt), expr: b.expr } : null; };
  const hasard = arr => arr[Math.floor(Math.random() * arr.length)];

  // ---------- Progression (mémorisée en local) ----------
  const KEY = 'souris.progression.' + window.PROFIL.id; // une progression par profil (plusieurs enfants, plusieurs dents)
  // Grand texte (accessibilité) : un réglage de l'appareil, gardé même quand on recommence l'histoire
  const CLE_GRAND = 'souris.grand';
  const grandTexte = on => { document.documentElement.classList.toggle('grand-texte', on); window.dispatchEvent(new Event('resize')); };
  grandTexte(window.STOCKAGE.lire(CLE_GRAND) === '1');
  const State = { unlocked: 0, scene: 0, etoiles: {}, badges: [], secret: false, nuit: null, fini: false };
  function calcNuit() { const d = new Date(); if (d.getHours() < 12) d.setDate(d.getDate() - 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function load() {
    try { Object.assign(State, JSON.parse(window.STOCKAGE.lire(KEY) || '{}')); } catch (e) { }
    if (!State.etoiles || typeof State.etoiles !== 'object') State.etoiles = {};
    if (C.nuit) State.nuit = C.nuit;
    if (!State.nuit || !/^\d{4}-\d{2}-\d{2}$/.test(State.nuit)) State.nuit = calcNuit();
    save();
  }
  function save() { window.STOCKAGE.ecrire(KEY, JSON.stringify(State)); }
  function nuitTexte() {
    const d1 = new Date(State.nuit + 'T12:00:00'), d2 = new Date(d1); d2.setDate(d2.getDate() + 1);
    const mois = new Intl.DateTimeFormat('fr-FR', { month: 'long' });
    const m1 = mois.format(d1), m2 = mois.format(d2);
    return m1 === m2 ? `nuit du ${d1.getDate()} au ${d2.getDate()} ${m2} ${d2.getFullYear()}` : `nuit du ${d1.getDate()} ${m1} au ${d2.getDate()} ${m2} ${d2.getFullYear()}`;
  }
  function dateCam() { const d = new Date(State.nuit + 'T12:00:00'); d.setDate(d.getDate() + 1); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function nbEtoiles() { return Object.keys(State.etoiles).reduce((n, k) => n + (State.etoiles[k] || []).length, 0); }
  const totalEtoiles = D.scenes.reduce((n, s) => n + s.bonus.length, 0);

  // Paramètres d'adresse pour tester : ?reset=1 efface tout, ?chapitre=3 débloque jusqu'au chapitre 3,
  // ?chapitre=1&scene=4 ouvre la scène 4 du voyage, ?t=30 avance de 30 s dans la caméra
  const params = new URLSearchParams(location.search);
  if (params.has('reset')) {
    // Une nouvelle partie : la progression, le son et le dessin pour Quenotte (le profil, lui, est gardé)
    [KEY, 'souris.muet', 'souris.dessin.' + window.PROFIL.id].forEach(k => window.STOCKAGE.effacer(k));
    location.replace(location.pathname + location.hash); return;
  }
  load();
  const tTest = Math.max(0, parseFloat(params.get('t')) || 0);
  let demande = null, sceneDemande = null;
  if (params.has('chapitre')) {
    const n = Math.max(0, Math.min(5, parseInt(params.get('chapitre'), 10) || 0));
    State.unlocked = Math.max(State.unlocked, n); demande = n;
    if (params.has('scene')) { sceneDemande = Math.max(0, Math.min(D.scenes.length - 1, parseInt(params.get('scene'), 10) || 0)); State.scene = Math.max(State.scene, sceneDemande); }
    save();
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { } // retire ?chapitre de l'adresse, garde le profil
  }

  // ---------- Fil rouge, heure, son, toasts ----------
  const root = $('#scene');
  let courant = null, courantN = 0;
  function heure() { } // l'heure est affichée dans chaque scène, plus dans le ruban
  function toast(txt, icone) {
    const el = $('#toast');
    el.innerHTML = `<div class="toast-in">${icone || ''}<span>${esc(txt)}</span></div>`;
    el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 3200);
  }
  function badge(id) {
    const b = D.badges.find(x => x.id === id);
    if (!b || State.badges.indexOf(id) >= 0) return;
    State.badges.push(id); save();
    toast('Badge gagné : ' + T(b.nom), A.badgeIcone(id, 36)); SON.play('badge');
  }
  function etoile(sceneId, el) {
    const liste = State.etoiles[sceneId] || (State.etoiles[sceneId] = []);
    if (liste.indexOf(el) >= 0) return;
    liste.push(el); State.indices = true; save(); // une étoile trouvée : le conseil des secrets n'est plus utile
    const n = nbEtoiles();
    const sc = D.scenes.find(s => s.id === sceneId);
    toast((sc && liste.length >= sc.bonus.length ? D.etoilesToutes : D.etoile) + ' (' + n + '/' + totalEtoiles + ')', `<svg class="badge-ico" width="34" height="34" viewBox="0 0 24 24"><use href="#etoile5"/></svg>`);
    SON.play('etoile');
    D.badges.filter(b => b.etoiles && n >= b.etoiles).forEach(b => setTimeout(() => badge(b.id), 1500));
  }
  function complete(n) { if (State.unlocked < n + 1) { State.unlocked = n + 1; save(); } }
  // ---------- Plein écran ----------
  // Aucun navigateur n'autorise le plein écran sans geste : on le demande au premier toucher.
  // Sur iPhone, l'API n'existe pas : il faut « Ajouter à l'écran d'accueil » (web app).
  const PLEIN = {
    api: !window.PLATEFORME.natif && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled), // dans l'appli native, le plein écran est géré par le système
    appli: !!window.APPLI_INSTALLEE, // voir src/lib/installation.ts
    actif() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
    entrer() {
      try { sessionStorage.setItem('souris.plein', '1'); } catch (e) { }
      const el = document.documentElement;
      try {
        const p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : (el.webkitRequestFullscreen && el.webkitRequestFullscreen());
        if (p && p.catch) p.catch(() => { });
      } catch (e) { }
    },
    sortir() { try { const p = document.exitFullscreen ? document.exitFullscreen() : (document.webkitExitFullscreen && document.webkitExitFullscreen()); if (p && p.catch) p.catch(() => { }); } catch (e) { } },
  };
  function boutonPlein() { if (boutonPlein.maj) boutonPlein.maj(); }
  function buildFil() {
    const maison = `<button class="perle maison" data-n="0" aria-label="Revenir au début de l'histoire" title="Revenir au début"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="#fff"/></svg></button>`;
    const perles = maison + [1, 2, 3, 4, 5].map(i => `<button class="perle" data-n="${i}" aria-label="Chapitre ${i}"><span>${i}</span></button>`).join('');
    $('#fil').innerHTML = `<div class="fil-in">
      <div class="ruban" aria-label="Progression de l'histoire">${perles}<div class="fil-souris"><svg viewBox="0 0 130 100"><use href="#souris-side"/></svg></div></div>
      <div class="prefs">
        <button class="btn-ico" id="btn-prefs" aria-label="Préférences" aria-haspopup="true" aria-expanded="false">${A.icone('reglages')}</button>
        <div class="prefs-menu" id="prefs-menu" role="menu" hidden>
          <button role="menuitem" id="pref-son"></button>
          <button role="menuitem" id="pref-grand" aria-pressed="false"></button>
          ${PLEIN.api && !PLEIN.appli ? `<button role="menuitem" id="pref-plein"></button>` : ''}
          <a role="menuitem" id="pref-changer" href="./"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/></svg> Retour à l'accueil</a>
          <a role="menuitem" id="pref-parents" href="parents/">${A.icone('famille')} Espace parents</a>
          <a role="menuitem" id="pref-infos" href="infos/"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10.5v6M12 7.2v.1" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg> Informations</a>
          <button role="menuitem" id="pref-reset" class="danger">${A.icone('recommencer')} Recommencer l'histoire</button>
        </div>
      </div>
    </div>`;
    const menu = $('#prefs-menu'), bPrefs = $('#btn-prefs');
    const majPrefs = () => {
      $('#pref-son').innerHTML = A.icone(SON.muet ? 'muet' : 'son') + (SON.muet ? ' Son et musique : coupés' : ' Son et musique : activés');
      if ($('#pref-plein')) $('#pref-plein').innerHTML = A.icone(PLEIN.actif() ? 'reduire' : 'plein') + (PLEIN.actif() ? ' Quitter le plein écran' : ' Plein écran');
      const grand = document.documentElement.classList.contains('grand-texte');
      $('#pref-grand').innerHTML = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><text x="1" y="19" font-size="13" font-weight="800" fill="currentColor" font-family="sans-serif">A</text><text x="10" y="20" font-size="19" font-weight="800" fill="currentColor" font-family="sans-serif">A</text></svg> Grand texte : ${grand ? 'activé' : 'désactivé'}`;
      $('#pref-grand').setAttribute('aria-pressed', String(grand));
      $('#pref-reset').innerHTML = A.icone('recommencer') + " Recommencer l'histoire"; $('#pref-reset').classList.remove('confirme');
    };
    const fermerMenu = () => { menu.hidden = true; bPrefs.setAttribute('aria-expanded', 'false'); };
    boutonPlein.maj = majPrefs;
    bPrefs.onclick = e => { e.stopPropagation(); if (menu.hidden) { majPrefs(); menu.hidden = false; bPrefs.setAttribute('aria-expanded', 'true'); } else fermerMenu(); };
    menu.onclick = e => e.stopPropagation();
    document.addEventListener('click', () => { if (!menu.hidden) fermerMenu(); });
    $('#pref-son').onclick = () => { SON.unlock(); const m = SON.toggle(); majPrefs(); toast(m ? 'Son et musique coupés' : 'Son et musique activés'); };
    $('#pref-grand').onclick = () => {
      const on = !document.documentElement.classList.contains('grand-texte');
      window.STOCKAGE.ecrire(CLE_GRAND, on ? '1' : '0'); grandTexte(on); majPrefs();
      toast(on ? 'Grand texte activé' : 'Texte de taille normale');
    };
    if ($('#pref-plein')) $('#pref-plein').onclick = () => {
      if (PLEIN.actif()) { PLEIN.sortir(); try { sessionStorage.removeItem('souris.plein'); } catch (e) { } } else PLEIN.entrer();
      fermerMenu();
    };
    // Changer d'histoire : sur place, sans recharger la page (le plein écran est gardé)
    $('#pref-changer').onclick = e => { fermerMenu(); changerHistoire(e); };
    // Recommencer : un second toucher confirme (pour éviter un effacement par erreur)
    $('#pref-reset').onclick = () => {
      const b = $('#pref-reset');
      if (b.classList.contains('confirme')) { location.href = location.pathname + '?reset=1' + location.hash; return; }
      b.classList.add('confirme'); b.innerHTML = A.icone('recommencer') + ' Sûr ? Touche encore pour tout effacer';
      clearTimeout(b.t); b.t = setTimeout(majPrefs, 4000);
    };
    $$('.perle').forEach(p => p.onclick = () => { const n = +p.dataset.n; if (n <= State.unlocked) show(n); else toast('Termine d\'abord le chapitre ' + (n - 1) + ' !'); });
  }
  function updateFil(n) {
    $$('.perle').forEach(p => { const i = +p.dataset.n; p.classList.toggle('faite', i < State.unlocked); p.classList.toggle('active', i === n); p.classList.toggle('ouverte', i <= State.unlocked); });
    const s = $('.fil-souris'); if (s) s.style.left = n === 0 ? '5%' : [21, 37.5, 54, 70.5, 87][n - 1] + '%';
    document.body.dataset.chapitre = n;
  }
  // Fondu au noir entre deux tableaux : on assombrit, on change, on rallume
  function fondu(fn, duree) {
    const v = $('#voile-noir'); duree = RM ? 0 : (duree || 700);
    v.style.transitionDuration = duree + 'ms';
    v.classList.add('on');
    return wait(duree + 60).then(() => { fn(); return wait(80); }).then(() => { v.classList.remove('on'); });
  }
  // ---------- Passer une étape (seulement quand l'histoire a déjà été terminée une fois) ----------
  let passerEtape = null;
  function etape(fn) {
    passerEtape = fn;
    const b = $('#btn-passer'); if (b) b.hidden = !(State.fini && fn);
  }
  let affichages = 0; // chaque show() compte : « Passer » ne revient pas sur un nouvel écran (le diplôme, par exemple)
  function show(n, opts) {
    opts = opts || {};
    affichages++;
    etape(null);
    n = Math.max(0, Math.min(5, n)); if (n > State.unlocked) n = State.unlocked;
    if (courant && courant.unmount) { try { courant.unmount(); } catch (e) { } }
    SON.ronfleStop(); NARR.action(null); NARR.cacher(false);
    courantN = n; courant = Chapitres[n];
    root.innerHTML = courant.render(opts); root.className = 'scene ch-' + n;
    window.scrollTo(0, 0); updateFil(n); courant.mount(root, opts);
  }

  // ---------- Répondre à Quenotte : l'atelier de dessin ----------
  const CLE_DESSIN = 'souris.dessin.' + window.PROFIL.id;
  const lireDessin = () => { const d = window.STOCKAGE.lire(CLE_DESSIN); return d && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(d) ? d : null; };
  function atelier(apres) {
    const COULEURS = ['#1F2235', '#D64045', '#F2A3B5', '#FFC857', '#3E9A6B', '#3E7C8F', '#7d70a3', '#8B5A3C'];
    document.body.insertAdjacentHTML('beforeend', `<div class="atelier" role="dialog" aria-label="Dessine pour Quenotte">
  <div class="atelier-in">
    <h2>${A.icone('crayon')} Un dessin pour ${esc(C.souris)}</h2>
    <p class="consigne-dessin">${esc(T(D.dessin.consigne))}</p>
    <div class="toile-wrap"><span class="toile-titre">${A.icone('crayon')} ${esc(T(D.dessin.feuille))}</span><canvas class="toile" width="960" height="720"></canvas><p class="toile-invite" aria-hidden="true">${A.icone('crayon')} ${esc(T(D.dessin.ici))}</p></div>
    <div class="outils-dessin">
      ${COULEURS.map((c, i) => `<button class="couleur${i === 0 ? ' choisie' : ''}" data-c="${c}" style="background:${c}" aria-label="Couleur"></button>`).join('')}
      <button class="trait-taille" data-t="8" aria-label="Crayon fin">●</button><button class="trait-taille choisie" data-t="18" aria-label="Gros crayon">⬤</button>
      <button class="gomme" aria-label="Gomme">Gomme</button>
    </div>
    <div class="actions-dessin"><button class="btn btn-petit" data-a="effacer">Tout effacer</button><button class="btn btn-petit" data-a="annuler">Fermer</button><button class="btn btn-or" data-a="envoyer">Envoyer à ${esc(C.souris)}</button></div>
  </div>
</div>`);
    const fen = document.body.lastElementChild, toile = $('.toile', fen), g = toile.getContext('2d');
    const fond = () => { g.fillStyle = '#fff'; g.fillRect(0, 0, toile.width, toile.height); };
    fond();
    const invite = $('.toile-invite', fen);
    const ancien = lireDessin(); if (ancien) { invite.hidden = true; const img = new Image(); img.onload = () => g.drawImage(img, 0, 0, toile.width, toile.height); img.src = ancien; }
    let couleur = '#1F2235', taille = 18, gomme = false, trace = false, dernier = null;
    const pos = e => { const r = toile.getBoundingClientRect(); return [(e.clientX - r.left) * toile.width / r.width, (e.clientY - r.top) * toile.height / r.height]; };
    const ligne = (a, b) => { g.strokeStyle = gomme ? '#fff' : couleur; g.lineWidth = gomme ? 40 : taille; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
    let aDessine = false;
    toile.addEventListener('pointerdown', e => { e.preventDefault(); invite.hidden = true; trace = true; aDessine = true; dernier = pos(e); ligne(dernier, [dernier[0] + 0.1, dernier[1]]); try { toile.setPointerCapture(e.pointerId); } catch (er) { } });
    toile.addEventListener('pointermove', e => { if (!trace) return; const p = pos(e); ligne(dernier, p); dernier = p; });
    ['pointerup', 'pointercancel'].forEach(n => toile.addEventListener(n, () => { trace = false; }));
    $$('.couleur', fen).forEach(b => b.onclick = () => { couleur = b.dataset.c; gomme = false; $$('.couleur, .gomme', fen).forEach(x => x.classList.remove('choisie')); b.classList.add('choisie'); });
    $$('.trait-taille', fen).forEach(b => b.onclick = () => { taille = +b.dataset.t; $$('.trait-taille', fen).forEach(x => x.classList.remove('choisie')); b.classList.add('choisie'); });
    $('.gomme', fen).onclick = e => { gomme = true; $$('.couleur', fen).forEach(x => x.classList.remove('choisie')); e.currentTarget.classList.add('choisie'); };
    const fermer = () => { fen.remove(); if (apres) apres(); };
    $('[data-a="effacer"]', fen).onclick = () => { fond(); invite.hidden = false; aDessine = false; };
    $('[data-a="annuler"]', fen).onclick = fermer;
    $('[data-a="envoyer"]', fen).onclick = () => {
      window.STOCKAGE.ecrire(CLE_DESSIN, toile.toDataURL('image/jpeg', 0.82));
      SON.play('badge'); toast(T(D.dessin.merci), A.icone('patte')); fermer();
      if (aDessine) setTimeout(() => badge('artiste'), 1800); // après le merci de Quenotte
    };
  }

  // ---------- L'album des dents : chaque histoire terminée y est rangée ----------
  const CLE_ALBUM = 'souris.album';
  const lireAlbum = () => { try { const a = JSON.parse(window.STOCKAGE.lire(CLE_ALBUM) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  function rangerDansAlbum() {
    const P = window.PROFIL.profil, a = lireAlbum().filter(x => x.id !== window.PROFIL.id);
    a.push({ id: window.PROFIL.id, code: window.PROFIL.code, prenom: P.prenom, nuit: State.nuit, dent: P.dents.nuit, deja: P.dents.deja });
    window.STOCKAGE.ecrire(CLE_ALBUM, JSON.stringify(a.slice(-60)));
  }
  function album() {
    const a = lireAlbum(), parEnfant = {};
    a.forEach(x => { (parEnfant[x.prenom] = parEnfant[x.prenom] || []).push(x); });
    const date = n => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(n + 'T12:00:00'));
    const pages = Object.keys(parEnfant).map(prenom => {
      const nuits = parEnfant[prenom].sort((x, y) => (x.nuit < y.nuit ? -1 : 1)), derniere = nuits[nuits.length - 1];
      const toutes = new Set(); nuits.forEach(x => { toutes.add(x.dent); (x.deja || []).forEach(d => toutes.add(d)); });
      toutes.delete(derniere.dent);
      return `<section class="album-page"><h3>${esc(prenom)}</h3>${window.MACHOIRE({ dents: { nuit: derniere.dent, deja: [...toutes] } }).replace("cette nuit", "la plus récente")}
  <ul>${nuits.map(x => `<li><span>Nuit du ${esc(date(x.nuit))} : ${esc(window.NOM_DENT(x.dent))}</span><span class="album-boutons"><a class="btn btn-petit" href="#p=${x.code}">Revoir</a><button class="btn btn-petit supprimer" data-id="${esc(x.id)}">Supprimer</button></span></li>`).join('')}</ul></section>`;
    }).join('');
    document.body.insertAdjacentHTML('beforeend', `<div class="atelier album" role="dialog" aria-label="${esc(T(D.album.titre))}"><div class="atelier-in">
  <h2>${A.icone('etoile')} ${esc(T(D.album.titre))}</h2><p class="album-explication">${esc(T(D.album.explication))}</p>${pages || `<p>${esc(T(D.album.vide))}</p>`}
  <div class="actions-dessin"><button class="btn btn-or" data-a="fermer">Fermer</button></div></div></div>`);
    const fen = document.body.lastElementChild;
    $('[data-a="fermer"]', fen).onclick = () => fen.remove();
    // « Revoir » : une autre histoire, l'adresse change et la page se recharge avec son profil
    $$('a[href^="#p="]', fen).forEach(l => l.addEventListener('click', () => fen.remove()));
    // Supprimer : un second toucher confirme ; l'histoire quitte l'album (sa progression n'est pas touchée)
    $$('.supprimer', fen).forEach(b => b.onclick = () => {
      if (!b.classList.contains('confirme')) { b.classList.add('confirme'); b.textContent = 'Sûr ? Touche encore'; clearTimeout(b.t); b.t = setTimeout(() => { b.classList.remove('confirme'); b.textContent = 'Supprimer'; }, 3000); return; }
      window.STOCKAGE.ecrire(CLE_ALBUM, JSON.stringify(lireAlbum().filter(x => x.id !== b.dataset.id)));
      SON.play('papier'); fen.remove(); album();
    });
  }

  // ---------- Chapitre 0 : accueil ----------
  const Ch0 = {
    render() {
      return `<section class="ch ch0">
  <div class="ciel">${A.cielSVG(State.nuit)}</div>
  <div class="ch0-texte">
    <h1 class="titre">La nuit de la Petite Souris</h1>
    <p class="sous">${window.PROFIL.surprise ? 'Rendez-vous ' + esc(C.reveilTexte) + ' !' : esc(C.ville) + ' · ' + esc(nuitTexte())}</p>
    <a class="retour-choix" href="./">${A.icone('changer')} Changer d'histoire</a>
  </div>
</section>`;
    },
    mount(r) {
      heure('—'); MUS.ambiance('accueil');
      etape(() => { complete(0); fondu(() => show(1, { scene: 0 }), 500); });
      // Recadrage : sur un écran en hauteur, on resserre sur le château et la maison, puis on ajoute du ciel
      const svgC = $('.ciel-svg', r), boite = $('.ch0 .ciel', r);
      this.cadre = () => {
        const W = boite.clientWidth || 1, H = boite.clientHeight || 1, ideal = 480 * W / H;
        if (ideal >= 800) { svgC.setAttribute('viewBox', '0 0 800 480'); svgC.setAttribute('preserveAspectRatio', 'xMidYMax slice'); return; }
        const vw = Math.max(ideal, 620), vh = vw * H / W, x0 = Math.max(0, Math.min(800 - vw, 330 - vw / 2));
        svgC.setAttribute('viewBox', `${x0.toFixed(0)} ${(480 - vh).toFixed(0)} ${vw.toFixed(0)} ${vh.toFixed(0)}`);
        svgC.setAttribute('preserveAspectRatio', 'xMidYMax meet');
      };
      this.cadre(); window.addEventListener('resize', this.cadre);
      $('.retour-choix', r).onclick = changerHistoire;
      if (window.PROFIL.surprise) {
        // Trop tôt : Quenotte n'est pas encore passée. Pas de bouton pour commencer.
        $('.ch0', r).classList.add('surprise');
        NARR.dire(B(D.surprise));
        return;
      }
      NARR.dire(B(D.accueil));
      NARR.action(A.icone('lanterne') + ' ' + T(D.accueil.bouton), async () => {
        SON.unlock(); SON.play('lanterne');
        NARR.action(null);
        await wait(RM ? 50 : 350);
        // Avant le château : la carte de France, d'où part Quenotte et où elle va cette nuit
        await fondu(() => { this.unmount(); this.carte(r); }, 700);
      });
    },
    unmount() { window.removeEventListener('resize', this.cadre); clearTimeout(this.tCarte); this.jetonCarte = (this.jetonCarte || 0) + 1; },

    // ---------- La carte de France (hors de la frise des scènes) ----------
    // Le château dans les Ardennes, une étoile sur le département de l'enfant : un toucher sur l'étoile
    // trace le chemin de la nuit (une courbe en pointillés), puis « En route ! » ouvre le château.
    carte(r) {
      const mienCarte = this.jetonCarte = (this.jetonCarte || 0) + 1, encoreCarte = () => this.jetonCarte === mienCarte;
      etape(() => { complete(0); fondu(() => show(1, { scene: 0 }), 500); });
      const K = window.CARTE, ville = window.PROFIL.profil.ville;
      let et = K.etoileDepartement(ville.departement);
      const [cx, cy] = K.CHATEAU;
      // Tout près du château (les Ardennes) : l'étoile est un peu décalée pour rester visible
      if (et && Math.hypot(et.x - cx, et.y - cy) < 70) et = { x: cx + 40, y: cy + 80, outreMer: false };
      let trajet = '';
      if (et && Math.hypot(et.x - cx, et.y - cy) < 200) {
        // Trajet court : une boucle par l'ouest, pour que le chemin se voie
        trajet = `M${cx} ${cy}C${cx - 140} ${cy - 10} ${et.x - 170} ${et.y + 70} ${et.x} ${et.y}`;
      } else if (et) {
        // Arc de vol : le point de contrôle est décalé perpendiculairement au trajet, toujours vers le haut
        const dx = et.x - cx, dy = et.y - cy, d = Math.hypot(dx, dy) || 1;
        let nx = -dy / d, ny = dx / d; if (ny > 0) { nx = -nx; ny = -ny; }
        const h = Math.max(70, d * 0.38), borne = v => Math.max(10, Math.min(860, v));
        trajet = `M${cx} ${cy}Q${borne((cx + et.x) / 2 + nx * h).toFixed(0)} ${borne((cy + et.y) / 2 + ny * h).toFixed(0)} ${et.x} ${et.y}`;
      }
      const nomX = et ? Math.max(170, Math.min(730, et.x)) : 0, nomY = et ? (et.y > 220 ? et.y - 52 : et.y + 82) : 0;
      const versGauche = et && et.x < cx;
      r.className = 'scene ch-0';
      r.innerHTML = `<section class="ch origine${et ? '' : ' sans-etoile'}">
  <p class="origine-aide">${esc(T(D.origine.aide))}</p>
  <svg class="carte-france" viewBox="0 0 900 870" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Carte de France : le château de Quenotte, dans les Ardennes${et ? ', et ' + esc(ville.nom) : ''}">
    ${trajet ? `<defs><mask id="masque-trajet" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="870"><path class="trace" d="${trajet}" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/></mask></defs>` : ''}
    <path class="pays" d="${K.CONTOUR_FRANCE}"/><path class="pays" d="${K.CONTOUR_CORSE}"/>
    ${et && et.outreMer ? `<g class="outre-mer"><rect x="40" y="722" width="140" height="116" rx="16"/><text x="110" y="862">Outre-mer</text></g>` : ''}
    ${trajet ? `<path class="trajet" d="${trajet}" mask="url(#masque-trajet)"/>` : ''}
    <g class="chateau" transform="translate(${cx},${cy})">
      <circle r="58" cy="-22" fill="url(#glow)"/>
      <path d="M-30 0V-34h8v6h6v-6h8v6h6v-6h8v6h6v-6h8V0z M-12 -34V-56h-5l17-18 17 18h-5v22z" fill="#d8cfe6" stroke="#5b5480" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-5 0v-12a5 5 0 0 1 10 0V0z" fill="#3b2a55"/><rect x="-3" y="-50" width="6" height="8" rx="3" fill="#FFC857"/>
      <path d="M0 -74v-14l12 4-12 4" fill="#D64045"/>
    </g>
    <text class="nom-chateau" x="${cx}" y="${cy - 100}">Château de ${esc(C.souris)}</text>
    ${et ? `<g class="etoile-ville" role="button" tabindex="0" aria-label="L'étoile de ${esc(ville.nom)}" transform="translate(${et.x},${et.y})">
      <circle class="halo" r="54" fill="url(#glow)"/><circle class="cible" r="48" fill="transparent"/>
      <use href="#etoile5" x="-26" y="-26" width="52" height="52"/>
    </g>
    <text class="nom-ville" x="${nomX}" y="${nomY}">${esc(ville.nom)}</text>
    <g class="main-aide" transform="translate(${et.x + 16},${et.y + 18})" aria-hidden="true"><use href="#main" x="-20" y="-6" width="60" height="70"/></g>
    <g class="voyageuse" aria-hidden="true"><g transform="scale(${versGauche ? -1 : 1} 1)"><circle cx="0" cy="-8" r="30" fill="url(#glow)"/><use href="#souris-side" x="-34" y="-40" width="68" height="52"/></g>
      <animateMotion id="vol-carte" begin="indefinite" dur="2.4s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.6 1" keyTimes="0;1" path="${trajet}"/></g>` : ''}
  </svg>
</section>`;
      const ensuite = async () => {
        if (!encoreCarte()) return;
        await NARR.dire(B(D.origineVille)); if (!encoreCarte()) return;
        NARR.action(A.icone('suite') + ' ' + T(D.origineVille.bouton), async () => {
          SON.unlock(); SON.play('clic'); NARR.action(null);
          complete(0);
          await fondu(() => show(1, { scene: State.unlocked > 1 ? 0 : State.scene }), 900);
        });
      };
      const dit = NARR.dire(B(D.origine));
      if (!et) { dit.then(() => { this.tCarte = setTimeout(ensuite, RM ? 0 : 600); }); return; }
      const sec = $('.origine', r), etoile = $('.etoile-ville', r);
      dit.then(() => { if (!sec.classList.contains('trace-fait')) $('.main-aide', r).classList.add('on'); });
      let touche = false;
      const toucher = async () => {
        if (touche) return; touche = true;
        SON.unlock(); SON.play('filante');
        sec.classList.add('trace-fait'); $('.main-aide', r).classList.remove('on');
        // Le chemin se dessine du château jusqu'à l'étoile, Quenotte le suit
        const trace = $('.trace', r), L = trace.getTotalLength();
        if (!RM) {
          trace.style.strokeDasharray = L + ' ' + L; trace.style.strokeDashoffset = L;
          trace.getBoundingClientRect();
          trace.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(.4,0,.6,1)'; trace.style.strokeDashoffset = 0;
          try { $('#vol-carte', r).beginElement(); } catch (e) { }
        }
        sec.classList.add(RM ? 'arrive' : 'vole');
        await wait(RM ? 50 : 2400);
        sec.classList.add('arrive'); SON.play('etoile');
        ensuite();
      };
      etoile.addEventListener('click', toucher);
      etoile.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toucher(); } });
    },
  };

  // ---------- Écran de choix (ouverture sans QR code) ----------
  // Les parents, l'histoire d'exemple, ou la reprise de la dernière histoire scannée sur cet appareil
  const ETOILES_CHOIX = [[40, 60, 2.2], [120, 140, 1.6], [330, 50, 2.6], [370, 190, 1.8], [60, 260, 1.5], [250, 110, 1.4], [300, 330, 2], [30, 480, 1.8], [370, 560, 2.2], [200, 40, 1.6], [90, 700, 2], [340, 740, 1.5], [180, 620, 1.3]]
    .map(([x, y, r], i) => `<circle class="etoile" cx="${x}" cy="${y}" r="${r}" fill="#fff" style="animation-delay:${(i * 0.37).toFixed(2)}s"/>`).join('')
    + '<path d="M330 120a34 34 0 1 0 0 68a26 26 0 1 1 0-68z" fill="#FFF4D6" opacity=".9"/>';
  function afficherChoix() {
    document.body.classList.add('mode-choix');
    const m = window.PROFIL.memoire, exemple = window.PRENOM_EXEMPLE;
    root.className = 'scene choix-scene';
    root.innerHTML = `<section class="ecran-choix">
  <svg class="choix-ciel" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${ETOILES_CHOIX}</svg>
  <div class="choix-haut">
    <img class="choix-logo" src="icones/icone.svg" alt="" width="128" height="128">
    <h1 class="titre">La nuit de la Petite Souris</h1>
  </div>
  <nav class="choix-cartes" aria-label="Choisir son parcours">
    ${m ? `<a class="carte-choix reprendre" href="#p=${m.code}"><span class="ic">${A.icone('lanterne')}</span><span><b>Reprendre l'histoire de ${esc(m.prenom)}</b><small>Retrouver Quenotte là où on l'a laissée</small></span></a>` : ''}
    <a class="carte-choix voyage" href="#exemple"><span class="ic">${A.icone('etoile')}</span><span><b>Débuter le voyage avec Quenotte</b><small>Découvre l'histoire de ${esc(exemple)}</small></span></a>
    <a class="carte-choix parents" href="parents/"><span class="ic">${A.icone('famille')}</span><span><b>Je suis un parent</b><small>Préparer l'histoire personnalisée pour mon enfant</small></span></a>
  </nav>
  <button class="lien-album" id="lien-album">${A.icone('etoile')} ${esc(T(D.album.titre))}</button>
  ${window.DON_POSSIBLE ? `<p class="don-accueil"><span class="phrase">Gratuite pour toutes les familles, l'appli vit grâce à vos petits dons.</span> <a href="parents/#don"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/></svg>Faire un don</a></p>` : ''}
  <a class="lien-infos" href="infos/">Informations · confidentialité</a>
</section>`;
    // Sans recharger la page (le plein écran est gardé) quand l'histoire choisie est déjà chargée ;
    // sinon le lien change l'adresse et la page se recharge avec le bon profil
    const surPlace = (hash, origine) => e => {
      e.preventDefault();
      try { history.replaceState(null, '', location.pathname + hash); } catch (er) { }
      window.PROFIL.origine = origine;
      document.body.classList.remove('mode-choix');
      show(0);
    };
    $('#lien-album', root).onclick = album;
    const exempleCharge = window.PROFIL.origine === 'choix' || window.PROFIL.origine === 'exemple';
    if (exempleCharge) $('.carte-choix.voyage', root).onclick = surPlace('#exemple', 'exemple');
    if (m && m.code === window.PROFIL.code) $('.carte-choix.reprendre', root).onclick = surPlace('#p=' + m.code, 'adresse');
  }

  // Retour à l'écran de choix, sur place : l'histoire en cours devient « Reprendre l'histoire de… »
  function changerHistoire(e) {
    if (e) e.preventDefault();
    if (courant && courant.unmount) { try { courant.unmount(); } catch (er) { } }
    courant = null; SON.ronfleStop(); NARR.action(null);
    if (window.PROFIL.origine === 'adresse' || window.PROFIL.origine === 'memoire') window.PROFIL.memoire = { prenom: window.PROFIL.profil.prenom, code: window.PROFIL.code };
    try { history.replaceState(null, '', location.pathname); } catch (er) { }
    afficherChoix(); window.scrollTo(0, 0);
  }

  // ---------- Chapitre 1 : le voyage en six scènes ----------
  const Ch1 = {
    render() { return `<section class="ch ch1" id="ch1"></section>`; },
    mount(r, opts) {
      const n = sceneDemande != null ? sceneDemande : (opts.scene != null ? opts.scene : Math.min(State.scene, D.scenes.length - 1));
      sceneDemande = null;
      etape(() => window.SCENES.passer());
      window.SCENES.monter($('#ch1', r), {
        state: State, config: C, T, heure, etoile, toast, save,
        sceneFaite(i) { if (State.scene < i + 1) { State.scene = Math.min(D.scenes.length - 1, i + 1); save(); } },
        fondu,
        finChapitre() { complete(1); badge('detective'); show(2); },
        scene13,
      }, n);
    },
    unmount() { window.SCENES.demonter(); },
  };

  // La 13e scène : le théâtre de marionnettes du Grand Marionnettiste (src/legacy/theatre.js)
  function scene13() {
    window.THEATRE.ouvrir({ T, fin: () => { if (!State.secret) { State.secret = true; save(); } badge('scene13'); } });
  }

  // ---------- Chapitre 2 : 1, 2, 3, soleil avec le chat ----------
  const Ch2 = {
    // Dans la maison plongée dans le noir : le doigt promène la lumière jusqu'à la porte de la chambre
    lampe(r) {
      etape(() => { complete(2); badge('passechat'); show(3); });
      const self = this; NARR.action(null); heure('02:42');
      $('.ch2', r).innerHTML = `<h2 class="decor-titre"><span class="decor-heure">La nuit dernière à 2 h 42</span>Dans le noir</h2><div class="lampe-wrap">${A.lampeSVG()}</div>`;
      const svg = $('.lampe', r), trou = $('.trou', svg), faisceau = $('.faisceau', svg), plaque = $('.plaque', svg), fente = $('.fente', svg);
      let trouve = false, dessus = 0;
      NARR.dire(B(D.lampe.intro));
      // Coordonnées du doigt dans le dessin
      const point = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
      let lx = 500, ly = 300; // position de la lumière (souris, doigt ou flèches du clavier)
      const bouge = e => eclaire(point(e));
      const eclaire = p => {
        if (trouve) return;
        lx = p.x; ly = p.y;
        trou.setAttribute('cx', p.x.toFixed(0)); trou.setAttribute('cy', p.y.toFixed(0));
        faisceau.setAttribute('cx', p.x.toFixed(0)); faisceau.setAttribute('cy', p.y.toFixed(0));
        // La lumière sur la plaque de la chambre un court instant : trouvée !
        const b = plaque.getBBox(), cx = 720 + b.x + b.width / 2, cy = 470 + b.y + b.height / 2;
        if (Math.hypot(p.x - cx, p.y - cy) < 85) { if (!dessus) dessus = performance.now(); else if (performance.now() - dessus > 350) gagne(); } else dessus = 0;
      };
      const gagne = () => {
        if (trouve) return; trouve = true; clearTimeout(self.tAide);
        svg.classList.add('trouvee'); SON.play('allume');
        NARR.dire(B(D.lampe.trouve));
        NARR.action(T(D.jeu.bouton) + ' ' + A.icone('suite'), () => { complete(2); badge('passechat'); show(3); });
      };
      svg.addEventListener('pointerdown', e => { e.preventDefault(); SON.unlock(); bouge(e); });
      svg.addEventListener('pointermove', bouge);
      // Au clavier : les flèches promènent la lumière
      document.removeEventListener('keydown', self.kdLampe);
      document.addEventListener('keydown', self.kdLampe = e => {
        const d = { ArrowUp: [0, -40], ArrowDown: [0, 40], ArrowLeft: [-40, 0], ArrowRight: [40, 0] }[e.key];
        if (!d || trouve) return; e.preventDefault(); SON.unlock();
        eclaire({ x: Math.max(0, Math.min(1000, lx + d[0])), y: Math.max(0, Math.min(600, ly + d[1])) });
        setTimeout(() => eclaire({ x: lx, y: ly }), 400); // rester un instant sur la plaque suffit
      });
      // Après un moment : un filet de lumière sous la bonne porte
      self.tAide = setTimeout(() => { if (!trouve) { fente.classList.add('on'); NARR.dire(B(D.lampe.aide)); } }, 9000);
    },
    render() {
      return `<section class="ch ch2">
  <h2 class="decor-titre"><span class="decor-heure">La nuit dernière à 2 h 31</span>Chut ! ${esc(C.chat)} dort.</h2>
  <div class="jeu-wrap">${A.jeuSVG()}</div>
  <div class="jauge" aria-live="polite"><div class="jauge-in" id="jauge"></div><span id="fromages">Encore 5 bonds jusqu'à la porte</span>
    <svg class="jauge-porte" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 22V5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v17z" fill="#8B5A3C" stroke="#5c3a24" stroke-width="1.5"/><circle cx="15.5" cy="13" r="1.4" fill="#FFC857"/></svg>
    <svg class="jauge-souris" id="jauge-souris" viewBox="0 0 130 100" aria-hidden="true"><use href="#souris-side"/></svg></div>
  <button class="btn btn-grand btn-or btn-tenir" id="btn-avancer">${A.icone('patte')} Avancer <small>reste appuyé</small></button>
</section>`;
    },
    mount(r) {
      const svg = $('.jeu', r), souris = $('#jeu-souris', svg), chat = $('#chat', svg), bulle = $('#bulle', svg);
      const btn = $('#btn-avancer', r), jauge = $('#jauge', r), fromages = $('#fromages', r), mini = $('#jauge-souris', r);
      const self = this; let p = 0, tient = false, etat = 'dort', pris = 0, gagne = false, sonne = false, dernier = null, pasT = 0, premierCycle = true;
      heure('02:31'); MUS.ambiance('jeu');
      etape(() => { complete(2); badge('passechat'); show(3); });
      NARR.dire(B(D.jeu.intro));
      const dis = (arr, expr) => NARR.dire({ txt: T(hasard(arr)), expr }, { vite: true });
      const setEtat = s => {
        etat = s; chat.setAttribute('data-etat', s);
        if (s === 'dort') { SON.ronfleStart(); if (!premierCycle) dis(D.jeu.dort, 'chuchote'); premierCycle = false; }
        else SON.ronfleStop();
        if (s === 'baille') { SON.play('baillement'); dis(D.jeu.baille, 'surprise'); }
        if (s === 'reveille') dis(D.jeu.reveille, 'surprise');
      };
      const cycle = () => {
        if (gagne) return; setEtat('dort');
        const base = pris >= 5 ? 6500 : 2800 + Math.random() * 2000;
        self.t = setTimeout(() => { if (gagne) return; setEtat('baille'); self.t = setTimeout(() => { if (gagne) return; setEtat('reveille'); self.t = setTimeout(cycle, 1700); }, 1000); }, base);
      };
      const rendu = () => {
        souris.setAttribute('transform', `translate(${(40 + p * 7.8).toFixed(1)},300)`);
        jauge.style.width = p + '%'; mini.style.left = `calc(${p}% * .86 + 4px)`;
        const n = Math.ceil((100 - p) / 20);
        fromages.textContent = n <= 0 ? 'Arrivée à la porte !' : n === 1 ? "Plus qu'un bond jusqu'à la porte !" : `Encore ${n} bonds jusqu'à la porte`;
      };
      const vue = () => {
        sonne = true; pris++; p = Math.max(0, p - 12);
        bulle.classList.add('on'); souris.classList.add('boule'); SON.play('mmh');
        try { navigator.vibrate && navigator.vibrate(80); } catch (e) { }
        if (pris === 5) NARR.dire({ txt: T(D.jeu.trop), expr: 'clin' }, { vite: true }); else dis(D.jeu.vu, 'surprise');
        setTimeout(() => { bulle.classList.remove('on'); souris.classList.remove('boule'); sonne = false; }, 1200);
      };
      const victoire = () => {
        gagne = true; clearTimeout(self.t); SON.ronfleStop(); setEtat('dort'); SON.play('fanfare');
        btn.hidden = true; heure('02:40'); souris.classList.add('saute');
        NARR.dire(B(D.jeu.gagne));
        NARR.action(T(D.jeu.entrer) + ' ' + A.icone('suite'), () => { SON.play('clic'); fondu(() => self.lampe(r), 600); });
      };
      const boucle = ts => {
        if (gagne) return;
        if (dernier == null) dernier = ts; const dt = Math.min(100, ts - dernier); dernier = ts;
        if (tient && !sonne) {
          if (etat === 'reveille') vue();
          else { p = Math.min(100, p + dt * 0.02); souris.classList.add('marche'); pasT += dt; if (pasT > 260) { pasT = 0; SON.play('pas'); } }
        } else souris.classList.remove('marche');
        rendu();
        if (p >= 100) { victoire(); return; }
        self.raf = requestAnimationFrame(boucle);
      };
      const down = e => { if (e.cancelable) e.preventDefault(); SON.unlock(); tient = true; btn.classList.add('on'); };
      const up = () => { tient = false; btn.classList.remove('on'); };
      btn.addEventListener('pointerdown', down);
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, up));
      btn.addEventListener('contextmenu', e => e.preventDefault());
      window.addEventListener('blur', up);
      document.addEventListener('keydown', self.kd = e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && e.target === document.body) { down(e); } });
      document.addEventListener('keyup', self.ku = e => { if (e.key === ' ' || e.key === 'Enter') up(); });
      // Le décor remplit son cadre : le ciel s'étire vers le haut, le sol reste en bas
      const wrapJeu = $('.jeu-wrap', r);
      self.cadre = () => {
        const W = wrapJeu.clientWidth || 1, H = wrapJeu.clientHeight || 1;
        const ext = Math.max(500, Math.min(2000, Math.round(H * 1000 / W)));
        svg.setAttribute('viewBox', `0 ${500 - ext} 1000 ${ext}`);
      };
      self.cadre(); window.addEventListener('resize', self.cadre);
      rendu(); cycle(); self.raf = requestAnimationFrame(boucle);
    },
    unmount() { window.removeEventListener('resize', this.cadre); clearTimeout(this.t); clearTimeout(this.tAide); cancelAnimationFrame(this.raf); SON.ronfleStop(); document.removeEventListener('keydown', this.kd); document.removeEventListener('keyup', this.ku); document.removeEventListener('keydown', this.kdLampe); },
  };

  // ---------- Chapitre 3 : la caméra de la souris ----------
  const Ch3 = {
    render() {
      return `<section class="ch ch3">
  <div class="barre"><h2 class="decor-titre"><span class="decor-heure">La nuit dernière à 2 h 47</span>La caméra de ${esc(C.souris)}</h2><div class="actions"><button class="btn btn-petit" id="btn-revoir" hidden>Revoir</button></div></div>
  <div class="cam-wrap"><div class="cam" id="cam">
    <div class="cam-hud"><span class="rec">● REC</span><span class="cam-nom" id="cam-nom">CAM 1 · SALON</span><span class="cam-ts" id="cam-ts">${dateCam()} 02:47:00</span></div>
    ${A.camSVG()}
    <div class="dets" id="dets"></div>
    <div class="cam-grain" aria-hidden="true"></div>
    <div class="preuve"><small>FIN DE L'ENREGISTREMENT</small></div>
  </div></div>
</section>`;
    },
    mount(r) {
      const self = this, cam = $('#cam', r), dets = $('#dets', r), ts = $('#cam-ts', r), nom = $('#cam-nom', r);
      const cs1 = $('#cs1', r), cs2 = $('#cs2', r), bat = $('#bateau2', r), dent = $('#dent1', r), mot = $('#mot1', r), salon = $('#cam-salon', r), chambre = $('#cam-chambre', r);
      heure('02:47'); MUS.ambiance('camera');
      etape(() => { complete(3); badge('hibou'); show(4); });
      const mv = (el, x, y) => { el.style.transform = `translate(${x}px,${y}px)`; };
      const det = (id, label, l, t, w, h, mode) => {
        let d = $('#det-' + id, dets);
        if (!d) { d = document.createElement('div'); d.id = 'det-' + id; d.innerHTML = '<span></span>'; dets.appendChild(d); SON.play('bip'); }
        d.className = 'det' + (mode ? ' ' + mode : '');
        d.style.left = l + '%'; d.style.top = t + '%'; d.style.width = w + '%'; d.style.height = h + '%';
        d.querySelector('span').textContent = label;
      };
      const rm = id => { const d = $('#det-' + id, dets); if (d) d.remove(); };
      const instant = () => cam.classList.contains('instant');
      // Quenotte chuchote : le film se met en pause jusqu'à un toucher sur le bandeau
      let pause = false, pauseA = 0;
      // Un jeton par visite : la caméra en pause (Quenotte chuchote) ne repart pas dans un autre chapitre
      const mien = self.jeton = (self.jeton || 0) + 1, encore = () => self.jeton === mien;
      const chuchote = b => {
        if (instant()) return;
        pause = true; pauseA = performance.now(); cancelAnimationFrame(self.raf);
        NARR.dire(B(b)).then(() => NARR.attendre()).then(ok => {
          if (!pause || !ok || fini || !encore()) return;
          pause = false; debut += performance.now() - pauseA; self.raf = requestAnimationFrame(boucle);
        });
      };
      const evenements = [
        [0.3, () => { mv(cs2, -90, 200); mv(bat, -40, 236); mv(cs1, -90, 232); }],
        [0.6, () => chuchote(D.camera.intro)],
        [1.4, () => det('cheminee', C.cachetteEtiquette, 25, 40, 50, 43, 'bas')],
        [2.6, () => { mv(cs2, 40, 200); mv(bat, 90, 236); SON.play('pas'); }],
        [6.2, () => { mv(cs2, 70, 56); mv(bat, 120, 92); SON.play('pas'); rm('cheminee'); }],
        [8.2, () => { mv(bat, 160, 84); }],
        [9.6, () => { det('bateau', C.cadeau === 'piece' ? 'PIÈCE – SÈCHE' : 'BILLET – SÈCHE', 38, 26, 30, 12); chuchote(D.camera.cheminee); }],
        [12.5, () => { cs2.classList.add('coucou'); }],
        [14.5, () => { cs2.classList.remove('coucou'); mv(cs2, -90, 200); SON.play('pas'); rm('bateau'); }],
        [16, () => { salon.setAttribute('hidden', ''); chambre.removeAttribute('hidden'); nom.textContent = 'CAM 2 · CHAMBRE'; dets.innerHTML = ''; SON.play('bip'); chuchote(D.camera.chambre); }],
        [19.6, () => { mv(cs1, 60, 232); SON.play('pas'); }],
        [23.4, () => { mv(cs1, 62, 122); SON.play('pas'); }],
        [26.6, () => { dent.classList.add('prise'); chuchote(D.camera.dent); }],
        [27.4, () => det('dent', 'DENT – TROUVÉE', 30, 54, 5, 6, 'droite')],
        [29.4, () => { mot.classList.add('pose'); SON.play('papier'); rm('dent'); det('mot', 'PETIT MOT – SOUS L\'OREILLER', 28, 54, 8, 7, 'droite'); }],
        [33.4, () => { mv(cs1, 220, 236); SON.play('pas'); rm('mot'); }],
        [35.4, () => det('lit', 'SOUS LE LIT – MONSTRES : 0', 8, 79, 20, 6)],
        [39.4, () => { mv(cs1, -90, 236); SON.play('pas'); rm('lit'); chuchote(D.camera.fin); }],
        [42, () => { cam.classList.add('fin'); $('#btn-revoir', r).hidden = false; SON.play('alerte'); heure('02:52'); NARR.action(T(D.camera.bouton) + ' ' + A.icone('suite'), () => { complete(3); badge('hibou'); show(4); }); }],
      ];
      const finAt = evenements[evenements.length - 1][0];
      let debut = null, idx = 0, fini = false;
      const horo = s => { const t = 2 * 3600 + 47 * 60 + Math.floor(s * 7); ts.textContent = dateCam() + ' ' + pad(Math.floor(t / 3600)) + ':' + pad(Math.floor(t / 60) % 60) + ':' + pad(t % 60); heure(pad(Math.floor(t / 3600)) + ':' + pad(Math.floor(t / 60) % 60)); };
      const boucle = now => {
        if (fini || !encore()) return; if (debut == null) debut = now - tTest * 1000;
        const s = (now - debut) / 1000;
        while (idx < evenements.length && s >= evenements[idx][0] && !pause) evenements[idx++][1]();
        horo(Math.min(s, finAt));
        if (idx >= evenements.length) { fini = true; return; }
        if (pause) return;
        self.raf = requestAnimationFrame(boucle);
      };
      const lancer = () => {
        cancelAnimationFrame(self.raf); fini = false; debut = null; idx = 0; pause = false;
        cam.classList.remove('fin'); cam.classList.add('instant'); dets.innerHTML = ''; NARR.action(null);
        chambre.setAttribute('hidden', ''); salon.removeAttribute('hidden'); nom.textContent = 'CAM 1 · SALON'; dent.classList.remove('prise'); mot.classList.remove('pose'); cs2.classList.remove('coucou');
        evenements[0][1](); $('#btn-revoir', r).hidden = true;
        requestAnimationFrame(() => { cam.classList.remove('instant'); self.raf = requestAnimationFrame(boucle); });
      };
      $('#btn-revoir', r).onclick = () => lancer();
      lancer();
      if (RM || tTest > 0) requestAnimationFrame(() => cam.classList.add('instant'));
    },
    unmount() { this.jeton = (this.jeton || 0) + 1; cancelAnimationFrame(this.raf); },
  };

  // ---------- Chapitre 4 : la lettre ----------
  const Ch4 = {
    lignes() {
      const l = D.lettre.map(T).filter(Boolean); // une ligne sans version adaptée (null) est omise
      l.push(T(D.signature)); l.push(D.heureLettre); l.push(T(D.ps));
      return l;
    },
    render() {
      return `<section class="ch ch4">
  <div class="barre"><h2 class="decor-titre"><span class="decor-heure">La nuit dernière à 3 h 02</span>Une lettre pour ${esc(C.enfant)}</h2><div class="actions"><button class="btn btn-petit" id="btn-tout" hidden>Tout montrer</button></div></div>
  <div class="env-stage" id="env-stage">${A.enveloppeSVG(esc(C.enfant))}</div>
  <div class="lettre-stage" id="lettre-stage" hidden>
    <div class="papier" id="papier"></div>
    <div class="dessin-lettre" id="dessin-lettre" hidden></div>
  </div>
</section>`;
    },
    mount(r) {
      const self = this, lignes = this.lignes(), papier = $('#papier', r);
      heure('03:02'); MUS.ambiance('lettre');
      etape(() => { complete(4); badge('amie'); show(5); });
      NARR.dire(B(D.lettreIntro));
      let ecrit = false;
      const n = lignes.length;
      const els = lignes.map((l, i) => { const p = document.createElement('p'); p.className = 'ligne' + (i === n - 3 || i === n - 2 ? ' sign' : '') + (i === n - 1 ? ' ps' : ''); p.dataset.txt = l; papier.appendChild(p); return p; });
      // Sous la lettre : l'aperçu du dessin (comme sous le diplôme) et le bouton pour le faire ou le modifier
      const majDessin = () => {
        const z = $('#dessin-lettre', r), d = lireDessin();
        z.innerHTML = `<h3 class="dessin-titre">${A.icone('crayon')} ${esc(T(d ? D.dessin.titreAvec : D.dessin.titreSans))}</h3><p class="dessin-texte">${esc(T(d ? D.dessin.texteAvec : D.dessin.texteSans))}</p>`
          + (d ? `<figure class="dessin-enfant"><img src="${d}" alt="Le dessin de ${esc(C.enfant)} pour ${esc(C.souris)}"></figure>` : '')
          + `<button class="btn btn-petit" id="btn-dessin">${A.icone('crayon')} ${esc(T(d ? D.dessin.modifier : D.dessin.bouton))}</button>`;
        $('#btn-dessin', z).onclick = () => { SON.play('clic'); atelier(majDessin); };
      };
      majDessin();
      const termine = () => { $('#btn-tout', r).hidden = true; $('#dessin-lettre', r).hidden = false; NARR.cacher(false); NARR.dire(B(D.lettreFin)); NARR.action(A.icone(C.cadeau === 'piece' ? 'piece' : 'billet') + ' ' + T(D.boutonLettre), () => { complete(4); badge('amie'); badge('billet'); show(5); }); };
      const montreTout = () => { if (ecrit) return; ecrit = true; clearTimeout(self.t); els.forEach(p => { p.textContent = p.dataset.txt; p.classList.add('vue'); }); termine(); };
      // La lettre s'écrit lentement, mot par mot, en très gros caractères
      const ecrire = () => {
        let i = 0, j = 0, mots = [];
        const pas = () => {
          if (ecrit) return;
          if (i >= els.length) { ecrit = true; termine(); return; }
          if (j === 0) { mots = els[i].dataset.txt.split(' '); els[i].classList.add('vue'); }
          if (j < mots.length) { els[i].textContent = mots.slice(0, j + 1).join(' '); SON.play('crayon'); j++; self.t = setTimeout(pas, RM ? 60 : 300); }
          else { i++; j = 0; self.t = setTimeout(pas, RM ? 100 : 700); }
        };
        pas();
      };
      const ouvrir = () => {
        const env = $('.env', r); if (env.classList.contains('ouverte')) return;
        SON.unlock(); SON.play('cachet'); env.classList.add('ouverte');
        setTimeout(() => { $('#env-stage', r).hidden = true; $('#lettre-stage', r).hidden = false; $('#btn-tout', r).hidden = false; SON.play('papier'); NARR.cacher(true); ecrire(); }, RM ? 150 : 1100);
      };
      const cachet = $('#cachet', r);
      cachet.addEventListener('click', ouvrir); cachet.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrir(); } });
      $('#btn-tout', r).onclick = montreTout;
      if (tTest > 0) { $('.env', r).classList.add('ouverte'); $('#env-stage', r).hidden = true; $('#lettre-stage', r).hidden = false; montreTout(); }
    },
    unmount() { clearTimeout(this.t); NARR.cacher(false); },
  };

  // ---------- Chapitre 5 : le certificat ----------
  const Ch5 = {
    // L'épilogue, joué une fois avant le premier diplôme : le retour en montgolfière, puis la boîte à trésors
    epilogueHTML() {
      return `<section class="ch ch5 epilogue"><h2 class="decor-titre"><span class="decor-heure">La nuit dernière à 3 h 20</span>Retour au château</h2><div class="epi-wrap" id="epi"></div></section>`;
    },
    retour(r) {
      const self = this, zone = $('#epi', r), mien = self.jeton = (self.jeton || 0) + 1, encore = () => self.jeton === mien;
      heure('03:20'); MUS.ambiance('montgolfiere');
      etape(() => fondu(() => self.terrier(r), 400));
      zone.innerHTML = `<svg class="retour" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label="La montgolfière rentre au château entre les nuages">
${A.fond(State.nuit, 111, { x: 880, y: 90, r: 28 })}
<path d="M0 560Q250 520 500 545T1000 530V600H0Z" fill="#1E3F36"/><rect x="-600" y="598" width="2200" height="900" fill="#1E3F36"/>
<g class="ret-chateau" transform="translate(1250,560)"><rect x="-70" y="-150" width="40" height="150" fill="#F3EFE6"/><rect x="30" y="-150" width="40" height="150" fill="#F3EFE6"/><rect x="-32" y="-100" width="64" height="100" fill="#F3EFE6"/><path d="M-76-150h52l-26-44zM24-150h52l-26-44z" fill="#D64045"/><rect x="-10" y="-60" width="20" height="30" rx="10" fill="#FFC857"/></g>
${[0, 1, 2, 3, 4, 5].map(i => `<g class="nuage" data-n="${i}" transform="translate(-400,0)"><g fill="#cfd3ee" opacity=".92" transform="scale(1.15)"><circle cx="-40" cy="0" r="36"/><circle cx="0" cy="-18" r="44"/><circle cx="44" cy="0" r="36"/><ellipse cx="0" cy="16" rx="80" ry="24"/></g></g>`).join('')}
<g class="ret-ballon" transform="translate(230,330) scale(.75)">${window.DECORS.ballonSVG()}</g>
</svg>`;
      const svg = $('svg.retour', zone), ballon = $('.ret-ballon', svg), chateau = $('.ret-chateau', svg), nuages = $$('.nuage', svg);
      const borne = v => Math.max(140, Math.min(460, v));
      // enJeu : les nuages ne partent qu'après « C'est parti ! » ; atterrissage : la montgolfière se pose près du château
      let y = 330, cible = 330, bx = 230, k = 0, x = 1150, ny = 220, touche = false, heurts = 0, dernier = null, doigtT = 0, base = null, fini = false, enJeu = false, atterrissage = null;
      // D'abord l'histoire (elle reste affichée), puis les consignes, puis le départ
      (async () => {
        await NARR.dire(B(D.epilogue.intro)); if (!encore()) return;
        NARR.action(T(D.epilogue.suite) + ' ' + A.icone('suite'), async () => {
          SON.play('clic'); NARR.action(null);
          await NARR.dire(B(D.epilogue.consigne)); if (!encore()) return;
          NARR.action(A.icone('suite') + ' ' + T(D.epilogue.depart), () => { SON.play('clic'); NARR.action(null); enJeu = true; });
        });
      })();
      const point = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
      // Le doigt (n'importe où sur l'image) ou l'inclinaison du téléphone
      svg.addEventListener('pointerdown', e => { e.preventDefault(); SON.unlock(); cible = borne(point(e).y); doigtT = performance.now(); });
      svg.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') { cible = borne(point(e).y); doigtT = performance.now(); } });
      self.incline = e => { if (e.beta == null || performance.now() - doigtT < 2000) return; if (base == null) base = e.beta; cible = borne(330 + (e.beta - base) * 9); };
      window.addEventListener('deviceorientation', self.incline);
      // Au clavier : flèches haut et bas
      window.removeEventListener('keydown', self.clavierNuages);
      window.addEventListener('keydown', self.clavierNuages = e => {
        const d = { ArrowUp: -60, ArrowDown: 60 }[e.key]; if (!d) return;
        e.preventDefault(); cible = borne((cible == null ? 330 : cible) + d); doigtT = performance.now();
      });
      const nouveauNuage = () => { x = 1150; touche = false; ny = 160 + Math.random() * 280; nuages[k].classList.remove('pouf'); };
      nouveauNuage();
      const arrivee = () => {
        fini = true; nuages.forEach(n => n.setAttribute('transform', 'translate(-400,0)'));
        chateau.classList.add('arrive');
        if (heurts === 0) badge('pilote'); // pas un seul nuage touché
        // Le château arrive, puis la montgolfière descend et se pose dans l'herbe, juste à côté
        setTimeout(() => { if (encore()) atterrissage = { t: performance.now(), x0: bx, y0: y }; }, RM ? 0 : 1600);
      };
      const pose = async () => {
        if (!encore()) return;
        SON.play('allume'); await NARR.dire(B(D.epilogue.arrivee)); if (!encore()) return;
        NARR.action(A.icone('suite') + ' ' + T(D.epilogue.terrierBouton), () => { SON.play('clic'); NARR.action(null); fondu(() => self.terrier(r), 600); });
      };
      const boucle = ts => {
        if (dernier == null) dernier = ts; const dt = Math.min(60, ts - dernier); dernier = ts;
        if (atterrissage) {
          const kA = Math.min(1, (ts - atterrissage.t) / (RM ? 50 : 2600)), e = kA * kA * (3 - 2 * kA);
          bx = atterrissage.x0 + (600 - atterrissage.x0) * e; y = atterrissage.y0 + (548 - atterrissage.y0) * e;
          if (kA >= 1) { atterrissage = null; pose(); }
        } else if (!fini) y += (cible - y) * Math.min(1, dt / 160);
        ballon.setAttribute('transform', `translate(${bx.toFixed(1)},${y.toFixed(1)}) scale(.75)`);
        if (!fini && enJeu) {
          x -= dt * (0.36 + k * 0.045); // chaque nuage arrive un peu plus vite que le précédent
          nuages[k].setAttribute('transform', `translate(${x.toFixed(0)},${ny.toFixed(0)})`);
          // Un nuage touché : « pouf », il s'efface (on ne perd jamais)
          if (!touche && Math.abs(x - 230) < 105 && Math.abs(ny - (y - 120)) < 88) { touche = true; heurts++; nuages[k].classList.add('pouf'); SON.play('plouf'); NARR.dire(B(D.epilogue.pouf), { vite: true }); }
          if (x < -160) {
            if (!touche) NARR.dire({ txt: T(k === nuages.length - 2 ? D.epilogue.dernier : D.epilogue.evite[k % D.epilogue.evite.length]), expr: 'joie' }, { vite: true });
            k++;
            if (k >= nuages.length) arrivee(); else nouveauNuage();
          }
        }
        self.raf = requestAnimationFrame(boucle);
      };
      self.raf = requestAnimationFrame(boucle);
    },
    // ---------- Le terrier : un labyrinthe sous la terre, de l'entrée (à gauche) à la porte du château (à droite) ----------
    // Fabriqué à partir du profil (toujours le même pour un enfant), plongé dans le noir : seule la lanterne éclaire.
    terrier(r) {
      const self = this, mien = self.jeton = (self.jeton || 0) + 1, encore = () => self.jeton === mien;
      cancelAnimationFrame(this.raf); window.removeEventListener('deviceorientation', this.incline); window.removeEventListener('keydown', this.clavierNuages);
      heure('03:28'); MUS.ambiance('foret');
      etape(() => fondu(() => self.boite(r), 400));
      // 20 × 7 cases ; un long couloir (2 cases) mène de la dernière case à la porte
      const COULOIR = 2; // les cases du couloir, après la sortie : Quenotte y avance jusque devant la porte
      const COLS = 20, ROWS = 7, CELL = 90, X0 = 60, Y0 = 110, LARG = X0 + COLS * CELL + 2 * CELL + 160, HAUT = Y0 + ROWS * CELL + 50, PORTE_X = LARG - 110;
      // Hasard reproductible, à partir de l'identifiant du profil
      let graine = 0; for (const ch of String(window.PROFIL.id)) graine = (graine * 31 + ch.charCodeAt(0)) >>> 0;
      const hasard = () => { graine = (graine + 0x6D2B79F5) >>> 0; let t = graine; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      // Le labyrinthe (exploration en profondeur) : ouvert[c][l] = directions ouvertes
      const ouvert = [...Array(COLS)].map(() => [...Array(ROWS)].map(() => ({})));
      const DIR = { N: [0, -1, 'S'], S: [0, 1, 'N'], E: [1, 0, 'O'], O: [-1, 0, 'E'] };
      const vu = new Set(['0,0']), pile = [[0, 0]];
      while (pile.length) {
        const [c, l] = pile[pile.length - 1];
        const voisins = Object.entries(DIR).filter(([, [dx, dy]]) => { const n = c + dx, m = l + dy; return n >= 0 && n < COLS && m >= 0 && m < ROWS && !vu.has(n + ',' + m); });
        if (!voisins.length) { pile.pop(); continue; }
        const [d, [dx, dy, inverse]] = voisins[Math.floor(hasard() * voisins.length)];
        ouvert[c][l][d] = true; ouvert[c + dx][l + dy][inverse] = true;
        vu.add((c + dx) + ',' + (l + dy)); pile.push([c + dx, l + dy]);
      }
      const sortie = [COLS - 1, Math.floor(hasard() * ROWS)];
      const centre = (c, l) => [X0 + c * CELL + CELL / 2, Y0 + l * CELL + CELL / 2];
      // Le chemin le plus court vers la sortie (pour les lucioles et pour les tests)
      const chemin = (c0, l0) => {
        const prec = new Map([[c0 + ',' + l0, null]]), file = [[c0, l0]];
        while (file.length) {
          const [c, l] = file.shift(); if (c === sortie[0] && l === sortie[1]) break;
          for (const [d, [dx, dy]] of Object.entries(DIR)) if (ouvert[c][l][d]) { const k = (c + dx) + ',' + (l + dy); if (!prec.has(k)) { prec.set(k, [c, l, d]); file.push([c + dx, l + dy]); } }
        }
        const pas = []; let k = sortie[0] + ',' + sortie[1];
        while (prec.get(k)) { const [c, l, d] = prec.get(k); pas.unshift({ c, l, d }); k = c + ',' + l; }
        return pas;
      };
      // Les surprises, au fond des impasses les plus éloignées de l'entrée
      const impasses = [];
      for (let c = 0; c < COLS; c++) for (let l = 0; l < ROWS; l++) if (Object.keys(ouvert[c][l]).length === 1 && !(c === 0 && l === 0) && !(c === sortie[0] && l === sortie[1])) impasses.push([c, l]);
      // Distance (en cases) de chaque impasse au bon chemin : on garde les plus proches, bien réparties de gauche à droite
      const surLeChemin = new Set(['0,0', ...chemin(0, 0).map(p => { const [dx, dy] = DIR[p.d]; return (p.c + dx) + ',' + (p.l + dy); })]);
      const distance = (c0, l0) => {
        const vus = new Map([[c0 + ',' + l0, 0]]), file = [[c0, l0]];
        while (file.length) { const [c, l] = file.shift(), d = vus.get(c + ',' + l); if (surLeChemin.has(c + ',' + l)) return d; for (const [k, [dx, dy]] of Object.entries(DIR)) if (ouvert[c][l][k] && !vus.has((c + dx) + ',' + (l + dy))) { vus.set((c + dx) + ',' + (l + dy), d + 1); file.push([c + dx, l + dy]); } }
        return 99;
      };
      impasses.sort((p, q) => distance(p[0], p[1]) - distance(q[0], q[1]) || p[0] - q[0]);
      const SURPRISES = ['ver', 'carotte', 'fossile', 'piece'], choisies = [];
      for (const p of impasses) { if (choisies.length >= 4) break; if (choisies.every(q => Math.abs(q[0] - p[0]) >= 3)) choisies.push(p); }
      choisies.sort((p, q) => p[0] - q[0]);
      const surprises = choisies.map((p, i) => ({ id: SURPRISES[i], c: p[0], l: p[1], vue: false }));
      const DESSIN_SURPRISE = {
        ver: '<path d="M-22 6q8-14 16 0t16 0 14-4" fill="none" stroke="#E98BA0" stroke-width="7" stroke-linecap="round"/><circle cx="24" cy="1" r="1.6" fill="#2B2B33"/>',
        carotte: '<path d="M-20 -6l34 6-34 6z" fill="#E8833A"/><path d="M14 0l10-8M14 0l12 0M14 0l10 8" stroke="#3E9A6B" stroke-width="3" stroke-linecap="round"/>',
        fossile: '<circle r="16" fill="#cbbfa8"/><path d="M0 0m-10 0a10 10 0 1 0 10-10a6 6 0 1 1-6 6a3 3 0 1 0 3-3" fill="none" stroke="#8a7a5c" stroke-width="2.4"/>',
        piece: '<circle r="13" fill="#C9A227" stroke="#8a6a12" stroke-width="2.5"/><path d="M-5-4h10M-5 4h10" stroke="#8a6a12" stroke-width="2"/>',
      };
      // ---------- Le dessin : couches de terre, cailloux, racines, galeries ----------
      let galeries = '', clair = '';
      for (let c = 0; c < COLS; c++) for (let l = 0; l < ROWS; l++) {
        const [x, y] = centre(c, l);
        galeries += `<circle cx="${x}" cy="${y}" r="31"/>`; clair += `<circle cx="${x}" cy="${y - 4}" r="20"/>`;
        if (ouvert[c][l].E) { galeries += `<path d="M${x} ${y}h${CELL}"/>`; clair += `<path d="M${x} ${y - 4}h${CELL}"/>`; }
        if (ouvert[c][l].S) { galeries += `<path d="M${x} ${y}v${CELL}"/>`; clair += `<path d="M${x} ${y - 4}v${CELL}"/>`; }
      }
      const [ex0, ey0] = centre(0, 0), [sx, sy] = centre(sortie[0], sortie[1]);
      galeries += `<path d="M${ex0} ${ey0}V40"/><path d="M${sx} ${sy}H${PORTE_X}"/>`;
      clair += `<path d="M${ex0} ${ey0}V44"/><path d="M${sx} ${sy - 4}H${PORTE_X}"/>`;
      let cailloux = '';
      for (let i = 0; i < 160; i++) cailloux += `<ellipse cx="${(hasard() * LARG).toFixed(0)}" cy="${(60 + hasard() * (HAUT - 60)).toFixed(0)}" rx="${(3 + hasard() * 9).toFixed(1)}" ry="${(2 + hasard() * 6).toFixed(1)}" fill="${['#6b4a33', '#4a3222', '#7d5b40', '#3b2618'][i % 4]}" opacity="${(0.5 + hasard() * 0.5).toFixed(2)}"/>`;
      let racines = '';
      for (let i = 0; i < 14; i++) { const x = 100 + hasard() * (LARG - 200), h = 40 + hasard() * 110; racines += `<path d="M${x.toFixed(0)} 60q${(hasard() * 30 - 15).toFixed(0)} ${(h / 2).toFixed(0)} ${(hasard() * 20 - 10).toFixed(0)} ${h.toFixed(0)}" fill="none" stroke="#2a1a10" stroke-width="${(2 + hasard() * 3).toFixed(1)}" stroke-linecap="round" opacity=".7"/>`; }
      const solution = chemin(0, 0);
      // Pour les tests : le trajet qui passe par les 4 trésors, de case en case (directions N, S, E, O)
      const route = (a, b) => {
        const prec = new Map([[a.join(), null]]), file = [a];
        while (file.length) { const [c, l] = file.shift(); if (c === b[0] && l === b[1]) break; for (const [d, [dx, dy]] of Object.entries(DIR)) if (ouvert[c][l][d] && !prec.has((c + dx) + ',' + (l + dy))) { prec.set((c + dx) + ',' + (l + dy), [c, l, d]); file.push([c + dx, l + dy]); } }
        let k = b.join(), out = ''; while (prec.get(k)) { const [c, l, d] = prec.get(k); out = d + out; k = c + ',' + l; } return out;
      };
      let ici = [0, 0], tourTresors = '';
      surprises.forEach(t => { tourTresors += route(ici, [t.c, t.l]); ici = [t.c, t.l]; });
      const zone = $('#epi', r);
      // Les trésors du terrier, en grisé en haut : ils s'allument quand Quenotte passe dessus
      const tresors = `<div class="tresors" aria-live="polite"><span class="tresors-titre">Trésors du terrier : <b class="tresors-n">0</b> / ${surprises.length}</span><span class="tresors-liste">${surprises.map(t => `<svg class="tresor" data-id="${t.id}" viewBox="-30 -24 60 48" aria-hidden="true">${DESSIN_SURPRISE[t.id]}</svg>`).join('')}</span></div>`;
      zone.innerHTML = tresors + `<svg class="terrier" viewBox="0 0 600 ${HAUT}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Le terrier de Quenotte : un labyrinthe sous la terre, jusqu'à la porte du château" data-tresors="${tourTresors}" data-solution="${solution.map(p => p.d).join('')}${'E'.repeat(COULOIR)}">
<defs>
  <linearGradient id="g-terre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a33"/><stop offset=".45" stop-color="#4f3524"/><stop offset="1" stop-color="#2e1d12"/></linearGradient>
  <radialGradient id="g-lanterne"><stop offset=".45" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
  <mask id="m-terrier" maskUnits="userSpaceOnUse" x="-200" y="-200" width="${LARG + 400}" height="${HAUT + 400}"><rect x="-200" y="-200" width="${LARG + 400}" height="${HAUT + 400}" fill="#fff"/><circle class="lumiere" cx="${ex0}" cy="${ey0}" r="190" fill="url(#g-lanterne)"/></mask>
</defs>
<rect x="-400" y="-400" width="${LARG + 800}" height="${HAUT + 800}" fill="url(#g-terre)"/>
<g opacity=".35" fill="none" stroke="#2e1d12" stroke-width="10">${[180, 300, 420, 560].map(y => `<path d="M-100 ${y}Q${LARG / 4} ${y - 20} ${LARG / 2} ${y}T${LARG + 100} ${y}"/>`).join('')}</g>
${cailloux}
<rect x="-400" y="-400" width="${LARG + 800}" height="440" fill="#141A3A"/><path d="M-400 40H${LARG + 400}V62H-400Z" fill="#2F5D50"/><path d="M-400 40${[...Array(Math.ceil((LARG + 800) / 16))].map(() => 'l8-10l8 10').join('')}" fill="#3E7C50"/>
${racines}
<g class="galeries" fill="none" stroke="#9c7650" stroke-width="62" stroke-linecap="round"><g fill="#9c7650" stroke="none">${galeries.match(/<circle[^>]*>/g).join('')}</g>${galeries.replace(/<circle[^>]*>/g, '')}</g>
<g fill="none" stroke="#b58c62" stroke-width="30" stroke-linecap="round" opacity=".55"><g fill="#b58c62" stroke="none">${clair.match(/<circle[^>]*>/g).join('')}</g>${clair.replace(/<circle[^>]*>/g, '')}</g>
<g transform="translate(${ex0},36)"><ellipse rx="44" ry="14" fill="#1a110a"/></g>
<g class="porte-chateau" role="button" tabindex="0" aria-label="La porte du château" transform="translate(${PORTE_X},${sy})"><circle class="porte-lueur" r="70" fill="url(#glow)"/><rect x="-10" y="-70" width="90" height="140" fill="#8a8395"/><circle r="46" fill="#6b6560"/><g class="battant"><circle r="40" fill="#8B5A3C" stroke="#5c3a24" stroke-width="4"/><path d="M-40 0h80M0-40v80" stroke="#6E4630" stroke-width="3" opacity=".6"/><use href="#dent" x="-9" y="-11" width="18" height="18" opacity=".85"/></g></g>
${surprises.map(s => { const [x, y] = centre(s.c, s.l); return `<g class="surprise" data-id="${s.id}" transform="translate(${x},${y + 12})">${DESSIN_SURPRISE[s.id]}</g>`; }).join('')}
<g class="q-terrier"><circle r="34" fill="url(#glow)"/>${A.souris(-38, -40, 76)}</g>
<rect class="nuit-terrier" x="-400" y="-400" width="${LARG + 800}" height="${HAUT + 800}" fill="#0b0705" mask="url(#m-terrier)"/>
</svg>`;
      const svg = $('svg.terrier', zone), q = $('.q-terrier', svg), lumiere = $('.lumiere', svg), porte = $('.porte-chateau', svg);
      NARR.dire(B(D.epilogue.terrier));
      let pos = [0, 0], qx = ex0, qy = 40, depart = null, but = null, fini = false, cible = null, camX = 0, devantPorte = false;
      // On entre par le trou, en haut à gauche
      depart = { x: ex0, y: 40, t: performance.now() }; but = { x: ex0, y: ey0 };
      const DUREE = RM ? 40 : 170;
      const point = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
      const avance = d => {
        if (fini || but) return false;
        const [c, l] = pos;
        // Le couloir de la porte : de la case de sortie, on continue vers l'est (et on peut revenir)
        const dansCouloir = c >= COLS, versCouloir = c === sortie[0] && l === sortie[1] && d === 'E';
        if (dansCouloir ? !((d === 'E' && c < COLS + COULOIR - 1) || d === 'O') : !(ouvert[c][l][d] || versCouloir)) return false;
        const [dx, dy] = DIR[d]; pos = [c + dx, l + dy];
        const [x, y] = centre(pos[0], pos[1]);
        depart = { x: qx, y: qy, t: performance.now() }; but = { x, y };
        SON.play('pas');
        return true;
      };
      const arrive = () => {
        if (fini) return;
        // Une surprise : son texte revient à chaque passage
        const s = surprises.find(s => s.c === pos[0] && s.l === pos[1]);
        if (s) {
          const g = $(`.surprise[data-id="${s.id}"]`, svg); if (g) g.classList.add('vue');
          if (!s.vue) { SON.play('etoile'); const t = $(`.tresor[data-id="${s.id}"]`, zone); if (t) t.classList.add('trouve'); }
          s.vue = true; $('.tresors-n', zone).textContent = surprises.filter(x => x.vue).length;
          if (surprises.every(x => x.vue)) badge('terrier'); // les 4 trésors : un badge
          NARR.dire(B(D.epilogue.surprises[s.id]), { vite: true });
        }
        // Devant la porte du château : elle brille, il faut la toucher pour entrer
        devantPorte = pos[0] === COLS + COULOIR - 1;
        svg.classList.toggle('devant-porte', devantPorte);
        if (devantPorte) NARR.dire(B(D.epilogue.toucherPorte), { vite: true });
      };
      // Entrer : Quenotte longe le couloir jusqu'à la porte, qui s'ouvre
      const entrer = () => {
        if (fini || but || !devantPorte) { SON.play('toc'); return; }
        fini = true; svg.classList.remove('devant-porte');
        depart = { x: qx, y: qy, t: performance.now() }; but = { x: PORTE_X - 50, y: sy };
        setTimeout(async () => {
          if (!encore()) return;
          svg.classList.add('ouverte'); SON.play('cachet');
          await NARR.dire(B(D.epilogue.porte)); if (!encore()) return;
          NARR.action(A.icone('etoile') + ' ' + T(D.epilogue.bouton), () => { SON.play('clic'); NARR.action(null); fondu(() => self.boite(r), 600); });
        }, RM ? 80 : 700);
      };
      porte.addEventListener('click', e => { e.stopPropagation(); entrer(); });
      // Le doigt montre le chemin : Quenotte avance de case en case vers lui
      svg.addEventListener('pointerdown', e => {
        e.preventDefault(); SON.unlock();
        const p = point(e);
        // Un toucher sur la porte (quand on est devant) : on entre
        if (devantPorte && Math.hypot(p.x - PORTE_X, p.y - sy) < 70) { entrer(); return; }
        cible = p; try { svg.setPointerCapture(e.pointerId); } catch (er) { }
      });
      svg.addEventListener('pointermove', e => { if (cible) cible = point(e); });
      ['pointerup', 'pointercancel'].forEach(n => svg.addEventListener(n, () => { cible = null; }));
      self.clavier = e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entrer(); return; }
        const d = { ArrowUp: 'N', ArrowDown: 'S', ArrowRight: 'E', ArrowLeft: 'O' }[e.key]; if (d) { e.preventDefault(); avance(d); }
      };
      window.addEventListener('keydown', self.clavier);
      const boucle = ts => {
        if (but) {
          const k = Math.min(1, (ts - depart.t) / DUREE);
          qx = depart.x + (but.x - depart.x) * k; qy = depart.y + (but.y - depart.y) * k;
          if (k >= 1) { const fin = !fini; but = null; if (fin || !fini) arrive(); }
        } else if (cible && !fini) {
          const dx = cible.x - qx, dy = cible.y - qy;
          if (Math.hypot(dx, dy) > 34) {
            const prem = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'O') : (dy > 0 ? 'S' : 'N');
            const sec = Math.abs(dx) > Math.abs(dy) ? (dy > 0 ? 'S' : 'N') : (dx > 0 ? 'E' : 'O');
            if (!avance(prem) && Math.min(Math.abs(dx), Math.abs(dy)) > 24) avance(sec);
          }
        }
        q.setAttribute('transform', `translate(${qx.toFixed(1)},${qy.toFixed(1)})`);
        lumiere.setAttribute('cx', qx.toFixed(1)); lumiere.setAttribute('cy', qy.toFixed(1));
        // La caméra suit Quenotte : le terrier défile de gauche à droite
        const vb = svg.viewBox.baseVal, rect = svg.getBoundingClientRect();
        const largeurVue = Math.max(420, Math.min(LARG, HAUT * rect.width / Math.max(1, rect.height)));
        const voulu = Math.max(0, Math.min(LARG - largeurVue, qx - largeurVue * 0.4));
        camX += (voulu - camX) * (RM ? 1 : 0.12);
        svg.setAttribute('viewBox', `${camX.toFixed(1)} 0 ${largeurVue.toFixed(0)} ${HAUT}`);
        if (vb) self.raf = requestAnimationFrame(boucle);
      };
      self.raf = requestAnimationFrame(boucle);
    },
    boite(r) {
      this.jeton = (this.jeton || 0) + 1;
      etape(() => show(5, { diplome: true }));
      cancelAnimationFrame(this.raf); window.removeEventListener('deviceorientation', this.incline);
      window.removeEventListener('keydown', this.clavier); clearTimeout(this.tAide);
      const zone = $('#epi', r), places = window.PLACES_DENTS, P = window.PROFIL.profil;
      const deja = new Set(P.dents.deja), cible = places.find(t => t.d === P.dents.nuit);
      const dent = t => `<g transform="translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) rotate(${t.angle.toFixed(1)})"><path d="${window.FORME_DENT(t)}" stroke-linejoin="round" ${t.d === P.dents.nuit ? 'class="place-nuit" fill="none" stroke="#FFC857" stroke-width="2.5" stroke-dasharray="5 4"' : deja.has(t.d) ? 'class="deja" fill="#fff" stroke="#F2A3B5" stroke-width="2"' : 'fill="none" stroke="#6b4a6e" stroke-width="1.5" opacity=".6"'}/></g>`;
      zone.innerHTML = `<svg class="boite" viewBox="0 0 340 400" role="img" aria-label="La boîte à trésors : fais glisser ta dent jusqu'à sa place">
<rect x="6" y="20" width="328" height="290" rx="22" fill="#6E4630" stroke="#4a2e1e" stroke-width="5"/><rect x="20" y="34" width="300" height="262" rx="16" fill="#3a1f3d"/>
<g class="paillettes" fill="#FFC857">${[[40, 60], [300, 70], [60, 270], [290, 260], [170, 150]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2"/>`).join('')}</g>
<path d="${window.GENCIVES()}" fill="none" stroke="#5a2f4f" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
${places.map(dent).join('')}
<text x="170" y="155" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="15" font-weight="800" fill="#FFC857">${esc(C.enfant)}</text>
<g class="dent-a-ranger" tabindex="0" role="button" aria-label="Ta dent : fais-la glisser jusqu'à sa place" transform="translate(170,355)"><circle r="34" fill="url(#glow)"/><use href="#dent" x="-20" y="-20" width="40" height="40"/></g>
</svg>`;
      const svg = $('svg.boite', zone), d = $('.dent-a-ranger', svg), place = $('.place-nuit', svg);
      NARR.dire(B(D.epilogue.boite));
      const point = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
      let tire = false, range = false;
      const pose = (px, py) => d.setAttribute('transform', `translate(${px.toFixed(1)},${py.toFixed(1)})`);
      const ranger = () => {
        range = true; tire = false; pose(cible.x, cible.y); d.classList.add('rangee'); place.classList.add('rangee');
        SON.play('fanfare'); NARR.dire(B(D.epilogue.rangee));
        NARR.action(A.icone('suite') + ' ' + T(D.epilogue.diplome), () => { State.epilogue = true; save(); SON.play('clic'); fondu(() => show(5, { diplome: true }), 700); });
      };
      d.addEventListener('pointerdown', e => { if (range) return; e.preventDefault(); tire = true; SON.unlock(); SON.play('clic'); try { d.setPointerCapture(e.pointerId); } catch (er) { } });
      d.addEventListener('pointermove', e => { if (!tire) return; const p = point(e); pose(p.x, p.y); });
      d.addEventListener('pointerup', e => {
        if (!tire || range) return; tire = false;
        const p = point(e);
        if (Math.hypot(p.x - cible.x, p.y - cible.y) < 34) ranger(); else { pose(170, 355); SON.play('toc'); }
      });
      d.addEventListener('keydown', e => { if (!range && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); ranger(); } });
    },
    // Le chapitre 5 commence toujours par l'épilogue (après la lettre comme depuis le « 5 » du ruban) ;
    // le diplôme vient ensuite (opts.diplome)
    render(opts) {
      if (!(opts && opts.diplome)) return this.epilogueHTML();
      const qs = 'badges=' + encodeURIComponent(State.badges.join(',')) + '&secret=' + (State.secret ? 1 : 0) + '&nuit=' + State.nuit + '&etoiles=' + nbEtoiles();
      return `<section class="ch ch5">
  <h2 class="decor-titre"><span class="decor-heure">La nuit dernière à 3 h 40</span>Bravo ${esc(C.enfant)} !</h2>
  <div class="confettis" aria-hidden="true"></div>
  <div class="diplome-wrap">${window.CERTIFICAT.html({ badges: State.badges.concat(State.badges.indexOf('jumelle') < 0 ? ['jumelle'] : []), secret: State.secret, nuitTexte: nuitTexte(), etoiles: nbEtoiles(), total: totalEtoiles })}</div>
  <div class="fin">
    <a class="btn btn-grand btn-or" id="btn-imprimer" href="certificat/?${qs}#p=${window.PROFIL.code}" target="_blank" rel="noopener">${A.icone('imprimer')} Imprimer le diplôme</a>
    <button class="btn btn-petit" id="btn-album5">${A.icone('etoile')} ${esc(T(D.album.titre))}</button>
    <button class="btn btn-petit" id="btn-revoir5">Revoir l'histoire</button>
  </div>
  ${lireDessin() ? `<figure class="dessin-enfant"><figcaption>Ton dessin pour ${esc(C.souris)}</figcaption><img src="${lireDessin()}" alt="Le dessin de ${esc(C.enfant)} pour ${esc(C.souris)}"></figure>` : ''}
  <div class="fin"><button class="btn btn-petit" id="btn-dessin5">${A.icone('crayon')} ${esc(T(lireDessin() ? D.dessin.modifier : D.dessin.faire))}</button></div>
</section>`;
    },
    mount(r, opts) {
      if (!(opts && opts.diplome)) { this.retour(r); return; }
      heure('03:40'); MUS.ambiance('diplome');
      const premiere = !State.fini;
      complete(5); if (premiere) { State.fini = true; save(); }
      rangerDansAlbum();
      badge('jumelle');
      if (premiere) SON.play('fanfare');
      NARR.dire(B(D.diplome));
      if (!RM) { const c = $('.confettis', r); const couleurs = ['#FFC857', '#D64045', '#F2A3B5', '#3E7C8F', '#F3EFE6']; for (let i = 0; i < 40; i++) { const s = document.createElement('i'); s.style.left = (Math.random() * 100) + '%'; s.style.background = couleurs[i % couleurs.length]; s.style.animationDelay = (Math.random() * 2.5) + 's'; s.style.animationDuration = (3 + Math.random() * 3) + 's'; c.appendChild(s); } }
      window.CERTIFICAT.brancher($('.diplome-wrap', r));
      $('#btn-revoir5', r).onclick = () => show(1, { scene: 0 });
      $('#btn-album5', r).onclick = album;
      // Après l'atelier, le diplôme se redessine avec le nouveau dessin
      $('#btn-dessin5', r).onclick = () => { SON.play('clic'); atelier(() => show(5, { diplome: true })); };
    },
    unmount() { this.jeton = (this.jeton || 0) + 1; cancelAnimationFrame(this.raf); window.removeEventListener('deviceorientation', this.incline); window.removeEventListener('keydown', this.clavierNuages); window.removeEventListener('keydown', this.clavier); clearTimeout(this.tAide); },
  };

  const Chapitres = [Ch0, Ch1, Ch2, Ch3, Ch4, Ch5];

  // ---------- Démarrage ----------
  document.body.insertAdjacentHTML('afterbegin', A.symboles());
  document.body.insertAdjacentHTML('beforeend', `<button class="btn-passer" id="btn-passer" hidden>Passer ${A.icone('vite')}</button>`);
  $('#btn-passer').onclick = () => {
    const f = passerEtape; if (!f) return; SON.play('clic'); NARR.action(null);
    etape(null); const vue = affichages; f();
    // Même chapitre (les scènes du chapitre 1) : sans nouvelle étape déclarée, la même façon de passer resservira
    setTimeout(() => { if (passerEtape === null && affichages === vue) etape(f); }, 1200);
  };
  NARR.init();
  buildFil();
  // Premier toucher : on autorise les sons et on lance la musique d'ambiance
  const GESTES = ['pointerdown', 'touchend', 'click', 'keydown'];
  const premierGeste = () => { SON.unlock(); MUS.demarrer(); GESTES.forEach(g => document.removeEventListener(g, premierGeste)); };
  GESTES.forEach(g => document.addEventListener(g, premierGeste));
  // Plein écran automatique au premier toucher (une seule tentative : si on en sort, le bouton du ruban permet d'y revenir)
  if (PLEIN.api && !PLEIN.appli) {
    const autoPlein = e => {
      if (e.target && e.target.closest && e.target.closest('.prefs')) return;
      document.removeEventListener('click', autoPlein, true);
      if (!PLEIN.actif()) PLEIN.entrer();
    };
    document.addEventListener('click', autoPlein, true);
  }
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(n => document.addEventListener(n, boutonPlein));

  // Le « # » de l'adresse porte le profil de l'enfant ; on démarre toujours par l'accueil (ou ?chapitre=n pour tester)
  // Ouverture sans QR code ni #exemple : l'écran de choix du parcours
  if (demande != null) show(demande); else if (window.PROFIL.origine === 'choix') afficherChoix(); else show(0);

  // Exposé pour les tests
  window.APP = { show, state: State, nuitTexte };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
