const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function createThemesAndQuizzes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🚀 Création des thèmes et quiz...\n');
    
    // ========================================
    // 1. CRÉATION DES THÈMES
    // ========================================
    
    const themes = [
      {
        name: 'DPE - Performance Énergétique',
        slug: 'dpe',
        iconUrl: '/icone-thematique.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Amiante',
        slug: 'amiante',
        iconUrl: '/icone-thematique.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Plomb',
        slug: 'plomb',
        iconUrl: '/icone-thematique.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Électricité',
        slug: 'electricite',
        iconUrl: '/icone-thematique.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gaz',
        slug: 'gaz',
        iconUrl: '/icone-thematique.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Termites',
        slug: 'termites',
        iconUrl: '/icone-thematique.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Assainissement',
        slug: 'assainissement',
        iconUrl: '/icone-thematique.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'État des Risques (ERP)',
        slug: 'erp',
        iconUrl: '/icone-thematique.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Vérifier les thèmes existants
    const existingThemes = await db.collection('themes').find({}).toArray();
    const existingThemeSlugs = existingThemes.map(t => t.slug);
    
    const themesToAdd = themes.filter(theme => !existingThemeSlugs.includes(theme.slug));
    
    if (themesToAdd.length > 0) {
      await db.collection('themes').insertMany(themesToAdd);
      console.log(`✅ ${themesToAdd.length} nouveaux thèmes créés:`);
      themesToAdd.forEach(theme => console.log(`   - ${theme.name}`));
    } else {
      console.log('✅ Tous les thèmes existent déjà');
    }
    
    console.log('\n');
    
    // ========================================
    // 2. CRÉATION DES QUIZ
    // ========================================
    
    const quizzes = [
      // ===== DPE =====
      {
        title: 'DPE - Les bases',
        description: 'Quiz sur les fondamentaux du Diagnostic de Performance Énergétique',
        themeSlug: 'dpe',
        difficulty: 'debutant',
        questions: [
          {
            text: 'Quelle est la durée de validité d\'un DPE ?',
            explanation: 'Le DPE doit être refait tous les 10 ans',
            choices: [
              { text: '5 ans', isCorrect: false, explanation: 'Trop court, c\'est 10 ans' },
              { text: '10 ans', isCorrect: true, explanation: 'Correct ! Le DPE est valable 10 ans' },
              { text: '15 ans', isCorrect: false, explanation: 'Trop long, c\'est 10 ans' },
              { text: 'Illimité', isCorrect: false, explanation: 'Non, le DPE a une durée de validité limitée' }
            ]
          },
          {
            text: 'Que mesure le DPE ?',
            explanation: 'Le DPE évalue la consommation énergétique et les émissions de gaz à effet de serre',
            choices: [
              { text: 'Seulement la consommation électrique', isCorrect: false, explanation: 'Non, il mesure toutes les énergies' },
              { text: 'La consommation énergétique et les émissions de GES', isCorrect: true, explanation: 'Exact ! Le DPE a deux étiquettes : énergie et climat' },
              { text: 'Uniquement l\'isolation', isCorrect: false, explanation: 'Non, c\'est plus complet que ça' },
              { text: 'La qualité de l\'air intérieur', isCorrect: false, explanation: 'Non, ce n\'est pas l\'objet du DPE' }
            ]
          },
          {
            text: 'Quelle est la meilleure classe énergétique ?',
            explanation: 'Les classes vont de A (meilleure) à G (pire)',
            choices: [
              { text: 'Classe A', isCorrect: true, explanation: 'Oui ! A est la meilleure classe (bâtiments très performants)' },
              { text: 'Classe G', isCorrect: false, explanation: 'Non, G est la pire classe (passoires énergétiques)' },
              { text: 'Classe D', isCorrect: false, explanation: 'Non, D est une classe moyenne' },
              { text: 'Classe E', isCorrect: false, explanation: 'Non, E est une classe médiocre' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'DPE - Réglementation avancée',
        description: 'Quiz approfondi sur la réglementation du DPE',
        themeSlug: 'dpe',
        difficulty: 'apprenti',
        questions: [
          {
            text: 'Depuis quelle année le DPE est-il opposable ?',
            explanation: 'Le DPE est devenu juridiquement opposable en juillet 2021',
            choices: [
              { text: '2006', isCorrect: false, explanation: 'C\'est l\'année de création du DPE, mais il n\'était pas opposable' },
              { text: '2011', isCorrect: false, explanation: 'Non, il est devenu opposable plus tard' },
              { text: '2021', isCorrect: true, explanation: 'Correct ! Depuis le 1er juillet 2021, le DPE est opposable' },
              { text: '2023', isCorrect: false, explanation: 'Non, c\'était avant' }
            ]
          },
          {
            text: 'Quelle consommation maximale pour une classe A ?',
            explanation: 'La classe A correspond aux logements les plus performants',
            choices: [
              { text: 'Moins de 70 kWh/m²/an', isCorrect: true, explanation: 'Exact ! Classe A : moins de 70 kWh/m²/an' },
              { text: 'Moins de 110 kWh/m²/an', isCorrect: false, explanation: 'Non, c\'est le seuil de la classe B' },
              { text: 'Moins de 180 kWh/m²/an', isCorrect: false, explanation: 'Non, c\'est le seuil de la classe C' },
              { text: 'Moins de 250 kWh/m²/an', isCorrect: false, explanation: 'Non, c\'est le seuil de la classe D' }
            ]
          },
          {
            text: 'À partir de quelle année, les logements classés G seront interdits à la location ?',
            explanation: 'La loi Climat et Résilience prévoit une interdiction progressive',
            choices: [
              { text: '2023', isCorrect: false, explanation: 'C\'est l\'interdiction pour les logements > 450 kWh/m²/an' },
              { text: '2025', isCorrect: false, explanation: 'C\'est l\'interdiction pour tous les logements G' },
              { text: '2028', isCorrect: false, explanation: 'Non, c\'est pour les logements F' },
              { text: '2025 pour tous les G', isCorrect: true, explanation: 'Correct ! 2025 pour G, 2028 pour F, 2034 pour E' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ===== AMIANTE =====
      {
        title: 'Amiante - Fondamentaux',
        description: 'Les bases du diagnostic amiante',
        themeSlug: 'amiante',
        difficulty: 'debutant',
        questions: [
          {
            text: 'Pour quels biens le diagnostic amiante est-il obligatoire ?',
            explanation: 'L\'amiante a été interdite en France en 1997',
            choices: [
              { text: 'Tous les biens', isCorrect: false, explanation: 'Non, seulement ceux construits avant 1997' },
              { text: 'Biens construits avant le 1er juillet 1997', isCorrect: true, explanation: 'Exact ! L\'amiante a été interdite le 1er juillet 1997' },
              { text: 'Biens construits avant 1990', isCorrect: false, explanation: 'Non, la date limite est 1997' },
              { text: 'Seulement les immeubles collectifs', isCorrect: false, explanation: 'Non, tous les types de biens avant 1997' }
            ]
          },
          {
            text: 'Quelle est la durée de validité du diagnostic amiante ?',
            explanation: 'Le diagnostic amiante a une durée de validité illimitée si négatif',
            choices: [
              { text: '3 ans', isCorrect: false, explanation: 'Non, ce n\'est pas limité dans le temps' },
              { text: '10 ans', isCorrect: false, explanation: 'Non, ce n\'est pas limité dans le temps' },
              { text: 'Illimitée si absence d\'amiante', isCorrect: true, explanation: 'Correct ! Illimité si absence, 3 ans si présence' },
              { text: '6 mois', isCorrect: false, explanation: 'Non, c\'est pour le diagnostic termites' }
            ]
          },
          {
            text: 'Où peut-on trouver de l\'amiante dans un bâtiment ?',
            explanation: 'L\'amiante était très utilisée dans la construction',
            choices: [
              { text: 'Seulement dans l\'isolation', isCorrect: false, explanation: 'Non, elle était présente dans de nombreux matériaux' },
              { text: 'Dalles de sol, toitures, cloisons, canalisations', isCorrect: true, explanation: 'Exact ! L\'amiante était partout : dalles, toitures, flocage, etc.' },
              { text: 'Uniquement dans les toitures', isCorrect: false, explanation: 'Non, beaucoup plus de matériaux en contenaient' },
              { text: 'Dans le bois', isCorrect: false, explanation: 'Non, l\'amiante est un minéral, pas dans le bois' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ===== PLOMB =====
      {
        title: 'Plomb - CREP Essentiels',
        description: 'Quiz sur le Constat de Risque d\'Exposition au Plomb',
        themeSlug: 'plomb',
        difficulty: 'debutant',
        questions: [
          {
            text: 'Pour quels biens le CREP est-il obligatoire ?',
            explanation: 'Le plomb était utilisé dans les peintures anciennes',
            choices: [
              { text: 'Biens construits avant 1949', isCorrect: true, explanation: 'Exact ! Le plomb dans les peintures a été interdit en 1949' },
              { text: 'Biens construits avant 1997', isCorrect: false, explanation: 'Non, c\'est la date pour l\'amiante' },
              { text: 'Tous les biens', isCorrect: false, explanation: 'Non, seulement ceux avant 1949' },
              { text: 'Biens construits avant 1990', isCorrect: false, explanation: 'Non, la date limite est 1949' }
            ]
          },
          {
            text: 'Quelle est la durée de validité du CREP pour une vente ?',
            explanation: 'La durée de validité dépend du résultat',
            choices: [
              { text: '1 an', isCorrect: true, explanation: 'Correct ! 1 an pour une vente, 6 ans pour une location' },
              { text: '6 ans', isCorrect: false, explanation: 'Non, c\'est pour une location' },
              { text: 'Illimitée', isCorrect: false, explanation: 'Non, seulement si absence de plomb' },
              { text: '3 ans', isCorrect: false, explanation: 'Non, c\'est 1 an pour une vente' }
            ]
          },
          {
            text: 'Quel est le seuil réglementaire de plomb ?',
            explanation: 'Le seuil est fixé par la réglementation',
            choices: [
              { text: '0,5 mg/cm²', isCorrect: false, explanation: 'Non, le seuil est plus élevé' },
              { text: '1 mg/cm²', isCorrect: true, explanation: 'Exact ! Au-delà de 1 mg/cm², le plomb est considéré présent' },
              { text: '2 mg/cm²', isCorrect: false, explanation: 'Non, le seuil est plus bas' },
              { text: '5 mg/cm²', isCorrect: false, explanation: 'Non, le seuil est beaucoup plus bas' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ===== ÉLECTRICITÉ =====
      {
        title: 'Électricité - Diagnostic de base',
        description: 'Les essentiels du diagnostic électrique',
        themeSlug: 'electricite',
        difficulty: 'debutant',
        questions: [
          {
            text: 'Pour quels biens l\'état de l\'installation électrique est-il obligatoire ?',
            explanation: 'Le diagnostic électrique concerne les installations anciennes',
            choices: [
              { text: 'Installations de plus de 10 ans', isCorrect: false, explanation: 'Non, c\'est pour les installations plus anciennes' },
              { text: 'Installations de plus de 15 ans', isCorrect: true, explanation: 'Exact ! Pour les installations de plus de 15 ans' },
              { text: 'Installations de plus de 20 ans', isCorrect: false, explanation: 'Non, le seuil est à 15 ans' },
              { text: 'Toutes les installations', isCorrect: false, explanation: 'Non, seulement celles de plus de 15 ans' }
            ]
          },
          {
            text: 'Quelle est la durée de validité du diagnostic électrique ?',
            explanation: 'Le diagnostic électrique est valable pendant une période limitée',
            choices: [
              { text: '3 ans', isCorrect: true, explanation: 'Exact ! 3 ans pour la vente comme pour la location' },
              { text: '6 ans', isCorrect: false, explanation: 'Non, c\'est 3 ans' },
              { text: '10 ans', isCorrect: false, explanation: 'Non, c\'est 3 ans' },
              { text: '1 an', isCorrect: false, explanation: 'Non, c\'est plus long, 3 ans' }
            ]
          },
          {
            text: 'Que vérifie le diagnostic électrique ?',
            explanation: 'Le diagnostic porte sur la sécurité de l\'installation',
            choices: [
              { text: 'La consommation électrique', isCorrect: false, explanation: 'Non, c\'est le DPE qui mesure la consommation' },
              { text: 'La conformité et la sécurité de l\'installation', isCorrect: true, explanation: 'Exact ! Il vérifie la sécurité selon la norme NFC 15-100' },
              { text: 'Le prix de l\'électricité', isCorrect: false, explanation: 'Non, ce n\'est pas l\'objet du diagnostic' },
              { text: 'L\'âge des appareils électriques', isCorrect: false, explanation: 'Non, il concerne l\'installation fixe' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ===== GAZ =====
      {
        title: 'Gaz - État de l\'installation',
        description: 'Quiz sur le diagnostic gaz',
        themeSlug: 'gaz',
        difficulty: 'debutant',
        questions: [
          {
            text: 'Pour quelles installations le diagnostic gaz est-il obligatoire ?',
            explanation: 'Le diagnostic gaz concerne les installations anciennes',
            choices: [
              { text: 'Installations de plus de 10 ans', isCorrect: false, explanation: 'Non, c\'est pour les installations plus anciennes' },
              { text: 'Installations de plus de 15 ans', isCorrect: true, explanation: 'Exact ! Pour les installations de plus de 15 ans' },
              { text: 'Installations de plus de 20 ans', isCorrect: false, explanation: 'Non, le seuil est à 15 ans' },
              { text: 'Toutes les installations', isCorrect: false, explanation: 'Non, seulement celles de plus de 15 ans' }
            ]
          },
          {
            text: 'Quelle est la durée de validité du diagnostic gaz ?',
            explanation: 'Le diagnostic gaz a la même validité que l\'électricité',
            choices: [
              { text: '1 an', isCorrect: false, explanation: 'Non, c\'est plus long' },
              { text: '3 ans', isCorrect: true, explanation: 'Exact ! 3 ans pour la vente comme pour la location' },
              { text: '6 ans', isCorrect: false, explanation: 'Non, c\'est 3 ans' },
              { text: '10 ans', isCorrect: false, explanation: 'Non, c\'est 3 ans' }
            ]
          },
          {
            text: 'Que vérifie principalement le diagnostic gaz ?',
            explanation: 'Le diagnostic porte sur la sécurité de l\'installation',
            choices: [
              { text: 'Le prix du gaz', isCorrect: false, explanation: 'Non, ce n\'est pas l\'objet du diagnostic' },
              { text: 'La consommation de gaz', isCorrect: false, explanation: 'Non, c\'est le DPE qui mesure la consommation' },
              { text: 'L\'étanchéité et la sécurité de l\'installation', isCorrect: true, explanation: 'Exact ! Il vérifie l\'étanchéité, la ventilation, la combustion' },
              { text: 'L\'âge de la chaudière', isCorrect: false, explanation: 'Non, ce n\'est qu\'un aspect parmi d\'autres' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ===== TERMITES =====
      {
        title: 'Termites - État parasitaire',
        description: 'Les bases du diagnostic termites',
        themeSlug: 'termites',
        difficulty: 'debutant',
        questions: [
          {
            text: 'Où le diagnostic termites est-il obligatoire ?',
            explanation: 'L\'obligation dépend de la localisation du bien',
            choices: [
              { text: 'Partout en France', isCorrect: false, explanation: 'Non, seulement dans certaines zones' },
              { text: 'Seulement dans le Sud', isCorrect: false, explanation: 'Non, pas uniquement dans le Sud' },
              { text: 'Dans les zones déclarées par arrêté préfectoral', isCorrect: true, explanation: 'Exact ! Obligatoire dans les zones à risque définies par arrêté' },
              { text: 'Uniquement pour les maisons en bois', isCorrect: false, explanation: 'Non, pour tous les types de construction en zone à risque' }
            ]
          },
          {
            text: 'Quelle est la durée de validité du diagnostic termites ?',
            explanation: 'Le diagnostic termites a la durée de validité la plus courte',
            choices: [
              { text: '3 mois', isCorrect: false, explanation: 'Non, c\'est un peu plus long' },
              { text: '6 mois', isCorrect: true, explanation: 'Exact ! C\'est la durée la plus courte de tous les diagnostics' },
              { text: '1 an', isCorrect: false, explanation: 'Non, c\'est plus court' },
              { text: '3 ans', isCorrect: false, explanation: 'Non, c\'est beaucoup plus court' }
            ]
          },
          {
            text: 'Que recherche le diagnostiqueur lors de l\'état parasitaire ?',
            explanation: 'Le diagnostic porte sur plusieurs parasites',
            choices: [
              { text: 'Uniquement les termites', isCorrect: false, explanation: 'Non, il peut chercher d\'autres parasites' },
              { text: 'Termites, mérule, capricornes et autres insectes xylophages', isCorrect: true, explanation: 'Exact ! L\'état parasitaire est plus complet que juste les termites' },
              { text: 'Seulement les insectes volants', isCorrect: false, explanation: 'Non, les termites ne volent pas (sauf reproduction)' },
              { text: 'Les rongeurs', isCorrect: false, explanation: 'Non, ce n\'est pas l\'objet du diagnostic' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ===== ASSAINISSEMENT =====
      {
        title: 'Assainissement - Les bases',
        description: 'Comprendre le diagnostic assainissement non collectif',
        themeSlug: 'assainissement',
        difficulty: 'debutant',
        questions: [
          {
            text: 'Quand le diagnostic assainissement est-il obligatoire ?',
            explanation: 'Ce diagnostic concerne les installations individuelles',
            choices: [
              { text: 'Pour tous les biens', isCorrect: false, explanation: 'Non, seulement pour certains cas' },
              { text: 'Pour les biens non raccordés au tout-à-l\'égout', isCorrect: true, explanation: 'Exact ! Obligatoire pour l\'assainissement non collectif' },
              { text: 'Uniquement en zone rurale', isCorrect: false, explanation: 'Non, partout où il n\'y a pas de raccordement collectif' },
              { text: 'Jamais obligatoire', isCorrect: false, explanation: 'Non, c\'est obligatoire dans certains cas' }
            ]
          },
          {
            text: 'Quelle est la durée de validité du diagnostic assainissement ?',
            explanation: 'Le diagnostic doit être récent',
            choices: [
              { text: '6 mois', isCorrect: false, explanation: 'Non, c\'est plus long' },
              { text: '1 an', isCorrect: false, explanation: 'Non, c\'est plus long' },
              { text: '3 ans', isCorrect: true, explanation: 'Exact ! Le diagnostic assainissement est valable 3 ans' },
              { text: 'Illimité', isCorrect: false, explanation: 'Non, il a une durée limitée' }
            ]
          },
          {
            text: 'Qui réalise le diagnostic assainissement non collectif ?',
            explanation: 'Ce diagnostic a une particularité',
            choices: [
              { text: 'Un diagnostiqueur certifié', isCorrect: false, explanation: 'Non, c\'est une exception' },
              { text: 'Le SPANC (Service Public d\'Assainissement Non Collectif)', isCorrect: true, explanation: 'Exact ! C\'est le service public qui le réalise' },
              { text: 'Un plombier', isCorrect: false, explanation: 'Non, c\'est une mission de service public' },
              { text: 'Le propriétaire lui-même', isCorrect: false, explanation: 'Non, il doit être fait par le SPANC' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ===== ERP (État des Risques) =====
      {
        title: 'ERP - État des Risques et Pollutions',
        description: 'Quiz sur l\'État des Risques et Pollutions',
        themeSlug: 'erp',
        difficulty: 'debutant',
        questions: [
          {
            text: 'Que signifie ERP ?',
            explanation: 'L\'ERP a remplacé l\'ERNMT en 2018',
            choices: [
              { text: 'État des Risques Parasitaires', isCorrect: false, explanation: 'Non, ce n\'est pas lié aux parasites' },
              { text: 'État des Risques et Pollutions', isCorrect: true, explanation: 'Exact ! Il informe sur les risques naturels, miniers, technologiques et pollutions' },
              { text: 'Étude de Risques Préventifs', isCorrect: false, explanation: 'Non, ce n\'est pas le bon terme' },
              { text: 'État de Réparation du Patrimoine', isCorrect: false, explanation: 'Non, ce n\'est pas ça' }
            ]
          },
          {
            text: 'Quelle est la durée de validité de l\'ERP ?',
            explanation: 'L\'ERP doit être très récent',
            choices: [
              { text: '1 mois', isCorrect: false, explanation: 'Non, c\'est un peu plus long' },
              { text: '3 mois', isCorrect: false, explanation: 'Non, c\'est plus long' },
              { text: '6 mois', isCorrect: true, explanation: 'Exact ! L\'ERP doit avoir moins de 6 mois' },
              { text: '1 an', isCorrect: false, explanation: 'Non, c\'est plus court' }
            ]
          },
          {
            text: 'Quels risques sont mentionnés dans l\'ERP ?',
            explanation: 'L\'ERP couvre plusieurs types de risques',
            choices: [
              { text: 'Uniquement les inondations', isCorrect: false, explanation: 'Non, il couvre plus de risques' },
              { text: 'Risques naturels, miniers, technologiques, sismiques, radon, pollutions', isCorrect: true, explanation: 'Exact ! L\'ERP est très complet' },
              { text: 'Seulement les risques technologiques', isCorrect: false, explanation: 'Non, il y a beaucoup d\'autres risques' },
              { text: 'Les risques électriques', isCorrect: false, explanation: 'Non, ce n\'est pas l\'objet de l\'ERP' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Quiz Expert DPE
      {
        title: 'DPE Expert - Calculs et normes',
        description: 'Quiz avancé sur les calculs du DPE',
        themeSlug: 'dpe',
        difficulty: 'expert',
        questions: [
          {
            text: 'Quelle méthode de calcul est utilisée pour le DPE depuis 2021 ?',
            explanation: 'Le nouveau DPE utilise une méthode unique et plus fiable',
            choices: [
              { text: 'Méthode 3CL-DPE', isCorrect: true, explanation: 'Exact ! La méthode 3CL-DPE est la seule méthode depuis 2021' },
              { text: 'Méthode sur factures', isCorrect: false, explanation: 'Non, cette méthode n\'est plus autorisée depuis 2021' },
              { text: 'Méthode TH-BCE', isCorrect: false, explanation: 'Non, cette méthode est pour la RT 2012, pas le DPE' },
              { text: 'Méthode libre', isCorrect: false, explanation: 'Non, la méthode est strictement encadrée' }
            ]
          },
          {
            text: 'Quelle surface est prise en compte dans le DPE ?',
            explanation: 'La surface de référence est importante pour le calcul',
            choices: [
              { text: 'Surface habitable', isCorrect: false, explanation: 'Non, ce n\'est pas la surface habitable' },
              { text: 'Surface utile', isCorrect: false, explanation: 'Non, ce n\'est pas celle-ci' },
              { text: 'Surface thermique (Shab RT)', isCorrect: true, explanation: 'Exact ! C\'est la surface habitable au sens RT (hors parties < 1,80m)' },
              { text: 'Surface Carrez', isCorrect: false, explanation: 'Non, la surface Carrez est différente' }
            ]
          },
          {
            text: 'Quel est le seuil d\'émissions de GES pour une classe A en climat ?',
            explanation: 'Le DPE a deux étiquettes : énergie et climat (GES)',
            choices: [
              { text: 'Moins de 5 kg CO₂/m²/an', isCorrect: false, explanation: 'Non, c\'est un peu plus' },
              { text: 'Moins de 6 kg CO₂/m²/an', isCorrect: true, explanation: 'Exact ! Classe A climat : moins de 6 kg CO₂eq/m²/an' },
              { text: 'Moins de 11 kg CO₂/m²/an', isCorrect: false, explanation: 'Non, c\'est le seuil de la classe B' },
              { text: 'Moins de 20 kg CO₂/m²/an', isCorrect: false, explanation: 'Non, c\'est trop élevé pour la classe A' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Quiz Expert Électricité
      {
        title: 'Électricité Expert - Norme NFC 15-100',
        description: 'Quiz technique sur la norme électrique',
        themeSlug: 'electricite',
        difficulty: 'expert',
        questions: [
          {
            text: 'Que signifie l\'indice IP dans une salle de bain ?',
            explanation: 'L\'indice IP définit la protection contre l\'eau et les solides',
            choices: [
              { text: 'Indice de Puissance', isCorrect: false, explanation: 'Non, IP signifie autre chose' },
              { text: 'Indice de Protection', isCorrect: true, explanation: 'Exact ! IP = Indice de Protection contre l\'eau et les corps solides' },
              { text: 'Installation Protégée', isCorrect: false, explanation: 'Non, ce n\'est pas le bon terme' },
              { text: 'Isolation Parfaite', isCorrect: false, explanation: 'Non, ce n\'est pas ça' }
            ]
          },
          {
            text: 'Quel est le volume de sécurité le plus strict dans une salle de bain ?',
            explanation: 'Les salles de bain sont divisées en volumes de sécurité',
            choices: [
              { text: 'Volume 0', isCorrect: true, explanation: 'Exact ! Volume 0 = intérieur baignoire/douche (matériel 12V max)' },
              { text: 'Volume 1', isCorrect: false, explanation: 'Non, le volume 0 est plus strict' },
              { text: 'Volume 2', isCorrect: false, explanation: 'Non, le volume 0 est le plus strict' },
              { text: 'Volume 3', isCorrect: false, explanation: 'Non, le volume 0 est le plus restrictif' }
            ]
          },
          {
            text: 'Quel est le nombre minimum de prises par chambre selon la NFC 15-100 ?',
            explanation: 'La norme impose un nombre minimum de prises par pièce',
            choices: [
              { text: '1 prise', isCorrect: false, explanation: 'Non, c\'est insuffisant' },
              { text: '3 prises', isCorrect: true, explanation: 'Exact ! Minimum 3 prises par chambre' },
              { text: '5 prises', isCorrect: false, explanation: 'Non, c\'est le nombre pour le séjour' },
              { text: '6 prises', isCorrect: false, explanation: 'Non, c\'est trop pour une chambre' }
            ]
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Vérifier les quiz existants
    const existingQuizzes = await db.collection('quizzes').find({}).toArray();
    const existingQuizTitles = existingQuizzes.map(q => q.title);
    
    const quizzesToAdd = quizzes.filter(quiz => !existingQuizTitles.includes(quiz.title));
    
    if (quizzesToAdd.length > 0) {
      await db.collection('quizzes').insertMany(quizzesToAdd);
      console.log(`✅ ${quizzesToAdd.length} nouveaux quiz créés:`);
      
      // Grouper par thème pour l'affichage
      const quizByTheme = {};
      quizzesToAdd.forEach(quiz => {
        if (!quizByTheme[quiz.themeSlug]) {
          quizByTheme[quiz.themeSlug] = [];
        }
        quizByTheme[quiz.themeSlug].push(quiz.title);
      });
      
      Object.keys(quizByTheme).forEach(themeSlug => {
        console.log(`\n   📚 ${themeSlug.toUpperCase()}:`);
        quizByTheme[themeSlug].forEach(title => {
          console.log(`      - ${title}`);
        });
      });
    } else {
      console.log('✅ Tous les quiz existent déjà');
    }
    
    // ========================================
    // 3. RÉSUMÉ FINAL
    // ========================================
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CRÉATION TERMINÉE AVEC SUCCÈS !');
    console.log('='.repeat(60));
    
    const finalThemes = await db.collection('themes').find({}).toArray();
    const finalQuizzes = await db.collection('quizzes').find({}).toArray();
    
    console.log(`\n📊 STATISTIQUES FINALES:`);
    console.log(`   ✓ Nombre total de thèmes : ${finalThemes.length}`);
    console.log(`   ✓ Nombre total de quiz : ${finalQuizzes.length}`);
    
    console.log(`\n📋 DÉTAIL PAR THÈME:`);
    for (const theme of finalThemes) {
      const themeQuizCount = finalQuizzes.filter(q => q.themeSlug === theme.slug).length;
      console.log(`   • ${theme.name} (${theme.slug}) : ${themeQuizCount} quiz`);
    }
    
    console.log(`\n🌐 Vous pouvez maintenant tester sur http://localhost:3000`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Exécution du script
if (require.main === module) {
  createThemesAndQuizzes()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { createThemesAndQuizzes };

