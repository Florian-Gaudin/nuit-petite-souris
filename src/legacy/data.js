// Textes de l'histoire, racontée par Quenotte à la première personne.
// Les mots entre accolades sont remplacés par la configuration ({enfant}, {poupee}, {chat}, {ville}…).
// Expressions possibles du portrait : sourire, joie, surprise, chuchote, clin, triste.
window.DATA = {

  // ---------- Chapitre 0 : accueil ----------
  accueil: {
    txt: "Coucou {enfant} ! Moi, c'est {souris}, la souris des dents de lait. Cette nuit, j'ai eu besoin de toi. Viens, je te raconte !",
    expr: "joie",
    bouton: "Viens, je te raconte !",
  },
  // Mode surprise : l'histoire a été ouverte avant le matin prévu
  surprise: { txt: "Chut… Coucou {enfant} ! Je ne suis pas encore passée chez toi. Ferme vite les yeux, et reviens me voir {reveilTexte}, à ton réveil !", expr: "chuchote" },
  // La carte de France : d'où part Quenotte, et où elle va cette nuit
  origine: {
    txt: "Je vis dans un château caché au fond de la forêt des Ardennes. Chaque nuit, je pars chercher les dents de lait des enfants, partout en France.",
    expr: "joie",
    aide: "Touche l'étoile qui brille !",
  },
  origineVille: { txt: "Ce soir, c'est ta dent que je viens chercher, à {ville} !", expr: "clin", bouton: "En route !" },

  // ---------- Chapitre 1 : six scènes ----------
  // Chaque scène : une bulle d'arrivée (intro), un élément obligatoire (ou une chaîne d'éléments)
  // avec une demande avant le toucher et une réponse après, deux éléments bonus, puis le « pont ».
  scenes: [
    {
      id: "chateau", titre: "Le château", heure: "00:45", ambiance: "chateau",
      intro: { variante: {
        premiere: { txt: "Au fond de la forêt des Ardennes, mon château dort sous les étoiles. Dans ma boîte à trésors, il y a une petite place toute neuve, avec ton prénom écrit dessus. Elle attend ta toute première dent !", expr: "sourire" },
        jumelle: { deja: {
          une: { txt: "Au fond de la forêt des Ardennes, mon château dort sous les étoiles. Dans ma boîte à trésors, il n'y a qu'une seule dent de lait : ta toute première, celle du {arcadePremiere}. Elle est bien triste, toute seule.", expr: "triste" },
          plusieurs: { txt: "Au fond de la forêt des Ardennes, mon château dort sous les étoiles. Dans ma boîte à trésors, il y a déjà {nbDeja} de tes dents de lait. Mais l'une d'elles est bien triste : sa jumelle n'est pas encore arrivée.", expr: "triste" },
        } },
        suite: { txt: "Au fond de la forêt des Ardennes, mon château dort sous les étoiles. Dans ma boîte à trésors, il y a déjà {nbDeja} de tes dents de lait. Elles se racontent des histoires en attendant la suivante.", expr: "sourire" },
      } },
      oblig: ["lanterne"], bonus: ["feuillage", "sac"],
      elements: {
        lanterne: {
          demande: { variante: {
            premiere: { txt: "Et ce soir, j'ai reçu un message : ta toute première dent est tombée ! C'est un grand jour. Je dois aller la chercher cette nuit. Allume ma lanterne, il fait si noir !", expr: "surprise" },
            jumelle: { deja: {
              une: { txt: "Mais j'ai reçu un message : ta {ordinal} dent est tombée ! C'est la jumelle de la première. Je dois aller la chercher cette nuit. Allume ma lanterne, il fait si noir !", expr: "surprise" },
              plusieurs: { txt: "Mais j'ai reçu un message : ta {ordinal} dent est tombée ! C'est la jumelle de celle qui attend. Je dois aller la chercher cette nuit. Allume ma lanterne, il fait si noir !", expr: "surprise" },
            } },
            suite: { txt: "Et ce soir, j'ai reçu un message : ta {ordinal} dent est tombée ! Une nouvelle petite sœur pour la collection. Je dois aller la chercher cette nuit. Allume ma lanterne, il fait si noir !", expr: "surprise" },
          } },
          reponse: { txt: "Merci {enfant} ! Avec ma lanterne, je vois comme en plein jour.", expr: "joie" },
        },
        feuillage: {
          bulle: { txt: "Hou hou ! C'est la hulotte, ma voisine. Elle sort la tête des feuilles pour me dire : « Bon voyage, {souris} ! » Touche-la encore : elle va s'envoler !", expr: "surprise" },
          bulle2: { txt: "Et hop, elle s'envole chasser dans la forêt. À bientôt, hulotte !", expr: "joie" },
        },
        sac: { bulle: { txt: "Regarde dans mon sac : j'ai un cadeau pour toi ! C'est un billet de {euros} euros, pour te remercier de ta dent.", expr: "clin" } },
      },
      pont: { txt: "C'est parti, direction la forêt !", expr: "joie" },
    },
    {
      id: "foret", titre: "La forêt des Ardennes", heure: "01:05", ambiance: "foret",
      intro: { txt: "Me voilà dans la grande forêt. Les arbres sont si hauts qu'ils cachent la lune. Je trottine sur mes petites pattes, mais je n'y vois presque rien.", expr: "chuchote" },
      oblig: ["champignons"], bonus: ["buisson", "luciole"],
      elements: {
        champignons: {
          demande: { txt: "Tu vois ces champignons sur le chemin ? On dirait qu'ils brillent un petit peu. Touche-les, pour voir !", expr: "surprise" },
          etapes: ["Oh, il s'allume ! Un…", "Deux…", "Trois champignons !"],
          reponse: { txt: "Ils s'allument quand on les touche ! Un, deux, trois champignons… et la forêt devient toute dorée. Merci, je vois enfin le chemin !", expr: "joie" },
        },
        buisson: { bulle: { txt: "Bonsoir, petite souris ! Je suis le renard. Je veille sur la forêt pendant que tout le monde dort. Je sais où tu vas : continue tout droit, tu vas entendre l'eau.", expr: "surprise" } },
        luciole: { bulle: { txt: "Cette luciole connaît tous les raccourcis ! Elle fait des zigzags pour me montrer la route.", expr: "clin" } },
      },
      pont: { txt: "J'entends de l'eau qui coule… ça doit être la Meuse !", expr: "sourire" },
    },
    {
      id: "meuse", titre: "La Meuse", heure: "01:30", ambiance: "meuse",
      intro: { txt: "Voilà la Meuse, la grande rivière des Ardennes. Elle est large, large, large, et il n'y a pas de pont pour les souris. Comment faire ?", expr: "surprise" },
      oblig: ["billet"], bonus: ["bulles", "reflet"],
      elements: {
        billet: {
          demande: { txt: "J'ai une idée ! J'ai un billet de {euros} euros pour toi, et je vais le plier pour en faire un bateau. Aide-moi : touche le billet pour le plier.", expr: "clin" },
          etapes: ["Un pli…", "Deux plis…", "Trois plis… Le bateau est prêt !"],
          reponse: { txt: "Je monte à bord et hop, je traverse ! Le bateau se balance sous la lune. Oh, quelques gouttes ont mouillé le billet. Ne t'inquiète pas, je le ferai sécher{auChaud} sur {cachetteNom}.", expr: "joie" },
        },
        bulles: { bulle: { txt: "Splash ! Un poisson me dit bonjour. Il a l'air de bien s'amuser, lui.", expr: "surprise" } },
        reflet: { bulle: { txt: "Regarde, la lune se baigne dans la Meuse. Quand on la touche, elle fait des ronds dans l'eau !", expr: "sourire" } },
      },
      pont: { txt: "Sur l'autre rive, je vois briller les lumières de Charleville.", expr: "joie" },
    },
    {
      id: "place", titre: "La place Ducale", heure: "01:50", ambiance: "place",
      intro: { txt: "Quelle belle place ! C'est la place Ducale, avec ses grandes arcades. Je me faufile d'arcade en arcade sans faire de bruit.", expr: "sourire" },
      oblig: ["marionnettiste"], bonus: ["fenetre", "fromage"],
      elements: {
        marionnettiste: {
          demande: { txt: "Regarde là-haut : c'est le Grand Marionnettiste ! Je crois qu'il m'a vue passer. Touche-le, pour voir ce qu'il fait.", expr: "surprise" },
          reponse: { txt: "Il a vu passer une petite souris et il me fait coucou ! Il fait même danser un pantin pour moi.", expr: "joie" },
        },
        fenetre: { bulle: { txt: "Chut, un pigeon dort derrière la fenêtre. Oh, je l'ai réveillé ! Pardon, monsieur le pigeon.", expr: "chuchote" } },
        fromage: { bulle: { txt: "Pause fromage ! Avec tous ces kilomètres, j'avais bien mérité un petit morceau. Miam.", expr: "joie" } },
      },
      pont: { txt: "Le Grand Marionnettiste m'indique le chemin : au bout de la place, une montgolfière m'attend !", expr: "sourire" },
    },
    {
      id: "montgolfiere", titre: "Au-dessus des Ardennes", heure: "02:00", ambiance: "montgolfiere",
      intro: { txt: "Au bout de la place, une petite montgolfière rouge et jaune m'attend, posée dans l'herbe. Je grimpe dans la nacelle avec ma lanterne et mon sac. Mais pour décoller, il faut réchauffer l'air du ballon.", expr: "joie" },
      oblig: ["bruleur"], bonus: ["etoile", "oies"],
      elements: {
        bruleur: {
          demande: { txt: "Touche le brûleur, juste au-dessus de la nacelle, pour faire une grande flamme. Il faut trois flammes pour décoller !", expr: "clin" },
          etapes: ["Fouuu… le ballon se gonfle !", "Fouuuu… il se redresse !", "Fouuuuu… on décolle !"],
          reponse: { txt: "On s'envole ! Je vois les Ardennes qui dorment, et la Meuse qui brille comme un ruban d'argent. Le vent me pousse tout droit vers {ville}.", expr: "joie" },
        },
        etoile: { bulle: { txt: "Une étoile filante ! Vite, fais un vœu. Moi, j'ai fait le mien : que ta dent arrive bien au château.", expr: "surprise" } },
        oies: { bulle: { txt: "Des oies sauvages volent à côté de moi. Elles cancanent « Bon voyage, {souris} ! » et filent vers le sud.", expr: "surprise" } },
      },
      pont: { txt: "La montgolfière redescend tout doucement… J'aperçois les toits de {ville} !", expr: "sourire" },
    },
    {
      id: "aiglemont", titre: "{ville}", heure: "02:10", ambiance: "aiglemont",
      intro: { txt: "La montgolfière se pose sans bruit dans un champ. Me voici à {ville}. Toutes les maisons dorment et les volets sont fermés. Mais laquelle est la tienne ?", expr: "surprise" },
      oblig: ["girouette"], bonus: ["lampadaire", "fenetre"],
      elements: {
        girouette: {
          demande: { txt: "Tu vois la girouette, sur le toit ? Fais-la tourner, elle va me guider !", expr: "clin" },
          reponse: { txt: "Elle tourne, elle tourne… elle s'arrête. Ta maison est par là !", expr: "joie" },
        },
        lampadaire: { bulle: { txt: "Ce lampadaire grésille comme s'il ronflait. Dors bien, lampadaire !", expr: "clin" } },
        fenetre: { bulle: { fratrie: {
          aCote: { txt: "Là-haut, une petite lumière : la veilleuse de ta chambre. Je vois {frere} qui dort à côté de toi. Chut !", expr: "chuchote" },
          ailleurs: { doudou: { oui: { txt: "Là-haut, une petite lumière : la veilleuse de ta chambre. Je vois {poupee}, bien au chaud à côté de toi.", expr: "chuchote" }, non: { txt: "Là-haut, une petite lumière : la veilleuse de ta chambre. Tu dors bien au chaud.", expr: "chuchote" } } },
          non: { doudou: { oui: { txt: "Là-haut, une petite lumière : la veilleuse de ta chambre. Je vois {poupee}, bien au chaud à côté de toi.", expr: "chuchote" }, non: { txt: "Là-haut, une petite lumière : la veilleuse de ta chambre. Tu dors bien au chaud.", expr: "chuchote" } } },
        } } },
      },
      pont: { txt: "J'y suis presque ! Il ne reste que le jardin à traverser.", expr: "sourire" },
    },
    {
      id: "pantoufle", titre: "{chat}", heure: "02:31", ambiance: "pantoufle",
      intro: { txt: "Le jardin est tout calme… Chut ! Il y a quelque chose devant la porte. Deux grands yeux brillent dans le noir. Touche-les, doucement.", expr: "chuchote" },
      oblig: ["yeux", "quenotte"], bonus: ["fleurs", "fenetre"],
      elements: {
        yeux: {
          reponse: { fratrie: {
            aCote: { txt: "C'est {chat}, le chat du voisin ! Il dort sur le seuil et il a l'oreille fine. Si je le réveille, il va miauler, et {tonFrere} va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" },
            ailleurs: { doudou: { oui: { txt: "C'est {chat}, le chat du voisin ! Il dort sur le seuil et il a l'oreille fine. Si je le réveille, il va miauler, et {poupee} va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" }, non: { txt: "C'est {chat}, le chat du voisin ! Il dort sur le seuil et il a l'oreille fine. Si je le réveille, il va miauler, et toute la maison va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" } } },
            non: { doudou: { oui: { txt: "C'est {chat}, le chat du voisin ! Il dort sur le seuil et il a l'oreille fine. Si je le réveille, il va miauler, et {poupee} va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" }, non: { txt: "C'est {chat}, le chat du voisin ! Il dort sur le seuil et il a l'oreille fine. Si je le réveille, il va miauler, et toute la maison va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" } } },
          } },
        },
        quenotte: {
          demande: { txt: "Je sais, je sais… j'ai un plan. Touche-moi, je t'explique !", expr: "chuchote" },
          reponse: { txt: "{enfant}, j'ai besoin de toi. Quand {chat} dort, j'avance. Quand il ouvre les yeux, je m'arrête. Tu m'aides ?", expr: "sourire" },
        },
        fleurs: { bulle: { txt: "Un pot de fleurs sur le pas de la porte… Elles sentent bon ! Je m'y cache une seconde : personne ne voit une souris entre les pétales.", expr: "clin" } },
        fenetre: { bulle: { txt: "Par la fenêtre, j'aperçois la pendule du salon : il est 2 h 31. Vite, il ne faut pas traîner !", expr: "surprise" } },
      },
      pont: null,
      bouton: "Aider {souris} !",
    },
  ],

  // Première scène : Quenotte explique les secrets (une seule fois)
  indices: { txt: "Un conseil : dans chaque image, deux secrets brillent avec une petite étoile. Touche-les quand tu veux, chacun te donnera une étoile découverte !", expr: "clin" },

  // Petites phrases quand on découvre un bonus
  etoile: "Une étoile découverte !",
  etoilesToutes: "Toutes les étoiles de la scène !",

  // ---------- Chapitre 2 : 1, 2, 3, soleil avec le chat ----------
  jeu: {
    intro: { txt: "Reste appuyé sur le bouton pour me faire avancer. Dès que {chat} ouvre un œil, lâche tout !", expr: "chuchote" },
    dort: ["Chut… avance !", "Il dort, vas-y doucement.", "Encore un peu…"],
    baille: ["Il bâille… attention !", "Oh oh, il remue."],
    reveille: ["Il bouge, stop !", "Ne bouge plus !"],
    vu: ["Mmh ? Ouf, il se rendort. On continue.", "Il m'a presque vue ! Je recule un peu."],
    trop: "{chat} ronfle trop fort pour entendre quoi que ce soit. Fonce !",
    gagne: { txt: "Passé ! Merci {enfant}, sans toi je serais encore devant lui. Maintenant, chut… je rentre.", expr: "joie" },
    bouton: "Voir ma caméra",
  },

  // ---------- Chapitre 3 : la caméra (Quenotte chuchote) ----------
  camera: {
    intro: { txt: "Chut… J'ai mis ma petite caméra en marche. Je suis entrée par la chatière, {chat} n'a rien entendu.", expr: "chuchote" },
    cheminee: { txt: "Voilà {cachetteNom}{eteint}. Je pose ton billet dessus : il va sécher{auChaudFin} jusqu'au matin.", expr: "chuchote" },
    chambre: { fratrie: {
      aCote: { doudou: { oui: { txt: "Te voilà ! Tu dors comme une marmotte. {poupee} dort tout contre toi, et {frere} ronfle tout doucement dans son lit.", expr: "chuchote" }, non: { txt: "Te voilà ! Tu dors comme une marmotte. Et {frere} ronfle tout doucement dans son lit.", expr: "chuchote" } } },
      ailleurs: { doudou: { oui: { txt: "Te voilà ! Tu dors comme une marmotte. Et {poupee} dort aussi, tout contre toi.", expr: "chuchote" }, non: { txt: "Te voilà ! Tu dors comme une marmotte, bien au chaud sous ta couette.", expr: "chuchote" } } },
      non: { doudou: { oui: { txt: "Te voilà ! Tu dors comme une marmotte. Et {poupee} dort aussi, tout contre toi.", expr: "chuchote" }, non: { txt: "Te voilà ! Tu dors comme une marmotte, bien au chaud sous ta couette.", expr: "chuchote" } } },
    } },
    dent: { variante: {
      premiere: { txt: "Sous l'oreiller… la voilà, ta toute première dent ! À la place, je glisse un petit mot pour toi.", expr: "joie" },
      jumelle: { txt: "Sous l'oreiller… la voilà, ta {ordinal} dent ! À la place, je glisse un petit mot pour toi.", expr: "joie" },
      suite: { txt: "Sous l'oreiller… la voilà, ta {ordinal} dent ! À la place, je glisse un petit mot pour toi.", expr: "joie" },
    } },
    fin: { txt: "Mission accomplie ! Je repars au château avec ta dent. Bonne nuit, {enfant}.", expr: "clin" },
    bouton: "Lire ma lettre",
  },

  // ---------- Chapitre 4 : la lettre ----------
  lettreIntro: { txt: "Je t'ai laissé une lettre avant de partir. Touche le cachet de cire pour l'ouvrir.", expr: "sourire" },
  lettreFin: { txt: "Lis-la bien, et va vite voir {lieuBillet} !", expr: "clin" },
  lettre: [
    "{Chere} {enfant},",
    "Merci pour ton aide cette nuit ! Sans toi, je serais encore devant {chat}.",
    { fratrie: {
      aCote: "Je suis entrée tout doucement, pour ne réveiller ni toi ni {frere}. Je n'ai pas fait un bruit.",
      ailleurs: { doudou: { oui: "Je suis entrée tout doucement. {poupee} dormait contre toi, et je n'ai pas fait un bruit.", non: "Je suis entrée tout doucement, et je n'ai pas fait un bruit." } },
      non: { doudou: { oui: "Je suis entrée tout doucement. {poupee} dormait contre toi, et je n'ai pas fait un bruit.", non: "Je suis entrée tout doucement, et je n'ai pas fait un bruit." } },
    } },
    { variante: {
      premiere: "J'ai pris ta toute première dent. Au château, elle a sa place à elle, juste à côté de mon lit. Elle brille comme une étoile !",
      jumelle: "J'ai pris ta {ordinal} dent. Au château, elle a retrouvé sa jumelle. Elles ne se quittent plus !",
      suite: "J'ai pris ta {ordinal} dent. Au château, elle a rejoint ses sœurs. Elles font la fête !",
    } },
    "Ton billet de {euros} euros a traversé la Meuse en bateau. Il sèche {lieuBillet} : va vite le chercher !",
    { fratrie: { aCote: "Fais un gros bisou à {frere} de ma part.", ailleurs: "Fais un gros bisou à {frere} de ma part.", non: null } },
    "Brosse bien tes dents, le matin et le soir. Les nouvelles vont pousser grandes et fortes.",
    "À la prochaine dent !",
  ],
  signature: "Bisous à moustaches, {souris}",
  heureLettre: "3 h 02",
  ps: "P.-S. J'ai laissé un bout de fromage à {chat}. Ne lui dis pas que c'est moi.",
  boutonLettre: "J'ai trouvé mon billet !",

  // ---------- Chapitre 5 : le diplôme ----------
  diplome: { txt: "Bravo {enfant} ! Voici ton diplôme officiel, signé de ma patte. Tu peux l'imprimer avec un grand.", expr: "joie" },
  billetTrouve: { txt: "Tu l'as trouvé ? Il est sec maintenant. Il est à toi !", expr: "joie" },

  // ---------- Chapitre secret : la 13e scène du Grand Marionnettiste ----------
  scene13: [
    { variante: { premiere: "Scène treize : la nuit de la toute première dent de {enfant}.", jumelle: "Scène treize : la nuit de la {ordinal} dent de {enfant}.", suite: "Scène treize : la nuit de la {ordinal} dent de {enfant}." } },
    "Le chat {chat} ronfle. {enfant} a aidé la souris à passer.",
    { variante: { premiere: "La première dent brille dans la boîte à trésors du château.", jumelle: "Les deux dents jumelles sont réunies au château.", suite: "La collection du château compte une dent de plus." } },
  ],

  // ---------- Badges du diplôme ----------
  badges: [
    // obtenu : ce que dit le diplôme quand le badge est gagné ; aGagner : comment l'obtenir
    { id: "detective", nom: "Détective de nuit", chapitre: 1, obtenu: "Tu as guidé {souris} de son château jusqu'à ta maison.", aGagner: "Guide {souris} de son château jusqu'à ta maison." },
    { id: "exploratrice", nom: "{Exploratrice}", etoiles: 6, obtenu: "Tu as trouvé au moins 6 étoiles cachées dans les images.", aGagner: "Trouve 6 étoiles cachées dans les images du voyage." },
    { id: "lynx", nom: "Œil de lynx", etoiles: 14, obtenu: "Tu as trouvé les 14 étoiles cachées. Rien ne t'échappe !", aGagner: "Trouve les 14 étoiles cachées dans les images du voyage." },
    { id: "passechat", nom: "Passe-Chat", chapitre: 2, obtenu: "Tu as aidé {souris} à passer devant {chat} sans le réveiller.", aGagner: "Aide {souris} à passer devant {chat} sans le réveiller." },
    { id: "hibou", nom: "Œil de hibou", chapitre: 3, obtenu: "Tu as regardé le film de la caméra de {souris} jusqu'au bout.", aGagner: "Regarde le film de la caméra de {souris} jusqu'au bout." },
    { id: "amie", nom: "{Amie} de {souris}", chapitre: 4, obtenu: "Tu as lu la lettre que {souris} t'a laissée.", aGagner: "Lis la lettre que {souris} t'a laissée." },
    { id: "jumelle", chapitre: 5,
      nom: { variante: { premiere: "Première dent", jumelle: "Dent jumelle", suite: "{Collectionneuse}" } },
      obtenu: { variante: { premiere: "Ta toute première dent est arrivée au château.", jumelle: "Ta {ordinal} dent a retrouvé sa jumelle au château.", suite: "Ta {ordinal} dent a rejoint ta collection au château." } },
      aGagner: { variante: { premiere: "Ta toute première dent doit arriver au château.", jumelle: "Ta {ordinal} dent doit retrouver sa jumelle au château.", suite: "Ta {ordinal} dent doit rejoindre ta collection au château." } } },
    { id: "billet", nom: "Billet trouvé", bouton: true, obtenu: "Tu as trouvé le billet qui séchait {lieuBillet}.", aGagner: "Trouve le billet qui sèche {lieuBillet}, puis touche « J'ai trouvé mon billet ! » à la fin de la lettre." },
    { id: "scene13", nom: "Scène 13", secret: true, obtenu: "Tu as découvert la 13e scène secrète du Grand Marionnettiste !", aGagner: "Un secret bien caché…" },
  ],
};

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
