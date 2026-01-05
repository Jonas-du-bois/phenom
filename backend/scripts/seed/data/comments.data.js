/**
 * Comments data for observations (seed data)
 *
 * Format: { observationIndex, userIndex, text, daysAgo }
 * - observationIndex: Index of the observation this comment belongs to (0-14)
 * - userIndex: Index of the user who posted the comment
 * - text: The comment content
 * - daysAgo: Relative date (number of days before today)
 *
 * Available observations (0-14):
 * 0 - Triangle Lausanne
 * 1 - Sphère Genève
 * 2 - Formation Berne
 * 3 - Disque Zurich
 * 4 - Submersible Lac Léman
 * 5 - Rayon Lyon
 * 6 - Cigare Paris (son)
 * 7 - Signaux Marseille
 * 8 - Atterrissage Alpes
 * 9 - Effet véhicule Toulouse
 * 10 - Animaux Bordeaux
 * 11 - Missing time Strasbourg
 * 12 - Traces Lucerne
 * 13 - Radiation Montreux
 * 14 - Entité Neuchâtel
 */
export const commentsData = [
  // Obs 0 - Triangle Lausanne
  {
    observationIndex: 0,
    userIndex: 1,
    text: "J'ai vu exactement la même chose le même soir ! J'étais à Pully vers 22h45. Le triangle était immense et totalement silencieux. Incroyable !",
    daysAgo: 2,
  },
  {
    observationIndex: 0,
    userIndex: 3,
    text: "Description très précise, les trois lumières blanches aux angles correspondent à ce que d'autres témoins rapportent souvent. As-tu contacté les autorités locales ou le GEIPAN suisse ?",
    daysAgo: 1,
  },
  {
    observationIndex: 0,
    userIndex: 5,
    text: "Les triangles sont une forme classique dans les observations depuis les années 80. Le silence total suggère une technologie de propulsion non conventionnelle. Merci pour ce témoignage détaillé !",
    daysAgo: 1,
  },
  {
    observationIndex: 0,
    userIndex: 7,
    text: "J'ai consulté les données de vol de Skyguide pour cette soirée : aucun avion ne correspond à ta description. Pas de drone non plus dans cette zone à cette heure.",
    daysAgo: 0,
  },

  // Obs 1 - Sphère Genève
  {
    observationIndex: 1,
    userIndex: 0,
    text: "Les photos haute résolution sont disponibles quelque part ? J'aimerais vraiment analyser les détails de cette sphère orange !",
    daysAgo: 3,
  },
  {
    observationIndex: 1,
    userIndex: 4,
    text: "Une disparition instantanée sans bruit ni accélération visible... c'est fascinant ! Aucune explication logique avec notre technologie actuelle.",
    daysAgo: 2,
  },
  {
    observationIndex: 1,
    userIndex: 7,
    text: "Belle prise au-dessus du jet d'eau ! La qualité de tes photos pourrait vraiment aider les analyses. Tu devrais contacter une association ufologique suisse.",
    daysAgo: 1,
  },
  {
    observationIndex: 1,
    userIndex: 2,
    text: "La lumière pulsante orange-rouge est souvent associée à un système de propulsion actif selon certaines théories. 10 minutes d'observation c'est long, tu as dû voir plein de détails !",
    daysAgo: 0,
  },

  // Obs 2 - Formation Berne
  {
    observationIndex: 2,
    userIndex: 2,
    text: "Mise à jour après vérification : aucun satellite Starlink ne correspond à ce que j'ai vu. La formation en V parfait et le déplacement coordonné excluent les satellites.",
    daysAgo: 1,
  },
  {
    observationIndex: 2,
    userIndex: 6,
    text: "La poursuite en voiture pendant 15 minutes était risquée mais fascinante ! Tu as pu estimer leur vitesse ? Bravo pour ton courage de les suivre.",
    daysAgo: 0,
  },
  {
    observationIndex: 2,
    userIndex: 8,
    text: "Sept points lumineux en formation V... ça ressemble aux observations de Phoenix en 1997. Peut-être un phénomène similaire en Suisse ?",
    daysAgo: 0,
  },

  // Obs 3 - Disque Zurich
  {
    observationIndex: 3,
    userIndex: 7,
    text: "Les détails structurels que tu décris (dôme, panneaux, surface inférieure) sont précieux pour la recherche ! Observation de qualité professionnelle.",
    daysAgo: 4,
  },
  {
    observationIndex: 3,
    userIndex: 1,
    text: "En plein après-midi à 14h20 c'est rare ! La visibilité devait être excellente. Avec des jumelles tu as pu voir des détails que beaucoup manquent.",
    daysAgo: 3,
  },
  {
    observationIndex: 3,
    userIndex: 8,
    text: "Des virages à 90° à haute vitesse, des arrêts brusques après accélération... aucun appareil humain ne peut faire ça sans écraser ses occupants ! Physique impossible pour nous.",
    daysAgo: 2,
  },
  {
    observationIndex: 3,
    userIndex: 4,
    text: "Les témoins multiples en plein jour rendent ton observation très crédible. 15-20 mètres de diamètre, c'est énorme ! Comment personne d'autre n'a signalé ça ?",
    daysAgo: 1,
  },

  // Obs 4 - Submersible Lac Léman
  {
    observationIndex: 4,
    userIndex: 9,
    text: "Sortir de l'eau comme ça, puis s'élever verticalement à vitesse folle... c'est du jamais vu ! Les USO (Unidentified Submersible Objects) sont extraordinaires !",
    daysAgo: 3,
  },
  {
    observationIndex: 4,
    userIndex: 2,
    text: "Les observations USO sont beaucoup plus rares que les OVNI aériens. Le Lac Léman est profond, qui sait ce qui pourrait s'y cacher ? Merci pour ce témoignage unique !",
    daysAgo: 2,
  },
  {
    observationIndex: 4,
    userIndex: 5,
    text: "La lumière bleu-vert sous l'eau avant l'émersion... certains chercheurs parlent de propulsion magnétohydrodynamique. Ça expliquerait le fonctionnement sous-marin et aérien.",
    daysAgo: 1,
  },

  // Obs 5 - Rayon Lyon
  {
    observationIndex: 5,
    userIndex: 0,
    text: 'Le rayon "solide" comme un cylindre de lumière est un phénomène souvent rapporté dans les observations de catégorie 2. Tu as eu chaud, littéralement !',
    daysAgo: 4,
  },
  {
    observationIndex: 5,
    userIndex: 3,
    text: "La chaleur intense que tu as ressentie quand le rayon est passé près de toi suggère une énergie dirigée concentrée. Impressionnant et un peu effrayant.",
    daysAgo: 3,
  },
  {
    observationIndex: 5,
    userIndex: 6,
    text: "Place Bellecour, il devait y avoir d'autres témoins non ? 200m d'altitude en pleine ville, quelqu'un d'autre a dû voir ça !",
    daysAgo: 2,
  },

  // Obs 6 - Cigare Paris (son)
  {
    observationIndex: 6,
    userIndex: 4,
    text: "L'enregistrement audio du bourdonnement serait vraiment précieux ! Tu peux le partager ? Les analyses spectrales pourraient révéler des fréquences inhabituelles.",
    daysAgo: 2,
  },
  {
    observationIndex: 6,
    userIndex: 6,
    text: "Un bourdonnement grave et modulé, presque musical... certains parlent de résonance harmonique liée aux systèmes de propulsion. L'arrêt instantané du son quand l'objet part, c'est significatif.",
    daysAgo: 1,
  },
  {
    observationIndex: 6,
    userIndex: 9,
    text: "Forme cigare gris métallique + son enregistré = observation de grande valeur scientifique. Tu devrais contacter des chercheurs spécialisés.",
    daysAgo: 0,
  },

  // Obs 7 - Signaux Marseille
  {
    observationIndex: 7,
    userIndex: 8,
    text: "La communication par signaux lumineux est LA preuve d'intelligence ! Ils ont répondu à tes patterns, c'est une interaction directe ! Extraordinaire expérience !",
    daysAgo: 5,
  },
  {
    observationIndex: 7,
    userIndex: 9,
    text: "J'aurais fait pareil à ta place ! La curiosité est plus forte que la peur. Le fait qu'ils répondaient à chaque pattern différent montre une compréhension.",
    daysAgo: 4,
  },
  {
    observationIndex: 7,
    userIndex: 1,
    text: "Depuis le Vieux-Port avec plusieurs témoins qui ont validé ton récit, c'est très crédible. 15 minutes d'échange de signaux, incroyable !",
    daysAgo: 3,
  },
  {
    observationIndex: 7,
    userIndex: 2,
    text: "Le Vieux-Port a une vue dégagée sur la mer, bonne position d'observation ! Les lumières rouge, verte et blanche, comme des feux de navigation mais avec un comportement intelligent.",
    daysAgo: 2,
  },

  // Obs 8 - Atterrissage Alpes
  {
    observationIndex: 8,
    userIndex: 2,
    text: "Les trois marques circulaires au sol et l'herbe brûlée en cercle de 6m sont des preuves physiques ! As-tu pris des photos des traces ? C'est crucial !",
    daysAgo: 2,
  },
  {
    observationIndex: 8,
    userIndex: 7,
    text: "L'herbe brûlée en cercle parfait suggère une chaleur ou radiation intense et localisée. Les pieds télescopiques, comme dans les rapports classiques. Observation exceptionnelle !",
    daysAgo: 1,
  },
  {
    observationIndex: 8,
    userIndex: 3,
    text: "Credibilité 10/10 ! Tu as vu l'objet au sol, les détails (8m diamètre, 3m hauteur, couleur gris-bleu), ET tu as des traces physiques. C'est rare !",
    daysAgo: 1,
  },
  {
    observationIndex: 8,
    userIndex: 5,
    text: "Le sifflement aigu juste avant le décollage... système de propulsion qui s'active ? Témoignage de grande valeur pour la recherche.",
    daysAgo: 0,
  },

  // Obs 9 - Effet véhicule Toulouse
  {
    observationIndex: 9,
    userIndex: 3,
    text: "L'effet électromagnétique sur les véhicules (moteur, lumières, radio, téléphone) est très bien documenté dans la littérature ufologique. Flippant de vivre ça !",
    daysAgo: 4,
  },
  {
    observationIndex: 9,
    userIndex: 5,
    text: "Ton mécanicien n'a rien trouvé car il n'y avait rien de cassé... c'était un champ électromagnétique intense qui a temporairement neutralisé l'électronique !",
    daysAgo: 3,
  },
  {
    observationIndex: 9,
    userIndex: 0,
    text: "Être immobilisé seul sur une route de campagne avec un triangle au-dessus de toi... je n'ose pas imaginer la peur. 5 minutes ont dû paraître une éternité.",
    daysAgo: 2,
  },
  {
    observationIndex: 9,
    userIndex: 2,
    text: 'La lumière orange pulsante puis le flash avant l\'accélération folle... probablement lié au système de propulsion qui passe en mode "départ".',
    daysAgo: 1,
  },

  // Obs 10 - Animaux Bordeaux
  {
    observationIndex: 10,
    userIndex: 1,
    text: "Les animaux de ferme sentent des choses que nous ne percevons pas. Leur réaction est un indicateur fiable qu'il s'est passé quelque chose de réel. Troublant.",
    daysAgo: 3,
  },
  {
    observationIndex: 10,
    userIndex: 4,
    text: "Une semaine sans lait après l'observation ! L'impact sur les animaux est réel et mesurable. C'est une preuve indirecte importante.",
    daysAgo: 2,
  },
  {
    observationIndex: 10,
    userIndex: 6,
    text: "Les effets sur le bétail sont classiques dans les rapports d'observation proches. Le stress ou les radiations peuvent affecter la lactation.",
    daysAgo: 1,
  },

  // Obs 11 - Missing time Strasbourg
  {
    observationIndex: 11,
    userIndex: 6,
    text: "Le missing time (temps manquant) est l'aspect le plus terrifiant des rencontres rapprochées. Tu as consulté un hypnothérapeute spécialisé ?",
    daysAgo: 5,
  },
  {
    observationIndex: 11,
    userIndex: 8,
    text: "La marque circulaire que tu as découverte ensuite... ils t'ont peut-être marqué ou implanté quelque chose ? C'est vraiment inquiétant.",
    daysAgo: 4,
  },
  {
    observationIndex: 11,
    userIndex: 2,
    text: "2 heures perdues sans aucun souvenir... qu'est-ce qui s'est passé pendant ce temps ? L'hypnose régressive pourrait révéler des souvenirs enfouis.",
    daysAgo: 3,
  },
  {
    observationIndex: 11,
    userIndex: 0,
    text: "Tu n'es pas seul(e), beaucoup de témoins rapportent des expériences similaires. Courage, et documente tout ce dont tu te souviens.",
    daysAgo: 2,
  },

  // Obs 12 - Traces Lucerne
  {
    observationIndex: 12,
    userIndex: 9,
    text: "Sol vitrifié = température extrême ! Il faut au moins 1500°C pour vitrifier de la terre. Quelle technologie peut faire ça sans incendier la forêt autour ?",
    daysAgo: 2,
  },
  {
    observationIndex: 12,
    userIndex: 3,
    text: "Les trois dépressions en triangle parfait... c'est un motif récurrent dans les cas d'atterrissage à travers le monde. Traces de train d'atterrissage tripode.",
    daysAgo: 1,
  },
  {
    observationIndex: 12,
    userIndex: 7,
    text: "Tu as fait analyser des échantillons du sol vitrifié ? La composition chimique pourrait révéler le type d'énergie utilisé.",
    daysAgo: 0,
  },

  // Obs 13 - Radiation Montreux
  {
    observationIndex: 13,
    userIndex: 5,
    text: "Rayons gamma × 50 au-dessus du niveau normal ! C'est une dose potentiellement dangereuse. Tu vas bien depuis ? Fais un suivi médical.",
    daysAgo: 4,
  },
  {
    observationIndex: 13,
    userIndex: 7,
    text: "Données scientifiques extrêmement précieuses ! Tu as mesuré avec quel appareil ? Partage tes enregistrements avec des labos de physique.",
    daysAgo: 3,
  },
  {
    observationIndex: 13,
    userIndex: 1,
    text: "En tant que physicien amateur avec de l'équipement de mesure, ton témoignage a beaucoup plus de poids que la moyenne. Documentation exemplaire !",
    daysAgo: 2,
  },
  {
    observationIndex: 13,
    userIndex: 4,
    text: "C'est rare d'avoir des mesures de radiation pendant une observation. Ça confirme que ces objets émettent des énergies mesurables.",
    daysAgo: 1,
  },

  // Obs 14 - Entité Neuchâtel
  {
    observationIndex: 14,
    userIndex: 0,
    text: "Une entité qui change de forme sous tes yeux... c'est au-delà de notre compréhension actuelle. Rencontre du 3ème type voire plus.",
    daysAgo: 3,
  },
  {
    observationIndex: 14,
    userIndex: 4,
    text: "La communication télépathique est souvent mentionnée dans les rencontres avec des entités. Tu n'es pas seul(e) à avoir vécu ça.",
    daysAgo: 2,
  },
  {
    observationIndex: 14,
    userIndex: 8,
    text: "As-tu pu comprendre ce qu'ils essayaient de communiquer ? Certains contactés rapportent des messages récurrents.",
    daysAgo: 1,
  },
  {
    observationIndex: 14,
    userIndex: 6,
    text: "Ton expérience est exceptionnelle mais je te crois. Continue à documenter tout ce dont tu te souviens, même les détails qui semblent insignifiants.",
    daysAgo: 0,
  },
];

export default commentsData;
