"""La caméra de Quenotte : mystérieuse et feutrée. La éolien, 4/4, 60. Une harpe étouffée en ostinato, un chœur
très bas, quelques notes de célesta, rares, comme des reflets dans le noir."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique, N
from theme import ACC, tenus

GRILLE = ['Am', 'F', 'Am', 'E', 'Am', 'F', 'Dm', 'E'] * 2
M = 4
CYCLE = len(GRILLE) * M
REFLETS = [(1, 'E6'), (3, 'C6'), (6, 'B5'), (9, 'A5'), (11, 'C6'), (14, 'G#5')]


def compose(dossier=None):
    p = Partition(60, (4, 4))
    p.piste('harpe', 0, 46, 80, 50, 100)
    p.piste('choeur', 1, 53, 66, 64, 120)
    p.piste('celesta', 2, 8, 70, 76, 120)
    p.piste('basse', 3, 43, 64, 60, 90)
    for c in range(3):
        rng = np.random.default_rng(111)
        t = c * CYCLE
        for m, a in enumerate(GRILLE):
            r, q, tt = ACC[a]
            for k, n in enumerate([r, q, N(r) + 12, q]):
                p.note('harpe', t + m * M + k, n, 0.6, 46 + (6 if k == 0 else 0) + int(rng.integers(-3, 4)))   # notes courtes : étouffées
            p.note('basse', t + m * M, N(r) - 12, M - 0.1, 44)
        tenus(p, 'choeur', GRILLE, t, M, vel=34, octave=0)
        for m, n in REFLETS:
            p.note('celesta', t + m * M + 1.5, n, 2.5, 44)
    return musique('camera', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
