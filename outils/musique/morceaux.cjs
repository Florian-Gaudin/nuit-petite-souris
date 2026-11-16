// Les quinze ambiances de l'histoire, toutes tirées du thème de Quenotte (16 mesures à 3 temps).
// Chaque morceau : une tonalité, un tempo, des instruments, un accompagnement et une variation du thème.
// Rendu : FluidSynth (banque GeneralUser GS), deux tours joués, le second découpé → boucle sans coupure.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const FS = 'C:/Users/Utilisateur/outils-audio/fluidsynth/fluidsynth-v2.6.2-win10-x64-cpp11/bin/fluidsynth.exe';
const SF2 = 'C:/Users/Utilisateur/outils-audio/GeneralUser-GS.sf2';
const FF = 'C:/Users/Utilisateur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
// Les morceaux produits vont dans outils/musique/rendus/ ; copier ensuite les .mp3 dans public/musique/ (et les durées dans src/legacy/musique.js)
const ICI = __dirname, SORTIE = path.join(ICI, 'rendus');
fs.mkdirSync(SORTIE, { recursive: true });

const PPQ = 480, NOIRE = PPQ, CROCHE = PPQ / 2, MESURE = 3 * NOIRE, NB = 16;
const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];

// Le thème de Quenotte, en degrés de la gamme (0 = tonique) et en noires ; null = silence
const THEME = [
  [2, 1], [4, 1], [7, 1], [6, 1.5], [5, .5], [4, 1], [5, 1], [3, 1], [0, 1], [1, 2], [null, 1],
  [2, 1], [4, 1], [7, 1], [8, 1.5], [7, .5], [6, 1], [5, 1], [7, 1], [10, 1], [9, 2], [8, 1],
  [7, 1], [6, 1], [5, 1], [5, 1.5], [4, .5], [3, 1], [4, 1], [2, 1], [0, 1], [1, 3],
  [3, 1], [5, 1], [7, 1], [6, 1.5], [5, .5], [4, 1], [7, 3], [null, 3],
];
// Le contrechant (seconde moitié), et la grille d'accords (degré de la basse ; 7 = septième)
const CONTRE = [[9, 3], [7, 3], [9, 2], [8, 1], [6, 3], [5, 3], [8, 3], [9, 3], [null, 3]];
const GRILLE = [0, 5, 3, 4, 0, 2, 3, '4/7', 5, 3, 0, 4, 3, 4, 0, 0];

// Degré → note MIDI (en mineur, le 7e degré monte d'un demi-ton dans l'accord de dominante)
function hauteur(m, deg, sensible) {
  const g = m.mode === 'min' ? MIN : MAJ, n = g.length, oct = Math.floor(deg / n), d = ((deg % n) + n) % n;
  let v = m.tonique + 12 * oct + g[d];
  if (m.mode === 'min' && sensible && d === 6) v += 1;
  return v;
}
function accord(m, mesure) {
  const c = GRILLE[mesure], sept = typeof c === 'string', r = sept ? 4 : c, dominante = r === 4;
  const degs = [r, r + 2, r + 4].concat(sept ? [r + 6] : []);
  return degs.map(d => hauteur(m, d, dominante));
}

// ---------- Fabrication de la partition d'un morceau ----------
function partition(m) {
  const pistes = []; // {canal, prog, vol, pan, rev, notes:[{t,d,n,v}]}
  const piste = (canal, o) => { const p = { canal, prog: o.prog, vol: o.vol ?? 100, pan: o.pan ?? 64, rev: o.rev ?? 70, notes: [] }; pistes.push(p); return p; };
  const ajoute = (p, t, d, n, v) => { if (n < 0 || n > 127) return; p.notes.push({ t, d, n, v: Math.max(1, Math.min(127, Math.round(v))) }); };

  // La mélodie : le thème, varié (staccato, clairsemé, octave)
  if (m.melodie) {
    const p = piste(0, m.melodie), o = m.melodie, oct = 12 * (o.octave || 0);
    let t = 0;
    THEME.forEach(([deg, d], k) => {
      const duree = d * NOIRE;
      const debutMesure = Math.abs((t / MESURE) - Math.round(t / MESURE)) < 1e-6;
      if (deg !== null && !(o.clairseme && !debutMesure)) {
        const longueur = o.clairseme ? Math.max(duree, MESURE - (t % MESURE)) : duree;
        ajoute(p, t, longueur * (o.staccato ? 0.4 : 0.95), hauteur(m, deg) + 12 + oct, (o.vel || 80) + ((k * 7) % 9) - 4);
      }
      t += duree;
    });
  }
  // Le contrechant
  if (m.contre) {
    const p = piste(1, m.contre), oct = 12 * (m.contre.octave || 0);
    let t = 8 * MESURE;
    CONTRE.forEach(([deg, d]) => { if (deg !== null) ajoute(p, t, d * NOIRE * 0.95, hauteur(m, deg) + 12 + oct, m.contre.vel || 56); t += d * NOIRE; });
  }
  // L'accompagnement, selon le style
  if (m.accomp) {
    const p = piste(2, m.accomp), s = m.accomp.style, v = m.accomp.vel || 58;
    for (let k = 0; k < NB; k++) {
      const a = accord(m, k), t0 = k * MESURE, b = a[0] - 12;
      if (s === 'arpege') [b, b + 7, a[1], a[2], a[1] + 12, a[2]].forEach((n, i) => ajoute(p, t0 + i * CROCHE, CROCHE * 2.5, n, i ? v - 6 + (i % 2) * 5 : v + 10));
      if (s === 'flot') [b, a[1], a[2], b + 12, a[1] + 12, a[2] + 12].forEach((n, i) => { ajoute(p, t0 + i * CROCHE, CROCHE * 2, n, v - 4 + (i % 3) * 3); });
      if (s === 'valse') { ajoute(p, t0, NOIRE * 0.9, b - 12, v + 10); [1, 2].forEach(i => a.slice(1).forEach(n => ajoute(p, t0 + i * NOIRE, NOIRE * 0.5, n, v - 8))); }
      if (s === 'pointes') { ajoute(p, t0, CROCHE * 0.7, b - 12, v + 6); ajoute(p, t0 + 2 * NOIRE, CROCHE * 0.7, b - 5, v - 6); ajoute(p, t0 + NOIRE + CROCHE, CROCHE * 0.5, a[1], v - 14); }
      if (s === 'rebond') { ajoute(p, t0, CROCHE, b - 12, v + 8); ajoute(p, t0 + NOIRE, CROCHE * 0.6, a[1], v - 6); ajoute(p, t0 + NOIRE + CROCHE, CROCHE * 0.6, a[2], v - 10); ajoute(p, t0 + 2 * NOIRE, CROCHE * 0.6, b, v - 4); }
      if (s === 'cloche') if (k % 2 === 0) [a[0], a[2], a[1] + 12].forEach((n, i) => ajoute(p, t0 + i * NOIRE * 1.5, NOIRE * 3, n + 12, v - i * 6));
    }
  }
  // La basse
  if (m.basse) {
    const p = piste(3, m.basse), v = m.basse.vel || 70;
    for (let k = 0; k < NB; k++) {
      const a = accord(m, k), t0 = k * MESURE, b = a[0] - 24 + 12 * (m.basse.octave || 0);
      if (m.basse.style === 'tenue') ajoute(p, t0, MESURE * 0.98, b, v);
      else { ajoute(p, t0, NOIRE * 0.8, b, v); ajoute(p, t0 + 2 * NOIRE, NOIRE * 0.8, b + 7, v - 12); }
    }
  }
  // La nappe tenue
  if (m.nappe) {
    const p = piste(4, m.nappe), v = m.nappe.vel || 40;
    for (let k = 0; k < NB; k++) accord(m, k).slice(0, 3).forEach(n => ajoute(p, k * MESURE, MESURE, n, v));
  }
  // Les étincelles (glockenspiel, triangle…) en fin de phrase
  if (m.etincelles) {
    const p = piste(5, m.etincelles);
    [3, 7, 11, 15].forEach((k, i) => ajoute(p, k * MESURE + NOIRE, NOIRE * 2, hauteur(m, [7, 9, 4, 7][i]) + 36, m.etincelles.vel || 44));
  }
  // Les timbales (le diplôme), au début des grandes phrases
  if (m.timbales) {
    const p = piste(6, m.timbales);
    [0, 4, 8, 12, 14].forEach(k => { const b = accord(m, k)[0] - 24; [0, 1, 2].forEach(i => ajoute(p, k * MESURE + i * CROCHE / 2, CROCHE, b, 70 - i * 10)); });
  }
  return pistes;
}

// ---------- Écriture MIDI (deux tours du morceau, pour une boucle sans coupure) ----------
const vlq = n => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
function trk(ev) {
  ev.sort((a, b) => a.t - b.t || a.o - b.o);
  const out = []; let d = 0;
  for (const e of ev) { out.push(...vlq(e.t - d), ...e.data); d = e.t; }
  out.push(0, 0xff, 0x2f, 0);
  const L = out.length;
  return [0x4d, 0x54, 0x72, 0x6b, (L >>> 24) & 255, (L >>> 16) & 255, (L >>> 8) & 255, L & 255, ...out];
}
function midi(m, pistes, tours) {
  const us = Math.round(60e6 / m.tempo), boucle = NB * MESURE;
  const cond = [{ t: 0, o: 0, data: [0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255] }, { t: 0, o: 0, data: [0xff, 0x58, 4, 3, 2, 24, 8] }];
  const tr = [cond];
  for (const p of pistes) {
    const c = p.canal, ev = [[0xc0 | c, p.prog], [0xb0 | c, 7, p.vol], [0xb0 | c, 10, p.pan], [0xb0 | c, 91, p.rev], [0xb0 | c, 93, 18]].map(data => ({ t: 0, o: 0, data }));
    for (let r = 0; r < tours; r++) for (const n of p.notes) {
      const t = r * boucle + Math.round(n.t);
      ev.push({ t, o: 2, data: [0x90 | c, n.n, n.v] }, { t: t + Math.round(n.d), o: 1, data: [0x80 | c, n.n, 0] });
    }
    tr.push(ev);
  }
  const tete = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, tr.length, (PPQ >> 8) & 255, PPQ & 255];
  return Buffer.from([...tete, ...tr.flatMap(trk)]);
}

// ---------- Les quinze ambiances ----------
// Instruments (General MIDI) : 0 piano, 8 célesta, 9 glockenspiel, 10 boîte à musique, 11 vibraphone, 13 xylophone,
// 21 accordéon, 45 pizzicato, 46 harpe, 47 timbales, 48 cordes, 49 cordes lentes, 60 cor, 68 hautbois,
// 70 basson, 71 clarinette, 73 flûte, 89 nappe chaude

const T = (nom, oct = 0) => ({ C: 48, D: 50, Eb: 51, E: 52, F: 53, G: 55, A: 57, Bb: 58 }[nom] + 12 * oct);
const MORCEAUX = {
  accueil: { tonique: T('F'), mode: 'maj', tempo: 84, melodie: { prog: 10, vel: 82, rev: 80 }, accomp: { prog: 46, style: 'arpege', vel: 50, pan: 44 }, nappe: { prog: 49, vol: 56, rev: 100 }, etincelles: { prog: 9, vol: 60 } },
  chateau: { tonique: T('F'), mode: 'maj', tempo: 92, melodie: { prog: 8, vel: 80 }, contre: { prog: 73, vel: 54, pan: 88 }, accomp: { prog: 46, style: 'arpege', vel: 54, pan: 40 }, basse: { prog: 45, vol: 80, pan: 74 }, nappe: { prog: 49, vol: 58 }, etincelles: { prog: 9, vol: 55 } },
  foret: { tonique: T('D'), mode: 'min', tempo: 72, melodie: { prog: 71, vel: 74, octave: -1, rev: 90 }, contre: { prog: 73, vel: 46, octave: -1 }, accomp: { prog: 46, style: 'cloche', vel: 48 }, basse: { prog: 45, vol: 76 }, nappe: { prog: 49, vol: 62, rev: 110 } },
  place: { tonique: T('G'), mode: 'maj', tempo: 132, melodie: { prog: 21, vel: 78, rev: 50 }, accomp: { prog: 45, style: 'valse', vel: 60, pan: 50 }, etincelles: { prog: 9, vol: 50 } },
  montgolfiere: { tonique: T('Eb'), mode: 'maj', tempo: 96, melodie: { prog: 73, vel: 80, rev: 90 }, contre: { prog: 60, vel: 60, octave: -1, pan: 40 }, accomp: { prog: 46, style: 'flot', vel: 50 }, basse: { prog: 48, vol: 70, style: 'tenue' }, nappe: { prog: 48, vol: 60 } },
  etoiles: { tonique: T('G'), mode: 'maj', tempo: 66, melodie: { prog: 8, vel: 70, clairseme: true, rev: 110 }, accomp: { prog: 11, style: 'cloche', vel: 46 }, nappe: { prog: 89, vol: 60, rev: 120 }, etincelles: { prog: 9, vol: 64 } },
  meuse: { tonique: T('D'), mode: 'maj', tempo: 88, melodie: { prog: 73, vel: 74, rev: 90 }, accomp: { prog: 46, style: 'flot', vel: 54 }, basse: { prog: 48, vol: 58, style: 'tenue' }, nappe: { prog: 49, vol: 54 } },
  lievre: { tonique: T('A'), mode: 'maj', tempo: 138, melodie: { prog: 13, vel: 80, staccato: true, rev: 50 }, accomp: { prog: 45, style: 'rebond', vel: 62 }, basse: { prog: 70, vol: 72 }, etincelles: { prog: 9, vol: 50 } },
  aiglemont: { tonique: T('C'), mode: 'maj', tempo: 86, melodie: { prog: 68, vel: 76 }, contre: { prog: 71, vel: 50, octave: -1 }, accomp: { prog: 46, style: 'arpege', vel: 50 }, basse: { prog: 45, vol: 72 }, nappe: { prog: 49, vol: 54 } },
  pantoufle: { tonique: T('E'), mode: 'min', tempo: 80, melodie: { prog: 70, vel: 72, staccato: true, octave: -1, rev: 60 }, accomp: { prog: 45, style: 'pointes', vel: 58 }, nappe: { prog: 49, vol: 40 } },
  jeu: { tonique: T('E'), mode: 'min', tempo: 112, melodie: { prog: 70, vel: 74, staccato: true, octave: -1, rev: 50 }, accomp: { prog: 45, style: 'pointes', vel: 64 }, basse: { prog: 45, vol: 70 } },
  camera: { tonique: T('A'), mode: 'min', tempo: 70, melodie: { prog: 11, vel: 64, clairseme: true, rev: 100 }, accomp: { prog: 45, style: 'pointes', vel: 46 }, nappe: { prog: 89, vol: 58, rev: 110 } },
  lettre: { tonique: T('F'), mode: 'maj', tempo: 72, melodie: { prog: 0, vel: 70, rev: 90 }, contre: { prog: 48, vel: 46 }, accomp: { prog: 0, style: 'arpege', vel: 40 }, nappe: { prog: 49, vol: 54 } },
  theatre: { tonique: T('C'), mode: 'maj', tempo: 126, melodie: { prog: 13, vel: 80, staccato: true, rev: 60 }, accomp: { prog: 21, style: 'valse', vel: 54 }, basse: { prog: 70, vol: 70 }, etincelles: { prog: 9, vol: 54 } },
  diplome: { tonique: T('Bb'), mode: 'maj', tempo: 100, melodie: { prog: 48, vel: 84 }, contre: { prog: 60, vel: 64, octave: -1 }, accomp: { prog: 46, style: 'arpege', vel: 56 }, basse: { prog: 48, vol: 80, style: 'tenue' }, etincelles: { prog: 9, vol: 64 }, timbales: { prog: 47, vol: 90 } },
};

// ---------- Rendu ----------
const seuls = process.argv.slice(2);
const infos = {};
for (const [nom, m] of Object.entries(MORCEAUX)) {
  if (seuls.length && seuls.indexOf(nom) < 0) continue;
  const p = partition(m), L = NB * MESURE / PPQ * 60 / m.tempo;
  const mid = path.join(SORTIE, nom + '.mid'), wav = path.join(SORTIE, nom + '-2tours.wav'), mp3 = path.join(SORTIE, nom + '.mp3');
  fs.writeFileSync(mid, midi(m, p, 2));
  execFileSync(FS, ['-ni', '-q', '-r', '44100', '-g', '0.55', '-R', '1', '-C', '1', '-o', 'synth.reverb.room-size=0.8', '-o', 'synth.reverb.damp=0.3', '-o', 'synth.reverb.width=0.9', '-o', 'synth.reverb.level=0.7', '-F', wav, SF2, mid], { stdio: 'pipe' });
  // Le second tour seulement : il commence déjà avec la résonance du premier, la boucle ne s'entend pas
  execFileSync(FF, ['-y', '-loglevel', 'error', '-ss', L.toFixed(4), '-t', L.toFixed(4), '-i', wav, '-af', 'loudnorm=I=-20:TP=-2:LRA=11', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', mp3]);
  infos[nom] = +L.toFixed(4);
  console.log(nom.padEnd(14), L.toFixed(1) + ' s', Math.round(fs.statSync(mp3).size / 1024) + ' Ko');
}
fs.writeFileSync(path.join(SORTIE, 'durees.json'), JSON.stringify(infos, null, 2));
