import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Deux animations du même nom : la seconde remplace la première partout (une montgolfière qui clignotait…)
describe('feuilles de style', () => {
  it("chaque animation (@keyframes) a un nom unique", () => {
    const dossier = join(__dirname, '..', 'styles');
    const noms: string[] = [];
    for (const f of readdirSync(dossier).filter(f => f.endsWith('.css'))) {
      for (const m of readFileSync(join(dossier, f), 'utf8').matchAll(/@keyframes\s+([\w-]+)/g)) noms.push(m[1]);
    }
    const doublons = noms.filter((n, i) => noms.indexOf(n) !== i);
    expect(doublons).toEqual([]);
  });
});
