// Les dons pour l'appli (page Buy Me a Coffee). L'adresse se règle ici, à un seul endroit.
// Tant qu'elle est vide, rien ne s'affiche : ni la carte de l'espace parents, ni le petit bouton de l'accueil.
import { plateforme } from './plateforme';

export const LIEN_DON: string = 'https://buymeacoffee.com/lanuitdelapetitesouris';

// Dans l'appli native, pas de lien de don pour l'instant : les stores encadrent strictement les paiements
// hors de leur système, surtout dans les applis pour enfants (à revoir à l'étape des stores).
export const donPossible = (): boolean => LIEN_DON !== '' && !plateforme.natif;
