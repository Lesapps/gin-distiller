// ============================================================
// DATA.JS - Source unique de toutes les donnees verifiees du PDF
// Guide de Production de Gin - Calculs verifies pour 2L de vin
// ============================================================

const DATA = {

  // --- POINT DE DEPART ---
  starting: {
    volume: 2000,        // mL de vin blanc
    abv: 12,             // % ABV
    ethanol: 240,        // mL d'ethanol pur (2000 * 0.12)
    density: 0.979,      // g/cm3 a 20°C (vin fini 12%)
    potSize: 3000,       // mL capacite alambic
    type: 'Blanc sec',
    note: 'Eviter vins sucres (mousse dans l\'alambic)'
  },

  // --- D1 STRIPPING RUN ---
  D1: {
    objectif: 'Concentrer rapidement l\'ethanol du vin en un "bas-vin" (low wines). Pas de coupes tetes/coeur/queues. Eliminer seulement les foreshots. Chauffer vite.',
    params: [
      { param: 'Charge', value: '2.0 L de vin a 12%', note: '67% de l\'alambic 3L (norme 50-75%)' },
      { param: 'Foreshots a eliminer', value: '10-15 mL', note: '~5 mL/L de charge (acetone, acetaldehyde)' },
      { param: 'Coupes tetes/queues', value: 'NON', note: 'Tout le reste est collecte' },
      { param: 'Arret de collecte', value: 'Sortie < 10% ABV ou T vapeur > 96\u00b0C', note: 'Au-dela, trop peu d\'ethanol' },
      { param: 'Vitesse', value: 'Rapide (max condenseur)', note: 'Stripping = efficacite, pas precision' },
      { param: 'Duree estimee', value: '2-3 heures', note: '' }
    ],
    charge: 2000,
    output: { volume: 600, abv: 35, ethanol: 210 },
    recovery: 88,          // %
    foreshots: { min: 10, max: 15 },
    tempProfile: [
      { phase: 'Prechauffage',       temp: '20 \u2192 65', duree: '0-15 min',    action: 'Chauffage progressif, rien ne coule' },
      { phase: 'Foreshots',          temp: '65-78',      duree: '15-20 min',   action: 'ELIMINER premiers 10-15 mL (acetone)' },
      { phase: 'Distillation active', temp: '78-90',      duree: '20 min - 2h', action: 'COLLECTER tout, debit rapide' },
      { phase: 'Fin de distillation', temp: '90-96',      duree: '2h-3h',       action: 'Debit ralentit, continuer' },
      { phase: 'Arret',             temp: '> 96',       duree: '3h+',         action: 'Arreter, quasiment plus d\'ethanol' }
    ],
    tempNote: 'T pot/chaudiere = T vapeur + 10-15\u00b0C. Un pot a 95\u00b0C peut donner une vapeur a 82\u00b0C.',
    bilan: {
      entree: '2 000 mL de vin a 12% = 240 mL ethanol pur',
      foreshots: '10-15 mL (traces d\'ethanol perdues)',
      residus: '~5-10% de l\'ethanol reste dans le pot (~15-24 mL)',
      evaporation: '~2-3%',
      sortie: '~600 mL de bas-vin a ~35% ABV = ~210 mL ethanol pur',
      recuperation: '210/240 = ~88%',
      regle: '"Regle du tiers" : volume bas-vin ~ 1/3 du volume de charge pour un vin a 12%. 2000/3 = 667 mL. Coherent avec ~600 mL.'
    },
    stockage: [
      { param: 'Recipient', detail: 'Bouteille en verre propre' },
      { param: 'Etiquette', detail: '"BAS-VIN D1 - ~600 mL - ~35% ABV - [date]"' },
      { param: 'Temperature', detail: '15-20\u00b0C, stable' },
      { param: 'Duree max avant D2', detail: '1-3 jours' },
      { param: 'Volume exact', detail: 'NOTER precisement (ex: 612 mL)' },
      { param: 'ABV mesure', detail: 'NOTER (ex: 34%)' }
    ]
  },

  // --- D2 SPIRIT RUN + BOTANIQUES ---
  D2: {
    objectif: 'Redistiller le bas-vin avec les botaniques pour creer le profil aromatique du gin, et separer soigneusement les fractions (foreshots/tetes/coeur/queues). Chauffer LENTEMENT pour une bonne separation.',
    params: [
      { param: 'Charge', value: '~600 mL de bas-vin D1 a ~35% ABV (totalite)' },
      { param: 'Remplissage alambic', value: '20% du 3L (faible - acceptable pour spirit run)' },
      { param: 'Coupes', value: 'OUI - foreshots / tetes / coeur / queues' },
      { param: 'Vitesse', value: 'LENTE (1-2 gouttes/sec pour bonne separation)' },
      { param: 'Duree', value: '2-4 heures' }
    ],
    charge: { volume: 600, abv: 35, ethanol: 210 },
    output: { volume: 175, abv: 73, ethanol: 128 },
    recovery: 60,          // % du D1
    foreshots: { min: 5, max: 10 },
    tetes: { volume: '15-25', abv: 82, ethanol: 15 },
    queues: { volume: 80, abv: 35, ethanol: 28 },
    tempProfile: [
      { phase: 'Prechauffage',  temp: '20 \u2192 65\u00b0C',  abv: '--',    action: 'Aucune collecte' },
      { phase: 'FORESHOTS',     temp: '65-78\u00b0C',   abv: '> 85%', action: 'ELIMINER 5-10 mL (acetone, acetaldehyde)' },
      { phase: 'TETES',         temp: '78-80\u00b0C',   abv: '85-78%', action: 'Collecter a part (recyclable)' },
      { phase: 'COEUR debut',   temp: '~80\u00b0C',     abv: '~78%',  action: 'DEBUT COLLECTE (odeur propre, agreable)' },
      { phase: 'COEUR',         temp: '80-85\u00b0C',   abv: '78-65%', action: 'Collecter le coeur (le gin)' },
      { phase: 'COEUR fin',     temp: '~85\u00b0C',     abv: '~65%',  action: 'ARRET si odeur lourde/huileuse apparait' },
      { phase: 'QUEUES',        temp: '85-96\u00b0C',   abv: '< 65%', action: 'Collecter separement (recyclable)' }
    ],
    coupesNote: 'Les coupes se font PRINCIPALEMENT au nez et au gout, pas uniquement par temperature ou ABV. Les chiffres ci-dessus sont des reperes indicatifs. Changez de recipient toutes les 20-30 mL et evaluez chaque fraction.',
    bilan: {
      entree: '~600 mL a ~35% = ~210 mL ethanol pur',
      foreshots: '5-10 mL (elimines)',
      tetes: '~15-25 mL a ~82% = ~15 mL ethanol (recycler)',
      coeur: '~175 mL a ~73% = ~128 mL ethanol pur',
      queues: '~80 mL a ~35% = ~28 mL ethanol',
      evaporation: '~39 mL ethanol (pertes ~19%)',
      verification: '15 + 128 + 28 + 39 = 210 mL ethanol. Bilan equilibre.'
    },
    infusion: {
      maceration: {
        titre: 'Maceration directe (12-24h)',
        etapes: [
          'Ajouter les botaniques dans le bas-vin, couvrir',
          'Macerer 12-24 heures a temperature ambiante (20\u00b0C)',
          'Ne pas depasser 48h (amertume excessive au-dela)',
          'Charger le tout dans l\'alambic et distiller lentement'
        ]
      },
      panier: {
        titre: 'Panier a vapeur (gin basket) si disponible',
        points: [
          'Botaniques robustes (genievre, coriandre, angelique) : dans le pot, maceration 12-24h',
          'Botaniques delicats (agrumes, cardamome) : dans le panier a vapeur',
          'Les vapeurs traversent le panier pendant la distillation',
          'Resultat plus fin et elegant (methode des gins premium)'
        ]
      }
    }
  },

  // --- BOTANIQUES ---
  botanicals: [
    { nom: 'Baies de genievre', detail: 'ecrasees',  gPerL: 15.0, role: 'Dominant - caractere gin (min 50% du total)', preparation: 'Ecraser legerement au mortier' },
    { nom: 'Graines de coriandre', detail: 'craquees', gPerL: 7.5, role: 'Notes d\'agrumes, rondeur', preparation: 'Craquer grossierement' },
    { nom: 'Racine d\'angelique', detail: 'sechee', gPerL: 1.5, role: 'Structure, fixatif, notes terreuses', preparation: 'Couper en petits morceaux' },
    { nom: 'Zeste de citron', detail: 'seche', gPerL: 0.8, role: 'Fraicheur citronnee', preparation: 'Seche, en lamelles' },
    { nom: 'Zeste d\'orange amere', detail: 'seche', gPerL: 0.8, role: 'Amertume aromatique', preparation: 'Seche, en lamelles' },
    { nom: 'Cardamome verte', detail: 'ecrasee', gPerL: 0.3, role: 'Epice chaude', preparation: 'Ecraser les gousses' },
    { nom: 'Racine d\'iris', detail: 'sechee', gPerL: 0.3, role: 'Fixatif aromatique', preparation: 'En poudre ou petits morceaux' }
  ],
  botanicalsTotal: 26.2,  // g/L total
  botanicalsNote: 'Standard professionnel : 20-35 g/L. Genievre minimum 10 g/L pour caractere gin reconnaissable. Systeme de proportions : Genievre (X), Coriandre (X/2), Angelique (X/10), Agrumes (X/20).',

  // --- D3 AFFINAGE FINAL ---
  D3: {
    objectif: 'Affiner la purete par une troisieme distillation. Partant de vin a 12% (pas d\'un neutre a 96%), la D3 se justifie pour affiner la purete.',
    note: 'La triple distillation n\'est PAS le standard du gin (le gin est normalement produit par une seule redistillation d\'un esprit neutre). Ici, partant de vin a 12% (pas d\'un neutre a 96%), la D3 se justifie pour affiner la purete. Cependant, le volume sera tres faible dans un alambic 3L.',
    params: [
      { param: 'Charge brute', value: '~175 mL de coeur D2 a ~73%', note: 'Seulement 6% de l\'alambic 3L' },
      { param: 'Dilution recommandee', value: 'Ajouter ~120 mL eau RO pour atteindre ~43%', note: 'Monte a ~295 mL = 10% de l\'alambic' },
      { param: 'Volume charge final', value: '~295 mL a ~43% ABV', note: 'Faible mais acceptable si chauffe doux' },
      { param: 'Coupes', value: 'Identiques D2 (foreshots/tetes/coeur/queues)', note: '' },
      { param: 'Vitesse', value: 'TRES LENTE', note: 'Volume faible = risque de surchauffe' },
      { param: 'Botaniques', value: 'NON (option 1, recommande)', note: 'Aromes deja acquis en D2' }
    ],
    chargeBrute: { volume: 175, abv: 73, ethanol: 128 },
    dilution: { eauAjoutee: 120, volumeFinal: 295, abvFinal: 43 },
    dilutionCalc: '175 mL x (73/43 - 1) = 175 x 0.698 = 122 mL d\'eau. Total : 175 + 122 = 297 mL a 43% ABV. Ethanol pur inchange : 128 mL.',
    output: { volume: 135, abv: 80, ethanol: 108 },
    recovery: 84,          // % du D2
    tempProfile: [
      { phase: 'Prechauffage',     temp: '20 \u2192 65\u00b0C', abv: '--',     action: 'Chauffer tres doucement' },
      { phase: 'Foreshots+Tetes',  temp: '65-80\u00b0C',  abv: '> 78%',  action: 'Eliminer 3-5 mL' },
      { phase: 'COEUR',           temp: '80-85\u00b0C',  abv: '78-65%', action: 'COLLECTER (~120-150 mL)' },
      { phase: 'Queues',          temp: '85-96\u00b0C',  abv: '< 65%',  action: 'Collecter separement ou arreter' }
    ],
    bilan: {
      entree: '~297 mL a ~43% = ~128 mL ethanol pur',
      foreshotsTetes: '~5 mL ethanol',
      coeur: '~135 mL a ~80% = ~108 mL ethanol pur',
      queues: '~30 mL a ~30% = ~9 mL ethanol',
      evaporation: '~6 mL ethanol',
      verification: '5 + 108 + 9 + 6 = 128 mL. Bilan equilibre.',
      recuperation: '108/128 = 84% (normal pour un esprit deja propre)'
    }
  },

  // --- DILUTION ET FINITION ---
  dilution: {
    formule: 'V_eau = V_esprit \u00d7 (ABV_initial / ABV_final - 1)',
    formuleNote: 'Cette formule est une approximation. Le melange eau-ethanol subit une contraction de volume d\'environ 2-3% (les molecules s\'imbriquent). Toujours verifier l\'ABV final a l\'alcoometre apres repos, et ajuster.',
    contraction: 2.5,       // % contraction moyenne
    reposMin: '2-3 semaines',
    reposOptimal: '4-6 semaines',
    scenarios: [
      { volume: 100, abv: 80, eau: 100, volFinal: 200, ethanol: 80 },
      { volume: 120, abv: 78, eau: 114, volFinal: 234, ethanol: 94 },
      { volume: 135, abv: 80, eau: 135, volFinal: 270, ethanol: 108 },
      { volume: 150, abv: 80, eau: 150, volFinal: 300, ethanol: 120 },
      { volume: 170, abv: 82, eau: 179, volFinal: 349, ethanol: 139 }
    ],
    procedure: {
      preparation: {
        titre: 'Etape 1 : Preparation',
        points: [
          'Eau : osmose inverse (RO) ideale. Eau distillee acceptable. TDS < 10 ppm.',
          'L\'eau de source peut causer du trouble (calcium/magnesium insolubles dans l\'alcool).',
          'Eau et distillat a la MEME temperature (~20\u00b0C) pour eviter le louche.'
        ]
      },
      melange: {
        titre: 'Etape 2 : Melange',
        points: [
          'Verser l\'eau DANS l\'esprit (jamais l\'inverse) - empeche le louche (effet ouzo)',
          'Verser en filet fin, en remuant doucement',
          'Idealement, diluer par etapes : d\'abord a 60%, repos 2 jours, puis a 40%',
          'Mesurer l\'ABV a l\'alcoometre apres chaque ajout'
        ]
      },
      repos: {
        titre: 'Etape 3 : Repos / Mariage (CRITIQUE)',
        duree: '2 a 3 semaines minimum (standard professionnel pour le gin)',
        minimum: '7 jours (integration basique, buvable mais pas optimal)',
        optimal: '4-6 semaines (equilibre complet, mouthfeel lisse)',
        pourquoi: [
          'Reorganisation des liaisons hydrogene eau-ethanol (jours a semaines)',
          'Stabilisation des terpenes du genievre (alpha-pinene, myrcene)',
          'Equilibration des esters (formation/hydrolyse)',
          'Integration des huiles essentielles botaniques dans la solution'
        ]
      },
      verification: {
        titre: 'Etape 4 : Verification finale',
        points: [
          'Alcoometre : 40% +/- 1%. Si > 42% : ajouter eau. Si < 38% : ajouter coeur pur.',
          'Limpidite : doit etre parfaitement transparent. Si trouble : filtrer ou laisser reposer.',
          'Odeur : genievre dominant, agrumes, epices. Pas d\'odeur chimique ni aigre.',
          'Gout (5 mL dilue) : equilibre, pas agressif, leger piquant normal a 40%.'
        ]
      }
    },
    exempleComplet: {
      coeurD3: '135 mL a 80% ABV',
      ethanolPur: '135 x 0.80 = 108 mL (parti de 240 mL, pertes 55% : normal)',
      eau: '135 x (80/40 - 1) = 135 x 1.0 = 135 mL d\'eau RO',
      volumeFinal: '135 + 135 = ~270 mL (contraction ~2% => ~264 mL reel)',
      abv: 'Verifier a l\'alcoometre => ~40%',
      repos: '3 semaines en bocal verre ferme, 18\u00b0C, obscurite',
      resultat: '~265 mL de gin a 40% ABV (environ 1 verre de 25 mL x 10)'
    }
  },

  // --- MISE EN BOUTEILLE ---
  bottling: {
    procedure: [
      { etape: 'Bouteille', detail: 'Verre (prefere teinte/ambre pour proteger des UV), 200 ou 375 mL' },
      { etape: 'Sterilisation', detail: 'Rincer a l\'eau bouillante 80\u00b0C, laisser secher completement' },
      { etape: 'Remplissage', detail: 'Apres les 2-3 semaines de repos, remplir sans agiter les sediments' },
      { etape: 'Fermeture', detail: 'Bouchon a vis (pratique) ou liege (traditionnel)' },
      { etape: 'Etiquette', detail: '"GIN MAISON - 40% ABV - [date de mise en bouteille]"' }
    ],
    conservation: [
      { param: 'Temperature', spec: '15-20\u00b0C (temperature ambiante fraiche)' },
      { param: 'Lumiere', spec: 'Obscurite ou lumiere indirecte (les UV degradent les terpenes)' },
      { param: 'Position', spec: 'Vertical (evite contact prolonge alcool-bouchon)' },
      { param: 'Duree SCELLEE', spec: 'INDEFINIE (l\'alcool a 40% est un conservateur naturel)' },
      { param: 'Duree OUVERTE', spec: '6-12 mois optimal, 2-3 ans acceptable' },
      { param: 'Degradation', spec: 'UV + oxydation des terpenes (limonene, pinene) -> notes de terebenthine' }
    ],
    conservationNote: 'Un gin a 40% ABV correctement scelle se conserve indefiniment. Les aromes botaniques delicats s\'attenuent lentement (mois/annees), mais le produit reste sur et consommable.'
  },

  // --- RECAPITULATIF ---
  summary: {
    progression: [
      { etape: 'Vin initial',    volume: '2 000 mL', abv: '12%',  ethanol: '240 mL', pctDepart: '100%' },
      { etape: 'Apres D1',      volume: '~600 mL',  abv: '~35%', ethanol: '~210 mL', pctDepart: '88%' },
      { etape: 'Coeur D2',      volume: '~175 mL',  abv: '~73%', ethanol: '~128 mL', pctDepart: '53%' },
      { etape: 'Coeur D3',      volume: '~135 mL',  abv: '~80%', ethanol: '~108 mL', pctDepart: '45%' },
      { etape: 'Gin final 40%', volume: '~270 mL',  abv: '40%',  ethanol: '~108 mL', pctDepart: '45%' }
    ],
    pertes: [
      { source: 'Foreshots/Tetes (elimines)', d1: '~2%',  d2: '~7%',  d3: '~4%', total: '~13%' },
      { source: 'Queues (separees)',          d1: '0%',   d2: '~13%', d3: '~7%', total: '~20%' },
      { source: 'Evaporation/Adherence',      d1: '~10%', d2: '~19%', d3: '~5%', total: '~22%' },
      { source: 'Ethanol recupere',           d1: '88%',  d2: '61%',  d3: '84%', total: '45% total' }
    ],
    rendementFinal: {
      volume: '~250-350 mL de gin a 40% ABV (estimation centrale : ~270 mL)',
      bouteille: '~1 petite bouteille (ou ~10 verres de 25 mL)',
      rendementVolume: '270/2000 = 13.5%',
      rendementEthanol: '108/240 = 45%',
      comparaison: 'Coherent avec les donnees publiees : le cognac (double distillation) recupere ~86% d\'ethanol en 2 passes. Notre triple distillation avec coupes serrees donne logiquement ~45%.'
    }
  },

  // --- BIBLIOTHEQUE DE BOTANIQUES ---
  botanicalsLibrary: [
    // Conifere
    { id: 'juniper', nom: 'Baies de genievre', detail: 'ecrasees', gPerLMin: 10, gPerLMax: 25, gPerLDefault: 15, categorie: 'conifere', role: 'Dominant - caractere gin', preparation: 'Ecraser legerement au mortier' },
    { id: 'juniper-fresh', nom: 'Genievre frais', detail: 'ecrase', gPerLMin: 8, gPerLMax: 20, gPerLDefault: 12, categorie: 'conifere', role: 'Caractere gin plus vegetal', preparation: 'Ecraser legerement' },
    // Agrume
    { id: 'lemon', nom: 'Zeste de citron', detail: 'seche', gPerLMin: 0.3, gPerLMax: 3, gPerLDefault: 0.8, categorie: 'agrume', role: 'Fraicheur citronnee', preparation: 'Seche, en lamelles' },
    { id: 'orange-bitter', nom: 'Zeste d\'orange amere', detail: 'seche', gPerLMin: 0.3, gPerLMax: 3, gPerLDefault: 0.8, categorie: 'agrume', role: 'Amertume aromatique', preparation: 'Seche, en lamelles' },
    { id: 'grapefruit', nom: 'Zeste de pamplemousse', detail: 'seche', gPerLMin: 0.3, gPerLMax: 3, gPerLDefault: 1.0, categorie: 'agrume', role: 'Notes agrumes vives', preparation: 'Seche, en lamelles' },
    { id: 'yuzu', nom: 'Zeste de yuzu', detail: 'seche', gPerLMin: 0.3, gPerLMax: 2.5, gPerLDefault: 0.8, categorie: 'agrume', role: 'Agrume asiatique complexe', preparation: 'Seche, en lamelles' },
    { id: 'combava', nom: 'Feuille de combava', detail: 'sechee', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'agrume', role: 'Agrume tropical intense', preparation: 'Sechee, emiettee' },
    { id: 'bergamot', nom: 'Zeste de bergamote', detail: 'seche', gPerLMin: 0.3, gPerLMax: 2.5, gPerLDefault: 0.8, categorie: 'agrume', role: 'Floral-agrume elegant', preparation: 'Seche, en lamelles' },
    // Floral
    { id: 'lavender', nom: 'Lavande', detail: 'fleurs sechees', gPerLMin: 0.1, gPerLMax: 1.0, gPerLDefault: 0.3, categorie: 'floral', role: 'Floral provencal', preparation: 'Fleurs sechees entieres' },
    { id: 'rose', nom: 'Petales de rose', detail: 'seches', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'floral', role: 'Floral delicat', preparation: 'Petales seches' },
    { id: 'elderflower', nom: 'Fleur de sureau', detail: 'sechee', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'floral', role: 'Floral mielleux', preparation: 'Fleurs sechees' },
    { id: 'hibiscus', nom: 'Hibiscus', detail: 'seche', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'floral', role: 'Floral acidule, couleur', preparation: 'Fleurs sechees' },
    { id: 'chamomile', nom: 'Camomille', detail: 'sechee', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'floral', role: 'Douceur florale', preparation: 'Fleurs sechees' },
    { id: 'jasmine', nom: 'Jasmin', detail: 'seche', gPerLMin: 0.1, gPerLMax: 1.0, gPerLDefault: 0.3, categorie: 'floral', role: 'Floral exotique intense', preparation: 'Fleurs sechees' },
    // Epice
    { id: 'coriander', nom: 'Graines de coriandre', detail: 'craquees', gPerLMin: 2, gPerLMax: 12, gPerLDefault: 7.5, categorie: 'epice', role: 'Notes d\'agrumes, rondeur', preparation: 'Craquer grossierement' },
    { id: 'cardamom', nom: 'Cardamome verte', detail: 'ecrasee', gPerLMin: 0.1, gPerLMax: 1.5, gPerLDefault: 0.3, categorie: 'epice', role: 'Epice chaude aromatique', preparation: 'Ecraser les gousses' },
    { id: 'black-pepper', nom: 'Poivre noir', detail: 'concasse', gPerLMin: 0.2, gPerLMax: 2.0, gPerLDefault: 0.5, categorie: 'epice', role: 'Piquant chaud', preparation: 'Concasser au mortier' },
    { id: 'sichuan-pepper', nom: 'Poivre de Sichuan', detail: 'concasse', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'epice', role: 'Piquant tingling', preparation: 'Concasser legerement' },
    { id: 'cinnamon', nom: 'Cannelle', detail: 'en batons', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'epice', role: 'Chaleur sucree', preparation: 'Casser en morceaux' },
    { id: 'nutmeg', nom: 'Muscade', detail: 'rapee', gPerLMin: 0.1, gPerLMax: 0.8, gPerLDefault: 0.2, categorie: 'epice', role: 'Chaleur boisee', preparation: 'Raper finement' },
    { id: 'clove', nom: 'Clou de girofle', detail: 'entier', gPerLMin: 0.05, gPerLMax: 0.5, gPerLDefault: 0.1, categorie: 'epice', role: 'Epice intense', preparation: 'Entier ou legerement ecrase' },
    { id: 'licorice', nom: 'Reglisse', detail: 'racine sechee', gPerLMin: 0.3, gPerLMax: 2.0, gPerLDefault: 0.8, categorie: 'epice', role: 'Douceur anisee', preparation: 'Couper en morceaux' },
    { id: 'star-anise', nom: 'Anis etoile', detail: 'entier', gPerLMin: 0.1, gPerLMax: 1.0, gPerLDefault: 0.3, categorie: 'epice', role: 'Anise puissant', preparation: 'Entier ou casse' },
    // Herbe
    { id: 'rosemary', nom: 'Romarin', detail: 'seche', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'herbe', role: 'Herbe mediterraneenne', preparation: 'Seche ou frais' },
    { id: 'thyme', nom: 'Thym', detail: 'seche', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'herbe', role: 'Herbe aromatique', preparation: 'Seche, effeuille' },
    { id: 'basil', nom: 'Basilic', detail: 'seche', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'herbe', role: 'Herbe fraiche', preparation: 'Seche ou frais' },
    { id: 'mint', nom: 'Menthe', detail: 'sechee', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'herbe', role: 'Fraicheur mentholee', preparation: 'Sechee, effeuille' },
    { id: 'sage', nom: 'Sauge', detail: 'sechee', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'herbe', role: 'Herbe terreuse', preparation: 'Feuilles sechees' },
    // Terreux/Boise
    { id: 'angelica', nom: 'Racine d\'angelique', detail: 'sechee', gPerLMin: 0.5, gPerLMax: 3.0, gPerLDefault: 1.5, categorie: 'terreux', role: 'Structure, fixatif, notes terreuses', preparation: 'Couper en petits morceaux' },
    { id: 'orris', nom: 'Racine d\'iris', detail: 'sechee', gPerLMin: 0.1, gPerLMax: 1.0, gPerLDefault: 0.3, categorie: 'terreux', role: 'Fixatif aromatique', preparation: 'En poudre ou petits morceaux' },
    { id: 'cassia', nom: 'Ecorce de cassia', detail: 'sechee', gPerLMin: 0.2, gPerLMax: 1.5, gPerLDefault: 0.5, categorie: 'terreux', role: 'Boise chaud', preparation: 'Casser en morceaux' },
    { id: 'cedar', nom: 'Bois de cedre', detail: 'copeaux', gPerLMin: 0.1, gPerLMax: 1.0, gPerLDefault: 0.3, categorie: 'terreux', role: 'Boise aromatique', preparation: 'Petits copeaux' },
    // Fruit
    { id: 'goji', nom: 'Baies de goji', detail: 'sechees', gPerLMin: 0.3, gPerLMax: 2.0, gPerLDefault: 0.5, categorie: 'fruit', role: 'Douceur fruitee', preparation: 'Sechees, entieres' },
    { id: 'blackcurrant', nom: 'Cassis', detail: 'seche', gPerLMin: 0.3, gPerLMax: 2.0, gPerLDefault: 0.5, categorie: 'fruit', role: 'Fruit rouge intense', preparation: 'Seche ou deshydrate' },
    { id: 'cucumber', nom: 'Concombre', detail: 'seche', gPerLMin: 0.5, gPerLMax: 3.0, gPerLDefault: 1.0, categorie: 'fruit', role: 'Fraicheur vegetale', preparation: 'Tranche et deshydrate' },
    { id: 'olive', nom: 'Olive', detail: 'sechee', gPerLMin: 0.3, gPerLMax: 2.0, gPerLDefault: 0.8, categorie: 'fruit', role: 'Salinite mediterraneenne', preparation: 'Olive denoyautee, sechee' }
  ],

  // --- CATEGORIES DE BOTANIQUES ---
  botanicalCategories: {
    conifere: { nom: 'Conifere', color: '#2d6a4f' },
    agrume:   { nom: 'Agrume', color: '#f4a261' },
    floral:   { nom: 'Floral', color: '#e9c1d4' },
    epice:    { nom: 'Epice', color: '#c44536' },
    herbe:    { nom: 'Herbe', color: '#6a994e' },
    terreux:  { nom: 'Terreux/Boise', color: '#8b6f47' },
    fruit:    { nom: 'Fruit', color: '#d4326d' }
  },

  // --- RECETTES PREREGISTREES ---
  presetRecipes: [
    {
      id: 'london-dry',
      nom: 'London Dry Classique',
      style: 'London Dry',
      description: 'Le gin classique par excellence. Equilibre et sec, domine par le genievre avec un support d\'agrumes et d\'epices. La recette de reference.',
      botanicals: [
        { id: 'juniper', gPerL: 15.0 },
        { id: 'coriander', gPerL: 7.5 },
        { id: 'angelica', gPerL: 1.5 },
        { id: 'lemon', gPerL: 0.8 },
        { id: 'orange-bitter', gPerL: 0.8 },
        { id: 'cardamom', gPerL: 0.3 },
        { id: 'orris', gPerL: 0.3 }
      ],
      totalGPerL: 26.2,
      profil: { conifere: 5, agrume: 3, floral: 1, epice: 2, herbe: 0, terreux: 3, fruit: 0 },
      notes: 'Standard professionnel. Proportions : Genievre (X), Coriandre (X/2), Angelique (X/10), Agrumes (X/20).',
      isPreset: true
    },
    {
      id: 'citrus-forward',
      nom: 'Citrus Forward',
      style: 'Citrus',
      description: 'Un gin lumineux et frais, avec un accent marque sur les agrumes tout en gardant le genievre comme base.',
      botanicals: [
        { id: 'juniper', gPerL: 12.0 },
        { id: 'coriander', gPerL: 5.0 },
        { id: 'lemon', gPerL: 2.0 },
        { id: 'grapefruit', gPerL: 2.0 },
        { id: 'yuzu', gPerL: 1.5 },
        { id: 'bergamot', gPerL: 1.5 },
        { id: 'angelica', gPerL: 1.0 }
      ],
      totalGPerL: 25.0,
      profil: { conifere: 4, agrume: 5, floral: 1, epice: 1, herbe: 0, terreux: 2, fruit: 0 },
      notes: 'Ideal pour les cocktails a base d\'agrumes (Gimlet, Tom Collins). Maceration courte (12h) recommandee pour conserver la fraicheur.',
      isPreset: true
    },
    {
      id: 'floral',
      nom: 'Floral',
      style: 'Floral',
      description: 'Un gin elegant et parfume, avec des notes florales delicates. Ideal pour un gin tonic printanier.',
      botanicals: [
        { id: 'juniper', gPerL: 12.0 },
        { id: 'coriander', gPerL: 4.0 },
        { id: 'lavender', gPerL: 0.5 },
        { id: 'rose', gPerL: 0.8 },
        { id: 'elderflower', gPerL: 0.8 },
        { id: 'chamomile', gPerL: 0.5 },
        { id: 'orris', gPerL: 0.4 }
      ],
      totalGPerL: 19.0,
      profil: { conifere: 4, agrume: 1, floral: 5, epice: 1, herbe: 0, terreux: 2, fruit: 0 },
      notes: 'ATTENTION : les floraux sont intenses - ne pas surdoser. Privilegier le panier a vapeur pour la lavande et la rose.',
      isPreset: true
    },
    {
      id: 'spiced',
      nom: 'Epice',
      style: 'Epice',
      description: 'Un gin chaleureux et complexe avec des epices prononcees. Parfait pour la saison froide et les cocktails epices.',
      botanicals: [
        { id: 'juniper', gPerL: 13.0 },
        { id: 'coriander', gPerL: 5.0 },
        { id: 'black-pepper', gPerL: 1.0 },
        { id: 'cinnamon', gPerL: 0.8 },
        { id: 'licorice', gPerL: 1.0 },
        { id: 'cardamom', gPerL: 0.5 },
        { id: 'angelica', gPerL: 1.2 }
      ],
      totalGPerL: 22.5,
      profil: { conifere: 4, agrume: 1, floral: 0, epice: 5, herbe: 0, terreux: 3, fruit: 0 },
      notes: 'Maceration 18-24h recommandee pour extraire les epices. Excellent en Negroni ou Hot Toddy.',
      isPreset: true
    },
    {
      id: 'mediterranean',
      nom: 'Mediterraneen',
      style: 'Herbal',
      description: 'Un gin frais et herbace inspire des herbes du maquis mediterraneen. Parfait avec un tonic et une branche de romarin.',
      botanicals: [
        { id: 'juniper', gPerL: 12.0 },
        { id: 'rosemary', gPerL: 1.0 },
        { id: 'thyme', gPerL: 0.8 },
        { id: 'olive', gPerL: 1.0 },
        { id: 'lemon', gPerL: 1.5 },
        { id: 'basil', gPerL: 0.5 },
        { id: 'angelica', gPerL: 1.2 }
      ],
      totalGPerL: 18.0,
      profil: { conifere: 4, agrume: 2, floral: 0, epice: 0, herbe: 5, terreux: 2, fruit: 1 },
      notes: 'Utiliser des herbes sechees de qualite. L\'olive apporte une salinite unique. Panier a vapeur recommande pour le basilic.',
      isPreset: true
    },
    {
      id: 'old-tom',
      nom: 'Old Tom',
      style: 'Old Tom',
      description: 'Version legerement adoucie du gin, historiquement populaire au XIXe siecle. Plus rond et accessible que le London Dry.',
      botanicals: [
        { id: 'juniper', gPerL: 12.0 },
        { id: 'coriander', gPerL: 5.0 },
        { id: 'licorice', gPerL: 1.5 },
        { id: 'chamomile', gPerL: 0.8 },
        { id: 'cinnamon', gPerL: 0.5 },
        { id: 'angelica', gPerL: 1.2 },
        { id: 'orris', gPerL: 0.5 }
      ],
      totalGPerL: 21.5,
      profil: { conifere: 4, agrume: 1, floral: 2, epice: 3, herbe: 0, terreux: 3, fruit: 0 },
      notes: 'La reglisse et la camomille apportent une douceur naturelle. Classique pour un Tom Collins ou un Martinez.',
      isPreset: true
    }
  ],

  // --- CHECKLISTS ---
  checklists: {
    avant: {
      titre: 'Avant toute distillation',
      items: [
        'Alambic nettoye, inspecte, joints etanches',
        'Thermometre VAPEUR en place au col (pas dans le pot)',
        'Alcoometre calibre, eprouvette propre',
        'Recipients etiquetes : foreshots, tetes, coeur, queues',
        'Eau RO/distillee disponible',
        'Condenseur fonctionne (sortie eau froide < 25\u00b0C)',
        'Espace ventile, extincteur accessible'
      ]
    },
    d1: {
      titre: 'D1 - Stripping Run',
      items: [
        '2.0L vin a 12% verse dans l\'alambic (67% capacite)',
        'Chauffage rapide jusqu\'a apparition des premiers distillats',
        'Foreshots : 10-15 mL elimines (noter le volume exact)',
        'Collecte integrale du reste (~600 mL attendu)',
        'Arret quand T vapeur > 96\u00b0C ou sortie < 10% ABV',
        'Volume final et ABV notes (attendu : ~600 mL, ~35%)',
        'Bas-vin stocke, etiquete'
      ]
    },
    d2: {
      titre: 'D2 - Spirit Run + Botaniques',
      items: [
        'Botaniques peses : genievre 9g, coriandre 4.5g, total ~16g',
        'Maceration 12-24h ou panier vapeur en place',
        'Bas-vin D1 charge (~600 mL)',
        'Chauffage LENT (1-2 gouttes/sec)',
        'Foreshots elimines (5-10 mL)',
        'Tetes collectees a part (jusqu\'a ~78% ABV sortie + odeur propre)',
        'COEUR collecte (attendu : ~175 mL a ~73%)',
        'Queues collectees a part (a partir de ~65% ABV ou odeur grasse)',
        'Tous volumes et ABV notes'
      ]
    },
    d3: {
      titre: 'D3 - Affinage Final',
      items: [
        'Coeur D2 preleve (~175 mL a ~73%)',
        'Dilue a ~43% avec ~120 mL eau RO (total ~295 mL)',
        'Alambic propre entre D2 et D3',
        'Chauffage TRES LENT (volume faible)',
        'Foreshots+Tetes elimines (3-5 mL)',
        'COEUR collecte (attendu : ~135 mL a ~80%)',
        'Volume et ABV notes precisement'
      ]
    },
    dilution: {
      titre: 'Dilution et Finition',
      items: [
        'ABV coeur D3 mesure',
        'Volume coeur D3 mesure',
        'Ethanol pur calcule = vol x ABV (doit etre <= 240 mL !)',
        'Eau RO calculee : vol x (ABV/40 - 1)',
        'Eau versee DANS l\'esprit (pas l\'inverse), en remuant',
        'ABV verifie a l\'alcoometre : ~40% +/- 1%',
        'Mis en repos : date debut / fin prevue (min. 2-3 semaines)',
        'ABV re-verifie apres repos',
        'Mis en bouteille sterile, etiquete avec date'
      ]
    }
  },

  // --- FRACTIONS (descriptions sensorielles) ---
  fractions: {
    foreshots: {
      nom: 'FORESHOTS',
      action: 'A ELIMINER DEFINITIVEMENT',
      couleur: 'danger',
      volume: '5-10 mL (~5 mL/L de charge)',
      description: [
        'Odeur : piquante, solvant, chimique (acetone)',
        'JAMAIS consommer ni recycler'
      ]
    },
    tetes: {
      nom: 'TETES',
      action: 'A COLLECTER SEPAREMENT',
      couleur: 'warning',
      volume: '~15-25 mL (entre foreshots et 78% ABV sortie)',
      description: [
        'Odeur : moins agressive que foreshots, encore chimique',
        'Recyclable : ajouter aux prochaines distillations'
      ]
    },
    coeur: {
      nom: 'COEUR - LE GIN',
      action: 'A COLLECTER',
      couleur: 'success',
      volume: '~150-200 mL a 70-75% ABV',
      description: [
        'Debut : odeur propre, cristalline, notes de genievre, alcoometre ~78% ABV',
        'Milieu : equilibre parfait, aromes botaniques clairs',
        'Fin : surveiller apparition d\'odeur lourde/grasse/carton mouille',
        'Tests : frotter entre les paumes et sentir, ou diluer a 40% et gouter',
        'Apparence : parfaitement limpide, incolore'
      ]
    },
    queues: {
      nom: 'QUEUES',
      action: 'A COLLECTER SEPAREMENT',
      couleur: 'warning',
      volume: '~50-100 mL (de 65% ABV jusqu\'a l\'arret)',
      description: [
        'Odeur : carton mouille, savon, graisse',
        'Contient le plus de methanol et d\'alcools de fusel',
        'Recyclable dans une future D1 (ou a eliminer)'
      ]
    }
  },

  // --- AVERTISSEMENTS ---
  warnings: {
    legal: 'La distillation d\'alcool a domicile est INTERDITE dans de nombreux pays sans licence. Ce guide est fourni a titre educatif uniquement.',
    risques: 'Risques : explosion des vapeurs, brulures thermiques, responsabilite penale.',
    methanol: 'Le vin de raisin contient tres peu de methanol (40-120 mg/L). La distillation de vin blanc ne presente PAS de risque significatif de methanol. Le methanol se concentre dans les queues (pas les tetes). L\'elimination des tetes sert a retirer l\'acetone et l\'acetaldehyde (qualite gustative).'
  },

  // --- COEFFICIENTS DE CALCUL ---
  calcCoefficients: {
    d1Recovery: 0.88,
    d2Recovery: 0.60,
    d3Recovery: 0.84,
    totalRecovery: 0.45,
    contraction: 0.025
  }
};
