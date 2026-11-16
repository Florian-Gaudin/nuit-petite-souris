"""Le château fort de Sedan : solennel et chaleureux, une sarabande. Fa majeur et ré dorien, 3/4, 58.
Le cor chante l'air du château ; puis les violoncelles reprennent le thème de Quenotte sous un chœur."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique
from theme import THEME, ACCORDS_THEME, ligne, arpeges, tenus, basses

AIR = [('F4', 2), ('A4', 1), ('G4', 1.5), ('F4', .5), ('E4', 1), ('D4', 2), ('E4', 1), ('F4', 3),
       ('A4', 2), ('C5', 1), ('Bb4', 1.5), ('A4', .5), ('G4', 1), ('A4', 1), ('G4', 1), ('E4', 1), ('F4', 3)]
G_AIR = ['F', 'C', 'Dm', 'F', 'F', 'Gm', 'C', 'F']
GRILLE = ['Dm', 'C'] + G_AIR + ACCORDS_THEME + ['Dm', 'Dm']
M = 3
CYCLE = len(GRILLE) * M


def compose(dossier=None):
    p = Partition(58, (3, 4))
    p.piste('cor', 0, 60, 88, 58, 95)
    p.piste('celli', 1, 42, 92, 50, 95)
    p.piste('contre', 2, 43, 80, 64, 90)
    p.piste('harpe', 3, 46, 80, 40, 95)
    p.piste('choeur', 4, 52, 70, 64, 115)
    p.piste('timbale', 5, 47, 70, 64, 90)
    for c in range(3):
        rng = np.random.default_rng(41)
        t = c * CYCLE
        basses(p, 'contre', GRILLE, t, M, vel=58)
        tenus(p, 'celli', GRILLE[:2], t, M, vel=52)
        p.note('timbale', t, 'D2', 2, 46)
        a = t + 2 * M
        arpeges(p, 'harpe', G_AIR, a, M, '3', vel=48, rng=rng)
        tenus(p, 'celli', G_AIR, a, M, vel=46)
        ligne(p, 'cor', AIR, a, vel=74, rng=rng, expression=True)
        b = a + 8 * M
        p.note('timbale', b, 'D2', 2, 52)
        tenus(p, 'choeur', ACCORDS_THEME, b, M, vel=44, octave=1)
        arpeges(p, 'harpe', ACCORDS_THEME, b, M, '3', vel=42, rng=rng)
        ligne(p, 'celli', THEME, b, vel=80, rng=rng, glisse=True, expression=True)
        tenus(p, 'choeur', ['Dm', 'Dm'], b + 12 * M, M, vel=40, octave=1)
    return musique('chateau', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
