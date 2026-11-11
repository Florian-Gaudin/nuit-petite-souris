// Quel profil raconter ? Dans l'ordre :
// 1. celui de l'adresse (#p=…, le QR code vient d'être scanné), mémorisé pour les visites suivantes ;
// 2. sinon le dernier profil mémorisé sur cet appareil ;
// 3. sinon le profil d'exemple.
// Expose ensuite window.CONFIG (lu par le moteur), window.PROFIL, son code et son identifiant.
import { stockage } from './stockage';
import { plateforme } from './plateforme';
import {
  type Profil, PROFIL_EXEMPLE, codeDepuisAdresse, configDepuisProfil, decoderProfil, encoderProfil, idProfil,
} from './profil';

export const SITE = 'https://florian-gaudin.github.io/nuit-petite-souris/';
const CLE = 'souris.profil';

export type Origine = 'adresse' | 'memoire' | 'exemple';
export interface ProfilCourant { profil: Profil; code: string; id: string; origine: Origine; erreur: string | null }

// Adresse de base de l'histoire : celle de la page (web), ou le site public (appli native)
export function baseHistoire(): string {
  if (plateforme.natif) return SITE;
  return new URL('./', location.href).href.replace(/[?#].*$/, '');
}

export function chargerProfil(): ProfilCourant {
  let erreur: string | null = null;
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
  if (codeMemoire) {
    const l = decoderProfil(codeMemoire);
    if (l.ok) return { profil: l.profil, code: l.code, id: idProfil(l.profil), origine: 'memoire', erreur };
  }
  const code = encoderProfil(PROFIL_EXEMPLE);
  return { profil: PROFIL_EXEMPLE, code, id: idProfil(PROFIL_EXEMPLE), origine: 'exemple', erreur };
}

declare global {
  interface Window { CONFIG: ReturnType<typeof configDepuisProfil>; PROFIL: ProfilCourant }
}

export function installerProfil(): ProfilCourant {
  const pc = chargerProfil();
  window.PROFIL = pc;
  window.CONFIG = configDepuisProfil(pc.profil, baseHistoire() + '#p=' + pc.code);
  if (pc.erreur) console.warn('Profil de l\'adresse ignoré :', pc.erreur);
  // Un nouveau QR scanné dans le même onglet : on recharge pour raconter le nouveau profil
  window.addEventListener('hashchange', () => { if (codeDepuisAdresse(location.hash)) location.reload(); });
  return pc;
}
