// Point d'entrée de l'histoire.
// Étape 1 : le moteur du premier site est repris tel quel (src/legacy), chargé dans l'ordre
// après l'initialisation du stockage. Il sera découpé en modules typés au fil des étapes.
import './styles/style.css';
import './styles/diplome.css';
import './lib/plateforme';
import { initStockage } from './lib/stockage';
import { installerProfil } from './lib/profilCourant';
import { activerHorsLigne } from './lib/horsLigne';

// L'écran de lancement (index.html) reste au moins 1,2 s, puis s'efface en fondu
const DUREE_LANCEMENT = 1200;
function finLancement(): void {
  const el = document.getElementById('lancement');
  if (!el) return;
  if (document.documentElement.classList.contains('deja-lance')) { el.remove(); return; }
  setTimeout(() => {
    el.classList.add('parti');
    setTimeout(() => el.remove(), 500);
  }, Math.max(0, DUREE_LANCEMENT - performance.now()));
}

activerHorsLigne();

try {
  await initStockage();
  installerProfil({ choix: true }); // le profil de l'enfant (QR code, #exemple ou écran de choix) → window.CONFIG

  // L'ordre compte : chaque fichier s'appuie sur ceux d'avant (window.CONFIG, window.DATA…).
  await import('./lib/carte');
  await import('./legacy/data.js');
  await import('./lib/dessins');
  await import('./legacy/art.js');
  await import('./legacy/decors.js');
  await import('./legacy/audio.js');
  await import('./legacy/musique.js');
  await import('./legacy/narration.js');
  await import('./legacy/scenes.js');
  await import('./lib/machoire');
  await import('./legacy/certificat.js');
  await import('./legacy/app.js');
} finally {
  finLancement();
}
