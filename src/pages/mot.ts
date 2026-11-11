// Le mot de la souris (A6) avec le QR code vers l'histoire.
import '../styles/style.css';
import qrcode from 'qrcode-generator';
import '../lib/plateforme';
import { initStockage } from '../lib/stockage';

await initStockage();
await import('../legacy/config.js');
await import('../legacy/art.js');

const W = window as any;
const C = W.CONFIG;
const $ = (id: string) => document.getElementById(id) as HTMLElement;

document.body.insertAdjacentHTML('afterbegin', W.ART.symboles());
$('titre').textContent = 'Merci pour ta dent, ' + C.enfant + ' !';
$('cadeau').textContent = 'Mon cadeau sèche ' + C.billet.lieu + ' !';
$('signature').textContent = C.souris;
$('url').textContent = C.url;
if (!C.url) $('alerte').hidden = false;

// QR code généré hors ligne (aucune requête réseau)
const qr = qrcode(0, 'M');
qr.addData(C.url);
qr.make();
const n = qr.getModuleCount(), marge = 2, taille = n + marge * 2;
let chemins = '';
for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) chemins += `M${c + marge} ${r + marge}h1v1h-1z`;
$('qr').innerHTML = `<svg viewBox="0 0 ${taille} ${taille}" shape-rendering="crispEdges"><rect width="${taille}" height="${taille}" fill="#fff"/><path d="${chemins}" fill="#141A3A"/></svg>`;

$('btn-print').onclick = () => window.print();
$('btn-plein').onclick = () => {
  const el = document.documentElement as any;
  const f = el.requestFullscreen || el.webkitRequestFullscreen;
  if (f) f.call(el);
};
