"""La forêt des Ardennes (et le terrier) : d'après la démo de référence (outils/audio/reference/foret.py).
Ré dorien, 4/4, 72 : violon soliste orné sur un bourdon de violoncelle, dulcimer, flûte à bec qui répond, chœur,
tambours très doux ; vent, grillons et hulotte lointaine. Mystérieuse, jamais effrayante."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from commun import Partition, musique, N, SR
import nature

A = [[('A4', 0, 1), ('D5', 1, .5), ('E5', 1.5, .5), ('F5', 2, 1.5), ('E5', 3.5, .5)],
     [('D5', 0, .75), ('C5', .75, .25), ('A4', 1, 1), ('G4', 2, 1), ('A4', 3, 1)],
     [('D5', 0, 1), ('F5', 1, .5), ('G5', 1.5, .5), ('A5', 2, 1.5), ('G5', 3.5, .25), ('F5', 3.75, .25)],
     [('E5', 0, 1), ('D5', 1, .5), ('C5', 1.5, .5), ('D5', 2, 2)]]
B = [[('A5', 0, 1.5), ('C6', 1.5, .5), ('B5', 2, 1), ('A5', 3, 1)],
     [('G5', 0, .5), ('A5', .5, .5), ('F5', 1, 1), ('E5', 2, 1), ('D5', 3, 1)],
     [('F5', 0, 1), ('G5', 1, .5), ('A5', 1.5, .5), ('B5', 2, 1), ('A5', 3, 1)],
     [('G5', 0, .5), ('F5', .5, .5), ('E5', 1, 1), ('D5', 2, 2)]]
ACC_A = [['D3', 'A3', 'F4'], ['C3', 'G3', 'E4'], ['D3', 'A3', 'F4'], ['A2', 'E3', 'C4']]
ACC_B = [['F3', 'C4', 'A4'], ['C3', 'G3', 'E4'], ['G2', 'D3', 'B3'], ['D3', 'A3', 'F4']]
INTRO = 8
CYCLE = INTRO + 16 * 4


def compose(dossier=None):
    p = Partition(72, (4, 4))
    p.piste('bourdon', 0, 42, 92, 54, 100)
    p.piste('alto', 1, 41, 70, 74, 100)
    p.piste('violon', 2, 40, 104, 64, 85)
    p.piste('flute', 3, 74, 80, 84, 95)
    p.piste('dulcimer', 4, 15, 70, 40, 80)
    p.piste('choeur', 5, 52, 66, 64, 110)
    p.piste('taiko', 6, 116, 70, 64, 70)
    p.piste('harpe', 7, 46, 60, 30, 90)
    import mido
    p.pistes['perc'] = (9, [(0, 0, mido.Message('control_change', channel=9, control=91, value=60))])

    for c in range(3):
        rng = np.random.default_rng(5)
        T0 = c * CYCLE

        def phrase(inst, mel, debut, vel=84, orn=True, oct=0):
            for m, mes in enumerate(mel):
                for (n, s, d) in mes:
                    t = T0 + debut + m * 4 + s; pp = N(n) + 12 * oct
                    if orn and d >= 1.5: p.note(inst, t - 0.12, pp + 2, 0.12, vel - 20)
                    if orn and d >= 1 and rng.random() < 0.5: p.glisse(inst, t, 0.18)
                    p.note(inst, t, pp, d * 0.98, vel + int(rng.integers(-6, 6)))
                    if d >= 1.5: p.expression(inst, t, d, 85, 120)

        def harmonie(acc, debut, mesures, dulci=True, harpe=False, alto=True):
            for m in range(mesures):
                a = acc[m % 4]; t = T0 + debut + m * 4
                if alto: p.note('alto', t, a[1], 4, 58); p.note('alto', t, a[2], 4, 52)
                if dulci:
                    for k, n in enumerate([a[0], a[1], a[2], a[1], N(a[0]) + 12, a[2], a[1], a[2]]):
                        p.note('dulcimer', t + k * 0.5, n, 0.9, 60 if k % 2 == 0 else 48)
                if harpe:
                    for k, n in enumerate([a[0], a[1], a[2], N(a[1]) + 12]): p.note('harpe', t + k * 0.25, n, 2, 52)

        def tambours(debut, mesures, fort=False):
            # Des tambours feutrés : ils marchent, ils ne grondent pas
            for m in range(mesures):
                t = T0 + debut + m * 4
                p.note('taiko', t, 'D2', 2, 64 if fort else 50)
                for s, (n, v) in enumerate([(41, 56), (None, 0), (45, 36), (41, 44), (None, 0), (45, 36), (43, 46), (45, 32)]):
                    if n: p.note('perc', t + s * 0.5, n, 0.4, v if fort else int(v * 0.7))

        # Bourdon de ré et chœur lointain, sur tout le cycle
        p.note('bourdon', T0, 'D2', CYCLE - 0.05, 66); p.note('bourdon', T0 + 2, 'A2', CYCLE - 2.05, 50)
        p.expression('bourdon', T0, 6, 60, 105)
        p.note('choeur', T0 + 2, 'D4', 6, 44); p.note('choeur', T0 + 2, 'A4', 6, 40); p.expression('choeur', T0 + 2, 6, 40, 95)
        phrase('violon', A, INTRO); harmonie(ACC_A, INTRO, 4, dulci=False); tambours(INTRO + 8, 2)
        phrase('violon', A, INTRO + 16, 86); harmonie(ACC_A, INTRO + 16, 4); tambours(INTRO + 16, 4)
        for m, mes in enumerate(A):
            if m % 2 == 1:
                for (n, s, d) in mes[-2:]: p.note('flute', T0 + INTRO + 16 + m * 4 + s + 0.5, N(n) + 15, d * 0.8, 66)
        phrase('violon', B, INTRO + 32, 92); harmonie(ACC_B, INTRO + 32, 4, harpe=True); tambours(INTRO + 32, 4, fort=True)
        for m in range(4):
            a = ACC_B[m]; p.note('choeur', T0 + INTRO + 32 + m * 4, N(a[1]) + 12, 4, 64); p.note('choeur', T0 + INTRO + 32 + m * 4, N(a[2]) + 12, 4, 58)
        phrase('flute', B, INTRO + 32, 60, orn=False, oct=-1)
        phrase('violon', A, INTRO + 48, 88); phrase('flute', A, INTRO + 48, 58, orn=False, oct=1)
        harmonie(ACC_A, INTRO + 48, 4, harpe=True); tambours(INTRO + 48, 3)

    def hulotte_couche(longueur, rng):
        from bruitages import hulotte
        from commun import passe_bas
        y = np.zeros((int((longueur + nature.FONDU) * SR), 2))
        h = passe_bas(hulotte(np.random.default_rng(3), 0), 2000)
        for t0, pan in ((3.0, 0.3), (longueur * 0.62, 0.75)):
            nature._evenement(y, t0 * SR, h, pan)
        return nature.boucle_ambiance(y, longueur, nature.FONDU)

    return musique('foret', p, CYCLE, 0, couches=[(nature.vent, -11), (nature.grillons, -24), (hulotte_couche, -22)], dossier=dossier)


if __name__ == '__main__':
    print(compose())
