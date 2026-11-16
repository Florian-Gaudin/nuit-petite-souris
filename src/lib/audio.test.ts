// La bande-son : chaque son et chaque ambiance demandés par l'appli existent dans public/audio/index.json,
// et chaque boucle est cohérente avec son fichier.
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const racine = join(import.meta.dirname, '..', '..');
const index = JSON.parse(readFileSync(join(racine, 'public', 'audio', 'index.json'), 'utf8')) as {
  musique: Record<string, { fichier: string; debutBoucle: number; finBoucle: number }>;
  bruitages: { fichier: string; duree: number; sons: Record<string, [number, number][]> };
};
const sources = readdirSync(join(racine, 'src', 'legacy')).filter(f => f.endsWith('.js')).map(f => readFileSync(join(racine, 'src', 'legacy', f), 'utf8')).join('\n');

describe('la bande-son', () => {
  it('chaque bruitage appelé existe (sauf le concert, joué en code)', () => {
    const noms = new Set<string>();
    for (const re of [/SON\.play\('([a-z0-9]+)'\)/g, /\bson\('([a-z0-9]+)'\)/g, /son: '([a-z0-9]+)'/g]) for (const m of sources.matchAll(re)) noms.add(m[1]);
    ['coup1', 'coup2', 'coup3', 'ronfle'].forEach(n => noms.add(n)); // SON.play('coup' + n), ronflement du chat
    noms.delete('concert');
    const manquants = [...noms].filter(n => !index.bruitages.sons[n]);
    expect(manquants).toEqual([]);
  });
  it('chaque ambiance demandée existe', () => {
    const noms = new Set<string>();
    for (const m of sources.matchAll(/ambiance\('([a-z]+)'\)/g)) noms.add(m[1]);
    for (const m of sources.matchAll(/ambiance: "([a-z]+)"/g)) noms.add(m[1]);
    noms.delete('silence');
    expect([...noms].filter(n => !index.musique[n])).toEqual([]);
  });
  it('les fichiers existent, les boucles durent de 45 à 95 secondes', () => {
    for (const [nom, m] of Object.entries(index.musique)) {
      expect(existsSync(join(racine, 'public', 'audio', m.fichier)), nom).toBe(true);
      const L = m.finBoucle - m.debutBoucle;
      expect(L, nom).toBeGreaterThanOrEqual(45);
      expect(L, nom).toBeLessThan(95);
    }
    expect(existsSync(join(racine, 'public', 'audio', index.bruitages.fichier))).toBe(true);
  });
  it('chaque bruitage tient dans la planche, sans chevauchement', () => {
    const tous = Object.values(index.bruitages.sons).flat().sort((a, b) => a[0] - b[0]);
    tous.forEach(([debut, duree], i) => {
      expect(debut + duree).toBeLessThanOrEqual(index.bruitages.duree);
      if (i) expect(debut).toBeGreaterThan(tous[i - 1][0] + tous[i - 1][1]);
    });
  });
  it('le poids total reste dans le budget (12 Mo)', () => {
    const poids = (d: string): number => readdirSync(d).reduce((n, f) => { const c = join(d, f); return n + (statSync(c).isDirectory() ? poids(c) : statSync(c).size); }, 0);
    expect(poids(join(racine, 'public', 'audio'))).toBeLessThan(12e6);
  });
});
