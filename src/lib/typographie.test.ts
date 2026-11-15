import { describe, expect, it } from 'vitest';
import { typographier } from './typographie';

describe('typographie : espace insécable devant ! et ?', () => {
  it('remplace les espaces ordinaires', () => {
    expect(typographier('Bravo ! Tu viens ?')).toBe('Bravo ! Tu viens ?');
  });
  it('ajoute une espace manquante en fin de phrase', () => {
    expect(typographier('Coucou! Et toi?')).toBe('Coucou ! Et toi ?');
  });
  it('ne touche ni aux adresses ni aux points déjà corrects', () => {
    expect(typographier('https://exemple.fr/?source=appli')).toBe('https://exemple.fr/?source=appli');
    expect(typographier('Déjà !')).toBe('Déjà !');
    expect(typographier('Quoi ?!')).toBe('Quoi ?!');
  });
});
