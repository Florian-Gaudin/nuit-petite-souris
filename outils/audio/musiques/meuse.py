"""La rivière (la Meuse, ou celle choisie par les parents) : fluide. Ré dorien, 6/8 (noire pointée à 56).
La flûte de pan chante sur des arpèges de harpe et de guitare-luth qui coulent ; l'eau clapote."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique
from theme import ligne, arpeges, basses
import nature

A = [('A4', 3), ('D5', 2), ('E5', 1), ('F5', 3), ('E5', 3), ('D5', 2), ('C5', 1), ('A4', 3), ('G4', 6),
     ('A4', 3), ('D5', 2), ('E5', 1), ('F5', 2), ('G5', 1), ('A5', 3), ('G5', 2), ('F5', 1), ('E5', 2), ('C5', 1), ('D5', 6)]
B = [('F5', 3), ('A5', 3), ('G5', 2), ('F5', 1), ('E5', 3), ('D5', 3), ('F5', 3), ('E5', 6),
     ('C5', 3), ('E5', 2), ('G5', 1), ('F5', 2), ('E5', 1), ('D5', 3), ('C5', 2), ('A4', 1), ('B4', 2), ('C5', 1), ('D5', 6)]
GA = ['Dm', 'Dm', 'Dm', 'G', 'Dm', 'F', 'C', 'Dm']
GB = ['F', 'C', 'Dm', 'Am', 'C', 'Dm', 'G', 'Dm']
SECTIONS = [('intro', ['Dm', 'C']), ('A', GA), ('B', GB), ('A2', GA), ('B2', GB)]
M = 3
CYCLE = sum(len(g) for _, g in SECTIONS) * M


def compose(dossier=None):
    p = Partition(84, (6, 8))
    p.piste('pan', 0, 75, 92, 70, 100)
    p.piste('harpe', 1, 46, 84, 40, 95)
    p.piste('luth', 2, 24, 76, 88, 85)
    p.piste('celli', 3, 42, 70, 56, 95)
    p.piste('harpe2', 4, 46, 88, 52, 95)
    for c in range(3):
        rng = np.random.default_rng(71)
        t = c * CYCLE
        for nom, g in SECTIONS:
            arpeges(p, 'harpe' if nom in ('intro', 'A', 'B') else 'luth', g, t, M, '68', vel=52, rng=rng, duree=1.2)
            basses(p, 'celli', g, t, M, vel=52, octave=0)
            if nom == 'A': ligne(p, 'pan', A, t, vel=74, unite=0.5, rng=rng)
            if nom == 'B': ligne(p, 'pan', B, t, vel=76, unite=0.5, rng=rng)
            if nom == 'A2': ligne(p, 'harpe2', A, t, vel=70, unite=0.5, rng=rng); ligne(p, 'pan', A, t, vel=52, octave=1, unite=0.5, rng=rng)
            if nom == 'B2': ligne(p, 'pan', B, t, vel=78, unite=0.5, rng=rng)
            t += len(g) * M
    return musique('meuse', p, CYCLE, 0, couches=[(nature.eau, -13)], dossier=dossier)


if __name__ == '__main__':
    print(compose())
