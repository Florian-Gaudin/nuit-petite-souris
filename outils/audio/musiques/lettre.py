"""La lettre de Quenotte : tendre. Le thème de Quenotte en berceuse, au violon puis à la harpe ; ré dorien, 3/4, 56."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique
from theme import THEME, ACCORDS_THEME, ligne, arpeges, tenus, basses

GRILLE = ['Dm', 'Am'] + ACCORDS_THEME + ['F', 'C'] + ACCORDS_THEME
M = 3
CYCLE = len(GRILLE) * M
CONTRE = [('F4', 3), ('F4', 3), ('E4', 3), ('E4', 3), ('F4', 3), ('A4', 3), ('B4', 3), ('A4', 3), ('G4', 3), ('E4', 3), ('A4', 3), ('F4', 3)]


def compose(dossier=None):
    p = Partition(56, (3, 4))
    p.piste('violon', 0, 40, 86, 64, 100)
    p.piste('harpe', 1, 46, 86, 44, 100)
    p.piste('harpe2', 2, 46, 92, 56, 100)
    p.piste('celli', 3, 42, 62, 60, 95)
    for c in range(3):
        rng = np.random.default_rng(121)
        t = c * CYCLE
        arpeges(p, 'harpe', GRILLE, t, M, '3', vel=44, rng=rng, duree=1.6)
        basses(p, 'celli', GRILLE, t, M, vel=40, octave=0)
        a = t + 2 * M
        ligne(p, 'violon', THEME, a, vel=66, octave=1, rng=rng, glisse=True, expression=True, orn=True)
        b = a + 14 * M
        ligne(p, 'harpe2', THEME, b, vel=66, octave=1, rng=rng)
        ligne(p, 'violon', CONTRE, b, vel=48, octave=0, rng=rng, expression=True)
    return musique('lettre', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
