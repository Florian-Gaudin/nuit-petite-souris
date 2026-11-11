# La nuit de la Petite Souris — l'appli

Version personnalisable de « La nuit de la Petite Souris » : un espace parents crée le profil de l'enfant (prénom, doudou, dent tombée, billet, endroit du cadeau, ville, date), puis un QR code lance l'histoire de Quenotte, racontée pour cet enfant.

Site : **https://florian-gaudin.github.io/nuit-petite-souris/**

## Technique

- **Vite** (construction), **TypeScript**, **Svelte** (écrans de l'espace parents, à venir).
- **Capacitor** prévu pour publier plus tard l'appli sur l'App Store et Google Play, à partir du même code.
- Aucun serveur : le profil de l'enfant voyage dans le QR code.

## Le profil de l'enfant

Le profil (`src/lib/profil.ts`) voyage après le « # » de l'adresse : `…/nuit-petite-souris/#p=CODE`. Cette partie de l'adresse n'est jamais envoyée au serveur.

- **Contenu** : prénom, fille ou garçon, doudou (type et nom), frère ou sœur, nom du chat, dent de la nuit et dents déjà tombées (les 20 dents de lait), valeur du billet, cachette du cadeau, ville, date de la nuit.
- **Format** : champs séparés par « | », choix fixes en chiffres, dents en masque, puis compression. Un profil complet tient en 260 caractères environ, soit un QR de 65 modules, lisible en A6.
- **Sécurité** : chaque valeur est vérifiée ; les noms n'acceptent que lettres, chiffres, espaces et ponctuation simple. Un QR abîmé ou falsifié est ignoré.
- **Mémoire** : le dernier profil scanné est retenu sur l'appareil ; la progression est mémorisée par profil (plusieurs enfants, plusieurs dents sur la même tablette). Sans profil, l'histoire raconte l'exemple de Clémentine.

## Arborescence

| Dossier | Rôle |
|---|---|
| `src/main.ts` | Point d'entrée de l'histoire. |
| `src/legacy/` | Moteur du premier site, repris tel quel (scènes, narration, musique, dessins). Il sera découpé en modules typés au fil des étapes. |
| `src/lib/stockage.ts` | Mémoire de la progression : navigateur sur le web, stockage natif dans l'appli des stores. |
| `src/lib/plateforme.ts` | Web ou appli native. |
| `src/pages/` | Le mot A6 avec le QR code, le diplôme à imprimer. |
| `src/styles/`, `src/assets/` | Styles et polices (licence OFL). |
| `public/` | Icônes et manifeste de la web app. |
| `capacitor.config.ts` | Réglages de la future appli native. |

## Travailler sur le projet

```
npm install        # une seule fois
npm run dev        # serveur de développement : http://localhost:5173/
npm run build      # construit le site dans dist/
npm run preview    # sert dist/ : http://localhost:4173/
npm run verifier   # vérifie les types
npm test           # tests automatiques (format du profil, QR)
```

Raccourcis de test dans l'adresse (à placer avant le `#p=…`) : `?reset=1` efface la progression du profil, `?chapitre=3` ouvre un chapitre, `?chapitre=1&scene=4` ouvre une scène du voyage.

## Publication

Chaque push sur `main` construit et publie le site via GitHub Actions (`.github/workflows/publier.yml`).
Réglage à faire une fois sur github.com : dépôt → **Settings** → **Pages** → Source = **GitHub Actions**.

## Feuille de route

1. Socle technique ✓
2. Profil de l'enfant et QR code ✓
3. Espace parents
4. Récit adaptatif (dents, billet, endroit du cadeau, frère ou sœur, accords)
5. Nouveaux dessins (montgolfière, doudous, endroits, billets)
6. Hors connexion, mode surprise, tests
7. Appli des stores (Capacitor)
