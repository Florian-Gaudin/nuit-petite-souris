// Le profil de l'enfant : ce que les parents renseignent, et que le QR code transporte.
// Il voyage après le « # » de l'adresse (#p=…), compressé : il n'est jamais envoyé à un serveur.
import LZString from 'lz-string';
import { vocabulaire } from './recit';

export type Genre = 'f' | 'g';
export type TypeDoudou = 'ours' | 'lapin' | 'chat' | 'chien' | 'bebe' | 'licorne' | 'dinosaure' | 'aucun';
export type Cachette = 'cheminee' | 'radiateur' | 'table-de-nuit' | 'bureau' | 'etagere';
export type Billet = 5 | 10 | 20 | 50;

// Dents de lait, numérotation dentaire internationale :
// 51-55 haut droit, 61-65 haut gauche, 71-75 bas gauche, 81-85 bas droit (côté de l'enfant),
// 1 = incisive centrale … 5 = deuxième molaire.
export const DENTS_DE_LAIT: readonly number[] = [5, 6, 7, 8].flatMap(q => [1, 2, 3, 4, 5].map(i => q * 10 + i));

export interface Profil {
  prenom: string;
  genre: Genre;
  doudou: { type: TypeDoudou; nom: string };
  fratrie: { prenom: string; genre: Genre; dortACote: boolean } | null;
  chat: string;
  dents: { nuit: number; deja: number[] };
  billet: Billet;
  cachette: Cachette;
  ville: { nom: string; codePostal: string; departement: string };
  nuit: string | null; // AAAA-MM-JJ : le soir du passage ; null = calculée au premier lancement
}

export const TYPES_DOUDOU: readonly TypeDoudou[] = ['ours', 'lapin', 'chat', 'chien', 'bebe', 'licorne', 'dinosaure', 'aucun'];
export const CACHETTES: readonly Cachette[] = ['cheminee', 'radiateur', 'table-de-nuit', 'bureau', 'etagere'];
export const BILLETS: readonly Billet[] = [5, 10, 20, 50];

// Où sèche le billet, dit par Quenotte (« … sèche sur la cheminée »)
export const LIEU_CACHETTE: Record<Cachette, string> = {
  'cheminee': 'sur la cheminée',
  'radiateur': 'sur le radiateur',
  'table-de-nuit': 'sur ta table de nuit',
  'bureau': 'sur ton bureau',
  'etagere': 'sur ton étagère',
};

// Le profil d'exemple (celui de la première histoire), utilisé tant qu'aucun profil n'a été créé
export const PROFIL_EXEMPLE: Profil = {
  prenom: 'Clémentine',
  genre: 'f',
  doudou: { type: 'ours', nom: 'Nicolas' },
  fratrie: null,
  chat: 'Pantoufle',
  dents: { nuit: 71, deja: [81] },
  billet: 5,
  cachette: 'cheminee',
  ville: { nom: 'Aiglemont', codePostal: '08090', departement: '08' },
  nuit: null,
};

// ---------- Vérification ----------
// Les noms sont réaffichés dans la page : on n'accepte que des lettres, chiffres, espaces et
// ponctuation simple (pas de < > & " …), ce qui ferme la porte à toute injection de code.
const NOM = /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9 '’.\-()]{0,39}$/u;
// Les noms de communes peuvent être très longs (« Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson »)
const VILLE = /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9 '’.\-()]{0,59}$/u;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function nomValide(s: unknown): s is string { return typeof s === 'string' && NOM.test(s.trim()) && s.trim() === s; }
export function villeValide(s: unknown): s is string { return typeof s === 'string' && VILLE.test(s.trim()) && s.trim() === s; }
function dateValide(s: unknown): s is string {
  if (typeof s !== 'string' || !DATE.test(s)) return false;
  const d = new Date(s + 'T12:00:00');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// Renvoie la liste des problèmes (vide si le profil est correct)
export function verifierProfil(p: Profil): string[] {
  const e: string[] = [];
  if (!nomValide(p.prenom)) e.push('prénom');
  if (p.genre !== 'f' && p.genre !== 'g') e.push('genre');
  if (!TYPES_DOUDOU.includes(p.doudou?.type)) e.push('type de doudou');
  if (p.doudou?.type !== 'aucun' && !nomValide(p.doudou?.nom)) e.push('nom du doudou');
  if (p.fratrie && (!nomValide(p.fratrie.prenom) || (p.fratrie.genre !== 'f' && p.fratrie.genre !== 'g') || typeof p.fratrie.dortACote !== 'boolean')) e.push('frère ou sœur');
  if (!nomValide(p.chat)) e.push('nom du chat');
  if (!DENTS_DE_LAIT.includes(p.dents?.nuit)) e.push('dent de la nuit');
  if (!Array.isArray(p.dents?.deja) || p.dents.deja.some(d => !DENTS_DE_LAIT.includes(d)) || new Set(p.dents.deja).size !== p.dents.deja.length || p.dents.deja.includes(p.dents.nuit)) e.push('dents déjà tombées');
  if (!BILLETS.includes(p.billet)) e.push('billet');
  if (!CACHETTES.includes(p.cachette)) e.push('cachette');
  if (!villeValide(p.ville?.nom)) e.push('ville');
  if (typeof p.ville?.codePostal !== 'string' || !/^(\d{5})?$/.test(p.ville.codePostal)) e.push('code postal');
  if (typeof p.ville?.departement !== 'string' || !/^(\d{2,3}|2A|2B)?$/.test(p.ville.departement)) e.push('département');
  if (p.nuit !== null && !dateValide(p.nuit)) e.push('date');
  return e;
}

// ---------- Les dents et la variante de l'histoire ----------
export type Arcade = 'haut' | 'bas';
export const NOMS_DENTS = ['incisive centrale', 'incisive latérale', 'canine', 'première molaire', 'deuxième molaire'] as const;

export function arcade(d: number): Arcade { return d < 70 ? 'haut' : 'bas'; }
// La jumelle d'une dent : la même dent, de l'autre côté de la bouche (51 ↔ 61, 71 ↔ 81…)
export function jumelle(d: number): number {
  const q = Math.floor(d / 10), i = d % 10;
  return ({ 5: 6, 6: 5, 7: 8, 8: 7 } as Record<number, number>)[q] * 10 + i;
}
export function nomDent(d: number): string {
  const cote = [5, 8].includes(Math.floor(d / 10)) ? 'droite' : 'gauche'; // côté de l'enfant
  return `${NOMS_DENTS[(d % 10) - 1]} du ${arcade(d)}, à ${cote}`;
}

// Trois histoires : la toute première dent, une dent dont la jumelle est déjà au château, ou la suite
export type Variante = 'premiere' | 'jumelle' | 'suite';
export function varianteDent(dents: Profil['dents']): Variante {
  if (dents.deja.length === 0) return 'premiere';
  if (dents.deja.includes(jumelle(dents.nuit))) return 'jumelle';
  return 'suite';
}
// Rang de la dent de la nuit (1re, 2e…)
export function rangDent(dents: Profil['dents']): number { return dents.deja.length + 1; }

// La nuit par défaut : avant midi, la nuit qui vient de finir ; après midi, celle qui vient
export function nuitParDefaut(maintenant = new Date()): string {
  const d = new Date(maintenant);
  if (d.getHours() < 12) d.setDate(d.getDate() - 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---------- Mode surprise ----------
// L'histoire se découvre au réveil : le lendemain de la nuit choisie, à partir de 5 h du matin.
export const HEURE_DU_REVEIL = 5;
export function reveil(nuit: string): Date {
  const d = new Date(nuit + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  d.setHours(HEURE_DU_REVEIL, 0, 0, 0);
  return d;
}
export function surpriseActive(p: Pick<Profil, 'nuit'>, maintenant = new Date()): boolean {
  return !!p.nuit && maintenant < reveil(p.nuit);
}

// ---------- Encodage compact ----------
// Format à séparateurs, puis compression (lz-string, synchrone : pas de complication dans l'appli native).
// Les choix fixes deviennent des chiffres, les dents déjà tombées un masque de 20 bits, la date AAAAMMJJ.
// Les noms ne peuvent contenir ni « | » ni « ~ » (voir NOM), qui servent donc de séparateurs.
//   1|prénom|genre|doudou|nom du doudou|chat|dent de la nuit|masque des dents|billet|cachette|ville|cp|département|date|fratrie
const VERSION = '1';
const indexDent = (d: number) => (Math.floor(d / 10) - 5) * 5 + (d % 10) - 1;

function masqueDents(dents: number[]): string {
  let m = 0;
  for (const d of dents) m |= 1 << indexDent(d);
  return m.toString(36);
}
function dentsDuMasque(s: string): number[] {
  const m = parseInt(s, 36);
  if (!/^[0-9a-z]+$/.test(s) || isNaN(m) || m < 0 || m >= 1 << 20) return [-1];
  return DENTS_DE_LAIT.filter(d => m & (1 << indexDent(d)));
}

export function compacter(p: Profil): string {
  return [
    VERSION, p.prenom, p.genre, TYPES_DOUDOU.indexOf(p.doudou.type), p.doudou.type === 'aucun' ? '' : p.doudou.nom, p.chat,
    p.dents.nuit, masqueDents(p.dents.deja), p.billet, CACHETTES.indexOf(p.cachette),
    p.ville.nom, p.ville.codePostal, p.ville.departement, p.nuit ? p.nuit.replace(/-/g, '') : '',
    p.fratrie ? [p.fratrie.prenom, p.fratrie.genre, p.fratrie.dortACote ? 1 : 0].join('~') : '',
  ].join('|');
}

function decompacter(s: string): Profil | null {
  const c = s.split('|');
  if (c.length !== 15 || c[0] !== VERSION) return null;
  const entier = (x: string) => (/^\d+$/.test(x) ? parseInt(x, 10) : -1);
  const f = c[14] ? c[14].split('~') : null;
  return {
    prenom: c[1], genre: c[2] as Genre,
    doudou: { type: TYPES_DOUDOU[entier(c[3])], nom: c[4] }, chat: c[5],
    dents: { nuit: entier(c[6]), deja: dentsDuMasque(c[7]) },
    billet: entier(c[8]) as Billet, cachette: CACHETTES[entier(c[9])],
    ville: { nom: c[10], codePostal: c[11], departement: c[12] },
    nuit: c[13] ? (/^\d{8}$/.test(c[13]) ? c[13].slice(0, 4) + '-' + c[13].slice(4, 6) + '-' + c[13].slice(6) : 'invalide') : null,
    fratrie: f ? (f.length === 3 && (f[2] === '0' || f[2] === '1') ? { prenom: f[0], genre: f[1] as Genre, dortACote: f[2] === '1' } : { prenom: '', genre: 'x' as Genre, dortACote: false }) : null,
  };
}

export function encoderProfil(p: Profil): string {
  return LZString.compressToEncodedURIComponent(compacter(p));
}

export type Lecture = { ok: true; profil: Profil; code: string } | { ok: false; raison: string };

export function decoderProfil(code: string): Lecture {
  try {
    const texte = LZString.decompressFromEncodedURIComponent(code);
    if (!texte) return { ok: false, raison: 'code illisible' };
    if (!texte.startsWith(VERSION + '|')) return { ok: false, raison: 'version inconnue' };
    const profil = decompacter(texte);
    if (!profil) return { ok: false, raison: 'code illisible' };
    const erreurs = verifierProfil(profil);
    if (erreurs.length) return { ok: false, raison: 'champs invalides : ' + erreurs.join(', ') };
    return { ok: true, profil, code };
  } catch {
    return { ok: false, raison: 'code illisible' };
  }
}

// Le profil dans l'adresse : …/#p=CODE
export function codeDepuisAdresse(hash: string): string | null {
  const m = /^#?p=([A-Za-z0-9+\-$]+)$/.exec(hash || '');
  return m ? m[1] : null;
}
export function adresseProfil(base: string, p: Profil): string {
  return base.replace(/#.*$/, '') + '#p=' + encoderProfil(p);
}

// Identifiant court et stable d'un profil : la progression est mémorisée par profil,
// ce qui permet plusieurs enfants (ou plusieurs dents) sur la même tablette.
export function idProfil(p: Profil): string {
  const s = compacter(p);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}

// ---------- Traduction vers la configuration du moteur actuel (src/legacy) ----------
// Le schéma de la mâchoire du moteur actuel ne connaît que les deux incisives centrales du bas
// (vues de face) ; il sera remplacé par le schéma des 20 dents à l'étape 4.
const POSITION_ANCIEN_SCHEMA: Record<number, string> = { 81: 'bas-centrale-gauche', 71: 'bas-centrale-droite' };

export function configDepuisProfil(p: Profil, url: string) {
  const ordre = [...p.dents.deja, p.dents.nuit];
  return {
    url,
    enfant: p.prenom,
    poupee: p.doudou.type === 'aucun' ? '' : p.doudou.nom,
    souris: 'Quenotte',
    chat: p.chat,
    chateau: 'Château des Dents de Lait',
    ville: p.ville.nom,
    nuit: p.nuit,
    dents: ordre.map((d, i) => ({ numero: i + 1, position: POSITION_ANCIEN_SCHEMA[d] ?? 'autre', code: d })),
    billet: { lieu: LIEU_CACHETTE[p.cachette], valeur: p.billet },
    secret: true,
    profil: p,
    ...vocabulaire(p),
  };
}
