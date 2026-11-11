# La nuit de la Petite Souris — l'appli

Version personnalisable de « La nuit de la Petite Souris » : un espace parents crée le profil de l'enfant (prénom, doudou, dent tombée, billet, endroit du cadeau, ville, date), puis un QR code lance l'histoire de Quenotte, racontée pour cet enfant.

Site : **https://florian-gaudin.github.io/nuit-petite-souris/**

## Technique

- **Vite** (construction), **TypeScript**, **Svelte** (espace parents).
- **Capacitor** prévu pour publier plus tard l'appli sur l'App Store et Google Play, à partir du même code.
- Aucun serveur : le profil de l'enfant voyage dans le QR code.

## Le profil de l'enfant

Le profil (`src/lib/profil.ts`) voyage après le « # » de l'adresse : `…/nuit-petite-souris/#p=CODE`. Cette partie de l'adresse n'est jamais envoyée au serveur.

- **Contenu** : prénom, fille ou garçon, doudou (type et nom), frère ou sœur, nom du chat, dent de la nuit et dents déjà tombées (les 20 dents de lait), valeur du billet, cachette du cadeau, ville, date de la nuit.
- **Format** : champs séparés par « | », choix fixes en chiffres, dents en masque, puis compression. Un profil complet tient en 260 caractères environ, soit un QR de 65 modules, lisible en A6.
- **Sécurité** : chaque valeur est vérifiée ; les noms n'acceptent que lettres, chiffres, espaces et ponctuation simple. Un QR abîmé ou falsifié est ignoré.
- **Mémoire** : le dernier profil scanné est retenu sur l'appareil ; la progression est mémorisée par profil (plusieurs enfants, plusieurs dents sur la même tablette). Sans profil, l'histoire raconte l'exemple de Clémentine.

## L'espace parents

Page `parents.html`, accessible depuis le menu Préférences de l'histoire (et depuis l'accueil tant qu'aucun profil n'est créé).

1. **Verrou** : maintenir un bouton 3 secondes, pour que les enfants n'y tombent pas par hasard.
2. **L'enfant** : prénom, fille ou garçon, doudou (8 choix), frère ou sœur.
3. **La dent** : schéma des 20 dents de lait, vu de face ; la dent de la nuit et celles déjà tombées. Le schéma annonce l'histoire qui sera racontée : première dent, retrouvailles des jumelles, ou suite de la collection.
4. **Le cadeau** : billet de 5, 10, 20 ou 50 €, et l'endroit où il sèche.
5. **La maison** : la ville, avec les suggestions du service public des communes (geo.api.gouv.fr, seul le texte tapé est envoyé), et le nom du chat du voisin.
6. **La nuit** : la date.

À la fin : le QR code, avec « Imprimer le mot de la souris », « Télécharger le QR code », « Partager le lien » et « Lancer l'histoire ici ». La saisie en cours est gardée sur l'appareil.

## Le récit adaptatif

L'histoire se raconte selon le profil (`src/lib/recit.ts`) :

- **La dent** : trois histoires. Toute première dent (une place neuve l'attend au château), dent dont la jumelle est déjà tombée (les retrouvailles, texte d'origine quand une seule dent attendait), ou dent suivante (elle rejoint la collection). Le rang (« ta troisième dent »), le type de dent et le schéma des 20 dents du diplôme suivent.
- **Le billet** : sa valeur dans les textes et sur les dessins, et sa couleur (5 € gris, 10 € rouge, 20 € bleu, 50 € orange).
- **La cachette** : « sur ta cheminée, bien éteinte », « sur ton bureau »… dans la Meuse, la caméra, la lettre et le mot A6.
- **Fille ou garçon** : « Chère / Cher », « Amie / Ami de Quenotte », « Exploratrice / Explorateur », « Collectionneuse / Collectionneur ».
- **Doudou** : présent ou non (sans doudou, le témoin du diplôme est la lune).
- **Frère ou sœur** : dans la même chambre ou non (fenêtre d'Aiglemont, Pantoufle, caméra, lettre, témoin).

Dans `src/legacy/data.js`, un texte peut avoir plusieurs versions, choisies par aiguillage : `{ variante: { premiere, jumelle, suite } }`, `{ deja: { une, plusieurs } }`, `{ doudou: { oui, non } }`, `{ fratrie: { aCote, ailleurs, non } }` (une branche `null` omet la ligne). Les mots du profil s'écrivent entre accolades : `{ordinal}`, `{euros}`, `{cachetteNom}`, `{Chere}`, `{frere}`… Avec le profil d'exemple, les textes sont identiques mot pour mot à ceux de la première histoire.

## Les dessins personnalisés

- **La montgolfière** : une septième scène, entre la place Ducale et la ville d'arrivée. Trois flammes au brûleur gonflent le ballon rayé rouge et jaune, qui s'envole au-dessus des Ardennes ; deux secrets (une étoile filante, un vol d'oies sauvages). 14 étoiles cachées en tout.
- **Le doudou** (`src/lib/dessins.ts`) : ours, lapin, chat, chien, bébé, licorne ou dinosaure, dans la caméra et en silhouette à la fenêtre ; rien s'il n'y a pas de doudou.
- **La cachette filmée** : cheminée, radiateur, commode, bureau ou étagère dans le salon de la caméra.
- **L'enfant endormi** : cheveux longs ou courts selon fille ou garçon.
- **Le frère ou la sœur** : un petit lit dans la chambre, et son nom détecté par la caméra, s'il dort dans la même chambre.

## Arborescence

| Dossier | Rôle |
|---|---|
| `src/main.ts` | Point d'entrée de l'histoire. |
| `src/legacy/` | Moteur du premier site, repris tel quel (scènes, narration, musique, dessins). Il sera découpé en modules typés au fil des étapes. |
| `src/lib/stockage.ts` | Mémoire de la progression : navigateur sur le web, stockage natif dans l'appli des stores. |
| `src/lib/plateforme.ts` | Web ou appli native. |
| `src/pages/` | Le mot A6 avec le QR code, le diplôme à imprimer. |
| `src/parents/` | L'espace parents (Svelte) : formulaire, schéma des dents, choix de la ville, QR code. |
| `src/lib/profil.ts` | Le profil de l'enfant : vérification, encodage pour le QR, dents et variantes d'histoire. |
| `src/lib/qr.ts` | QR codes en SVG et en PNG, générés hors ligne. |
| `src/lib/recit.ts` | Vocabulaire de l'histoire et choix des versions de texte. |
| `src/lib/dessins.ts` | Dessins personnalisés : doudous, cachettes, enfant, frère ou sœur. |
| `src/lib/geometrieDents.ts`, `src/lib/machoire.ts` | Schéma des 20 dents (formulaire et diplôme). |
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

Raccourcis de test dans l'adresse (à placer avant le `#p=…`) : `?reset=1` efface la progression du profil, `?chapitre=3` ouvre un chapitre, `?chapitre=1&scene=4` ouvre une scène du voyage (0 à 6).

## Publication

Chaque push sur `main` construit et publie le site via GitHub Actions (`.github/workflows/publier.yml`).
Réglage à faire une fois sur github.com : dépôt → **Settings** → **Pages** → Source = **GitHub Actions**.

## Feuille de route

1. Socle technique ✓
2. Profil de l'enfant et QR code ✓
3. Espace parents ✓
4. Récit adaptatif (dents, billet, endroit du cadeau, frère ou sœur, accords) ✓
5. Nouveaux dessins (montgolfière, doudous, endroits, billets) ✓
6. Hors connexion, mode surprise, tests
7. Appli des stores (Capacitor)
