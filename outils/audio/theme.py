"""Le thème de Quenotte (composition originale) et les outils d'écriture partagés par les ambiances.

Le thème, en ré dorien : une quarte qui monte comme un appel (la → ré), puis une phrase qui se pose ; le si
naturel lui donne sa couleur ancienne. 12 mesures à 3 temps ; (note, durée en temps)."""
from commun import N

THEME = [
    ('A3', 1), ('D4', 1.5), ('E4', .5), ('F4', 1), ('E4', 1), ('D4', 1), ('C4', 1), ('D4', 1), ('E4', 1), ('A3', 3),
    ('A3', 1), ('D4', 1.5), ('E4', .5), ('F4', 1), ('G4', 1), ('A4', 1), ('B4', 1.5), ('A4', .5), ('G4', 1), ('A4', 3),
    ('C5', 1.5), ('B4', .5), ('A4', 1), ('G4', 1), ('F4', 1), ('E4', 1), ('F4', 1), ('E4', 1), ('C4', 1), ('D4', 3),
]
# Les accords du thème, une mesure chacun
ACCORDS_THEME = ['Dm', 'Dm', 'C', 'Am', 'Dm', 'F', 'G', 'Am', 'C', 'C', 'F', 'Dm']

# Le même thème en ré majeur (fa dièse) : pour la montgolfière et le diplôme
THEME_MAJEUR = [(n.replace('F', 'F#'), d) for n, d in THEME]
ACCORDS_MAJEUR = ['D', 'D', 'C', 'Am', 'D', 'D', 'G', 'Am', 'C', 'C', 'D', 'D']

# Accords : (basse, quinte, tierce) — voicings serrés autour du do central
ACC = {
    'Dm': ('D3', 'A3', 'F4'), 'D': ('D3', 'A3', 'F#4'), 'C': ('C3', 'G3', 'E4'), 'Am': ('A2', 'E3', 'C4'), 'A': ('A2', 'E3', 'C#4'),
    'F': ('F2', 'C3', 'A3'), 'G': ('G2', 'D3', 'B3'), 'Gm': ('G2', 'D3', 'Bb3'), 'Bb': ('Bb2', 'F3', 'D4'), 'Em': ('E2', 'B2', 'G3'),
    'E': ('E2', 'B2', 'G#3'), 'Bm': ('B2', 'F#3', 'D4'),
}


def transpose(notes, demi_tons):
    from commun import N as n_
    out = []
    for n, d in notes:
        out.append((n if n == 'r' else n_(n) + demi_tons, d))
    return out


def ligne(p, piste, notes, debut, vel=80, octave=0, orn=False, glisse=False, staccato=1.0, rng=None, expression=False, unite=1.0):
    """Joue une suite (note, durée) à partir de « debut » (en temps). « r » = silence. unite : durée d'une unité
    (1 = noire, 0.5 = croche). orn : petite note d'appui au-dessus des notes longues ; glisse : glissé d'entrée."""
    t = debut
    for k, (n, d) in enumerate(notes):
        d = d * unite
        if n != 'r':
            hauteur = N(n) + 12 * octave
            v = vel + (int(rng.integers(-5, 6)) if rng is not None else ((k * 7) % 9) - 4)
            if orn and d >= 1.5:
                p.note(piste, t - 0.1, hauteur + 2, 0.1, v - 22)
            if glisse and d >= 1 and (rng is None or rng.random() < 0.5):
                p.glisse(piste, t, 0.16)
            p.note(piste, t, hauteur, d * staccato * 0.97, v)
            if expression and d >= 1.5:
                p.expression(piste, t, d, 85, 120)
        t += d
    return t


def arpeges(p, piste, grille, debut, mesure, motif='3', vel=56, rng=None, duree=1.4):
    """Accompagnement en arpèges, une mesure par accord. motif '3' : six croches (3/4) ; '4' : huit croches ;
    '68' : six croches de 6/8 ; 'lent' : une noire par note."""
    formes = {
        '3': lambda r, q, t: [r, q, N(r) + 12, t, N(r) + 12, q],
        '68': lambda r, q, t: [r, q, t, N(r) + 12, t, q],
        '4': lambda r, q, t: [r, q, N(r) + 12, t, N(q) + 12, t, N(r) + 12, q],
        'lent': lambda r, q, t: [r, q, t, N(q) + 12][: int(round(mesure))],
    }
    pas = 1.0 if motif == 'lent' else 0.5
    for m, a in enumerate(grille):
        r, q, t = ACC[a]
        for k, n in enumerate(formes[motif](r, q, t)):
            v = vel + (6 if k == 0 else 0) + (int(rng.integers(-4, 5)) if rng is not None else 0)
            p.note(piste, debut + m * mesure + k * pas, n, duree, v)


def tenus(p, piste, grille, debut, mesure, vel=40, octave=0, notes=(1, 2)):
    """Une nappe : les notes choisies de chaque accord, tenues toute la mesure."""
    for m, a in enumerate(grille):
        for i in notes:
            p.note(piste, debut + m * mesure, N(ACC[a][i]) + 12 * octave, mesure - 0.02, vel)


def basses(p, piste, grille, debut, mesure, vel=60, octave=-1, temps=(0,)):
    for m, a in enumerate(grille):
        for t in temps:
            p.note(piste, debut + m * mesure + t, N(ACC[a][0]) + 12 * octave, mesure - t - 0.05 if len(temps) == 1 else 0.9, vel)
