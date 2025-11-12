/**
 * Données des observations OVNI avec types UFO standardisés
 * Format: [longitude, latitude] pour MongoDB GeoJSON
 */
export const observationsData = [
  // WAV: Vague/cluster/flap
  {
    title: 'Vague d\'observations triangulaires au-dessus du lac Léman',
    description: 'Ce soir vers 22h30, j\'ai observé depuis Ouchy un objet de forme triangulaire avec trois lumières blanches aux angles. L\'objet se déplaçait silencieusement d\'ouest en est à basse altitude. Plusieurs témoins dans la région ont rapporté des observations similaires la même nuit. La durée d\'observation était d\'environ 5 minutes avant qu\'il ne disparaisse derrière les montagnes.',
    location: { type: 'Point', coordinates: [6.6323, 46.5197] },
    type: 'WAV',
    tags: ['triangle', 'silencieux', 'lumières-blanches', 'vague'],
    imageFilename: 'ovni-triangle-lausanne.jpg',
    userIndex: 0
  },

  // PHT: Photos/vidéos prises
  {
    title: 'Sphère orange photographiée au-dessus de Genève',
    description: 'Observation depuis mon balcon. Une sphère orange très lumineuse est restée immobile pendant 10 minutes au-dessus du jet d\'eau. J\'ai pris plusieurs photos haute résolution avec mon appareil. La sphère émettait une lumière pulsante orange-rouge. Puis elle a disparu instantanément.',
    location: { type: 'Point', coordinates: [6.1432, 46.2044] },
    type: 'PHT',
    tags: ['photo', 'sphère', 'orange', 'immobile'],
    imageFilename: 'ovni-sphere-geneve.jpg',
    userIndex: 1
  },

  // OBS: Véhicules d\'observation/poursuite
  {
    title: 'Formation de 7 lumières poursuivie en voiture',
    description: 'En rentrant à Berne, j\'ai vu 7 points lumineux formant un V parfait. Intrigué, j\'ai suivi la formation en voiture pendant 15 minutes. Ils se déplaçaient tous ensemble à la même vitesse, gardant exactement la même formation. J\'ai dû arrêter car ils s\'éloignaient trop vite.',
    location: { type: 'Point', coordinates: [7.4474, 46.9480] },
    type: 'OBS',
    tags: ['formation', 'poursuite', 'sept-objets'],
    imageFilename: 'ovni-formation-berne.jpg',
    userIndex: 2
  },

  // TCH: Nouveaux détails techniques
  {
    title: 'Disque métallique avec détails structurels visibles',
    description: 'Observation en plein après-midi ! Avec mes jumelles, j\'ai aperçu un objet discoïdal argenté. J\'ai pu distinguer une structure en forme de dôme sur le dessus, des panneaux sur la surface inférieure. L\'objet effectuait des montées verticales, arrêts brusques, virages à 90° à très haute vitesse. Diamètre estimé : 15-20 mètres.',
    location: { type: 'Point', coordinates: [8.5417, 47.3769] },
    type: 'TCH',
    tags: ['disque', 'détails-structurels', 'métallique', 'dôme'],
    imageFilename: 'ovni-disque-zurich.jpg',
    userIndex: 3
  },

  // SUB: Submersible
  {
    title: 'Objet cylindrique émergeant du lac Léman',
    description: 'Incroyable ! Depuis la rive, j\'ai observé une perturbation de l\'eau, puis un objet cylindrique gris métallique est sorti lentement du lac. L\'objet mesurait environ 10 mètres et émettait une lumière bleu-vert sous-marine. Une fois en surface, il est resté immobile 30 secondes, puis s\'est élevé verticalement à une vitesse folle.',
    location: { type: 'Point', coordinates: [6.5950, 46.4520] },
    type: 'SUB',
    tags: ['submersible', 'cylindre', 'lac', 'émersion'],
    imageFilename: 'ovni-submersible-leman.jpg',
    userIndex: 4
  },

  // RAY: Lumière bizarre/projecteur
  {
    title: 'Rayon lumineux balayant le sol depuis un disque',
    description: 'Observation depuis la place Bellecour à Lyon. Un disque argenté planait à 200m d\'altitude et émettait un rayon lumineux blanc très intense qui balayait le sol comme un projecteur. Le rayon était parfaitement défini, comme un cylindre de lumière solide. J\'ai ressenti une chaleur intense quand le rayon est passé près de moi.',
    location: { type: 'Point', coordinates: [4.8357, 45.7640] },
    type: 'RAY',
    tags: ['rayon', 'projecteur', 'balayage', 'chaleur'],
    imageFilename: 'ovni-rayon-lyon.jpg',
    userIndex: 5
  },

  // SND: Sons enregistrés
  {
    title: 'Objet cigare avec sons étranges enregistrés',
    description: 'Depuis mon appartement parisien, j\'ai observé un objet allongé de couleur gris métallique. Ce qui était troublant : un bourdonnement grave et modulé, presque musical. J\'ai réussi à l\'enregistrer avec mon téléphone. Le son était audible malgré la distance. L\'objet planait 6 minutes, puis a accéléré brusquement. Le son s\'est arrêté instantanément.',
    location: { type: 'Point', coordinates: [2.3522, 48.8566] },
    type: 'SND',
    tags: ['cigare', 'son', 'bourdonnement', 'enregistrement'],
    imageFilename: 'ovni-cigare-paris.jpg',
    userIndex: 6
  },

  // SIG: Signaux/communications
  {
    title: 'Lumières clignotantes répondant aux signaux lumineux',
    description: 'Expérience fascinante ! Vu depuis le Vieux-Port de Marseille, un objet avec lumières rouge, verte et blanche. Par curiosité, j\'ai fait des signaux avec ma lampe torche (3 flashs rapides). L\'objet a RÉPONDU avec le même pattern ! J\'ai répété avec différents patterns : il répondait à chaque fois. C\'était clairement une communication intentionnelle.',
    location: { type: 'Point', coordinates: [5.3698, 43.2965] },
    type: 'SIG',
    tags: ['communication', 'signaux', 'réponse', 'interaction'],
    imageFilename: 'ovni-signaux-marseille.jpg',
    userIndex: 7
  },

  // LND: Atterrissage
  {
    title: 'OVNI posé au sol avec trace d\'atterrissage',
    description: 'Randonnée dans les Alpes suisses. J\'ai découvert un objet discoïdal posé dans une clairière. Diamètre 8 mètres, hauteur 3 mètres, couleur gris-bleu métallique. Trois pieds télescopiques le maintenaient au sol. L\'objet a émis un sifflement aigu, les pieds se sont rétractés, et il s\'est élevé verticalement. Au sol : trois marques circulaires de 40cm avec l\'herbe brûlée en cercle de 6m.',
    location: { type: 'Point', coordinates: [7.6586, 46.0207] },
    type: 'LND',
    tags: ['atterrissage', 'trace-sol', 'disque', 'pieds'],
    imageFilename: 'ovni-atterrissage-alpes.jpg',
    userIndex: 8
  },

  // VEH: Véhicule affecté
  {
    title: 'Panne électrique totale du véhicule sous un OVNI',
    description: 'Route de campagne près de Toulouse, 23h. Un objet triangulaire s\'est positionné au-dessus de ma voiture. TOUT s\'est arrêté instantanément : moteur, lumières, radio, téléphone. L\'objet émettait une lumière orange pulsante. Je suis resté bloqué 5 minutes. Puis l\'objet est parti à vitesse folle. Tout s\'est rallumé immédiatement. Mon mécanicien n\'a trouvé aucune anomalie.',
    location: { type: 'Point', coordinates: [1.4442, 43.6047] },
    type: 'VEH',
    tags: ['panne-électrique', 'véhicule', 'EME', 'triangle'],
    imageFilename: 'ovni-panne-toulouse.jpg',
    userIndex: 9
  },

  // ANI: Animaux affectés
  {
    title: 'Troupeau de vaches affolé par un OVNI',
    description: 'Ferme près de Bordeaux. Vers 4h du matin, tous les animaux se sont mis à paniquer. Les vaches couraient en cercle en beuglant, les chiens hurlaient. J\'ai vu un disque lumineux orange planer au-dessus du pré. Les vaches étaient terrorisées. Après 10 minutes, l\'objet est parti. Les animaux sont restés nerveux pendant 2 jours. Trois vaches ont refusé de produire du lait pendant une semaine.',
    location: { type: 'Point', coordinates: [-0.5792, 44.8378] },
    type: 'ANI',
    tags: ['animaux', 'vaches', 'panique', 'ferme'],
    imageFilename: 'ovni-animaux-bordeaux.jpg',
    userIndex: 0
  },

  // HUM: Humains affectés
  {
    title: 'Paralysie temporaire et temps manquant',
    description: 'Strasbourg, retour à pied vers 22h. J\'ai vu une lumière aveuglante descendre vers moi. Soudain, impossible de bouger, comme paralysé. Puis trou noir. Je me suis retrouvé 2 heures plus tard à 5km de là, sans aucun souvenir. J\'avais une marque rouge circulaire de 3cm sur l\'avant-bras qui a mis 2 semaines à disparaître. Mal de tête pendant 3 jours.',
    location: { type: 'Point', coordinates: [7.7521, 48.5734] },
    type: 'HUM',
    tags: ['paralysie', 'temps-manquant', 'marque', 'enlèvement'],
    imageFilename: 'ovni-enlevement-strasbourg.jpg',
    userIndex: 1
  },

  // TRC: Traces physiques
  {
    title: 'Cercle de végétation carbonisée découvert',
    description: 'Randonnée en forêt près de Lucerne. J\'ai découvert un cercle parfait de 12 mètres où toute la végétation était carbonisée. Au centre, trois dépressions triangulaires de 60cm, profondes de 15cm, formant un triangle équilatéral de 4m de côté. Le sol était vitrifié par endroits. Pas de trace de feu normal. La veille, des témoins ont vu des lumières dans cette zone.',
    location: { type: 'Point', coordinates: [8.3093, 47.0502] },
    type: 'TRC',
    tags: ['traces', 'cercle', 'brûlures', 'sol-vitrifié'],
    imageFilename: 'ovni-traces-lucerne.jpg',
    userIndex: 2
  },

  // RDA: Radiation détectée
  {
    title: 'Compteur Geiger affolé lors d\'une observation',
    description: 'Montreux, observation d\'un disque lumineux. Par chance, j\'avais mon compteur Geiger (je suis physicien). Quand l\'objet est passé au-dessus de moi à 100m, le compteur s\'est affolé : niveau de radiation 50 fois supérieur à la normale ! Principalement des rayons gamma. L\'objet est resté 5 minutes. Les niveaux sont revenus à la normale immédiatement. J\'ai les enregistrements.',
    location: { type: 'Point', coordinates: [6.9111, 46.4312] },
    type: 'RDA',
    tags: ['radiation', 'geiger', 'rayons-gamma', 'scientifique'],
    imageFilename: 'ovni-radiation-montreux.jpg',
    userIndex: 3
  },

  // ODD: Atypique/Paranormal
  {
    title: 'Entité lumineuse changeant de forme',
    description: 'Observation vraiment étrange à Neuchâtel. Ce n\'était pas un objet solide mais une entité lumineuse qui changeait constamment de forme : sphère, puis triangle, puis forme amorphe. Elle émettait des couleurs impossibles à décrire, entre le violet et une couleur inconnue. L\'observation m\'a laissé dans un état second, presque hypnotique. Sensation de communication télépathique.',
    location: { type: 'Point', coordinates: [6.9306, 46.9920] },
    type: 'ODD',
    tags: ['paranormal', 'forme-changeante', 'entité', 'télépathie'],
    imageFilename: 'ovni-entite-neuchatel.jpg',
    userIndex: 4
  },

  // HST: Compte historique
  {
    title: 'Récit de mon observation d\'enfance en 1985',
    description: 'Je témoigne d\'un événement vécu il y a 40 ans à Fribourg. J\'avais 8 ans. Depuis la fenêtre de ma chambre, j\'ai vu un énorme objet cylindrique avec des hublots lumineux passer lentement au-dessus de la ville. Mon père l\'a vu aussi. Le lendemain : 5 familles l\'avaient observé. Jamais d\'explication officielle. Cette observation a changé ma vie.',
    location: { type: 'Point', coordinates: [7.1512, 46.8060] },
    type: 'HST',
    tags: ['historique', '1985', 'enfance', 'cylindre', 'hublots'],
    imageFilename: 'ovni-historique-fribourg.jpg',
    userIndex: 5
  },

  // CMF: Camouflage
  {
    title: 'Objet se camouflant comme un nuage',
    description: 'Nice, observation extraordinaire. J\'ai vu un objet sombre qui s\'est soudain entouré d\'une brume blanche, devenant identique à un nuage ! Mais je l\'avais vu avant la transformation. Le "nuage" se déplaçait contre le vent et gardait une forme trop régulière. Après 15 minutes, la brume s\'est dissipée instantanément et l\'objet métallique est réapparu avant de partir à grande vitesse.',
    location: { type: 'Point', coordinates: [7.2619, 43.7102] },
    type: 'CMF',
    tags: ['camouflage', 'nuage', 'déguisement', 'métamorphose'],
    imageFilename: 'ovni-camouflage-nice.jpg',
    userIndex: 6
  },

  // MID: Probable mésidentification
  {
    title: 'Formation de lumières - Satellites Starlink ?',
    description: 'Observation de Lille. J\'ai vu une longue file de lumières blanches se déplaçant en ligne droite d\'ouest en est. Environ 40 points lumineux espacés régulièrement. Après recherche, il s\'agissait probablement de satellites Starlink récemment lancés. Mais sur le moment, c\'était impressionnant ! Je partage car d\'autres pourraient voir la même chose.',
    location: { type: 'Point', coordinates: [3.0586, 50.6292] },
    type: 'MID',
    tags: ['satellites', 'starlink', 'identification', 'ligne'],
    imageFilename: 'satellites-starlink-lille.jpg',
    userIndex: 7
  },

  // CNT: Contacté
  {
    title: 'Communication télépathique avec des êtres',
    description: 'Expérience bouleversante à Grenoble. Un disque lumineux s\'est approché de ma maison. J\'ai ressenti une présence dans mon esprit. Des pensées qui n\'étaient pas les miennes, des images mentales de lieux inconnus. Message clair : "Nous observons. Pas de danger. Évolution nécessaire." La communication a duré 10 minutes. Depuis, je reçois des "flashs" d\'information. Suivi médicalement, pas de problème psychiatrique.',
    location: { type: 'Point', coordinates: [5.7245, 45.1885] },
    type: 'CNT',
    tags: ['contact', 'télépathie', 'message', 'communication'],
    imageFilename: 'ovni-contact-grenoble.jpg',
    userIndex: 8
  },

  // OID: Humanoïde
  {
    title: 'Silhouette humanoïde observée près d\'un OVNI',
    description: 'Campagne près de Nantes, 2h du matin. Un disque était posé dans un champ. À côté, j\'ai clairement vu deux silhouettes. Taille environ 1m20, tête disproportionnée, membres fins. Ils semblaient inspecter le sol. Quand ils m\'ont vu, ils sont retournés vers l\'objet qui est parti immédiatement. Tout a duré 2 minutes. J\'étais pétrifié. Je n\'en ai parlé à personne pendant 6 mois.',
    location: { type: 'Point', coordinates: [-1.5534, 47.2184] },
    type: 'OID',
    tags: ['humanoïde', 'entité', 'petits-gris', 'rencontre'],
    imageFilename: 'ovni-humanoide-nantes.jpg',
    userIndex: 9
  },

  // COV: Dissimulation
  {
    title: 'Militaires sur zone et consigne de silence',
    description: 'Observation massive près de Dijon. Plus de 50 témoins ont vu un énorme triangle. Le lendemain, des militaires ont bouclé la zone. Ils ont interrogé tous les témoins et demandé de ne rien dire. Un hélicoptère militaire a survolé la zone pendant 2 jours. Les journaux locaux n\'ont rien publié malgré les témoignages. Réponse officielle : "exercice militaire". Mais nous savons ce que nous avons vu.',
    location: { type: 'Point', coordinates: [5.0415, 47.3220] },
    type: 'COV',
    tags: ['dissimulation', 'militaires', 'cover-up', 'censure'],
    imageFilename: 'ovni-coverup-dijon.jpg',
    userIndex: 0
  },

  // OGA: Agences gouvernementales
  {
    title: 'Rapport déposé à la gendarmerie',
    description: 'Observation à Annecy. J\'ai fait mon devoir de citoyen et déposé un rapport complet à la gendarmerie. Ils ont été professionnels et ont pris ma déposition au sérieux. Le gendarme m\'a dit qu\'il y avait eu 3 autres témoignages la même nuit dans la région. Il m\'a donné un numéro de dossier et dit que ça serait transmis au GEIPAN (organisme officiel français d\'étude des PAN).',
    location: { type: 'Point', coordinates: [6.1294, 45.8992] },
    type: 'OGA',
    tags: ['rapport-officiel', 'gendarmerie', 'GEIPAN'],
    imageFilename: 'ovni-rapport-annecy.jpg',
    userIndex: 1
  },

  // DRT: Traces de terre/sol
  {
    title: 'Empreintes de pas non-humaines trouvées',
    description: 'Forêt des Vosges. Découverte troublante : des empreintes de "pas" de 25cm avec seulement 3 orteils. Profondeur de 4cm dans la terre. Une piste de 50 mètres menant à une zone circulaire aplatie de 8m où l\'herbe était couchée en spirale. Moulages réalisés. Un biologiste les a examinées : pas d\'animal connu. Corrélation : lumières vues dans le ciel la nuit précédente.',
    location: { type: 'Point', coordinates: [7.0522, 48.2081] },
    type: 'DRT',
    tags: ['empreintes', 'traces', 'pas', 'sol', 'moulage'],
    imageFilename: 'traces-vosges.jpg',
    userIndex: 2
  },

  // VEG: Plantes affectées
  {
    title: 'Cercle dans un champ de blé avec anomalies',
    description: 'Agriculteur près de Colmar. Découvert un cercle parfait de 15m de diamètre dans mon champ de blé. Les tiges n\'étaient pas cassées mais pliées à 90° au niveau des nœuds. Impossible à reproduire manuellement sans casser. Au centre, un motif géométrique complexe. Les grains dans le cercle germaient 3 fois plus vite. Analyse d\'un agronome : inexplicable. Aucun signe de fraude.',
    location: { type: 'Point', coordinates: [7.3589, 48.0779] },
    type: 'VEG',
    tags: ['crop-circle', 'blé', 'géométrique', 'plantes'],
    imageFilename: 'cercle-colmar.jpg',
    userIndex: 3
  },

  // BLD: Bâtiment affecté
  {
    title: 'Panne électrique généralisée dans mon quartier',
    description: 'Quartier de Montpellier, 23h45. Un objet lumineux planait au-dessus du transformateur électrique. Soudain, TOUT le quartier (500 maisons) s\'est retrouvé dans le noir total. L\'objet émettait une lumière bleue pulsante. Après 20 minutes, il est parti verticalement. L\'électricité est revenue 2 minutes après. EDF n\'a trouvé aucune anomalie technique. Plusieurs témoins.',
    location: { type: 'Point', coordinates: [3.8767, 43.6108] },
    type: 'BLD',
    tags: ['panne', 'électricité', 'transformateur', 'quartier'],
    imageFilename: 'panne-montpellier.jpg',
    userIndex: 4
  },

  // INJ: Blessures/maladie
  {
    title: 'Brûlures suite à une rencontre rapprochée',
    description: 'Vaud, Suisse. Approché d\'un objet atterri à moins de 10 mètres. Sensation de chaleur intense. Le lendemain, brûlures au 1er degré sur le visage et les mains, comme un coup de soleil sévère. Nausées pendant 48h. Analyse médicale : brûlures compatibles avec exposition aux UV intenses ou radiations. Impossible naturellement vu la météo. Arrêt maladie de 1 semaine.',
    location: { type: 'Point', coordinates: [6.6335, 46.5197] },
    type: 'INJ',
    tags: ['brûlures', 'radiation', 'blessure', 'médical'],
    imageFilename: 'brulures-vaud.jpg',
    userIndex: 5
  },

  // NOC: Aucune entité vue
  {
    title: 'Observations nocturnes récurrentes au-dessus du Jura',
    description: 'Village du Jura suisse. Depuis 3 semaines, chaque nuit entre 2h et 3h du matin, des lumières oranges apparaissent au-dessus de la montagne. Parfois une seule, parfois jusqu\'à 5. Elles restent stationnaires 10-15 minutes puis disparaissent. Toute la communauté en parle. Nous avons établi un planning de veille. Phénomène régulier et prévisible. Aucune entité visible.',
    location: { type: 'Point', coordinates: [6.7658, 47.0598] },
    type: 'NOC',
    tags: ['récurrent', 'nocturne', 'régulier', 'communauté'],
    imageFilename: 'nocturne-jura.jpg',
    userIndex: 6
  },

  // WAV: Autre vague
  {
    title: 'Triangle noir géant silencieux au-dessus de Besançon',
    description: 'Besançon, 21h. Un triangle noir immense (estimé 100m d\'envergure) a survolé la ville à très basse altitude, environ 150m. Complètement silencieux ! Trois lumières blanches aux angles, une rouge au centre. Vol très lent, 30 km/h maximum. Observation de 8 minutes. Des dizaines de témoins dans les rues. Pas d\'explication officielle. Partie d\'une vague d\'observations cette semaine.',
    location: { type: 'Point', coordinates: [6.0240, 47.2380] },
    type: 'WAV',
    tags: ['triangle', 'géant', 'silencieux', 'ville', 'vague'],
    imageFilename: 'triangle-besancon.jpg',
    userIndex: 7
  },

  // PHT: Autre photo
  {
    title: 'Objet changeant de couleur photographié',
    description: 'Genève, parc des Bastions. Sphère lumineuse changeant de couleur de façon régulière : blanc -> bleu -> vert -> jaune -> rouge, puis recommence. Cycle de 10 secondes exactement. Objet stationnaire pendant 25 minutes. J\'ai pris une série de photos montrant la séquence complète. Puis départ fulgurant vers le nord-est. J\'ai chronométré tout avec précision.',
    location: { type: 'Point', coordinates: [6.1428, 46.2017] },
    type: 'PHT',
    tags: ['photo', 'couleurs', 'cyclique', 'sphère'],
    imageFilename: 'sphere-couleurs-geneve.jpg',
    userIndex: 8
  },

  // SIG: Autre signal
  {
    title: 'Deux objets semblant communiquer entre eux',
    description: 'Bâle, observation fascinante de deux disques argentés. Ils émettaient des flashs lumineux l\'un vers l\'autre, comme un échange de signaux. Pattern complexe : 3 flashs courts, pause, 2 flashs longs, etc. Cet échange a duré 10 minutes. Puis ils sont partis ensemble dans la même direction, en formation serrée. Communication évidente entre les deux objets.',
    location: { type: 'Point', coordinates: [7.5886, 47.5596] },
    type: 'SIG',
    tags: ['deux-objets', 'communication', 'flashs', 'disques'],
    imageFilename: 'duo-bale.jpg',
    userIndex: 9
  },

  // ODD: Autre atypique
  {
    title: 'Objet sortant et rentrant dans un nuage',
    description: 'Lausanne, temps nuageux. Un objet sphérique orange est sorti d\'un cumulus, a plané 3 minutes, puis est rentré dans le même nuage. Le nuage avait une forme étrange, trop géométrique pour être naturel. L\'objet est ressorti 5 minutes plus tard à un autre endroit et a disparu à l\'horizon. Comportement totalement atypique et inexplicable.',
    location: { type: 'Point', coordinates: [6.6335, 46.5197] },
    type: 'ODD',
    tags: ['nuage', 'sphère', 'comportement-étrange', 'atypique'],
    imageFilename: 'nuage-lausanne.jpg',
    userIndex: 0
  },

  // TCH: Observation technique avec télescope
  {
    title: 'Observation technique avec télescope amateur',
    description: 'Astronome amateur à Clermont-Ferrand. Avec mon télescope, j\'ai observé un objet discoïdal en orbite haute. J\'ai pu distinguer des structures : des protubérances en rotation autour de l\'axe central, des lumières qui s\'allumaient et s\'éteignaient selon un pattern. L\'objet est resté dans mon champ de vision 45 minutes. J\'ai pris des photos et fait des mesures de vitesse angulaire précises.',
    location: { type: 'Point', coordinates: [3.0863, 45.7772] },
    type: 'TCH',
    tags: ['télescope', 'structures', 'orbite', 'mesures'],
    imageFilename: 'telescope-clermont.jpg',
    userIndex: 1
  },

  // RAY: Multiple rayons
  {
    title: 'Cinq rayons balayant une forêt',
    description: 'Forêt de Fontainebleau, 22h30. Un grand objet triangulaire planait au-dessus de la forêt et projetait 5 rayons lumineux blancs vers le sol. Les rayons se déplaçaient indépendamment, balayant la forêt comme s\'ils cherchaient quelque chose. J\'ai observé depuis un point surélevé pendant 20 minutes. Les rayons étaient tellement puissants qu\'ils illuminaient les arbres comme en plein jour.',
    location: { type: 'Point', coordinates: [2.6994, 48.4048] },
    type: 'RAY',
    tags: ['rayons-multiples', 'balayage', 'forêt', 'recherche'],
    imageFilename: 'rayons-fontainebleau.jpg',
    userIndex: 2
  },

  // LND: Autre atterrissage
  {
    title: 'Atterrissage observé par un groupe de randonneurs',
    description: 'Campagne près de Thonon-les-Bains. En soirée, un objet ovale s\'est posé dans un champ à 200m de notre groupe de 6 randonneurs. Nous sommes restés cachés et avons observé pendant 30 minutes. L\'objet émettait une lumière bleue pulsante. Nous avons entendu un sifflement. Puis il est reparti verticalement. Le lendemain : herbe aplatie en cercle de 10m, terre chaude au toucher.',
    location: { type: 'Point', coordinates: [6.4808, 46.3703] },
    type: 'LND',
    tags: ['atterrissage', 'témoins-multiples', 'lumière-bleue', 'cercle'],
    imageFilename: 'atterrissage-thonon.jpg',
    userIndex: 3
  },

  // HUM: Temps manquant pour un couple
  {
    title: 'Expérience de temps manquant vécue par un couple',
    description: 'Ma femme et moi rentrions en voiture près de Mulhouse, 23h15. Nous avons vu une lumière intense nous suivre. Puis trou noir pour nous deux. Nous nous sommes "réveillés" à 2h45 dans la voiture garée à 30km de notre trajet, sans aucun souvenir. Nos montres et le GPS s\'étaient arrêtés à 23h17. Nous avons tous les deux des cauchemars récurrents depuis.',
    location: { type: 'Point', coordinates: [7.3350, 47.7508] },
    type: 'HUM',
    tags: ['temps-manquant', 'couple', 'déplacement', 'cauchemars'],
    imageFilename: 'missing-time-mulhouse.jpg',
    userIndex: 4
  },

  // SUB: Objet sous-marin
  {
    title: 'Lumières sous-marines suivant un bateau',
    description: 'Navigation sur le lac de Neuchâtel. Vers 21h, notre bateau a été suivi par des lumières sous-marines brillantes, vertes et blanches. Elles restaient à 20 mètres sous la surface, visibles malgré la profondeur. Vitesse identique au bateau pendant 15 minutes. Puis elles ont accéléré, disparu sous le bateau, et émergé 100m plus loin en un objet sphérique qui s\'est envolé verticalement.',
    location: { type: 'Point', coordinates: [6.8597, 46.9100] },
    type: 'SUB',
    tags: ['submersible', 'lac', 'lumières-sous-marines', 'poursuite'],
    imageFilename: 'submersible-neuchatel.jpg',
    userIndex: 5
  },

  // SND: Sons multiples
  {
    title: 'Sons métalliques et harmoniques enregistrés',
    description: 'Montagne près de Chamonix. Camping nocturne. Vers minuit, des sons étranges ont résonné dans toute la vallée : cliquetis métalliques suivis de notes harmoniques graves, presque comme une mélodie. J\'ai tout enregistré (20 minutes). Aucune source visible mais sensation que ça venait du ciel. Le lendemain, 3 autres campeurs ont confirmé avoir entendu. Analyse audio : fréquences inhabituelles.',
    location: { type: 'Point', coordinates: [6.8694, 45.9237] },
    type: 'SND',
    tags: ['sons', 'enregistrement', 'harmoniques', 'métallique'],
    imageFilename: 'sons-chamonix.jpg',
    userIndex: 6
  },

  // ANI: Oiseaux affectés
  {
    title: 'Migration d\'oiseaux perturbée par un OVNI',
    description: 'Observatoire ornithologique près de Camargue. Durant une migration nocturne, un vol de plusieurs milliers d\'oiseaux s\'est soudainement dispersé de façon chaotique. Au même moment, une lumière orange intense est apparue. Les oiseaux semblaient désorientés, certains se sont posés en plein jour (comportement anormal). La lumière est restée 10 minutes. Après son départ, les oiseaux ont repris leur route normalement.',
    location: { type: 'Point', coordinates: [4.4050, 43.5297] },
    type: 'ANI',
    tags: ['oiseaux', 'migration', 'désorientation', 'comportement-anormal'],
    imageFilename: 'oiseaux-camargue.jpg',
    userIndex: 7
  },

  // VEH: Interférence électronique
  {
    title: 'Tous les systèmes électroniques perturbés',
    description: 'Autoroute près de Reims, 22h. Un disque lumineux s\'est approché de ma voiture. Tableau de bord complètement fou : toutes les jauges affolées, radio crachant des parasites, GPS montrant des positions aberrantes (indiquait que j\'étais en Espagne !). Mon téléphone s\'est éteint. D\'autres automobilistes se sont arrêtés, même problème. Durée : 8 minutes. Tout est revenu normal quand l\'objet est parti.',
    location: { type: 'Point', coordinates: [4.0317, 49.2583] },
    type: 'VEH',
    tags: ['électronique', 'interférence', 'GPS', 'autoroute'],
    imageFilename: 'interference-reims.jpg',
    userIndex: 8
  },

  // TRC: Matériau inconnu
  {
    title: 'Fragment de matériau inconnu récupéré',
    description: 'Après une observation près de Perpignan, j\'ai trouvé au sol un fragment métallique de 8cm. Aspect étrange : très léger mais extrêmement résistant, surface changeant de couleur selon l\'angle. Impossible à rayer ou à plier. Un métallurgiste l\'a analysé : alliage inconnu avec des proportions impossibles à obtenir avec nos techniques. Le fragment a été confisqué par des autorités après 2 semaines.',
    location: { type: 'Point', coordinates: [2.8948, 42.6886] },
    type: 'TRC',
    tags: ['matériau', 'fragment', 'alliage-inconnu', 'analyse'],
    imageFilename: 'fragment-perpignan.jpg',
    userIndex: 9
  },

  // VEG: Effets sur arbres
  {
    title: 'Arbres avec branches tordues en spirale',
    description: 'Forêt près de Nancy. Zone de 50m de diamètre où tous les arbres ont leurs branches supérieures tordues en spirale, toutes dans le sens horaire. L\'écorce présente des marques de brûlure circulaires. Les feuilles dans cette zone ont une croissance anormale (3 fois la taille normale). Un botaniste a fait des analyses : stress environnemental extrême d\'origine inconnue. Témoins ont vu des lumières la semaine précédente.',
    location: { type: 'Point', coordinates: [6.1840, 48.6921] },
    type: 'VEG',
    tags: ['arbres', 'spirale', 'brûlures', 'anomalie-croissance'],
    imageFilename: 'arbres-nancy.jpg',
    userIndex: 0
  },

  // RDA: Radiations multiples
  {
    title: 'Zone de radiation persistante détectée',
    description: 'Équipe de géologues près de Grenoble. Nos instruments de mesure ont détecté une zone circulaire de 15m avec radiation élevée (10x la normale). Type de radiation : mélange de gamma et une signature inconnue. La radiation persiste depuis 3 jours (observation d\'OVNI rapportée il y a 3 jours). Sol légèrement magnétisé. Nous avons balisé la zone. Autorités nucléaires prévenues mais pas de réponse.',
    location: { type: 'Point', coordinates: [5.7301, 45.1825] },
    type: 'RDA',
    tags: ['radiation-persistante', 'zone-contaminée', 'magnétisme', 'mesures'],
    imageFilename: 'radiation-grenoble.jpg',
    userIndex: 1
  },

  // BLD: Infrastructure affectée
  {
    title: 'Pylône électrique haute tension endommagé',
    description: 'Technicien EDF près de Metz. Appelé pour un pylône haute tension "grillé". Sur place : isolation fondue, câbles tordus, métal partiellement vitrifié. Pas de court-circuit, pas d\'orage. Dommages incompatibles avec une surcharge électrique. Riverains rapportent un objet lumineux stationnaire au-dessus du pylône la nuit précédente. Analyses métallurgiques en cours. Dégâts estimés à 200 000€.',
    location: { type: 'Point', coordinates: [6.1757, 49.1193] },
    type: 'BLD',
    tags: ['pylône', 'haute-tension', 'dommages', 'vitrifié'],
    imageFilename: 'pylone-metz.jpg',
    userIndex: 2
  },

  // INJ: Effets physiologiques
  {
    title: 'Effets physiologiques durables après observation',
    description: 'Après une observation rapprochée près de Brest, je souffre de symptômes persistants : vision troublée avec halos lumineux, acouphènes constants (sifflement aigu), fatigue extrême, perte de 8kg en 2 semaines. Analyses médicales : perturbation du système nerveux, globules blancs anormalement élevés. Dermatologue intrigué par une marque triangulaire parfaite de 5cm apparue sur mon épaule. En arrêt maladie depuis 1 mois.',
    location: { type: 'Point', coordinates: [-4.4860, 48.3905] },
    type: 'INJ',
    tags: ['effets-physiologiques', 'vision', 'fatigue', 'marque-triangulaire'],
    imageFilename: 'effets-brest.jpg',
    userIndex: 3
  },

  // CNT: Contact répété
  {
    title: 'Contacts télépathiques répétés depuis 6 mois',
    description: 'Depuis ma première observation il y a 6 mois près de Rennes, je reçois régulièrement des "messages" télépathiques. Toujours la même "voix" mentale. Messages concernant l\'environnement, l\'évolution humaine. Parfois des prémonitions qui se réalisent. J\'ai commencé à tenir un journal. Un psychiatre m\'a examiné : aucune pathologie. Je ne suis pas le seul, j\'ai rencontré 3 autres "contactés" avec expériences similaires.',
    location: { type: 'Point', coordinates: [-1.6778, 48.1173] },
    type: 'CNT',
    tags: ['contact-répété', 'télépathie', 'messages', 'contacté'],
    imageFilename: 'contact-rennes.jpg',
    userIndex: 4
  }
];

export default observationsData;
