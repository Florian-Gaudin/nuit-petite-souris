// Le récit adaptatif : Clémentine retrouve mot pour mot les textes d'origine ; Léo et Inès ont leur version
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { LEO, INES, code, ouvrir, rendu } from './aide';

const ORIGINE: { textes: { chemin: (string | number)[]; texte: string }[] } = JSON.parse(readFileSync(new URL('../fixtures/textes-origine.json', import.meta.url), 'utf8'));

test('Clémentine : textes identiques mot pour mot à la première histoire', async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  const ecarts: string[] = [];
  for (const { chemin, texte } of ORIGINE.textes) {
    const nouveau = chemin[0] === 'lettre'
      ? await page.evaluate(([liste, i]) => { const W = window as any; const l = W.DATA[liste].map((x: any) => { const r = W.RECIT.resoudre(x); return r == null ? null : String(typeof r === 'string' ? r : r.txt).replace(/\{(\w+)\}/g, (m: string, k: string) => W.CONFIG[k] ?? m); }).filter((x: any) => x != null); return l[i as number]; }, chemin)
      : await rendu(page, chemin);
    if (nouveau !== texte) ecarts.push(`${chemin.join('.')}\n  avant : ${texte}\n  après : ${nouveau}`);
  }
  expect(ecarts, ecarts.join('\n')).toEqual([]);
  expect(ORIGINE.textes.length).toBeGreaterThanOrEqual(18); // l'ancienne scène 13 (3 textes) est devenue le théâtre
});

test('Léo : première dent, garçon, sans doudou, 50 € sur le bureau', async ({ page }) => {
  await ouvrir(page, '#p=' + code(LEO));
  expect(await rendu(page, ['scenes', 0, 'intro'])).toContain('Elle attend ta toute première dent');
  expect(await rendu(page, ['scenes', 0, 'elements', 'sac', 'bulle'])).toContain('billet de 50 euros');
  expect(await rendu(page, ['scenes', 5, 'elements', 'billet', 'reponse'])).toContain('je le ferai sécher sur ton bureau.');
  expect(await rendu(page, ['scenes', 9, 'elements', 'yeux', 'reponse'])).toContain('toute la maison va se réveiller');
  expect(await rendu(page, ['lettre', 0])).toBe('Cher Léo,');
  expect(await rendu(page, ['badges', 6, 'nom'])).toBe('Première dent');
  await page.goto('certificat/#p=' + code(LEO));
  await expect(page.locator('.dip-texte')).toContainText('1re dent de lait');
  await expect(page.locator('.dip-texte')).toContainText('50 €');
  await expect(page.locator('.dip-sign')).toContainText('la lune');
});

test('Inès : troisième dent, licorne, frère Tom dans la chambre, 10 € sur le radiateur', async ({ page }) => {
  await ouvrir(page, '#p=' + code(INES));
  expect(await rendu(page, ['scenes', 0, 'elements', 'lanterne', 'demande'])).toContain('ta troisième dent est tombée');
  expect(await rendu(page, ['scenes', 8, 'elements', 'vitre', 'reponse'])).toContain('et Tom aussi, dans son lit');
  expect(await rendu(page, ['scenes', 9, 'elements', 'yeux', 'reponse'])).toContain('ton frère Tom va se réveiller');
  expect(await rendu(page, ['camera', 'cheminee'])).toMatch(/^Voilà ton radiateur, bien éteint\..*au chaud/);
  expect(await rendu(page, ['badges', 6, 'nom'])).toBe('Collectionneuse');
  await page.goto('certificat/#p=' + code(INES));
  await expect(page.locator('.dip-rang')).toContainText('3e dent de lait');
  await expect(page.locator('.dip-dent-nom')).toContainText('une incisive latérale du bas');
  await expect(page.locator('.dip-sign')).toContainText('Paillette');
  await expect(page.locator('.machoire path[fill="#D64045"]')).toHaveCount(1);
  await expect(page.locator('.machoire path[fill="#F2A3B5"]')).toHaveCount(2);
});

test('Jade : appartement au bord de la Seine, doudou linge', async ({ page }) => {
  const JADE = { ...structuredClone(LEO), prenom: 'Jade', genre: 'f' as const, logement: 'appartement' as const, riviere: 'la Seine', doudou: { type: 'linge' as const, nom: 'Lange' } };
  await ouvrir(page, '#p=' + code(JADE));
  expect(await rendu(page, ['scenes', 5, 'titre'])).toBe('La Seine');
  expect(await rendu(page, ['scenes', 5, 'intro'])).toContain('Voilà la Seine !');
  expect(await rendu(page, ['scenes', 6, 'pont'])).toContain('C\'est écrit Lyon');
  expect(await rendu(page, ['scenes', 7, 'intro'])).toContain('Tous les immeubles dorment');
  expect(await rendu(page, ['scenes', 7, 'elements', 'girouette', 'reponse'])).toContain('Ton immeuble est par là');
  expect(await rendu(page, ['scenes', 9, 'intro'])).toContain('Le palier est tout calme');
  expect(await rendu(page, ['scenes', 9, 'elements', 'yeux', 'reponse'])).toContain('Il dort sur le paillasson');
  expect(await rendu(page, ['camera', 'intro'])).toContain('glissée sous la porte');
  expect(await rendu(page, ['lettre', 4])).toContain('a traversé la Seine en bateau');
  // Jamais « la maison » pour un appartement
  expect(await rendu(page, ['jeu', 'entrer'])).toBe("Entrer dans l'appartement");
  expect(await rendu(page, ['lampe', 'intro'])).toContain("tout noir dans l'appartement");
  // Les dessins : immeubles, palier, panneau de la ville, doudou linge dans la caméra
  await ouvrir(page, '?chapitre=1&scene=6#p=' + code(JADE));
  await expect(page.locator('.decor-lievre .panneau text')).toHaveText('Lyon');
  await ouvrir(page, '?chapitre=1&scene=9#p=' + code(JADE));
  await expect(page.locator('svg.decor-pantoufle.palier')).toHaveCount(1);
  await ouvrir(page, '?chapitre=3&t=34#p=' + code(JADE));
  expect(await page.locator('#doudou').evaluate(g => g.childElementCount)).toBeGreaterThan(2);
  // Sans cours d'eau indiqué : « la rivière »
  await ouvrir(page, '#p=' + code({ ...JADE, riviere: '' }));
  expect(await rendu(page, ['scenes', 5, 'intro'])).toContain('Voilà la rivière !');
});

test('Noé : une pièce de 1 euro, posée sur le coffre à jouets', async ({ page }) => {
  const NOE = { ...structuredClone(LEO), prenom: 'Noé', billet: 1 as const, cachette: 'coffre' as const, riviere: '' };
  await ouvrir(page, '#p=' + code(NOE));
  expect(await rendu(page, ['scenes', 0, 'elements', 'sac', 'bulle'])).toContain("C'est une pièce de 1 euro, pour te remercier");
  expect(await rendu(page, ['scenes', 5, 'elements', 'billet', 'demande'])).toContain('Une pièce, ça coule');
  expect(await rendu(page, ['scenes', 5, 'elements', 'billet', 'reponse'])).toContain('je la ferai sécher sur ton coffre à jouets.');
  expect(await rendu(page, ['camera', 'cheminee'])).toBe('Voilà ton coffre à jouets. Je pose ta pièce dessus : elle va sécher jusqu\'au matin.');
  expect(await rendu(page, ['lettre', 4])).toBe('Ta pièce de 1 euro a traversé la rivière en bateau. Elle sèche sur ton coffre à jouets : va vite la chercher !');
  expect(await rendu(page, ['boutonLettre'])).toBe("J'ai trouvé ma pièce !");
  // Le bouton de la fin de la lettre : le texte et l'icône de la pièce
  await ouvrir(page, '?chapitre=4#p=' + code(NOE));
  await page.locator('#cachet').click();
  await page.locator('#btn-tout').click();
  const bouton = page.locator('#bandeau-actions button', { hasText: "J'ai trouvé ma pièce" });
  await expect(bouton).toBeVisible();
  await expect(bouton.locator('circle')).toHaveCount(2);
  expect(await rendu(page, ['badges', 7, 'nom'])).toBe('Pièce trouvée');
  // Les dessins : la pièce, puis la coquille de noix sur la rivière
  await ouvrir(page, '?chapitre=1&scene=5#p=' + code(NOE));
  await expect(page.locator('symbol#billet circle')).toHaveCount(2);
  await expect(page.locator('.tap[data-el="billet"] .pli1 path').first()).toHaveAttribute('fill', '#A47B54');
  await page.goto('certificat/#p=' + code(NOE));
  await expect(page.locator('.dip-texte')).toContainText('Sa pièce de 1 €');
});

test('dessins personnalisés : billet, doudou, cachette, frère dans la caméra', async ({ page }) => {
  await ouvrir(page, '?chapitre=1&scene=2#p=' + code(LEO));
  await expect(page.locator('#billet text').first()).toHaveText('50');
  await ouvrir(page, '?chapitre=3&t=34#p=' + code(INES));
  expect(await page.locator('#doudou').evaluate(g => g.childElementCount)).toBeGreaterThan(3);
  await expect(page.locator('#fratrie')).toHaveCount(1);
  await ouvrir(page, '?chapitre=3&t=34#p=' + code(LEO));
  expect(await page.locator('#doudou').evaluate(g => g.childElementCount)).toBe(0);
  await expect(page.locator('#fratrie')).toHaveCount(0);
});

test("le conseil des secrets ne s'affiche pas si l'enfant a déjà trouvé une étoile", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=0#exemple');
  // Pendant l'introduction, l'enfant touche le sac : une étoile secrète
  await page.locator('.tap[data-el="sac"]').click();
  await expect.poll(() => page.evaluate(() => (window as any).APP.state.etoiles.chateau?.length ?? 0)).toBe(1);
  // On avance jusqu'à la demande de la lanterne : jamais de conseil en chemin
  const vus: string[] = [];
  for (let i = 0; i < 40; i++) {
    vus.push((await page.locator('#bandeau-texte').textContent()) || '');
    if (vus[vus.length - 1].includes('Allume ma lanterne')) break;
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) await page.locator('.bandeau-suite').click();
    await page.waitForTimeout(250);
  }
  expect(vus.some(t => t.includes('Allume ma lanterne'))).toBe(true);
  expect(vus.some(t => t.includes('Un conseil'))).toBe(false);
});

test("après un secret, le conseil déjà lu ne revient pas : l'histoire passe à la demande", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=0#exemple');
  // On avance jusqu'au conseil, lu en entier
  for (let i = 0; i < 40 && !((await page.locator('#bandeau-texte').textContent()) || '').includes('Un conseil'); i++) {
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) await page.locator('.bandeau-suite').click();
    await page.waitForTimeout(250);
  }
  await expect(page.locator('#bandeau.attente')).toBeVisible();
  // L'enfant touche le sac, lit le secret, puis « Suite » : directement la lanterne
  await page.locator('.tap[data-el="sac"]').click();
  await expect(page.locator('#bandeau.interrompu.attente')).toBeVisible({ timeout: 20_000 });
  await page.locator('.bandeau-suite').click();
  await expect(page.locator('#bandeau-texte')).toContainText('Allume ma lanterne');
  await expect(page.locator('#bandeau-texte')).not.toContainText('Un conseil');
});

test('les saisons suivent la date de la nuit, et restent dehors', async ({ page }) => {
  for (const [nuit, saison] of [['2026-12-24', 'hiver'], ['2026-04-10', 'printemps'], ['2026-07-14', 'ete'], ['2026-10-31', 'automne']]) {
    await ouvrir(page, '?chapitre=1&scene=0#p=' + code({ ...structuredClone(LEO), nuit }));
    await expect(page.locator(`svg.decor .saison-${saison}`)).toHaveCount(1);
  }
  // Sur le palier d'un immeuble, pas de neige
  await ouvrir(page, '?chapitre=1&scene=9#p=' + code({ ...structuredClone(LEO), nuit: '2026-12-24', logement: 'appartement' }));
  await expect(page.locator('svg.decor .saison')).toHaveCount(0);
});

test("la grande fenêtre embuée : on frotte la buée, la chambre apparaît", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=8#exemple');
  const b = (await page.locator('.decor-fenetre .voile').boundingBox())!;
  // Le doigt balaie la vitre de haut en bas
  await page.mouse.move(b.x + 10, b.y + 10);
  await page.mouse.down();
  for (let i = 0; i < 16; i++) await page.mouse.move(b.x + 10 + (i % 2) * (b.width - 20), b.y + 10 + i * (b.height - 20) / 15, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator('.decor-fenetre .buee.evapore')).toHaveCount(1);
  // L'histoire continue d'elle-même une fois la demande posée
  for (let i = 0; i < 20 && !(await page.locator('.tap[data-el="vitre"].fait').count()); i++) {
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) await page.locator('.bandeau-suite').click();
    await page.waitForTimeout(250);
  }
  await expect(page.locator('.tap[data-el="vitre"].fait')).toHaveCount(1);
  await expect(page.locator('#bandeau-texte')).toContainText("C'est bien ta chambre");
});

test("la constellation : l'étoile suivante clignote, le compte s'affiche, la dent s'illumine", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=4#exemple');
  for (let i = 0; i < 20 && !(await page.locator('.tap[data-el="constellation"].cible').count()); i++) {
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) await page.locator('.bandeau-suite').click();
    await page.waitForTimeout(250);
  }
  await page.locator('.pt-1 use').click();
  await expect(page.locator('.pt-2')).toHaveClass(/prochaine/);
  await expect(page.locator('#bandeau-texte')).toContainText('Une…');
  for (let n = 2; n <= 7; n++) { await page.waitForFunction(() => !(window as any).NARR.lit); await page.locator(`.pt-${n} use`).click(); }
  await expect(page.locator('.tap[data-el="constellation"]')).toHaveClass(/dessine/);
  // Pas de particules de saison dans le ciel étoilé ; la montgolfière traverse l'écran
  await expect(page.locator('svg.decor-etoiles .saison')).toHaveCount(0);
  await expect(page.locator('svg.decor-etoiles.envol')).toHaveCount(1);
});

test("répondre à Quenotte (dessin) et l'album des dents", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=4#exemple');
  await page.locator('#cachet').click();
  await page.locator('#btn-tout').click();
  // Le dessin
  await page.locator('#btn-dessin').click();
  await expect(page.locator('.toile-invite')).toBeVisible(); // « Dessine ici avec ton doigt »
  const t = (await page.locator('.toile').boundingBox())!;
  await page.mouse.move(t.x + 40, t.y + 40); await page.mouse.down();
  await page.mouse.move(t.x + t.width - 40, t.y + t.height - 40, { steps: 10 }); await page.mouse.up();
  await page.locator('.atelier [data-a="envoyer"]').click();
  await expect(page.locator('.atelier')).toHaveCount(0);
  // Un vrai dessin envoyé : le badge « Artiste de la nuit »
  await expect.poll(() => page.evaluate(() => (window as any).APP.state.badges)).toContain('artiste');
  // L'aperçu sous la lettre, et le bouton devient « Modifier mon dessin »
  await expect(page.locator('#dessin-lettre .dessin-enfant img')).toBeVisible();
  await expect(page.locator('#btn-dessin')).toContainText('Modifier mon dessin');
  // Le diplôme (épilogue déjà vu) : le dessin, et l'histoire rangée dans l'album
  await page.evaluate(() => { const A = (window as any).APP; A.state.epilogue = true; A.state.unlocked = 5; A.show(5, { diplome: true, temps: 'tableau' }); });
  await expect(page.locator('#btn-dessin5 .mini-dessin img')).toBeVisible();
  await expect(page.locator('#btn-dessin5')).toContainText('Ton dessin pour Quenotte');
  // On peut le modifier depuis l'écran de fin
  await page.locator('#btn-dessin5').click();
  await expect(page.locator('.atelier .toile')).toBeVisible();
  await page.locator('.atelier [data-a="envoyer"]').click();
  await expect(page.locator('#btn-dessin5 .mini-dessin img')).toBeVisible();
  await page.locator('#btn-album5').click();
  await expect(page.locator('.album-page h3')).toHaveText('Clémentine');
  await expect(page.locator('.album-explication')).toContainText("s'ajoute ici");
  await expect(page.locator('.album-page li')).toHaveCount(1);
  await page.locator('.album [data-a="fermer"]').click();
  // Le dessin s'imprime avec le diplôme
  await page.goto('certificat/#exemple');
  await expect(page.locator('.dessin-imprime img')).toBeVisible();
  // L'album depuis l'écran de choix
  await ouvrir(page, './');
  await page.locator('#lien-album').click();
  await expect(page.locator('.album-page h3')).toHaveText('Clémentine');
  // Supprimer : un premier toucher demande confirmation, le second retire l'histoire
  await page.locator('.album .supprimer').click();
  await expect(page.locator('.album .supprimer')).toHaveText('Sûr ? Touche encore');
  const bs = (await page.locator('.album .supprimer').boundingBox())!;
  expect(bs.x + bs.width).toBeLessThanOrEqual(page.viewportSize()!.width); // rien ne déborde de l'écran
  await page.locator('.album .supprimer').click();
  await expect(page.locator('.album-page')).toHaveCount(0);
  await expect(page.locator('.album')).toContainText("L'album se remplit");
  // L'album vide : plus de bouton sur l'accueil (il revient avec la prochaine histoire terminée)
  await page.locator('.album [data-a="fermer"]').click();
  await ouvrir(page, '?reset=1#exemple');
  await page.locator('#btn-prefs').click();
  await expect(page.locator('#pref-changer')).toContainText('Accueil');
  await page.locator('#pref-changer').click();
  await expect(page.locator('.ecran-choix')).toBeVisible();
  await expect(page.locator('#lien-album')).toHaveCount(0);
});

test("le lièvre repart au galop, Quenotte sur le dos, et sort par la droite", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=6#exemple');
  for (let i = 0; i < 60 && !(await page.locator('#bandeau-actions button', { hasText: 'Scène suivante' }).count()); i++) {
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) await page.locator('.bandeau-suite').click();
    else if (await page.locator('.tap[data-el="lievre"].cible').count() && !(await page.evaluate(() => (window as any).NARR.lit))) await page.locator('.tap[data-el="lievre"] .corps-lievre').click({ force: true });
    await page.waitForTimeout(250);
  }
  await page.locator('#bandeau-actions button', { hasText: 'Scène suivante' }).click();
  await expect(page.locator('svg.decor-lievre.repart')).toHaveCount(1);
});

test("la buée s'efface en glissant le doigt, sans le lever (vrai geste tactile)", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=8#exemple');
  const b = (await page.locator('.decor-fenetre .voile').boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  const touche = (type: string, x: number, y: number) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  // Un seul geste : le doigt se pose, balaie toute la vitre en zigzag, puis se lève
  await touche('touchStart', b.x + 10, b.y + 10);
  for (let i = 0; i <= 15; i++) for (let s = 1; s <= 6; s++) {
    const x = b.x + 10 + ((i % 2 ? 6 - s : s) / 6) * (b.width - 20), y = b.y + 10 + i * (b.height - 20) / 15;
    await touche('touchMove', x, y);
  }
  await touche('touchEnd', 0, 0);
  await expect(page.locator('.decor-fenetre .buee.evapore')).toHaveCount(1);
});

test("le mini-jeu du chat : le palier pour un appartement", async ({ page }) => {
  const JADE = { ...structuredClone(LEO), prenom: 'Jade', logement: 'appartement' as const };
  await ouvrir(page, '?chapitre=2#p=' + code(JADE));
  await expect(page.locator('svg.jeu')).toHaveAttribute('aria-label', /de l’appartement/);
  await expect(page.locator('svg.jeu rect[fill="#3a3550"]')).toHaveCount(1); // le mur du palier
  await ouvrir(page, '?chapitre=2#p=' + code(LEO));
  await expect(page.locator('svg.jeu rect[fill="#3a3550"]')).toHaveCount(0); // la maison : le jardin, comme avant
});

test("l'épilogue revient à chaque fin d'histoire, même en relecture", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  for (const tour of [1, 2]) {
    await ouvrir(page, '?chapitre=4#exemple');
    await page.locator('#cachet').click();
    await page.locator('#btn-tout').click();
    await page.locator('#bandeau-actions button', { hasText: 'billet' }).click();
    await expect(page.locator('svg.retour'), `tour ${tour}`).toBeVisible();
    // On saute au diplôme (comme à la fin de l'épilogue) : l'histoire est terminée
    await page.evaluate(() => { const A = (window as any).APP; A.state.fini = true; A.show(5, { diplome: true }); });
    await expect(page.locator('.diplome')).toBeVisible();
  }
});

test("recommencer l'histoire efface le dessin ; chaque histoire garde le sien", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  const dessin = 'data:image/png;base64,iVBORw0KGgo=';
  await page.evaluate(d => (window as any).STOCKAGE.ecrire('souris.dessin.' + (window as any).PROFIL.id, d), dessin);
  // Une autre histoire (Léo) : pas de dessin, une feuille blanche
  await ouvrir(page, '?chapitre=4#p=' + code(LEO));
  await page.locator('#cachet').click(); await page.locator('#btn-tout').click();
  await expect(page.locator('#dessin-lettre .dessin-enfant')).toHaveCount(0);
  // Retour à Clémentine : son dessin est toujours là
  await ouvrir(page, '?chapitre=4#exemple');
  await page.locator('#cachet').click(); await page.locator('#btn-tout').click();
  await expect(page.locator('#dessin-lettre .dessin-enfant')).toHaveCount(1);
  // Recommencer : le dessin est effacé, la feuille est blanche
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=4#exemple');
  await page.locator('#cachet').click(); await page.locator('#btn-tout').click();
  await expect(page.locator('#dessin-lettre .dessin-enfant')).toHaveCount(0);
  await expect(page.locator('#dessin-lettre')).toContainText('Réponds à Quenotte');
  await page.locator('#btn-dessin').click();
  await expect(page.locator('.toile-invite')).toBeVisible();
});

test("histoire terminée : le « 5 » rejoue l'épilogue, et « Passer » franchit chaque étape", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  // Pas encore terminée : pas de bouton « Passer »
  await ouvrir(page, '?chapitre=1&scene=0#exemple');
  await expect(page.locator('#btn-passer')).toBeHidden();
  // Terminée : le bouton apparaît et passe d'une scène à la suivante
  await page.evaluate(() => { const A = (window as any).APP; A.state.fini = true; A.state.unlocked = 5; A.show(1, { scene: 0 }); });
  await page.locator('#btn-passer').click();
  await expect(page.locator('svg.decor-foret')).toBeVisible();
  // Le « 5 » du ruban : l'épilogue (et pas directement le diplôme)
  await page.locator('.perle[data-n="5"]').click();
  await expect(page.locator('svg.retour')).toBeVisible();
  await page.locator('#btn-passer').click();                       // les nuages
  await expect(page.locator('svg.terrier')).toBeVisible();
  await expect(page.locator('.tresors .tresor')).toHaveCount(4);   // les trésors, en grisé
  await expect(page.locator('.tresors-n')).toHaveText('0');
  // Rien de l'étape précédente (les nuages) ne reste : pas de bouton « Suite » parasite
  await page.waitForTimeout(2500);
  await expect(page.locator('#bandeau-actions button', { hasText: 'Suite' })).toHaveCount(0);
  await page.locator('#btn-passer').click();                       // le terrier
  await expect(page.locator('svg.boite')).toBeVisible();
  await page.locator('#btn-passer').click();                       // la boîte à trésors
  await expect(page.locator('.diplome')).toBeVisible();
  await expect(page.locator('#btn-passer')).toBeHidden();
});

test("la caméra s'arrête quand on la quitte : pas de « cheminée » pendant l'épilogue", async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'no-preference' }); // la caméra ne chuchote qu'avec les animations
  await ouvrir(page, '?chapitre=3#exemple');
  // Quenotte chuchote : la caméra se met en pause en attendant un toucher sur le bandeau
  await expect(page.locator('.attente')).toHaveCount(1, { timeout: 15000 });
  // On part relire la lettre, puis l'épilogue
  await page.evaluate(() => { const A = (window as any).APP; A.state.unlocked = 5; A.show(4); });
  await page.locator('#cachet').dispatchEvent('click'); // le cachet bat doucement : jamais « stable »
  await page.locator('#btn-tout').click();
  await page.locator('#bandeau-actions button', { hasText: 'billet' }).click();
  await expect(page.locator('svg.retour')).toBeVisible();
  // Avant la correction, le premier « Suite » relançait la caméra cachée, qui chuchotait « Voilà ta cheminée… »
  // « Suite ▸ » sur le bandeau : c'est ce toucher que la caméra attendait encore
  for (let i = 0; i < 3; i++) { await page.locator('.bandeau-suite').dispatchEvent('click'); await page.waitForTimeout(800); }
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(1000);
    await expect(page.locator('#bandeau-texte')).not.toContainText('cheminée');
    expect(await page.locator('#bandeau-actions button').count()).toBeLessThanOrEqual(1);
  }
});

test("le bouton « Passer » reste là d'une scène à l'autre (histoire terminée)", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1#exemple');
  await page.evaluate(() => { const A = (window as any).APP; A.state.fini = true; A.state.unlocked = 5; A.show(1, { scene: 0 }); });
  for (let i = 0; i < 3; i++) {
    await expect(page.locator('#btn-passer'), `scène ${i + 1}`).toBeVisible();
    await page.locator('#btn-passer').click();
    await expect(page.locator('#btn-passer')).toBeHidden();
  }
  await expect(page.locator('#btn-passer')).toBeVisible();
});


test("pas de bouton « Passer » sur le diplôme, la dernière étape", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await page.evaluate(() => { const A = (window as any).APP; A.state.fini = true; A.state.unlocked = 5; A.show(5); });
  // Retour en montgolfière → terrier → boîte à trésors → diplôme, en passant chaque étape
  for (const etape of ['svg.terrier', 'svg.boite', '.diplome']) {
    await page.locator('#btn-passer').click();
    await expect(page.locator(etape)).toBeVisible();
    if (etape !== '.diplome') await expect(page.locator('#btn-passer')).toBeVisible();
  }
  await page.waitForTimeout(1600);
  await expect(page.locator('#btn-passer')).toBeHidden();
});

test("le badge Fouille-terrier : les 4 trésors du terrier trouvés", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await page.evaluate(() => { const A = (window as any).APP; A.state.fini = true; A.state.unlocked = 5; A.show(5); });
  await page.locator('#btn-passer').click();
  await expect(page.locator('svg.terrier')).toBeVisible();
  await expect(page.locator('#voile-noir.on')).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as any).APP.state.badges)).not.toContain('terrier');
  // On visite chaque trésor (chemin calculé dans le labyrinthe affiché, au clavier)
  const chemins = [(await page.locator('svg.terrier').getAttribute('data-tresors'))!];
  const f: Record<string, string> = { N: 'ArrowUp', S: 'ArrowDown', E: 'ArrowRight', O: 'ArrowLeft' };
  for (const c of chemins) for (const d of c) { await page.keyboard.press(f[d]); await page.waitForTimeout(170); }
  await expect(page.locator('.tresors-n')).toHaveText('4');
  expect(await page.evaluate(() => (window as any).APP.state.badges)).toContain('terrier');
});

test("le badge Pilote des nuages : seulement sans toucher un seul nuage", async ({ page }) => {
  test.setTimeout(120000);
  for (const evite of [false, true]) {
    await ouvrir(page, '?reset=1#exemple');
    // Les nuages arrivent toujours en haut du ciel : en descendant tout en bas, on les évite tous
    await page.evaluate(() => { Math.random = () => 0; const A = (window as any).APP; A.state.unlocked = 5; A.show(5); });
    await page.locator('#bandeau-actions button', { hasText: 'Suite' }).click({ timeout: 30_000 });
    await page.locator('#bandeau-actions button', { hasText: "C'est parti" }).click({ timeout: 30_000 });
    if (evite) for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowDown');
    await page.locator('#bandeau-actions button', { hasText: 'Entrer dans le terrier' }).waitFor({ timeout: 60_000 });
    const badges = await page.evaluate(() => (window as any).APP.state.badges);
    if (evite) expect(badges).toContain('pilote'); else expect(badges).not.toContain('pilote');
  }
});

test("un élément touché trop tôt tremble sur place, sans sauter dans le coin de l'image", async ({ page }) => {
  await ouvrir(page, '?chapitre=1&scene=5#exemple');
  // La position est portée par un groupe autour : l'animation de refus ne peut pas l'écraser
  const billet = page.locator('.tap[data-el="billet"]');
  expect(await billet.getAttribute('transform')).toBeNull();
  expect(await billet.evaluate(g => g.parentElement!.getAttribute('transform'))).toContain('translate(170,316)');
  const avant = (await billet.boundingBox())!;
  await billet.evaluate(g => g.classList.add('refus'));
  await page.waitForTimeout(150);
  const pendant = (await billet.boundingBox())!;
  expect(Math.abs(pendant.x - avant.x)).toBeLessThan(20);
});

test("le ruban : la pastille du diplôme apparaît une fois l'histoire terminée, et y mène directement", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  await expect(page.locator('.perle.perle-dip')).toBeHidden();
  await page.evaluate(() => { const A = (window as any).APP; A.state.unlocked = 5; A.state.fini = true; A.show(1, { scene: 0 }); });
  await expect(page.locator('.perle.perle-dip')).toBeVisible();
  if (process.env.CAPTURES) await page.locator('#fil').screenshot({ path: process.env.CAPTURES + '/ruban-diplome.png' });
  await page.locator('.perle.perle-dip').click();
  await expect(page.locator('.diplome-wrap')).toBeVisible();
  await expect(page.locator('.perle.perle-dip')).toHaveClass(/active/);
  await expect(page.locator('.perle[data-n="5"]')).not.toHaveClass(/active/);
});
