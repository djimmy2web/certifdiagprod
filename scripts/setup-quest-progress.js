const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function setupQuestProgress() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔧 Configuration de la progression des quêtes...');
    
    // Trouver un utilisateur
    const user = await db.collection('users').findOne({});
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    console.log(`👤 Utilisateur: ${user.email || user.name || 'Sans nom'}`);
    const userId = user._id;
    
    // Créer quelques tentatives pour simuler de l'activité
    const attempts = [
      {
        userId: userId,
        quizId: new ObjectId(),
        score: 3,
        totalQuestions: 5,
        answers: [
          { questionIndex: 0, selectedChoice: 0, isCorrect: true },
          { questionIndex: 1, selectedChoice: 1, isCorrect: true },
          { questionIndex: 2, selectedChoice: 0, isCorrect: true },
          { questionIndex: 3, selectedChoice: 2, isCorrect: false },
          { questionIndex: 4, selectedChoice: 1, isCorrect: true }
        ],
        completedAt: new Date(),
        createdAt: new Date()
      },
      {
        userId: userId,
        quizId: new ObjectId(),
        score: 4,
        totalQuestions: 5,
        answers: [
          { questionIndex: 0, selectedChoice: 1, isCorrect: true },
          { questionIndex: 1, selectedChoice: 0, isCorrect: true },
          { questionIndex: 2, selectedChoice: 2, isCorrect: true },
          { questionIndex: 3, selectedChoice: 1, isCorrect: true },
          { questionIndex: 4, selectedChoice: 0, isCorrect: false }
        ],
        completedAt: new Date(),
        createdAt: new Date()
      }
    ];
    
    // Insérer les tentatives
    await db.collection('attempts').insertMany(attempts);
    console.log(`✅ ${attempts.length} tentatives créées`);
    
    // Mettre à jour les points de l'utilisateur
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { points: 150 } } // 150 points pour déclencher certaines quêtes
    );
    console.log('✅ Points utilisateur mis à jour (150 XP)');
    
    // Créer une progression de quiz pour simuler des leçons reprises
    await db.collection('quizprogresses').insertOne({
      userId: userId,
      quizId: new ObjectId(),
      currentQuestionIndex: 2,
      isCompleted: false,
      isFailed: false,
      lastActivityAt: new Date(),
      createdAt: new Date()
    });
    console.log('✅ Progression de quiz créée');
    
    // Créer quelques badges pour l'utilisateur
    await db.collection('userbadges').insertOne({
      userId: userId,
      badgeId: new ObjectId(),
      unlockedAt: new Date(),
      createdAt: new Date()
    });
    console.log('✅ Badge utilisateur créé');
    
    console.log('\n🎉 Données de test configurées !');
    console.log('📊 Résumé:');
    console.log(`   - Tentatives: ${attempts.length}`);
    console.log(`   - Points: 150 XP`);
    console.log(`   - Leçons en cours: 1`);
    console.log(`   - Badges: 1`);
    console.log('\n💡 Les quêtes devraient maintenant s\'afficher avec de la progression !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

setupQuestProgress();
