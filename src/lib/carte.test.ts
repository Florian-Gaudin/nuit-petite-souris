import { describe, expect, it } from 'vitest';
import { etoileDepartement, projeter, CHATEAU, NB_DEPARTEMENTS } from './carte';

describe('carte de France', () => {
  it('les 96 départements de métropole ont leur chef-lieu', () => {
    expect(NB_DEPARTEMENTS).toBe(96);
    const codes = [...Array(95)].map((_, i) => String(i + 1).padStart(2, '0')).filter(c => c !== '20').concat(['2A', '2B']);
    for (const c of codes) expect(etoileDepartement(c), c).not.toBeNull();
  });

  it('les villes sont à leur place les unes par rapport aux autres', () => {
    const lille = etoileDepartement('59')!, marseille = etoileDepartement('13')!, brest = etoileDepartement('29')!, strasbourg = etoileDepartement('67')!;
    expect(lille.y).toBeLessThan(marseille.y);       // Lille au nord de Marseille
    expect(brest.x).toBeLessThan(strasbourg.x);      // Brest à l'ouest de Strasbourg
    expect(Math.abs(etoileDepartement('08')!.x - CHATEAU[0])).toBeLessThan(10); // Charleville tout près du château
  });

  it('tout tient dans le cadre de la carte', () => {
    for (const [la, lo] of [[51.09, 2.55], [41.38, 9.22], [48.35, -4.75], [42.45, 3.17]] as [number, number][]) {
      const [x, y] = projeter(la, lo);
      expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(900);
      expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(870);
    }
  });

  it('outre-mer dans l\'encadré, département inconnu sans étoile', () => {
    expect(etoileDepartement('974')!.outreMer).toBe(true);
    expect(etoileDepartement('')).toBeNull();
    expect(etoileDepartement('20')).toBeNull();
  });
});
