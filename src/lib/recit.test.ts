import { describe, expect, it } from 'vitest';
import { type Profil, PROFIL_EXEMPLE, encoderProfil, decoderProfil } from './profil';
import { vocabulaire, resoudre, nombreEnLettres, ordinal } from './recit';

// Trois enfants, trois histoires
const PREMIERE: Profil = { ...structuredClone(PROFIL_EXEMPLE), prenom: 'Léo', genre: 'g', doudou: { type: 'aucun', nom: '' }, dents: { nuit: 81, deja: [] }, billet: 50, cachette: 'bureau' };
const JUMELLE: Profil = structuredClone(PROFIL_EXEMPLE); // Clémentine : 71 cette nuit, 81 déjà tombée
const SUITE: Profil = { ...structuredClone(PROFIL_EXEMPLE), prenom: 'Inès', doudou: { type: 'licorne', nom: 'Paillette' }, fratrie: { prenom: 'Tom', genre: 'g', dortACote: true }, dents: { nuit: 72, deja: [81, 71] }, billet: 10, cachette: 'radiateur' };

describe('récit adaptatif', () => {
  it('nombres et ordinaux en toutes lettres', () => {
    expect(nombreEnLettres(1)).toBe('une'); expect(nombreEnLettres(3)).toBe('trois'); expect(nombreEnLettres(17)).toBe('dix-sept');
    expect(ordinal(1)).toBe('première'); expect(ordinal(2)).toBe('deuxième'); expect(ordinal(20)).toBe('vingtième');
  });

  it('première dent : garçon, sans doudou, 50 € sur le bureau', () => {
    const v = vocabulaire(PREMIERE);
    expect(v.variante).toBe('premiere');
    expect(v.ordinalCourt).toBe('1re');
    expect(v.dentNom).toBe('une incisive centrale du bas');
    expect(v.Chere).toBe('Cher'); expect(v.Amie).toBe('Ami'); expect(v.Exploratrice).toBe('Explorateur'); expect(v.Collectionneuse).toBe('Collectionneur');
    expect(v.aDoudou).toBe(false);
    expect(v.euros).toBe('50');
    expect(v.lieuBillet).toBe('sur ton bureau'); expect(v.cachetteNom).toBe('ton bureau'); expect(v.eteint).toBe('');
  });

  it('jumelle : l\'exemple de Clémentine', () => {
    const v = vocabulaire(JUMELLE);
    expect(v.variante).toBe('jumelle');
    expect(v.ordinal).toBe('deuxième'); expect(v.nbDejaChiffre).toBe(1); expect(v.arcadePremiere).toBe('bas');
    expect(v.Chere).toBe('Chère'); expect(v.Amie).toBe('Amie');
    expect(v.euros).toBe('5'); expect(v.cachetteNom).toBe('ta cheminée'); expect(v.eteint).toBe(', bien éteinte');
  });

  it('suite : frère dans la chambre, 10 € sur le radiateur', () => {
    const v = vocabulaire(SUITE);
    expect(v.variante).toBe('suite');
    expect(v.ordinal).toBe('troisième'); expect(v.nbDeja).toBe('deux');
    expect(v.tonFrere).toBe('ton frère Tom'); expect(v.fratrieACote).toBe(true);
    expect(v.eteint).toBe(', bien éteint'); expect(v.cachetteEtiquette).toBe('RADIATEUR – ÉTEINT');
    expect(v.billetCouleurs.moyen).toBe('#E4A39A');
  });

  it("le cadeau : billet ou pièce, au bon genre et au bon nombre", () => {
    const billet = vocabulaire(JUMELLE), une = vocabulaire({ ...JUMELLE, billet: 1 }), deux = vocabulaire({ ...JUMELLE, billet: 2, cachette: 'coffre' });
    expect(billet.unCadeau).toBe('un billet de 5 euros'); expect(billet.il).toBe('il'); expect(billet.cadeau).toBe('billet');
    expect(une.unCadeau).toBe('une pièce de 1 euro'); expect(une.TonCadeau).toBe('Ta pièce de 1 euro');
    expect(deux.tonCadeau).toBe('ta pièce de 2 euros'); expect(deux.Il).toBe('Elle'); expect(deux.sec).toBe('sèche'); expect(deux.CadeauTrouve).toBe('Pièce trouvée');
    expect(deux.lieuBillet).toBe('sur ton coffre à jouets'); expect(deux.cachetteEtiquette).toBe('COFFRE À JOUETS');
    expect(resoudre({ cadeau: { billet: 'B', piece: 'P' } }, deux)).toBe('P');
  });

  it("le petit paquet surprise et la boîte de chocolats : au bon genre, jamais « au chaud » pour les chocolats", () => {
    const paquet = vocabulaire({ ...JUMELLE, billet: 100 }), choco = vocabulaire({ ...JUMELLE, billet: 101 });
    expect(paquet.cadeau).toBe('paquet'); expect(paquet.unCadeau).toBe('un petit paquet surprise'); expect(paquet.TonCadeau).toBe('Ton petit paquet surprise');
    expect(paquet.il).toBe('il'); expect(paquet.trouvee).toBe('trouvé'); expect(paquet.CadeauTrouve).toBe('Paquet trouvé'); expect(paquet.auChaud).toBe(' au chaud,');
    expect(choco.cadeau).toBe('chocolat'); expect(choco.unCadeau).toBe('une boîte de chocolats'); expect(choco.tonCadeauCourt).toBe('ta boîte de chocolats');
    expect(choco.Il).toBe('Elle'); expect(choco.sec).toBe('sèche'); expect(choco.CadeauTrouve).toBe('Chocolats trouvés');
    expect(choco.auChaud).toBe(''); expect(choco.auChaudFin).toBe('');
    expect(choco.eteint).toBe(', bien éteinte (heureusement pour les chocolats !)');
    expect(vocabulaire({ ...JUMELLE, billet: 101, cachette: 'bureau' }).eteint).toBe('');
    expect(resoudre({ cadeau: { billet: 'B', piece: 'P', paquet: 'Q', chocolat: 'C' } }, choco)).toBe('C');
    // Le cadeau voyage dans le QR code
    for (const billet of [100, 101] as const) expect(decoderProfil(encoderProfil({ ...JUMELLE, billet }))).toMatchObject({ ok: true, profil: { billet } });
  });

  it('aiguillages', () => {
    const t = { variante: { premiere: 'P', jumelle: { deja: { une: 'J1', plusieurs: 'J+' } }, suite: 'S' } };
    expect(resoudre(t, vocabulaire(PREMIERE))).toBe('P');
    expect(resoudre(t, vocabulaire(JUMELLE))).toBe('J1');
    expect(resoudre(t, vocabulaire({ ...JUMELLE, dents: { nuit: 72, deja: [81, 71, 82] } }))).toBe('J+');
    expect(resoudre(t, vocabulaire(SUITE))).toBe('S');
    const f = { fratrie: { aCote: 'à côté', ailleurs: 'ailleurs', non: { doudou: { oui: 'doudou', non: null } } } };
    expect(resoudre(f, vocabulaire(SUITE))).toBe('à côté');
    expect(resoudre(f, vocabulaire({ ...SUITE, fratrie: { prenom: 'Tom', genre: 'g', dortACote: false } }))).toBe('ailleurs');
    expect(resoudre(f, vocabulaire(JUMELLE))).toBe('doudou');
    expect(resoudre(f, vocabulaire(PREMIERE))).toBeNull(); // ligne omise
    expect(resoudre({ txt: 'bulle', expr: 'joie' }, vocabulaire(JUMELLE))).toEqual({ txt: 'bulle', expr: 'joie' });
  });
});
