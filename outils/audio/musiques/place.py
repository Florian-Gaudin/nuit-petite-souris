"""La place Ducale : une petite fête médiévale. Air de danse original en sol mixolydien, 6/8 (noire pointée à 72) :
dulcimer, flûte à bec, guitare-luth qui gratte, tambour et tambourin."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique, N

C8 = 0.5   # une croche (en temps de noire)
# L'air : (note, durée en croches), 8 mesures de 6 croches
A = [('G4', 2), ('B4', 1), ('D5', 2), ('B4', 1), ('C5', 2), ('A4', 1), ('F4', 2), ('A4', 1),
     ('G4', 2), ('B4', 1), ('D5', 1), ('E5', 1), ('F5', 1), ('E5', 2), ('D5', 1), ('D5', 3),
     ('G4', 2), ('B4', 1), ('D5', 2), ('B4', 1), ('C5', 2), ('A4', 1), ('F4', 2), ('A4', 1),
     ('B4', 1), ('C5', 1), ('D5', 1), ('C5', 1), ('B4', 1), ('A4', 1), ('G4', 3), ('D4', 3)]
B = [('D5', 2), ('E5', 1), ('F5', 2), ('E5', 1), ('D5', 2), ('C5', 1), ('A4', 3),
     ('C5', 2), ('D5', 1), ('E5', 2), ('D5', 1), ('C5', 2), ('B4', 1), ('G4', 3),
     ('D5', 2), ('E5', 1), ('F5', 2), ('G5', 1), ('A5', 3), ('G5', 2), ('F5', 1),
     ('E5', 1), ('D5', 1), ('C5', 1), ('B4', 1), ('A4', 1), ('F4', 1), ('G4', 6)]
GA = ['G', 'F', 'G', 'Dm', 'G', 'F', 'C', 'G']
GB = ['Dm', 'Dm', 'C', 'G', 'Dm', 'F', 'C', 'G']
ACC = {'G': ('G2', 'D3', 'G3', 'B3'), 'F': ('F2', 'C3', 'F3', 'A3'), 'Dm': ('D3', 'A3', 'D4', 'F4'), 'C': ('C3', 'G3', 'C4', 'E4')}
SECTIONS = [('intro', ['G', 'G']), ('A', GA), ('B', GB), ('A2', GA), ('B2', GB)]
MESURE = 3
CYCLE = sum(len(g) for _, g in SECTIONS) * MESURE


def air(p, piste, notes, debut, vel, octave=0, rng=None):
    t = debut
    for k, (n, d) in enumerate(notes):
        dur = d * C8
        v = vel + (rng.integers(-5, 6) if rng is not None else 0) + (6 if abs((t - debut) % 1.5) < 1e-6 else 0)   # appui sur les temps
        p.note(piste, t, N(n) + 12 * octave, dur * 0.9, v)
        t += dur


def compose(dossier=None):
    p = Partition(108, (6, 8))
    p.piste('dulcimer', 0, 15, 96, 50, 75)
    p.piste('flute', 1, 74, 90, 80, 80)
    p.piste('luth', 2, 24, 84, 40, 70)
    p.piste('basse', 3, 32, 70, 64, 50)     # basse acoustique, très discrète
    p.pistes['perc'] = (9, [(0, 0, __import__('mido').Message('control_change', channel=9, control=91, value=50))])
    for c in range(3):
        rng = np.random.default_rng(21)   # le même hasard à chaque tour : le 3e rejoue exactement le 2e
        t = c * CYCLE
        for nom, grille in SECTIONS:
            fort = nom in ('B', 'B2')
            for m, a in enumerate(grille):
                tm = t + m * MESURE; ac = ACC[a]
                # La guitare-luth gratte : accord plein sur 1 et 4, demi-accord sur 3 et 6 (petit décalage = coup de plectre)
                for croche, plein in ((0, True), (2, False), (3, True), (5, False)):
                    notes = ac if plein else ac[1:]
                    for k, n in enumerate(notes):
                        p.note('luth', tm + croche * C8 + k * 0.02, n, C8 * 1.6, (64 if plein else 50) + rng.integers(-4, 4))
                p.note('basse', tm, N(ac[0]) - 12, 1.2, 70); p.note('basse', tm + 1.5, N(ac[1]) - 12, 1.2, 60)
                # Tambour (sur 1 et 4) et tambourin (les autres croches)
                p.note('perc', tm, 41, 0.3, 74 if fort else 60); p.note('perc', tm + 1.5, 41, 0.3, 58 if fort else 46)
                for croche in (1, 2, 4, 5):
                    p.note('perc', tm + croche * C8, 54, 0.2, (46 if fort else 30) + rng.integers(-5, 5))
            if nom == 'A': air(p, 'dulcimer', A, t, 80, rng=rng)
            if nom == 'B': air(p, 'flute', B, t, 76, rng=rng)
            if nom == 'A2': air(p, 'dulcimer', A, t, 82, rng=rng); air(p, 'flute', A, t, 60, octave=1, rng=rng)
            if nom == 'B2': air(p, 'flute', B, t, 80, rng=rng); air(p, 'dulcimer', B, t, 66, octave=-1, rng=rng)
            t += len(grille) * MESURE
    return musique('place', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
