// Position des 20 dents de lait sur un schéma vu de face (la droite de l'enfant à gauche du schéma).
// Partagée par le formulaire des parents et le diplôme. Repère : 340 × 300.
import { arcade } from './profil';

export const HAUT = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const BAS = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];
const LARGEUR = [0, 22, 18, 18, 24, 28]; // par numéro de dent (1 = incisive centrale… 5 = 2e molaire)
const CX = 170, RX = 132, RY = 92;

export interface PlaceDent { d: number; x: number; y: number; angle: number; l: number; h: number }

function place(d: number, i: number): PlaceDent {
  const theta = ((i - 4.5) / 4.5) * 78 * (Math.PI / 180);
  const haut = arcade(d) === 'haut';
  return {
    d,
    x: CX + RX * Math.sin(theta),
    y: haut ? 134 - RY * Math.cos(theta) : 166 + RY * Math.cos(theta),
    angle: (theta * 180) / Math.PI * (haut ? 1 : -1),
    l: LARGEUR[d % 10],
    h: d % 10 >= 4 ? 26 : 30,
  };
}

export const PLACES: PlaceDent[] = [...HAUT.map((d, i) => place(d, i)), ...BAS.map((d, i) => place(d, i))];
export const ETOILE = 'M0 -8l2.4 5 5.4.6-4 3.7 1.1 5.3L0 3.9l-4.9 2.7 1.1-5.3-4-3.7 5.4-.6z';
