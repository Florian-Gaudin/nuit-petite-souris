// La carte de France de la scène d'origine : le château de Quenotte dans les Ardennes, et l'étoile de la ville
// de l'enfant (placée sur le chef-lieu de son département). Repère SVG : 0 0 900 870 (projection simple).
const LON0 = -5.2, LAT0 = 51.2, K = 58, KY = K * 1.42; // 1,42 ≈ 1 / cos(45,5°) : la France n'est pas écrasée

export function projeter(lat: number, lon: number): [number, number] {
  return [Math.round((lon - LON0) * K + 20), Math.round((LAT0 - lat) * KY + 20)];
}

// Contour simplifié (latitude, longitude), dans le sens des aiguilles d'une montre depuis Dunkerque
const CONTOUR: [number, number][] = [
  [51.09, 2.55], [50.48, 3.6], [50.0, 4.2], [50.15, 4.86], [49.75, 4.95], [49.55, 5.8], [49.47, 6.36], [49.05, 7.6], [48.97, 8.2],
  [48.3, 7.75], [47.6, 7.55], [47.45, 6.95], [46.85, 6.45], [46.4, 6.1], [46.15, 6.2], [46.25, 6.8], [45.9, 7.05], [45.4, 7.15],
  [45.1, 6.65], [44.4, 6.9], [43.95, 7.65], [43.78, 7.53], [43.55, 7.0], [43.15, 6.6], [43.08, 5.9], [43.33, 5.3], [43.4, 4.65],
  [43.5, 3.9], [43.0, 3.1], [42.45, 3.17], [42.38, 2.5], [42.55, 1.5], [42.75, 0.6], [42.85, -0.6], [43.37, -1.78], [43.65, -1.45],
  [44.6, -1.25], [45.6, -1.15], [46.2, -1.4], [46.9, -2.2], [47.28, -2.5], [47.5, -3.0], [47.85, -4.35], [48.35, -4.75],
  [48.68, -4.1], [48.8, -3.0], [48.65, -2.0], [48.65, -1.45], [49.2, -1.6], [49.72, -1.9], [49.7, -1.25], [49.42, -1.15],
  [49.35, -0.2], [49.47, 0.2], [50.05, 1.4], [50.4, 1.58], [50.95, 1.85],
];
const CORSE: [number, number][] = [[43.0, 9.42], [42.6, 9.55], [42.0, 9.42], [41.38, 9.22], [41.6, 8.8], [41.9, 8.62], [42.35, 8.62], [42.65, 8.9], [42.75, 9.3]];

const chemin = (pts: [number, number][]) => 'M' + pts.map(([la, lo]) => projeter(la, lo).join(' ')).join('L') + 'Z';
export const CONTOUR_FRANCE = chemin(CONTOUR);
export const CONTOUR_CORSE = chemin(CORSE);

// Le château de Quenotte : au fond de la forêt des Ardennes, au nord de Charleville
export const CHATEAU = projeter(49.95, 4.7);

// Chef-lieu de chaque département de métropole (latitude, longitude)
const CHEFS_LIEUX: Record<string, [number, number]> = {
  '01': [46.2, 5.22], '02': [49.56, 3.62], '03': [46.57, 3.33], '04': [44.09, 6.24], '05': [44.56, 6.08], '06': [43.7, 7.27],
  '07': [44.74, 4.6], '08': [49.77, 4.72], '09': [42.97, 1.61], '10': [48.3, 4.08], '11': [43.21, 2.35], '12': [44.35, 2.57],
  '13': [43.3, 5.37], '14': [49.18, -0.37], '15': [44.93, 2.44], '16': [45.65, 0.16], '17': [46.16, -1.15], '18': [47.08, 2.4],
  '19': [45.27, 1.77], '21': [47.32, 5.04], '22': [48.51, -2.76], '23': [46.17, 1.87], '24': [45.18, 0.72], '25': [47.24, 6.02],
  '26': [44.93, 4.89], '27': [49.03, 1.15], '28': [48.44, 1.49], '29': [48.0, -4.1], '2A': [41.93, 8.74], '2B': [42.7, 9.45],
  '30': [43.84, 4.36], '31': [43.6, 1.44], '32': [43.65, 0.59], '33': [44.84, -0.58], '34': [43.61, 3.88], '35': [48.11, -1.68],
  '36': [46.81, 1.69], '37': [47.39, 0.69], '38': [45.19, 5.72], '39': [46.67, 5.55], '40': [43.89, -0.5], '41': [47.59, 1.33],
  '42': [45.44, 4.39], '43': [45.04, 3.88], '44': [47.22, -1.55], '45': [47.9, 1.9], '46': [44.45, 1.44], '47': [44.2, 0.62],
  '48': [44.52, 3.5], '49': [47.47, -0.55], '50': [49.12, -1.09], '51': [48.96, 4.36], '52': [48.11, 5.14], '53': [48.07, -0.77],
  '54': [48.69, 6.18], '55': [48.77, 5.16], '56': [47.66, -2.76], '57': [49.12, 6.18], '58': [46.99, 3.16], '59': [50.63, 3.06],
  '60': [49.43, 2.08], '61': [48.43, 0.09], '62': [50.29, 2.78], '63': [45.78, 3.08], '64': [43.3, -0.37], '65': [43.23, 0.08],
  '66': [42.7, 2.9], '67': [48.57, 7.75], '68': [48.08, 7.36], '69': [45.76, 4.84], '70': [47.62, 6.15], '71': [46.31, 4.83],
  '72': [48.0, 0.2], '73': [45.57, 5.92], '74': [45.9, 6.13], '75': [48.86, 2.35], '76': [49.44, 1.1], '77': [48.54, 2.66],
  '78': [48.8, 2.13], '79': [46.32, -0.46], '80': [49.89, 2.3], '81': [43.93, 2.15], '82': [44.02, 1.35], '83': [43.12, 5.93],
  '84': [43.95, 4.81], '85': [46.67, -1.43], '86': [46.58, 0.34], '87': [45.83, 1.26], '88': [48.17, 6.45], '89': [47.8, 3.57],
  '90': [47.64, 6.86], '91': [48.63, 2.44], '92': [48.89, 2.21], '93': [48.91, 2.44], '94': [48.79, 2.46], '95': [49.05, 2.1],
};

// Les départements d'outre-mer sont figurés dans un encadré, en bas à gauche de la carte
export const ENCADRE_OUTRE_MER: [number, number] = [110, 780];

export type Etoile = { x: number; y: number; outreMer: boolean } | null;

// Où briller pour cette ville : chef-lieu du département, encadré d'outre-mer, ou rien si le département est inconnu
export function etoileDepartement(dep: string): Etoile {
  if (!dep) return null;
  if (/^97\d$/.test(dep)) return { x: ENCADRE_OUTRE_MER[0], y: ENCADRE_OUTRE_MER[1], outreMer: true };
  const c = CHEFS_LIEUX[dep];
  if (!c) return null;
  const [x, y] = projeter(c[0], c[1]);
  return { x, y, outreMer: false };
}

export const NB_DEPARTEMENTS = Object.keys(CHEFS_LIEUX).length;

declare global { interface Window { CARTE: { CONTOUR_FRANCE: string; CONTOUR_CORSE: string; CHATEAU: [number, number]; ENCADRE_OUTRE_MER: [number, number]; etoileDepartement: typeof etoileDepartement } } }
if (typeof window !== 'undefined') window.CARTE = { CONTOUR_FRANCE, CONTOUR_CORSE, CHATEAU, ENCADRE_OUTRE_MER, etoileDepartement };
