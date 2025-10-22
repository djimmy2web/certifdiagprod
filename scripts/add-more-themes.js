const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function addMoreThemes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Ajout de thématiques supplémentaires...\n');
    
    // Vérifier les thématiques existantes
    const existingThemes = await db.collection('themes').find({}).toArray();
    console.log(`📊 Thématiques existantes: ${existingThemes.length}`);
    
    const newThemes = [
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
    
    // Filtrer les thématiques qui n'existent pas déjà
    const themesToAdd = newThemes.filter(newTheme => 
      !existingThemes.some(existing => existing.slug === newTheme.slug)
    );
    
    if (themesToAdd.length > 0) {
      const result = await db.collection('themes').insertMany(themesToAdd);
      console.log(`✅ ${result.insertedCount} nouvelles thématiques ajoutées`);
      
      themesToAdd.forEach((theme, index) => {
        console.log(`   ${index + 1}. ${theme.name} (${theme.slug})`);
      });
    } else {
      console.log('✅ Toutes les thématiques existent déjà');
    }
    
    // Ajouter des quiz pour chaque thématique
    console.log('\n🔍 Ajout de quiz...');
    
    const allThemes = await db.collection('themes').find({}).toArray();
    const existingQuizzes = await db.collection('quizzes').find({}).toArray();
    
    console.log(`📊 Quiz existants: ${existingQuizzes.length}`);
    
    const newQuizzes = [];
    
    allThemes.forEach(theme => {
      // Vérifier si des quiz existent déjà pour ce thème
      const themeQuizzes = existingQuizzes.filter(q => q.themeSlug === theme.slug);
      
      if (themeQuizzes.length === 0) {
        // Créer 3 quiz par thème
        for (let i = 1; i <= 3; i++) {
          newQuizzes.push({
            title: `Quiz ${theme.name} - Niveau ${i}`,
            description: `Quiz de test pour ${theme.name} - Niveau ${i}`,
            themeSlug: theme.slug,
            difficulty: i === 1 ? 'debutant' : i === 2 ? 'apprenti' : 'expert',
            questions: [
              {
                text: `Quelle est la question principale pour ${theme.name}?`,
                choices: [
                  { text: 'Réponse A', isCorrect: true },
                  { text: 'Réponse B', isCorrect: false },
                  { text: 'Réponse C', isCorrect: false },
                  { text: 'Réponse D', isCorrect: false }
                ],
                explanation: `Explication pour ${theme.name}`
              },
              {
                text: `Quelle est la deuxième question pour ${theme.name}?`,
                choices: [
                  { text: 'Réponse A', isCorrect: false },
                  { text: 'Réponse B', isCorrect: true },
                  { text: 'Réponse C', isCorrect: false },
                  { text: 'Réponse D', isCorrect: false }
                ],
                explanation: `Explication pour ${theme.name}`
              }
            ],
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    });
    
    if (newQuizzes.length > 0) {
      const quizResult = await db.collection('quizzes').insertMany(newQuizzes);
      console.log(`✅ ${quizResult.insertedCount} nouveaux quiz ajoutés`);
    } else {
      console.log('✅ Tous les quiz existent déjà');
    }
    
    // Afficher le résumé final
    const finalThemes = await db.collection('themes').find({}).toArray();
    const finalQuizzes = await db.collection('quizzes').find({}).toArray();
    
    console.log('\n🎉 Configuration terminée !');
    console.log(`📊 Résumé final:`);
    console.log(`   - Thématiques: ${finalThemes.length}`);
    console.log(`   - Quiz: ${finalQuizzes.length}`);
    console.log('🌐 Vous pouvez maintenant visiter http://localhost:3000 pour voir les données');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

// Exécuter le script
if (require.main === module) {
  addMoreThemes();
}

module.exports = { addMoreThemes };
