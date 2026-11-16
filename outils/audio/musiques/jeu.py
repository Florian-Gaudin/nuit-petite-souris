"""Le mini-jeu du chat : la tension légère de Pantoufle, en plus mince et plus aéré, pour laisser entendre le
ronflement du chat (joué à part par l'appli). Mi phrygien, 4/4, 96 : pizzicati, petits tambours, beaucoup de silence."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np, mido
from commun import Partition, musique, N

MOTIF = [['E3', 'r', 'r', 'r', 'G3', 'r', 'F3', 'r'], ['E3', 'r', 'r', 'r', 'B2', 'r', 'r', 'r'],
         ['G3', 'r', 'r', 'r', 'A3', 'r', 'G3', 'r'], ['F3', 'r', 'E3', 'r', 'r', 'r', 'r', 'r']]
REPONSE = [['r', 'r', 'B3', 'r', 'r', 'r', 'C4', 'r'], ['B3', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
           ['r', 'r', 'D4', 'r', 'C4', 'r', 'B3', 'r'], ['A3', 'r', 'r', 'r', 'G3', 'r', 'r', 'r']]
M = 4
CYCLE = 18 * M


def croches(p, piste, mesures, debut, vel, octave=0, duree=0.25, rng=None):
    for m, mes in enumerate(mesures):
        for k, n in enumerate(mes):
            if n != 'r':
                p.note(piste, debut + m * M + k * 0.5, N(n) + 12 * octave, duree, vel + (int(rng.integers(-4, 5)) if rng is not None else 0))


def compose(dossier=None):
    p = Partition(96, (4, 4))
    p.piste('pizz', 0, 45, 96, 52, 60)
    p.piste('basson', 1, 70, 78, 76, 65)
    p.piste('bourdon', 2, 42, 64, 60, 80)
    p.pistes['perc'] = (9, [(0, 0, mido.Message('control_change', channel=9, control=91, value=40))])
    for c in range(3):
        rng = np.random.default_rng(101)
        t = c * CYCLE
        for m in range(0, 18, 2):
            p.note('bourdon', t + m * M, 'E2', 2 * M - 0.05, 46)
        for m in range(18):
            p.note('perc', t + m * M, 45, 0.2, 34)                     # un petit tambour, à peine
            if m % 2: p.note('perc', t + m * M + 3, 45, 0.2, 26)
        croches(p, 'pizz', [['E2', 'r', 'r', 'r', 'B2', 'r', 'r', 'r']] * 2, t, 60, rng=rng)
        for s in range(4):
            croches(p, 'pizz', MOTIF, t + 2 * M + s * 4 * M, 70, rng=rng)
            if s % 2: croches(p, 'basson', REPONSE, t + 2 * M + s * 4 * M, 62, duree=0.2, rng=rng)
    return musique('jeu', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
