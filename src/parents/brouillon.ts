// Le formulaire des parents : un « brouillon » souple pendant la saisie, converti en profil vérifié à la fin.
import {
  type Billet, type Cachette, type Genre, type Profil, type TypeDoudou,
  nomValide, villeValide, verifierProfil, nuitParDefaut, DENTS_DE_LAIT,
} from '../lib/profil';

export interface Brouillon {
  prenom: string;
  genre: Genre | '';
  doudouType: TypeDoudou;
  doudouNom: string;
  fratrie: boolean;
  fratriePrenom: string;
  fratrieGenre: Genre | '';
  fratrieACote: boolean;
  chat: string;
  dentNuit: number | null;
  dentsDeja: number[];
  billet: Billet;
  cachette: Cachette;
  ville: { nom: string; codePostal: string; departement: string } | null;
  nuit: string;
}

export function nouveauBrouillon(): Brouillon {
  return {
    prenom: '', genre: '', doudouType: 'ours', doudouNom: '',
    fratrie: false, fratriePrenom: '', fratrieGenre: '', fratrieACote: true,
    chat: 'Pantoufle', dentNuit: null, dentsDeja: [], billet: 5, cachette: 'cheminee',
    ville: null, nuit: nuitParDefaut(),
  };
}

export function depuisProfil(p: Profil): Brouillon {
  return {
    prenom: p.prenom, genre: p.genre, doudouType: p.doudou.type, doudouNom: p.doudou.nom,
    fratrie: !!p.fratrie, fratriePrenom: p.fratrie?.prenom ?? '', fratrieGenre: p.fratrie?.genre ?? '', fratrieACote: p.fratrie?.dortACote ?? true,
    chat: p.chat, dentNuit: p.dents.nuit, dentsDeja: [...p.dents.deja], billet: p.billet, cachette: p.cachette,
    ville: { ...p.ville }, nuit: p.nuit ?? nuitParDefaut(),
  };
}

// À n'appeler qu'une fois toutes les étapes validées
export function versProfil(b: Brouillon): Profil {
  return {
    prenom: b.prenom.trim(), genre: b.genre as Genre,
    doudou: { type: b.doudouType, nom: b.doudouType === 'aucun' ? '' : b.doudouNom.trim() },
    fratrie: b.fratrie ? { prenom: b.fratriePrenom.trim(), genre: b.fratrieGenre as Genre, dortACote: b.fratrieACote } : null,
    chat: b.chat.trim(),
    dents: { nuit: b.dentNuit as number, deja: DENTS_DE_LAIT.filter(d => b.dentsDeja.includes(d)) },
    billet: b.billet, cachette: b.cachette,
    ville: b.ville ? { nom: b.ville.nom.trim(), codePostal: b.ville.codePostal, departement: b.ville.departement } : { nom: '', codePostal: '', departement: '' },
    nuit: b.nuit,
  };
}

export const ETAPES = ["L'enfant", 'La dent', 'Le cadeau', 'La maison', 'La nuit'] as const;

const NOM_AIDE = 'lettres, espaces, tirets ou apostrophes, 40 caractères au plus';

// Les problèmes de l'étape n (0 à 4), formulés pour les parents
export function erreursEtape(b: Brouillon, n: number): string[] {
  const e: string[] = [];
  if (n === 0) {
    if (!nomValide(b.prenom.trim())) e.push(`Indiquez le prénom de l'enfant (${NOM_AIDE}).`);
    if (!b.genre) e.push("Indiquez si c'est une fille ou un garçon : l'histoire accorde les mots (« ravie », « ravi »).");
    if (b.doudouType !== 'aucun' && !nomValide(b.doudouNom.trim())) e.push(`Donnez le nom du doudou (${NOM_AIDE}), ou choisissez « pas de doudou ».`);
    if (b.fratrie) {
      if (!nomValide(b.fratriePrenom.trim())) e.push(`Indiquez le prénom du frère ou de la sœur (${NOM_AIDE}).`);
      if (!b.fratrieGenre) e.push('Indiquez si c\'est un frère ou une sœur.');
    }
  }
  if (n === 1) {
    if (b.dentNuit == null) e.push('Touchez sur le schéma la dent tombée cette nuit.');
  }
  if (n === 3) {
    if (!b.ville || !villeValide(b.ville.nom.trim())) e.push('Choisissez la ville où habite l\'enfant.');
    if (!nomValide(b.chat.trim())) e.push(`Donnez un nom au chat du voisin (${NOM_AIDE}).`);
  }
  if (n === 4) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.nuit)) e.push('Choisissez la date de la nuit.');
  }
  return e;
}

// Dernier filet : le profil complet doit être valide
export function erreursProfil(b: Brouillon): string[] {
  for (let n = 0; n < ETAPES.length; n++) if (erreursEtape(b, n).length) return erreursEtape(b, n);
  const p = versProfil(b);
  const e = verifierProfil(p);
  return e.length ? ['Certaines informations ne sont pas valides : ' + e.join(', ') + '.'] : [];
}
