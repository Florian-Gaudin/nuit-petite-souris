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
  // Le vibreur (mini-jeu du chat) : activé par défaut, coupé depuis les réglages
  const CLE_VIBRE = 'souris.vibreur';
  const vibreurActif = () => window.STOCKAGE.lire(CLE_VIBRE) !== '0';
  const vibrer = ms => { if (!vibreurActif()) return; try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } };
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
  // Seules comptent les étoiles qui existent encore dans l'histoire (un élément renommé, comme l'ancien fromage, est ignoré)
  const etoilesValides = k => { const sc = D.scenes.find(s => s.id === k); return sc ? (State.etoiles[k] || []).filter(e => sc.bonus.indexOf(e) >= 0) : []; };
  function nbEtoiles() { return Object.keys(State.etoiles).reduce((n, k) => n + etoilesValides(k).length, 0); }
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
  function badge(id, discret) {
    const b = D.badges.find(x => x.id === id);
    if (!b || State.badges.indexOf(id) >= 0) return;
    State.badges.push(id); save();
    if (!discret) { toast('Badge gagné : ' + T(b.nom), A.badgeIcone(id, 36)); SON.play('badge'); }
  }
  function etoile(sceneId, el) {
    const liste = State.etoiles[sceneId] || (State.etoiles[sceneId] = []);
    if (liste.indexOf(el) >= 0) return;
    liste.push(el); State.indices = true; save(); // une étoile trouvée : le conseil des secrets n'est plus utile
    const n = nbEtoiles();
    const sc = D.scenes.find(s => s.id === sceneId);
    toast((sc && etoilesValides(sceneId).length >= sc.bonus.length ? D.etoilesToutes : D.etoile) + ' (' + n + '/' + totalEtoiles + ')', `<svg class="badge-ico" width="34" height="34" viewBox="0 0 24 24"><use href="#etoile5"/></svg>`);
    SON.play('etoile');
    D.badges.filter(b => b.etoiles && n >= b.etoiles).forEach(b => setTimeout(() => badge(b.id), 1500));
  }
  // Les secrets des Ardennes (feuille de chêne) : à part des étoiles ; tous trouvés = badge « Ardennais d'honneur »
  const SECRETS_ARDENNES = D.scenes.reduce((l, s) => l.concat((s.ardennes || []).map(i => s.id + '.' + i)), []);
  function ardennais(sceneId, el) {
    const cle = sceneId + '.' + el, liste = State.ardennes || (State.ardennes = []);
    if (liste.indexOf(cle) >= 0) return;
    liste.push(cle); save();
    const n = SECRETS_ARDENNES.filter(c => liste.indexOf(c) >= 0).length;
    toast((n === SECRETS_ARDENNES.length ? D.ardennesTous : D.ardennesTrouve) + ' (' + n + '/' + SECRETS_ARDENNES.length + ')', `<svg class="badge-ico" width="34" height="34" viewBox="0 0 24 24"><path d="M12 1C14 1 15 3 14.5 4.5C17 4 18 6 16 7.5C19 7.5 19.5 10 17 11C19.5 11.5 19 14.5 16 14C17 16 15.5 17.5 13.2 17L12.6 19V22.5H11.4V19L10.8 17C8.5 17.5 7 16 8 14C5 14.5 4.5 11.5 7 11C4.5 10 5 7.5 8 7.5C6 6 7 4 9.5 4.5C9 3 10 1 12 1Z" fill="#9BC53D" stroke="#3E6B1F"/></svg>`);
    SON.play('etoile');
    if (n === SECRETS_ARDENNES.length) setTimeout(() => badge('ardennais'), 1500);
  }
  // Les cartes du carnet sans feuille de chêne : trouvées en vivant le moment qu'elles racontent (elles ne
  // comptent pas pour le badge, réservé aux secrets à la feuille de chêne)
  function carteArd(sceneId, el) {
    const cle = sceneId + '.' + el, AR = window.ARDENNES;
    if (SECRETS_ARDENNES.indexOf(cle) >= 0 || !AR) return;
    const c = AR.cartes.find(k => k.secret === cle); if (!c) return;
    const liste = State.ardennes || (State.ardennes = []);
    if (liste.indexOf(cle) >= 0) return;
    liste.push(cle); save();
    toast(AR.nouvelleCarte.replace('{titre}', c.titre), `<svg class="badge-ico" width="34" height="34" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" fill="#FFF6E0" stroke="#8B5A3C" stroke-width="1.5"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#8B5A3C" stroke-width="1.4" stroke-linecap="round"/></svg>`);
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
    const perles = maison + [1, 2, 3, 4, 5].map(i => `<button class="perle" data-n="${i}" aria-label="Chapitre ${i}"><span>${i}</span></button>`).join('')
      // Le diplôme, en accès direct une fois l'histoire terminée
      + `<button class="perle perle-dip" data-n="dip" aria-label="Mon diplôme" title="Mon diplôme" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2" fill="#FFF6E0" stroke="#C9A227" stroke-width="1.5"/><path d="M6 9h9M6 12h6" stroke="#8a7a5c" stroke-width="1.4" stroke-linecap="round"/><circle cx="17" cy="14" r="3" fill="#D64045"/><path d="M15.5 16.5l-1 4 2.5-1.5 2.5 1.5-1-4" fill="#D64045"/></svg></button>`;
    $('#fil').innerHTML = `<div class="fil-in">
      <div class="ruban" aria-label="Progression de l'histoire">${perles}<div class="fil-souris"><svg viewBox="0 0 130 100"><use href="#souris-side"/></svg></div></div>
      <div class="prefs">
        <button class="btn-ico" id="btn-prefs" aria-label="Menu" aria-haspopup="true" aria-expanded="false">${A.icone('reglages')}</button>
        <div class="prefs-menu" id="prefs-menu" role="menu" aria-label="Menu" hidden>
          <div class="prefs-tete"><a role="menuitem" id="pref-changer" class="prefs-accueil" href="./"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/></svg> Accueil</a><button role="menuitem" id="pref-fermer" class="prefs-x" aria-label="Fermer le menu">✕</button></div>
          <div role="group" aria-labelledby="g-tresors" id="groupe-tresors" hidden><p class="prefs-titre" id="g-tresors">Mes trésors</p>
            <button role="menuitem" id="pref-diplome" hidden><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3.5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 8h10M7 11.5h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="17" r="3.2" fill="currentColor"/><path d="M14.4 19.5l-.9 3.5 2.5-1.3 2.5 1.3-.9-3.5" fill="currentColor"/></svg> ${esc(T(D.fin.menuDiplome))}</button>
            <button role="menuitem" id="pref-tresors" hidden><svg class="ico" viewBox="-32 -50 64 86" aria-hidden="true"><path d="M-13-45h10l8 22h-10zM13-45h-10l-8 22h10z" fill="currentColor" opacity=".7"/><circle cy="6" r="25" fill="none" stroke="currentColor" stroke-width="7"/><path d="M0-8l4 9 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="currentColor"/></svg> ${esc(T(D.tresors.menu))}</button>
            <button role="menuitem" id="pref-carnet" hidden><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1C14 1 15 3 14.5 4.5C17 4 18 6 16 7.5C19 7.5 19.5 10 17 11C19.5 11.5 19 14.5 16 14C17 16 15.5 17.5 13.2 17L12.6 19V22.5H11.4V19L10.8 17C8.5 17.5 7 16 8 14C5 14.5 4.5 11.5 7 11C4.5 10 5 7.5 8 7.5C6 6 7 4 9.5 4.5C9 3 10 1 12 1Z" fill="currentColor"/></svg> Le carnet des Ardennes</button>
            <button role="menuitem" id="pref-album" hidden>${A.icone('etoile')} ${esc(T(D.album.titre))}</button>
          </div>
          <div role="group" aria-labelledby="g-lire" class="groupe-reglages"><button role="menuitem" class="prefs-titre prefs-plier" id="g-lire" aria-expanded="false" aria-controls="reglages-liens">Réglages <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            <div id="reglages-liens" hidden>
            <button role="menuitemcheckbox" id="pref-son" class="interrupteur" aria-checked="false"><span class="pref-lib"></span><span class="bascule" aria-hidden="true"></span></button>
            <button role="menuitemcheckbox" id="pref-grand" class="interrupteur" aria-checked="false"><span class="pref-lib"></span><span class="bascule" aria-hidden="true"></span></button>
            ${PLEIN.api && !PLEIN.appli ? '<button role="menuitemcheckbox" id="pref-plein" class="interrupteur" aria-checked="false"><span class="pref-lib"></span><span class="bascule" aria-hidden="true"></span></button>' : ''}
            ${'vibrate' in navigator ? '<button role="menuitemcheckbox" id="pref-vibreur" class="interrupteur" aria-checked="false"><span class="pref-lib"></span><span class="bascule" aria-hidden="true"></span></button>' : ''}
            </div>
          </div>
          <div role="group" aria-labelledby="g-grands" class="groupe-grands"><button role="menuitem" class="prefs-titre prefs-plier" id="g-grands" aria-expanded="false" aria-controls="grands-liens">Pour les grands <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            <div id="grands-liens" hidden>
            <a role="menuitem" id="pref-parents" href="parents/">${A.icone('famille')} Espace parents</a>
            <a role="menuitem" id="pref-video" href="decouvrir/"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/></svg> La vidéo de présentation</a>
            <a role="menuitem" id="pref-infos" href="infos/"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10.5v6M12 7.2v.1" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg> Informations</a>
            <div class="prefs-bas"><button role="menuitem" id="pref-reset" class="danger">${A.icone('recommencer')} Recommencer l'histoire</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    const menu = $('#prefs-menu'), bPrefs = $('#btn-prefs');
    // Un interrupteur : son libellé, et sa position (aria-checked)
    const bascule = (id, ico, libelle, on) => {
      const b = $('#' + id); if (!b) return;
      b.querySelector('.pref-lib').innerHTML = ico + ' ' + libelle;
      b.setAttribute('aria-checked', String(!!on));
    };
    const majPrefs = () => {
      bascule('pref-son', A.icone(SON.muet ? 'muet' : 'son'), 'Son et musique', !SON.muet);
      const grand = document.documentElement.classList.contains('grand-texte');
      bascule('pref-grand', `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><text x="1" y="19" font-size="13" font-weight="800" fill="currentColor" font-family="sans-serif">A</text><text x="10" y="20" font-size="19" font-weight="800" fill="currentColor" font-family="sans-serif">A</text></svg>`, 'Grand texte', grand);
      bascule('pref-plein', A.icone(PLEIN.actif() ? 'reduire' : 'plein'), 'Plein écran', PLEIN.actif());
      bascule('pref-vibreur', `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="3" width="8" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 8v8M20 8v8M1.5 10v4M22.5 10v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`, 'Vibreur', vibreurActif());
      // Mes trésors : le carnet dès la première carte découverte, l'album dès la première histoire rangée
      const carnetVu = window.CARNET && window.CARNET.compte(State).n > 0, albumVu = lireAlbum().length > 0 && !document.body.classList.contains('mode-choix'); // sur l'accueil, l'album a son bouton
      // Mes trésors : chaque entrée apparaît dès que l'un de ses éléments est découvert
      //   le diplôme : l'histoire terminée ; les badges et les étoiles : le premier badge ou la première étoile ;
      //   le carnet : la première carte ; l'album : la première histoire rangée
      const surAccueil = document.body.classList.contains('mode-choix');
      const diplomeVu = !!State.fini && !surAccueil;
      const tresorsVu = (State.badges.length > 0 || nbEtoiles() > 0) && !surAccueil;
      $('#pref-diplome').hidden = !diplomeVu; $('#pref-tresors').hidden = !tresorsVu; $('#pref-carnet').hidden = !carnetVu; $('#pref-album').hidden = !albumVu; $('#groupe-tresors').hidden = !carnetVu && !albumVu && !tresorsVu && !diplomeVu;
      $('#pref-reset').innerHTML = A.icone('recommencer') + " Recommencer l'histoire"; $('#pref-reset').classList.remove('confirme');
      plierGrands(true);
      plier('g-lire', 'reglages-liens', !$('#groupe-tresors').hidden && !document.body.classList.contains('mode-choix'));
    };
    // « Pour les grands » (espace parents, informations, accueil, recommencer) : replié pendant l'histoire
    const plier = (bouton, zone, plie) => { $('#' + zone).hidden = plie; $('#' + bouton).setAttribute('aria-expanded', String(!plie)); };
    const plierGrands = plie => plier('g-grands', 'grands-liens', plie);
    $('#g-grands').onclick = () => { SON.play('clic'); plierGrands(!$('#grands-liens').hidden); if (!$('#grands-liens').hidden) $('#pref-parents').scrollIntoView({ block: 'nearest' }); };
    $('#g-lire').onclick = () => { SON.play('clic'); plier('g-lire', 'reglages-liens', !$('#reglages-liens').hidden); };
    const fermerMenu = () => { menu.hidden = true; bPrefs.setAttribute('aria-expanded', 'false'); document.getElementById('fil').classList.remove('menu-ouvert'); };
    boutonPlein.maj = majPrefs;
    bPrefs.onclick = e => { e.stopPropagation(); if (menu.hidden) { majPrefs(); menu.hidden = false; bPrefs.setAttribute('aria-expanded', 'true'); document.getElementById('fil').classList.add('menu-ouvert'); } else fermerMenu(); };
    menu.onclick = e => e.stopPropagation();
    document.addEventListener('click', () => { if (!menu.hidden) fermerMenu(); });
    $('#pref-son').onclick = () => { SON.unlock(); const m = SON.toggle(); majPrefs(); toast(m ? 'Son et musique coupés' : 'Son et musique activés'); };
    $('#pref-carnet').onclick = () => { fermerMenu(); ouvrirCarnet(); };
    $('#pref-diplome').onclick = () => { fermerMenu(); SON.play('papier'); fenetreDiplome(); };
    // Sur l'écran de fin, il se redessine en refermant (un badge « Nouveau » est alors rangé)
    $('#pref-tresors').onclick = () => { fermerMenu(); SON.play('clic'); fenetreTresors(() => { if (courantN === 5 && Ch5.temps === 'tableau' && surDiplome) show(5, { diplome: true, temps: 'tableau' }); }); };
    $('#pref-album').onclick = () => { fermerMenu(); album(); };
    $('#pref-fermer').onclick = () => { fermerMenu(); bPrefs.focus(); };
    if ($('#pref-vibreur')) $('#pref-vibreur').onclick = () => {
      const on = !vibreurActif(); window.STOCKAGE.ecrire(CLE_VIBRE, on ? '1' : '0'); majPrefs();
      if (on) vibrer(60);
      toast(on ? 'Vibreur activé' : 'Vibreur coupé');
    };
    $('#pref-grand').onclick = () => {
      const on = !document.documentElement.classList.contains('grand-texte');
      window.STOCKAGE.ecrire(CLE_GRAND, on ? '1' : '0'); grandTexte(on); majPrefs();
      toast(on ? 'Grand texte activé' : 'Texte de taille normale');
    };
    if ($('#pref-plein')) $('#pref-plein').onclick = () => {
      // Décoché à la main : plus de plein écran automatique sur aucune page, jusqu'à ce qu'on le recoche
      if (PLEIN.actif()) { PLEIN.sortir(); window.PLEIN_ECRAN.refuser(true); } else { window.PLEIN_ECRAN.refuser(false); PLEIN.entrer(); }
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
    $$('.perle').forEach(p => p.onclick = () => {
      if (p.dataset.n === 'dip') { if (State.fini) show(5, { diplome: true }); return; }
      const n = +p.dataset.n; if (n <= State.unlocked) show(n); else toast('Termine d\'abord le chapitre ' + (n - 1) + ' !');
    });
  }
  let surDiplome = false;
  function updateFil(n) {
    const dip = !!State.fini, ruban = $('.ruban');
    if (ruban) ruban.classList.toggle('avec-diplome', dip);
    const pd = $('.perle.perle-dip'); if (pd) { pd.hidden = !dip; pd.classList.toggle('active', surDiplome); }
    $$('.perle:not(.perle-dip)').forEach(p => { const i = +p.dataset.n; p.classList.toggle('faite', i < State.unlocked); p.classList.toggle('active', i === n && !surDiplome); p.classList.toggle('ouverte', i <= State.unlocked); });
    // La petite souris du ruban se pose sur la pastille en cours (positions resserrées avec le diplôme)
    const pos = dip ? [4, 18, 32, 46, 60, 74, 89] : [5, 21, 37.5, 54, 70.5, 87];
    const s = $('.fil-souris'); if (s) s.style.left = (surDiplome ? pos[6] : pos[n]) + '%';
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
    // Le bandeau garde la même hauteur pendant toute l'étape (celle de son plus long texte)
    const TEXTES = { 0: ['accueil', 'surprise', 'origine', 'origineVille'], 2: ['jeu'], 3: ['camera'], 4: ['lettreIntro', 'lettreFin'], 5: opts.diplome ? ['diplome', 'billetTrouve', 'ceremonie'] : ['epilogue'] };
    let noeuds = TEXTES[n] ? TEXTES[n].map(k => D[k]) : null;
    if (n === 5 && opts.diplome) {
      const W = window.CERTIFICAT;
      noeuds = noeuds.concat(D.badges.map(b => W.nomBadge(b.id, true) + ' ! ' + W.texteBadge(b.id, true)), D.badges.map(b => W.nomBadge(b.id, false) + ' : ' + W.texteBadge(b.id, false)),
        [window.ARDENNES.diplome.quenotte].concat(['intro', 'etoiles', 'constellation', 'constellationPeu'].map(k => remplir(T(D.ceremonie[k].txt)))));
    }
    NARR.fixer(noeuds, T);
    root.innerHTML = courant.render(opts); root.className = 'scene ch-' + n;
    surDiplome = n === 5 && !!opts.diplome;
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
    <div class="actions-dessin"><button class="btn btn-petit" data-a="effacer">Tout effacer</button><button class="btn btn-or" data-a="envoyer">Envoyer à ${esc(C.souris)}</button></div>
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
    $('[data-a="envoyer"]', fen).onclick = () => {
      window.STOCKAGE.ecrire(CLE_DESSIN, toile.toDataURL('image/jpeg', 0.82));
      SON.play('badge'); toast(T(D.dessin.merci), A.icone('patte')); fermer();
      if (aDessine) setTimeout(() => badge('artiste'), 1800); // après le merci de Quenotte
    };
  }

  // ---------- L'album des dents : chaque histoire créée y est rangée dès son ouverture (« en cours »), puis marquée
  // terminée au diplôme ; l'exemple de Clémentine seulement une fois terminé ----------
  const CLE_ALBUM = 'souris.album';
  const lireAlbum = () => window.ALBUM.lire(); // voir src/lib/album.ts (l'espace parents y range aussi chaque histoire créée)
  function rangerDansAlbum(fini) { window.ALBUM.ranger(window.PROFIL.profil, { nuit: State.nuit, fini }); }
  // Le carnet des Ardennes : les cartes « Le savais-tu ? » et le livre de la légende (après le diplôme)
  // ---------- La fin : le diplôme, l'étagère des médailles, « Mes trésors », l'écran de fin ----------
  const ICONE_CHENE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1C14 1 15 3 14.5 4.5C17 4 18 6 16 7.5C19 7.5 19.5 10 17 11C19.5 11.5 19 14.5 16 14C17 16 15.5 17.5 13.2 17L12.6 19V22.5H11.4V19L10.8 17C8.5 17.5 7 16 8 14C5 14.5 4.5 11.5 7 11C4.5 10 5 7.5 8 7.5C6 6 7 4 9.5 4.5C9 3 10 1 12 1Z" fill="currentColor"/></svg>';
  // Les badges gagnés, dans l'ordre de l'étagère
  const badgesGagnes = () => D.badges.filter(b => State.badges.indexOf(b.id) >= 0).map(b => b.id);
  // Les nombres des textes de la fin
  const remplir = s => {
    const b = badgesGagnes().length, e = nbEtoiles(), pl = (n, mot) => n + ' ' + mot + (n > 1 ? 's' : '');
    const v = { nbBadges: b, totalBadges: D.badges.length, totalEtoiles, lesBadges: pl(b, 'badge'), lesEtoiles: pl(e, 'étoile'), trouvees: e > 1 ? 'trouvées' : 'trouvée' };
    return String(s).replace(/\{(nbBadges|totalBadges|totalEtoiles|lesBadges|lesEtoiles|trouvees)\}/g, (m, k) => v[k]);
  };
  function diplomeHTML() {
    return window.CERTIFICAT.html({ badges: State.badges.concat(State.badges.indexOf('jumelle') < 0 ? ['jumelle'] : []), secret: State.secret, nuitTexte: nuitTexte(), etoiles: nbEtoiles(), total: totalEtoiles });
  }
  const lienImpression = () => 'certificat/?badges=' + encodeURIComponent(State.badges.join(',')) + '&secret=' + (State.secret ? 1 : 0) + '&nuit=' + State.nuit + '&etoiles=' + nbEtoiles() + '#p=' + window.PROFIL.code;
  // Des confettis qui tombent une fois
  function pluie(zone, n) {
    if (RM || !zone) return;
    const couleurs = ['#FFC857', '#D64045', '#F2A3B5', '#3E7C8F', '#F3EFE6'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'); s.style.left = (Math.random() * 100) + '%'; s.style.background = couleurs[i % couleurs.length];
      s.style.animationDelay = (Math.random() * 1.6) + 's'; s.style.animationDuration = (2.6 + Math.random() * 2.6) + 's'; s.style.animationIterationCount = '1';
      zone.appendChild(s); setTimeout(() => s.remove(), 7000);
    }
  }
  // L'étagère : trois rangées (5, 4, 4), une tringle dorée, des crochets ; une médaille gagnée pend à son crochet,
  // une médaille à gagner n'est qu'un rond en pointillés. « montrees » : les médailles déjà accrochées (les autres
  // médailles gagnées attendent, crochet vide, d'être sorties de la sacoche).
  function etagereHTML(montrees) {
    const L = D.badges, rangs = Math.ceil(L.length / 5), base = Math.floor(L.length / rangs), plus = L.length % rangs;
    const caseHTML = b => {
      const g = State.badges.indexOf(b.id) >= 0, vue = montrees.indexOf(b.id) >= 0, nom = window.CERTIFICAT.nomBadge(b.id, g);
      return `<button type="button" class="case-med${g ? '' : ' a-gagner'}${g && !vue ? ' attend' : ''}" data-badge="${b.id}" aria-label="${esc(nom)} : ${g ? 'gagné' : 'à gagner'}">${A.medaille(b.id, g && !vue ? 'attend' : g)}<span class="med-nom">${esc(nom)}</span></button>`;
    };
    let h = '', k = 0;
    for (let i = 0; i < rangs; i++) { const n = base + (i < plus ? 1 : 0); h += `<div class="rayon"><div class="rayon-cases">${L.slice(k, k + n).map(caseHTML).join('')}</div></div>`; k += n; }
    return h;
  }
  // Le crochet qui attendait reçoit sa médaille
  function decrocherAttente(c, id) {
    if (!c.classList.contains('attend')) return;
    c.classList.remove('attend');
    const m = $('.medaille', c); if (m) m.outerHTML = A.medaille(id, true);
  }
  // L'envol d'une médaille : de la sacoche au milieu de l'écran (avec son nom et une gloire dorée), puis à son crochet
  let vols = [];
  function annulerVols() { vols.forEach(v => { try { v.remove(); } catch (e) { } }); vols = []; }
  function volMedaille(id, nom, sac, cible) {
    return new Promise(fini => {
      const W = Math.round(Math.min(150, window.innerWidth * 0.34)), H = W * 86 / 64;
      const voile = document.createElement('div'); voile.className = 'med-voile';
      const v = document.createElement('div'); v.className = 'med-vol'; v.style.width = W + 'px';
      v.innerHTML = `<div class="med-gloire" aria-hidden="true"></div>${A.medaille(id, true)}<span class="med-vol-nom">${esc(nom)}</span>`;
      document.body.append(voile, v); vols.push(voile, v);
      const fil = $('#fil'), band = $('#bandeau');
      const haut = fil ? fil.getBoundingClientRect().bottom : 0, bas = band ? band.getBoundingClientRect().top : window.innerHeight;
      const rs = sac.getBoundingClientRect();
      const place = (cx, cy, s) => `translate(${(cx - W * s / 2).toFixed(1)}px, ${(cy - H * s / 2).toFixed(1)}px) scale(${s.toFixed(3)})`;
      const cx = window.innerWidth / 2, cy = haut + (bas - haut) * 0.46;
      const sx = rs.left + rs.width / 2, sy = rs.top + rs.height * 0.3;
      const fin = () => { const i = vols.indexOf(v); if (i < 0) return; v.remove(); setTimeout(() => voile.remove(), 400); vols = vols.filter(x => x !== v && x !== voile); fini(); };
      if (!v.animate) { fin(); return; }
      requestAnimationFrame(() => voile.classList.add('on'));
      const a1 = v.animate([
        { transform: place(sx, sy, 0.18), opacity: 0 },
        { transform: place((sx + cx) / 2, Math.min(sy, cy) - 60, 0.8), opacity: 1, offset: 0.55 },
        { transform: place(cx, cy, 1), opacity: 1 },
      ], { duration: RM ? 1 : 850, easing: 'cubic-bezier(.2,.8,.25,1)', fill: 'forwards' });
      a1.finished.then(() => { v.classList.add('montre'); return wait(RM ? 700 : 1700); }).then(() => {
        if (vols.indexOf(v) < 0) return;
        v.classList.remove('montre'); voile.classList.remove('on');
        try { cible.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } catch (e) { }
        return wait(RM ? 0 : 300).then(() => {
          const rc = $('.medaille', cible).getBoundingClientRect(), s = rc.width / W;
          return v.animate([{ transform: place(cx, cy, 1) }, { transform: place(rc.left + rc.width / 2, rc.top + rc.height / 2, s) }],
            { duration: RM ? 1 : 720, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' }).finished;
        });
      }).then(fin, fin);
    });
  }
  // Le ciel d'étoiles de l'étagère : une case par étoile cachée dans le voyage, allumée quand elle est trouvée
  function cielHTML(allumees) {
    let c = ''; for (let i = 0; i < totalEtoiles; i++) c += `<svg class="ciel-etoile${i < allumees ? '' : ' eteinte'}" viewBox="0 0 24 24" aria-hidden="true"><use href="#etoile5"/></svg>`;
    return `<div class="etagere-ciel"><p class="ciel-titre"><span>${esc(T(D.ceremonie.ciel))}</span><span class="ciel-compte">${allumees} / ${totalEtoiles}</span></p><div class="ciel-cases">${c}</div></div>`;
  }
  // La constellation : les étoiles trouvées sortent ensemble de la sacoche, se placent sur le contour d'une dent,
  // se relient d'un trait de lumière, puis vont chacune s'allumer dans le ciel de l'étagère (rappel « allumer(i) »)
  const CONTOUR_DENT = [[38, 45], [60, 24], [84, 26], [100, 42], [116, 26], [140, 24], [162, 45], [170, 78], [160, 112], [148, 145], [142, 180], [128, 208], [110, 182], [100, 160], [90, 182], [72, 208], [58, 180], [52, 145], [40, 112], [30, 78]];
  function volConstellation(n, sac, cibles, allumer) {
    return new Promise(fini => {
      if (!n || !document.body.animate) { cibles.forEach((c, i) => allumer(i)); fini(); return; }
      const fil = $('#fil'), band = $('#bandeau');
      const haut = fil ? fil.getBoundingClientRect().bottom : 0, bas = band ? band.getBoundingClientRect().top : window.innerHeight;
      const taille = Math.min(window.innerWidth * 0.7, (bas - haut) * 0.62, 300), k = taille / 220;
      const ox = window.innerWidth / 2 - 100 * k, oy = haut + (bas - haut) * 0.44 - 116 * k;
      const pts = Array.from({ length: n }, (_, i) => CONTOUR_DENT[Math.floor(i * CONTOUR_DENT.length / n)]).map(([x, y]) => [ox + x * k, oy + y * k]);
      const rs = sac.getBoundingClientRect(), sx = rs.left + rs.width / 2, sy = rs.top + rs.height * 0.3, E = 30;
      const voile = document.createElement('div'); voile.className = 'med-voile';
      const ciel = document.createElement('div'); ciel.className = 'const-vol';
      const trace = n >= 3 ? `<svg class="const-lignes" width="${window.innerWidth}" height="${window.innerHeight}" aria-hidden="true"><polygon points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" pathLength="1"/></svg>` : '';
      ciel.innerHTML = trace + pts.map(() => `<svg class="const-etoile" viewBox="0 0 24 24" aria-hidden="true"><use href="#etoile5"/></svg>`).join('')
        + `<span class="const-nom" style="left:${window.innerWidth / 2}px;top:${(oy + 222 * k).toFixed(0)}px">${esc(remplir(T(D.ceremonie.constellationNom)))}</span>`;
      document.body.append(voile, ciel); vols.push(voile, ciel);
      const etoiles = $$('.const-etoile', ciel);
      const place = (x, y, s) => `translate(${(x - E * s / 2).toFixed(1)}px, ${(y - E * s / 2).toFixed(1)}px) scale(${s.toFixed(3)})`;
      const fin = () => { const i = vols.indexOf(ciel); if (i < 0) return; ciel.remove(); setTimeout(() => voile.remove(), 400); vols = vols.filter(x => x !== ciel && x !== voile); fini(); };
      requestAnimationFrame(() => voile.classList.add('on'));
      // 1. Elles jaillissent de la sacoche et prennent leur place sur le contour
      const sorties = etoiles.map((e, i) => e.animate([
        { transform: place(sx, sy, 0.2), opacity: 0 },
        { transform: place((sx + pts[i][0]) / 2, Math.min(sy, pts[i][1]) - 40, 1.2), opacity: 1, offset: 0.5 },
        { transform: place(pts[i][0], pts[i][1], 1), opacity: 1 },
      ], { duration: RM ? 1 : 900, delay: RM ? 0 : i * 45, easing: 'cubic-bezier(.2,.8,.25,1)', fill: 'forwards' }).finished);
      Promise.all(sorties).then(() => { ciel.classList.add('dessine'); return wait(RM ? 700 : 2200); }).then(() => {
        if (vols.indexOf(ciel) < 0) return;
        ciel.classList.remove('dessine'); ciel.classList.add('range'); voile.classList.remove('on');
        try { cibles[0].closest('.etagere-ciel').scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } catch (e) { }
        return wait(RM ? 0 : 350).then(() => Promise.all(etoiles.map((e, i) => {
          const rc = cibles[i].getBoundingClientRect();
          const a = e.animate([{ transform: place(pts[i][0], pts[i][1], 1) }, { transform: place(rc.left + rc.width / 2, rc.top + rc.height / 2, rc.width / E) }],
            { duration: RM ? 1 : 650, delay: RM ? 0 : i * 70, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' });
          return a.finished.then(() => { e.style.opacity = '0'; allumer(i); });
        })));
      }).then(fin, fin);
    });
  }
  // Une fenêtre par-dessus l'écran de fin (diplôme agrandi, trésors) : Échap ou « Fermer », le focus revient au bouton
  function fenetre(cls, label, contenu, apres) {
    const precedent = document.activeElement;
    const fen = document.createElement('div');
    fen.className = 'atelier ' + cls; fen.setAttribute('role', 'dialog'); fen.setAttribute('aria-modal', 'true'); fen.setAttribute('aria-label', label);
    fen.innerHTML = `<div class="atelier-in">${contenu}</div>`;
    document.body.appendChild(fen);
    const clavier = e => { if (e.key === 'Escape') { e.preventDefault(); fermer(); } };
    const fermer = () => { document.removeEventListener('keydown', clavier); fen.remove(); if (precedent && precedent.focus) try { precedent.focus({ preventScroll: true }); } catch (e) { } if (apres) apres(); };
    document.addEventListener('keydown', clavier);
    fen.addEventListener('click', e => { if (e.target === fen) fermer(); });
    $$('[data-a="fermer"]', fen).forEach(b => b.onclick = () => { SON.play('clic'); fermer(); });
    const f = $('[data-a="fermer"]', fen); if (f) f.focus({ preventScroll: true });
    return fen;
  }
  // Le diplôme en grand (depuis l'écran de fin ou le menu) : un nouveau toucher sur le diplôme le referme
  function fenetreDiplome() {
    const fen = fenetre('fen-diplome', 'Le diplôme', `<button type="button" class="dip-fermer" data-a="fermer" aria-label="Fermer le diplôme">${diplomeHTML()}</button>
  <div class="fen-actions"><a class="btn btn-or" href="${lienImpression()}" target="_blank" rel="noopener">${A.icone('imprimer')} ${esc(T(D.fin.imprimer))}</a><button type="button" class="btn btn-petit" data-a="fermer">${esc(T(D.fin.fermer))}</button></div>`);
    return fen;
  }
  // « Mes trésors » : l'étagère complète, le détail de chaque médaille, et le ciel des étoiles trouvées.
  // Une médaille gagnée après la cérémonie (un dessin, le carnet…) s'accroche en arrivant, avec son explication.
  function fenetreTresors(apres) {
    // « Rejouer la remise des badges » : la fenêtre se ferme, et Quenotte ressort toutes les médailles de sa sacoche
    let rejouer = false;
    const ensuite = () => {
      if (!rejouer) { if (apres) apres(); return; }
      State.remis = []; State.etoilesRemises = false; save();
      fondu(() => show(5, { diplome: true, temps: 'ceremonie' }), 600);
    };
    const ids = badgesGagnes(); State.remis = (State.remis || []).filter(id => ids.indexOf(id) >= 0);
    // Avant la cérémonie (pendant le voyage), tout ce qui est gagné est déjà accroché, sans « Nouveau » :
    // Quenotte gardera la remise des médailles pour la fin
    const avantCeremonie = !State.ceremonie;
    const nouveaux = avantCeremonie ? [] : ids.filter(id => State.remis.indexOf(id) < 0);
    let ciel = ''; for (let i = 0; i < totalEtoiles; i++) ciel += `<svg class="ciel-etoile${i < nbEtoiles() ? '' : ' eteinte'}" viewBox="0 0 24 24" aria-hidden="true"><use href="#etoile5"/></svg>`;
    const fen = fenetre('fen-tresors', T(D.tresors.titre), `<div class="tresors-tete"><h2>${esc(T(D.tresors.titre))}</h2><button type="button" class="fermer-x" data-a="fermer" aria-label="${esc(T(D.fin.fermer))}">✕</button></div>
  <section class="etagere" aria-labelledby="t-etagere-f"><h3 class="etagere-titre"><span id="t-etagere-f">${esc(T(D.ceremonie.etagere))}</span><span class="etagere-compte">${ids.length} / ${D.badges.length}</span></h3>${etagereHTML(avantCeremonie ? ids : State.remis)}</section>
  <div class="tresors-info" aria-live="polite"><p class="tresors-aide">${esc(T(D.tresors.aide))}</p></div>
  <section class="ciel-etoiles" aria-label="${esc(remplir(T(D.tresors.ciel)))}"><p><b>${esc(remplir(T(D.tresors.ciel)))}</b><span>${esc(T(D.tresors.cielAide))}</span></p><div class="ciel-liste">${ciel}</div></section>
  <div class="fen-actions">${ids.length ? `<button type="button" class="btn btn-petit" data-a="rejouer">${A.icone('recommencer')} ${esc(T(D.tresors.rejouer))}</button>` : ''}<button type="button" class="btn btn-or" data-a="fermer">${esc(T(D.fin.fermer))}</button></div>`, ensuite);
    const r = $('[data-a="rejouer"]', fen);
    if (r) r.onclick = () => { rejouer = true; $('[data-a="fermer"]', fen).click(); };
    const info = $('.tresors-info', fen); let choisie = false;
    const ficheHTML = (id, g, neuf) => `<div class="info-med">${A.medaille(id, g)}<div><span class="info-etat${g ? '' : ' non'}">${esc(neuf ? T(D.tresors.nouveau) : T(g ? D.tresors.gagne : D.tresors.aGagner))}</span><b>${esc(window.CERTIFICAT.nomBadge(id, g))}</b><p>${esc(window.CERTIFICAT.texteBadge(id, g))}</p></div></div>`;
    const montrer = (id, g, neuf) => {
      $$('.case-med.choisie', fen).forEach(x => x.classList.remove('choisie'));
      const c = $(`.case-med[data-badge="${id}"]`, fen); if (c) c.classList.add('choisie');
      info.innerHTML = ficheHTML(id, g, neuf);
    };
    // Le cadre garde la même hauteur pour toutes les médailles : celle de la plus longue explication, mesurée à la
    // largeur réelle (rien n'est coupé, rien ne bouge d'une médaille à l'autre) ; recalculée si l'écran tourne
    const fixerCadre = () => {
      if (!fen.isConnected) { window.removeEventListener('resize', fixerCadre); return; }
      const m = info.cloneNode(false); m.removeAttribute('aria-live'); m.setAttribute('aria-hidden', 'true');
      m.style.cssText = 'position:absolute;visibility:hidden;left:0;top:0;height:auto;min-height:0;width:' + info.offsetWidth + 'px';
      info.parentNode.appendChild(m);
      let h = 0;
      const mesure = html => { m.innerHTML = html; h = Math.max(h, m.offsetHeight); };
      mesure(info.innerHTML);
      D.badges.forEach(b => { const g = State.badges.indexOf(b.id) >= 0; mesure(ficheHTML(b.id, g, g)); });
      info.parentNode.removeChild(m);
      info.style.height = Math.ceil(h) + 'px';
    };
    fixerCadre(); window.addEventListener('resize', fixerCadre);
    // Les polices du conte arrivent parfois après l'ouverture : on remesure quand elles sont prêtes
    try { document.fonts.ready.then(fixerCadre); } catch (e) { }
    $$('.case-med', fen).forEach(c => c.addEventListener('click', () => {
      if (c.classList.contains('attend')) return;
      SON.play('clic'); choisie = true; montrer(c.dataset.badge, !c.classList.contains('a-gagner'), false);
    }));
    // Les nouvelles médailles s'accrochent l'une après l'autre
    nouveaux.forEach((id, k) => setTimeout(() => {
      if (!fen.isConnected) return;
      const c = $(`.case-med[data-badge="${id}"]`, fen); if (!c) return;
      decrocherAttente(c, id); if (!RM) c.classList.add('posee');
      SON.play(k ? 'toc' : 'badge'); if (!choisie) montrer(id, true, true); // l'explication choisie par l'enfant reste affichée
      if (State.remis.indexOf(id) < 0) { State.remis.push(id); save(); }
    }, (RM ? 100 : 650) + k * (RM ? 100 : 1300)));
  }
  // L'écran de fin : le diplôme (il s'agrandit au toucher) et son impression ; à côté, quatre tuiles
  function tableauHTML(titre) {
    const ids = badgesGagnes(), nouveaux = ids.filter(id => (State.remis || []).indexOf(id) < 0);
    const AR = window.ARDENNES, K = window.CARNET, c = K.compte(State), dessin = lireDessin();
    const meds = ids.slice(0, 7).map(id => `<span class="mini-med">${A.medaille(id, true)}</span>`).join('') + (ids.length > 7 ? `<span class="mini-plus">+${ids.length - 7}</span>` : '');
    return `<section class="ch ch5 fin5 temps-tableau">${titre}
<div class="fin5-grille">
  <div class="fin5-dip">
    <button type="button" class="dip-mini" id="btn-dip-grand" aria-label="Agrandir le diplôme">${diplomeHTML()}<span class="dip-loupe" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>${esc(T(D.fin.agrandir))}</span></button>
    <a class="btn btn-grand btn-or" id="btn-imprimer" href="${lienImpression()}" target="_blank" rel="noopener">${A.icone('imprimer')} ${esc(T(D.fin.imprimer))}</a>
  </div>
  <div class="fin5-cote">
    <div class="fin5-tuiles">
      <button type="button" class="tuile tuile-tresors" id="btn-tresors">
        <span class="tuile-txt"><b>${esc(T(D.tresors.titre))}</b><small>${esc(remplir(T(D.tresors.resume)))}</small></span>
        ${nouveaux.length ? `<em class="tuile-nouveau">${esc(T(D.tresors.nouveau))}</em>` : ''}
        <span class="mini-etagere" aria-hidden="true"><span class="mini-meds">${meds}</span></span>
      </button>
      <button type="button" class="tuile tuile-carnet" id="btn-carnet5">
        <span class="mini-eventail" aria-hidden="true"><span class="eventail-zoom">${K.apercu(State)}</span></span>
        <span class="tuile-txt"><b>${esc(AR.titre)}</b><small>${esc(AR.diplome.tuile.replace('{n}', c.n).replace('{total}', c.total))}</small></span>
        ${State.carnetVu ? '' : `<em class="tuile-nouveau">${esc(AR.diplome.ruban)}</em>`}
      </button>
      <button type="button" class="tuile tuile-dessin" id="btn-dessin5">
        ${dessin ? `<span class="mini-dessin"><img src="${dessin}" alt="Le dessin de ${esc(C.enfant)} pour ${esc(C.souris)}"></span>` : `<span class="tuile-ill" aria-hidden="true"><svg viewBox="0 0 56 56"><rect x="6" y="9" width="40" height="32" rx="4" fill="#fff"/><path d="M12 34c4-9 9-13 13-6s9 2 14-9" fill="none" stroke="#D64045" stroke-width="3.2" stroke-linecap="round"/><circle cx="37" cy="17" r="4.5" fill="#FFC857"/><path d="M33 52l15-17 5 4-15 17z" fill="#FFC857" stroke="#8a5a1a" stroke-width="1.2"/><path d="M33 52l1.5-5 3.5 3z" fill="#2B2B33"/></svg></span>`}
        <span class="tuile-txt"><b>${esc(T(dessin ? D.fin.dessinFait : D.fin.dessin))}</b><small>${esc(T(dessin ? D.fin.dessinModifier : D.fin.dessinAide))}</small></span>
      </button>
      <button type="button" class="tuile tuile-album" id="btn-album5">
        <span class="tuile-ill" aria-hidden="true"><svg viewBox="0 0 56 56"><rect x="8" y="6" width="38" height="46" rx="4" fill="#C9A227"/><rect x="11" y="6" width="35" height="46" rx="3" fill="#FFF6E0"/><rect x="8" y="6" width="7" height="46" rx="2" fill="#D64045"/><use href="#dent" x="20" y="15" width="22" height="22"/><path d="M20 43h20" stroke="#C9A227" stroke-width="2" stroke-linecap="round"/></svg></span>
        <span class="tuile-txt"><b>${esc(T(D.fin.album))}</b><small>${esc(T(D.fin.albumAide))}</small></span>
      </button>
    </div>
    <p class="fin5-revoir"><button type="button" class="lien-revoir" id="btn-revoir5">${A.icone('recommencer')} ${esc(T(D.fin.revoir))}</button></p>
  </div>
</div>
</section>`;
  }
  function ouvrirCarnet(apres) {
    if (!State.carnetVu) { State.carnetVu = true; save(); }
    window.CARNET.ouvrir({ T, state: State, son: n => SON.play(n), apres });
  }
  function album() {
    const a = lireAlbum(), parEnfant = {};
    a.forEach(x => { (parEnfant[x.prenom] = parEnfant[x.prenom] || []).push(x); });
    const date = n => { try { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(n + 'T12:00:00')); } catch (e) { return 'à venir'; } };
    const pages = Object.keys(parEnfant).map(prenom => {
      const nuits = parEnfant[prenom].sort((x, y) => (x.nuit < y.nuit ? -1 : 1)), derniere = nuits[nuits.length - 1];
      const toutes = new Set(); nuits.forEach(x => { toutes.add(x.dent); (x.deja || []).forEach(d => toutes.add(d)); });
      toutes.delete(derniere.dent);
      return `<section class="album-page"><h3>${esc(prenom)}</h3>${window.MACHOIRE({ dents: { nuit: derniere.dent, deja: [...toutes] } }).replace("cette nuit", "la plus récente")}
  <ul>${nuits.map(x => `<li><span>Nuit du ${esc(date(x.nuit))} : ${esc(window.NOM_DENT(x.dent))}${x.fini === false ? ' <em class="album-encours">en cours</em>' : ''}</span><span class="album-boutons"><a class="btn btn-petit" href="#p=${x.code}">${x.fini === false ? 'Reprendre' : 'Revoir'}</a><button class="btn btn-petit supprimer" data-id="${esc(x.id)}">Supprimer</button></span></li>`).join('')}</ul></section>`;
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
      const parti = lireAlbum().find(x => x.id === b.dataset.id);
      window.STOCKAGE.ecrire(CLE_ALBUM, JSON.stringify(lireAlbum().filter(x => x.id !== b.dataset.id)));
      // L'histoire mémorisée sur l'appareil est oubliée aussi : l'accueil ne propose plus de la reprendre
      if (parti && window.STOCKAGE.lire('souris.profil') === parti.code) {
        window.STOCKAGE.effacer('souris.profil');
        if (window.PROFIL.memoire && window.PROFIL.memoire.code === parti.code) window.PROFIL.memoire = null;
        if (document.body.classList.contains('mode-choix')) { SON.play('papier'); fen.remove(); afficherChoix(); album(); return; }
      }
      SON.play('papier'); fen.remove(); album();
    });
  }

  // ---------- Chapitre 0 : la couverture du livre, puis la page de garde ----------
  // La couverture (titre, prénom, Quenotte sur les remparts de Sedan) s'ouvre au toucher ou avec « Viens, je te
  // raconte ! ». Dessous, la page de garde : la France, où l'enfant touche son étoile, puis un zoom sur les
  // Ardennes et le chemin de Quenotte jusqu'à sa maison, dont la fenêtre s'allume. « En route ! » ouvre le château.
  const Ch0 = {
    render() {
      const surprise = window.PROFIL.surprise;
      return `<section class="ch origine ouverture-livre">
  <div class="lv-scene"><div class="lv-ecran">
    <div class="lv-garde"></div>
    <div class="lv-ombre" aria-hidden="true"></div>
    <button type="button" class="lv-couverture" aria-label="Ouvrir le livre : La nuit de la Petite Souris, l'histoire de ${esc(C.enfant)}"${surprise ? ' disabled' : ''}></button>
  </div></div>
</section>`;
    },
    mount(r) {
      heure('—'); MUS.ambiance('accueil');
      etape(() => { complete(0); fondu(() => show(1, { scene: 0 }), 500); });
      const mien = this.jetonCarte = (this.jetonCarte || 0) + 1, encore = () => this.jetonCarte === mien;
      // Le livre occupe toute la largeur : la hauteur du dessin suit la forme de l'écran
      // (le bandeau prend sa hauteur un peu après : on redessine tant que le livre est fermé)
      const ecran = $('.lv-ecran', r), surprise = window.PROFIL.surprise;
      let ouvert = false;
      const dessiner = () => {
        const b = ecran.getBoundingClientRect();
        const h = b.width > 0 && b.height > 0 ? window.OUVERTURE.hauteur(320 * b.height / b.width) : 640;
        if (this.h && Math.abs(h - this.h) < 3) return;
        this.h = h;
        $('.lv-couverture', r).innerHTML = window.OUVERTURE.couverture({
          h, enfant: C.enfant,
          ligne1: surprise ? 'Rendez-vous ' + C.reveilTexte + ' !' : C.ville,
          ligne2: surprise ? '' : nuitTexte(),
          invite: surprise ? '' : 'Touche la couverture pour ouvrir le livre',
        });
        if (!surprise) this.preparerCarte(r);
      };
      this.h = 0; dessiner();
      if (this.taille) this.taille.disconnect();
      this.taille = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { if (!ouvert && encore()) dessiner(); }) : null;
      if (this.taille) this.taille.observe(ecran);
      if (surprise) { NARR.dire(B(D.surprise)); return; }
      const ouvrir = async () => {
        if (ouvert) return; ouvert = true;
        if (this.taille) { this.taille.disconnect(); this.taille = null; }
        SON.unlock(); SON.play('page'); NARR.action(null);
        $('.lv-ecran', r).classList.add('ouvert');
        await wait(RM ? 50 : 1300); if (!encore()) return;
        this.carte(r);
      };
      $('.lv-couverture', r).onclick = ouvrir;
      NARR.dire(B(D.accueil));
      NARR.action(A.icone('lanterne') + ' ' + T(D.accueil.bouton), ouvrir);
    },
    unmount() { this.jetonCarte = (this.jetonCarte || 0) + 1; if (this.taille) { this.taille.disconnect(); this.taille = null; } },
    // La page de garde, dessinée dès le départ sous la couverture
    preparerCarte(r) {
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
      this.etoile = et;
      $('.lv-garde', r).innerHTML = window.OUVERTURE.garde({ h: this.h, etoile: et, trajet, ville: ville.nom, enfant: C.enfant, aide: T(D.origine.aide) });
      if (!et) r.querySelector('.origine').classList.add('sans-etoile');
    },
    // Le livre est ouvert : Quenotte se présente, l'enfant touche son étoile, puis on plonge sur les Ardennes
    carte(r) {
      const mien = this.jetonCarte, encore = () => this.jetonCarte === mien;
      etape(() => { complete(0); fondu(() => show(1, { scene: 0 }), 500); });
      const sec = $('.origine', r), svg = $('.lv-garde svg', r), et = this.etoile;
      const ensuite = async () => {
        if (!encore()) return;
        await NARR.dire(B(D.origineVille)); if (!encore()) return;
        NARR.action(A.icone('suite') + ' ' + T(D.origineVille.bouton), async () => {
          SON.unlock(); SON.play('clic'); NARR.action(null);
          complete(0);
          await fondu(() => show(1, { scene: State.unlocked > 1 ? 0 : State.scene }), 900);
        });
      };
      // Le zoom sur les Ardennes, les lieux, puis le chemin jusqu'à la maison de l'enfant
      const voyage = async () => {
        if (!encore()) return;
        await window.OUVERTURE.zoom(svg, RM); if (!encore()) return;
        await window.OUVERTURE.voyage(svg, RM, ms => wait(ms), encore); if (!encore()) return;
        sec.classList.add('arrive'); SON.play('etoile');
        ensuite();
      };
      const dit = NARR.dire(B(D.origine));
      if (!et) { dit.then(() => wait(RM ? 0 : 600)).then(voyage); return; }
      const etoile = $('.etoile-ville', r);
      dit.then(() => { if (encore() && !sec.classList.contains('trace-fait')) $('.main-aide', r).classList.add('on'); });
      let touche = false;
      const toucher = async () => {
        if (touche) return; touche = true;
        SON.unlock(); SON.play('filante');
        sec.classList.add('trace-fait', 'vole'); $('.main-aide', r).classList.remove('on');
        // Le chemin se dessine du château jusqu'à l'étoile
        const trace = $('.trace', r);
        if (trace && !RM) {
          const L = trace.getTotalLength();
          trace.style.strokeDasharray = L + ' ' + L; trace.style.strokeDashoffset = L;
          trace.getBoundingClientRect();
          trace.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.6,1)'; trace.style.strokeDashoffset = 0;
        }
        await wait(RM ? 50 : 1500);
        voyage();
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
  const QR_ICONE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M5.5 5.5h2v2h-2zM16.5 5.5h2v2h-2zM5.5 16.5h2v2h-2zM14 14h3v3h-3zM18 18h3v3h-3z" fill="currentColor"/></svg>';
  function afficherChoix() {
    document.body.classList.add('mode-choix');
    MUS.ambiance('accueil'); // le thème de Quenotte, dès le premier toucher (les navigateurs interdisent la lecture avant)
    const m = window.PROFIL.memoire, exemple = window.PRENOM_EXEMPLE;
    if (m && m.profil) window.ALBUM.ranger(m.profil); // la dernière histoire de l'appareil est toujours dans l'album
    root.className = 'scene choix-scene';
    // La carte de l'espace parents (en jaune quand aucune histoire n'est encore créée), l'exemple en bleu discret avec la vidéo
    const PARENTS = principale => `<a class="carte-choix parents${principale ? ' principale' : ''}" href="parents/"><span class="ic">${A.icone('famille')}</span><span><b>${principale ? "Créer l'histoire de mon enfant" : 'Espace parents'}</b><small>${principale ? "Dans l'espace parents, en quelques minutes" : "Préparer ou modifier l'histoire personnalisée"}</small></span></a>`;
    const VOYAGE = `<a class="carte-choix voyage" href="#exemple"><span class="ic">${A.icone('etoile')}</span><span><b>Découvrir l'aventure</b><small>Pour tester l'aventure avec l'histoire de ${esc(exemple)}</small></span></a><a class="lien-video" href="decouvrir/"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 8l6 4-6 4z" fill="currentColor"/></svg>Voir la vidéo de présentation</a>`;
    root.innerHTML = `<section class="ecran-choix${m ? ' avec-histoire' : ''}">
  <svg class="choix-ciel" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${ETOILES_CHOIX}</svg>
  <div class="choix-haut">
    <img class="choix-logo" src="icones/icone.svg" alt="" width="128" height="128">
    <h1 class="titre">La nuit de la Petite Souris</h1>
    ${m ? '' : `<p class="choix-accroche">Une histoire du soir personnalisée pour la nuit où votre enfant perd une dent.</p>`}
  </div>
  ${m ? '' : `<ol class="choix-etapes" aria-label="Comment ça marche">
    <li><span class="ic">${A.icone('crayon')}</span>Vous créez l'histoire<small>prénom, dent, ville</small></li>
    <li><span class="ic">${QR_ICONE}</span>Vous imprimez ou affichez le QR code</li>
    <li><span class="ic">${A.icone('etoile')}</span>Votre enfant le scanne au réveil</li>
  </ol>`}
  <nav class="choix-cartes" aria-label="Choisir son parcours">
    ${m ? `<a class="carte-choix reprendre principale" href="#p=${m.code}"><span class="ic">${A.icone('lanterne')}</span><span><b>L'histoire de ${esc(m.prenom)}</b><small>Retrouver Quenotte là où on l'a laissée</small></span></a>
    <details class="autres-options"><summary>Autres options<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></summary><div class="autres-cartes">${PARENTS(false)}${VOYAGE}</div></details>`
    : `${PARENTS(true)}<p class="choix-confiance">Gratuit · sans publicité · sans compte · rien ne quitte votre téléphone</p>${VOYAGE}`}
  </nav>
  ${lireAlbum().length ? `<button class="lien-album" id="lien-album">${A.icone('etoile')} ${esc(T(D.album.titre))}</button>` : ''}
  <p class="don-accueil">${window.DON_POSSIBLE ? `<a class="lien-don" href="parents/#don"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/></svg>Faire un don</a><span aria-hidden="true">·</span>` : ''}<a class="lien-infos" href="infos/">Informations · confidentialité</a></p>
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
    if ($('#lien-album', root)) $('#lien-album', root).onclick = album;
    const exempleCharge = window.PROFIL.origine === 'choix' || window.PROFIL.origine === 'exemple';
    if (exempleCharge) $('.carte-choix.voyage', root).onclick = surPlace('#exemple', 'exemple');
    if (m && m.code === window.PROFIL.code) $('.carte-choix.reprendre', root).onclick = surPlace('#p=' + m.code, 'adresse');
  }

  // Retour à l'écran de choix, sur place : l'histoire en cours devient « Reprendre l'histoire de… »
  function changerHistoire(e) {
    if (e) e.preventDefault();
    if (courant && courant.unmount) { try { courant.unmount(); } catch (er) { } }
    courant = null; SON.ronfleStop(); NARR.action(null);
    if (window.PROFIL.origine === 'adresse' || window.PROFIL.origine === 'memoire') window.PROFIL.memoire = { prenom: window.PROFIL.profil.prenom, code: window.PROFIL.code, profil: window.PROFIL.profil };
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
        state: State, config: C, T, heure, etoile, ardennais, carteArd, toast, save,
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
      NARR.fixer([D.lampe], T);
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
        // Pantoufle rouvre souvent les yeux (entre 1,6 et 3 secondes de sommeil) ; après 5 surprises, il dort plus longtemps
        const base = pris >= 5 ? 5000 : 1600 + Math.random() * 1400;
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
        vibrer(80);
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
      const patte = $('#patte', r), cs2 = $('#cs2', r), bat = $('#bateau2', r), dent = $('#dent1', r), mot = $('#mot1', r), salon = $('#cam-salon', r), chambre = $('#cam-chambre', r);
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
        [0.3, () => { mv(cs2, -90, 200); mv(bat, -40, 236); }],
        [0.6, () => chuchote(D.camera.intro)],
        [1.1, () => det('cheminee', C.cachetteEtiquette, 25, 40, 50, 43, 'bas etiquette')],
        [1.9, () => { mv(cs2, 40, 200); mv(bat, 90, 236); SON.play('pas'); }],
        [3.8, () => { mv(cs2, 70, 56); mv(bat, 120, 92); SON.play('pas'); rm('cheminee'); }],
        [5, () => { mv(bat, 160, 84); }],
        [5.8, () => { det('bateau', { piece: 'PIÈCE', billet: 'BILLET – SÈCHE', paquet: 'PAQUET', chocolat: 'CHOCOLATS' }[C.cadeau] || 'CADEAU', 38, 26, 30, 12); chuchote(D.camera.cheminee); }],
        [7.3, () => { cs2.classList.add('coucou'); }],
        [8.8, () => { cs2.classList.remove('coucou'); mv(cs2, -90, 200); SON.play('pas'); rm('bateau'); }],
        // La chambre : un plan large, puis un gros plan sur l'oreiller où l'on ne voit que la patte de Quenotte
        [10.2, () => { salon.setAttribute('hidden', ''); chambre.removeAttribute('hidden'); nom.textContent = 'CAM 2 · CHAMBRE'; dets.innerHTML = ''; SON.play('bip'); chuchote(D.camera.chambre); }],
        [10.8, () => { cam.classList.add('zoom'); nom.textContent = 'CAM 2 · ZOOM ×3'; SON.play('bip'); }],
        [11.8, () => det('dent', 'DENT – TROUVÉE', 42, 42, 10, 13, 'droite')],
        [12.2, () => { patte.classList.add('tend'); SON.play('pas'); }],
        [13.0, () => { patte.classList.remove('tend'); dent.classList.add('prise'); rm('dent'); }],
        [13.6, () => chuchote(D.camera.dent)],
        [13.9, () => { patte.classList.add('lettre', 'pose'); SON.play('papier'); }],
        [14.8, () => { mot.classList.add('pose'); patte.classList.remove('lettre', 'pose'); det('mot', 'PETIT MOT – SOUS L\'OREILLER', 35, 40, 21, 21, 'droite'); }],
        [16.2, () => { cam.classList.remove('zoom'); nom.textContent = 'CAM 2 · CHAMBRE'; rm('mot'); }],
        [17.2, () => det('lit', 'SOUS LE LIT – MONSTRES : 0', 8, 79, 20, 6)],
        [18.4, () => chuchote(D.camera.fin)], // « Monstres : 0 » reste affiché jusqu'au bouton de fin
        [19.2, () => { cam.classList.add('fin'); $('#btn-revoir', r).hidden = false; SON.play('alerte'); heure('02:52'); NARR.action(T(D.camera.bouton) + ' ' + A.icone('suite'), () => { complete(3); badge('hibou'); show(4); }); }],
      ];
      const VITESSE_CAMERA = 1.4;
      const finAt = evenements[evenements.length - 1][0];
      let debut = null, idx = 0, fini = false;
      const horo = s => { const t = 2 * 3600 + 47 * 60 + Math.floor(s * 7); ts.textContent = dateCam() + ' ' + pad(Math.floor(t / 3600)) + ':' + pad(Math.floor(t / 60) % 60) + ':' + pad(t % 60); heure(pad(Math.floor(t / 3600)) + ':' + pad(Math.floor(t / 60) % 60)); };
      const boucle = now => {
        // Le film est joué un peu plus vite que son minutage (environ quatorze secondes)
        if (fini || !encore()) return; if (debut == null) debut = now - tTest * 1000 / VITESSE_CAMERA;
        const s = (now - debut) / 1000 * VITESSE_CAMERA;
        while (idx < evenements.length && s >= evenements[idx][0] && !pause) evenements[idx++][1]();
        horo(Math.min(s, finAt));
        if (idx >= evenements.length) { fini = true; return; }
        if (pause) return;
        self.raf = requestAnimationFrame(boucle);
      };
      const lancer = () => {
        cancelAnimationFrame(self.raf); fini = false; debut = null; idx = 0; pause = false;
        cam.classList.remove('fin'); cam.classList.add('instant'); dets.innerHTML = ''; NARR.action(null);
        chambre.setAttribute('hidden', ''); salon.removeAttribute('hidden'); nom.textContent = 'CAM 1 · SALON'; dent.classList.remove('prise'); mot.classList.remove('pose'); cs2.classList.remove('coucou'); cam.classList.remove('zoom'); patte.classList.remove('tend', 'lettre', 'pose');
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
          if (j < mots.length) { els[i].textContent = mots.slice(0, j + 1).join(' '); SON.play('crayon'); j++; self.t = setTimeout(pas, RM ? 60 : 170); }
          else { i++; j = 0; self.t = setTimeout(pas, RM ? 100 : 400); }
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
    // ---------- Le retour en montgolfière : trois étapes de nuages, trois vies (les flammes du brûleur) ----------
    // Étape 1 : des nuages un par un ; étape 2 : par deux (on passe entre eux) ; étape 3 : des nuages qui bougent, et un
    // orage. Un nuage touché éteint une flamme ; plus de flamme : l'étape reprend à son début (un peu moins vite).
    // Une étoile filante attrapée rallume une flamme. Le paysage défile sur trois plans ; la carte montre le trajet.
    // Pour les tests : data-auto="1" sur le dessin pilote la montgolfière entre les nuages, data-auto="touche" droit dessus.
    retour(r) {
      const self = this, zone = $('#epi', r), mien = self.jeton = (self.jeton || 0) + 1, encore = () => self.jeton === mien;
      const E = D.epilogue;
      heure('03:20'); MUS.ambiance('montgolfiere');
      etape(() => fondu(() => self.terrier(r), 400));
      // Le paysage : chaque plan est une bande de 1000 de large, dessinée trois fois (elle boucle sans couture)
      const tuile = (contenu, n) => [-1000, 0, 1000].map(x => `<g transform="translate(${x},0)">${contenu}</g>`).join('');
      const maison = (x, y, s, toit) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-16" y="-22" width="32" height="22" fill="#2a3256"/><path d="M-20-22l20-16 20 16z" fill="${toit}"/><rect x="-9" y="-15" width="6" height="7" fill="#FFC857"/><rect x="4" y="-15" width="6" height="7" fill="#FFC857" opacity=".7"/></g>`;
      const sapin = (x, y, s, c) => `<path transform="translate(${x},${y}) scale(${s})" d="M0-60L22-12H10L28 14H-28L-10-12H-22Z" fill="${c}"/>`;
      const loin = '<path d="M0 470Q120 430 240 455T480 445T720 452T1000 470V600H0Z" fill="#1b2a52"/>'
        + [60, 150, 330, 520, 610, 790, 900].map((x, i) => sapin(x, 462 - (i % 3) * 6, 0.55, '#182648')).join('');
      const milieu = '<path d="M0 512Q200 490 400 506T800 500T1000 512V600H0Z" fill="#1d3a3a"/>'
        + '<path class="ret-meuse" d="M0 548C140 528 260 566 420 546S700 522 860 544S960 552 1000 548" fill="none" stroke="#3E7C8F" stroke-width="12" stroke-linecap="round"/>'
        + '<g fill="#cfe8ef" opacity=".55"><ellipse cx="300" cy="551" rx="16" ry="2"/><ellipse cx="660" cy="531" rx="12" ry="2"/></g>'
        + maison(170, 512, 1, '#5b6182') + maison(205, 516, 0.8, '#6b4a5a') + maison(610, 506, 0.9, '#5b6182')
        + '<g transform="translate(640,500)"><rect x="-9" y="-46" width="18" height="46" fill="#2a3256"/><path d="M-12-46L0-74 12-46z" fill="#5b6182"/><rect x="-3" y="-36" width="6" height="8" fill="#FFC857"/></g>'
        + '<g class="ret-hibou" transform="translate(860,470)"><path d="M0 40V-6" stroke="#2a1a10" stroke-width="5"/>' + sapin(0, 0, 0.9, '#183b31') + '<g transform="translate(-2,-36)"><ellipse rx="7" ry="9" fill="#8B5A3C"/><g class="yeux"><circle cx="-3" cy="-3" r="2.4" fill="#FFF4D6"/><circle cx="3" cy="-3" r="2.4" fill="#FFF4D6"/></g></g></g>';
      const pres = '<path d="M0 562Q250 540 500 556T1000 560V600H0Z" fill="#14302a"/><rect x="0" y="598" width="1000" height="900" fill="#14302a"/>'
        + [40, 300, 470, 740, 950].map((x, i) => sapin(x, 572, 1.1 + (i % 2) * 0.25, '#0f2620')).join('')
        + [120, 380, 690].map((x, i) => `<circle class="ret-luciole" style="animation-delay:${i * 0.7}s" cx="${x}" cy="${530 - i * 8}" r="3" fill="#ffe9a0"/>`).join('');
      const flamme = i => `<g class="vie" data-i="${i}" transform="translate(${i * 34},0)"><path d="M0-15C-11 0-8 13 0 17C8 13 11 0 0-15Z" fill="#FFC857" stroke="#b9801a" stroke-width="1.5"/><path d="M0-4C-4 3-3 9 0 11C3 9 4 3 0-4Z" fill="#fff4d6"/></g>`;
      zone.innerHTML = `<svg class="retour" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label="La montgolfière rentre au château entre les nuages">
${A.fond(State.nuit, 111, { x: 880, y: 90, r: 28 })}
<g class="ret-filante-deco" aria-hidden="true"><path d="M0 0L-90 34" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>
<g class="ret-ballon2" transform="translate(760,170) scale(.16)" opacity=".75">${window.DECORS.ballonSVG()}</g>
<g class="ret-oies" transform="translate(-400,80)">${[[0, 0], [22, 12], [44, 24], [22, -12], [44, -24]].map(([x, y]) => `<path d="M${x} ${y}q-8-6-16 0q8-2 16 0q8-2 16 0q-8-6-16 0" fill="#cfd3ee"/>`).join('')}</g>
<g class="ret-chauves" transform="translate(-400,140)">${[[0, 0], [40, 18]].map(([x, y]) => `<g transform="translate(${x},${y})"><path class="aile" d="M0 0q-10-8-20-2q6 2 8 8q4-4 12-6zM0 0q10-8 20-2q-6 2-8 8q-4-4-12-6z" fill="#1d2140"/></g>`).join('')}</g>
<g class="ret-plan ret-loin">${tuile(loin)}</g>
<g class="ret-plan ret-milieu">${tuile(milieu)}</g>
<g class="ret-chateau" transform="translate(1250,560)"><path d="M-110 0l20-26h180l20 26z" fill="#2F5D50"/><rect x="-80" y="-120" width="150" height="40" fill="#c9a466"/><path d="M-90-118l18-24h132l18 24z" fill="#5b6182"/><rect x="-86" y="-84" width="170" height="84" fill="#c9a466"/><rect x="-104" y="-104" width="36" height="104" rx="18" fill="#b8925a"/><path d="M-110-100l24-44 24 44z" fill="#5b6182"/><rect x="66" y="-112" width="40" height="112" rx="20" fill="#b8925a"/><path d="M60-108l26-48 26 48z" fill="#5b6182"/><rect x="20" y="-140" width="30" height="24" fill="#b8925a"/><path d="M16-140l19-24 19 24z" fill="#5fa3a3"/><rect x="-10" y="-60" width="20" height="30" rx="10" fill="#FFC857"/><rect x="-60" y="-112" width="8" height="10" fill="#FFC857"/><rect x="30" y="-110" width="8" height="10" fill="#FFC857"/></g>
<g class="ret-plan ret-pres">${tuile(pres)}</g>
<g class="ret-nuages"></g>
<g class="ret-bonus" transform="translate(-400,0)"><circle r="26" fill="url(#halo-or)"/><path d="M0-15l4.4 9 10 1.4-7.2 7 1.7 9.9L0 27.6l-8.9 4.7 1.7-9.9-7.2-7 10-1.4z" transform="translate(0,-6) scale(.9)" fill="#FFE7A0" stroke="#FFC857"/><path d="M-14 4L-70 26" stroke="#FFE7A0" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>
<g class="ret-ballon" transform="translate(230,330) scale(.75)"><g class="ret-ballon-in">${window.DECORS.ballonSVG()}</g></g>
<g class="ret-hud" aria-hidden="true">
  <g class="vies" transform="translate(40,40)"><rect x="-22" y="-24" width="112" height="48" rx="24" fill="rgba(20,26,58,.75)" stroke="#3d4a95" stroke-width="2"/>${[0, 1, 2].map(flamme).join('')}</g>
  <g class="ret-carte" transform="translate(600,34)"><rect x="-24" y="-22" width="370" height="44" rx="22" fill="rgba(20,26,58,.75)" stroke="#3d4a95" stroke-width="2"/>
    <path d="M0 0H300" stroke="#5a6299" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
    <path class="ret-carte-fait" d="M0 0H300" stroke="#FFC857" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
    ${[0, 100, 200].map((x, i) => `<circle class="ret-carte-etape" data-i="${i}" cx="${x}" r="6" fill="#141A3A" stroke="#FFC857" stroke-width="2"/>`).join('')}
    <g transform="translate(316,4)"><path d="M-12 0v-14h6v6h4v-10l6-6 6 6v10h4v-6h6v14z" fill="#c9a466"/></g>
    <g class="ret-carte-ballon"><circle cy="-8" r="8" fill="#D64045" stroke="#9a2a32" stroke-width="1.5"/><rect x="-3" y="1" width="6" height="5" rx="1" fill="#8B5A3C"/></g></g>
</g>
<text class="ret-etape" x="500" y="250" text-anchor="middle"></text>
</svg>`;
      const svg = $('svg.retour', zone), ballon = $('.ret-ballon', svg), ballonIn = $('.ret-ballon-in', svg), chateau = $('.ret-chateau', svg);
      const couche = $('.ret-nuages', svg), bonusEl = $('.ret-bonus', svg), titre = $('.ret-etape', svg);
      const plans = [[$('.ret-loin', svg), 0.03], [$('.ret-milieu', svg), 0.07], [$('.ret-pres', svg), 0.14]];
      const oies = $('.ret-oies', svg), chauves = $('.ret-chauves', svg), ballon2 = $('.ret-ballon2', svg);
      const borne = v => Math.max(140, Math.min(460, v));
      const ETAPES = [
        { motifs: ['s', 's', 's', 's', 's'], v0: 0.36, v1: 0.44, ecart: 520 },
        { motifs: ['p', 's', 'p', 's', 'p'], v0: 0.40, v1: 0.48, ecart: 520 },
        { motifs: ['m', 'p', 'm', 'm', 'o'], v0: 0.44, v1: 0.52, ecart: 540 },
      ];
      const TOTAL = ETAPES.reduce((n, e) => n + e.motifs.length, 0);
      let y = 330, cible = 330, bx = 230, dernier = null, doigtT = 0, base = null, temps = 0, off = 0;
      let n = 0, i = 0, vies = 3, perdues = 0, echecs = 0, evites = 0, actifs = [], etat = 'attente', atterrissage = null, bonus = null, oiesX = null, chauvesX = null, b2 = 760;
      // D'abord l'histoire (elle reste affichée), puis les consignes, puis le départ
      (async () => {
        await NARR.dire(B(E.intro)); if (!encore()) return;
        NARR.action(T(E.suite) + ' ' + A.icone('suite'), async () => {
          SON.play('clic'); NARR.action(null);
          await NARR.dire(B(E.consigne)); if (!encore()) return;
          NARR.action(A.icone('suite') + ' ' + T(E.depart), () => { SON.play('clic'); NARR.action(null); debutEtape(); });
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

      // ----- Les vies -----
      const majVies = () => $$('.vie', svg).forEach((f, k) => f.classList.toggle('eteinte', k >= vies));
      const viesTexte = () => vies + ' flamme' + (vies > 1 ? 's' : '');
      // ----- Les nuages -----
      const NUAGE = '<g transform="scale(1.15)"><circle cx="-40" cy="0" r="36"/><circle cx="0" cy="-18" r="44"/><circle cx="44" cy="0" r="36"/><ellipse cx="0" cy="16" rx="80" ry="24"/></g>';
      const creer = (orage) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'nuage' + (orage ? ' orage' : ''));
        g.innerHTML = orage
          ? `<g transform="scale(1.35)"><g fill="#7a7f9e">${NUAGE}</g><path class="eclair" d="M-6 24l-14 30h12l-8 26 26-36h-12l10-20z" fill="#FFE066"/></g>`
          : `<g fill="#cfd3ee" opacity=".92">${NUAGE}</g>`;
        couche.appendChild(g); return g;
      };
      const R = () => Math.random();
      const nouvelObstacle = type => {
        const o = { type, x: 1150, touche: false, passe: false, nuages: [] };
        if (type === 's') { o.c = 40 + R() * 290; o.nuages.push({ dy: 0 }); }
        else if (type === 'p') { o.c = 100 + R() * 160; o.nuages.push({ dy: -150 }, { dy: 150 }); }
        else if (type === 'm') { o.c = 110 + R() * 140; o.amp = 70; o.phase = R() * 6.28; o.nuages.push({ dy: 0 }); }
        else { o.c = R() < 0.5 ? 90 : 270; o.nuages.push({ dy: 0, s: 1.35 }); NARR.dire(B(E.orage), { vite: true }); SON.play('grogne'); }
        o.nuages.forEach(nu => { nu.el = creer(type === 'o'); nu.s = nu.s || 1; });
        actifs.push(o);
      };
      const centreDe = (o, nu) => o.c + nu.dy + (o.type === 'm' ? o.amp * Math.sin(temps * 0.0025 + o.phase) : 0);
      // Le pilote automatique des tests : la hauteur sûre devant le prochain obstacle (ou droit dessus)
      const sur = o => {
        if (o.type === 'p') return o.c;
        if (o.type === 'o') return o.c < 180 ? 300 : 60;
        if (o.type === 'm') return o.c < 180 ? o.c + 175 : o.c - 175;
        return o.c < 180 ? o.c + 190 : o.c - 190;
      };
      const vitesse = () => {
        const et = ETAPES[n], k = et.motifs.length > 1 ? Math.min(1, i / (et.motifs.length - 1)) : 0;
        return (et.v0 + (et.v1 - et.v0) * k) * Math.max(0.75, 1 - 0.08 * echecs); // après un échec, un peu moins vite
      };
      const vider = () => { actifs.forEach(o => o.nuages.forEach(nu => nu.el.remove())); actifs = []; bonus = null; bonusEl.setAttribute('transform', 'translate(-400,0)'); };
      const majCarte = () => {
        const fait = ETAPES.slice(0, n).reduce((s, e) => s + e.motifs.length, 0) + Math.max(0, i - actifs.length);
        const p = etat === 'fini' ? 1 : Math.min(1, fait / TOTAL);
        $('.ret-carte-fait', svg).setAttribute('stroke-dashoffset', (1 - p).toFixed(3));
        $('.ret-carte-ballon', svg).setAttribute('transform', `translate(${(p * 300).toFixed(1)},0)`);
        $$('.ret-carte-etape', svg).forEach((c, k) => c.setAttribute('fill', k < n || etat === 'fini' ? '#FFC857' : '#141A3A'));
      };
      // ----- Les étapes -----
      function debutEtape() {
        if (!encore()) return;
        vider(); i = 0; vies = 3; majVies(); etat = 'titre'; majCarte();
        titre.textContent = T(E.etapes[n].titre); titre.classList.remove('montre'); void titre.getBBox(); titre.classList.add('montre');
        NARR.dire(B(E.etapes[n].txt), { vite: true });
        // La vie du ciel : les oies passent à chaque étape, les chauves-souris vers Sedan
        oiesX = 1150; if (n === 2) chauvesX = 1100;
        setTimeout(() => { if (encore() && etat === 'titre') etat = 'jeu'; }, RM ? 300 : 2200);
      }
      const finEtape = () => {
        if (n < ETAPES.length - 1) { n++; echecs = 0; SON.play('accord'); debutEtape(); }
        else arrivee();
      };
      const perdu = () => {
        etat = 'perdu'; echecs++;
        actifs.forEach(o => o.nuages.forEach(nu => nu.el.classList.add('pouf')));
        setTimeout(vider, 500);
        SON.play('oh');
        NARR.dire(B(E.perdu)).then(() => {
          if (!encore() || etat !== 'perdu') return;
          NARR.action(A.icone('recommencer') + ' ' + esc(T(E.reessayer)), () => { SON.play('clic'); NARR.action(null); debutEtape(); });
        });
      };
      const touche = o => {
        o.touche = true; vies--; perdues++; majVies();
        o.nuages.forEach(nu => nu.el.classList.add('pouf'));
        ballonIn.classList.remove('secoue'); void ballonIn.getBBox(); ballonIn.classList.add('secoue');
        SON.play('plouf'); vibrer(120);
        if (vies <= 0) { perdu(); return; }
        NARR.dire({ txt: T(E.touche.txt).replace('{vies}', viesTexte()), expr: E.touche.expr }, { vite: true });
      };
      const arrivee = () => {
        etat = 'fini'; vider(); majCarte();
        chateau.classList.add('arrive');
        if (perdues === 0) badge('pilote'); // pas une seule vie perdue
        // Le château arrive, puis la montgolfière descend et se pose dans l'herbe, juste à côté
        setTimeout(() => { if (encore()) atterrissage = { t: performance.now(), x0: bx, y0: y }; }, RM ? 0 : 1600);
      };
      const pose = async () => {
        if (!encore()) return;
        SON.play('allume'); await NARR.dire(B(E.arrivee)); if (!encore()) return;
        NARR.action(A.icone('suite') + ' ' + T(E.terrierBouton), () => { SON.play('clic'); NARR.action(null); fondu(() => self.terrier(r), 600); });
      };
      majVies(); majCarte();

      const boucle = ts => {
        if (dernier == null) dernier = ts; const dt = Math.min(60, ts - dernier); dernier = ts; temps += dt;
        // Le paysage défile (il s'arrête à l'arrivée), le ciel vit
        if (etat !== 'fini') {
          off += dt;
          plans.forEach(([g, v]) => g.setAttribute('transform', `translate(${(-((off * v) % 1000)).toFixed(1)},0)`));
        }
        b2 -= dt * 0.012; if (b2 < -120) b2 = 1120; ballon2.setAttribute('transform', `translate(${b2.toFixed(1)},${(170 + Math.sin(temps * 0.0008) * 10).toFixed(1)}) scale(.16)`);
        if (oiesX != null) { oiesX -= dt * 0.09; oies.setAttribute('transform', `translate(${oiesX.toFixed(1)},${(80 + Math.sin(temps * 0.002) * 6).toFixed(1)})`); if (oiesX < -200) oiesX = null; }
        if (chauvesX != null) { chauvesX -= dt * 0.13; chauves.setAttribute('transform', `translate(${chauvesX.toFixed(1)},${(150 + Math.sin(temps * 0.006) * 18).toFixed(1)})`); if (chauvesX < -200) chauvesX = null; }
        if (atterrissage) {
          const kA = Math.min(1, (ts - atterrissage.t) / (RM ? 50 : 2600)), e = kA * kA * (3 - 2 * kA);
          bx = atterrissage.x0 + (600 - atterrissage.x0) * e; y = atterrissage.y0 + (548 - atterrissage.y0) * e;
          if (kA >= 1) { atterrissage = null; pose(); }
        } else if (etat !== 'fini') {
          // Pilote automatique (tests) : vers la hauteur sûre du prochain obstacle, ou droit dessus
          const auto = svg.dataset.auto;
          if (auto && etat === 'jeu') {
            const o = actifs.filter(a => !a.touche && a.x > 120).sort((a, b) => a.x - b.x)[0];
            if (o) cible = borne((auto === 'touche' ? centreDe(o, o.nuages[0]) : sur(o)) + 120);
          }
          y += (cible - y) * Math.min(1, dt / 160);
        }
        ballon.setAttribute('transform', `translate(${bx.toFixed(1)},${y.toFixed(1)}) scale(.75)`);
        if (etat === 'jeu') {
          const et = ETAPES[n], v = vitesse(), Ey = y - 120;
          const derniereX = actifs.length ? actifs[actifs.length - 1].x : -Infinity;
          if (i < et.motifs.length && (!actifs.length || derniereX < 1150 - et.ecart)) {
            nouvelObstacle(et.motifs[i]); i++;
            // Une étoile filante, au milieu des étapes 2 et 3
            if (n > 0 && i === 3) bonus = { x: 1200, y: 60 + R() * 240 };
          }
          actifs.forEach(o => {
            o.x -= dt * v;
            o.nuages.forEach(nu => {
              const c = centreDe(o, nu);
              nu.el.setAttribute('transform', `translate(${o.x.toFixed(0)},${c.toFixed(0)})`);
              if (!o.touche && etat === 'jeu' && Math.abs(o.x - 230) < 105 * nu.s && Math.abs(c - Ey) < 88 * nu.s) touche(o);
            });
            if (!o.passe && o.x < 120) {
              o.passe = true;
              if (!o.touche && etat === 'jeu') { evites++; if (evites % 3 === 0) NARR.dire({ txt: T(E.evite[(evites / 3) % E.evite.length]), expr: 'joie' }, { vite: true }); }
            }
          });
          if (etat === 'jeu') {
            actifs = actifs.filter(o => { if (o.x < -200) { o.nuages.forEach(nu => nu.el.remove()); return false; } return true; });
            if (bonus) {
              bonus.x -= dt * v * 1.25;
              bonusEl.setAttribute('transform', `translate(${bonus.x.toFixed(0)},${bonus.y.toFixed(0)})`);
              if (Math.abs(bonus.x - 230) < 70 && Math.abs(bonus.y - Ey) < 80) {
                SON.play('filante');
                if (vies < 3) { vies++; majVies(); $$('.vie', svg)[vies - 1].classList.add('rallume'); NARR.dire(B(E.bonus), { vite: true }); } else NARR.dire(B(E.bonusPlein), { vite: true });
                bonus = null; bonusEl.setAttribute('transform', 'translate(-400,0)');
              } else if (bonus.x < -100) { bonus = null; bonusEl.setAttribute('transform', 'translate(-400,0)'); }
            }
            majCarte();
            if (i >= et.motifs.length && !actifs.length) finEtape();
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
      // Les trésors des Ardennes, cachés au fond des impasses
      const SURPRISES = ['ardoise', 'fer', 'pantin', 'plume'], choisies = [];
      for (const p of impasses) { if (choisies.length >= 4) break; if (choisies.every(q => Math.abs(q[0] - p[0]) >= 3)) choisies.push(p); }
      choisies.sort((p, q) => p[0] - q[0]);
      const surprises = choisies.map((p, i) => ({ id: SURPRISES[i], c: p[0], l: p[1], vue: false }));
      const DESSIN_SURPRISE = {
        ardoise: '<path d="M-24-8l36-8 12 18-36 8z" fill="#6b5b8a" stroke="#45395e" stroke-width="2" stroke-linejoin="round"/><path d="M-16-6l28-6M-12 0l28-6" stroke="#8d7cb0" stroke-width="1.5" stroke-linecap="round"/>',
        fer: '<path d="M-13-17v13a13 13 0 0 0 26 0v-13" fill="none" stroke="#9aa0b5" stroke-width="8" stroke-linecap="round"/><g fill="#45395e"><circle cx="-13" cy="-9" r="1.6"/><circle cx="-11" cy="2" r="1.6"/><circle cx="13" cy="-9" r="1.6"/><circle cx="11" cy="2" r="1.6"/></g>',
        pantin: '<circle cx="0" cy="-14" r="7" fill="#FFC857"/><circle cx="-2.4" cy="-15" r="1.2" fill="#2B2B33"/><circle cx="2.4" cy="-15" r="1.2" fill="#2B2B33"/><rect x="-6" y="-6" width="12" height="16" rx="3" fill="#D64045"/><path d="M-6-3l-10 8M6-3l10 8M-3 10l-4 12M3 10l4 12" stroke="#FFC857" stroke-width="3.5" stroke-linecap="round"/>',
        plume: '<path d="M-18 16C-6-2 6-14 22-20C16-6 4 6-14 18z" fill="#FFF6E0" stroke="#cfd3ee" stroke-width="1.4"/><path d="M-18 18L20-18" stroke="#8a90a8" stroke-width="1.4"/>',
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
    // Le chapitre 5 commence toujours par l'épilogue (après la lettre comme depuis le « 5 » du ruban).
    // La fin vient ensuite (opts.diplome). La première fois, en trois temps : le diplôme seul, la remise des badges
    // (Quenotte les sort de sa sacoche et les accroche sur l'étagère), puis l'écran de fin ; ensuite, directement
    // l'écran de fin. opts.temps force un temps ('diplome', 'ceremonie', 'tableau').
    render(opts) {
      if (!(opts && opts.diplome)) return this.epilogueHTML();
      const temps = this.temps = opts.temps || (State.ceremonie ? 'tableau' : 'diplome');
      const titre = `<h2 class="decor-titre"><span class="decor-heure">La nuit dernière à 3 h 40</span>${temps === 'ceremonie' ? esc(T(D.ceremonie.titre)) : 'Bravo ' + esc(C.enfant) + ' !'}</h2>`;
      if (temps === 'diplome') return `<section class="ch ch5 fin5 temps-diplome">${titre}<div class="confettis" aria-hidden="true"></div><div class="diplome-wrap">${diplomeHTML()}</div></section>`;
      if (temps === 'ceremonie') return `<section class="ch ch5 fin5 temps-ceremonie">${titre}<div class="confettis" aria-hidden="true"></div>
  <div class="ceremonie">
    <div class="ceremonie-q">${A.quenotteSacoche()}<span class="sac-invite" aria-hidden="true">${esc(T(D.ceremonie.touche))}</span></div>
    <section class="etagere" aria-labelledby="t-etagere"><h3 class="etagere-titre"><span id="t-etagere">${esc(T(D.ceremonie.etagere))}</span><span class="etagere-compte"></span></h3>${cielHTML(State.etoilesRemises ? nbEtoiles() : 0)}${etagereHTML(State.remis || [])}</section>
  </div>
</section>`;
      return tableauHTML(titre);
    },
    mount(r, opts) {
      if (!(opts && opts.diplome)) { this.retour(r); return; }
      heure('03:40'); MUS.ambiance('diplome');
      const premiere = !State.fini;
      complete(5); if (premiere) { State.fini = true; save(); updateFil(5); }
      rangerDansAlbum(true);
      badge('jumelle', true); // sans annonce : Quenotte la remet elle-même pendant la cérémonie
      const ici = this.jetonDip = (this.jetonDip || 0) + 1;
      const encore = () => this.jetonDip === ici && r.isConnected;
      if (this.temps === 'diplome') {
        if (premiere) SON.play('fanfare');
        pluie($('.confettis', r), 40);
        etape(null);
        NARR.dire(B(D.ceremonie.annonce)).then(() => {
          if (!encore()) return;
          NARR.action(A.icone('suite') + ' ' + esc(T(D.ceremonie.bouton)), () => { SON.play('clic'); fondu(() => show(5, { diplome: true, temps: 'ceremonie' }), 600); });
        });
        return;
      }
      if (this.temps === 'ceremonie') { this.ceremonie(r, encore); return; }
      // L'écran de fin ; après le bravo, Quenotte invite à ouvrir son carnet des Ardennes
      const dip = () => fenetreDiplome();
      $('#btn-dip-grand', r).onclick = () => { SON.play('papier'); dip(); };
      $('#btn-tresors', r).onclick = () => { SON.play('clic'); fenetreTresors(() => { if (encore()) show(5, { diplome: true, temps: 'tableau' }); }); };
      $('#btn-carnet5', r).onclick = () => { SON.play('papier'); ouvrirCarnet(() => { if (encore()) show(5, { diplome: true, temps: 'tableau' }); }); };
      // Après l'atelier, l'écran de fin se redessine (le dessin en miniature, un éventuel nouveau badge)
      $('#btn-dessin5', r).onclick = () => { SON.play('clic'); atelier(() => show(5, { diplome: true, temps: 'tableau' })); };
      $('#btn-album5', r).onclick = () => { SON.play('clic'); album(); };
      $('#btn-revoir5', r).onclick = () => show(1, { scene: 0 });
      NARR.dire(B(D.diplome)).then(() => wait(RM ? 0 : 1400)).then(() => {
        if (!encore()) return;
        NARR.dire({ txt: T(window.ARDENNES.diplome.quenotte), expr: 'clin' });
        NARR.action(`${ICONE_CHENE} ${esc(window.ARDENNES.diplome.bouton)}`, () => { SON.play('papier'); ouvrirCarnet(() => { if (encore()) show(5, { diplome: true, temps: 'tableau' }); }); });
      });
    },
    // La remise des badges : chaque toucher de la sacoche en sort une médaille, qui s'envole au milieu de l'écran
    // (Quenotte dit ce qu'elle récompense), puis va s'accrocher à son crochet. Ensuite, les étoiles trouvées sortent
    // ensemble : elles dessinent la constellation de l'enfant (une dent), puis s'allument une à une dans son ciel.
    // « Passer » accroche et allume tout d'un coup.
    ceremonie(r, encore) {
      const sac = $('.sacoche', r), zone = $('.ceremonie', r), invite = $('.sac-invite', r), compte = $('.etagere-compte', r);
      const ids = badgesGagnes(), nbE = nbEtoiles();
      State.remis = (State.remis || []).filter(id => ids.indexOf(id) >= 0);
      const file = ids.filter(id => State.remis.indexOf(id) < 0);
      let etoilesAttendent = nbE > 0 && !State.etoilesRemises;
      let occupe = false, finie = false, enVol = null;
      const majCompte = () => { compte.textContent = $$('.case-med:not(.a-gagner):not(.attend)', r).length + ' / ' + D.badges.length; };
      const accrocher = (id, anime) => {
        const c = $(`.case-med[data-badge="${id}"]`, r); if (!c) return;
        decrocherAttente(c, id); if (anime) { c.classList.remove('posee'); void c.offsetWidth; c.classList.add('posee'); }
        if (State.remis.indexOf(id) < 0) { State.remis.push(id); save(); }
        majCompte();
      };
      const cases = () => $$('.ciel-cases .ciel-etoile', r);
      const allumer = (i, anime) => {
        const e = cases()[i]; if (!e) return;
        e.classList.remove('eteinte'); if (anime) e.classList.add('allume');
        $('.ciel-compte', r).textContent = $$('.ciel-cases .ciel-etoile:not(.eteinte)', r).length + ' / ' + totalEtoiles;
      };
      const continuer = () => { State.ceremonie = true; save(); SON.play('clic'); fondu(() => show(5, { diplome: true, temps: 'tableau' }), 600); };
      const finir = () => {
        if (finie || !encore()) return; finie = true;
        zone.classList.remove('pleine'); invite.hidden = true;
        etape(continuer);
        pluie($('.confettis', r), 36); SON.play('harpe');
        NARR.dire(B(D.ceremonie.fin)).then(() => { if (encore()) NARR.action(A.icone('suite') + ' ' + esc(T(D.ceremonie.continuer)), continuer); });
      };
      // Après les médailles : les étoiles attendent encore dans la sacoche
      const annoncerEtoiles = () => {
        if (!encore() || !etoilesAttendent || occupe) return;
        zone.classList.add('pleine');
        NARR.dire({ txt: remplir(T(D.ceremonie.etoiles.txt)), expr: D.ceremonie.etoiles.expr }).then(() => {
          if (encore() && etoilesAttendent && !occupe) NARR.action(`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#etoile5"/></svg> ${esc(T(D.ceremonie.etoilesBouton))}`, sortirEtoiles);
        });
      };
      const apres = () => {
        occupe = false;
        if (file.length) { NARR.action(A.icone('suite') + ' ' + esc(T(D.ceremonie.suivant)), sortir); return; }
        if (etoilesAttendent) { setTimeout(annoncerEtoiles, RM ? 0 : 600); return; }
        setTimeout(finir, RM ? 0 : 700);
      };
      const sortir = () => {
        if (occupe || finie || !encore()) return;
        if (!file.length) { if (etoilesAttendent) sortirEtoiles(); return; }
        occupe = true; NARR.action(null); invite.hidden = true;
        const id = enVol = file.shift(), nom = window.CERTIFICAT.nomBadge(id, true);
        sac.classList.remove('secoue'); void sac.getBoundingClientRect(); sac.classList.add('secoue', 'ouvre');
        SON.play('badge');
        NARR.dire({ txt: nom + ' ! ' + window.CERTIFICAT.texteBadge(id, true), expr: 'joie' });
        volMedaille(id, nom, sac, $(`.case-med[data-badge="${id}"]`, r)).then(() => {
          sac.classList.remove('ouvre'); enVol = null;
          if (!encore()) return;
          accrocher(id, true); SON.play('toc');
          if (!file.length && !etoilesAttendent) zone.classList.remove('pleine');
          apres();
        });
      };
      function sortirEtoiles() {
        if (occupe || finie || !etoilesAttendent || !encore()) return;
        occupe = true; etoilesAttendent = false; NARR.action(null); invite.hidden = true; etape(toutAllumer);
        sac.classList.remove('secoue'); void sac.getBoundingClientRect(); sac.classList.add('secoue', 'ouvre');
        SON.play('etoile');
        NARR.dire({ txt: remplir(T(nbE >= 3 ? D.ceremonie.constellation.txt : D.ceremonie.constellationPeu.txt)), expr: 'joie' });
        volConstellation(nbE, sac, cases().slice(0, nbE), i => { if (encore()) { allumer(i, true); if (i % 3 === 0) SON.play('etoile'); } }).then(() => {
          sac.classList.remove('ouvre'); zone.classList.remove('pleine');
          if (!encore()) return;
          State.etoilesRemises = true; save();
          apres();
        });
      }
      // « Passer » pendant les étoiles : elles s'allument toutes d'un coup, et la cérémonie se termine
      const toutAllumer = () => {
        for (let i = 0; i < nbE; i++) allumer(i, !RM);
        etoilesAttendent = false; State.etoilesRemises = true; save();
        annulerVols(); occupe = false; sac.classList.remove('ouvre');
        finir();
      };
      // « Passer » pendant les médailles : elles s'accrochent toutes, puis on arrive aux étoiles (à ne pas manquer)
      const toutAccrocher = () => {
        annulerVols(); if (enVol) { accrocher(enVol, !RM); enVol = null; }
        file.splice(0).forEach(id => accrocher(id, !RM));
        occupe = false; sac.classList.remove('ouvre');
        if (etoilesAttendent) { etape(toutAllumer); annoncerEtoiles(); } else finir();
      };
      sac.addEventListener('click', sortir);
      sac.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sortir(); } });
      // Toucher une médaille (ou un crochet vide) : Quenotte dit ce qu'elle récompense, ou comment la gagner
      $$('.case-med', r).forEach(c => c.addEventListener('click', () => {
        if (occupe || c.classList.contains('attend')) return;
        const g = !c.classList.contains('a-gagner');
        SON.play('clic');
        NARR.dire({ txt: window.CERTIFICAT.nomBadge(c.dataset.badge, g) + (g ? ' ! ' : ' : ') + window.CERTIFICAT.texteBadge(c.dataset.badge, g), expr: g ? 'joie' : 'clin' });
      }));
      majCompte();
      if (!file.length && !etoilesAttendent) { finir(); return; }
      etape(toutAccrocher);
      if (!file.length) { annoncerEtoiles(); return; }
      zone.classList.add('pleine');
      NARR.dire(file.length > 1 ? { txt: remplir(T(D.ceremonie.intro.txt)), expr: D.ceremonie.intro.expr } : B(D.ceremonie.intro1));
    },
    unmount() { this.jeton = (this.jeton || 0) + 1; this.jetonDip = (this.jetonDip || 0) + 1; annulerVols(); cancelAnimationFrame(this.raf); window.removeEventListener('deviceorientation', this.incline); window.removeEventListener('keydown', this.clavierNuages); window.removeEventListener('keydown', this.clavier); clearTimeout(this.tAide); },
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
  // Les mots propres à l'enfant, en gras dans le bandeau (la rivière seulement si les parents l'ont nommée)
  NARR.personnaliser([C.enfant, C.ville, C.chat, C.poupee, C.frere].concat(C.profil && C.profil.riviere ? [C.riviere, C.Riviere] : []));
  buildFil();
  // Premier toucher : on autorise les sons et on lance la musique d'ambiance
  const GESTES = ['pointerdown', 'touchend', 'click', 'keydown'];
  const premierGeste = () => { SON.unlock(); MUS.demarrer(); GESTES.forEach(g => document.removeEventListener(g, premierGeste)); };
  GESTES.forEach(g => document.addEventListener(g, premierGeste));
  // Plein écran automatique au premier toucher (une seule tentative : si on en sort, les réglages permettent d'y revenir),
  // sauf s'il a été décoché à la main dans les réglages (voir src/lib/pleinEcran.ts, commun à toutes les pages)
  if (PLEIN.api && !PLEIN.appli) {
    const autoPlein = e => {
      if (e.target && e.target.closest && e.target.closest('.prefs')) return;
      document.removeEventListener('click', autoPlein, true);
      if (!PLEIN.actif() && !window.PLEIN_ECRAN.refuse()) PLEIN.entrer();
    };
    document.addEventListener('click', autoPlein, true);
  }
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(n => document.addEventListener(n, boutonPlein));

  // Le « # » de l'adresse porte le profil de l'enfant ; on démarre toujours par l'accueil (ou ?chapitre=n pour tester)
  // Ouverture sans QR code ni #exemple : l'écran de choix du parcours
  if (window.PROFIL.origine === 'adresse' || window.PROFIL.origine === 'memoire') rangerDansAlbum(false); // une histoire créée : dans l'album dès le début
  if (demande != null) show(demande); else if (window.PROFIL.origine === 'choix') afficherChoix(); else show(0);

  // Exposé pour les tests
  window.APP = { show, state: State, nuitTexte };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
