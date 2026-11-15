// Accessibilité : audit automatique axe-core (règles WCAG 2.1 A et AA, la base du RGAA 4.1) sur chaque écran
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ouvrir } from './aide';

// L'histoire bloque le zoom à deux doigts (jeux tactiles) ; le réglage « Grand texte » le remplace (technique WCAG G178)
const ECART_HISTOIRE = ['meta-viewport'];

async function audit(page: Page, nom: string, ignorer: string[] = []) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.filter(v => !ignorer.includes(v.id))
    .map(v => `${nom} · ${v.impact} · ${v.id} : ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
}

test('audit WCAG 2.1 AA : tous les écrans', async ({ page }) => {
  test.setTimeout(180000);
  const pb: string[] = [];
  await ouvrir(page, '?reset=1'); pb.push(...await audit(page, 'accueil', ECART_HISTOIRE));
  await ouvrir(page, '#exemple'); pb.push(...await audit(page, 'chapitre 0', ECART_HISTOIRE));
  for (const n of [1, 2, 3, 4]) { await ouvrir(page, `?chapitre=${n}#exemple`); pb.push(...await audit(page, 'chapitre ' + n, ECART_HISTOIRE)); }
  // Le carnet des Ardennes et le livre de la légende
  await page.evaluate(() => { const A = (window as any).APP; A.state.unlocked = 5; A.state.fini = true; A.show(5, { diplome: true }); });
  await page.locator('#btn-carnet5').click(); pb.push(...await audit(page, 'carnet', ECART_HISTOIRE));
  await page.locator('.carte-ard').first().click(); pb.push(...await audit(page, 'carte', ECART_HISTOIRE));
  await page.locator('[data-a="grille"]').click(); await page.locator('.carte-livre').click(); await page.locator('[data-a="livre"]').click(); await page.keyboard.press('ArrowRight');
  pb.push(...await audit(page, 'livre', ECART_HISTOIRE));
  await page.keyboard.press('Escape');
  for (const p of ['parents/', 'mot/#exemple', 'certificat/#exemple', 'infos/']) {
    await page.goto(p); await page.waitForTimeout(800); pb.push(...await audit(page, p));
  }
  expect(pb, pb.join('\n')).toEqual([]);
});

test('la page Informations : depuis l\'accueil et les réglages', async ({ page }) => {
  await ouvrir(page, '?reset=1');
  await page.locator('.lien-infos').click();
  await expect(page.locator('h1')).toHaveText('Informations');
  await expect(page.locator('#confidentialite')).toContainText('Aucune donnée personnelle');
  await expect(page.locator('#mentions')).toContainText('GitHub, Inc.');
  await expect(page.locator('#mentions a[href="mailto:lanuitdelapetitesouris@gmail.com"]')).toHaveCount(1);
  await ouvrir(page, '#exemple');
  await page.locator('#btn-prefs').click();
  await page.locator('#pref-infos').click();
  await expect(page.locator('#accessibilite h2')).toHaveText('Accessibilité');
});

test("« Grand texte » : le texte de l'histoire grandit, défile si besoin, et le réglage est gardé", async ({ page }) => {
  await ouvrir(page, '?reset=1#exemple');
  const taille = () => page.locator('#bandeau-texte').evaluate(e => parseFloat(getComputedStyle(e).fontSize));
  const avant = await taille();
  await page.locator('#btn-prefs').click();
  await expect(page.locator('#pref-grand')).toContainText('désactivé');
  await page.locator('#pref-grand').click();
  await expect(page.locator('#pref-grand')).toHaveAttribute('aria-pressed', 'true');
  expect(await taille()).toBeGreaterThan(avant * 1.6);
  // Un texte trop long ne rétrécit pas : il défile dans le bandeau
  expect(await page.locator('#bandeau-texte').evaluate(e => getComputedStyle(e).overflowY)).toBe('auto');
  // Toujours actif après rechargement, et même après « Recommencer »
  await ouvrir(page, '?reset=1#exemple');
  expect(await taille()).toBeGreaterThan(avant * 1.6);
  expect(await audit(page, 'grand texte', ECART_HISTOIRE)).toEqual([]);
});

test("pas de défilement dans les scènes du voyage, même quand le bandeau change de hauteur", async ({ page }) => {
  for (const taille of [{ width: 360, height: 640 }, { width: 412, height: 915 }]) {
    await page.setViewportSize(taille);
    for (let n = 0; n < 10; n++) {
      await ouvrir(page, `?chapitre=1&scene=${n}#exemple`);
      await page.waitForTimeout(500);
      const deborde = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      expect(deborde, `scène ${n}, ${taille.width} × ${taille.height}`).toBeLessThanOrEqual(1);
    }
  }
});

test("le bandeau garde la même hauteur pendant toute une scène, et le texte ne descend jamais sous 16 px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await ouvrir(page, '?reset=1#exemple');
  await ouvrir(page, '?chapitre=1&scene=0#exemple');
  const mesures: number[] = [], polices: number[] = [];
  for (let i = 0; i < 8; i++) {
    mesures.push(await page.locator('#bandeau').evaluate(e => e.offsetHeight));
    polices.push(await page.locator('#bandeau-texte').evaluate(e => parseFloat(getComputedStyle(e).fontSize)));
    if (await page.locator('#bandeau.attente .bandeau-suite').isVisible()) await page.locator('.bandeau-suite').click();
    else { const c = page.locator('.tap.cible'); if (await c.count()) await c.first().dispatchEvent('click'); }
    await page.waitForTimeout(400);
  }
  expect(new Set(mesures).size, mesures.join(', ')).toBe(1);
  expect(Math.min(...polices)).toBeGreaterThanOrEqual(16);
});

test("typographie : une espace insécable devant ! ? : et ; partout où du texte s'affiche", async ({ page }) => {
  const verifier = async (nom: string) => {
    const fautes = await page.evaluate(() => {
      const out: string[] = [], m = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = m.nextNode(); n; n = m.nextNode()) { const t = (n as Text).data; if (/ [!?:;]/.test(t) && !/:\/\/|#p=/.test(t) && !(n.parentElement && n.parentElement.closest('script,style'))) out.push(t.trim().slice(0, 60)); }
      return out;
    });
    expect(fautes, nom + ' : ' + fautes.join(' | ')).toEqual([]);
  };
  await ouvrir(page, '?reset=1'); await verifier('accueil');
  await ouvrir(page, '?chapitre=1&scene=2#exemple'); await page.waitForTimeout(500); await verifier('place');
  await page.goto('infos/'); await page.waitForTimeout(300); await verifier('infos');
  await page.goto('parents/'); await page.waitForTimeout(300); await verifier('parents');
});
