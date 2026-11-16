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
    txt: "Je me cache dans le grand château fort de Sedan, au cœur des Ardennes. Chaque nuit, je pars chercher les dents de lait des enfants, partout en France.",
    expr: "joie",
    aide: "Touche l'étoile qui brille !",
  },
  origineVille: { txt: "Ce soir, c'est ta dent que je viens chercher, à {ville} !", expr: "clin", bouton: "En route !" },

  // ---------- Chapitre 1 : dix scènes ----------
  // Chaque scène : une bulle d'arrivée (intro), un élément obligatoire (ou une chaîne d'éléments)
  // avec une demande avant le toucher et une réponse après, deux éléments bonus, puis le « pont ».
  scenes: [
    {
      id: "chateau", titre: "Le château", heure: "00:45", ambiance: "chateau",
      intro: { variante: {
        premiere: { txt: "Au cœur des Ardennes, le château fort de Sedan dort sous les étoiles : c'est là que je me cache ! Dans ma boîte à trésors, il y a une petite place toute neuve, avec ton prénom écrit dessus. Elle attend ta toute première dent !", expr: "sourire" },
        jumelle: { deja: {
          une: { txt: "Au cœur des Ardennes, le château fort de Sedan dort sous les étoiles : c'est là que je me cache ! Dans ma boîte à trésors, il n'y a qu'une seule dent de lait : ta toute première, celle du {arcadePremiere}. Elle est bien triste, toute seule.", expr: "triste" },
          plusieurs: { txt: "Au cœur des Ardennes, le château fort de Sedan dort sous les étoiles : c'est là que je me cache ! Dans ma boîte à trésors, il y a déjà {nbDeja} de tes dents de lait. Mais l'une d'elles est bien triste : sa jumelle n'est pas encore arrivée.", expr: "triste" },
        } },
        suite: { txt: "Au cœur des Ardennes, le château fort de Sedan dort sous les étoiles : c'est là que je me cache ! Dans ma boîte à trésors, il y a déjà {nbDeja} de tes dents de lait. Elles se racontent des histoires en attendant la suivante.", expr: "sourire" },
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
        sac: { bulle: { txt: "Regarde dans mon sac : j'ai un cadeau pour toi ! C'est {unCadeau}, pour te remercier de ta dent.", expr: "clin" } },
      },
      pont: { txt: "C'est parti, direction la forêt !", expr: "joie" },
    },
    {
      id: "foret", titre: "La forêt des Ardennes", heure: "01:05", ambiance: "foret",
      intro: { txt: "Me voilà dans la grande forêt. Les arbres sont si hauts qu'ils cachent la lune. Je trottine sur mes petites pattes, mais je n'y vois presque rien.", expr: "chuchote" },
      oblig: ["champignons"], bonus: ["buisson", "luciole"], ardennes: ["sanglier"],
      elements: {
        champignons: {
          demande: { txt: "Tu vois ces champignons sur le chemin ? On dirait qu'ils brillent un petit peu. Touche-les, pour voir !", expr: "surprise" },
          etapes: ["Oh, il s'allume ! Un…", "Deux…", "Trois champignons !"],
          reponse: { txt: "Ils s'allument quand on les touche ! Un, deux, trois champignons… et la forêt devient toute dorée. Merci, je vois enfin le chemin !", expr: "joie" },
        },
        buisson: { bulle: { txt: "Bonsoir, petite souris ! Je suis le renard. Je veille sur la forêt pendant que tout le monde dort. Je sais où tu vas : continue tout droit, tu vas entendre l'eau.", expr: "surprise" } },
        luciole: { bulle: { txt: "Cette luciole connaît tous les raccourcis ! Elle fait des zigzags pour me montrer la route.", expr: "clin" } },
        sanglier: { bulle: { txt: "Chut… un sanglier ronfle sous les fougères ! C'est l'animal des Ardennes. Son cousin, le Woinic, est le plus grand sanglier du monde : dix mètres de haut !", expr: "chuchote" } },
      },
      pont: { txt: "Au bout du chemin, j'aperçois les lumières de Charleville !", expr: "sourire" },
    },
    {
      id: "place", titre: "La place Ducale", heure: "01:30", ambiance: "place",
      intro: { txt: "Quelle belle place ! C'est la place Ducale, avec ses grandes arcades. Je me faufile d'arcade en arcade sans faire de bruit.", expr: "sourire" },
      oblig: ["marionnettiste"], bonus: ["fenetre", "galette"], ardennes: ["plaque", "plume"],
      elements: {
        marionnettiste: {
          demande: { txt: "Regarde là-haut : c'est le Grand Marionnettiste ! Je crois qu'il m'a vue passer. Touche-le, pour voir ce qu'il fait.", expr: "surprise" },
          reponse: { txt: "Il me fait coucou et fait danser un pantin pour moi ! Ici, à Charleville, c'est la capitale des marionnettes.", expr: "joie" },
        },
        fenetre: { bulle: { txt: "Chut, un pigeon dort derrière la fenêtre. Oh, je l'ai réveillé ! Pardon, monsieur le pigeon.", expr: "chuchote" } },
        galette: { bulle: { txt: "Pause goûter : une part de galette au sucre, la spécialité des Ardennes ! Avec tous ces kilomètres, je l'ai bien méritée. Miam.", expr: "joie" } },
        plaque: { bulle: { txt: "Cette place a plus de quatre cents ans ! C'est le prince Charles de Gonzague qui l'a fait construire. Elle ressemble à une célèbre place de Paris : la place des Vosges.", expr: "surprise" } },
        plume: { bulle: { txt: "Une grande plume dépasse de cette fenêtre… On dirait celle d'Arthur Rimbaud, un grand poète né ici, à Charleville. Il rêvait de voyages… comme moi !", expr: "clin" } },
      },
      pont: { txt: "Toutes les heures, il raconte l'histoire de quatre frères et de leur cheval magique, Bayard. On dit même qu'il cache une treizième scène… Allez, une montgolfière m'attend !", expr: "sourire" },
    },
    {
      id: "montgolfiere", titre: "Au-dessus des Ardennes", heure: "01:50", ambiance: "montgolfiere",
      intro: { txt: "Au bout de la place, une petite montgolfière rouge et jaune m'attend, posée dans l'herbe. Je grimpe dans la nacelle avec ma lanterne et mon sac. Mais pour décoller, il faut réchauffer l'air du ballon.", expr: "joie" },
      oblig: ["bruleur"], bonus: ["etoile", "oies"], ardennes: ["sedan", "ardoises", "cabaret"],
      elements: {
        bruleur: {
          demande: { txt: "Touche le brûleur, juste au-dessus de la nacelle, pour faire une grande flamme. Il faut trois flammes pour décoller !", expr: "clin" },
          etapes: ["Fouuu… le ballon se gonfle !", "Fouuuu… il se redresse !", "Fouuuuu… on décolle !"],
          reponse: { txt: "On s'envole ! Je vois les Ardennes qui dorment, et la Meuse qui fait de grandes boucles, comme un ruban d'argent. Le vent me pousse tout droit vers {ville}.", expr: "joie" },
        },
        etoile: { bulle: { txt: "Une étoile filante ! Vite, fais un vœu. Moi, j'ai fait le mien : que ta dent arrive bien au château.", expr: "surprise" } },
        oies: { bulle: { txt: "Des oies sauvages volent à côté de moi. Elles cancanent « Bon voyage, {souris} ! » et filent vers le sud.", expr: "surprise" } },
        sedan: { bulle: { txt: "Là-bas, au loin, c'est le château fort de Sedan : ma maison ! C'est le plus grand château fort d'Europe. On pourrait s'y perdre.", expr: "surprise" } },
        ardoises: { bulle: { txt: "Les toits brillent sous la lune : ils sont en ardoise, une pierre grise et bleue qu'on tire du sol des Ardennes.", expr: "sourire" } },
        cabaret: { bulle: { txt: "Tu entends cette musique ? Chaque été, au bord de la Meuse, le festival du Cabaret Vert fait danser des milliers de gens !", expr: "joie" } },
      },
      pont: { txt: "La montgolfière monte, monte… jusqu'au milieu des étoiles !", expr: "surprise" },
    },
    {
      // La constellation : un décor entièrement consacré au mini-jeu (relier les étoiles qui dessinent une dent)
      id: "etoiles", titre: "Au milieu des étoiles", heure: "02:00", ambiance: "etoiles",
      intro: { txt: "Que c'est beau, là-haut ! La montgolfière flotte au milieu des étoiles. Regarde : certaines brillent plus fort que les autres…", expr: "surprise" },
      oblig: ["constellation"], bonus: ["lune", "mouton"],
      elements: {
        constellation: {
          demande: { txt: "Relie-les du doigt, en commençant par celle qui clignote. On dirait qu'elles veulent dessiner quelque chose !", expr: "clin" },
          etapes: ["Une…", "Deux…", "Trois…", "Quatre…", "Cinq…", "Six…", "Sept… Oh ! Regarde ce qu'elles dessinent !"],
          reponse: { txt: "Une dent ! Les étoiles dessinent une dent dans le ciel : c'est le signe que je suis sur la bonne route. Merci, {enfant} !", expr: "joie" },
        },
        lune: { bulle: { txt: "La lune me fait un clin d'œil ! Elle veille sur tous les enfants qui dorment, et sur toi aussi.", expr: "clin" } },
        mouton: { bulle: { txt: "Un nuage en forme de mouton ! Les enfants qui comptent les moutons pour s'endormir, c'est lui qu'ils voient.", expr: "sourire" } },
      },
      pont: { txt: "La montgolfière redescend tout doucement… J'aperçois {riviere} qui brille sous la lune !", expr: "sourire" },
    },
    {
      // Le cours d'eau près de chez l'enfant (« la rivière » si les parents n'en ont pas indiqué)
      id: "meuse", titre: "{Riviere}", heure: "02:10", ambiance: "meuse",
      intro: { txt: "La montgolfière se pose au bord de l'eau. Voilà {riviere} ! Pour une petite souris, c'est grand comme la mer, et il n'y a pas de pont pour les souris. Comment faire ?", expr: "surprise" },
      oblig: ["billet"], bonus: ["bulles", "reflet"],
      elements: {
        billet: {
          demande: { cadeau: {
            billet: { txt: "J'ai une idée ! J'ai {unCadeau} pour toi, et je vais le plier pour en faire un bateau. Aide-moi : touche le billet pour le plier.", expr: "clin" },
            piece: { txt: "J'ai une idée ! J'ai {unCadeau} pour toi. Une pièce, ça coule… alors je vais lui construire un bateau. Aide-moi : touche la pièce pour commencer.", expr: "clin" },
            paquet: { txt: "J'ai une idée ! J'ai {unCadeau} pour toi. Un paquet, ça prend l'eau… alors je vais lui construire un bateau. Aide-moi : touche le paquet pour commencer.", expr: "clin" },
            chocolat: { txt: "J'ai une idée ! J'ai {unCadeau} pour toi. Des chocolats, ça ne nage pas… alors je vais leur construire un bateau. Aide-moi : touche la boîte pour commencer.", expr: "clin" },
          } },
          etapes: [
            { cadeau: { billet: "Un pli…", piece: "Une coquille de noix…", paquet: "Une coquille de noix…", chocolat: "Une coquille de noix…" } },
            { cadeau: { billet: "Deux plis…", piece: "Un mât en brindille…", paquet: "Un mât en brindille…", chocolat: "Un mât en brindille…" } },
            { cadeau: { billet: "Trois plis… Le bateau est prêt !", piece: "Une feuille pour la voile… Le bateau est prêt !", paquet: "Une feuille pour la voile… Le bateau est prêt !", chocolat: "Une feuille pour la voile… Le bateau est prêt !" } },
          ],
          reponse: { cadeau: {
            billet: { txt: "Je monte à bord et hop, je traverse ! Le bateau se balance sous la lune. Oh, quelques gouttes ont mouillé le billet. Ne t'inquiète pas, je le ferai sécher{auChaud} sur {cachetteNom}.", expr: "joie" },
            piece: { txt: "Je monte à bord avec ta pièce et hop, je traverse ! Le bateau se balance sous la lune. Oh, quelques gouttes ont mouillé la pièce. Ne t'inquiète pas, je la ferai sécher{auChaud} sur {cachetteNom}.", expr: "joie" },
            paquet: { txt: "Je monte à bord avec ton paquet et hop, je traverse ! Le bateau se balance sous la lune. Oh, quelques gouttes ont mouillé son joli papier. Ne t'inquiète pas, je le ferai sécher{auChaud} sur {cachetteNom}.", expr: "joie" },
            chocolat: { txt: "Je monte à bord avec ta boîte de chocolats et hop, je traverse ! Le bateau se balance sous la lune. Oh, quelques gouttes ont mouillé la boîte. Ne t'inquiète pas, je la ferai sécher sur {cachetteNom}. Les chocolats, eux, sont restés bien à l'abri !", expr: "joie" },
          } },
        },
        bulles: { bulle: { txt: "Splash ! Un poisson me dit bonjour. Il a l'air de bien s'amuser, lui.", expr: "surprise" } },
        reflet: { bulle: { txt: "Regarde, la lune se baigne dans {riviere}. Quand on la touche, elle fait des ronds dans l'eau !", expr: "sourire" } },
      },
      pont: { txt: "Me voilà sur l'autre rive. Mais {ville} est encore loin, derrière les champs…", expr: "surprise" },
    },
    {
      // Du bord de l'eau jusqu'à la ville : le cours d'eau peut être à quelques kilomètres de chez l'enfant
      id: "lievre", titre: "En route vers {ville}", heure: "02:18", ambiance: "lievre",
      intro: { txt: "Dans le champ, quelque chose dort, roulé en boule dans l'herbe. Deux grandes oreilles… c'est un lièvre ! Les lièvres courent plus vite que le vent.", expr: "surprise" },
      oblig: ["lievre"], bonus: ["herisson", "epouvantail"],
      elements: {
        lievre: {
          demande: { txt: "Il connaît le chemin de {ville}. Touche-le pour le réveiller, tout doucement !", expr: "clin" },
          etapes: ["Il ouvre un œil…", "Il dresse les oreilles…", "Il est prêt : en selle !"],
          reponse: { txt: "Je grimpe sur son dos, et hop, hop, hop ! Trois grands bonds par-dessus les sillons, et nous filons à travers les champs.", expr: "joie" },
        },
        herisson: { bulle: { txt: "Un hérisson trottine dans l'herbe. Il cherche des vers de terre pour son dîner de minuit. Bon appétit, hérisson !", expr: "sourire" } },
        epouvantail: { bulle: { txt: "Un épouvantail ! Il fait peur aux corbeaux, mais pas aux souris. Il a même un chapeau à ma taille.", expr: "clin" } },
      },
      pont: { txt: "Le lièvre s'arrête devant un panneau. C'est écrit {ville} : on y est !", expr: "joie" },
    },
    {
      id: "aiglemont", titre: "{ville}", heure: "02:25", ambiance: "aiglemont",
      intro: { logement: {
        maison: { txt: "Merci, lièvre ! Me voici à {ville}. Toutes les maisons dorment et les volets sont fermés. Mais laquelle est la tienne ?", expr: "surprise" },
        appartement: { txt: "Merci, lièvre ! Me voici à {ville}. Tous les immeubles dorment et les fenêtres sont éteintes. Mais lequel est le tien ?", expr: "surprise" },
      } },
      oblig: ["girouette"], bonus: ["lampadaire", "fenetre"],
      elements: {
        girouette: {
          demande: { txt: "Tu vois la girouette, sur le toit ? Fais-la tourner, elle va me guider !", expr: "clin" },
          reponse: { logement: {
            maison: { txt: "Elle tourne, elle tourne… elle s'arrête. Ta maison est par là !", expr: "joie" },
            appartement: { txt: "Elle tourne, elle tourne… elle s'arrête. Ton immeuble est par là !", expr: "joie" },
          } },
        },
        lampadaire: { bulle: { txt: "Ce lampadaire grésille comme s'il ronflait. Dors bien, lampadaire !", expr: "clin" } },
        fenetre: { bulle: { txt: "Là-haut, une petite lumière : la veilleuse de ta chambre ! Je vais m'approcher pour voir.", expr: "chuchote" } },
      },
      pont: { logement: {
        maison: { txt: "J'y suis presque ! Je traverse le jardin jusqu'à ta fenêtre.", expr: "sourire" },
        appartement: { txt: "J'y suis presque ! Je me faufile jusqu'à ta fenêtre.", expr: "sourire" },
      } },
    },
    {
      // La grande fenêtre embuée : on frotte la buée, la chambre de l'enfant apparaît
      id: "fenetre", titre: "Ta fenêtre", heure: "02:28", ambiance: "aiglemont",
      intro: { logement: {
        maison: { txt: "Me voici sous ta fenêtre. Mais la vitre est toute embuée : je ne vois rien à l'intérieur…", expr: "surprise" },
        appartement: { txt: "Je grimpe jusqu'à ta fenêtre, tout là-haut. Mais la vitre est toute embuée : je ne vois rien à l'intérieur…", expr: "surprise" },
      } },
      oblig: ["vitre"], bonus: ["escargot", "araignee"],
      elements: {
        vitre: {
          demande: { txt: "Frotte la buée avec ton doigt, pour voir si c'est bien ta chambre !", expr: "clin" },
          reponse: { fratrie: {
            aCote: { txt: "C'est bien ta chambre ! Tu dors comme un loir, et {frere} aussi, dans son lit. Je file vers la porte, sur la pointe des pattes.", expr: "chuchote" },
            ailleurs: { doudou: { oui: { txt: "C'est bien ta chambre ! Tu dors comme un loir, avec {poupee} tout contre toi. Je file vers la porte, sur la pointe des pattes.", expr: "chuchote" }, non: { txt: "C'est bien ta chambre ! Tu dors comme un loir, bien au chaud. Je file vers la porte, sur la pointe des pattes.", expr: "chuchote" } } },
            non: { doudou: { oui: { txt: "C'est bien ta chambre ! Tu dors comme un loir, avec {poupee} tout contre toi. Je file vers la porte, sur la pointe des pattes.", expr: "chuchote" }, non: { txt: "C'est bien ta chambre ! Tu dors comme un loir, bien au chaud. Je file vers la porte, sur la pointe des pattes.", expr: "chuchote" } } },
          } },
        },
        escargot: { bulle: { txt: "Bonsoir, monsieur l'escargot ! Lui aussi voyage la nuit… mais tout doucement. Il arrivera chez toi demain matin !", expr: "sourire" } },
        araignee: { bulle: { txt: "Une petite araignée tisse sa toile dans le coin de la fenêtre. Elle brille comme un collier sous la lune.", expr: "surprise" } },
      },
      pont: null,
    },
    {
      id: "pantoufle", titre: "{chat}", heure: "02:31", ambiance: "pantoufle",
      intro: { logement: {
        maison: { txt: "Le jardin est tout calme… Chut ! Il y a quelque chose devant la porte. Deux grands yeux brillent dans le noir. Touche-les, doucement.", expr: "chuchote" },
        appartement: { txt: "Le palier est tout calme… Chut ! Il y a quelque chose devant ta porte. Deux grands yeux brillent dans le noir. Touche-les, doucement.", expr: "chuchote" },
      } },
      oblig: ["yeux", "quenotte"], bonus: ["fleurs", "fenetre"],
      elements: {
        yeux: {
          reponse: { fratrie: {
            aCote: { txt: "C'est {chat}, le chat du voisin ! Il dort {surLeSeuil} et il a l'oreille fine. Si je le réveille, il va miauler, et {tonFrere} va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" },
            ailleurs: { doudou: { oui: { txt: "C'est {chat}, le chat du voisin ! Il dort {surLeSeuil} et il a l'oreille fine. Si je le réveille, il va miauler, et {poupee} va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" }, non: { txt: "C'est {chat}, le chat du voisin ! Il dort {surLeSeuil} et il a l'oreille fine. Si je le réveille, il va miauler, et {touteLaMaison} va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" } } },
            non: { doudou: { oui: { txt: "C'est {chat}, le chat du voisin ! Il dort {surLeSeuil} et il a l'oreille fine. Si je le réveille, il va miauler, et {poupee} va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" }, non: { txt: "C'est {chat}, le chat du voisin ! Il dort {surLeSeuil} et il a l'oreille fine. Si je le réveille, il va miauler, et {touteLaMaison} va se réveiller. Je ne veux surtout pas ça.", expr: "surprise" } } },
          } },
        },
        quenotte: {
          demande: { txt: "Je sais, je sais… j'ai un plan. Touche-moi, je t'explique !", expr: "chuchote" },
          reponse: { txt: "{enfant}, j'ai besoin de toi. Quand {chat} dort, j'avance. Quand il ouvre les yeux, je m'arrête. Tu m'aides ?", expr: "sourire" },
        },
        fleurs: { bulle: { logement: {
          maison: { txt: "Un pot de fleurs sur le pas de la porte… Elles sentent bon ! Je m'y cache une seconde : personne ne voit une souris entre les pétales.", expr: "clin" },
          appartement: { txt: "Une grande plante verte sur le palier… Je m'y cache une seconde : personne ne voit une souris entre les feuilles.", expr: "clin" },
        } } },
        fenetre: { bulle: { logement: {
          maison: { txt: "Par la fenêtre, j'aperçois la pendule du salon : il est 2 h 31. Vite, il ne faut pas traîner !", expr: "surprise" },
          appartement: { txt: "Sur le palier, une horloge fait tic-tac : il est 2 h 31. Vite, il ne faut pas traîner !", expr: "surprise" },
        } } },
      },
      pont: null,
      bouton: "Aider {souris} !",
    },
  ],

  // Première scène : Quenotte explique les secrets (une seule fois)
  // Les secrets des Ardennes (feuille de chêne) : à part des étoiles, ils mènent au badge et aux cartes « Le savais-tu ? »
  ardennesTrouve: "Un secret des Ardennes !",
  ardennesTous: "Tous les secrets des Ardennes !",
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
    entrer: "Entrer dans {laMaison}",
  },

  // ---------- La lampe de poche : trouver la chambre dans la maison plongée dans le noir ----------
  lampe: {
    intro: { txt: "Il fait tout noir dans {laMaison} ! Promène ma lumière avec ton doigt pour m'aider à trouver ta chambre.", expr: "chuchote" },
    aide: { txt: "Regarde, un peu de lumière passe sous une porte… C'est sûrement ta veilleuse !", expr: "chuchote" },
    trouve: { txt: "La voilà, ta chambre ! Je mets ma petite caméra en marche, et j'entre sur la pointe des pattes.", expr: "joie" },
  },

  // ---------- Chapitre 3 : la caméra (Quenotte chuchote) ----------
  camera: {
    intro: { logement: {
      maison: { txt: "Chut… J'ai mis ma petite caméra en marche. Je suis entrée par la chatière, {chat} n'a rien entendu.", expr: "chuchote" },
      appartement: { txt: "Chut… J'ai mis ma petite caméra en marche. Je me suis glissée sous la porte, {chat} n'a rien entendu.", expr: "chuchote" },
    } },
    cheminee: { txt: "Voilà {cachetteNom}{eteint}. Je pose {tonCadeauCourt} dessus : {il} va sécher{auChaudFin} jusqu'au matin.", expr: "chuchote" },
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
  lettreFin: { txt: "Lis-la bien, et va vite regarder {lieuBillet} !", expr: "clin" },
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
    "{TonCadeau} a traversé {riviere} en bateau. {Il} sèche {lieuBillet} : va vite {le} chercher !",
    { fratrie: { aCote: "Fais un gros bisou à {frere} de ma part.", ailleurs: "Fais un gros bisou à {frere} de ma part.", non: null } },
    "Brosse bien tes dents, le matin et le soir. Les nouvelles vont pousser grandes et fortes.",
    "À la prochaine dent !",
  ],
  signature: "Bisous à moustaches, {souris}",
  heureLettre: "3 h 02",
  ps: "P.-S. J'ai laissé un bout de fromage à {chat}. Ne lui dis pas que c'est moi.",
  boutonLettre: "J'ai trouvé {monCadeau} !",

  // ---------- L'épilogue : le retour au château, puis la boîte à trésors ----------
  epilogue: {
    intro: { txt: "Pendant que tu lis ma lettre, je rentre au château en montgolfière. Mais attention : des nuages arrivent sur ma route !", expr: "surprise" },
    suite: "Suite",
    consigne: { txt: "Aide-moi à les éviter : fais glisser ton doigt vers le haut ou vers le bas pour faire monter ou descendre la montgolfière. Tu peux aussi pencher ton téléphone !", expr: "clin" },
    depart: "C'est parti !",
    evite: ["Ouf, évité !", "Bravo, on passe !", "Attention, en voici un autre !", "Bien joué, ils vont de plus en plus vite !"],
    dernier: "Encore un, et c'est le château !",
    pouf: { txt: "Pouf ! Un nuage tout doux… Ce n'est rien, on continue !", expr: "clin" },
    arrivee: { txt: "Voilà le château fort de Sedan, ma maison ! Je me pose au pied des remparts. Pour rentrer, je passe toujours par mon terrier secret…", expr: "clin" },
    terrierBouton: "Entrer dans le terrier",
    terrier: { txt: "Guide-moi dans mon terrier jusqu'à la porte du château ! Pose ton doigt devant moi pour me montrer le chemin.", expr: "chuchote" },
    toucherPorte: { txt: "La porte de mon château ! Touche-la pour l'ouvrir.", expr: "joie" },
    surprises: {
      ardoise: { txt: "Un morceau d'ardoise violette ! Il vient de Fumay, une ville des Ardennes où l'on creusait la pierre des toits.", expr: "surprise" },
      fer: { txt: "Un fer à cheval géant… On raconte que c'est celui de Bayard, le cheval magique des quatre frères !", expr: "surprise" },
      pantin: { txt: "Un petit pantin ! Il est tombé de la fenêtre du Grand Marionnettiste. Je le lui rapporterai demain.", expr: "sourire" },
      plume: { txt: "La plume d'Arthur Rimbaud, le grand poète ! Le vent l'a emportée jusque dans mon terrier.", expr: "joie" },
    },
    porte: { txt: "Sa serrure a la forme d'une dent… Clic ! Elle s'ouvre.", expr: "joie" },
    bouton: "Ouvrir la boîte à trésors",
    boite: { variante: {
      premiere: { txt: "Voici ma boîte à trésors. Fais glisser ta dent jusqu'à sa place, celle qui brille !", expr: "sourire" },
      jumelle: { txt: "Voici ma boîte à trésors : tes autres dents t'attendent déjà. Fais glisser la nouvelle jusqu'à sa place, celle qui brille !", expr: "sourire" },
      suite: { txt: "Voici ma boîte à trésors : tes autres dents t'attendent déjà. Fais glisser la nouvelle jusqu'à sa place, celle qui brille !", expr: "sourire" },
    } },
    rangee: { variante: {
      premiere: { txt: "Elle est à sa place ! La toute première dent de ma boîte à trésors, à ton nom.", expr: "joie" },
      jumelle: { txt: "Elle a retrouvé sa jumelle ! Elles brillent côte à côte dans ma boîte à trésors.", expr: "joie" },
      suite: { txt: "Elle a rejoint ses sœurs ! Ta collection brille de plus en plus.", expr: "joie" },
    } },
    diplome: "Voir mon diplôme",
  },

  // ---------- Répondre à Quenotte : un dessin, gardé sur l'appareil et imprimé avec le diplôme ----------
  dessin: {
    bouton: "Faire mon dessin",
    invite: { txt: "Tu veux me répondre ? Fais-moi un dessin, je l'emporterai au château !", expr: "joie" },
    consigne: "Dessine avec ton doigt dans le cadre blanc, puis touche « Envoyer ».",
    ici: "Dessine ici avec ton doigt",
    feuille: "Ta feuille de dessin",
    titreSans: "Réponds à Quenotte",
    texteSans: "Fais-lui un dessin : touche le bouton, puis dessine avec ton doigt dans la feuille blanche.",
    titreAvec: "Ta réponse à Quenotte",
    texteAvec: "Voici ton dessin. Tu peux encore le modifier.",
    modifier: "Modifier mon dessin",
    faire: "Faire un dessin pour Quenotte",
    merci: "Quenotte a bien reçu ton dessin !",
  },
  // ---------- L'album des dents ----------
  album: { titre: "L'album des dents", explication: "Chaque histoire créée s'ajoute ici, au fil des dents : retrouve tes nuits avec Quenotte, et revis-les quand tu veux.", vide: "L'album se remplit à chaque nouvelle histoire : chaque dent y garde sa nuit." },

  // ---------- Chapitre 5 : le diplôme ----------
  diplome: { txt: "Bravo {enfant} ! Voici ton diplôme officiel, signé de ma patte. Tu peux l'imprimer avec un grand.", expr: "joie" },
  billetTrouve: { txt: "Tu l'as {trouvee} ? {Il} est {sec} maintenant. {Il} est à toi !", expr: "joie" },

  // ---------- Chapitre secret : la 13e scène, le théâtre du Grand Marionnettiste ----------
  theatre: {
    marionnettiste: "Le Grand Marionnettiste",
    affiche: "Ce soir : {enfant} et la dent d'or",
    pantin: "Le pantin",
    chat: "Le chat",
    dent: "La dent",
    rires: "Hi hi hi !",
    ouverture: "Toc, toc, toc ! Mesdames, messieurs… et toi, {enfant} ! Bienvenue à la treizième scène : celle que personne n'a jamais vue.",
    salut: "Voici ma troupe ! Touche chaque marionnette : elle te fera sa révérence.",
    salutReste: "Bravo ! Encore {n} marionnettes à saluer…",
    salutDernier: "Plus qu'une marionnette à saluer !",
    saluts: { souris: "Bonsoir, {enfant} !", doudou: { doudou: { oui: "Révérence de {poupee} !", non: "Révérence du pantin !" } }, chat: "Miaou ! Bonsoir !", dent: "Coucou, c'est moi la vedette !" },
    salutFini: "Quelle belle troupe ! Que le spectacle commence…",
    danse: { doudou: { oui: "Premier numéro : la danse de {poupee} ! Fais glisser ton doigt pour tirer son fil, ou touche la marionnette : à chaque fois, une figure nouvelle !", non: "Premier numéro : la danse du petit pantin ! Fais glisser ton doigt pour tirer son fil, ou touche-le : à chaque fois, une figure nouvelle !" } },
    figures: { saut: "Un grand saut !", pirouette: "Une pirouette !", salto: "Un salto arrière !", ecart: "Le grand écart !", balancier: "Le balancier !", envol: "Une envolée !", toupie: "La toupie !" },
    danseEncore: ["Tire encore !", "Magnifique, encore !", "Un dernier !"],
    danseBravo: "Bravo ! Tu as des doigts de marionnettiste.",
    chatTableau: "Deuxième numéro, le plus difficile : un gros chat dort au milieu de la scène. Fais passer {souris} en tirant son fil tout doucement…",
    chatReveil: "Oh ! Le chat a ouvert un œil… Doucement, doucement !",
    chatEncore: "Ouf, il s'est rendormi. On recommence, tout doucement…",
    chatOuf: "Bravo ! Le chat n'a rien entendu. Le public retenait son souffle… et applaudit !",
    bayard: "Troisième numéro ! Tout droit venus de la forêt des Ardennes : le cheval Bayard et les quatre chevaliers souris !",
    bayardArrive: "Les voilà qui arrivent au galop…",
    bayardFin: "Ils ont galopé toute la nuit pour saluer {enfant}. Touche Bayard : il te dira bonjour à sa façon !",
    final: { variante: { premiere: "Et voici la vedette de la soirée : la toute première dent de {enfant}, qui va monter au château !", jumelle: "Et voici la vedette de la soirée : la {ordinal} dent de {enfant}, qui va rejoindre sa jumelle au château !", suite: "Et voici la vedette de la soirée : la {ordinal} dent de {enfant}, qui va rejoindre la collection du château !" } },
    applaudir: "Applaudis la troupe ! Elle adore ça.",
    encouragements: ["Plus fort ! La troupe t'entend à peine…", "Encore ! Le public se réveille !", "Bravo ! Bis ! Bis !", "Écoute la salle ! Encore un peu…", "Quelle ovation ! On continue ?"],
    merci: "Merci, merci ! Quelle salle formidable ! Et l'histoire de Bayard en douze tableaux t'attend dans le carnet des Ardennes, après ton diplôme.",
    cris: ["Bravo !", "Bis !", "Hourra !", "Youpi !", "Encore !", "Magnifique !"],
    toc1: "Toc ! Le Grand Marionnettiste attend… trois coups ?",
    toc2: "Toc, toc ! Encore un coup !",
    boutons: { suite: "Suite", fil: "Tirer le fil", filQuenotte: "Le fil de Quenotte : fais-la avancer tout doucement", applaudir: "Applaudir", fermer: "Fermer le rideau", quitter: "Quitter le spectacle" },
  },

  // ---------- Badges du diplôme ----------
  badges: [
    // obtenu : ce que dit le diplôme quand le badge est gagné ; aGagner : comment l'obtenir
    { id: "detective", nom: "Détective de nuit", chapitre: 1, obtenu: "Tu as guidé {souris} de son château jusque chez toi.", aGagner: "Guide {souris} de son château jusque chez toi." },
    { id: "exploratrice", nom: "{Exploratrice}", etoiles: 6, obtenu: "Tu as trouvé au moins 6 étoiles cachées dans les images.", aGagner: "Trouve 6 étoiles cachées dans les images du voyage." },
    { id: "lynx", nom: "Œil de lynx", etoiles: 20, obtenu: "Tu as trouvé les 20 étoiles cachées. Rien ne t'échappe !", aGagner: "Trouve les 20 étoiles cachées dans les images du voyage." },
    { id: "passechat", nom: "Passe-Chat", chapitre: 2, obtenu: "Tu as aidé {souris} à passer devant {chat} sans le réveiller.", aGagner: "Aide {souris} à passer devant {chat} sans le réveiller." },
    { id: "hibou", nom: "Œil de hibou", chapitre: 3, obtenu: "Tu as regardé le film de la caméra de {souris} jusqu'au bout.", aGagner: "Regarde le film de la caméra de {souris} jusqu'au bout." },
    { id: "amie", nom: "{Amie} de {souris}", chapitre: 4, obtenu: "Tu as lu la lettre que {souris} t'a laissée.", aGagner: "Lis la lettre que {souris} t'a laissée." },
    { id: "jumelle", chapitre: 5,
      nom: { variante: { premiere: "Première dent", jumelle: "Dent jumelle", suite: "{Collectionneuse}" } },
      obtenu: { variante: { premiere: "Ta toute première dent est arrivée au château.", jumelle: "Ta {ordinal} dent a retrouvé sa jumelle au château.", suite: "Ta {ordinal} dent a rejoint ta collection au château." } },
      aGagner: { variante: { premiere: "Ta toute première dent doit arriver au château.", jumelle: "Ta {ordinal} dent doit retrouver sa jumelle au château.", suite: "Ta {ordinal} dent doit rejoindre ta collection au château." } } },
    { id: "billet", nom: "{CadeauTrouve}", bouton: true, obtenu: "Tu as trouvé {leCadeau} qui séchait {lieuBillet}.", aGagner: "Trouve {leCadeau} qui sèche {lieuBillet}, puis touche « J'ai trouvé {monCadeau} ! » à la fin de la lettre." },
    { id: "terrier", nom: "Fouille-terrier", chapitre: 5, obtenu: "Tu as trouvé les 4 trésors cachés dans le terrier de {souris}.", aGagner: "Trouve les 4 trésors cachés dans le terrier de {souris}." },
    { id: "pilote", nom: "Pilote des nuages", chapitre: 5, obtenu: "Tu as ramené la montgolfière au château sans toucher un seul nuage.", aGagner: "Ramène la montgolfière au château sans toucher un seul nuage." },
    { id: "artiste", nom: "Artiste de la nuit", obtenu: "Tu as fait un dessin pour {souris}.", aGagner: "Fais un dessin pour {souris}, sous sa lettre." },
    { id: "ardennais", nom: "{Ardennaise} d'honneur", ardennes: true, obtenu: "Tu as trouvé tous les secrets des Ardennes, ceux qui brillent avec une feuille de chêne. Bienvenue chez toi !", aGagner: "Trouve tous les secrets des Ardennes : pendant le voyage, ils brillent avec une petite feuille de chêne." },
    { id: "scene13", nom: "Scène 13", secret: true, nomCache: "Scène secrète", obtenu: "Tu as frappé les trois coups et vu la 13e scène du Grand Marionnettiste !", aGagner: "Au théâtre, on frappe trois coups avant le spectacle… Le Grand Marionnettiste attend toujours les siens." },
  ],
};

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
