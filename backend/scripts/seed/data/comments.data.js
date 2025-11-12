/**
 * Données des commentaires sur les observations
 * Format: { observationIndex, userIndex, text, daysAgo }
 * Les dates sont relatives (nombre de jours avant aujourd'hui)
 */
export const commentsData = [
  // Obs 0 - WAV Triangle Lausanne
  { observationIndex: 0, userIndex: 1, text: 'J\'ai vu exactement la même chose le même soir ! J\'étais à Pully. Incroyable !', daysAgo: 2 },
  { observationIndex: 0, userIndex: 3, text: 'Description très précise. As-tu contacté les autorités locales ?', daysAgo: 1 },
  { observationIndex: 0, userIndex: 5, text: 'Les triangles sont une forme classique. Merci pour le partage !', daysAgo: 0 },
  { observationIndex: 0, userIndex: 7, text: 'J\'ai consulté les données de vol : aucun avion ne correspond.', daysAgo: 0 },

  // Obs 1 - PHT Sphère Genève
  { observationIndex: 1, userIndex: 0, text: 'Les photos sont disponibles ? J\'aimerais vraiment voir ça !', daysAgo: 3 },
  { observationIndex: 1, userIndex: 4, text: 'Une disparition instantanée, fascinant ! Aucune explication logique.', daysAgo: 2 },
  { observationIndex: 1, userIndex: 7, text: 'Belle prise ! La qualité des photos pourrait aider les analyses.', daysAgo: 1 },

  // Obs 2 - OBS Formation Berne
  { observationIndex: 2, userIndex: 2, text: 'Mise à jour : aucun satellite ne correspond à ce que j\'ai vu.', daysAgo: 1 },
  { observationIndex: 2, userIndex: 6, text: 'La poursuite était risquée mais fascinante ! Bravo pour ton courage.', daysAgo: 0 },

  // Obs 3 - TCH Disque Zurich
  { observationIndex: 3, userIndex: 7, text: 'Les détails structurels que tu décris sont précieux pour la recherche !', daysAgo: 4 },
  { observationIndex: 3, userIndex: 1, text: 'En plein jour c\'est rare. La visibilité devait être excellente.', daysAgo: 3 },
  { observationIndex: 3, userIndex: 8, text: 'Des virages à 90° à haute vitesse... aucun appareil humain ne peut faire ça !', daysAgo: 2 },
  { observationIndex: 3, userIndex: 4, text: 'Les témoins multiples rendent ton observation très crédible.', daysAgo: 1 },

  // Obs 4 - SUB Lac Léman
  { observationIndex: 4, userIndex: 9, text: 'Sortir de l\'eau comme ça... c\'est du jamais vu ! Extraordinaire !', daysAgo: 3 },
  { observationIndex: 4, userIndex: 2, text: 'Les observations USO (Underwater Submersible Objects) sont rares. Merci !', daysAgo: 2 },
  { observationIndex: 4, userIndex: 5, text: 'La lumière bleu-vert sous l\'eau... propulsion magnétohydrodynamique ?', daysAgo: 1 },

  // Obs 5 - RAY Lyon
  { observationIndex: 5, userIndex: 0, text: 'Le rayon solide est un phénomène souvent rapporté. Tu as eu chaud !', daysAgo: 4 },
  { observationIndex: 5, userIndex: 3, text: 'La chaleur que tu as ressentie suggère une énergie dirigée. Impressionnant.', daysAgo: 3 },

  // Obs 6 - SND Paris
  { observationIndex: 6, userIndex: 4, text: 'L\'enregistrement audio serait précieux ! Tu peux le partager ?', daysAgo: 2 },
  { observationIndex: 6, userIndex: 6, text: 'Un bourdonnement modulé... certains parlent de résonance harmonique.', daysAgo: 1 },

  // Obs 7 - SIG Marseille
  { observationIndex: 7, userIndex: 8, text: 'La communication est LA preuve d\'intelligence ! Extraordinaire expérience !', daysAgo: 5 },
  { observationIndex: 7, userIndex: 9, text: 'J\'aurais fait pareil ! La curiosité est plus forte que la peur.', daysAgo: 4 },
  { observationIndex: 7, userIndex: 1, text: 'Plusieurs témoins valident ton récit. C\'est très crédible.', daysAgo: 3 },
  { observationIndex: 7, userIndex: 2, text: 'Le Vieux-Port a une vue dégagée. Bonne position d\'observation !', daysAgo: 2 },

  // Obs 8 - LND Alpes
  { observationIndex: 8, userIndex: 2, text: 'Les traces au sol sont des preuves physiques ! As-tu pris des photos ?', daysAgo: 2 },
  { observationIndex: 8, userIndex: 7, text: 'L\'herbe brûlée en cercle... chaleur ou radiation. Intéressant.', daysAgo: 1 },

  // Obs 9 - VEH Toulouse
  { observationIndex: 9, userIndex: 3, text: 'L\'effet EM sur les véhicules est bien documenté. Flippant !', daysAgo: 4 },
  { observationIndex: 9, userIndex: 5, text: 'Ton mécanicien n\'a rien trouvé... car c\'était un champ électromagnétique !', daysAgo: 3 },
  { observationIndex: 9, userIndex: 0, text: 'Être immobilisé comme ça... je n\'ose pas imaginer la peur.', daysAgo: 2 },
  { observationIndex: 9, userIndex: 2, text: 'Le flash avant l\'accélération... lié à la propulsion ?', daysAgo: 1 },

  // Obs 10 - ANI Bordeaux
  { observationIndex: 10, userIndex: 1, text: 'Les animaux sentent des choses que nous ne percevons pas. Troublant.', daysAgo: 3 },
  { observationIndex: 10, userIndex: 4, text: 'Une semaine sans lait ! L\'impact sur les animaux est réel.', daysAgo: 2 },

  // Obs 11 - HUM Strasbourg
  { observationIndex: 11, userIndex: 6, text: 'Le missing time est terrifiant. Tu as consulté un hypnothérapeute ?', daysAgo: 5 },
  { observationIndex: 11, userIndex: 8, text: 'La marque circulaire... ils t\'ont marqué ? C\'est inquiétant.', daysAgo: 4 },
  { observationIndex: 11, userIndex: 2, text: '2 heures perdues... qu\'est-ce qui s\'est passé pendant ce temps ?', daysAgo: 3 },

  // Obs 12 - TRC Lucerne
  { observationIndex: 12, userIndex: 9, text: 'Sol vitrifié = température extrême ! Au moins 1500°C.', daysAgo: 2 },
  { observationIndex: 12, userIndex: 3, text: 'Les trois dépressions en triangle... motif récurrent dans les atterrissages.', daysAgo: 1 },

  // Obs 13 - RDA Montreux
  { observationIndex: 13, userIndex: 5, text: 'Rayons gamma × 50 ! C\'est une dose dangereuse. Tu vas bien ?', daysAgo: 4 },
  { observationIndex: 13, userIndex: 7, text: 'Données scientifiques précieuses ! Partage ton enregistrement avec des labos.', daysAgo: 3 },
  { observationIndex: 13, userIndex: 1, text: 'En tant que physicien, ton témoignage a beaucoup de poids.', daysAgo: 2 },

  // Obs 14 - ODD Neuchâtel
  { observationIndex: 14, userIndex: 0, text: 'Une entité qui change de forme... c\'est au-delà de notre compréhension.', daysAgo: 3 },
  { observationIndex: 14, userIndex: 4, text: 'La télépathie est souvent mentionnée. Tu n\'es pas seul(e).', daysAgo: 2 },

  // Obs 15 - HST Fribourg 1985
  { observationIndex: 15, userIndex: 1, text: '40 ans après et tu t\'en souviens parfaitement. Impact profond.', daysAgo: 5 },
  { observationIndex: 15, userIndex: 6, text: '5 familles témoins ! Il devrait y avoir des archives quelque part.', daysAgo: 4 },

  // Obs 16 - CMF Nice
  { observationIndex: 16, userIndex: 8, text: 'Le camouflage en nuage... technologie de furtivité avancée !', daysAgo: 2 },
  { observationIndex: 16, userIndex: 9, text: 'Heureusement que tu l\'as vu AVANT la transformation. Preuve du camouflage.', daysAgo: 1 },

  // Obs 17 - MID Starlink
  { observationIndex: 17, userIndex: 2, text: 'Merci de partager ! Starlink trompe beaucoup de gens en ce moment.', daysAgo: 3 },
  { observationIndex: 17, userIndex: 3, text: 'C\'est important de différencier. Bravo pour ton honnêteté.', daysAgo: 2 },

  // Obs 18 - CNT Grenoble
  { observationIndex: 18, userIndex: 5, text: 'Les contactés reçoivent souvent des messages sur l\'évolution. Fascinant.', daysAgo: 4 },
  { observationIndex: 18, userIndex: 7, text: 'Tu as un suivi médical, c\'est bien. Continue à documenter tes expériences.', daysAgo: 3 },

  // Obs 19 - OID Nantes
  { observationIndex: 19, userIndex: 0, text: 'Voir des entités... c\'est rare et terrifiant. Courage d\'en parler.', daysAgo: 5 },
  { observationIndex: 19, userIndex: 1, text: 'La description classique des "petits gris". Ils inspectaient le sol...', daysAgo: 4 },
  { observationIndex: 19, userIndex: 4, text: '6 mois de silence... je comprends. C\'est bouleversant.', daysAgo: 3 },

  // Obs 20 - COV Dijon
  { observationIndex: 20, userIndex: 6, text: '50 témoins et aucune publication ! La censure est réelle.', daysAgo: 4 },
  { observationIndex: 20, userIndex: 8, text: 'Les militaires qui boucle la zone... cover-up classique.', daysAgo: 3 },
  { observationIndex: 20, userIndex: 9, text: 'Cover-up évident. Nous devons continuer à témoigner !', daysAgo: 2 },

  // Obs 21 - OGA Annecy
  { observationIndex: 21, userIndex: 9, text: 'Le GEIPAN est sérieux. Tu auras peut-être une réponse officielle !', daysAgo: 2 },
  { observationIndex: 21, userIndex: 2, text: '3 autres témoignages la même nuit... vague locale.', daysAgo: 1 },

  // Obs 22 - DRT Vosges
  { observationIndex: 22, userIndex: 3, text: 'Des empreintes à 3 orteils ! Pas d\'animal terrestre connu.', daysAgo: 3 },
  { observationIndex: 22, userIndex: 5, text: 'Les moulages sont importants. Garde-les précieusement !', daysAgo: 2 },

  // Obs 23 - VEG Colmar
  { observationIndex: 23, userIndex: 7, text: 'Crop circle authentique ! Les tiges pliées aux nœuds, impossible à faker.', daysAgo: 4 },
  { observationIndex: 23, userIndex: 0, text: 'Germination 3× plus rapide... radiation bénéfique ?', daysAgo: 3 },
  { observationIndex: 23, userIndex: 1, text: 'Les crop circles authentiques sont rares. Bien documenté !', daysAgo: 2 },

  // Obs 24 - BLD Montpellier
  { observationIndex: 24, userIndex: 1, text: '500 maisons dans le noir ! Ça a dû faire les journaux non ?', daysAgo: 2 },
  { observationIndex: 24, userIndex: 4, text: 'EDF ne trouve rien = c\'était bien un effet EM de l\'OVNI.', daysAgo: 1 },

  // Obs 25 - INJ Vaud
  { observationIndex: 25, userIndex: 6, text: 'Brûlures au 1er degré... tu t\'es approché trop près ! Fais attention.', daysAgo: 3 },
  { observationIndex: 25, userIndex: 8, text: 'Les UV intenses ou radiations... protection nécessaire si ça se reproduit.', daysAgo: 2 },

  // Obs 26 - NOC Jura
  { observationIndex: 26, userIndex: 9, text: 'Phénomène régulier = excellente opportunité d\'étude scientifique !', daysAgo: 4 },
  { observationIndex: 26, userIndex: 2, text: 'Toute la communauté en veille... esprit scientifique collectif. Super !', daysAgo: 3 },

  // Obs 27 - WAV Besançon
  { observationIndex: 27, userIndex: 3, text: '100m d\'envergure à 150m d\'altitude... gigantesque et impossible à louper !', daysAgo: 2 },
  { observationIndex: 27, userIndex: 5, text: 'Des dizaines de témoins = crédibilité maximale. Merci !', daysAgo: 1 },

  // Obs 28 - PHT Genève couleurs
  { observationIndex: 28, userIndex: 7, text: 'Cycle de 10 secondes exact... c\'est mécanique ou intentionnel.', daysAgo: 3 },
  { observationIndex: 28, userIndex: 0, text: 'Les photos avec séquence complète sont un trésor ! Partage-les !', daysAgo: 2 },

  // Obs 29 - SIG Bâle
  { observationIndex: 29, userIndex: 1, text: 'Communication inter-OVNI ! Coordination entre plusieurs vaisseaux.', daysAgo: 4 },
  { observationIndex: 29, userIndex: 4, text: 'Le pattern complexe suggère un langage. Fascinant !', daysAgo: 3 },

  // Obs 30 - ODD Nuage Lausanne
  { observationIndex: 30, userIndex: 6, text: 'Entrer et sortir d\'un nuage... ils le créent ou l\'utilisent ?', daysAgo: 2 },
  { observationIndex: 30, userIndex: 8, text: 'Le nuage trop géométrique... artificiel probablement.', daysAgo: 1 },

  // Obs 31 - TCH Télescope Clermont
  { observationIndex: 31, userIndex: 9, text: 'Observation technique avec mesures ! Données scientifiques précieuses.', daysAgo: 5 },
  { observationIndex: 31, userIndex: 2, text: '45 minutes d\'observation... tu as dû voir plein de détails !', daysAgo: 4 },
  { observationIndex: 31, userIndex: 5, text: 'Vitesse angulaire mesurée ! Données scientifiques solides.', daysAgo: 3 },

  // Obs 32 - RAY Fontainebleau
  { observationIndex: 32, userIndex: 3, text: '5 rayons indépendants... comme s\'ils scannaient la zone !', daysAgo: 3 },
  { observationIndex: 32, userIndex: 5, text: 'Illuminer comme en plein jour... puissance énergétique incroyable.', daysAgo: 2 },

  // Obs 33 - LND Thonon
  { observationIndex: 33, userIndex: 7, text: '6 témoins ! Vous avez tous la même version j\'imagine ?', daysAgo: 4 },
  { observationIndex: 33, userIndex: 0, text: 'Terre chaude le lendemain... chaleur résiduelle de la propulsion ?', daysAgo: 3 },

  // Obs 34 - HUM Mulhouse couple
  { observationIndex: 34, userIndex: 1, text: 'Vous deux en même temps... au moins tu n\'es pas seul(e) dans cette épreuve.', daysAgo: 5 },
  { observationIndex: 34, userIndex: 4, text: 'GPS et montres arrêtés à 23h17... effet temporel ?', daysAgo: 4 },

  // Obs 35 - SUB Neuchâtel lac
  { observationIndex: 35, userIndex: 6, text: 'Lumières sous-marines suivant le bateau... ils vous observaient !', daysAgo: 3 },
  { observationIndex: 35, userIndex: 8, text: 'Émergence puis envol... transition eau-air sans problème. Technologie !', daysAgo: 2 },
  { observationIndex: 35, userIndex: 3, text: 'Les USO sont peut-être plus nombreux qu\'on ne pense.', daysAgo: 1 },

  // Obs 36 - SND Chamonix
  { observationIndex: 36, userIndex: 9, text: 'Des sons harmoniques ! Certains parlent de "musique des sphères".', daysAgo: 4 },
  { observationIndex: 36, userIndex: 2, text: 'Analyse audio avec fréquences inhabituelles... partage l\'enregistrement !', daysAgo: 3 },

  // Obs 37 - ANI Oiseaux Camargue
  { observationIndex: 37, userIndex: 3, text: 'Migration perturbée... les oiseaux sentent les champs magnétiques.', daysAgo: 2 },
  { observationIndex: 37, userIndex: 5, text: 'Plusieurs milliers d\'oiseaux dispersés... effet massif !', daysAgo: 1 },

  // Obs 38 - VEH Reims
  { observationIndex: 38, userIndex: 7, text: 'GPS montrant l\'Espagne ! Distorsion spatiale ou juste électronique folle ?', daysAgo: 3 },
  { observationIndex: 38, userIndex: 0, text: 'D\'autres automobilistes aussi... preuve collective de l\'effet EM.', daysAgo: 2 },

  // Obs 39 - TRC Perpignan
  { observationIndex: 39, userIndex: 1, text: 'Fragment confisqué... évidemment ! Ils ne veulent pas qu\'on analyse.', daysAgo: 5 },
  { observationIndex: 39, userIndex: 4, text: 'Alliage inconnu ! C\'était THE preuve matérielle. Dommage.', daysAgo: 4 },
  { observationIndex: 39, userIndex: 6, text: 'Tu devrais avoir fait analyser en cachette avant confiscation.', daysAgo: 3 }
];

export default commentsData;
