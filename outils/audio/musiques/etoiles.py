"""Au milieu des étoiles : magique et suspendue. La éolien, 4/4, 52. Un air lent au célesta, la harpe qui
égrène, un chœur lointain (voix « oh ») ; puis le début du thème de Quenotte, comme une constellation."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique, N
from theme import ligne, arpeges, tenus, transpose, THEME

AIR = [('E5', 2), ('A5', 2), ('G5', 3), ('E5', 1), ('F5', 2), ('E5', 1), ('D5', 1), ('E5', 4),
       ('C5', 2), ('E5', 2), ('D5', 3), ('B4', 1), ('C5', 2), ('B4', 1), ('A4', 1), ('A4', 4)]
GRILLE = ['Am', 'Em', 'F', 'Am', 'F', 'G', 'Em', 'Am'] * 2
M = 4
CYCLE = len(GRILLE) * M
# Le début du thème de Quenotte, transposé en la (une quinte au-dessus), au célesta, en notes longues
DEBUT_THEME = [(n, d * 4 / 3) for n, d in transpose(THEME[:10], 7)]


def compose(dossier=None):
    p = Partition(52, (4, 4))
    p.piste('celesta', 0, 8, 96, 60, 110)
    p.piste('harpe', 1, 46, 82, 44, 110)
    p.piste('choeur', 2, 53, 74, 64, 125)
    p.piste('glock', 3, 9, 50, 84, 120)
    p.piste('basse', 4, 49, 64, 64, 100)
    for c in range(3):
        rng = np.random.default_rng(61)
        t = c * CYCLE
        arpeges(p, 'harpe', GRILLE, t, M, 'lent', vel=44, rng=rng, duree=3)
        tenus(p, 'choeur', GRILLE, t, M, vel=40, octave=1)
        for m, a in enumerate(GRILLE):
            from theme import ACC
            p.note('basse', t + m * M, N(ACC[a][0]) - 12, M - 0.05, 46)
        ligne(p, 'celesta', AIR, t, vel=70, rng=rng)
        ligne(p, 'celesta', DEBUT_THEME, t + 8 * M, vel=62, octave=1, rng=rng)
        # Des étoiles qui tintent, ici et là
        for k in range(10):
            tt = t + rng.uniform(0, CYCLE - 2)
            p.note('glock', tt, int(rng.choice([N('E6'), N('A6'), N('C7'), N('B6')])), 1.5, int(rng.integers(26, 40)))
    return musique('etoiles', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
