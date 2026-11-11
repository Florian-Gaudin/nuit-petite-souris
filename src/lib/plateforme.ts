// Où tourne l'appli : navigateur web ou appli native des stores (Capacitor).
// Le moteur de l'histoire s'en sert pour ne proposer le plein écran web
// (et l'installation sur l'écran d'accueil) que dans un navigateur.
import { Capacitor } from '@capacitor/core';

export const plateforme = {
  natif: Capacitor.isNativePlatform(),
  systeme: Capacitor.getPlatform() as 'web' | 'ios' | 'android',
};

declare global {
  interface Window { PLATEFORME: typeof plateforme }
}
window.PLATEFORME = plateforme;
