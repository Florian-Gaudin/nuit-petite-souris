"""Le théâtre du Grand Marionnettiste (scène 13) : spectacle de foire médiéval, puis le galop de Bayard et
l'appel des Quatre Fils Aymon (airs originaux). Sol mixolydien, 6/8 (noire pointée à 84) : violon-vielle,
flûte à bec, cornemuse discrète, cloches, tambours ; cors pour l'appel."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np, mido
from commun import Partition, musique, N
from theme import ligne

FOIRE = [('G4', 1), ('B4', 1), ('D5', 1), ('G5', 2), ('F5', 1), ('E5', 1), ('D5', 1), ('C5', 1), ('D5', 3),
         ('B4', 1), ('C5', 1), ('D5', 1), ('E5', 2), ('D5', 1), ('C5', 1), ('B4', 1), ('A4', 1), ('G4', 3),
         ('G4', 1), ('B4', 1), ('D5', 1), ('G5', 2), ('F5', 1), ('E5', 1), ('F5', 1), ('G5', 1), ('A5', 2), ('G5', 1),
         ('F5', 1), ('E5', 1), ('D5', 1), ('C5', 1), ('A4', 1), ('F4', 1), ('G4', 6)]
APPEL = [('D4', 1), ('D4', 1), ('G4', 1), ('G4', 2), ('B4', 1), ('D5', 3), ('B4', 3), ('C5', 1), ('C5', 1), ('A4', 1), ('F4', 2), ('A4', 1), ('G4', 6),
         ('D5', 1), ('D5', 1), ('G5', 1), ('G5', 2), ('F5', 1), ('E5', 3), ('C5', 3), ('D5', 1), ('C5', 1), ('A4', 1), ('F4', 2), ('A4', 1), ('G4', 6)]
G_FOIRE = ['G', 'C', 'G', 'C', 'G', 'C', 'F', 'G']
G_APPEL = ['G', 'G', 'F', 'G', 'G', 'C', 'F', 'G']
ACC4 = {'G': ('G2', 'D3', 'G3', 'B3'), 'C': ('C3', 'G3', 'C4', 'E4'), 'F': ('F2', 'C3', 'F3', 'A3')}
SECTIONS = [('intro', ['G', 'G']), ('foire', G_FOIRE), ('galop', G_APPEL), ('foire2', G_FOIRE), ('galop2', G_APPEL)]
M = 3
CYCLE = sum(len(g) for _, g in SECTIONS) * M


def compose(dossier=None):
    p = Partition(126, (6, 8))
    p.piste('vielle', 0, 110, 88, 60, 70)      # fiddle
    p.piste('flute', 1, 74, 86, 80, 75)
    p.piste('cor', 2, 60, 92, 50, 85)
    p.piste('cornemuse', 3, 109, 46, 40, 80)
    p.piste('cloches', 4, 14, 60, 70, 100)
    p.piste('luth', 5, 24, 76, 36, 65)
    p.piste('timbale', 6, 47, 80, 64, 80)
    p.pistes['perc'] = (9, [(0, 0, mido.Message('control_change', channel=9, control=91, value=45))])
    for c in range(3):
        rng = np.random.default_rng(131)
        t = c * CYCLE
        p.note('cloches', t, 'G4', 3, 54); p.note('cloches', t + 1.5, 'D5', 3, 46)
        for nom, g in SECTIONS:
            galop = nom.startswith('galop')
            for m, a in enumerate(g):
                tm = t + m * M; ac = ACC4[a]
                if galop:
                    # Le galop de Bayard : ta-ta-DOUM sur chaque demi-mesure
                    for h in (0, 1.5):
                        p.note('perc', tm + h, 45, 0.2, 52); p.note('perc', tm + h + 0.25, 45, 0.2, 58); p.note('perc', tm + h + 0.5, 41, 0.3, 74)
                    p.note('timbale', tm, N(ac[0]), 1.2, 58)
                else:
                    for croche, plein in ((0, True), (2, False), (3, True), (5, False)):
                        for k, n in enumerate(ac if plein else ac[1:]):
                            p.note('luth', tm + croche * 0.5 + k * 0.015, n, 0.7, (58 if plein else 44) + int(rng.integers(-4, 4)))
                    p.note('perc', tm, 41, 0.3, 60); p.note('perc', tm + 1.5, 41, 0.3, 50)
                    for croche in (1, 2, 4, 5): p.note('perc', tm + croche * 0.5, 54, 0.2, 32 + int(rng.integers(-5, 5)))
            p.note('cornemuse', t, 'G3', len(g) * M - 0.1, 40); p.note('cornemuse', t, 'D4', len(g) * M - 0.1, 34)
            if nom == 'foire': ligne(p, 'vielle', FOIRE, t, vel=78, unite=0.5, staccato=0.9, rng=rng)
            if nom == 'foire2': ligne(p, 'flute', FOIRE, t, vel=78, unite=0.5, staccato=0.9, rng=rng); ligne(p, 'vielle', FOIRE, t, vel=58, octave=-1, unite=0.5, staccato=0.9, rng=rng)
            if galop: ligne(p, 'cor', APPEL, t, vel=82 if nom == 'galop' else 88, unite=0.5, staccato=0.9, rng=rng)
            if nom == 'galop2': ligne(p, 'vielle', APPEL, t, vel=60, octave=1, unite=0.5, staccato=0.9, rng=rng)
            t += len(g) * M
    return musique('theatre', p, CYCLE, 0, dossier=dossier)


if __name__ == '__main__':
    print(compose())
