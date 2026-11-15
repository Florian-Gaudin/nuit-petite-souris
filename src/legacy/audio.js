// Effets sonores fabriqués en code (Web Audio). Rien ne joue avant le premier toucher.
// La musique d'ambiance (musique.js) se branche sur la même sortie : le bouton son coupe tout.
window.SON = (function () {
  'use strict';
  let ctx = null, master = null, ronfleTimer = null, debloque = false;
  let muet = false;
  muet = window.STOCKAGE.lire('souris.muet') === '1';

  function ensure() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
        ctx = new AC(); master = ctx.createGain(); master.gain.value = muet ? 0 : 0.6; master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { }
    return ctx;
  }
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
  const sons = {
    lanterne() { tone(660, 0.15, 'triangle', 0.25); tone(990, 0.35, 'triangle', 0.2, 0.12); },
    badge() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.22, i * 0.12)); },
    etoile() { [1319, 1760, 2093].forEach((f, i) => tone(f, 0.3, 'sine', 0.16, i * 0.07)); tone(2637, 0.5, 'sine', 0.1, 0.22); },
    fanfare() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.4, 'triangle', 0.2, i * 0.14)); tone(1568, 0.8, 'triangle', 0.18, 0.75); },
    clic() { tone(900, 0.05, 'square', 0.05); },
    toc() { tone(420, 0.06, 'triangle', 0.12); },
    // Le théâtre : les trois coups du brigadier (bâton sur le plancher), puis des sons chauds, graves et doux
    // Les secrets des Ardennes
    grogne() { bruit(0.18, 0.2, 0, 220, 2); bruit(0.14, 0.16, 0.22, 200, 2); },
    plume() { bruit(0.35, 0.06, 0, 1400, 0.6); },
    trompette() { [392, 523, 659].forEach((f, i) => tone(f, 0.35, 'triangle', 0.1, i * 0.14)); tone(784, 0.6, 'triangle', 0.1, 0.42); },
    // Le Cabaret Vert : seize temps de techno mélodique (la mineur, 124 battements par minute) —
    // grosse caisse, clap, charleston, basse roulante, accords « supersaw » qui s'ouvrent, montée finale
    concert() {
      const temps = 60 / 124, d = temps / 4;
      const accords = [[220, 262, 330], [175, 220, 262], [262, 330, 392], [196, 247, 294]]; // la mineur, fa, do, sol
      const basses = [55, 43.65, 65.41, 49];
      for (let i = 0; i < 16; i++) {
        const t = i * temps, mesure = Math.floor(i / 4), ouverture = 500 + i * 220;
        tone(150, 0.28, 'sine', 0.5, t, 42); // grosse caisse
        if (i % 2) bruit(0.14, 0.18, t, 1400, 0.6); // clap
        for (let k = 1; k < 4; k++) {
          bruit(0.025, k === 2 ? 0.07 : 0.035, t + k * d, 8500, 1); // charleston
          synth(basses[mesure], d * 0.9, 0.11, t + k * d, { de: 380, a: 140, q: 7 }); // basse roulante
        }
        // L'arpège du lead : une note par croche, le filtre s'ouvre au fil des mesures
        const ac = accords[mesure];
        synth(ac[(i * 2) % 3] * 2, temps * 0.45, 0.05, t, { voix: 3, desaccord: 14, de: ouverture, a: ouverture * 0.7, q: 5 });
        synth(ac[(i * 2 + 1) % 3] * 2, temps * 0.45, 0.04, t + temps / 2, { voix: 3, desaccord: 14, de: ouverture, a: ouverture * 0.7, q: 5 });
        // La nappe : un accord tenu à chaque mesure
        if (i % 4 === 0) ac.forEach(f => synth(f, temps * 4, 0.025, t, { voix: 3, desaccord: 18, de: 700, a: 2400, attaque: 0.4 }));
      }
      // La montée, puis le grand coup final
      for (let k = 0; k < 8; k++) bruit(0.25, 0.04 + k * 0.012, 12 * temps + k * temps / 2, 800 + k * 900, 0.8);
      tone(110, 1.2, 'sine', 0.45, 16 * temps, 38);
      [220, 262, 330, 440].forEach(f => synth(f, 1.6, 0.04, 16 * temps, { voix: 5, desaccord: 16, de: 3000, a: 600 }));
    },
    coup() { tone(68, 0.4, 'sine', 0.55); bruit(0.12, 0.45, 0, 300, 0.8); tone(68, 0.3, 'sine', 0.18, 0.17); bruit(0.08, 0.14, 0.17, 300, 0.8); },
    coup1() { sons.coup(); tone(196, 0.7, 'triangle', 0.12, 0.08); },
    coup2() { sons.coup(); tone(247, 0.7, 'triangle', 0.12, 0.08); },
    coup3() { sons.coup(); tone(294, 0.9, 'triangle', 0.13, 0.08); sons.accord(0.5); },
    accord(w) { [131, 165, 196, 262].forEach((f, i) => tone(f, 1.4, 'triangle', 0.07, (w || 0) + i * 0.04)); },
    bois() { tone(196, 0.32, 'sine', 0.24); tone(392, 0.18, 'sine', 0.06); bruit(0.03, 0.08, 0, 700, 1); },
    harpe() { [131, 165, 196, 262, 330, 392].forEach((f, i) => tone(f, 0.8, 'triangle', 0.08, i * 0.06)); },
    ressort() { tone(150, 0.35, 'sine', 0.26, 0, 300); tone(300, 0.3, 'sine', 0.12, 0.2, 150); },
    tambour() { for (let i = 0; i < 10; i++) bruit(0.05, 0.1 + i * 0.012, i * 0.045, 170, 1); tone(85, 0.35, 'sine', 0.32, 0.47); },
    contrebasse() { tone(110, 0.55, 'triangle', 0.3, 0, 72); },
    flute() { tone(330, 0.3, 'sine', 0.12, 0, 440); tone(440, 0.35, 'sine', 0.1, 0.25, 330); },
    pointe() { tone(262, 0.06, 'sine', 0.05); },
    oh() { [262, 247, 233].forEach((f, i) => tone(f, 0.55, 'triangle', 0.07, i * 0.03, f * 0.8)); bruit(0.6, 0.05, 0, 300, 0.6); },
    rires() { for (let i = 0; i < 7; i++) tone(230 + (i % 2) * 34, 0.09, 'triangle', 0.08, i * 0.11); },
    applaudir() { for (let i = 0; i < 32; i++) bruit(0.05, 0.07 + Math.random() * 0.07, i * 0.04 + Math.random() * 0.03, 900 + Math.random() * 900, 0.7); },
    sifflet() { tone(1100, 0.18, 'sine', 0.06, 0, 1600); tone(1600, 0.32, 'sine', 0.06, 0.2, 1150); },
    hourra() { [0, 0.05, 0.1].forEach((w, i) => tone(220 + i * 40, 0.6, 'triangle', 0.06, w, 330 + i * 40)); },
    foule() { bruit(1.3, 0.12, 0, 500, 0.4); bruit(1.1, 0.08, 0.2, 800, 0.5); },
    galop() { [0, 0.12, 0.36, 0.48].forEach(w => bruit(0.06, 0.25, w, 250, 1.5)); },
    hennir() { tone(440, 0.5, 'triangle', 0.1, 0, 330); tone(470, 0.42, 'triangle', 0.06, 0.05, 350); bruit(0.3, 0.04, 0, 600, 0.8); },
    pas() { bruit(0.05, 0.07, 0, 600); },
    mmh() { tone(300, 0.18, 'sawtooth', 0.1); tone(420, 0.3, 'sawtooth', 0.1, 0.16); },
    baillement() { tone(200, 0.8, 'triangle', 0.12, 0, 420); },
    alerte() { tone(880, 0.12, 'square', 0.08); tone(660, 0.12, 'square', 0.08, 0.16); tone(880, 0.12, 'square', 0.08, 0.32); },
    bip() { tone(1200, 0.08, 'square', 0.07); },
    cachet() { bruit(0.12, 0.35, 0, 900); bruit(0.25, 0.2, 0.08, 500); },
    // Une page qui tourne : la feuille glisse (un frottement qui enfle puis s'éteint, environ une demi-seconde), puis retombe
    page() {
      for (let k = 0; k < 10; k++) bruit(0.14, 0.03 + 0.07 * Math.sin(Math.PI * k / 9), k * 0.05, 1400 + k * 220, 0.5);
      bruit(0.09, 0.08, 0.52, 700, 0.8);
    },
    papier() { bruit(0.3, 0.12, 0, 2500); },
    pli() { bruit(0.12, 0.18, 0, 3000); bruit(0.08, 0.1, 0.1, 1800); },
    crayon() { bruit(0.04, 0.05, 0, 2600); },
    plouf() { tone(500, 0.2, 'sine', 0.2, 0, 180); bruit(0.3, 0.1, 0.05, 800); },
    eau() { bruit(0.6, 0.06, 0, 500, 0.7); bruit(0.5, 0.05, 0.3, 700, 0.7); },
    champignon() { tone(880, 0.25, 'sine', 0.18, 0, 1320); tone(1760, 0.4, 'sine', 0.08, 0.1); },
    hulotte() { tone(420, 0.35, 'sine', 0.16, 0, 380); tone(400, 0.5, 'sine', 0.16, 0.45, 340); },
    renard() { bruit(0.08, 0.2, 0, 1500, 2); tone(700, 0.15, 'triangle', 0.08, 0.05, 500); },
    buisson() { bruit(0.25, 0.14, 0, 1800); bruit(0.2, 0.1, 0.18, 1400); },
    pigeon() { tone(520, 0.1, 'sine', 0.12, 0, 640); tone(520, 0.1, 'sine', 0.12, 0.15, 640); tone(500, 0.2, 'sine', 0.1, 0.3, 420); },
    croque() { bruit(0.07, 0.18, 0, 900, 1); bruit(0.07, 0.14, 0.12, 1100, 1); },
    girouette() { [0, 0.12, 0.22, 0.3, 0.37, 0.43].forEach(t => bruit(0.04, 0.1, t, 2200, 3)); tone(660, 0.3, 'triangle', 0.1, 0.6); },
    gresille() { [0, 0.05, 0.13, 0.2, 0.31].forEach(t => bruit(0.03, 0.12, t, 3200, 4)); },
    grince() { tone(180, 0.7, 'sawtooth', 0.05, 0, 260); tone(360, 0.5, 'sawtooth', 0.03, 0.2, 420); },
    ronron() { [0, 0.5, 1].forEach(t => tone(70, 0.45, 'sawtooth', 0.05, t, 60)); },
    pantin() { [784, 988, 784, 1175].forEach((f, i) => tone(f, 0.12, 'square', 0.05, i * 0.14)); },
    luciole() { tone(2093, 0.12, 'sine', 0.08); tone(2637, 0.18, 'sine', 0.06, 0.1); },
    ronds() { tone(1047, 0.3, 'sine', 0.08, 0, 880); tone(880, 0.4, 'sine', 0.06, 0.2, 700); },
    bruleur() { bruit(0.9, 0.16, 0, 260, 0.6); bruit(0.6, 0.08, 0.1, 520, 0.8); },
    filante() { [2637, 2349, 2093, 1760].forEach((f, i) => tone(f, 0.25, 'sine', 0.07, i * 0.06)); },
    oies() { [0, 0.28, 0.5].forEach(t => { tone(520, 0.12, 'sawtooth', 0.05, t, 430); }); },
    allume() { tone(523, 0.2, 'triangle', 0.14); tone(784, 0.3, 'triangle', 0.1, 0.15); },
  };
  function ronfleStart() {
    if (ronfleTimer || muet) return;
    const un = () => { tone(85, 0.9, 'sawtooth', 0.07, 0, 65); tone(60, 0.7, 'triangle', 0.05, 1.2); };
    un(); ronfleTimer = setInterval(un, 2300);
  }
  function ronfleStop() { if (ronfleTimer) { clearInterval(ronfleTimer); ronfleTimer = null; } }

  document.addEventListener('visibilitychange', () => { if (document.hidden) ronfleStop(); });

  return {
    // À appeler depuis un geste de l'utilisateur (toucher, clic) : autorise les sons
    unlock() { debloque = true; return ensure(); },
    contexte() { return ensure(); },
    get master() { ensure(); return master; },
    play(n) {
      try {
        if (muet || !sons[n]) return;
        sons[n]();
        if (window.MUSIQUE) window.MUSIQUE.baisser();
      } catch (e) { }
    },
    ronfleStart, ronfleStop,
    get muet() { return muet; },
    toggle() {
      muet = !muet;
      window.STOCKAGE.ecrire('souris.muet', muet ? '1' : '0');
      if (master) master.gain.value = muet ? 0 : 0.6;
      if (muet) ronfleStop();
      return muet;
    },
  };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
