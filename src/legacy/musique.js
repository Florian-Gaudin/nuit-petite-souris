// La musique d'ambiance : quinze morceaux enregistrés (public/musique/), tous tirés du thème de Quenotte.
// Composés en MIDI et joués avec de vrais instruments (FluidSynth, banque GeneralUser GS), voir outils/musique/morceaux.cjs.
// Chaque fichier boucle sans coupure ; on passe d'une ambiance à l'autre en fondu enchaîné.
window.MUSIQUE = (function () {
  'use strict';
  const RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Durée exacte de chaque boucle (secondes) : la lecture reboucle à cet instant précis
  const BOUCLES = { accueil: 34.2857, chateau: 31.3043, foret: 40, place: 21.8182, montgolfiere: 30, etoiles: 43.6364, meuse: 32.7273, lievre: 20.8696, aiglemont: 33.4884, pantoufle: 36, jeu: 25.7143, camera: 41.1429, lettre: 40, theatre: 22.8571, diplome: 28.8 };
  // Volume propre à chaque ambiance (la caméra et le mini-jeu restent discrets)
  const VOLUMES = { camera: 0.6, jeu: 0.8, pantoufle: 0.85, etoiles: 0.9 };
  const VOLUME = 0.5, FONDU_ENTREE = 2, FONDU_SORTIE = 1.6;

  let ctx = null, sortie = null, gainMus = null, demarree = false, pause = false;
  let courante = 'silence', voix = null, baisseT = null;
  const tampons = {}, chargements = {};

  function prepare() {
    if (ctx) return true;
    const c = window.SON && window.SON.contexte(); if (!c) return false;
    ctx = c; sortie = window.SON.master;
    gainMus = ctx.createGain(); gainMus.gain.value = 1; gainMus.connect(sortie);
    return true;
  }
  // Le morceau d'une ambiance, téléchargé une seule fois (le service worker le garde aussi pour le hors-connexion)
  function charger(nom) {
    if (!BOUCLES[nom]) return Promise.resolve(null);
    if (tampons[nom]) return Promise.resolve(tampons[nom]);
    if (!chargements[nom]) {
      chargements[nom] = fetch('musique/' + nom + '.mp3')
        .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(b => new Promise((ok, ko) => ctx.decodeAudioData(b, ok, ko)))
        .then(t => (tampons[nom] = t))
        .catch(() => { delete chargements[nom]; return null; });
    }
    return chargements[nom];
  }
  const volumeDe = nom => VOLUME * (VOLUMES[nom] || 1);
  // Fait taire une voix en douceur, puis l'arrête
  function eteindre(v, duree) {
    if (!v) return;
    const t = ctx.currentTime;
    try { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0, t + duree); v.src.stop(t + duree + 0.05); } catch (e) { }
  }
  function jouer(nom) {
    const ancienne = voix; voix = null;
    eteindre(ancienne, FONDU_SORTIE);
    if (!BOUCLES[nom]) return;
    charger(nom).then(tampon => {
      if (!tampon || courante !== nom || voix || !demarree) return;
      const src = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime;
      src.buffer = tampon; src.loop = true; src.loopStart = 0; src.loopEnd = Math.min(BOUCLES[nom], tampon.duration);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pause ? 0 : volumeDe(nom), t + (RM ? 0.3 : FONDU_ENTREE));
      src.connect(g).connect(gainMus); src.start(t);
      voix = { src, g, nom };
    });
  }
  // Une fois la musique lancée, les autres morceaux se préparent un à un, sans se presser
  function precharger() {
    const noms = Object.keys(BOUCLES); let i = 0;
    const suivant = () => { if (i >= noms.length) return; charger(noms[i++]).then(() => setTimeout(suivant, 400)); };
    setTimeout(suivant, 4000);
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
    // Pendant un effet sonore, la musique baisse un peu, puis remonte
    baisser() {
      if (!ctx || !voix || pause) return;
      volume(volumeDe(voix.nom) * 0.45, 0.05);
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
