import type { CapacitorConfig } from '@capacitor/cli';

// Préparation de l'appli native (App Store, Google Play). Les plateformes iOS et Android
// seront ajoutées plus tard avec `npx cap add ios` et `npx cap add android`.
const config: CapacitorConfig = {
  appId: 'io.github.floriangaudin.petitesouris',
  appName: 'La nuit de la Petite Souris',
  webDir: 'dist',
  backgroundColor: '#141A3A',
};

export default config;
