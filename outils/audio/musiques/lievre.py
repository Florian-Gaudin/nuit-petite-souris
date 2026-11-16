"""La route vers la ville, sur le dos du lièvre : vive et joyeuse, une gigue. Ré mixolydien, 6/8
(noire pointée à 92) ; violon et flûte à bec, guitare-luth, tambour sur cadre et tambourin."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np, mido
from commun import Partition, musique, N
from theme import ligne, ACC

A = [('D5', 1), ('F#5', 1), ('A5', 1), ('F#5', 1), ('E5', 1), ('D5', 1), ('E5', 1), ('F#5', 1), ('G5', 1), ('E5', 2), ('C5', 1),
     ('D5', 1), ('F#5', 1), ('A5', 1), ('B5', 1), ('A5', 1), ('F#5', 1), ('G5', 1), ('E5', 1), ('C5', 1), ('D5', 3),
     ('A5', 1), ('F#5', 1), ('D5', 1), ('A5', 1), ('F#5', 1), ('D5', 1), ('G5', 2), ('F#5', 1), ('E5', 2), ('D5', 1),
     ('C5', 1), ('D5', 1), ('E5', 1), ('F#5', 1), ('E5', 1), ('C5', 1), ('D5', 3), ('r', 3)]
B = [('A5', 2), ('B5', 1), ('A5', 2), ('F#5', 1), ('G5', 2), ('A5', 1), ('G5', 2), ('E5', 1),
     ('F#5', 2), ('G5', 1), ('F#5', 2), ('D5', 1), ('E5', 1), ('F#5', 1), ('E5', 1), ('C5', 3),
     ('A5', 2), ('B5', 1), ('A5', 2), ('F#5', 1), ('G5', 2), ('A5', 1), ('B5', 2), ('C6', 1),
     ('B5', 1), ('A5', 1), ('G5', 1), ('E5', 1), ('C5', 1), ('E5', 1), ('D5', 6)]
GA = ['D', 'C', 'D', 'C', 'D', 'G', 'C', 'D']
GB = ['D', 'C', 'D', 'C', 'D', 'C', 'G', 'D']
SECTIONS = [('intro', ['D', 'D', 'C', 'D']), ('A', GA), ('B', GB), ('A2', GA), ('B2', GB)]
M = 3
CYCLE = sum(len(g) for _, g in SECTIONS) * M
ACC_LUTH = {'D': ('D3', 'A3', 'D4', 'F#4'), 'C': ('C3', 'G3', 'C4', 'E4'), 'G': ('G2', 'D3', 'G3', 'B3')}


def compose(dossier=None):
    p = Partition(138, (6, 8))
    p.piste('violon', 0, 40, 96, 60, 70)
    p.piste('flute', 1, 74, 88, 80, 75)
    p.piste('luth', 2, 24, 82, 40, 65)
    p.piste('basse', 3, 32, 68, 64, 50)
    p.pistes['perc'] = (9, [(0, 0, mido.Message('control_change', channel=9, control=91, value=40))])
    for c in range(3):
        rng = np.random.default_rng(81)
        t = c * CYCLE
        for nom, g in SECTIONS:
            for m, a in enumerate(g):
                tm = t + m * M; ac = ACC_LUTH[a]
                for croche, plein in ((0, True), (2, False), (3, True), (5, False)):
                    for k, n in enumerate(ac if plein else ac[1:]):
                        p.note('luth', tm + croche * 0.5 + k * 0.015, n, 0.7, (60 if plein else 46) + int(rng.integers(-4, 4)))
                p.note('basse', tm, N(ac[0]) - 12, 1.2, 66); p.note('basse', tm + 1.5, N(ac[1]) - 12, 1.2, 56)
                p.note('perc', tm, 41, 0.3, 66); p.note('perc', tm + 1.5, 41, 0.3, 54)
                for croche in (1, 2, 4, 5):
                    p.note('perc', tm + croche * 0.5, 54, 0.2, (40 if nom.startswith('B') else 28) + int(rng.integers(-5, 5)))
            if nom == 'A': ligne(p, 'violon', A, t, vel=80, unite=0.5, staccato=0.85, rng=rng)
            if nom == 'B': ligne(p, 'flute', B, t, vel=78, unite=0.5, staccato=0.85, rng=rng)
            if nom == 'A2': ligne(p, 'violon', A, t, vel=80, unite=0.5, staccato=0.85, rng=rng); ligne(p, 'flute', A, t, vel=58, octave=0, unite=0.5, staccato=0.8, rng=rng)
            if nom == 'B2': ligne(p, 'violon', B, t, vel=84, unite=0.5, staccato=0.85, rng=rng); ligne(p, 'flute', B, t, vel=62, unite=0.5, staccato=0.8, rng=rng)
            t += len(g) * M
    return musique('lievre', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
