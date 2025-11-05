/**
 * Données des commentaires sur les observations
 * Format: { observationIndex, userIndex, text, createdAt }
 * Les dates sont relatives (nombre de jours avant aujourd'hui)
 */
export const commentsData = [
  // Commentaires sur l'observation 0 (Triangle Lausanne)
  {
    observationIndex: 0,
    userIndex: 1, // Jean Dupont
    text: 'J\'ai vu exactement la même chose le même soir ! J\'étais à Pully et j\'ai observé le même phénomène. Incroyable !',
    daysAgo: 2
  },
  {
    observationIndex: 0,
    userIndex: 3, // Pierre Dubois
    text: 'Description très précise. As-tu contacté les autorités locales ? Il serait intéressant de savoir si d\'autres témoins se sont manifestés.',
    daysAgo: 1
  },
  {
    observationIndex: 0,
    userIndex: 5, // Thomas Bernard
    text: 'Les triangles sont souvent rapportés. Forme très classique dans les observations d\'OVNI. Merci pour le partage !',
    daysAgo: 0
  },

  // Commentaires sur l'observation 1 (Sphère Genève)
  {
    observationIndex: 1,
    userIndex: 0, // Sophie Martin
    text: 'Photos disponibles ? Ça m\'intéresse beaucoup de voir ce que tu as pu capturer.',
    daysAgo: 3
  },
  {
    observationIndex: 1,
    userIndex: 4, // Julie Moreau
    text: 'Une disparition instantanée, c\'est fascinant ! Aucune explication logique pour ce type de comportement.',
    daysAgo: 2
  },

  // Commentaires sur l'observation 2 (Formation V Berne)
  {
    observationIndex: 2,
    userIndex: 2, // Marie Leclerc (commentaire sur sa propre observation)
    text: 'Mise à jour : un ami astronome m\'a confirmé qu\'aucun satellite ou constellation de satellites ne correspondait à ce que j\'ai vu.',
    daysAgo: 1
  },
  {
    observationIndex: 2,
    userIndex: 6, // Emma Petit
    text: 'Les formations en V sont souvent mentionnées. Ça pourrait être des drones, mais la vitesse que tu décris semble trop élevée.',
    daysAgo: 0
  },

  // Commentaires sur l'observation 3 (Disque Lyon)
  {
    observationIndex: 3,
    userIndex: 7, // Lucas Roux
    text: 'Tu as pu poster la vidéo quelque part ? J\'aimerais vraiment la voir, surtout les mouvements impossibles que tu décris.',
    daysAgo: 4
  },
  {
    observationIndex: 3,
    userIndex: 1, // Jean Dupont
    text: 'En plein jour c\'est rare ! Les observations diurnes sont généralement plus crédibles car la visibilité est meilleure.',
    daysAgo: 3
  },
  {
    observationIndex: 3,
    userIndex: 8, // Chloé Simon
    text: 'Des virages à 90° à haute vitesse... aucun appareil humain ne peut faire ça. Impressionnant !',
    daysAgo: 2
  },

  // Commentaires sur l'observation 4 (Lumières Paris)
  {
    observationIndex: 4,
    userIndex: 9, // Alexandre Laurent
    text: 'Je suis dans le 14ème et j\'ai peut-être vu la même chose ! Vers quelle heure exactement ?',
    daysAgo: 3
  },
  {
    observationIndex: 4,
    userIndex: 0, // Sophie Martin
    text: '20 minutes c\'est long ! Tu as dû pouvoir bien l\'observer. Les couleurs changeaient de manière aléatoire ou selon un pattern ?',
    daysAgo: 2
  },

  // Commentaires sur l'observation 5 (Cylindre Zurich)
  {
    observationIndex: 5,
    userIndex: 2, // Marie Leclerc
    text: 'La traînée lumineuse bleu-vert me fait penser à un météore, mais tu dis que c\'était en ligne droite horizontale ?',
    daysAgo: 1
  },
  {
    observationIndex: 5,
    userIndex: 4, // Julie Moreau
    text: 'Si c\'était un météore, la trajectoire serait descendante et courbe. Une ligne droite horizontale exclut cette hypothèse.',
    daysAgo: 0
  },

  // Commentaires sur l'observation 6 (Triangle Marseille)
  {
    observationIndex: 6,
    userIndex: 3, // Pierre Dubois
    text: 'Formation triangulaire parfaite... c\'est troublant. La précision géométrique suggère une intelligence ou un système de guidage très avancé.',
    daysAgo: 5
  },
  {
    observationIndex: 6,
    userIndex: 5, // Thomas Bernard
    text: 'Marseille a pas mal d\'observations historiques. La zone méditerranéenne semble être un hotspot.',
    daysAgo: 4
  },
  {
    observationIndex: 6,
    userIndex: 7, // Lucas Roux
    text: 'Direction sud-est vers la mer... intéressant. Beaucoup d\'observations mentionnent des objets se dirigeant vers l\'eau.',
    daysAgo: 3
  },

  // Commentaires sur l'observation 7 (Cigare Lucerne)
  {
    observationIndex: 7,
    userIndex: 6, // Emma Petit
    text: 'La forme cigare est classique aussi. L\'accélération instantanée est ce qui est le plus impressionnant dans ces témoignages.',
    daysAgo: 2
  },
  {
    observationIndex: 7,
    userIndex: 8, // Chloé Simon
    text: 'Le lac des Quatre-Cantons est magnifique. Bizarre que ces choses apparaissent souvent près de l\'eau...',
    daysAgo: 1
  },

  // Commentaires sur l'observation 8 (Flash Bordeaux)
  {
    observationIndex: 8,
    userIndex: 0, // Sophie Martin
    text: 'Un déplacement de 100km en une seconde ?! Si c\'est vrai, on parle de 360 000 km/h... C\'est juste incroyable.',
    daysAgo: 4
  },
  {
    observationIndex: 8,
    userIndex: 1, // Jean Dupont
    text: 'Le fait que plusieurs personnes aient crié en même temps valide ton observation. Vous avez tous vu la même chose.',
    daysAgo: 3
  },
  {
    observationIndex: 8,
    userIndex: 9, // Alexandre Laurent
    text: 'Ce genre d\'accélération défie toutes les lois de la physique que nous connaissons. Fascinant et terrifiant à la fois.',
    daysAgo: 2
  },

  // Commentaires sur l'observation 9 (Orbe Montreux)
  {
    observationIndex: 9,
    userIndex: 2, // Marie Leclerc
    text: '15 minutes d\'observation, c\'est excellent ! Tu as pu noter d\'autres détails ? Taille apparente ?',
    daysAgo: 3
  },
  {
    observationIndex: 9,
    userIndex: 3, // Pierre Dubois
    text: 'Le changement de couleur cyclique suggère soit une rotation, soit une pulsation énergétique. Très intéressant !',
    daysAgo: 2
  },

  // Commentaires sur l'observation 10 (Losange Toulouse)
  {
    observationIndex: 10,
    userIndex: 4, // Julie Moreau
    text: 'Le halo bleuté est souvent mentionné dans les observations. Pourrait être lié à un champ électromagnétique ?',
    daysAgo: 1
  },
  {
    observationIndex: 10,
    userIndex: 6, // Emma Petit
    text: 'Mouvement en zigzag puis montée verticale... pattern très similaire à d\'autres observations documentées.',
    daysAgo: 0
  },

  // Commentaires sur l'observation 11 (Deux sphères Neuchâtel)
  {
    observationIndex: 11,
    userIndex: 5, // Thomas Bernard
    text: 'Deux objets qui interagissent ! Ça suggère une coordination ou une communication entre eux. Extraordinaire !',
    daysAgo: 2
  },
  {
    observationIndex: 11,
    userIndex: 7, // Lucas Roux
    text: 'Le ballet aérien que tu décris est cohérent avec d\'autres témoignages. Comme s\'ils étaient liés par une force invisible.',
    daysAgo: 1
  },

  // Commentaires sur l'observation 12 (Rayon Nice)
  {
    observationIndex: 12,
    userIndex: 8, // Chloé Simon
    text: 'Un rayon solide ?! C\'est rare dans les témoignages. As-tu pu voir ce qu\'il faisait sur l\'eau ?',
    daysAgo: 3
  },
  {
    observationIndex: 12,
    userIndex: 9, // Alexandre Laurent
    text: 'Les rayons lumineux sont souvent associés aux observations d\'OVNI. Certains parlent de prélèvements d\'échantillons...',
    daysAgo: 2
  },
  {
    observationIndex: 12,
    userIndex: 0, // Sophie Martin
    text: 'La Côte d\'Azur a beaucoup d\'observations. La mer Méditerranée semble être une zone d\'activité importante.',
    daysAgo: 1
  },

  // Commentaires sur l'observation 13 (Boomerang Fribourg)
  {
    observationIndex: 13,
    userIndex: 1, // Jean Dupont
    text: 'En plein jour et noir... donc ce n\'était pas une lumière mais un objet solide. Très intéressant pour l\'analyse.',
    daysAgo: 2
  },
  {
    observationIndex: 13,
    userIndex: 3, // Pierre Dubois
    text: 'La taille d\'un terrain de foot ! Si c\'est exact, on parle d\'un engin gigantesque. As-tu pu estimer l\'altitude ?',
    daysAgo: 1
  },

  // Commentaires sur l'observation 14 (Formation Strasbourg)
  {
    observationIndex: 14,
    userIndex: 2, // Marie Leclerc
    text: '12 objets en formation synchronisée ! C\'est du jamais vu. Tu as essayé de filmer ?',
    daysAgo: 4
  },
  {
    observationIndex: 14,
    userIndex: 4, // Julie Moreau
    text: 'Les changements de formation géométrique suggèrent une intelligence collective ou un système de contrôle centralisé.',
    daysAgo: 3
  },
  {
    observationIndex: 14,
    userIndex: 5, // Thomas Bernard
    text: 'Strasbourg près de la frontière... il y a eu d\'autres observations dans cette région récemment ?',
    daysAgo: 2
  },
  {
    observationIndex: 14,
    userIndex: 6, // Emma Petit
    text: 'La disparition simultanée de tous les objets est troublante. Comme s\'ils avaient reçu un signal pour partir tous ensemble.',
    daysAgo: 1
  },

  // Quelques commentaires supplémentaires pour créer du contexte
  {
    observationIndex: 0,
    userIndex: 7, // Lucas Roux
    text: 'J\'ai consulté les données de vol de cette nuit-là, aucun avion commercial ou militaire ne correspond à ce que tu décris.',
    daysAgo: 0
  },
  {
    observationIndex: 3,
    userIndex: 4, // Julie Moreau
    text: 'Les témoins multiples rendent ton observation très crédible. Vous devriez tous faire un rapport groupé.',
    daysAgo: 1
  },
  {
    observationIndex: 6,
    userIndex: 9, // Alexandre Laurent
    text: 'Le Vieux-Port a une excellente vue dégagée. Bonne position d\'observation !',
    daysAgo: 2
  },
  {
    observationIndex: 8,
    userIndex: 2, // Marie Leclerc
    text: 'Le flash intense avant l\'accélération... pourrait être lié à la propulsion ? Intéressant...',
    daysAgo: 1
  }
];

export default commentsData;
