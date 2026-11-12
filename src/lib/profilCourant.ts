// Quel profil raconter ? Dans l'ordre :
// 1. celui de l'adresse (#p=…, le QR code vient d'être scanné), mémorisé pour les visites suivantes ;
// 2. sinon, sur la page de l'histoire : l'écran de choix (reprendre le dernier profil, l'exemple, les parents) ;
//    sur les autres pages : le dernier profil mémorisé sur cet appareil ;
// 3. sinon le profil d'exemple.
// Expose ensuite window.CONFIG (lu par le moteur), window.PROFIL, son code et son identifiant.
import { stockage } from './stockage';
import { plateforme } from './plateforme';
import { racineSite } from './horsLigne';
import { resoudre, type Texte } from './recit';
import {
  type Profil, PROFIL_EXEMPLE, codeDepuisAdresse, configDepuisProfil, decoderProfil, encoderProfil, idProfil,
  reveil, surpriseActive,
} from './profil';

export const SITE = 'https://florian-gaudin.github.io/nuit-petite-souris/';
const CLE = 'souris.profil';

// adresse : QR code ou lien des parents ; memoire : dernier profil de l'appareil ; exemple : l'histoire de Clémentine (#exemple) ;
// choix : ouverture sans QR, l'écran de choix du parcours s'affiche (le profil d'exemple sert de décor)
export type Origine = 'adresse' | 'memoire' | 'exemple' | 'choix';
export interface ProfilCourant {
  profil: Profil; code: string; id: string; origine: Origine; erreur: string | null; surprise?: boolean;
  memoire?: { prenom: string; code: string } | null; // le dernier profil scanné ici, pour « Reprendre l'histoire de… »
}
export const ADRESSE_EXEMPLE = '#exemple';

// Quand revenir : « demain matin », « tout à l'heure, au lever du jour », ou « le samedi 12 décembre au matin »
export function quandRevenir(nuit: string, maintenant = new Date()): string {
  const r = reveil(nuit);
  const jour = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const ecart = Math.round((jour(r) - jour(maintenant)) / 864e5);
  if (ecart <= 0) return "tout à l'heure, au lever du jour";
  if (ecart === 1) return 'demain matin';
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(r) + ' au matin';
}

// Aperçu : les parents qui lancent l'histoire depuis l'espace parents (?apercu=1) la voient tout de suite
function apercu(id: string): boolean {
  const cle = 'souris.apercu.' + id;
  try {
    if (new URLSearchParams(location.search).has('apercu')) sessionStorage.setItem(cle, '1');
    return sessionStorage.getItem(cle) === '1';
  } catch { return new URLSearchParams(location.search).has('apercu'); }
}

// Adresse de base de l'histoire : la racine du site (web), ou le site public (appli native)
export function baseHistoire(): string {
  return plateforme.natif ? SITE : racineSite();
}

// choix = true (page de l'histoire) : sans QR ni #exemple, on propose l'écran de choix au lieu du dernier profil
export function chargerProfil(opts: { choix?: boolean } = {}): ProfilCourant {
  let erreur: string | null = null;
  const exemple = (origine: Origine, memoire: ProfilCourant['memoire'] = null): ProfilCourant =>
    ({ profil: PROFIL_EXEMPLE, code: encoderProfil(PROFIL_EXEMPLE), id: idProfil(PROFIL_EXEMPLE), origine, erreur, memoire });
  if (location.hash === ADRESSE_EXEMPLE) return exemple('exemple');
  const codeAdresse = codeDepuisAdresse(location.hash);
  if (codeAdresse) {
    const l = decoderProfil(codeAdresse);
    if (l.ok) {
      stockage.ecrire(CLE, l.code);
      return { profil: l.profil, code: l.code, id: idProfil(l.profil), origine: 'adresse', erreur };
    }
    erreur = l.raison;
  }
  const codeMemoire = stockage.lire(CLE);
  const lm = codeMemoire ? decoderProfil(codeMemoire) : null;
  if (opts.choix) return exemple('choix', lm && lm.ok ? { prenom: lm.profil.prenom, code: lm.code } : null);
  if (lm && lm.ok) return { profil: lm.profil, code: lm.code, id: idProfil(lm.profil), origine: 'memoire', erreur };
  return exemple('exemple');
}

declare global {
  interface Window { CONFIG: ReturnType<typeof configDepuisProfil> & { reveilTexte: string }; PROFIL: ProfilCourant; RECIT: { resoudre: (t: Texte) => ReturnType<typeof resoudre> } }
}

export function installerProfil(opts: { choix?: boolean } = {}): ProfilCourant {
  const pc = chargerProfil(opts);
  window.PROFIL = pc;
  // Mode surprise : l'histoire se découvre au réveil, sauf pour le profil d'exemple et en aperçu
  pc.surprise = (pc.origine === 'adresse' || pc.origine === 'memoire') && surpriseActive(pc.profil) && !apercu(pc.id);
  window.CONFIG = { ...configDepuisProfil(pc.profil, baseHistoire() + '#p=' + pc.code), reveilTexte: pc.profil.nuit ? quandRevenir(pc.profil.nuit) : '' };
  window.RECIT = { resoudre: (t: Texte) => resoudre(t, window.CONFIG) };
  if (pc.erreur) console.warn('Profil de l\'adresse ignoré :', pc.erreur);
  // Un nouveau QR scanné dans le même onglet : on recharge pour raconter le nouveau profil
  window.addEventListener('hashchange', () => { if (codeDepuisAdresse(location.hash) || location.hash === ADRESSE_EXEMPLE) location.reload(); });
  return pc;
}
