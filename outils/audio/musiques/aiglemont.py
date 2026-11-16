"""La ville de l'enfant et sa fenêtre : douce et intime, l'arrivée à la maison. Fa majeur, 3/4, 64.
La guitare-luth et le violon chantent l'air de la maison ; puis le thème de Quenotte revient, tout doux."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique
from theme import THEME, ACCORDS_THEME, ligne, arpeges, tenus, basses

AIR = [('C5', 1), ('A4', 1), ('F4', 1), ('G4', 1.5), ('A4', .5), ('Bb4', 1), ('A4', 2), ('G4', 1), ('F4', 3),
       ('D5', 1), ('C5', 1), ('A4', 1), ('Bb4', 1.5), ('A4', .5), ('G4', 1), ('A4', 1), ('G4', 1), ('E4', 1), ('F4', 3)]
G_AIR = ['F', 'C', 'F', 'F', 'Dm', 'Gm', 'C', 'F']
GRILLE = ['F', 'C'] + G_AIR + G_AIR + ACCORDS_THEME
M = 3
CYCLE = len(GRILLE) * M
CONTRE = [('A4', 3), ('G4', 3), ('A4', 3), ('C5', 3), ('D5', 3), ('D5', 3), ('C5', 3), ('A4', 3)]


def compose(dossier=None):
    p = Partition(64, (3, 4))
    p.piste('luth', 0, 24, 88, 44, 85)
    p.piste('violon', 1, 40, 84, 70, 95)
    p.piste('harpe', 2, 46, 80, 56, 95)
    p.piste('celli', 3, 42, 66, 60, 90)
    for c in range(3):
        rng = np.random.default_rng(91)
        t = c * CYCLE
        basses(p, 'celli', GRILLE, t, M, vel=46, octave=0)
        arpeges(p, 'luth', ['F', 'C'] + G_AIR, t, M, '3', vel=50, rng=rng)
        a = t + 2 * M
        ligne(p, 'violon', AIR, a, vel=70, rng=rng, glisse=True, expression=True)
        b = a + 8 * M
        arpeges(p, 'harpe', G_AIR, b, M, '3', vel=46, rng=rng)
        ligne(p, 'luth', AIR, b, vel=74, octave=0, rng=rng)
        ligne(p, 'violon', CONTRE, b, vel=52, rng=rng, expression=True)
        d = b + 8 * M
        arpeges(p, 'harpe', ACCORDS_THEME, d, M, '3', vel=44, rng=rng)
        ligne(p, 'violon', THEME, d, vel=64, octave=1, rng=rng, glisse=True, expression=True)
    return musique('aiglemont', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
