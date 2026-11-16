"""Le diplôme : triomphal mais doux. Une fanfare de flûtes à bec et de tambours, puis le thème de Quenotte en grand,
en ré majeur : flûtes, violon, cordes et chœur, timbales aux grandes phrases. 3/4, 88."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np, mido
from commun import Partition, musique, N
from theme import THEME_MAJEUR, ACCORDS_MAJEUR, ligne, arpeges, tenus, basses

FANFARE = [('D5', .5), ('D5', .5), ('F#5', .5), ('A5', 1.5), ('F#5', 1), ('A5', .5), ('D6', 1.5)]          # deux mesures
FANFARE_TIERCE = [('F#4', .5), ('F#4', .5), ('A4', .5), ('D5', 1.5), ('A4', 1), ('D5', .5), ('F#5', 1.5)]
GRILLE = ['D', 'D'] + ACCORDS_MAJEUR + ['G', 'A'] + ACCORDS_MAJEUR
M = 3
CYCLE = len(GRILLE) * M


def compose(dossier=None):
    p = Partition(88, (3, 4))
    p.piste('flute', 0, 74, 92, 70, 85)
    p.piste('flute2', 1, 74, 84, 84, 85)
    p.piste('violon', 2, 40, 84, 56, 90)
    p.piste('cordes', 3, 48, 80, 60, 100)
    p.piste('choeur', 4, 52, 76, 64, 110)
    p.piste('harpe', 5, 46, 80, 40, 90)
    p.piste('timbale', 6, 47, 84, 64, 85)
    p.pistes['perc'] = (9, [(0, 0, mido.Message('control_change', channel=9, control=91, value=45))])
    for c in range(3):
        rng = np.random.default_rng(141)
        t = c * CYCLE
        # La fanfare d'ouverture : deux flûtes en tierces, tambour
        ligne(p, 'flute', FANFARE, t, vel=80, rng=rng); ligne(p, 'flute2', FANFARE_TIERCE, t, vel=66, octave=1, rng=rng)
        for m, a in enumerate(GRILLE):
            tm = t + m * M
            p.note('perc', tm, 41, 0.3, 56); p.note('perc', tm + 2, 45, 0.2, 40); p.note('perc', tm + 2.5, 45, 0.2, 34)
        for k in (0, 2, 14, 16):
            p.note('timbale', t + k * M, 'D2', 1.5, 66); p.note('timbale', t + k * M + 0.5, 'D2', 1, 48)
        arpeges(p, 'harpe', GRILLE, t, M, '3', vel=48, rng=rng)
        basses(p, 'cordes', GRILLE, t, M, vel=52)
        a = t + 2 * M
        ligne(p, 'flute', THEME_MAJEUR, a, vel=80, octave=1, rng=rng, orn=True)
        ligne(p, 'violon', THEME_MAJEUR, a, vel=60, octave=0, rng=rng)
        tenus(p, 'cordes', ACCORDS_MAJEUR, a, M, vel=44, octave=1)
        ligne(p, 'flute', FANFARE, a + 12 * M, vel=78, rng=rng); ligne(p, 'flute2', FANFARE_TIERCE, a + 12 * M, vel=64, octave=1, rng=rng)
        b = a + 14 * M
        ligne(p, 'choeur', THEME_MAJEUR, b, vel=70, octave=1, rng=rng, expression=True)
        ligne(p, 'flute', THEME_MAJEUR, b, vel=72, octave=1, rng=rng)
        ligne(p, 'violon', THEME_MAJEUR, b, vel=70, octave=1, rng=rng, glisse=True)
        tenus(p, 'cordes', ACCORDS_MAJEUR, b, M, vel=50, octave=1)
    return musique('diplome', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
