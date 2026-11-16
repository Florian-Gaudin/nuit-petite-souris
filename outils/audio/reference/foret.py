"""Ambiance « fantasy médiévale » : la forêt des Ardennes la nuit (thème original)."""
import mido, subprocess, numpy as np
from scipy.signal import butter, sosfiltfilt, fftconvolve
from scipy.io import wavfile

SF = '/usr/share/sounds/sf2/FluidR3_GM.sf2'; OUT = '/home/claude/son/out'; SR = 44100
TPB = 480; BPM = 72; B = 60 / BPM
rng = np.random.default_rng(5)
NN = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def N(s):
    n = NN[s[0]]; i = 1
    if s[i] == 'b': n -= 1; i += 1
    elif s[i] == '#': n += 1; i += 1
    return 12 * (int(s[i:]) + 1) + n

mid = mido.MidiFile(ticks_per_beat=TPB)
t0 = mido.MidiTrack(); mid.tracks.append(t0)
t0.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(BPM)))
pistes = {}
def piste(nom, canal, prog, vol, pan, rev=90, cho=20):
    ev = [(0, mido.Message('program_change', channel=canal, program=prog)),
          (0, mido.Message('control_change', channel=canal, control=7, value=vol)),
          (0, mido.Message('control_change', channel=canal, control=10, value=pan)),
          (0, mido.Message('control_change', channel=canal, control=91, value=rev)),
          (0, mido.Message('control_change', channel=canal, control=93, value=cho)),
          (0, mido.Message('control_change', channel=canal, control=101, value=0)),   # amplitude du pitch bend : 2 demi-tons
          (0, mido.Message('control_change', channel=canal, control=100, value=0)),
          (0, mido.Message('control_change', channel=canal, control=6, value=2))]
    pistes[nom] = (canal, ev)
def note(nom, t, p, d, v):
    c, ev = pistes[nom]; p = N(p) if isinstance(p, str) else p
    ev.append((int(t * TPB), mido.Message('note_on', channel=c, note=p, velocity=v)))
    ev.append((int((t + d) * TPB), mido.Message('note_off', channel=c, note=p, velocity=0)))
def glisse(nom, t, d, de=-1.0):
    """Glissé d'entrée : la note part un demi-ton (ou plus) en dessous et rejoint sa hauteur."""
    c, ev = pistes[nom]
    for k in range(8):
        v = int(8192 * de / 2 * (1 - k / 7)); ev.append((int((t + d * k / 7) * TPB), mido.Message('pitchwheel', channel=c, pitch=max(-8192, min(8191, v)))))
def expr(nom, t, d, de, a, pas=12):
    c, ev = pistes[nom]
    for k in range(pas + 1):
        ev.append((int((t + d * k / pas) * TPB), mido.Message('control_change', channel=c, control=11, value=int(de + (a - de) * k / pas))))

piste('bourdon', 0, 42, 92, 54, 100)      # Cello
piste('alto', 1, 41, 70, 74, 100)         # Viola
piste('violon', 2, 40, 108, 64, 85, 10)   # Violin (soliste)
piste('flute', 3, 72, 80, 84, 95)         # Piccolo/Recorder → 74 Recorder plus boisé
pistes['flute'][1][0] = (0, mido.Message('program_change', channel=3, program=74))
piste('dulcimer', 4, 15, 70, 40, 80)      # Dulcimer
piste('choeur', 5, 52, 70, 64, 110, 40)   # Choir Aahs
piste('taiko', 6, 116, 90, 64, 70)        # Taiko
piste('harpe', 7, 46, 60, 30, 90)
pistes['perc'] = (9, [(0, mido.Message('control_change', channel=9, control=91, value=60))])

INTRO = 8  # deux mesures d'ambiance (8 temps)
# Mélodie (ré dorien) : (note, début en temps dans la mesure, durée)
A = [[('A4', 0, 1), ('D5', 1, .5), ('E5', 1.5, .5), ('F5', 2, 1.5), ('E5', 3.5, .5)],
     [('D5', 0, .75), ('C5', .75, .25), ('A4', 1, 1), ('G4', 2, 1), ('A4', 3, 1)],
     [('D5', 0, 1), ('F5', 1, .5), ('G5', 1.5, .5), ('A5', 2, 1.5), ('G5', 3.5, .25), ('F5', 3.75, .25)],
     [('E5', 0, 1), ('D5', 1, .5), ('C5', 1.5, .5), ('D5', 2, 2)]]
Bm = [[('A5', 0, 1.5), ('C6', 1.5, .5), ('B5', 2, 1), ('A5', 3, 1)],
      [('G5', 0, .5), ('A5', .5, .5), ('F5', 1, 1), ('E5', 2, 1), ('D5', 3, 1)],
      [('F5', 0, 1), ('G5', 1, .5), ('A5', 1.5, .5), ('B5', 2, 1), ('A5', 3, 1)],
      [('G5', 0, .5), ('F5', .5, .5), ('E5', 1, 1), ('D5', 2, 2)]]
ACC_A = [['D3', 'A3', 'F4'], ['C3', 'G3', 'E4'], ['D3', 'A3', 'F4'], ['A2', 'E3', 'C4']]
ACC_B = [['F3', 'C4', 'A4'], ['C3', 'G3', 'E4'], ['G2', 'D3', 'B3'], ['D3', 'A3', 'F4']]

def phrase(inst, mel, debut, vel=84, orn=True, oct=0):
    for m, mes in enumerate(mel):
        for (p, s, d) in mes:
            t = debut + m * 4 + s; pp = N(p) + 12 * oct
            if orn and d >= 1.5:                                   # petite note d'ornement au-dessus
                note(inst, t - 0.12, pp + 2, 0.12, vel - 20)
            if orn and d >= 1 and rng.random() < 0.5: glisse(inst, t, 0.18)
            note(inst, t, pp, d * 0.98, vel + int(rng.integers(-6, 6)))
            if d >= 1.5: expr(inst, t, d, 85, 120)                 # le son enfle sur les notes longues

def harmonie(acc, debut, mesures, dulci=True, harpe=False, alto=True):
    for m in range(mesures):
        a = acc[m % 4]; t = debut + m * 4
        if alto: note('alto', t, a[1], 4, 58); note('alto', t, a[2], 4, 52)
        if dulci:
            for k, p in enumerate([a[0], a[1], a[2], a[1], N(a[0]) + 12, a[2], a[1], a[2]]):
                note('dulcimer', t + k * 0.5, p, 0.9, 62 if k % 2 == 0 else 50)
        if harpe:
            for k, p in enumerate([a[0], a[1], a[2], N(a[1]) + 12]): note('harpe', t + k * 0.25, p, 2, 55)

def tambours(debut, mesures, fort=False):
    for m in range(mesures):
        t = debut + m * 4
        note('taiko', t, 'D2', 2, 100 if fort else 80)
        if fort: note('taiko', t + 2.5, 'D2', 1.5, 70)
        for s, (p, v) in enumerate([(41, 70), (None, 0), (45, 45), (41, 55), (None, 0), (45, 45), (43, 60), (45, 40)]):
            if p: note('perc', t + s * 0.5, p, 0.4, v if fort else int(v * 0.7))

# Bourdon de ré (tenu du début à la fin)
fin = INTRO + 16 * 4
note('bourdon', 0, 'D2', fin + 4, 70); note('bourdon', 2, 'A2', fin + 2, 55)
expr('bourdon', 0, 6, 20, 110); expr('bourdon', fin, 4, 110, 10)
note('choeur', 4, 'D4', 12, 50); note('choeur', 4, 'A4', 12, 45); expr('choeur', 4, 6, 30, 100)
# A : violon seul sur le bourdon
phrase('violon', A, INTRO); harmonie(ACC_A, INTRO, 4, dulci=False)
tambours(INTRO + 8, 2)
# A bis : le dulcimer entre, la flûte répond
phrase('violon', A, INTRO + 16, 88); harmonie(ACC_A, INTRO + 16, 4); tambours(INTRO + 16, 4)
for m, mes in enumerate(A):                                         # réponse de la flûte, une tierce au-dessus, en écho
    if m % 2 == 1:
        for (p, s, d) in mes[-2:]: note('flute', INTRO + 16 + m * 4 + s + 0.5, N(p) + 15, d * 0.8, 70)
# B : l'élan, tambours forts, chœur
phrase('violon', Bm, INTRO + 32, 96); harmonie(ACC_B, INTRO + 32, 4, harpe=True); tambours(INTRO + 32, 4, fort=True)
for m in range(4):
    a = ACC_B[m]; note('choeur', INTRO + 32 + m * 4, N(a[1]) + 12, 4, 72); note('choeur', INTRO + 32 + m * 4, N(a[2]) + 12, 4, 66)
phrase('flute', Bm, INTRO + 32, 62, orn=False, oct=-1)
# A final : violon et flûte à l'octave, puis tout s'éteint
phrase('violon', A, INTRO + 48, 90); phrase('flute', A, INTRO + 48, 60, orn=False, oct=1)
harmonie(ACC_A, INTRO + 48, 4, harpe=True); tambours(INTRO + 48, 3)
note('harpe', fin, 'D3', 6, 60); note('harpe', fin + .2, 'A3', 6, 55); note('harpe', fin + .4, 'D4', 6, 55); note('harpe', fin + .6, 'F4', 6, 50)
note('choeur', fin, 'D4', 6, 60); note('choeur', fin, 'A4', 6, 55); expr('choeur', fin, 6, 100, 0)

for nom, (c, ev) in pistes.items():
    tr = mido.MidiTrack(); mid.tracks.append(tr)
    ev.sort(key=lambda e: (e[0], 0 if e[1].type in ('program_change', 'control_change', 'pitchwheel') else (1 if e[1].type == 'note_off' else 2)))
    cur = 0
    for a, m in ev: tr.append(m.copy(time=max(0, a - cur))); cur = max(cur, a)
f = f'{OUT}/foret_musique'; mid.save(f + '.mid')
subprocess.run(['fluidsynth', '-ni', '-g', '0.45', '-r', str(SR), '-o', 'synth.reverb.room-size=0.85', '-o', 'synth.reverb.level=0.75', '-o', 'synth.reverb.width=1',
                '-F', f + '.wav', SF, f + '.mid'], check=True, capture_output=True)
sr, mus = wavfile.read(f + '.wav'); mus = mus.astype(float) / 32767
if mus.ndim == 1: mus = np.stack([mus, mus], 1)

# ---------------- la forêt la nuit (synthèse propre) ----------------
n = len(mus) + int(2 * SR); t = np.arange(n) / SR
def lpf(x, f, o=4): return sosfiltfilt(butter(o, f, 'lowpass', fs=SR, output='sos'), x, axis=0)
def bpf(x, a, b, o=2): return sosfiltfilt(butter(o, [a, b], 'bandpass', fs=SR, output='sos'), x, axis=0)
# vent : deux couleurs de bruit dont on fait varier le mélange très lentement
z = rng.standard_normal((n, 2))
sourd, souffle = lpf(z, 350), bpf(z, 400, 1600)
mod = (0.5 + 0.5 * np.sin(2 * np.pi * t / 9.0 + 1))[:, None]
vent = (sourd * (0.8 - 0.3 * mod) + souffle * 0.25 * mod) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 13)[:, None])
# grillons : trilles très douces, à gauche et à droite
gr = np.zeros((n, 2))
for cote, (f0, per, dec) in enumerate([(4300, 1.7, 0.0), (4650, 2.3, 0.6)]):
    for d0 in np.arange(dec, t[-1] - 1, per):
        m_ = int(0.32 * SR); tt = np.arange(m_) / SR
        trille = np.sin(2 * np.pi * f0 * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 28 * tt))) * np.sin(np.pi * tt / tt[-1]) ** 2
        i = int(d0 * SR); gr[i:i + m_, cote] += lpf(trille, 6000)[: n - i] * 0.6
# hulotte lointaine (reprise de la démo), deux fois
sr2, hul = wavfile.read(f'{OUT}/sfx_hulotte.wav'); hul = lpf(hul.astype(float) / 32767, 2200) * 0.35
for d0, pan in ((3.0, 0.3), (len(mus) / SR - 7, 0.75)):
    i = int(d0 * SR); m_ = min(len(hul), n - i)
    gr[i:i + m_, 0] += hul[:m_] * (1 - pan); gr[i:i + m_, 1] += hul[:m_] * pan
amb = vent / np.max(np.abs(vent)) * 0.22 + gr / np.max(np.abs(gr)) * 0.06
amb[: int(3 * SR)] *= np.linspace(0, 1, int(3 * SR))[:, None]
mix = amb.copy(); mix[: len(mus)] += mus / np.max(np.abs(mus)) * 0.85
mix /= np.max(np.abs(mix)) / 0.89
nz = np.where(np.abs(mix).max(1) > 2e-4)[0]; mix = mix[: nz[-1] + 1]
wavfile.write(f'{OUT}/11_foret_fantasy.wav', SR, (mix * 32767).astype(np.int16))
d = len(mix) / SR
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{OUT}/11_foret_fantasy.wav', '-af', f'loudnorm=I=-18:TP=-1.5,afade=t=out:st={d - 3}:d=3',
                '-c:a', 'libmp3lame', '-b:a', '256k', f'{OUT}/11_foret_fantasy.mp3'], check=True)
print('ok', round(d, 1), 's')
