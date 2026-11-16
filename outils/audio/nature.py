"""Les ambiances naturelles, synthétisées proprement (bruit filtré en une passe, chaque événement enveloppé).
Chaque fonction reçoit la longueur de la boucle (s) et un générateur aléatoire, et renvoie une couche stéréo
déjà périodique (sa fin se fond dans son début)."""
import numpy as np
from commun import SR, passe_bas, passe_haut, passe_bande, enveloppe, boucle_ambiance

FONDU = 2.0


def _lent(n, rng, periode_min=4, periode_max=12, k=3):
    """Une modulation très lente (somme de sinus), entre 0 et 1."""
    t = np.arange(n) / SR
    m = np.zeros(n)
    for _ in range(k):
        p = rng.uniform(periode_min, periode_max)
        m += np.sin(2 * np.pi * t / p + rng.uniform(0, 2 * np.pi))
    return 0.5 + 0.5 * m / k


def _evenement(y, debut, son, pan):
    """Ajoute un petit son (mono, déjà enveloppé) dans la couche stéréo, avec un panoramique doux."""
    i = int(debut)
    if i < 0 or i >= len(y): return
    m = min(len(son), len(y) - i)
    g, d = np.cos(pan * np.pi / 2), np.sin(pan * np.pi / 2)
    y[i:i + m, 0] += son[:m] * g
    y[i:i + m, 1] += son[:m] * d


def feu(longueur, rng):
    """Un feu de bois : grondement sourd, souffle léger, et des crépitements épars."""
    n = int((longueur + FONDU) * SR)
    sourd = passe_bas(rng.standard_normal((n, 2)), 180) * (0.55 + 0.45 * _lent(n, rng, 3, 9))[:, None]
    souffle = passe_bande(rng.standard_normal((n, 2)), 1800, 4500) * 0.08 * _lent(n, rng, 2, 6)[:, None]
    y = sourd / np.max(np.abs(sourd)) * 0.5 + souffle / np.max(np.abs(souffle)) * 0.05
    # Crépitements : de petites salves de bruit, chacune filtrée entière (avec sa marge) puis enveloppée
    t = 0.0
    while t < longueur + FONDU - 0.2:
        t += rng.exponential(0.35)
        dur = rng.uniform(0.004, 0.022)
        m = int(dur * SR); marge = int(0.01 * SR)
        s = np.zeros(m + 2 * marge)
        s[marge:marge + m] = rng.standard_normal(m) * enveloppe(m, 0.0006, dur / 3)
        s = passe_bande(s, rng.uniform(900, 1600), rng.uniform(3500, 6500))
        bord = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, marge))       # la résonance du filtre retombe à zéro
        s[:marge] *= bord; s[-marge:] *= bord[::-1]
        _evenement(y, t * SR, s * 10 ** rng.uniform(-1.4, -0.3), rng.uniform(0.25, 0.75))
        if rng.random() < 0.15:                         # parfois une petite rafale de deux ou trois éclats
            for k in range(rng.integers(1, 3)):
                _evenement(y, (t + 0.03 * (k + 1)) * SR, s * 0.5, rng.uniform(0.3, 0.7))
    return boucle_ambiance(y, longueur, FONDU)


def grillons(longueur, rng, densite=1.0):
    """Des grillons très doux, à gauche et à droite."""
    n = int((longueur + FONDU) * SR)
    y = np.zeros((n, 2))
    for cote, (f0, per) in enumerate([(4300, 1.7), (4650, 2.3)]):
        d0 = rng.uniform(0, per)
        while d0 < longueur + FONDU - 0.5:
            m = int(0.3 * SR); tt = np.arange(m) / SR
            gate = 0.5 - 0.5 * np.cos(2 * np.pi * 26 * tt)          # pulsations douces, sans créneau
            s = np.sin(2 * np.pi * f0 * tt) * gate * np.sin(np.pi * tt / tt[-1]) ** 2
            _evenement(y, d0 * SR, s * 0.3, 0.2 if cote == 0 else 0.8)
            d0 += per / densite
    return boucle_ambiance(y, longueur, FONDU)


def vent(longueur, rng):
    """Un vent doux qui va et vient (deux couleurs de bruit dont le mélange change lentement)."""
    n = int((longueur + FONDU) * SR)
    z = rng.standard_normal((n, 2))
    sourd, souffle = passe_bas(z, 350), passe_bande(z, 400, 1500)
    m = _lent(n, rng, 6, 14)[:, None]
    y = sourd * (0.8 - 0.3 * m) + souffle * 0.3 * m
    return boucle_ambiance(y * (0.6 + 0.4 * _lent(n, rng, 8, 16))[:, None], longueur, FONDU)


def eau(longueur, rng):
    """L'eau de la rivière : un flot doux qui va et vient, et de petites bulles (chacune enveloppée)."""
    n = int((longueur + FONDU) * SR)
    z = rng.standard_normal((n, 2))
    flot = passe_bande(z, 250, 1100) * (0.5 + 0.5 * _lent(n, rng, 2, 5))[:, None]
    clair = passe_bande(z, 1500, 4000) * 0.15 * _lent(n, rng, 1.5, 4)[:, None]
    y = flot / np.max(np.abs(flot)) * 0.5 + clair / np.max(np.abs(clair)) * 0.08
    t = 0.0
    while t < longueur + FONDU - 0.3:
        t += rng.exponential(0.5)
        m = int(0.12 * SR); tt = np.arange(m) / SR
        f0 = rng.uniform(500, 1400)
        f = f0 * (1 + 0.8 * (1 - np.exp(-tt / 0.025)))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * enveloppe(m, 0.003, 0.03)
        _evenement(y, t * SR, s * 10 ** rng.uniform(-1.6, -0.9), rng.uniform(0.2, 0.8))
    return boucle_ambiance(y, longueur, FONDU)
