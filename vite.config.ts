import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

// base « ./ » : chemins relatifs, valables à la fois sur GitHub Pages (sous-dossier)
// et dans l'appli native Capacitor (fichiers locaux).
export default defineConfig({
  base: './',
  plugins: [svelte()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        mot: resolve(import.meta.dirname, 'mot.html'),
        certificat: resolve(import.meta.dirname, 'certificat.html'),
        parents: resolve(import.meta.dirname, 'parents.html'),
      },
    },
  },
  server: { port: 5173, host: true },
});
