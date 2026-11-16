"""La montgolfière (et le retour dans les nuages) : aérienne, l'élan du vent. Ré majeur teinté de mixolydien,
3/4, 80. Le thème de Quenotte s'envole à la flûte de pan, puis au chœur ; la harpe coule en arpèges.
(Sans les cordes aiguës : leurs glissandos d'une note à l'autre semblaient « dérailler ».)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique
from theme import THEME_MAJEUR, ACCORDS_MAJEUR, ligne, arpeges, tenus, basses
import nature

GRILLE = ['D', 'G'] + ACCORDS_MAJEUR + ['G', 'A'] + ACCORDS_MAJEUR
M = 3
CYCLE = len(GRILLE) * M


def compose(dossier=None):
    p = Partition(80, (3, 4))
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
        ligne(p, 'pan', THEME_MAJEUR, a, vel=66, octave=1, rng=rng, expression=True)
        tenus(p, 'choeur', ['G', 'A'], a + 12 * M, M, vel=44, octave=1)
        b = a + 14 * M
        ligne(p, 'choeur', THEME_MAJEUR, b, vel=70, octave=1, rng=rng, expression=True)
        ligne(p, 'pan', THEME_MAJEUR, b, vel=54, octave=1, rng=rng)
    return musique('montgolfiere', p, CYCLE, 0, couches=[(nature.vent, -15)], dossier=dossier)


if __name__ == '__main__':
    print(compose())
