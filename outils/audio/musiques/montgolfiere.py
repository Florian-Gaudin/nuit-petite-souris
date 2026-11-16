"""La montgolfière (et le retour dans les nuages) : aérienne, l'élan du vent. Ré majeur teinté de mixolydien,
3/4, 80. Le thème de Quenotte s'envole aux cordes et à la flûte de pan, puis au chœur ; la harpe coule en arpèges."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique
from theme import THEME_MAJEUR, ACCORDS_MAJEUR, ligne, arpeges, tenus, basses
import nature

GRILLE = ['D', 'G'] + ACCORDS_MAJEUR + ['G', 'A'] + ACCORDS_MAJEUR
M = 3
CYCLE = len(GRILLE) * M
# Le contrechant des cordes, une note tenue par mesure, pour la seconde fois
CONTRE = [('F#5', 3), ('A5', 3), ('G5', 3), ('E5', 3), ('F#5', 3), ('A5', 3), ('B5', 3), ('A5', 3), ('G5', 3), ('E5', 3), ('F#5', 3), ('D5', 3)]


def compose(dossier=None):
    p = Partition(80, (3, 4))
    p.piste('cordes', 0, 48, 92, 56, 100)
    p.piste('pan', 1, 75, 86, 76, 100)
    p.piste('harpe', 2, 46, 84, 38, 90)
    p.piste('choeur', 3, 52, 80, 64, 115)
    p.piste('basses', 4, 49, 78, 60, 90)
    for c in range(3):
        rng = np.random.default_rng(51)
        t = c * CYCLE
        arpeges(p, 'harpe', GRILLE, t, M, '3', vel=50, rng=rng)
        basses(p, 'basses', GRILLE, t, M, vel=56)
        a = t + 2 * M
        ligne(p, 'cordes', THEME_MAJEUR, a, vel=74, octave=1, rng=rng, glisse=True, expression=True)
        ligne(p, 'pan', THEME_MAJEUR, a, vel=58, octave=1, rng=rng)
        tenus(p, 'choeur', ['G', 'A'], a + 12 * M, M, vel=44, octave=1)
        b = a + 14 * M
        ligne(p, 'choeur', THEME_MAJEUR, b, vel=70, octave=1, rng=rng, expression=True)
        ligne(p, 'pan', THEME_MAJEUR, b, vel=64, octave=2, rng=rng)
        ligne(p, 'cordes', CONTRE, b, vel=56, rng=rng, expression=True)
    return musique('montgolfiere', p, CYCLE, 0, couches=[(nature.vent, -15)], dossier=dossier)


if __name__ == '__main__':
    print(compose())
