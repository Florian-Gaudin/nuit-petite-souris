// Petits dessins des choix du formulaire (doudous, cachettes, billets). Les dessins de l'histoire
// elle-même (doudou dans la chambre, cachette filmée…) viendront à l'étape 5.
import type { Billet, Cachette, TypeDoudou } from '../lib/profil';

const svg = (contenu: string) => `<svg viewBox="0 0 48 48" aria-hidden="true">${contenu}</svg>`;

export const DOUDOUS: Record<TypeDoudou, { nom: string; svg: string }> = {
  ours: { nom: 'Ours', svg: svg('<circle cx="14" cy="13" r="6" fill="#B07A4F"/><circle cx="34" cy="13" r="6" fill="#B07A4F"/><circle cx="24" cy="25" r="15" fill="#C48A5A"/><ellipse cx="24" cy="30" rx="7" ry="5.5" fill="#EBC9A3"/><circle cx="24" cy="28" r="2.2" fill="#3a2a20"/><circle cx="18" cy="22" r="1.8" fill="#2B2B33"/><circle cx="30" cy="22" r="1.8" fill="#2B2B33"/>') },
  lapin: { nom: 'Lapin', svg: svg('<ellipse cx="17" cy="11" rx="4.5" ry="10" fill="#E8E2EE"/><ellipse cx="31" cy="11" rx="4.5" ry="10" fill="#E8E2EE"/><ellipse cx="17" cy="11" rx="2" ry="7" fill="#F2A3B5"/><ellipse cx="31" cy="11" rx="2" ry="7" fill="#F2A3B5"/><circle cx="24" cy="29" r="13" fill="#E8E2EE"/><circle cx="19" cy="27" r="1.8" fill="#2B2B33"/><circle cx="29" cy="27" r="1.8" fill="#2B2B33"/><path d="M22 32h4l-2 2z" fill="#E98BA0"/>') },
  chat: { nom: 'Chat', svg: svg('<path d="M11 22l2-14 9 8M37 22l-2-14-9 8" fill="#9AA0B5"/><circle cx="24" cy="27" r="14" fill="#9AA0B5"/><circle cx="19" cy="25" r="2" fill="#2B2B33"/><circle cx="29" cy="25" r="2" fill="#2B2B33"/><path d="M22 30h4l-2 2z" fill="#F2A3B5"/><path d="M12 30l7-1M12 33l7 0M36 30l-7-1M36 33l-7 0" stroke="#5c6070" stroke-width="1"/>') },
  chien: { nom: 'Chien', svg: svg('<ellipse cx="12" cy="22" rx="5" ry="10" fill="#8B5A3C"/><ellipse cx="36" cy="22" rx="5" ry="10" fill="#8B5A3C"/><circle cx="24" cy="25" r="13" fill="#D9B48A"/><ellipse cx="24" cy="31" rx="7" ry="5" fill="#F0DCC0"/><ellipse cx="24" cy="28.5" rx="3" ry="2.2" fill="#2B2B33"/><circle cx="19" cy="22" r="1.8" fill="#2B2B33"/><circle cx="29" cy="22" r="1.8" fill="#2B2B33"/>') },
  bebe: { nom: 'Bébé, poupée', svg: svg('<path d="M10 22a14 14 0 0 1 28 0z" fill="#F2A3B5"/><circle cx="24" cy="26" r="12" fill="#F6D7C3"/><path d="M14 20q10-8 20 0" fill="none" stroke="#F2A3B5" stroke-width="5"/><circle cx="19.5" cy="26" r="1.7" fill="#2B2B33"/><circle cx="28.5" cy="26" r="1.7" fill="#2B2B33"/><path d="M21 31q3 2 6 0" fill="none" stroke="#c46a6a" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="30" r="2" fill="#F2A3B5" opacity=".6"/><circle cx="31" cy="30" r="2" fill="#F2A3B5" opacity=".6"/>') },
  licorne: { nom: 'Licorne', svg: svg('<path d="M24 3l3 12h-6z" fill="#FFC857"/><path d="M14 14l-2-7 7 5M34 14l2-7-7 5" fill="#F3EFE6"/><circle cx="24" cy="26" r="13" fill="#F3EFE6"/><path d="M12 22q-4 10 2 18M14 18q-6 4-4 12" fill="none" stroke="#B48ADB" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="25" r="1.8" fill="#2B2B33"/><circle cx="29" cy="25" r="1.8" fill="#2B2B33"/><ellipse cx="25" cy="32" rx="5" ry="3" fill="#F2A3B5"/>') },
  dinosaure: { nom: 'Dinosaure', svg: svg('<path d="M14 14l3-6 3 5 3-6 3 6 3-5 3 6" fill="#3E9A6B"/><circle cx="24" cy="26" r="13" fill="#5CB98A"/><ellipse cx="26" cy="31" rx="8" ry="5" fill="#8FD6B0"/><circle cx="19" cy="23" r="1.8" fill="#2B2B33"/><circle cx="29" cy="23" r="1.8" fill="#2B2B33"/><path d="M21 33l2 2 2-2 2 2 2-2" fill="none" stroke="#fff" stroke-width="1.5"/>') },
  aucun: { nom: 'Pas de doudou', svg: svg('<circle cx="24" cy="24" r="15" fill="none" stroke="#9aa0b5" stroke-width="3"/><path d="M14 34L34 14" stroke="#9aa0b5" stroke-width="3" stroke-linecap="round"/>') },
};

export const CACHETTES_INFO: Record<Cachette, { nom: string; conseil: string; svg: string }> = {
  'cheminee': { nom: 'La cheminée', conseil: 'éteinte !', svg: svg('<rect x="6" y="14" width="36" height="6" rx="1" fill="#A86B4A"/><rect x="9" y="20" width="30" height="22" fill="#C98A64"/><path d="M16 42V30a8 8 0 0 1 16 0v12z" fill="#2a2030"/><rect x="18" y="8" width="12" height="6" rx="1" fill="#FFC857"/>') },
  'radiateur': { nom: 'Le radiateur', conseil: 'éteint !', svg: svg('<rect x="7" y="14" width="34" height="24" rx="3" fill="#D8DCE6"/><path d="M13 16v20M19 16v20M25 16v20M31 16v20M37 16v20" stroke="#AEB4C2" stroke-width="2.5"/><rect x="7" y="38" width="4" height="5" fill="#AEB4C2"/><rect x="37" y="38" width="4" height="5" fill="#AEB4C2"/><rect x="18" y="8" width="12" height="6" rx="1" fill="#FFC857"/>') },
  'table-de-nuit': { nom: 'La table de nuit', conseil: '', svg: svg('<rect x="10" y="18" width="28" height="22" rx="2" fill="#B98B68"/><path d="M10 29h28" stroke="#8B5A3C" stroke-width="1.5"/><circle cx="24" cy="24" r="1.6" fill="#5c3a24"/><circle cx="24" cy="34" r="1.6" fill="#5c3a24"/><path d="M14 40v4M34 40v4" stroke="#8B5A3C" stroke-width="3"/><path d="M28 18l3-10h6l3 10z" fill="#F2A3B5"/><rect x="14" y="13" width="10" height="5" rx="1" fill="#FFC857"/>') },
  'bureau': { nom: 'Le bureau', conseil: '', svg: svg('<rect x="5" y="20" width="38" height="5" rx="1" fill="#B98B68"/><path d="M8 25v18M40 25v18" stroke="#8B5A3C" stroke-width="3"/><rect x="28" y="25" width="10" height="10" fill="#C79B74"/><rect x="11" y="12" width="12" height="8" fill="#3E7C8F"/><rect x="26" y="14" width="12" height="6" rx="1" fill="#FFC857"/>') },
  'etagere': { nom: "L'étagère", conseil: '', svg: svg('<path d="M6 18h36M6 34h36" stroke="#8B5A3C" stroke-width="3" stroke-linecap="round"/><rect x="9" y="6" width="4" height="12" fill="#D64045"/><rect x="14" y="8" width="4" height="10" fill="#3E7C8F"/><rect x="19" y="5" width="4" height="13" fill="#2F5D50"/><rect x="28" y="13" width="12" height="5" rx="1" fill="#FFC857"/><circle cx="14" cy="29" r="5" fill="#F2A3B5"/><rect x="26" y="24" width="12" height="10" fill="#C79B74"/>') },
};

// Couleurs des billets en euros (5 gris, 10 rouge, 20 bleu, 50 orange)
export const BILLETS_INFO: Record<Billet, { couleur: string; fonce: string }> = {
  5: { couleur: '#B9C4B0', fonce: '#6f7d68' },
  10: { couleur: '#E4A39A', fonce: '#a8564b' },
  20: { couleur: '#9DB8E0', fonce: '#4d6fa3' },
  50: { couleur: '#F2B66B', fonce: '#b8752a' },
};
export function svgBillet(v: Billet): string {
  const c = BILLETS_INFO[v];
  return `<svg viewBox="0 0 96 52" aria-hidden="true"><rect x="2" y="2" width="92" height="48" rx="5" fill="${c.couleur}" stroke="${c.fonce}" stroke-width="2"/><rect x="9" y="9" width="78" height="34" rx="3" fill="none" stroke="${c.fonce}" stroke-width="1" opacity=".6"/><circle cx="64" cy="26" r="11" fill="none" stroke="${c.fonce}" stroke-width="1.5" opacity=".7"/><text x="30" y="34" font-family="Baloo 2, sans-serif" font-weight="800" font-size="22" fill="${c.fonce}" text-anchor="middle">${v}</text><text x="64" y="32" font-family="Baloo 2, sans-serif" font-weight="800" font-size="15" fill="${c.fonce}" text-anchor="middle">€</text></svg>`;
}
