const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function checkThemes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Vérification des thématiques...\n');
    
    // Vérifier les thématiques existantes
    const themes = await db.collection('themes').find({}).toArray();
    console.log(`📊 Thématiques trouvées: ${themes.length}`);
    
    if (themes.length === 0) {
      console.log('⚠️  Aucune thématique trouvée. Création des thématiques par défaut...\n');
      
      const defaultThemes = [
        {
          name: 'Électricité',
          slug: 'electricite',
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
          name: 'DPE',
          slug: 'dpe',
          iconUrl: '/icone-thematique.png',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Audit Énergétique',
          slug: 'audit-energetique',
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
          name: 'Gaz',
          slug: 'gaz',
          iconUrl: '/icone-thematique.png',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const result = await db.collection('themes').insertMany(defaultThemes);
      console.log(`✅ ${result.insertedCount} thématiques créées`);
      
      // Afficher les thématiques créées
      defaultThemes.forEach((theme, index) => {
        console.log(`   ${index + 1}. ${theme.name} (${theme.slug})`);
      });
      
    } else {
      console.log('✅ Thématiques existantes:');
      themes.forEach((theme, index) => {
        console.log(`   ${index + 1}. ${theme.name} (${theme.slug}) - ${theme.isActive ? 'Actif' : 'Inactif'}`);
      });
    }
    
    // Vérifier les quiz
    console.log('\n🔍 Vérification des quiz...');
    const quizzes = await db.collection('quizzes').find({}).toArray();
    console.log(`📊 Quiz trouvés: ${quizzes.length}`);
    
    if (quizzes.length === 0) {
      console.log('⚠️  Aucun quiz trouvé. Création de quiz de test...\n');
      
      const testQuizzes = [];
      const themes = await db.collection('themes').find({}).toArray();
      
      themes.forEach(theme => {
        for (let i = 1; i <= 3; i++) {
          testQuizzes.push({
            title: `Quiz ${theme.name} - Niveau ${i}`,
            description: `Quiz de test pour ${theme.name}`,
            themeSlug: theme.slug,
            difficulty: i === 1 ? 'debutant' : i === 2 ? 'apprenti' : 'expert',
            questions: [
              {
                text: `Question de test pour ${theme.name}?`,
                choices: [
                  { text: 'Réponse A', isCorrect: true },
                  { text: 'Réponse B', isCorrect: false },
                  { text: 'Réponse C', isCorrect: false },
                  { text: 'Réponse D', isCorrect: false }
                ],
                explanation: 'Explication de la réponse'
              }
            ],
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
      
      const quizResult = await db.collection('quizzes').insertMany(testQuizzes);
      console.log(`✅ ${quizResult.insertedCount} quiz créés`);
      
    } else {
      console.log('✅ Quiz existants trouvés');
    }
    
    console.log('\n🎉 Vérification terminée !');
    console.log('🌐 Vous pouvez maintenant visiter http://localhost:3000 pour voir les données');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

// Exécuter le script
if (require.main === module) {
  checkThemes();
}

module.exports = { checkThemes };
