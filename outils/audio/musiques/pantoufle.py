"""Pantoufle, le chat : tension légère et comique, sur la pointe des pieds. Mi phrygien, 4/4, 84.
Pizzicati, basson staccato, violoncelle en bourdon grave ; à la fin, la flûte à bec glisse le début du thème de
Quenotte, en mi phrygien et en pointillés, comme une souris qui passe sans bruit."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique, N

C8 = 0.5
# Le motif des pizzicati : une croche par case, « r » = silence (4 mesures)
MOTIF = [['E3', 'r', 'G3', 'r', 'F3', 'r', 'E3', 'r'], ['B2', 'r', 'E3', 'r', 'F3', 'G3', 'A3', 'r'],
         ['G3', 'r', 'B3', 'r', 'A3', 'r', 'G3', 'r'], ['F3', 'r', 'E3', 'r', 'D3', 'r', 'E3', 'E4']]
BASSON = [['B3', 'r', 'C4', 'r', 'B3', 'r', 'A3', 'r'], ['G3', 'r', 'A3', 'B3', 'C4', 'r', 'r', 'r'],
          ['B3', 'r', 'A3', 'r', 'G3', 'r', 'F3', 'r'], ['E3', 'r', 'r', 'r', 'r', 'r', 'r', 'E4']]
# Le début du thème de Quenotte, transposé en mi phrygien, piqué (en temps)
THEME_E = [('B4', .5), ('E5', .75), ('F5', .25), ('G5', .5), ('F5', .5), ('E5', .5), ('r', .5), ('D5', .5), ('E5', .5), ('F5', .5), ('B4', 1), ('r', 2.5)]
MESURE = 4
SECTIONS = ['intro', 'A', 'A2', 'B', 'A3']
CYCLE = (2 + 4 * 4) * MESURE


def croches(p, piste, mesures, debut, vel, octave=0, duree=0.3, rng=None):
    for m, mes in enumerate(mesures):
        for k, n in enumerate(mes):
            if n != 'r':
                v = vel + (8 if k == 0 else 0) + (rng.integers(-4, 5) if rng is not None else 0)
                p.note(piste, debut + m * MESURE + k * C8, N(n) + 12 * octave, duree, v)


def compose(dossier=None):
    p = Partition(84, (4, 4))
    p.piste('bourdon', 0, 42, 76, 60, 90)       # violoncelle, très grave
    p.piste('pizz', 1, 45, 100, 50, 70)         # cordes en pizzicato
    p.piste('basson', 2, 70, 86, 78, 75)
    p.piste('flute', 3, 74, 74, 84, 90)
    for c in range(3):
        rng = np.random.default_rng(31)   # le même hasard à chaque tour : le 3e rejoue exactement le 2e
        t = c * CYCLE
        # Le bourdon de mi qui gonfle doucement, sans jamais faire peur
        for m in range(0, 18, 2):
            p.note('bourdon', t + m * MESURE, 'E2', 2 * MESURE - 0.05, 56)
            p.expression('bourdon', t + m * MESURE, 2 * MESURE, 55, 90)
        # Introduction : deux mesures sur la pointe des pieds (mi, si)
        for m in range(2):
            for k in range(4):
                p.note('pizz', t + m * MESURE + k, 'E2' if k % 2 == 0 else 'B2', 0.25, 62 + rng.integers(-4, 4))
        a = t + 2 * MESURE
        croches(p, 'pizz', MOTIF, a, 74, rng=rng)                                   # A : les pizzicati seuls
        croches(p, 'pizz', MOTIF, a + 16, 72, rng=rng)                              # A2 : le basson les double
        croches(p, 'basson', MOTIF, a + 16, 64, octave=-1, duree=0.22, rng=rng)
        croches(p, 'basson', BASSON, a + 32, 70, duree=0.24, rng=rng)              # B : le basson répond
        for m in range(4):
            p.note('pizz', a + 32 + m * MESURE, 'E2', 0.3, 66); p.note('pizz', a + 32 + m * MESURE + 2, 'B2', 0.3, 56)
        croches(p, 'pizz', MOTIF, a + 48, 70, rng=rng)                              # A3 : et la flûte passe sans bruit
        tt = a + 48
        for n, d in THEME_E + THEME_E:
            if n != 'r': p.note('flute', tt, n, d * 0.5, 62 + rng.integers(-4, 4))
            tt += d
    return musique('pantoufle', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
