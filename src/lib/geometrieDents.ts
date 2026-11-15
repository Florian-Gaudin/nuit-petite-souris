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

// ---------- La forme d'une dent : une vraie petite dent (couronne + racines), selon son type ----------
// Repère local de la dent (centré, avant rotation) : la couronne vers l'intérieur de la bouche,
// les racines vers la gencive (en haut pour les dents du haut, en bas pour celles du bas).
export function formeDent(t: PlaceDent): string {
  const sens = arcade(t.d) === 'haut' ? 1 : -1, n = t.d % 10;
  const w = t.l / 2, H = (t.h + 8) / 2, c = -0.12 * H; // c : le collet, entre la couronne et les racines
  const p = (x: number, y: number) => `${x.toFixed(1)} ${(y * sens).toFixed(1)}`;
  // La couronne (vers l'intérieur de la bouche) : bord droit, pointe ou bosses selon le type
  const bord = n <= 2 ? `Q${p(-w, H)} ${p(-w * 0.55, H)}L${p(w * 0.55, H)}Q${p(w, H)} ${p(w, H * 0.5)}`
    : n === 3 ? `Q${p(-w * 0.85, H * 0.88)} ${p(0, H)}Q${p(w * 0.85, H * 0.88)} ${p(w, H * 0.5)}`
    : `Q${p(-w, H)} ${p(-w * 0.5, H)}Q${p(0, H * 0.78)} ${p(w * 0.5, H)}Q${p(w, H)} ${p(w, H * 0.5)}`;
  // Les racines (vers la gencive), arrondies : une pour les incisives et canines, deux pour les molaires
  const racines = n <= 3
    ? `C${p(w * 0.9, -H * 0.45)} ${p(w * 0.45, -H)} ${p(0, -H)}C${p(-w * 0.45, -H)} ${p(-w * 0.9, -H * 0.45)} ${p(-w, c)}`
    : `C${p(w, -H * 0.55)} ${p(w * 0.8, -H)} ${p(w * 0.5, -H)}C${p(w * 0.22, -H)} ${p(w * 0.18, -H * 0.4)} ${p(0, -H * 0.36)}C${p(-w * 0.18, -H * 0.4)} ${p(-w * 0.22, -H)} ${p(-w * 0.5, -H)}C${p(-w * 0.8, -H)} ${p(-w, -H * 0.55)} ${p(-w, c)}`;
  return `M${p(-w, c)}L${p(-w, H * 0.5)}${bord}L${p(w, c)}${racines}Z`;
}

// La gencive : deux arcs roses sous les dents (en haut, en bas), légèrement vers l'extérieur
export function gencives(): string {
  const arc = (haut: boolean) => {
    let d = '';
    for (let a = -84; a <= 84; a += 6) {
      const th = a * Math.PI / 180, r = RX + 10, ry = RY + 10;
      const x = CX + r * Math.sin(th), y = haut ? 134 - ry * Math.cos(th) : 166 + ry * Math.cos(th);
      d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  };
  return arc(true) + ' ' + arc(false);
}
