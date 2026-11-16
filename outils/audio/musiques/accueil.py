"""Accueil : une veillée au coin du feu. Le thème de Quenotte à la flûte à bec, puis à la harpe ;
violoncelle en bourdon, chœur très doux, et le feu qui crépite. Ré dorien, 3/4, 66."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique, N
from theme import THEME, ACCORDS_THEME, ligne
import nature

ACC = {'Dm': ('D3', 'A3', 'F4'), 'C': ('C3', 'G3', 'E4'), 'Am': ('A2', 'E3', 'C4'), 'F': ('F2', 'C3', 'A3'), 'G': ('G2', 'D3', 'B3')}
GRILLE = ['Dm', 'C'] + ACCORDS_THEME + ['Dm', 'Am'] + ACCORDS_THEME   # 28 mesures
MESURE = 3
CYCLE = len(GRILLE) * MESURE


def compose(dossier=None):
    p = Partition(66, (3, 4))
    p.piste('bourdon', 0, 42, 84, 54, 100)      # violoncelle
    p.piste('flute', 1, 74, 92, 76, 95)        # flûte à bec
    p.piste('harpe', 2, 46, 90, 44, 90)        # harpe (arpèges)
    p.piste('harpe2', 3, 46, 96, 58, 95)       # harpe (le thème, seconde fois)
    p.piste('guitare', 4, 24, 74, 36, 85)      # guitare nylon, comme un luth
    p.piste('choeur', 5, 53, 62, 64, 115, 30)  # voix « oh », très douce
    for c in range(3):                          # trois tours identiques : on garde le deuxième
        rng = np.random.default_rng(11)          # le même hasard à chaque tour : le 3e rejoue exactement le 2e
        t0 = c * CYCLE
        # Le bourdon de ré, qui respire toutes les quatre mesures
        for m in range(0, len(GRILLE), 4):
            p.note('bourdon', t0 + m * MESURE, 'D2', 4 * MESURE - 0.05, 66)
            p.note('bourdon', t0 + m * MESURE, 'A2', 4 * MESURE - 0.05, 48)
            p.expression('bourdon', t0 + m * MESURE, 4 * MESURE, 60, 100)
        for m, a in enumerate(GRILLE):
            r, q, t = ACC[a]; tm = t0 + m * MESURE
            arp = [r, q, N(r) + 12, t, N(r) + 12, q]
            seconde = m >= 16
            inst = 'guitare' if seconde else 'harpe'
            for k, n in enumerate(arp):
                p.note(inst, tm + k * 0.5, n, 1.4, (62 if k == 0 else 50) + rng.integers(-4, 5))
            if seconde:                          # la seconde fois, un chœur très doux tient l'accord
                p.note('choeur', tm, N(q) + 12, MESURE, 40); p.note('choeur', tm, N(t) + 12, MESURE, 36)
        ligne(p, 'flute', THEME, t0 + 2 * MESURE, vel=78, octave=1, orn=True, rng=rng, expression=True)
        ligne(p, 'harpe2', THEME, t0 + 16 * MESURE, vel=72, octave=1, rng=rng)
    return musique('accueil', p, CYCLE, 0, couches=[(nature.feu, -13)], dossier=dossier)


if __name__ == '__main__':
    print(compose())
