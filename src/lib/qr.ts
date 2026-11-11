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

// Image PNG (téléchargement, partage), avec un titre facultatif sous le QR
export async function pngQr(texte: string, opts: { taille?: number; titre?: string } = {}): Promise<Blob> {
  const qr = matrice(texte);
  const n = qr.getModuleCount(), marge = 4;
  const taille = opts.taille ?? 1024;
  const pas = Math.floor(taille / (n + marge * 2));
  const cote = pas * (n + marge * 2);
  const bas = opts.titre ? Math.round(cote * 0.12) : 0;
  const canvas = document.createElement('canvas');
  canvas.width = cote; canvas.height = cote + bas;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#fff'; g.fillRect(0, 0, canvas.width, canvas.height);
  g.fillStyle = '#141A3A';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) g.fillRect((c + marge) * pas, (r + marge) * pas, pas, pas);
  if (opts.titre) {
    g.font = `700 ${Math.round(bas * 0.45)}px "Baloo 2", sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(opts.titre, cote / 2, cote + bas / 2 - pas);
  }
  return new Promise((ok, ko) => canvas.toBlob(b => (b ? ok(b) : ko(new Error('PNG impossible'))), 'image/png'));
}
