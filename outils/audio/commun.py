"""Boîte à outils de la bande-son de « La nuit de la Petite Souris ».

Composition en MIDI (mido), rendu par FluidSynth avec la banque FluidR3_GM (licence MIT), synthèse des ambiances
naturelles et des bruitages (numpy / scipy), boucles sans couture, niveaux, encodage MP3.

Règles anti-clic, appliquées partout :
  - chaque son a un fondu d'entrée et de sortie (cosinus), même de quelques millisecondes ;
  - les filtres agissent en une seule passe sur tout le signal (sosfiltfilt), jamais par petits blocs ;
  - aucune saturation : pas de tanh ni d'écrêtage ; un seul gain, calculé après mesure ;
  - un filtre final (passe-haut 25 Hz, passe-bas 12 kHz) : au-delà de 15 kHz, il ne doit presque rien rester ;
  - pas de chorus : sa modulation continue empêcherait la fin d'une boucle de retomber exactement sur son début.
"""
import json, os, subprocess
import numpy as np
import mido
import pyloudnorm as pyln
from scipy.io import wavfile
from scipy.signal import butter, sosfiltfilt, resample_poly

# ---------------- Chemins (à adapter sur une autre machine) ----------------
OUTILS = os.environ.get('OUTILS_AUDIO', r'C:\Users\Utilisateur\outils-audio')
FLUIDSYNTH = os.path.join(OUTILS, 'fluidsynth', 'fluidsynth-v2.6.2-win10-x64-cpp11', 'bin', 'fluidsynth.exe')
SF2 = os.path.join(OUTILS, 'FluidR3_GM.sf2')
FFMPEG = os.environ.get('FFMPEG', r'C:\Users\Utilisateur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe')
ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, 'sortie')
SR = 44100
TPB = 480

# Cibles de niveau (LUFS intégrés) et crête maximale (dBTP)
CIBLE_MUSIQUE, CIBLE_BRUITAGE, CRETE_MAX = -23.0, -18.0, -2.0

NN = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def N(s):
    """« D4 », « Bb3 », « F#5 » → numéro MIDI (les nombres passent tels quels)."""
    if not isinstance(s, str):
        return int(s)
    n, i = NN[s[0]], 1
    if s[i] == 'b': n -= 1; i += 1
    elif s[i] == '#': n += 1; i += 1
    return 12 * (int(s[i:]) + 1) + n


# ---------------- Partition MIDI ----------------
class Partition:
    """Une partition multipiste ; les temps sont en noires (temps), les vélocités de 1 à 127."""

    def __init__(self, tempo, mesure=(4, 4)):
        self.tempo, self.mesure, self.pistes = tempo, mesure, {}

    def piste(self, nom, canal, prog, vol=100, pan=64, rev=80, cho=0, bend=2):
        ev = [(0, 0, mido.Message('program_change', channel=canal, program=prog))]
        for cc, v in ((7, vol), (10, pan), (91, rev), (93, cho), (11, 127), (101, 0), (100, 0), (6, bend)):
            ev.append((0, 0, mido.Message('control_change', channel=canal, control=cc, value=v)))
        self.pistes[nom] = (canal, ev)

    def note(self, nom, t, p, d, v):
        c, ev = self.pistes[nom]
        p = N(p)
        v = int(max(1, min(127, v)))
        ev.append((int(round(t * TPB)), 2, mido.Message('note_on', channel=c, note=p, velocity=v)))
        ev.append((int(round((t + d) * TPB)), 1, mido.Message('note_off', channel=c, note=p, velocity=0)))

    def glisse(self, nom, t, d, de=-1.0, pas=10):
        """Glissé d'entrée : la note part sous sa hauteur (de demi-tons) et la rejoint en douceur."""
        c, ev = self.pistes[nom]
        for k in range(pas + 1):
            x = k / pas
            v = int(8192 * de / 2 * (1 - (3 * x * x - 2 * x * x * x)))
            ev.append((int(round((t + d * x) * TPB)), 0, mido.Message('pitchwheel', channel=c, pitch=max(-8192, min(8191, v)))))

    def expression(self, nom, t, d, de, a, pas=12):
        """Le son enfle ou diminue (CC11), en courbe douce."""
        c, ev = self.pistes[nom]
        for k in range(pas + 1):
            x = k / pas
            x = 0.5 - 0.5 * np.cos(np.pi * x)
            ev.append((int(round((t + d * k / pas) * TPB)), 0, mido.Message('control_change', channel=c, control=11, value=int(de + (a - de) * x))))

    def enregistre(self, chemin):
        mid = mido.MidiFile(ticks_per_beat=TPB)
        t0 = mido.MidiTrack(); mid.tracks.append(t0)
        t0.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(self.tempo)))
        t0.append(mido.MetaMessage('time_signature', numerator=self.mesure[0], denominator=self.mesure[1]))
        for nom, (c, ev) in self.pistes.items():
            tr = mido.MidiTrack(); mid.tracks.append(tr)
            ev = sorted(ev, key=lambda e: (e[0], e[1]))
            cur = 0
            for tick, _, m in ev:
                tr.append(m.copy(time=max(0, tick - cur))); cur = max(cur, tick)
        mid.save(chemin)

    def secondes(self, temps):
        return temps * 60.0 / self.tempo


def rendre(partition, nom, gain=0.35, salle=0.82, niveau=0.7):
    """MIDI → WAV flottant (32 bits, pas d'écrêtage possible) par FluidSynth ; renvoie un tableau stéréo."""
    os.makedirs(os.path.join(SORTIE, 'tmp'), exist_ok=True)
    mid, wav = os.path.join(SORTIE, 'tmp', nom + '.mid'), os.path.join(SORTIE, 'tmp', nom + '.wav')
    partition.enregistre(mid)
    subprocess.run([FLUIDSYNTH, '-ni', '-q', '-r', str(SR), '-g', str(gain), '-R', '1', '-C', '0',
                    '-o', 'audio.file.format=float', '-o', f'synth.reverb.room-size={salle}', '-o', 'synth.reverb.damp=0.35',
                    '-o', 'synth.reverb.width=1', '-o', f'synth.reverb.level={niveau}', '-F', wav, SF2, mid], check=True, capture_output=True)
    _, x = wavfile.read(wav)
    x = x.astype(np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    return x


# ---------------- Filtres (une seule passe, sur tout le signal) ----------------
def _sos(kind, f, ordre):
    return butter(ordre, f, kind, fs=SR, output='sos')


def passe_bas(x, f, ordre=4): return sosfiltfilt(_sos('lowpass', f, ordre), x, axis=0)
def passe_haut(x, f, ordre=4): return sosfiltfilt(_sos('highpass', f, ordre), x, axis=0)
def passe_bande(x, a, b, ordre=2): return sosfiltfilt(_sos('bandpass', [a, b], ordre), x, axis=0)


def finition(x, coupure=12000):
    """Le filtre final : retire le continu, et assez raide pour qu'il ne reste presque rien au-delà de 15 kHz
    (ordre 6, appliqué deux fois par sosfiltfilt : environ −24 dB à 15 kHz)."""
    return passe_bas(passe_haut(x, 25, 2), coupure, 6)


# ---------------- Enveloppes et fondus ----------------
def cosinus(n):
    return 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, max(n, 1)))


def fondus(x, entree_ms=5, sortie_ms=40):
    x = x.copy()
    a, b = int(SR * entree_ms / 1000), int(SR * sortie_ms / 1000)
    if a: x[:a] *= cosinus(a)[:, None] if x.ndim > 1 else cosinus(a)
    if b: x[-b:] *= (cosinus(b)[::-1])[:, None] if x.ndim > 1 else cosinus(b)[::-1]
    return x


def enveloppe(n, attaque, declin, forme=3.0):
    """Attaque en cosinus puis déclin exponentiel, qui finit exactement à zéro."""
    a = max(1, int(attaque * SR)); env = np.ones(n)
    env[:a] = cosinus(a)
    reste = n - a
    if reste > 0:
        t = np.arange(reste) / SR
        d = np.exp(-t / max(declin, 1e-4))
        d *= cosinus(reste)[::-1] ** (1 / forme)   # retombe à zéro sans cassure
        env[a:] = d
    return env


def bruit(n, rng):
    return rng.standard_normal(n)


# ---------------- Boucles ----------------
def boucle_ambiance(x, longueur, fondu=2.0):
    """Rend périodique une couche synthétisée : la fin se fond dans le début (puissance constante)."""
    L, F = int(longueur * SR), int(fondu * SR)
    assert len(x) >= L + F
    y = x[:L].copy()
    w = np.sin(np.linspace(0, np.pi / 2, F))
    w = w[:, None] if y.ndim > 1 else w
    y[:F] = x[:F] * w + x[L:L + F] * np.sqrt(np.maximum(0, 1 - w ** 2))
    return y


def carreler(y, debut, n):
    """Lit une boucle (période len(y)) à partir de l'échantillon « debut », sur n échantillons."""
    idx = (np.arange(n) + debut) % len(y)
    return y[idx]


# ---------------- Niveaux ----------------
def lufs(x):
    m = pyln.Meter(SR)
    y = x if x.ndim > 1 else x[:, None]
    if len(y) < int(0.5 * SR):                       # un son court : on complète de silence (ignoré par la mesure)
        y = np.concatenate([y, np.zeros((int(0.5 * SR) - len(y) + 1, y.shape[1]))])
    return m.integrated_loudness(y)


def crete_vraie(x):
    y = x if x.ndim > 1 else x[:, None]
    sur = resample_poly(y, 4, 1, axis=0)
    return 20 * np.log10(max(np.max(np.abs(sur)), 1e-12))


def niveau(x, cible, mesure=None):
    """Un seul gain : on vise la cible en LUFS, sans dépasser la crête maximale (jamais de limiteur)."""
    l = lufs(x if mesure is None else mesure)
    g = 10 ** ((cible - l) / 20)
    pic = crete_vraie(x * g)
    if pic > CRETE_MAX:
        g *= 10 ** ((CRETE_MAX - pic) / 20)
    return x * g


# ---------------- Écriture ----------------
def ecrire(nom, x, dossier, debit='80k', mono=False):
    """WAV maître (flottant) + MP3 ; renvoie le chemin du MP3."""
    os.makedirs(dossier, exist_ok=True)
    wav, mp3 = os.path.join(dossier, nom + '.wav'), os.path.join(dossier, nom + '.mp3')
    y = x.mean(1) if (mono and x.ndim > 1) else x
    wavfile.write(wav, SR, y.astype(np.float32))
    subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-i', wav, '-ac', '1' if mono else '2', '-c:a', 'libmp3lame', '-b:a', debit, mp3], check=True)
    return mp3


def musique(nom, partition, cycle_temps, intro_temps, couches=None, dossier=None, gain=0.35):
    """Assemble une ambiance qui boucle sans couture.

    La partition contient : une intro (intro_temps), puis TROIS fois le même cycle (cycle_temps). On garde le
    deuxième tour, avec une demi-seconde de marge de chaque côté : la boucle (début → fin) reprend exactement là
    où le troisième tour commence, résonance comprise. couches : fonctions (longueur_s, rng) → signal stéréo bouclé.
    """
    dossier = dossier or os.path.join(SORTIE, 'musique')
    x = rendre(partition, nom, gain=gain)
    Lt = partition.secondes(cycle_temps)
    debut = partition.secondes(intro_temps) + Lt          # début du 2e tour
    marge = 0.5
    # FluidSynth cale chaque note sur une petite grille de temps : le 3e tour n'est donc pas l'exact jumeau du 2e.
    # On garde le 2e tour, et on y fond en douceur (une seconde) le tout début du 3e : la boucle devient
    # parfaitement périodique. À la jonction, la fin du 2e tour enchaîne exactement sur le début du 3e.
    Ls, X = int(round(Lt * SR)), int(1.0 * SR)
    a2 = int(round(debut * SR)); a3 = a2 + Ls
    besoin = a3 + X
    if len(x) < besoin: x = np.concatenate([x, np.zeros((besoin - len(x), 2))])
    y = x[a2:a3].copy()
    w = np.sin(np.linspace(0, np.pi / 2, X))[:, None]     # fondu à puissance constante
    y[:X] = x[a3:a3 + X] * np.cos(np.linspace(0, np.pi / 2, X))[:, None] + y[:X] * w
    rng = np.random.default_rng(7)
    ref = np.sqrt(np.mean(y ** 2)) + 1e-9
    for c, db in couches or []:
        amb = c(Lt, rng)[:Ls]                             # couche déjà périodique, de période Lt
        # Niveau relatif à la musique, mesuré sur les seuls passages actifs (une hulotte qui chante deux fois
        # ne doit pas être gonflée par le silence qui l'entoure)
        actif = np.max(np.abs(amb), axis=1) > 0.02 * np.max(np.abs(amb))
        rms = np.sqrt(np.mean(amb[actif] ** 2)) if actif.any() else 1.0
        amb = amb / (rms + 1e-12) * ref * 10 ** (db / 20)
        y = y + amb
    # Le filtre final, appliqué « en rond » (la boucle prolongée de ses deux bouts) : la périodicité est préservée
    pad = int(0.5 * SR)
    y = finition(np.concatenate([y[-pad:], y, y[:pad]]))[pad:pad + Ls]
    y = niveau(y, CIBLE_MUSIQUE)
    m = int(marge * SR)
    seg = np.concatenate([y[-m:], y, y[:m]])              # une marge de chaque côté, prise dans la boucle elle-même
    seg = fondus(seg, 20, 20)                             # les marges seules sont touchées : la boucle reste intacte
    mp3 = ecrire(nom, seg, dossier)
    info = {'fichier': os.path.basename(mp3), 'debutBoucle': marge, 'finBoucle': round(marge + Ls / SR, 5), 'duree': round(len(seg) / SR, 5)}
    with open(os.path.join(dossier, nom + '.json'), 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False, indent=2)
    return info
