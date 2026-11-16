// Les bruitages : enregistrés (public/audio/bruitages.mp3, une « planche » où tous les sons sont mis bout à bout),
// fabriqués par les scripts de outils/audio/ dans l'univers du conte (bois, parchemin, eau, animaux, magie).
// Seul le concert du Cabaret Vert reste synthétisé ici, en code. Rien ne joue avant le premier toucher ;
// la musique d'ambiance (musique.js) se branche sur la même sortie : le bouton son coupe tout.
window.SON = (function () {
  'use strict';
  let ctx = null, master = null, ronfleTimer = null, debloque = false;
  let muet = window.STOCKAGE.lire('souris.muet') === '1';
  const VOLUME = 0.6, VOLUME_BRUITAGES = 0.9;
  let index = null, chargementIndex = null, planche = null, chargementPlanche = null;
  const derniere = {}; // la dernière variante jouée de chaque son (on évite de rejouer la même deux fois de suite)
  const enCours = {};  // pour chaque son limité, ceux qui jouent encore ({ debut, fin }, en temps du contexte audio)

  function ensure() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
        ctx = new AC(); master = ctx.createGain(); master.gain.value = muet ? 0 : VOLUME; master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { }
    return ctx;
  }
  // La carte des sons (public/audio/index.json), partagée avec la musique
  function chargerIndex() {
    if (!chargementIndex) {
      chargementIndex = fetch('audio/index.json').then(r => r.json()).then(j => (index = j))
        .catch(() => { chargementIndex = null; return null; });
    }
    return chargementIndex;
  }
  function decoder(octets) {
    return new Promise((ok, ko) => { const p = ctx.decodeAudioData(octets, ok, ko); if (p && p.catch) p.catch(ko); });
  }
  function chargerPlanche() {
    if (planche) return Promise.resolve(planche);
    if (!chargementPlanche) {
      chargementPlanche = chargerIndex()
        .then(i => fetch('audio/' + i.bruitages.fichier)).then(r => r.arrayBuffer()).then(decoder)
        .then(t => (planche = t)).catch(() => { chargementPlanche = null; return null; });
    }
    return chargementPlanche;
  }
  // Un bruitage tiré de la planche : une variante au hasard, avec un tout petit fondu à chaque bout
  function jouerSon(nom) {
    if (!planche || !index) { chargerPlanche(); return 0; }
    const variantes = index.bruitages.sons[nom]; if (!variantes || !variantes.length) return 0;
    let k = Math.floor(Math.random() * variantes.length);
    if (variantes.length > 1 && k === derniere[nom]) k = (k + 1) % variantes.length;
    derniere[nom] = k;
    const [debut, duree] = variantes[k], t = ctx.currentTime;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = planche;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(VOLUME_BRUITAGES, t + 0.004);
    g.gain.setValueAtTime(VOLUME_BRUITAGES, t + duree - 0.02); g.gain.linearRampToValueAtTime(0, t + duree);
    src.connect(g).connect(master);
    src.start(t, debut, duree + 0.01);
    return duree;
  }

  // ---------------- Le Cabaret Vert : seize temps de techno mélodique, en code (inchangé) ----------------
  function tone(freq, dur, type, vol, when, slideTo) {
    if (!debloque) return;
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime + (when || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  // Synthé filtré : plusieurs oscillateurs désaccordés (« supersaw ») dans un filtre passe-bas qui bouge
  function synth(freq, dur, vol, when, o) {
    if (!debloque) return;
    const c = ensure(); if (!c) return;
    o = o || {};
    const t0 = c.currentTime + (when || 0);
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = o.q || 3;
    f.frequency.setValueAtTime(o.de || 1200, t0); if (o.a) f.frequency.exponentialRampToValueAtTime(o.a, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + (o.attaque || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    f.connect(g).connect(master);
    const n = o.voix || 1;
    for (let i = 0; i < n; i++) {
      const osc = c.createOscillator(); osc.type = o.type || 'sawtooth'; osc.frequency.value = freq;
      osc.detune.value = (i - (n - 1) / 2) * (o.desaccord || 10);
      osc.connect(f); osc.start(t0); osc.stop(t0 + dur + 0.05);
    }
  }
  function bruit(dur, vol, when, freq, q) {
    if (!debloque) return;
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime + (when || 0);
    const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1200; if (q) f.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(vol || 0.2, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f).connect(g).connect(master); s.start(t0);
  }
  // Grosse caisse, clap, charleston, basse roulante, accords « supersaw » qui s'ouvrent, montée finale
  const TEMPS_CONCERT = 60 / 124, DUREE_CONCERT = 16 * TEMPS_CONCERT + 1.7;
  function concert(dec) {
    dec = dec || 0;
    const temps = TEMPS_CONCERT, d = temps / 4;
    const accords = [[220, 262, 330], [175, 220, 262], [262, 330, 392], [196, 247, 294]]; // la mineur, fa, do, sol
    const basses = [55, 43.65, 65.41, 49];
    for (let i = 0; i < 16; i++) {
      const t = dec + i * temps, mesure = Math.floor(i / 4), ouverture = 500 + i * 220;
      tone(150, 0.28, 'sine', 0.5, t, 42); // grosse caisse
      if (i % 2) bruit(0.14, 0.18, t, 1400, 0.6); // clap
      for (let k = 1; k < 4; k++) {
        bruit(0.025, k === 2 ? 0.07 : 0.035, t + k * d, 8500, 1); // charleston
        synth(basses[mesure], d * 0.9, 0.11, t + k * d, { de: 380, a: 140, q: 7 }); // basse roulante
      }
      const ac = accords[mesure];
      synth(ac[(i * 2) % 3] * 2, temps * 0.45, 0.05, t, { voix: 3, desaccord: 14, de: ouverture, a: ouverture * 0.7, q: 5 });
      synth(ac[(i * 2 + 1) % 3] * 2, temps * 0.45, 0.04, t + temps / 2, { voix: 3, desaccord: 14, de: ouverture, a: ouverture * 0.7, q: 5 });
      if (i % 4 === 0) ac.forEach(f => synth(f, temps * 4, 0.025, t, { voix: 3, desaccord: 18, de: 700, a: 2400, attaque: 0.4 }));
    }
    for (let k = 0; k < 8; k++) bruit(0.25, 0.04 + k * 0.012, dec + 12 * temps + k * temps / 2, 800 + k * 900, 0.8);
    tone(110, 1.2, 'sine', 0.45, dec + 16 * temps, 38);
    [220, 262, 330, 440].forEach(f => synth(f, 1.6, 0.04, dec + 16 * temps, { voix: 5, desaccord: 16, de: 3000, a: 600 }));
  }

  // Le ronflement du chat, tant qu'il dort (le mini-jeu)
  function ronfleStart() {
    if (ronfleTimer || muet) return;
    const un = () => { if (debloque && ctx) jouerSon('ronfle'); };
    un(); ronfleTimer = setInterval(un, 2600);
  }
  function ronfleStop() { if (ronfleTimer) { clearInterval(ronfleTimer); ronfleTimer = null; } }

  document.addEventListener('visibilitychange', () => { if (document.hidden) ronfleStop(); });

  return {
    // À appeler depuis un geste de l'utilisateur (toucher, clic) : autorise les sons. Sur iPhone, un son vide joué
    // pendant ce geste débloque l'audio pour toute la suite ; la planche des bruitages se charge aussitôt.
    unlock() {
      const premier = !debloque;
      debloque = true;
      const c = ensure();
      if (c && premier) {
        try { const b = c.createBuffer(1, 1, c.sampleRate), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) { }
        chargerPlanche();
      }
      return c;
    },
    contexte() { return ensure(); },
    get master() { ensure(); return master; },
    // La carte des sons, pour la musique
    index: chargerIndex,
    decoder(octets) { ensure(); return decoder(octets); },
    // play(nom, { max }) : « max » fois au plus en même temps (un toucher de plus ne fait rien et rend false).
    // Rend le temps restant avant la fin du son, en secondes. Plusieurs concerts du Cabaret Vert se calent sur la
    // mesure du premier : ils restent en rythme et dans les mêmes accords, au lieu de se chevaucher en désordre.
    play(n, opts) {
      try {
        if (muet || !debloque || !ensure()) return 0;
        const max = opts && opts.max, t = ctx.currentTime;
        const actifs = (enCours[n] || []).filter(x => x.fin > t); enCours[n] = actifs;
        if (max && actifs.length >= max) return false;
        let duree;
        if (n === 'concert') {
          const mesure = 4 * TEMPS_CONCERT, premier = actifs.reduce((a, x) => (!a || x.debut < a.debut ? x : a), null);
          const dec = premier ? Math.max(0, premier.debut + Math.ceil((t - premier.debut) / mesure - 1e-6) * mesure - t) : 0;
          concert(dec); duree = dec + DUREE_CONCERT;
          actifs.push({ debut: t + dec, fin: t + duree });
        } else {
          duree = jouerSon(n) || 0;
          if (duree) actifs.push({ debut: t, fin: t + duree });
        }
        if (window.MUSIQUE) window.MUSIQUE.baisser();
        return duree;
      } catch (e) { return 0; }
    },
    ronfleStart, ronfleStop,
    get muet() { return muet; },
    toggle() {
      muet = !muet;
      window.STOCKAGE.ecrire('souris.muet', muet ? '1' : '0');
      if (master) { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(muet ? 0 : VOLUME, t + 0.15); }
      if (muet) ronfleStop();
      return muet;
    },
  };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
