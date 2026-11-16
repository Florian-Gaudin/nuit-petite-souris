"""Les bruitages, refaits dans l'univers du conte : bois, parchemin, eau, animaux, magie.
Chaque son est synthétisé (ou rendu par FluidSynth pour les instruments), enveloppé, filtré en une passe,
mis au niveau par un seul gain. Les sons fréquents ont plusieurs variantes (nom-1, nom-2…)."""
import os, json
import numpy as np
from commun import (SR, SORTIE, Partition, rendre, passe_bas, passe_haut, passe_bande, enveloppe, cosinus, fondus,
                    finition, niveau, ecrire, CIBLE_BRUITAGE, cible_bruitage)

DOSSIER = os.path.join(SORTIE, 'bruitages')


def silence(d): return np.zeros(int(d * SR))


def place(y, x, t):
    i = max(0, int(t * SR)); m = min(len(x), len(y) - i)
    if m > 0: y[i:i + m] += x[:m]
    return y


def modes(freqs, decl, dur, rng, amps=None):
    """Synthèse modale : quelques résonances amorties (bois, métal, verre)."""
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for k, (f, d) in enumerate(zip(freqs, decl)):
        a = (amps[k] if amps is not None else 1 / (k + 1))
        y += a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * np.exp(-t / d)
    return y * enveloppe(n, 0.0008, dur, forme=2)


# ---------------- Interface : un petit coup de bois très doux ----------------
def clic(rng, k):
    base = [1250, 1400, 1150, 1320][k]
    y = modes([base, base * 2.32, base * 3.71], [0.022, 0.012, 0.007], 0.09, rng, [1, 0.45, 0.2])
    frappe = passe_bande(rng.standard_normal(len(y)), 1500, 5000) * enveloppe(len(y), 0.0005, 0.004)
    return passe_bas(y + frappe * 0.25, 9000)


# ---------------- La page du livre : un souffle de papier doux, qui ondule, puis se pose ----------------
def page(rng, k):
    d = 0.62 + 0.06 * k; n = int(d * SR); t = np.arange(n) / SR; x = t / d
    z = rng.standard_normal(n)
    # Le souffle : du bruit feutré (médiums seulement, rien de sifflant), qui monte puis retombe
    souffle = passe_bande(z, 350, 2200) * 0.9 + passe_bande(z, 2200, 3800) * 0.18
    corps = np.sin(np.pi * np.clip(x / 0.85, 0, 1)) ** 2
    # La feuille ondule en passant : une légère palpitation qui ralentit
    ondule = 0.75 + 0.25 * np.sin(2 * np.pi * (14 - 6 * x) * t + rng.uniform(0, 6.28))
    y = souffle * corps * ondule
    # Deux ou trois frôlements de papier, arrondis (pas de crépitement)
    for _ in range(3):
        m = int(rng.uniform(0.03, 0.05) * SR); c = rng.uniform(0.2, 0.6)
        f = passe_bande(rng.standard_normal(m), 900, 3000) * np.sin(np.pi * np.arange(m) / m) ** 2
        y = place(y, f * rng.uniform(0.25, 0.4), c * d)
    # La feuille se pose : un petit « flap » sourd
    m = int(0.12 * SR)
    pose = passe_bas(rng.standard_normal(m), 450) * enveloppe(m, 0.004, 0.035)
    y = place(np.concatenate([y, silence(0.12)]), pose * 0.7, d * 0.82)
    return passe_bas(y, 5000)


# ---------------- L'eau : une goutte dans la rivière ----------------
def plouf(rng, k):
    d = 0.7; n = int(d * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    # La bulle : une résonance dont la hauteur monte vite (c'est ce qui fait « plouc »)
    for j, (f0, a, t0) in enumerate([(380 + 40 * k, 1.0, 0.0), (700 + 60 * k, 0.35, 0.09), (1100, 0.2, 0.16)]):
        m = int(0.25 * SR); tt = np.arange(m) / SR
        f = f0 * (1 + 1.6 * (1 - np.exp(-tt / 0.03)))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * enveloppe(m, 0.002, 0.04 + 0.02 * j)
        y = place(y, s * a, t0 + rng.uniform(0, 0.01))
    eclabousse = passe_bande(rng.standard_normal(n), 900, 4500) * enveloppe(n, 0.002, 0.05) * 0.35
    retombe = np.zeros(n)
    for _ in range(6):
        m = int(0.03 * SR); s = passe_bande(rng.standard_normal(m + 400), 1500, 5000)[200:200 + m] * enveloppe(m, 0.001, 0.008)
        retombe = place(retombe, s * rng.uniform(0.1, 0.3), rng.uniform(0.12, 0.45))
    return y + eclabousse + retombe


# ---------------- La hulotte : « hou… hou-hou-houuu », douce et lointaine ----------------
def hulotte(rng, k):
    y = np.zeros(int(2.6 * SR))
    def hou(d, f0, f1, vib=0.0):
        m = int(d * SR); tt = np.arange(m) / SR
        f = np.linspace(f0, f1, m) * (1 + vib * np.sin(2 * np.pi * 9 * tt))
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
        souffle = passe_bande(rng.standard_normal(m), 300, 900) * 0.06
        return (s + souffle) * (np.sin(np.pi * tt / tt[-1]) ** 1.2)
    place(y, hou(0.55, 430, 410), 0.05)
    place(y, hou(0.18, 400, 395), 0.95)
    place(y, hou(0.9, 410, 360, vib=0.025), 1.25)
    return passe_bas(y, 2400)


# ---------------- Les pas : de petites pattes sur le plancher ----------------
def pas(rng, k):
    d = 0.12; n = int(d * SR)
    corps = passe_bande(rng.standard_normal(n), 180 + 30 * k, 900 + 80 * k) * enveloppe(n, 0.002, 0.018)
    frotte = passe_bande(rng.standard_normal(n), 1500, 4000) * enveloppe(n, 0.004, 0.01) * 0.12
    bois = modes([320 + 25 * k, 760 + 40 * k], [0.02, 0.01], d, rng, [0.3, 0.1])
    return corps + frotte + bois


# ---------------- Rendus d'instruments (harpe, célesta, clochettes) ----------------
def instruments(nom, notes, duree, tempo=120, gain=0.4, bends=(), salle=0.6):
    """notes : (piste, programme, note, début (temps), durée, vélocité) ; bends : (piste, début, durée, demi-tons,
    amplitude du pitch bend) pour les glissés (violon qui hennit, flûte qui s'envole…)."""
    p = Partition(tempo)
    vues = {}
    amplitude = {b_[0]: b_[4] for b_ in bends}
    for piste, prog, *_ in notes:
        if piste not in vues:
            canal = len(vues) + (1 if len(vues) >= 9 else 0)
            p.piste(piste, canal, prog, 100, 64, 70, bend=amplitude.get(piste, 2)); vues[piste] = True
    for piste, prog, n, t, d, v in notes:
        p.note(piste, t, n, d, v)
    for piste, t, d, de, amp in bends:
        c, ev = p.pistes[piste]
        import mido as _m
        pas = 24
        for k in range(pas + 1):
            x = k / pas
            v = int(8191 * de / amp * (0.5 - 0.5 * np.cos(np.pi * x)))
            ev.append((int(round((t + d * x) * 480)), 0, _m.Message('pitchwheel', channel=c, pitch=max(-8192, min(8191, v)))))
    x = rendre(p, 'sfx_' + nom, gain=gain, salle=salle, niveau=0.5)
    return x.mean(1)[: int(duree * SR)]


def badge(rng, k):
    notes = [('harpe', 46, n, i * 0.12, 2, 90 - i * 4) for i, n in enumerate(['D4', 'F#4', 'A4', 'D5', 'F#5'])]
    notes += [('celesta', 8, 'A5', 0.75, 2, 80), ('celesta', 8, 'D6', 0.9, 2, 76), ('cloche', 9, 'F#6', 1.0, 1.5, 50)]
    return instruments('badge', notes, 2.4)


def lanterne(rng, k):
    # La mèche s'allume (un souffle doux), puis la flamme chante : deux notes chaudes de harpe et de célesta
    n = int(1.8 * SR)
    souffle = passe_bande(rng.standard_normal(n), 250, 1400) * enveloppe(n, 0.08, 0.12) * 0.5
    musique = instruments('lanterne', [('harpe', 46, 'A4', 0.25, 2, 82), ('harpe', 46, 'E5', 0.4, 2, 78), ('celesta', 8, 'A5', 0.42, 2, 64)], 1.8)
    m = min(len(musique), n)
    return souffle[:m] / (np.max(np.abs(souffle)) + 1e-9) * 0.25 + musique[:m] / (np.max(np.abs(musique)) + 1e-9)


# ---------------- Le galop de Bayard : sabots sur la terre battue ----------------
def galop(rng, k):
    y = np.zeros(int(1.5 * SR))
    def sabot(fort):
        m = int(0.09 * SR)
        coup = passe_bande(rng.standard_normal(m), 70, 380) * enveloppe(m, 0.0015, 0.03)
        clac = passe_bande(rng.standard_normal(m), 900, 2800) * enveloppe(m, 0.0008, 0.006) * 0.25
        return (coup + clac) * fort
    for cycle in range(3):
        base = cycle * 0.42
        for dt, fort in ((0.0, 0.7), (0.07, 0.8), (0.15, 1.0)):     # ta-ta-DOUM
            place(y, sabot(fort * rng.uniform(0.9, 1.05)), 0.02 + base + dt + rng.uniform(0, 0.008))
    return y


# ---------------- Le ronron : un ronronnement doux, inspiration et expiration ----------------
def ronron(rng, k):
    d = 2.6; n = int(d * SR); t = np.arange(n) / SR
    z = rng.standard_normal(n)
    grave, voile = passe_bas(z, 260), passe_bande(z, 250, 700)
    # Deux souffles (inspire / expire), aux pulsations un peu différentes, en courbes douces
    resp = np.zeros(n); rate = np.zeros(n)
    for a, b, r in ((0.0, 1.15, 26.0), (1.25, 2.55, 23.0)):
        i, j = int(a * SR), int(b * SR)
        resp[i:j] = np.sin(np.linspace(0, np.pi, j - i)) ** 0.8
        rate[i:j] = r
    ph = 2 * np.pi * np.cumsum(rate) / SR
    pouls = (0.5 - 0.5 * np.cos(ph)) ** 2
    return (grave * 1.0 + voile * 0.25) * pouls * resp


# ---------------- Le cachet de cire : on le brise pour ouvrir la lettre ----------------
def cachet(rng, k):
    d = 0.6; y = np.zeros(int(d * SR))
    for j in range(2 + k):
        m = int(0.02 * SR)
        s = passe_bande(rng.standard_normal(m + 600), 1200, 5500)[300:300 + m] * enveloppe(m, 0.0005, 0.004)
        place(y, s * rng.uniform(0.6, 1.0), 0.05 + j * rng.uniform(0.025, 0.05))
    m = int(0.35 * SR)
    papier = passe_bande(rng.standard_normal(m), 1500, 5000) * enveloppe(m, 0.03, 0.08) * 0.25
    place(y, papier, 0.18)
    m = int(0.12 * SR)
    sourd = passe_bas(rng.standard_normal(m), 400) * enveloppe(m, 0.002, 0.03) * 0.5
    place(y, sourd, 0.04)
    return y


def produire(noms=None, dossier=DOSSIER):
    carte = os.path.join(dossier, 'bruitages.json')
    infos = json.load(open(carte, encoding='utf-8')) if noms and os.path.exists(carte) else {}
    for nom in noms or []: infos.pop(nom, None)
    for nom, (f, nb) in BRUITAGES.items():
        if noms and nom not in noms: continue
        for k in range(nb):
            rng = np.random.default_rng(1000 + 17 * k + len(nom))
            x = f(rng, k)
            x = np.concatenate([silence(0.015), x, silence(0.06)])
            x = finition(x)
            x = fondus(x, 3, 30)
            x = niveau(x, cible_bruitage(nom))
            fichier = nom + (f'-{k + 1}' if nb > 1 else '')
            ecrire(fichier, x, dossier, debit='64k', mono=True)
            infos.setdefault(nom, []).append(fichier + '.mp3')
    infos = {nom: infos[nom] for nom in BRUITAGES if nom in infos}
    with open(carte, 'w', encoding='utf-8') as fp:
        json.dump(infos, fp, ensure_ascii=False, indent=2)
    return infos




# =====================================================================================================
# La suite de l'inventaire (tous les noms appelés par l'appli, sauf « concert », qui reste en code)
# =====================================================================================================

def _salve(rng, dur, a, b, attaque=0.0005, declin=0.004):
    """Une petite salve de bruit, filtrée entière avec sa marge, puis enveloppée (aucun bord franc)."""
    m, marge = int(dur * SR), int(0.008 * SR)
    s = np.zeros(m + 2 * marge); s[marge:marge + m] = rng.standard_normal(m) * enveloppe(m, attaque, declin)
    s = passe_bande(s, a, b)
    bord = cosinus(marge); s[:marge] *= bord; s[-marge:] *= bord[::-1]
    return s


def _froisse(rng, d, n_crete, a=1800, b=7000, centre=0.5, large=0.35):
    """Du papier ou des feuilles : un souffle en cloche et de petites crêtes."""
    n = int(d * SR); x = np.arange(n) / n
    y = passe_bande(rng.standard_normal(n), a * 0.6, b * 0.7) * np.exp(-((x - centre) / large) ** 2) * 0.35
    for _ in range(n_crete):
        t = np.clip(rng.normal(centre, large / 1.6), 0.02, 0.9) * d
        place(y, _salve(rng, rng.uniform(0.003, 0.014), a, b) * rng.uniform(0.3, 1.0), t)
    return y


def _melange(*couches):
    """Additionne des sons de longueurs différentes, chacun ramené à sa crête (avec son poids)."""
    n = max(len(c) for c, _ in couches); y = np.zeros(n)
    for c, w in couches: y[:len(c)] += c / (np.max(np.abs(c)) + 1e-9) * w
    return y


# ---------------- Interface ----------------
def toc(rng, k):                      # un « toc » de bois, un peu plus grave que le clic
    base = [620, 700, 560][k]
    return passe_bas(modes([base, base * 2.6, base * 4.1], [0.05, 0.02, 0.01], 0.16, rng, [1, 0.4, 0.15]), 7000)


def pointe(rng, k):                   # la pointe d'un pied de pantin sur le plancher : un tout petit tic
    return modes([1900, 3100], [0.012, 0.006], 0.06, rng, [0.6, 0.2])


def bip(rng, k):                      # la caméra : un « tic » de cristal, très doux (plus aucun bip électronique)
    f = [2350, 2620][k]
    return modes([f, f * 2.76], [0.08, 0.03], 0.25, rng, [0.5, 0.15])


# ---------------- Papier, écriture ----------------
def papier(rng, k):
    return _froisse(rng, 0.35 + 0.05 * k, 9 + 2 * k)


def pli(rng, k):
    y = _froisse(rng, 0.3, 5, 2200, 7500, 0.3, 0.2)
    place(y, _salve(rng, 0.012, 1500, 6000) * 0.9, 0.12); place(y, _salve(rng, 0.01, 1800, 6500) * 0.7, 0.2)
    return y


def crayon(rng, k):                   # mine de crayon sur le papier : un grattement granuleux
    n = int(0.11 * SR); y = np.zeros(n)
    for _ in range(18):
        place(y, _salve(rng, rng.uniform(0.002, 0.005), 2500, 6500) * rng.uniform(0.3, 1), rng.uniform(0.0, 0.09))
    return y * enveloppe(n, 0.01, 0.05)


def plume(rng, k):                    # une plume qui vole : un souffle très doux
    n = int(0.7 * SR)
    return passe_bande(rng.standard_normal(n), 600, 3000) * np.sin(np.pi * np.arange(n) / n) ** 2 * 0.4


# ---------------- Matières ----------------
def bois(rng, k):                     # une planche, un panneau : un bon coup de bois
    y = modes([210, 470, 960, 1650], [0.09, 0.05, 0.025, 0.012], 0.35, rng, [1, 0.6, 0.3, 0.15])
    return y + passe_bas(rng.standard_normal(len(y)), 500) * enveloppe(len(y), 0.001, 0.02) * 0.3


def buisson(rng, k):
    n = int(0.55 * SR)
    return _froisse(rng, 0.55, 30, 1000, 6000, 0.45, 0.3) + passe_bas(rng.standard_normal(n), 400) * enveloppe(n, 0.05, 0.12) * 0.15


def croque(rng, k):                   # une bouchée de galette : croustillant
    y = np.zeros(int(0.3 * SR))
    for j in range(2):
        for _ in range(9):
            place(y, _salve(rng, rng.uniform(0.003, 0.01), 900, 5000) * rng.uniform(0.3, 1), j * 0.13 + rng.uniform(0, 0.05))
    return y


def grince(rng, k):                   # du bois qui grince : frottements collés-glissés, de plus en plus rapides
    d = 0.8; n = int(d * SR); t = np.arange(n) / SR
    rate = 28 + 40 * t / d + 6 * np.sin(2 * np.pi * 3 * t)
    ph = np.cumsum(rate) / SR
    trains = np.zeros(n); m = int(0.006 * SR)
    impulsion = np.exp(-np.arange(m) / (0.0012 * SR)) * cosinus(m)[::-1]
    for i in np.where(np.diff(np.floor(ph)) > 0)[0]:
        place(trains, impulsion, i / SR)
    y = passe_bande(trains, 350, 1400) + passe_bande(trains, 1800, 2600) * 0.3
    return y * np.sin(np.pi * t / d) ** 0.7


def gresille(rng, k):                 # la flamme d'une lanterne qui crachote
    y = np.zeros(int(0.45 * SR))
    for _ in range(9):
        place(y, _salve(rng, rng.uniform(0.002, 0.008), 1200, 5500) * rng.uniform(0.2, 1), rng.uniform(0, 0.38))
    return y + passe_bande(rng.standard_normal(len(y)), 300, 1200) * enveloppe(len(y), 0.05, 0.15) * 0.08


def girouette(rng, k):                # une vieille girouette de métal qui tourne, puis tinte
    y = np.zeros(int(1.2 * SR))
    for j, tt in enumerate([0, 0.12, 0.22, 0.3, 0.37, 0.43, 0.49]):
        place(y, modes([2900 + 40 * j, 4300], [0.02, 0.01], 0.05, rng, [0.4, 0.15]), tt + 0.01)
    place(y, modes([1180, 2950, 4150], [0.5, 0.25, 0.12], 1.0, rng, [0.5, 0.2, 0.1]), 0.6)
    return y


def bruleur(rng, k):                  # le brûleur de la montgolfière : une grande flamme qui souffle
    d = 1.1; n = int(d * SR); t = np.arange(n) / SR
    rugit = passe_bas(rng.standard_normal(n), 260) * (1 + 0.25 * np.sin(2 * np.pi * 13 * t))
    souffle = passe_bande(rng.standard_normal(n), 500, 2200) * 0.3
    return (rugit + souffle) * enveloppe(n, 0.06, 0.35)


def ressort(rng, k):                  # une guimbarde : « boïng », comique mais organique
    d = 0.6; n = int(d * SR); t = np.arange(n) / SR
    son = sum(np.sin(2 * np.pi * 98 * h * t) / h for h in range(1, 12))
    y = np.zeros(n)
    for lo, hi, w, phase in ((400, 900, 1.0, 0.0), (900, 2000, 0.6, np.pi)):
        y += passe_bande(son, lo, hi) * w * (0.5 + 0.5 * np.sin(2 * np.pi * t / 0.35 + phase))
    return y * enveloppe(n, 0.003, 0.25)


# ---------------- L'eau ----------------
def _goutte(f0, dur, declin, montee=0.7, tau=0.02):
    m = int(dur * SR); tt = np.arange(m) / SR
    return np.sin(2 * np.pi * np.cumsum(f0 * (1 + montee * (1 - np.exp(-tt / tau)))) / SR) * enveloppe(m, 0.002, declin)


def eau(rng, k):                      # un petit clapotis
    d = 0.9; n = int(d * SR)
    y = passe_bande(rng.standard_normal(n), 300, 1500) * np.sin(np.pi * np.arange(n) / n) ** 1.5 * 0.3
    for _ in range(7):
        place(y, _goutte(rng.uniform(600, 1500), 0.08, 0.02) * rng.uniform(0.2, 0.5), rng.uniform(0.05, 0.75))
    return y


def ronds(rng, k):                    # des ronds dans l'eau : trois petites gouttes qui s'éloignent
    y = np.zeros(int(1.0 * SR))
    for j, (f, a) in enumerate([(1250, 0.8), (980, 0.5), (760, 0.3)]):
        place(y, _goutte(f, 0.18, 0.05, 0.5) * a, 0.02 + j * 0.22)
    return y


# ---------------- La magie (harpe, célesta, clochettes) ----------------
def etoile(rng, k):
    return instruments('etoile', [('celesta', 8, n, i * 0.14, 1.5, 78 - i * 4) for i, n in enumerate(['A5', 'C#6', 'E6'])] + [('glock', 9, 'A6', 0.45, 1.5, 44)], 1.7)


def allume(rng, k):
    return instruments('allume', [('harpe', 46, 'D5', 0, 2, 80), ('harpe', 46, 'A5', 0.18, 2, 74), ('glock', 9, 'D6', 0.3, 1.5, 36)], 1.6)


def champignon(rng, k):
    return instruments('champignon%d' % k, [('celesta', 8, n, i * 0.1, 1.2, 74) for i, n in enumerate(['E5', 'G#5', 'B5'][: 2 + k % 2])], 1.3)


def luciole(rng, k):
    return instruments('luciole', [('glock', 9, 'E7', 0, 0.8, 38), ('celesta', 8, 'B6', 0.08, 0.8, 50)], 0.9)


def filante(rng, k):
    n = int(1.4 * SR)
    souffle = passe_bande(rng.standard_normal(n), 2000, 7000) * enveloppe(n, 0.05, 0.3)
    m = instruments('filante', [('celesta', 8, nn, i * 0.07, 0.9, 70 - i * 5) for i, nn in enumerate(['E7', 'C#7', 'A6', 'F#6', 'E6', 'C#6'])], 1.4)
    return _melange((m, 1.0), (souffle, 0.2))


def harpe(rng, k):
    return instruments('harpe', [('harpe', 46, nn, i * 0.06, 1.8, 74) for i, nn in enumerate(['D3', 'F3', 'A3', 'C4', 'D4', 'F4', 'A4', 'C5', 'D5'])], 1.6)


def accord(rng, k):
    return instruments('accord', [('harpe', 46, nn, i * 0.05, 2.5, 70) for i, nn in enumerate(['G2', 'D3', 'G3', 'B3', 'D4'])] + [('cordes', 48, nn, 0, 2.5, 50) for nn in ('G3', 'B3', 'D4')], 2.2)


# ---------------- Fanfares et signaux ----------------
def fanfare(rng, k):
    rythme = (('D5', 0, .25), ('D5', .25, .25), ('F#5', .5, .25), ('A5', .75, .75), ('F#5', 1.5, .25), ('A5', 1.75, .25), ('D6', 2, 1.2))
    tierce = (('F#4', 0, .25), ('F#4', .25, .25), ('A4', .5, .25), ('D5', .75, .75), ('A4', 1.5, .25), ('D5', 1.75, .25), ('F#5', 2, 1.2))
    notes = [('flute', 74, n, t, d, 84) for n, t, d in rythme] + [('flute2', 74, n, t, d, 70) for n, t, d in tierce]
    notes += [('harpe', 46, n, 2 + i * 0.05, 2, 70) for i, n in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4'])]
    return instruments('fanfare', notes, 2.4, tempo=110)


def trompette(rng, k):                # un cor de chasse au loin (le secret du château de Sedan)
    return instruments('trompette', [('cor', 60, n, t, d, 86) for n, t, d in (('G3', 0, .4), ('C4', .45, .4), ('E4', .9, .4), ('G4', 1.35, 1.4))], 2.3, tempo=100, salle=0.9)


def alerte(rng, k):
    return instruments('alerte', [('cloche', 9, n, i * 0.22, 1, 56) for i, n in enumerate(['E6', 'C6', 'E6'])], 1.4)


# ---------------- Le théâtre ----------------
def coup(rng, k):                     # le brigadier : un bâton frappé sur le plancher de la scène
    d = 0.6; n = int(d * SR)
    sourd = passe_bas(rng.standard_normal(n), 180) * enveloppe(n, 0.002, 0.08)
    planche = modes([140, 330, 610], [0.12, 0.06, 0.03], d, rng, [0.7, 0.4, 0.2])
    y = sourd * 0.9 + planche
    return place(y, _salve(rng, 0.006, 600, 2500) * 0.3, 0.0)


def _coup_note(rng, note, extra=()):
    m = instruments('coup_' + note, [('harpe', 46, note, 0.1, 2, 70)] + list(extra), 1.6)
    return _melange((coup(rng, 0), 1.0), (m, 0.45))


def coup1(rng, k): return _coup_note(rng, 'G3')
def coup2(rng, k): return _coup_note(rng, 'B3')
def coup3(rng, k): return _coup_note(rng, 'D4', [('harpe', 46, n, 0.6 + i * 0.05, 2, 66) for i, n in enumerate(['G2', 'D3', 'G3', 'B3', 'D4'])])


def tambour(rng, k):                  # un roulement de tambourin, puis un coup sourd
    y = np.zeros(int(0.9 * SR))
    for i in range(12):
        place(y, _salve(rng, 0.03, 150, 900, 0.001, 0.012) * (0.25 + i * 0.04), 0.01 + i * 0.042)
    m = int(0.35 * SR)
    place(y, passe_bas(rng.standard_normal(m), 160) * enveloppe(m, 0.002, 0.08), 0.52)
    return y


def contrebasse(rng, k): return instruments('contrebasse', [('basse', 32, 'A2', 0, 1.0, 96)], 1.0, bends=[('basse', 0.15, 0.6, -5, 12)])
def flute(rng, k): return instruments('flute', [('flute', 74, 'E5', 0, 0.9, 80)], 1.0, bends=[('flute', 0.05, 0.4, 4, 12)])
def pantin(rng, k): return instruments('pantin', [('dulcimer', 15, n, i * 0.14, 0.4, 82) for i, n in enumerate(['G5', 'B5', 'G5', 'D6'])], 1.0)


def oh(rng, k):                       # le public : « oh ! »
    return instruments('oh', [('choeur', 52, n, 0, 0.9, 74) for n in ('C4', 'E4', 'G4')], 1.2, bends=[('choeur', 0.2, 0.7, -3, 12)])


def rires(rng, k):                    # des rires d'enfants, joliment stylisés : une flûte qui pouffe en cascade
    return instruments('rires', [('flute', 74, n, i * 0.11, 0.08, 72) for i, n in enumerate(['A5', 'G5', 'A5', 'F5', 'G5', 'E5', 'D5'])] +
                       [('pizz', 45, n, i * 0.11 + 0.05, 0.08, 58) for i, n in enumerate(['E5', 'D5', 'E5', 'C5'])], 1.2)


def applaudir(rng, k):                # des applaudissements : des dizaines de mains, chaque claquement enveloppé
    y = np.zeros(int(2.2 * SR))
    for _ in range(140):
        place(y, _salve(rng, 0.012, rng.uniform(800, 1400), rng.uniform(2200, 4200), 0.0008, 0.004) * rng.uniform(0.2, 1), rng.uniform(0.01, 1.8))
    return y * enveloppe(len(y), 0.15, 0.6)


def sifflet(rng, k):                  # quelqu'un siffle d'admiration
    d = 0.75; n = int(d * SR); t = np.arange(n) / SR
    f = np.where(t < 0.3, 1100 + 1500 * t / 0.3, 1600 - 500 * (t - 0.3) / 0.45) * (1 + 0.01 * np.sin(2 * np.pi * 6 * t))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + passe_bande(rng.standard_normal(n), 1000, 3000) * 0.06
    return s * enveloppe(n, 0.03, 0.25)


def foule(rng, k):                    # le brouhaha du public
    d = 1.5; n = int(d * SR); y = np.zeros(n); t = np.arange(n) / SR
    for _ in range(14):
        f1 = rng.uniform(400, 800)
        mod = (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(3, 6) * t + rng.uniform(0, 6))) ** 2
        y += passe_bande(rng.standard_normal(n), f1, f1 * 2.2) * mod
    return y * np.sin(np.pi * np.arange(n) / n) ** 0.8


def hourra(rng, k):
    m = instruments('hourra', [('choeur', 52, n, 0, 1.1, 82) for n in ('D4', 'F#4', 'A4', 'D5')], 1.4, bends=[('choeur', 0.0, 0.4, 3, 12)])
    return _melange((m, 1.0), (foule(rng, 0)[:len(m)], 0.35))


def hennir(rng, k):                   # Bayard hennit : un violon qui glisse (jolie stylisation)
    return instruments('hennir', [('violon', 40, 'A5', 0, 1.0, 90)], 1.2, bends=[('violon', 0.0, 0.3, 4, 12), ('violon', 0.3, 0.6, -9, 12)])


# ---------------- Les animaux et Quenotte ----------------
def _voix_animal(rng, d, f_debut, f_fin, formants, vib=0.0, souffle=0.08):
    n = int(d * SR); t = np.arange(n) / SR
    f = np.linspace(f_debut, f_fin, n) * (1 + vib * np.sin(2 * np.pi * 7 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    source = sum(np.sin(ph * h) / h ** 1.2 for h in range(1, 14))
    y = sum(passe_bande(source, lo, hi) * g for lo, hi, g in formants)
    y = y + passe_bande(rng.standard_normal(n), 400, 2500) * souffle
    return y * np.sin(np.pi * t / d) ** 0.9


def renard(rng, k):                   # deux petits jappements de renard, doux
    y = np.zeros(int(0.7 * SR))
    for j in range(2):
        place(y, _voix_animal(rng, 0.13, 820, 600, [(700, 1300, 1), (1800, 2800, 0.4)], souffle=0.15), 0.02 + j * 0.24)
    return y


def pigeon(rng, k):                   # « rou-cou-couu »
    y = np.zeros(int(1.1 * SR))
    for j, (d, f0, f1) in enumerate([(0.18, 420, 440), (0.14, 430, 450), (0.38, 440, 380)]):
        place(y, _voix_animal(rng, d, f0, f1, [(250, 600, 1), (700, 1100, 0.3)], vib=0.03, souffle=0.03), [0.02, 0.25, 0.45][j])
    return passe_bas(y, 2500)


def oies(rng, k):                     # des oies sauvages, au loin
    y = np.zeros(int(1.2 * SR))
    for j, t in enumerate([0.02, 0.3, 0.52, 0.85]):
        place(y, _voix_animal(rng, 0.14, 360 + 20 * j, 330, [(500, 1100, 1), (1300, 2200, 0.5)], souffle=0.05) * (1 - 0.15 * j), t)
    return passe_bas(y, 3000)


def grogne(rng, k):                   # le sanglier réveillé : deux grognements courts, ronds
    y = np.zeros(int(0.6 * SR))
    for j in range(2):
        place(y, _voix_animal(rng, 0.16, 105, 90, [(150, 450, 1), (500, 900, 0.35)], vib=0.08, souffle=0.12), 0.02 + j * 0.22)
    return y


def mmh(rng, k):                      # Quenotte se régale : « mmh ! » (voix douces, deux notes qui montent)
    return instruments('mmh', [('voix', 53, 'E4', 0, 0.25, 70), ('voix', 53, 'A4', 0.25, 0.45, 74)], 0.85)


def baillement(rng, k):               # le chat bâille : un alto qui monte puis retombe, et un souffle
    m = instruments('baillement', [('alto', 41, 'D4', 0, 1.1, 70)], 1.3, bends=[('alto', 0.0, 0.6, 5, 12)])
    n = len(m); souffle = passe_bande(rng.standard_normal(n), 300, 1500) * np.sin(np.pi * np.arange(n) / n) ** 2
    return _melange((m, 1.0), (souffle, 0.25))


def ronfle(rng, k):                   # le ronflement du chat (joué en boucle par l'appli pendant qu'il dort)
    d = 2.2; n = int(d * SR); t = np.arange(n) / SR
    y = np.zeros(n); i1 = int(1.1 * SR)
    y[:i1] += passe_bas(rng.standard_normal(i1), 220) * (0.5 - 0.5 * np.cos(2 * np.pi * 32 * t[:i1])) ** 2 * np.sin(np.pi * t[:i1] / 1.1) ** 1.2
    m = int(0.9 * SR)
    place(y, passe_bande(rng.standard_normal(m), 400, 1400) * np.sin(np.pi * np.arange(m) / m) ** 1.5 * 0.25, 1.2)
    return y


BRUITAGES = {
    'clic': (clic, 4), 'page': (page, 2), 'plouf': (plouf, 3), 'hulotte': (hulotte, 1), 'pas': (pas, 5),
    'badge': (badge, 1), 'lanterne': (lanterne, 1), 'galop': (galop, 1), 'ronron': (ronron, 1), 'cachet': (cachet, 2),
    'toc': (toc, 3), 'pointe': (pointe, 1), 'bip': (bip, 2), 'papier': (papier, 3), 'pli': (pli, 2), 'crayon': (crayon, 4),
    'plume': (plume, 1), 'bois': (bois, 1), 'buisson': (buisson, 3), 'croque': (croque, 2), 'grince': (grince, 1),
    'gresille': (gresille, 1), 'girouette': (girouette, 1), 'bruleur': (bruleur, 1), 'ressort': (ressort, 1),
    'eau': (eau, 2), 'ronds': (ronds, 1), 'etoile': (etoile, 1), 'allume': (allume, 1), 'champignon': (champignon, 2),
    'luciole': (luciole, 1), 'filante': (filante, 1), 'harpe': (harpe, 1), 'accord': (accord, 1), 'fanfare': (fanfare, 1),
    'trompette': (trompette, 1), 'alerte': (alerte, 1), 'coup': (coup, 1), 'coup1': (coup1, 1), 'coup2': (coup2, 1),
    'coup3': (coup3, 1), 'tambour': (tambour, 1), 'contrebasse': (contrebasse, 1), 'flute': (flute, 1), 'pantin': (pantin, 1),
    'oh': (oh, 1), 'rires': (rires, 1), 'applaudir': (applaudir, 1), 'sifflet': (sifflet, 1), 'foule': (foule, 1),
    'hourra': (hourra, 1), 'hennir': (hennir, 1), 'renard': (renard, 1), 'pigeon': (pigeon, 1), 'oies': (oies, 1),
    'grogne': (grogne, 1), 'mmh': (mmh, 1), 'baillement': (baillement, 1), 'ronfle': (ronfle, 1),
}


if __name__ == '__main__':
    import sys
    print(produire(sys.argv[1:] or None))
