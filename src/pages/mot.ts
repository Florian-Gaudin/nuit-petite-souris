// Le mot de la souris (A6) avec le QR code vers l'histoire.
import '../styles/style.css';
import { svgQr } from '../lib/qr';
import '../lib/plateforme';
import { initStockage } from '../lib/stockage';
import { installerProfil, baseHistoire } from '../lib/profilCourant';

await initStockage();
installerProfil();
await import('../legacy/art.js');

const W = window as any;
const C = W.CONFIG;
const $ = (id: string) => document.getElementById(id) as HTMLElement;

document.body.insertAdjacentHTML('afterbegin', W.ART.symboles());
$('titre').textContent = 'Merci pour ta dent, ' + C.enfant + ' !';
$('cadeau').textContent = 'Mon cadeau sèche ' + C.billet.lieu + ' !';
$('signature').textContent = C.souris;
$('url').textContent = baseHistoire();
if (!C.url) $('alerte').hidden = false;

// QR code généré hors ligne (aucune requête réseau)
$('qr').innerHTML = svgQr(C.url);

$('btn-print').onclick = () => window.print();
$('btn-plein').onclick = () => {
  const el = document.documentElement as any;
  const f = el.requestFullscreen || el.webkitRequestFullscreen;
  if (f) f.call(el);
};
