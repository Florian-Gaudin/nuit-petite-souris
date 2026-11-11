// Plugin Vite : génère dist/sw.js, le service worker qui garde tout le site en mémoire pour le hors-connexion.
// La liste des fichiers (noms avec empreinte) et la version sont calculées à chaque construction.
import type { Plugin } from 'vite';
import { createHash } from 'node:crypto';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function fichiersPublics(dossier: string): string[] {
  const out: string[] = [];
  const parcourir = (d: string) => {
    for (const nom of readdirSync(d)) {
      const chemin = join(d, nom);
      if (statSync(chemin).isDirectory()) parcourir(chemin); else out.push(relative(dossier, chemin).split('\\').join('/'));
    }
  };
  try { parcourir(dossier); } catch { /* pas de dossier public */ }
  return out;
}

const SW = (version: string, fichiers: string[]) => `// Service worker de « La nuit de la Petite Souris » (généré à la construction, ne pas modifier)
// Tout le site est gardé en mémoire : l'histoire fonctionne au réveil, même sans réseau.
const CACHE = 'petite-souris-${version}';
const FICHIERS = ${JSON.stringify(fichiers, null, 2)};

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k.startsWith('petite-souris-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // suggestions de communes : toujours en ligne
  e.respondWith(
    // ignoreVary : les scripts du site sont demandés en mode « cors » (en-tête Origin) alors qu'ils ont été
    // mis en cache sans ; une réponse « Vary: Origin » ne serait sinon jamais retrouvée hors connexion.
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then(enCache => enCache || fetch(req).catch(() =>
      req.mode === 'navigate' ? caches.match('./index.html', { ignoreVary: true }) : Response.error()))
  );
});
`;

export function serviceWorker(): Plugin {
  let dossierPublic = 'public';
  return {
    name: 'petite-souris-service-worker',
    apply: 'build',
    enforce: 'post', // après la génération des pages HTML
    configResolved(c) { dossierPublic = c.publicDir; },
    generateBundle(_options, bundle) {
      // Les pages HTML sont ajoutées explicitement : elles sont parfois produites après ce plugin
      const pages = ['index.html', 'parents.html', 'mot.html', 'certificat.html'];
      const construits = [...new Set([...Object.keys(bundle).filter(f => !f.endsWith('.map')), ...pages])];
      const publics = fichiersPublics(dossierPublic);
      const fichiers = ['./', ...[...construits, ...publics].sort().map(f => './' + f)];
      const version = createHash('sha256').update(fichiers.join('|')).digest('hex').slice(0, 12);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: SW(version, fichiers) });
    },
  };
}
