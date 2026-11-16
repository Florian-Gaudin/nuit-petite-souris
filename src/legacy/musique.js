// La musique d'ambiance : quinze morceaux originaux (public/audio/musique/), tirés du thème de Quenotte et des airs
// propres à chaque lieu, composés par les scripts de outils/audio/ (MIDI joué par FluidSynth, banque FluidR3_GM).
// Chaque fichier contient sa boucle et une demi-seconde de marge prise dans la boucle elle-même : la lecture boucle
// sans couture entre les points donnés par public/audio/index.json. D'une ambiance à l'autre : fondu enchaîné.
window.MUSIQUE = (function () {
  'use strict';
  const RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // La musique reste discrète sous le texte ; certaines ambiances encore un peu plus (la caméra, le mini-jeu)
  const VOLUME = 0.75, VOLUMES = { camera: 0.8, jeu: 0.85 };
  const FONDU = 1.8;

  let ctx = null, gainMus = null, demarree = false, pause = false;
  let courante = 'silence', voix = null, baisseT = null, carte = null;
  const tampons = {}, chargements = {};

  function prepare() {
    if (ctx) return true;
    const c = window.SON && window.SON.contexte(); if (!c) return false;
    ctx = c;
    gainMus = ctx.createGain(); gainMus.gain.value = 1; gainMus.connect(window.SON.master);
    return true;
  }
  const infos = nom => (carte && carte.musique && carte.musique[nom]) || null;
  // Le morceau d'une ambiance, téléchargé et décodé une seule fois (le service worker le garde pour le hors-connexion)
  function charger(nom) {
    if (tampons[nom]) return Promise.resolve(tampons[nom]);
    if (!chargements[nom]) {
      chargements[nom] = window.SON.index().then(c => {
        carte = c; const i = infos(nom); if (!i) return null;
        return fetch('audio/' + i.fichier).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
          .then(b => window.SON.decoder(b)).then(t => (tampons[nom] = t));
      }).catch(() => { delete chargements[nom]; return null; });
    }
    return chargements[nom];
  }
  const volumeDe = nom => VOLUME * (VOLUMES[nom] || 1);
  function eteindre(v, duree) {
    if (!v) return;
    const t = ctx.currentTime;
    try { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0, t + duree); v.src.stop(t + duree + 0.05); } catch (e) { }
  }
  function jouer(nom) {
    const ancienne = voix; voix = null;
    eteindre(ancienne, FONDU);
    if (!nom || nom === 'silence') return;
    charger(nom).then(tampon => {
      const i = infos(nom);
      if (!tampon || !i || courante !== nom || voix || !demarree) return;
      const src = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime;
      src.buffer = tampon; src.loop = true;
      src.loopStart = i.debutBoucle; src.loopEnd = Math.min(i.finBoucle, tampon.duration);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pause ? 0 : volumeDe(nom), t + (RM ? 0.3 : FONDU));
      src.connect(g).connect(gainMus); src.start(t, i.debutBoucle);
      voix = { src, g, nom };
    });
  }
  // Une fois la musique lancée, les autres morceaux se préparent un à un, sans se presser
  function precharger() {
    window.SON.index().then(c => {
      if (!c) return;
      const noms = Object.keys(c.musique); let k = 0;
      const suivant = () => { if (k >= noms.length) return; charger(noms[k++]).then(() => setTimeout(suivant, 500)); };
      setTimeout(suivant, 4000);
    });
  }
  function volume(cible, duree) {
    if (!voix) return;
    const t = ctx.currentTime;
    voix.g.gain.cancelScheduledValues(t); voix.g.gain.setValueAtTime(voix.g.gain.value, t); voix.g.gain.linearRampToValueAtTime(cible, t + duree);
  }

  return {
    // Première interaction : on démarre la musique de l'ambiance en cours
    demarrer() {
      if (demarree) return;
      if (!prepare()) return;
      demarree = true;
      jouer(courante);
      precharger();
    },
    ambiance(nom) {
      if (nom === courante) return;
      courante = nom;
      if (demarree) jouer(nom);
    },
    // Pendant un bruitage, la musique s'efface un peu, puis revient
    baisser() {
      if (!ctx || !voix || pause) return;
      volume(volumeDe(voix.nom) * 0.55, 0.06);
      clearTimeout(baisseT);
      baisseT = setTimeout(() => { if (voix && !pause) volume(volumeDe(voix.nom), 0.8); }, 700);
    },
    // Onglet caché, concert du Cabaret Vert : la musique se tait, puis reprend où elle en était
    pause(on) {
      pause = !!on;
      if (!ctx || !voix) return;
      volume(on ? 0 : volumeDe(voix.nom), on ? 0.4 : 1.2);
    },
    get ambianceCourante() { return courante; },
    get reduit() { return RM; },
  };
})();

// Onglet caché : on met la musique en pause
document.addEventListener('visibilitychange', () => { if (window.MUSIQUE) window.MUSIQUE.pause(document.hidden); });

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
