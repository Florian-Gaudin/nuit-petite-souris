// =====================================================================================
//  LE CARNET DES ARDENNES : tous les textes des cartes « Le savais-tu ? » et de la légende
// =====================================================================================
//  Ce fichier ne contient que du texte : on peut le corriger sans rien connaître au code.
//  Règles simples :
//   - ne modifier que ce qui est entre guillemets "…" ;
//   - garder les guillemets, les virgules en fin de ligne et les crochets [ ] ;
//   - écrire les nombres en lettres (« quatre cents ans ») : les textes seront lus à voix haute ;
//   - {enfant} sera remplacé par le prénom de l'enfant.
//  Photos (facultatives) : déposer l'image dans public/cartes/ et remplir « photo » ; sinon laisser null.
//  Exemple : photo: { fichier: "sedan.jpg", description: "Le château fort de Sedan vu du ciel", credit: "Nom du photographe" },
// =====================================================================================

window.ARDENNES = {
  titre: "Le carnet des Ardennes",
  intro: "Pendant mon voyage, j'ai traversé les Ardennes, mon pays. Voici ce que je sais de ses trésors. Touche une carte pour la lire !",
  trouve: "Trouvé pendant le voyage !",
  // Une carte pas encore découverte (grisée), et le compte des cartes découvertes
  verrou: "À découvrir pendant le voyage",
  decouvertes: "{n} cartes découvertes sur {total}",
  // Sur la page du diplôme : la grande carte du carnet, puis Quenotte qui en parle
  diplome: {
    ruban: "Nouveau !",
    progression: "{n} cartes sur {total} trouvées pendant ton voyage",
    tuile: "{n} cartes sur {total} trouvées",
    invite: "Ouvre-le !",
    quenotte: "Et regarde : je t'ai laissé mon carnet des Ardennes ! Tu y retrouveras tout ce que tu as découvert pendant le voyage.",
    bouton: "Ouvrir le carnet",
  },
  // Quand l'enfant découvre, pendant le voyage, ce que raconte une carte (sans feuille de chêne)
  nouvelleCarte: "Nouvelle carte dans le carnet des Ardennes : {titre}",
  aVoir: "À voir",
  aGouter: "À goûter",

  // ---------- Les cartes « Le savais-tu ? » ----------
  // secret : le secret à la feuille de chêne qui lui correspond pendant le voyage (scène.élément), ou null
  cartes: [
    // Dans l'ordre où on les découvre pendant l'histoire (la légende reste en tête)
    {
      id: "legende", titre: "La légende des quatre fils Aymon", secret: null, livre: true,
      texte: [
        "Il y a très, très longtemps, quatre frères et leur cheval magique, Bayard, ont vécu de grandes aventures dans les Ardennes.",
        "Le Grand Marionnettiste raconte leur histoire en douze tableaux.",
      ],
      aVoir: "L'horloge du Grand Marionnettiste, à Charleville.",
      photo: null,
    },
    {
      id: "cacasse", titre: "La cacasse à cul nu", secret: "chateau.cuisine",
      texte: [
        "C'est un plat des Ardennes, avec un nom qui fait bien rire !",
        "Une « cacasse », c'est une cocotte en fonte. Dedans mijotent des pommes de terre et des oignons, tout doucement.",
        "Et « à cul nu » ? Autrefois, on la cuisinait souvent toute simple, sans rien d'autre : la cocotte était toute « nue » !",
      ],
      aGouter: "Dans les auberges des Ardennes, l'hiver.",
      photo: null,
    },
    {
      id: "foret", titre: "La forêt et le sanglier", secret: "foret.sanglier",
      texte: [
        "La forêt des Ardennes est immense : elle continue en Belgique et au Luxembourg.",
        "Son animal emblème, c'est le sanglier.",
        "Et le plus célèbre de tous s'appelle le Woinic : c'est le plus grand sanglier du monde, une statue de métal de dix mètres de haut avec son socle !",
      ],
      aVoir: "Le Woinic, le sanglier géant des Ardennes.",
      photo: null,
    },
    {
      id: "place", titre: "La place Ducale", secret: "place.plaque",
      texte: [
        "Il y a plus de quatre cents ans, le prince Charles de Gonzague a fondé la ville de Charleville.",
        "Au milieu, il a fait construire une grande place carrée, entourée d'arcades : la place Ducale.",
        "Elle ressemble beaucoup à la place des Vosges, à Paris, construite à la même époque.",
      ],
      aVoir: "La place Ducale et ses arcades, à Charleville.",
      photo: null,
    },
    {
      id: "marionnette", titre: "La capitale des marionnettes", secret: "place.marionnettiste",
      texte: [
        "Charleville est la capitale mondiale de la marionnette.",
        "Tous les deux ans, des marionnettistes du monde entier y viennent pour un grand festival.",
        "Et sur une façade de la ville, le Grand Marionnettiste raconte une légende toutes les heures.",
      ],
      aVoir: "L'horloge du Grand Marionnettiste, de dix heures à vingt et une heures.",
      photo: null,
    },
    {
      id: "rimbaud", titre: "Arthur Rimbaud, le poète", secret: "place.plume",
      texte: [
        "Arthur Rimbaud est né à Charleville, il y a plus de cent cinquante ans.",
        "Tout jeune, il écrivait déjà des poèmes, et il rêvait de partir très loin.",
        "Un ami l'appelait « l'homme aux semelles de vent ». Voici le début d'un de ses poèmes.",
      ],
      poeme: {
        titre: "Sensation",
        vers: [
          "Par les soirs bleus d'été, j'irai dans les sentiers,",
          "Picoté par les blés, fouler l'herbe menue :",
          "Rêveur, j'en sentirai la fraîcheur à mes pieds.",
          "Je laisserai le vent baigner ma tête nue.",
        ],
      },
      aVoir: "Le musée Arthur-Rimbaud, au bord de la Meuse, à Charleville.",
      photo: null,
    },
    {
      id: "galette", titre: "La galette au sucre", secret: "place.galette",
      texte: [
        "La galette au sucre est un gâteau des Ardennes : une pâte toute moelleuse, avec du sucre et du beurre dessus.",
        "On la partage au goûter, ou le dimanche matin. Miam !",
      ],
      // La recette simplifiée, présentée comme le poème de Rimbaud
      recette: {
        titre: "La recette, avec un grand",
        etapes: [
          "Mélange de la farine, deux œufs, un verre de lait tiède, un peu de levure et une pincée de sucre.",
          "Couvre la pâte d'un torchon et laisse-la gonfler au chaud, une bonne heure.",
          "Étale-la dans un moule, puis creuse des petits trous du bout des doigts.",
          "Glisse du beurre dans les trous, couvre de sucre, et au four jusqu'à ce que ce soit doré !",
        ],
      },
      aGouter: "Chez les boulangers des Ardennes.",
      photo: null,
    },
    {
      id: "meuse", titre: "La Meuse et ses boucles", secret: "montgolfiere.bruleur",
      texte: [
        "La Meuse traverse les Ardennes en faisant de grandes boucles : on les appelle des méandres.",
        "Vue d'en haut, elle ressemble à un ruban qui se tortille entre les collines couvertes de forêts.",
        "Ensuite, elle continue son voyage en Belgique et aux Pays-Bas, jusqu'à la mer.",
      ],
      aVoir: "Les boucles de la Meuse, depuis un belvédère.",
      photo: null,
    },
    {
      id: "sedan", titre: "Le château fort de Sedan", secret: "montgolfiere.sedan",
      texte: [
        "Le château fort de Sedan est le plus grand château fort d'Europe ! C'est là que je me cache, avec ma boîte à trésors.",
        "Ses murs sont si épais et ses salles si nombreuses qu'on pourrait s'y perdre.",
        "En deux mille vingt-trois, il a même été élu monument préféré des Français.",
      ],
      aVoir: "Le château fort de Sedan.",
      photo: null,
    },
    {
      id: "ardoise", titre: "L'ardoise des toits", secret: "montgolfiere.ardoises",
      texte: [
        "Pendant des siècles, on a creusé dans les Ardennes une pierre grise, bleue ou violette : l'ardoise.",
        "On la coupe en plaques très fines pour couvrir les toits.",
        "Fumay est célèbre pour son ardoise violette.",
      ],
      aVoir: "Le musée de l'Ardoise, à Fumay.",
      photo: null,
    },
    {
      id: "cabaret", titre: "Le Cabaret Vert", secret: "montgolfiere.cabaret",
      texte: [
        "Chaque été, au bord de la Meuse, à Charleville, le festival du Cabaret Vert accueille des musiciens du monde entier.",
        "Son nom vient d'un poème d'Arthur Rimbaud !",
        "Pendant quelques jours, des milliers de gens y chantent et y dansent.",
      ],
      aVoir: "Le festival du Cabaret Vert, chaque été, à Charleville.",
      photo: null,
    },
  ],

  // ---------- Le livre : la légende des quatre fils Aymon en douze tableaux ----------
  livre: {
    titre: "La légende des quatre fils Aymon",
    couverture: [
      "Voici l'histoire de quatre frères et de leur cheval magique, Bayard.",
      "À Charleville, le Grand Marionnettiste la raconte toutes les heures, de dix heures à vingt et une heures. Et le samedi soir, à vingt et une heures quinze, il raconte les douze tableaux à la suite.",
      "Va la voir !",
    ],
    ouvrir: "Ouvrir le livre : douze tableaux",
    // Sur la carte de la légende : le ruban, le sous-titre et l'invitation de Quenotte
    ruban: "Livre à feuilleter",
    verrou: "Il s'ouvrira quand tu auras découvert la scène secrète du Grand Marionnettiste.",
    sousTitre: "Un livre ancien à feuilleter, en douze tableaux",
    invitation: "Viens, je vais te montrer l'histoire de Bayard ! Touche le livre pour l'ouvrir.",
    tableaux: [
      { heure: "Dix heures", texte: "L'empereur Charlemagne fait chevaliers les quatre fils du duc Aymon d'Ardenne : Renaut, Allard, Guichard et Richard. Quelle fête au palais !" },
      { heure: "Onze heures", texte: "La fée Oriande offre à Renaut, son filleul, un cheval-fée : Bayard. Il est si magique qu'il peut porter les quatre frères à la fois, et sauter par-dessus les rivières !" },
      { heure: "Midi", texte: "Pendant une partie d'échecs, Renaut et Bertholais, le neveu de l'empereur, se disputent très fort. La dispute tourne si mal que l'empereur est furieux. Les quatre frères doivent partir, vite et très loin." },
      { heure: "Treize heures", texte: "Bayard galope à travers monts et vallées, les quatre frères sur son dos, jusqu'en Ardenne. Là, au bord de la Meuse, ils bâtissent leur château." },
      { heure: "Quatorze heures", texte: "Un pèlerin découvre leur cachette et le dit à Charlemagne. L'empereur part avec son armée pour les assiéger." },
      { heure: "Quinze heures", texte: "Un traître ouvre en cachette la porte du château. Les soldats de l'empereur entrent, et une grande bataille commence ! Les quatre frères se défendent courageusement, puis s'enfuient sur le dos de Bayard." },
      { heure: "Seize heures", texte: "Cachés dans la forêt, ils passent un hiver très long et très froid, sans presque rien à manger. Alors ils rentrent chez leur maman, qui les réchauffe et les console." },
      { heure: "Dix-sept heures", texte: "Les frères partent servir le roi Yon, en Gascogne. Renaut y remporte un grand combat, et tout le monde l'acclame." },
      { heure: "Dix-huit heures", texte: "Renaut épouse la sœur du roi Yon, et il bâtit un nouveau château : Montauban." },
      { heure: "Dix-neuf heures", texte: "Enfin, Charlemagne fait la paix avec les quatre frères ! Renaut part alors pour un très long voyage, loin, de l'autre côté de la mer." },
      { heure: "Vingt heures", texte: "À son retour, Renaut ne veut plus se battre. À Cologne, il aide les ouvriers à bâtir une cathédrale. Il porte les pierres sans rien dire, comme le plus simple des ouvriers." },
      { heure: "Vingt et une heures", texte: "Quand Renaut meurt, le grand fleuve, le Rhin, l'emporte tout doucement. Les poissons le portent, des lumières s'allument sur l'eau, et des chants s'élèvent dans la nuit." },
    ],
    fin: "Et Bayard ? On raconte qu'il galope encore, la nuit, dans la forêt des Ardennes…",
    // La treizième page : la scène secrète du Grand Marionnettiste (ouverte si l'enfant l'a trouvée)
    treizieme: {
      titre: "La treizième scène",
      trouvee: "Et voici la treizième scène, celle que personne ne connaît… sauf toi, {enfant} !",
      cachee: "La treizième scène est encore cachée. Au théâtre, on frappe trois coups avant le spectacle… Le Grand Marionnettiste attend toujours les siens.",
    },
  },
};

export {};
