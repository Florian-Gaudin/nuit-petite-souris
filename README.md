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

## L'accueil

- **Écran de lancement** : le logo sur le fond de sa couleur, au moins 1,2 s, une seule fois par visite (inscrit dans `index.html`, il s'affiche avant tout chargement).
- **Écran de choix** : à l'ouverture sans QR code (`…/nuit-petite-souris/`), trois cartes : « Reprendre l'histoire de… » (si un profil a déjà été scanné sur l'appareil), « Débuter le voyage avec Quenotte » (l'exemple de Clémentine, adresse `#exemple`) et « Je suis un parent ». Le menu Préférences propose « Changer d'histoire » pour y revenir.
- **Par le QR code ou le lien des parents** (`#p=…`) : directement l'accueil personnalisé (prénom, ville, date).
- **La carte de France** (`src/lib/carte.ts`) : entre l'accueil et le château, hors de la frise des scènes. Quenotte explique qu'elle part toujours de son château des Ardennes ; l'enfant touche l'étoile de sa ville (chef-lieu de son département, encadré pour l'outre-mer) et un chemin courbe en pointillés se dessine jusqu'à elle.

## Les adresses

Chaque page a son dossier, sans « .html » : `…/parents/`, `…/mot/`, `…/certificat/`. Les anciennes adresses (`parents.html`…) sont redirigées par `public/404.html`.

## L'espace parents

Page `…/parents/`, accessible depuis l'écran de choix et depuis le menu Préférences de l'histoire.

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

## Le grand matin : surprise et hors connexion

- **Mode surprise** : l'histoire se découvre le lendemain de la nuit choisie, à partir de 5 h. Scanné plus tôt, le QR code affiche Quenotte qui chuchote « reviens me voir demain matin, à ton réveil ». Dans l'espace parents, « Voir l'aperçu de l'histoire » (`?apercu=1`) l'ouvre tout de suite.
- **Hors connexion** : un service worker (généré à la construction par `outils/service-worker.ts`) garde tout le site en mémoire dès la première visite. Au réveil, l'histoire, le diplôme et l'espace parents s'ouvrent même sans réseau. Seules les suggestions de communes demandent une connexion.

## Les tests

- `npm test` : tests unitaires (format du profil, QR, récit adaptatif, mode surprise).
- `npm run test:e2e` : tests de bout en bout avec Playwright, dans un navigateur au format téléphone. Ils couvrent le profil transporté par le QR, le récit adaptatif (avec la comparaison mot pour mot aux textes d'origine, `tests/fixtures/textes-origine.json`), l'accueil (lancement, choix, carte), le mode surprise, l'espace parents (service des communes simulé), le hors-connexion et l'histoire complète, de l'accueil au diplôme.
- `npm run test:tout` : types, tests unitaires et tests de bout en bout.
- `BASE_URL=https://florian-gaudin.github.io/nuit-petite-souris/ npm run test:e2e` : les mêmes tests sur le site en ligne.

Chaque publication sur GitHub lance toutes ces vérifications ; si l'une échoue, le site n'est pas mis en ligne.

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
| `src/lib/carte.ts` | La carte de France de l'accueil : contour, château, chef-lieu de chaque département. |
| `src/lib/dessins.ts` | Dessins personnalisés : doudous, cachettes, enfant, frère ou sœur. |
| `src/lib/horsLigne.ts`, `outils/service-worker.ts` | Hors connexion. |
| `tests/e2e/` | Tests de bout en bout (Playwright). |
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
6. Hors connexion, mode surprise, tests ✓
7. Appli des stores (Capacitor)
