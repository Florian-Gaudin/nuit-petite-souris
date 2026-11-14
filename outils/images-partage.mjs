// Fabrique les images de partage (Facebook…) à partir des vrais dessins de l'histoire.
// Usage : npm run build, npx vite preview --port 4173, puis npm run images:partage
//   → public/partage.png (1200 × 630, aperçu du lien) et communication/publication-1080x1350.png
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const SITE = 'http://localhost:4173/';
const police = readFileSync(new URL('../src/assets/fonts/baloo2.woff2', import.meta.url)).toString('base64');
const icone = readFileSync(new URL('../public/icones/icone.svg', import.meta.url)).toString('base64');

const b = await chromium.launch({ channel: 'chrome' });
const page = await (await b.newContext({ viewport: { width: 1900, height: 1000 }, deviceScaleFactor: 2, locale: 'fr-FR' })).newPage();

// Les décors, capturés en grand, sans la main d'aide ni l'en-tête de la scène ; la montgolfière en plein vol
async function decor(scene, enVol = false) {
  await page.goto(`${SITE}?chapitre=1&scene=${scene}#exemple`);
  await page.waitForTimeout(1800);
  await page.evaluate(vol => {
    document.querySelectorAll('.main-aide, .indice').forEach(m => m.remove());
    document.querySelectorAll('.barre, .secrets, .decor-titre, .decor-heure').forEach(e => { e.style.visibility = 'hidden'; });
    if (vol) { const t = document.querySelector('.tap[data-el="bruleur"]'); t.setAttribute('data-etape', '3'); document.querySelector('svg.decor').classList.add('vole'); }
  }, enVol);
  if (enVol) await page.waitForTimeout(1100); // à mi-vol : le ballon entier, au-dessus des collines
  return (await page.locator('svg.decor').screenshot()).toString('base64');
}
const montgolfiere = await decor(3, true), chateau = await decor(0), chat = await decor(7);

const css = `@font-face{font-family:'Baloo 2';src:url(data:font/woff2;base64,${police}) format('woff2');font-weight:400 800}
*{box-sizing:border-box;margin:0}
body{font-family:'Baloo 2',sans-serif;color:#FFF4D6;background:radial-gradient(ellipse at 50% 20%,#2b3470 0,#141A3A 75%);overflow:hidden}
.etoiles{position:absolute;inset:0;background-image:radial-gradient(2px 2px at 8% 12%,#fff8,transparent),radial-gradient(2px 2px at 22% 70%,#fff6,transparent),radial-gradient(3px 3px at 88% 18%,#fffa,transparent),radial-gradient(2px 2px at 64% 8%,#fff7,transparent),radial-gradient(2px 2px at 94% 62%,#fff6,transparent),radial-gradient(2px 2px at 40% 92%,#fff5,transparent),radial-gradient(3px 3px at 5% 48%,#fff8,transparent)}
.icone{border-radius:22%;box-shadow:0 10px 30px #0008}
h1{font-weight:800;line-height:1.05;text-shadow:0 4px 16px #0009}
.accroche{color:#FFC857;font-weight:700;line-height:1.25;text-wrap:balance}
.img{aspect-ratio:5/3;object-fit:cover;border-radius:24px;box-shadow:0 18px 40px #000a,0 0 0 4px #3d4a95}
.points{color:#cfd3ee;font-weight:700}
.adresse{color:#cfd3ee;font-weight:600;letter-spacing:.02em}`;

// ---------- 1200 × 630 : l'aperçu du lien ----------
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<style>${css}
body{width:1200px;height:630px;display:flex;align-items:center;gap:44px;padding:0 54px;position:relative}
.texte{position:relative;flex:0 0 470px;display:flex;flex-direction:column;gap:18px}
h1{font-size:62px}.accroche{font-size:29px}.points{font-size:23px}
.img{position:relative;width:600px}</style>
<div class="etoiles"></div>
<div class="texte"><img class="icone" src="data:image/svg+xml;base64,${icone}" width="120" height="120">
<h1>La nuit de la Petite Souris</h1>
<p class="accroche">Quand une dent tombe, votre enfant suit le voyage de Quenotte jusqu'à sa chambre.</p>
<p class="points">Personnalisée · Gratuite · Sans publicité</p></div>
<img class="img" src="data:image/png;base64,${montgolfiere}">`);
await page.waitForTimeout(300);
await page.screenshot({ path: 'public/partage.png', clip: { x: 0, y: 0, width: 1200, height: 630 }, scale: 'css' });

// ---------- 1080 × 1350 : la publication ----------
await page.setViewportSize({ width: 1080, height: 1350 });
await page.setContent(`<style>${css}
body{width:1080px;height:1350px;display:flex;flex-direction:column;align-items:center;padding:50px 50px 40px;gap:22px;text-align:center;position:relative}
.haut{position:relative;display:flex;align-items:center;gap:26px;text-align:left}
h1{font-size:74px;max-width:11ch}.accroche{position:relative;font-size:34px;max-width:32ch}
.img{position:relative}.grande{width:900px}.rang{position:relative;display:flex;gap:30px}.petite{width:435px}
.points{position:relative;font-size:31px}.adresse{position:relative;font-size:26px;margin-top:auto}</style>
<div class="etoiles"></div>
<div class="haut"><img class="icone" src="data:image/svg+xml;base64,${icone}" width="150" height="150"><h1>La nuit de la Petite Souris</h1></div>
<p class="accroche">Quand une dent de lait tombe, votre enfant suit le voyage de Quenotte jusqu'à sa chambre.</p>
<img class="img grande" src="data:image/png;base64,${montgolfiere}">
<div class="rang"><img class="img petite" src="data:image/png;base64,${chateau}"><img class="img petite" src="data:image/png;base64,${chat}"></div>
<p class="points">Son prénom, son doudou, sa ville · Gratuite · Sans publicité</p>
<p class="adresse">florian-gaudin.github.io/nuit-petite-souris</p>`);
await page.waitForTimeout(300);
mkdirSync('communication', { recursive: true });
await page.screenshot({ path: 'communication/publication-1080x1350.png', clip: { x: 0, y: 0, width: 1080, height: 1350 }, scale: 'css' });
await b.close();
console.log('images : public/partage.png, communication/publication-1080x1350.png');
