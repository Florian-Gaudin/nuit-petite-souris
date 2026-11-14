// Le récit adaptatif : le vocabulaire de l'histoire calculé à partir du profil, et le choix
// de la bonne version d'un texte (selon la dent, le doudou, le frère ou la sœur, la cachette).
import { type Cachette, type Profil, type Variante, LIEU_CACHETTE, NOMS_DENTS, arcade, estPiece, rangDent, varianteDent } from './profil';

const NOMBRES = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt'];
const ORDINAUX = ['', 'première', 'deuxième', 'troisième', 'quatrième', 'cinquième', 'sixième', 'septième', 'huitième', 'neuvième', 'dixième', 'onzième', 'douzième', 'treizième', 'quatorzième', 'quinzième', 'seizième', 'dix-septième', 'dix-huitième', 'dix-neuvième', 'vingtième'];
export const nombreEnLettres = (n: number) => NOMBRES[n] ?? String(n); // au féminin (« une dent »)
export const ordinal = (n: number) => ORDINAUX[n] ?? n + 'e';

// Couleurs des billets en euros (5 gris, 10 rouge, 20 bleu, 50 orange)
// (pièces : 1 € argent au centre doré, 2 € doré au centre argenté)
export const COULEURS_BILLET: Record<number, { clair: string; moyen: string; fonce: string }> = {
  1: { clair: '#F3D98A', moyen: '#C9CDD6', fonce: '#8a8f9c' },
  2: { clair: '#D5D9E0', moyen: '#E2C27A', fonce: '#9c7a2a' },
  5: { clair: '#CBD3C4', moyen: '#B9C4B0', fonce: '#6f7d68' },
  10: { clair: '#F0C3BC', moyen: '#E4A39A', fonce: '#a8564b' },
  20: { clair: '#C3D4EE', moyen: '#9DB8E0', fonce: '#4d6fa3' },
  50: { clair: '#F7D2A3', moyen: '#F2B66B', fonce: '#b8752a' },
};

// « ta cheminée », « ton radiateur »… et l'avertissement « bien éteinte » quand il le faut
const CACHETTE: Record<Cachette, { nom: string; eteint: string; etiquette: string }> = {
  'cheminee': { nom: 'ta cheminée', eteint: ', bien éteinte', etiquette: 'CHEMINÉE – ÉTEINTE' },
  'radiateur': { nom: 'ton radiateur', eteint: ', bien éteint', etiquette: 'RADIATEUR – ÉTEINT' },
  'table-de-nuit': { nom: 'ta table de nuit', eteint: '', etiquette: 'TABLE DE NUIT' },
  'bureau': { nom: 'ton bureau', eteint: '', etiquette: 'BUREAU' },
  'etagere': { nom: 'ton étagère', eteint: '', etiquette: 'ÉTAGÈRE' },
  'coffre': { nom: 'ton coffre à jouets', eteint: '', etiquette: 'COFFRE À JOUETS' },
};

function cadeauTexte(v: number, det: 'un' | 'ton'): string {
  const piece = v <= 2, unite = v === 1 ? 'euro' : 'euros';
  const article = piece ? (det === 'un' ? 'une' : 'ta') : det;
  return `${article} ${piece ? 'pièce' : 'billet'} de ${v} ${unite}`;
}
const riviere = (p: Profil) => p.riviere || 'la rivière';
const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Les mots de l'histoire, utilisables dans les textes sous la forme {mot}
export function vocabulaire(p: Profil) {
  const f = p.genre === 'f';
  const rang = rangDent(p.dents);
  const variante = varianteDent(p.dents);
  const i = (p.dents.nuit % 10) - 1;
  const aDoudou = p.doudou.type !== 'aucun';
  const fr = p.fratrie;
  return {
    variante, rang,
    ordinal: ordinal(rang),                                  // « deuxième »
    ordinalCourt: rang === 1 ? '1re' : rang + 'e',           // « 2e »
    ordinalHtml: rang === 1 ? '1<sup>re</sup>' : rang + '<sup>e</sup>',
    nbDeja: nombreEnLettres(p.dents.deja.length),            // « deux » (dents déjà au château)
    nbDejaChiffre: p.dents.deja.length,
    dentNom: `une ${NOMS_DENTS[i]} du ${arcade(p.dents.nuit)}`, // « une incisive centrale du bas »
    arcadePremiere: p.dents.deja.length ? arcade(p.dents.deja[0]) : arcade(p.dents.nuit), // « bas »
    euros: String(p.billet),                                 // « 5 »
    Chere: f ? 'Chère' : 'Cher',
    amie: f ? 'amie' : 'ami',
    Amie: f ? 'Amie' : 'Ami',
    Exploratrice: f ? 'Exploratrice' : 'Explorateur',
    Collectionneuse: f ? 'Collectionneuse' : 'Collectionneur',
    aDoudou,
    aFratrie: !!fr,
    fratrieACote: !!fr?.dortACote,
    frere: fr?.prenom ?? '',
    tonFrere: fr ? (fr.genre === 'f' ? 'ta sœur ' : 'ton frère ') + fr.prenom : '',
    lieuBillet: LIEU_CACHETTE[p.cachette],                    // « sur la cheminée »
    cachetteNom: CACHETTE[p.cachette].nom,                   // « ta cheminée »
    eteint: CACHETTE[p.cachette].eteint,                     // « , bien éteinte »
    auChaud: p.cachette === 'cheminee' || p.cachette === 'radiateur' ? ' au chaud,' : '', // « sécher au chaud, sur… »
    auChaudFin: p.cachette === 'cheminee' || p.cachette === 'radiateur' ? ' au chaud' : '', // « sécher au chaud jusqu'au matin »
    cachetteEtiquette: CACHETTE[p.cachette].etiquette,       // pour la caméra
    billetCouleurs: COULEURS_BILLET[p.billet],
    // Le cadeau : un billet, ou une pièce (féminin, et « 1 euro » au singulier)
    cadeau: (estPiece(p.billet) ? 'piece' : 'billet') as 'piece' | 'billet',
    unCadeau: cadeauTexte(p.billet, 'un'),                   // « un billet de 5 euros », « une pièce de 1 euro »
    tonCadeau: cadeauTexte(p.billet, 'ton'),                 // « ton billet de 5 euros », « ta pièce de 2 euros »
    TonCadeau: majuscule(cadeauTexte(p.billet, 'ton')),
    tonCadeauCourt: estPiece(p.billet) ? 'ta pièce' : 'ton billet',
    leCadeau: estPiece(p.billet) ? 'la pièce' : 'le billet',
    monCadeau: estPiece(p.billet) ? 'ma pièce' : 'mon billet',
    CadeauTrouve: estPiece(p.billet) ? 'Pièce trouvée' : 'Billet trouvé',
    il: estPiece(p.billet) ? 'elle' : 'il',
    Il: estPiece(p.billet) ? 'Elle' : 'Il',
    le: estPiece(p.billet) ? 'la' : 'le',
    sec: estPiece(p.billet) ? 'sèche' : 'sec',
    trouvee: estPiece(p.billet) ? 'trouvée' : 'trouvé',
    logement: p.logement,                                    // « maison » ou « appartement »
    surLeSeuil: p.logement === 'appartement' ? 'sur le paillasson' : 'sur le seuil', // où dort le chat
    riviere: riviere(p),                                     // « la Seine » (ou « la rivière »)
    Riviere: majuscule(riviere(p)),                          // « La Seine », en début de phrase
  };
}
export type Vocabulaire = ReturnType<typeof vocabulaire>;

// ---------- Choix de la bonne version d'un texte ----------
// Un texte peut être une chaîne, une bulle { txt, expr }, ou un aiguillage :
//   { variante: { premiere, jumelle, suite } }   selon l'histoire de la dent
//   { doudou: { oui, non } }                       selon qu'il y a un doudou
//   { fratrie: { aCote, ailleurs, non } }          frère ou sœur dans la même chambre, ailleurs, ou pas
//   { deja: { une, plusieurs } }                   une seule dent déjà au château, ou plusieurs
//   { logement: { maison, appartement } }          selon le logement de l'enfant
//   { cadeau: { billet, piece } }                  un billet, ou une pièce de 1 ou 2 €
// Une branche absente ou null : le texte est omis.
type Bulle = { txt: string; expr?: string };
export type Texte = string | Bulle | null | undefined | { variante: Partial<Record<Variante, Texte>> } | { doudou: { oui?: Texte; non?: Texte } } | { fratrie: { aCote?: Texte; ailleurs?: Texte; non?: Texte } } | { deja: { une?: Texte; plusieurs?: Texte } } | { logement: { maison?: Texte; appartement?: Texte } } | { cadeau: { billet?: Texte; piece?: Texte } };

export function resoudre(t: Texte, v: Pick<Vocabulaire, 'variante' | 'aDoudou' | 'aFratrie' | 'fratrieACote' | 'nbDejaChiffre' | 'logement' | 'cadeau'>): string | Bulle | null {
  for (let garde = 0; garde < 10; garde++) {
    if (t == null) return null;
    if (typeof t === 'string') return t;
    if ('txt' in t) return t as Bulle;
    if ('variante' in t) { t = t.variante[v.variante]; continue; }
    if ('doudou' in t) { t = v.aDoudou ? t.doudou.oui : t.doudou.non; continue; }
    if ('logement' in t) { t = t.logement[v.logement]; continue; }
    if ('cadeau' in t) { t = t.cadeau[v.cadeau]; continue; }
    if ('deja' in t) { t = v.nbDejaChiffre === 1 ? t.deja.une : t.deja.plusieurs; continue; }
    if ('fratrie' in t) { t = !v.aFratrie ? t.fratrie.non : v.fratrieACote ? (t.fratrie.aCote ?? t.fratrie.ailleurs) : t.fratrie.ailleurs; continue; }
    return null;
  }
  return null;
}
