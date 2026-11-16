"""Livraison dans l'appli : public/audio/

  musique/<ambiance>.mp3   les quinze ambiances (stéréo, 80 kbit/s), chacune avec une demi-seconde de marge
                           prise dans la boucle elle-même : toute fenêtre de la bonne longueur boucle sans couture
  bruitages.mp3            tous les bruitages et leurs variantes, mis bout à bout (mono, 64 kbit/s), séparés par
                           0,3 s de silence : un seul téléchargement, un seul décodage
  index.json               la carte : points de boucle des ambiances, position de chaque bruitage dans la planche

Usage : python livrer.py   (après les scripts musiques/*.py et bruitages.py, et un contrôle sans défaut)
"""
import glob, json, os, shutil, subprocess
import numpy as np
from scipy.io import wavfile
from commun import SR, SORTIE, FFMPEG, ICI

PUBLIC = os.path.normpath(os.path.join(ICI, '..', '..', 'public', 'audio'))
ECART = 0.3


def livrer():
    os.makedirs(os.path.join(PUBLIC, 'musique'), exist_ok=True)
    index = {'version': 1, 'musique': {}, 'bruitages': {}}
    # Les ambiances
    for js in sorted(glob.glob(os.path.join(SORTIE, 'musique', '*.json'))):
        nom = os.path.splitext(os.path.basename(js))[0]
        info = json.load(open(js, encoding='utf-8'))
        shutil.copy(os.path.join(SORTIE, 'musique', nom + '.mp3'), os.path.join(PUBLIC, 'musique', nom + '.mp3'))
        index['musique'][nom] = {'fichier': 'musique/' + nom + '.mp3', 'debutBoucle': info['debutBoucle'], 'finBoucle': info['finBoucle']}
    # La planche des bruitages
    carte = json.load(open(os.path.join(SORTIE, 'bruitages', 'bruitages.json'), encoding='utf-8'))
    morceaux, t, sons = [], ECART, {}
    morceaux.append(np.zeros(int(ECART * SR)))
    for nom, fichiers in carte.items():
        sons[nom] = []
        for f in fichiers:
            _, x = wavfile.read(os.path.join(SORTIE, 'bruitages', f.replace('.mp3', '.wav')))
            x = x.astype(np.float64)
            sons[nom].append([round(t, 4), round(len(x) / SR, 4)])
            morceaux += [x, np.zeros(int(ECART * SR))]
            t += len(x) / SR + ECART
    planche = np.concatenate(morceaux)
    tmp = os.path.join(SORTIE, 'tmp', 'bruitages.wav')
    wavfile.write(tmp, SR, planche.astype(np.float32))
    subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k', os.path.join(PUBLIC, 'bruitages.mp3')], check=True)
    index['bruitages'] = {'fichier': 'bruitages.mp3', 'duree': round(len(planche) / SR, 4), 'sons': sons}
    with open(os.path.join(PUBLIC, 'index.json'), 'w', encoding='utf-8') as fp:
        json.dump(index, fp, ensure_ascii=False, separators=(',', ':'))
    total = sum(os.path.getsize(f) for f in glob.glob(os.path.join(PUBLIC, '**', '*.*'), recursive=True))
    print(f"{len(index['musique'])} ambiances, {sum(len(v) for v in sons.values())} bruitages ({len(sons)} noms), {total / 1e6:.1f} Mo au total")


if __name__ == '__main__':
    livrer()
