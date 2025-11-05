/**
 * Données des observations OVNI
 * Observations réalistes avec coordonnées GPS réelles en Suisse et France
 * Format: [longitude, latitude] (attention à l'ordre pour MongoDB GeoJSON)
 */
export const observationsData = [
  // Suisse - Lausanne
  {
    title: 'Objet triangulaire lumineux au-dessus du lac Léman',
    description: 'Ce soir vers 22h30, j\'ai observé depuis Ouchy un objet de forme triangulaire avec trois lumières blanches aux angles. L\'objet se déplaçait silencieusement d\'ouest en est à basse altitude. La durée d\'observation était d\'environ 5 minutes avant qu\'il ne disparaisse derrière les montagnes. Aucun bruit de moteur n\'était perceptible, ce qui exclut un avion ou un hélicoptère.',
    location: {
      type: 'Point',
      coordinates: [6.6323, 46.5197] // Lausanne, Suisse
    },
    imageFilename: 'ovni-triangle-lausanne.jpg',
    userIndex: 0 // Sophie Martin
  },

  // Suisse - Genève
  {
    title: 'Sphère orange brillante stationnaire',
    description: 'Observation depuis mon balcon à Genève. Une sphère orange très lumineuse est restée parfaitement immobile pendant environ 10 minutes au-dessus du jet d\'eau. Puis elle a disparu instantanément, comme si on avait éteint une lumière. J\'ai pris plusieurs photos. Pas de bruit, pas de mouvement jusqu\'à la disparition. Température très douce ce soir, ciel dégagé.',
    location: {
      type: 'Point',
      coordinates: [6.1432, 46.2044] // Genève, Suisse
    },
    imageFilename: 'ovni-sphere-geneve.jpg',
    userIndex: 1 // Jean Dupont
  },

  // Suisse - Berne
  {
    title: 'Formation de 7 lumières en V',
    description: 'En rentrant chez moi à Berne, j\'ai levé les yeux et vu 7 points lumineux blancs formant un V parfait. Ils se déplaçaient tous ensemble à la même vitesse, gardant exactement la même formation. Direction nord-sud. Vitesse estimée beaucoup plus rapide qu\'un avion. Aucun clignotement, lumière constante. L\'observation a duré environ 2 minutes.',
    location: {
      type: 'Point',
      coordinates: [7.4474, 46.9480] // Berne, Suisse
    },
    imageFilename: 'ovni-formation-berne.jpg',
    userIndex: 2 // Marie Leclerc
  },

  // Suisse - Zurich
  {
    title: 'Disque métallique en plein jour',
    description: 'Observation exceptionnelle en plein après-midi ! Vers 15h, j\'ai aperçu un objet discoïdal argenté qui réfléchissait fortement la lumière du soleil. L\'objet effectuait des mouvements impossibles : montées verticales, arrêts brusques, virages à 90° à très haute vitesse. J\'ai filmé avec mon téléphone pendant 3 minutes. Plusieurs témoins autour de moi l\'ont également vu.',
    location: {
      type: 'Point',
      coordinates: [8.5417, 47.3769] // Zurich, Suisse
    },
    imageFilename: 'ovni-disque-zurich.jpg',
    userIndex: 3 // Pierre Dubois
  },

  // France - Lyon
  {
    title: 'Objet cylindrique avec traînée lumineuse',
    description: 'Observation depuis la place Bellecour vers 21h. Un objet de forme cylindrique laissant une traînée lumineuse bleu-vert s\'est déplacé d\'est en ouest en ligne parfaitement droite. Vitesse extrêmement élevée, beaucoup plus qu\'un avion. Aucun son. La traînée lumineuse est restée visible quelques secondes après le passage. Météo claire, excellente visibilité.',
    location: {
      type: 'Point',
      coordinates: [4.8357, 45.7640] // Lyon, France
    },
    imageFilename: 'ovni-cylindre-lyon.jpg',
    userIndex: 4 // Julie Moreau
  },

  // France - Paris
  {
    title: 'Objet en forme de cigare au-dessus de la Seine',
    description: 'Depuis mon appartement dans le 15ème arrondissement, j\'ai observé un objet allongé de couleur gris métallique. Forme de cigare, très net malgré la distance. L\'objet planait sans mouvement apparent pendant plusieurs minutes, puis a accéléré brusquement et a disparu en quelques secondes. Pas de bruit, pas de traînée.',
    location: {
      type: 'Point',
      coordinates: [2.3522, 48.8566] // Paris, France
    },
    imageFilename: 'ovni-cigare-paris.jpg',
    userIndex: 5 // Thomas Bernard
  },

  // France - Marseille
  {
    title: 'Lumière pulsante multicolore',
    description: 'Vue depuis le Vieux-Port. Un objet avec des lumières rouge, verte et blanche qui clignotaient de manière non régulière. L\'objet montait, descendait, se déplaçait latéralement. La lumière pulsait avec une intensité variable. Impossible qu\'il s\'agisse d\'un drone vu l\'altitude et la durée. Plusieurs témoins sur le port. Durée : environ 15 minutes.',
    location: {
      type: 'Point',
      coordinates: [5.3698, 43.2965] // Marseille, France
    },
    imageFilename: 'ovni-lumiere-marseille.jpg',
    userIndex: 6 // Emma Petit
  },

  // France - Nice
  {
    title: 'Objet noir en forme de boomerang',
    description: 'Observation spectaculaire depuis la Promenade des Anglais. En fin d\'après-midi, vers 18h, j\'ai observé un objet noir en forme de boomerang qui se déplaçait lentement et silencieusement. Très grande taille apparente, estimée à la largeur d\'un terrain de football si on l\'imagine à 500m d\'altitude. Aucune lumière, juste une forme noire.',
    location: {
      type: 'Point',
      coordinates: [7.2619, 43.7102] // Nice, France
    },
    imageFilename: 'ovni-boomerang-nice.jpg',
    userIndex: 7 // Lucas Roux
  },

  // France - Toulouse
  {
    title: 'Rayon lumineux vertical depuis un objet',
    description: 'Observation depuis le Capitole. Un objet circulaire émettait un rayon lumineux blanc très intense dirigé vers le sol. Le rayon était parfaitement vertical et semblait solide, comme un cylindre de lumière. L\'ensemble est resté immobile pendant au moins 5 minutes, puis tout s\'est éteint instantanément. Ciel parfaitement dégagé.',
    location: {
      type: 'Point',
      coordinates: [1.4442, 43.6047] // Toulouse, France
    },
    imageFilename: 'ovni-rayon-toulouse.jpg',
    userIndex: 8 // Chloé Simon
  },

  // France - Bordeaux
  {
    title: 'Sphère orange brillante stationnaire',
    description: 'Observation depuis les quais de Bordeaux. Une sphère orange très lumineuse est restée parfaitement immobile pendant environ 10 minutes au-dessus de la Garonne. Puis elle a disparu instantanément, comme si on avait éteint une lumière. Plusieurs personnes autour de moi ont crié de surprise. Pas de bruit, pas de mouvement jusqu\'à la disparition.',
    location: {
      type: 'Point',
      coordinates: [-0.5792, 44.8378] // Bordeaux, France
    },
    imageFilename: 'ovni-sphere2-bordeaux.jpg',
    userIndex: 9 // Alexandre Laurent
  },

  // France - Strasbourg
  {
    title: 'Formation triangulaire de lumières',
    description: 'Depuis la Petite France, j\'ai observé trois objets lumineux blancs disposés en triangle équilatéral parfait. Ils se déplaçaient ensemble, direction nord-est. Chaque objet semblait identique aux autres. Pas de clignotement, lumière constante et intense. Synchronisation parfaite. Altitude estimée : 1000-1500 mètres. Durée : environ 4 minutes.',
    location: {
      type: 'Point',
      coordinates: [7.7521, 48.5734] // Strasbourg, France
    },
    imageFilename: 'ovni-triangle2-strasbourg.jpg',
    userIndex: 0 // Sophie Martin (deuxième observation)
  },

  // Suisse - Lucerne
  {
    title: 'Disque argenté en rotation',
    description: 'Pendant une balade au bord du lac des Quatre-Cantons, j\'ai vu un objet discoïdal de couleur gris métallique qui semblait tourner sur lui-même. L\'objet planait sans mouvement apparent pendant plusieurs minutes, puis a accéléré brusquement et a disparu en quelques secondes. Pas de bruit, pas de traînée. Plusieurs témoins.',
    location: {
      type: 'Point',
      coordinates: [8.3093, 47.0502] // Lucerne, Suisse
    },
    imageFilename: 'ovni-disque2-lucerne.jpg',
    userIndex: 1 // Jean Dupont (deuxième observation)
  },

  // Suisse - Montreux
  {
    title: 'Formation en V de lumières blanches',
    description: 'Depuis la promenade de Montreux, observation d\'une formation de 7 lumières blanches disposées en V parfait. Ils se déplaçaient tous ensemble à la même vitesse, gardant exactement la même formation. Direction nord-sud. Vitesse estimée beaucoup plus rapide qu\'un avion. Aucun clignotement, lumière constante. L\'observation a duré environ 2 minutes.',
    location: {
      type: 'Point',
      coordinates: [6.9111, 46.4312] // Montreux, Suisse
    },
    imageFilename: 'ovni-formation2-montreux.jpg',
    userIndex: 2 // Marie Leclerc (deuxième observation)
  },

  // Suisse - Neuchâtel
  {
    title: 'Lumière zigzagante rapide',
    description: 'Phénomène fascinant observé depuis le château de Neuchâtel. Une lumière blanche très vive effectuait des zigzags impossibles à très haute vitesse. Montées, descentes, virages à 90° instantanés. Aucun objet connu ne peut se déplacer ainsi. Après environ 8 minutes de ce ballet aérien, la lumière s\'est éloignée à grande vitesse vers le nord.',
    location: {
      type: 'Point',
      coordinates: [6.9306, 46.9920] // Neuchâtel, Suisse
    },
    imageFilename: 'ovni-lumiere2-neuchatel.jpg',
    userIndex: 3 // Pierre Dubois (deuxième observation)
  },

  // Suisse - Fribourg
  {
    title: 'Cylindre avec hublots lumineux',
    description: 'En fin d\'après-midi, vers 18h, j\'ai observé un objet cylindrique avec plusieurs hublots lumineux le long de sa structure. L\'objet se déplaçait lentement et silencieusement. Très grande taille apparente. Les hublots émettaient une lumière blanche constante. Observation de 3 minutes avant qu\'il ne disparaisse derrière les montagnes.',
    location: {
      type: 'Point',
      coordinates: [7.1512, 46.8060] // Fribourg, Suisse
    },
    imageFilename: 'ovni-cylindre2-fribourg.jpg',
    userIndex: 4 // Julie Moreau (deuxième observation)
  }
];

export default observationsData;
