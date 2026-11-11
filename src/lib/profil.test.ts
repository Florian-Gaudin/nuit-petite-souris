import { describe, expect, it } from 'vitest';
import qrcode from 'qrcode-generator';
import {
  type Profil, PROFIL_EXEMPLE, DENTS_DE_LAIT, adresseProfil, codeDepuisAdresse, configDepuisProfil,
  decoderProfil, encoderProfil, idProfil, verifierProfil, jumelle, varianteDent, rangDent, nomDent, nuitParDefaut, surpriseActive, reveil,
} from './profil';
import LZString from 'lz-string';

const SITE = 'https://florian-gaudin.github.io/nuit-petite-souris/';

// Un profil « maximal » : tous les champs remplis, noms longs, beaucoup de dents
const MAXIMAL: Profil = {
  prenom: 'Marie-Charlotte-Eugénie',
  genre: 'f',
  doudou: { type: 'licorne', nom: 'Paillette des Étoiles' },
  fratrie: { prenom: 'Jean-Baptiste-Alexandre', genre: 'g', dortACote: true },
  chat: 'Monsieur Moustache',
  dents: { nuit: 64, deja: [81, 71, 82, 72, 51, 61, 52, 62, 83, 73, 53, 63] },
  billet: 50,
  cachette: 'table-de-nuit',
  ville: { nom: 'Saint-Rémy-de-Provence', codePostal: '13210', departement: '13' },
  nuit: '2026-11-10',
};

const avec = (modif: (p: Profil) => void): Profil => { const p = structuredClone(MAXIMAL); modif(p); return p; };
// L'ordre des dents déjà tombées n'est pas conservé (masque) : on compare dans l'ordre du schéma
const normal = (p: Profil): Profil => ({ ...p, dents: { ...p.dents, deja: [...p.dents.deja].sort((a, b) => DENTS_DE_LAIT.indexOf(a) - DENTS_DE_LAIT.indexOf(b)) } });

describe('profil', () => {
  it('le profil d\'exemple et le profil maximal sont valides', () => {
    expect(verifierProfil(PROFIL_EXEMPLE)).toEqual([]);
    expect(verifierProfil(MAXIMAL)).toEqual([]);
  });

  it('20 dents de lait', () => {
    expect(DENTS_DE_LAIT).toHaveLength(20);
    expect(DENTS_DE_LAIT).toContain(51);
    expect(DENTS_DE_LAIT).toContain(85);
  });

  it('aller-retour sans perte', () => {
    for (const p of [PROFIL_EXEMPLE, MAXIMAL, avec(p => { p.fratrie = null; p.nuit = null; p.doudou = { type: 'aucun', nom: '' }; })]) {
      const l = decoderProfil(encoderProfil(p));
      expect(l.ok).toBe(true);
      if (l.ok) expect(l.profil).toEqual(normal(p));
    }
  });

  it('l\'adresse transporte le profil après #p=', () => {
    const url = adresseProfil(SITE, MAXIMAL);
    expect(url.startsWith(SITE + '#p=')).toBe(true);
    const code = codeDepuisAdresse(new URL(url).hash);
    expect(code).not.toBeNull();
    const l = decoderProfil(code!);
    expect(l.ok && l.profil.prenom).toBe('Marie-Charlotte-Eugénie');
    expect(codeDepuisAdresse('#3')).toBeNull();
    expect(codeDepuisAdresse('')).toBeNull();
  });

  it('le QR code reste petit et lisible en A6 même pour un profil maximal', () => {
    const url = adresseProfil(SITE, MAXIMAL);
    expect(url.length).toBeLessThan(330);
    const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
    const version = (qr.getModuleCount() - 17) / 4;
    console.log(`adresse ${url.length} caractères → QR version ${version} (${qr.getModuleCount()} modules)`);
    expect(version).toBeLessThanOrEqual(13);
  });

  it('refuse les valeurs invalides', () => {
    expect(verifierProfil(avec(p => { p.prenom = '<img src=x onerror=alert(1)>'; }))).toContain('prénom');
    expect(verifierProfil(avec(p => { p.prenom = ''; }))).toContain('prénom');
    expect(verifierProfil(avec(p => { p.prenom = 'A'.repeat(41); }))).toContain('prénom');
    expect(verifierProfil(avec(p => { p.ville.nom = 'Paris"><script>'; }))).toContain('ville');
    expect(verifierProfil(avec(p => { (p as any).billet = 7; }))).toContain('billet');
    expect(verifierProfil(avec(p => { p.dents.nuit = 99; }))).toContain('dent de la nuit');
    expect(verifierProfil(avec(p => { p.dents.deja = [81, 81]; }))).toContain('dents déjà tombées');
    expect(verifierProfil(avec(p => { p.dents.deja = [64]; }))).toContain('dents déjà tombées');
    expect(verifierProfil(avec(p => { p.nuit = '2026-02-30'; }))).toContain('date');
    expect(verifierProfil(avec(p => { (p as any).cachette = 'cave'; }))).toContain('cachette');
  });

  it('un code abîmé ou forgé est refusé sans planter', () => {
    expect(decoderProfil('nimportequoi').ok).toBe(false);
    expect(decoderProfil('').ok).toBe(false);
    const forge = (s: string) => decoderProfil(LZString.compressToEncodedURIComponent(s));
    expect(forge('1|<b>x</b>|f|0|Nicolas|Pantoufle|71|1|5|0|Aiglemont|08090|08||').ok).toBe(false);
    expect(forge('1|Léa|f|0|Nicolas|Pantoufle|71|1|7|0|Aiglemont|08090|08||').ok).toBe(false);   // billet 7 €
    expect(forge('1|Léa|f|0|Nicolas|Pantoufle|71|zzzzzz|5|0|Aiglemont|08090|08||').ok).toBe(false); // masque hors limites
    expect(forge('1|Léa|f|0|Nicolas|Pantoufle|71|1|5|0|Aiglemont').ok).toBe(false);                // champs manquants
    expect(forge('1|Léa|f|0|Nicolas|Pantoufle|71|1|5|0|Aiglemont|08090|08||').ok).toBe(true);      // le bon, pour comparaison
    expect(forge('99|Léa|f').ok).toBe(false);
    expect(forge('99|Léa|f')).toEqual({ ok: false, raison: 'version inconnue' });
  });

  it('identifiant stable et différent d\'un profil à l\'autre', () => {
    expect(idProfil(MAXIMAL)).toBe(idProfil(structuredClone(MAXIMAL)));
    expect(idProfil(MAXIMAL)).not.toBe(idProfil(PROFIL_EXEMPLE));
    expect(idProfil(avec(p => { p.dents.nuit = 65; }))).not.toBe(idProfil(MAXIMAL));
  });

  it('traduction vers la configuration du moteur actuel', () => {
    const c = configDepuisProfil(PROFIL_EXEMPLE, SITE + '#p=x');
    expect(c.enfant).toBe('Clémentine');
    expect(c.poupee).toBe('Nicolas');
    expect(c.ville).toBe('Aiglemont');
    expect(c.billet.lieu).toBe('sur la cheminée');
    expect(c.dents).toEqual([
      { numero: 1, position: 'bas-centrale-gauche', code: 81 },
      { numero: 2, position: 'bas-centrale-droite', code: 71 },
    ]);
    expect(configDepuisProfil(MAXIMAL, '').billet.lieu).toBe('sur ta table de nuit');
  });

  it("jumelles, variantes d'histoire et rang", () => {
    expect(jumelle(81)).toBe(71); expect(jumelle(71)).toBe(81); expect(jumelle(51)).toBe(61); expect(jumelle(65)).toBe(55);
    expect(varianteDent({ nuit: 81, deja: [] })).toBe('premiere');
    expect(varianteDent({ nuit: 71, deja: [81] })).toBe('jumelle');
    expect(varianteDent({ nuit: 72, deja: [81, 71] })).toBe('suite');
    expect(varianteDent({ nuit: 82, deja: [81, 71, 72] })).toBe('jumelle');
    expect(rangDent({ nuit: 82, deja: [81, 71, 72] })).toBe(4);
    expect(nomDent(81)).toBe('incisive centrale du bas, à droite');
    expect(nomDent(64)).toBe('première molaire du haut, à gauche');
  });

  it('nuit par défaut : avant midi la nuit passée, après midi celle qui vient', () => {
    expect(nuitParDefaut(new Date('2026-11-11T08:00:00'))).toBe('2026-11-10');
    expect(nuitParDefaut(new Date('2026-11-11T20:00:00'))).toBe('2026-11-11');
  });

  it('accepte les très longs noms de communes', () => {
    expect(verifierProfil(avec(p => { p.ville.nom = 'Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson'; }))).toEqual([]);
    expect(verifierProfil(avec(p => { p.ville.nom = "L'Haÿ-les-Roses"; }))).toEqual([]);
  });

  it('mode surprise : l’histoire se découvre le lendemain de la nuit, à partir de 5 h', () => {
    const p = { nuit: '2026-11-10' };
    expect(reveil('2026-11-10').toString()).toBe(new Date('2026-11-11T05:00:00').toString());
    expect(surpriseActive(p, new Date('2026-11-10T20:00:00'))).toBe(true);  // le soir même
    expect(surpriseActive(p, new Date('2026-11-11T03:00:00'))).toBe(true);  // en pleine nuit
    expect(surpriseActive(p, new Date('2026-11-11T05:00:00'))).toBe(false); // au réveil
    expect(surpriseActive(p, new Date('2026-11-20T10:00:00'))).toBe(false); // des jours après
    expect(surpriseActive({ nuit: null }, new Date('2026-11-10T20:00:00'))).toBe(false); // pas de date : pas de surprise
    expect(surpriseActive({ nuit: '2026-12-31' }, new Date('2027-01-01T06:00:00'))).toBe(false); // changement d'année
  });
});
