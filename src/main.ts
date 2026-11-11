// Point d'entrée de l'histoire.
// Étape 1 : le moteur du premier site est repris tel quel (src/legacy), chargé dans l'ordre
// après l'initialisation du stockage. Il sera découpé en modules typés au fil des étapes.
import './styles/style.css';
import './styles/diplome.css';
import './lib/plateforme';
import { initStockage } from './lib/stockage';

await initStockage();

// L'ordre compte : chaque fichier s'appuie sur ceux d'avant (window.CONFIG, window.DATA…).
await import('./legacy/config.js');
await import('./legacy/data.js');
await import('./legacy/art.js');
await import('./legacy/decors.js');
await import('./legacy/audio.js');
await import('./legacy/musique.js');
await import('./legacy/narration.js');
await import('./legacy/scenes.js');
await import('./legacy/certificat.js');
await import('./legacy/app.js');
