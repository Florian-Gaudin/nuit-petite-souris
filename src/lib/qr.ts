// QR codes générés hors ligne (aucune requête réseau)
import qrcode from 'qrcode-generator';

function matrice(texte: string) {
  const qr = qrcode(0, 'M');
  qr.addData(texte);
  qr.make();
  return qr;
}

// Image vectorielle, nette à l'écran comme à l'impression
export function svgQr(texte: string, couleur = '#141A3A'): string {
  const qr = matrice(texte);
  const n = qr.getModuleCount(), marge = 2, taille = n + marge * 2;
  let chemins = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) chemins += `M${c + marge} ${r + marge}h1v1h-1z`;
  return `<svg viewBox="0 0 ${taille} ${taille}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${taille}" height="${taille}" fill="#fff"/><path d="${chemins}" fill="${couleur}"/></svg>`;
}

// Image PNG à télécharger : une carte aux couleurs du site (nuit étoilée, Quenotte, titre),
// le QR code au centre sur un cadre blanc (indispensable pour qu'il se scanne bien)
export async function pngQr(texte: string, opts: { titre?: string; icone?: string } = {}): Promise<Blob> {
  const qr = matrice(texte);
  const n = qr.getModuleCount();
  const L = 1080, H = 1440;
  const canvas = document.createElement('canvas');
  canvas.width = L; canvas.height = H;
  const g = canvas.getContext('2d')!;

  // Le ciel : dégradé de la nuit, étoiles (toujours les mêmes), la lune
  const ciel = g.createLinearGradient(0, 0, 0, H);
  ciel.addColorStop(0, '#141A3A'); ciel.addColorStop(1, '#2b3470');
  g.fillStyle = ciel; g.fillRect(0, 0, L, H);
  let graine = 7;
  const hasard = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
  g.fillStyle = '#ffffff';
  for (let i = 0; i < 70; i++) { g.globalAlpha = 0.35 + hasard() * 0.6; g.beginPath(); g.arc(hasard() * L, hasard() * H, 1.5 + hasard() * 3, 0, Math.PI * 2); g.fill(); }
  g.globalAlpha = 1;
  g.fillStyle = '#FFF4D6';
  g.beginPath(); g.arc(900, 150, 62, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#18204a';
  g.beginPath(); g.arc(928, 132, 52, 0, Math.PI * 2); g.fill();

  // Polices du site (chargées par la page) : on attend qu'elles soient prêtes
  try { await Promise.all([document.fonts.load('800 80px "Baloo 2"'), document.fonts.load('700 40px "Baloo 2"')]); } catch { /* police de secours */ }

  // L'icône de Quenotte
  if (opts.icone) {
    try {
      const img = new Image();
      img.src = opts.icone;
      await img.decode();
      const c = 220, x = (L - c) / 2, y = 90;
      g.save(); g.beginPath(); g.roundRect(x, y, c, c, 48); g.clip(); g.drawImage(img, x, y, c, c); g.restore();
    } catch { /* sans icône */ }
  }

  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#FFF4D6';
  g.font = '800 76px "Baloo 2", "Trebuchet MS", sans-serif';
  g.fillText('La nuit de la Petite Souris', L / 2, 388, L - 80);
  if (opts.titre) {
    g.fillStyle = '#FFC857';
    g.font = '800 64px "Baloo 2", "Trebuchet MS", sans-serif';
    g.fillText(opts.titre, L / 2, 470, L - 80);
  }

  // Le QR code sur son cadre blanc arrondi, avec une lueur dorée
  const cadre = 700, cx = (L - cadre) / 2, cy = 545;
  g.save(); g.shadowColor = 'rgba(255, 200, 87, .45)'; g.shadowBlur = 60;
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(cx, cy, cadre, cadre, 48); g.fill(); g.restore();
  const pas = Math.floor((cadre - 80) / n), cote = pas * n, ox = cx + (cadre - cote) / 2, oy = cy + (cadre - cote) / 2;
  g.fillStyle = '#141A3A';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) g.fillRect(ox + c * pas, oy + r * pas, pas, pas);

  g.fillStyle = '#FFF4D6';
  g.font = '700 46px "Baloo 2", "Trebuchet MS", sans-serif';
  g.fillText('Scanne-moi pour découvrir', L / 2, 1330, L - 80);
  g.fillText('le voyage de Quenotte !', L / 2, 1385, L - 80);

  return new Promise((ok, ko) => canvas.toBlob(b => (b ? ok(b) : ko(new Error('PNG impossible'))), 'image/png'));
}
