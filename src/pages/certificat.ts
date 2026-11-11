// Le diplôme en grand, mis en page pour l'impression A4.
import '../styles/style.css';
import '../styles/diplome.css';
import '../lib/plateforme';
import { initStockage, stockage } from '../lib/stockage';

await initStockage();
await import('../legacy/config.js');
await import('../legacy/data.js');
await import('../legacy/art.js');
await import('../legacy/certificat.js');

const W = window as any;
const { CONFIG, DATA, CERTIFICAT, ART } = W;
const pad = (n: number) => String(n).padStart(2, '0');

document.body.insertAdjacentHTML('afterbegin', ART.symboles());
const p = new URLSearchParams(location.search);
let etat: any = {};
try { etat = JSON.parse(stockage.lire('souris.v2') || '{}'); } catch { /* état illisible : on repart de zéro */ }

// Priorité : paramètres d'adresse (envoyés par la tablette) > mémoire locale > tout gagné
const tous = DATA.badges.filter((b: any) => !b.secret).map((b: any) => b.id);
const badges: string[] = p.has('badges') ? (p.get('badges') || '').split(',').filter(Boolean) : (etat.badges && etat.badges.length ? etat.badges : tous);
const total = DATA.scenes.reduce((n: number, s: any) => n + s.bonus.length, 0);
const etoiles = p.has('etoiles')
  ? parseInt(p.get('etoiles') || '0', 10) || 0
  : Object.keys(etat.etoiles || {}).reduce((n, k) => n + (etat.etoiles[k] || []).length, 0) || total;
const secret = p.has('secret') ? p.get('secret') === '1' : !!etat.secret;
if (secret && badges.indexOf('scene13') < 0) badges.push('scene13');

let nuit = p.get('nuit') || CONFIG.nuit || etat.nuit;
if (!nuit || !/^\d{4}-\d{2}-\d{2}$/.test(nuit)) {
  const d = new Date(); if (d.getHours() < 12) d.setDate(d.getDate() - 1);
  nuit = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
const d1 = new Date(nuit + 'T12:00:00'), d2 = new Date(d1); d2.setDate(d2.getDate() + 1);
const mois = new Intl.DateTimeFormat('fr-FR', { month: 'long' });
const m1 = mois.format(d1), m2 = mois.format(d2);
const nuitTexte = m1 === m2
  ? `nuit du ${d1.getDate()} au ${d2.getDate()} ${m2} ${d2.getFullYear()}`
  : `nuit du ${d1.getDate()} ${m1} au ${d2.getDate()} ${m2} ${d2.getFullYear()}`;

const zone = document.getElementById('diplome') as HTMLElement;
zone.innerHTML = CERTIFICAT.html({ badges: badges.concat(badges.indexOf('jumelle') < 0 ? ['jumelle'] : []), secret, nuitTexte, etoiles, total });
CERTIFICAT.brancher(zone);
(document.getElementById('btn-print') as HTMLElement).onclick = () => window.print();
