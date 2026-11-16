"""Contrôle automatique de la bande-son : clics, saturation, niveaux, fondus, coutures de boucle.

Usage : python controle.py [dossier ...]   (par défaut : sortie/musique et sortie/bruitages)
Les WAV maîtres (avant MP3) servent à chercher les clics : au-dessus de 15 kHz il ne doit rien rester, donc le
moindre pic y est un défaut. Les MP3 décodés servent à vérifier saturation, crête et niveau (ce qu'on entend).
"""
import glob, json, os, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.ndimage import median_filter
from commun import SR, FFMPEG, SORTIE, CIBLE_MUSIQUE, CIBLE_BRUITAGE, CRETE_MAX, cible_bruitage, passe_haut, lufs, crete_vraie


def lire_wav(chemin):
    sr, x = wavfile.read(chemin)
    entier = x.dtype.kind == 'i'
    x = x.astype(np.float64)
    if entier: x = x / 32768.0
    return x if x.ndim > 1 else x[:, None]


def lire_mp3(chemin):
    r = subprocess.run([FFMPEG, '-loglevel', 'error', '-i', chemin, '-f', 'f32le', '-ar', str(SR), '-'], capture_output=True, check=True)
    x = np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)
    canaux = 2 if 'musique' in chemin else 1
    return x.reshape(-1, canaux)


def clics(x, seuil=8.0, plancher_db=-75):
    """Pics d'énergie au-dessus de 15 kHz : énergie par fenêtre de 128 échantillons, comparée à la médiane locale."""
    hf = passe_haut(x.mean(1), 15000, 8)
    n = len(hf) // 64
    e = np.array([np.sqrt(np.mean(hf[i * 64:i * 64 + 128] ** 2)) for i in range(n - 1)])
    med = median_filter(e, size=int(0.3 * SR / 64) | 1, mode='nearest') + 1e-12
    plancher = 10 ** (plancher_db / 20)
    idx = np.where((e > seuil * med) & (e > plancher))[0]
    temps = sorted(set(round(i * 64 / SR, 2) for i in idx))
    return temps, 20 * np.log10(np.max(e) + 1e-12)


def couture(x, debut, fin):
    """La boucle : le saut entre la fin et le début doit rester dans l'ordre de grandeur d'un échantillon à l'autre."""
    a, b = int(round(debut * SR)), int(round(fin * SR))
    saut = np.max(np.abs(x[b - 1] - x[a]))
    pas_typique = np.percentile(np.max(np.abs(np.diff(x[a:b], axis=0)), axis=1), 99.9)
    jonction = np.concatenate([x[b - 2048:b], x[a:a + 2048]])
    t, _ = clics(jonction, seuil=8.0)
    return saut, pas_typique, t


def controler(dossiers):
    lignes, defauts = [], 0
    for dossier in dossiers:
        musique = 'musique' in dossier
        cible = CIBLE_MUSIQUE if musique else CIBLE_BRUITAGE
        for wav in sorted(glob.glob(os.path.join(dossier, '*.wav'))):
            nom = os.path.splitext(os.path.basename(wav))[0]
            if not musique: cible = cible_bruitage(nom)
            mp3 = wav[:-4] + '.mp3'
            x = lire_wav(wav)
            y = lire_mp3(mp3) if os.path.exists(mp3) else x
            pb = []
            t_clics, hf_db = clics(x)
            if t_clics: pb.append(f'clics à {t_clics[:6]}')
            sat = int(np.sum(np.abs(y) >= 0.99))
            if sat: pb.append(f'{sat} échantillons saturés')
            tp = crete_vraie(y)
            if tp > CRETE_MAX + 0.6: pb.append(f'crête {tp:.1f} dBTP')
            info_boucle = ''
            if musique and os.path.exists(wav[:-4] + '.json'):
                b = json.load(open(wav[:-4] + '.json', encoding='utf-8'))
                l = lufs(x[int(b['debutBoucle'] * SR): int(b['finBoucle'] * SR)])
                saut, typique, tc = couture(x, b['debutBoucle'], b['finBoucle'])
                info_boucle = f"boucle {b['finBoucle'] - b['debutBoucle']:.1f} s, saut {saut:.4f} (typique {typique:.4f})"
                if saut > 3 * typique + 1e-4 or tc: pb.append('couture de boucle audible')
            else:
                l = lufs(y)
                bords = 20 * np.log10(max(np.max(np.abs(y[:int(0.002 * SR)])), np.max(np.abs(y[-int(0.002 * SR):])), 1e-9))
                if bords > -40: pb.append(f'début/fin pas en fondu ({bords:.0f} dB)')
            # Un son court et percutant atteint sa crête maximale avant la cible en LUFS : c'est physique, pas un défaut
            limite_par_crete = (not musique) and tp > CRETE_MAX - 1.5 and l < cible   # le MP3 abaisse la crête d'environ 1 dB
            if abs(l - cible) > 2.5 and not (limite_par_crete and l > cible - 12): pb.append(f'niveau {l:.1f} LUFS (cible {cible:.0f})')
            dc = float(np.max(np.abs(np.mean(y, axis=0))))
            if dc > 0.002: pb.append(f'continu {dc:.4f}')
            etat = 'OK ' if not pb else 'DÉFAUT'
            defauts += bool(pb)
            lignes.append(f"{etat:7}{nom:16}{l:7.1f} LUFS {tp:6.1f} dBTP  HF max {hf_db:6.1f} dB  {len(y) / SR:5.1f} s  {info_boucle}  {'; '.join(pb)}")
    rapport = '\n'.join(['Contrôle de la bande-son (clics > 15 kHz, saturation, crête vraie, niveaux, fondus, boucles)', ''] + lignes +
                        ['', f'{len(lignes)} fichiers, {defauts} en défaut.'])
    return rapport, defauts


if __name__ == '__main__':
    dossiers = sys.argv[1:] or [os.path.join(SORTIE, 'musique'), os.path.join(SORTIE, 'bruitages')]
    rapport, defauts = controler(dossiers)
    print(rapport)
    with open(os.path.join(SORTIE, 'rapport-controle.txt'), 'w', encoding='utf-8') as f: f.write(rapport + '\n')
    sys.exit(1 if defauts else 0)
