const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function setupSimpleTestData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔌 Connecté à MongoDB');
    
    const db = client.db();
    
    // Trouver l'utilisateur saphir5@test.com
    const user = await db.collection('users').findOne({ email: 'saphir5@test.com' });
    
    if (!user) {
      console.log('❌ Utilisateur saphir5@test.com non trouvé');
      console.log('💡 Créez d\'abord l\'utilisateur ou vérifiez l\'email');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.name || user.email}`);
    const userId = user._id;
    
    // 1. Mettre à jour le streak et le totalScore
    const totalXP = 415;
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { 
          streak: 18,
          totalScore: totalXP,
          lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Hier
        }
      }
    );
    console.log('✅ Streak et XP mis à jour: 18 jours, 415 XP');
    
    // 2. Créer des tentatives simples pour générer des XP
    const attempts = [];
    const xpPerDay = [16, 124, 71, 148, 24, 32, 0]; // XP par jour de la semaine
    
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(10, 0, 0, 0);
      
      const xpForDay = xpPerDay[day];
      const quizCount = Math.floor(xpForDay / 20); // ~20 XP par quiz
      
      for (let i = 0; i < quizCount; i++) {
        attempts.push({
          userId: userId,
          quizId: new ObjectId(),
          themeSlug: 'general', // Thème générique
          score: Math.floor(Math.random() * 30) + 70,
          totalQuestions: 10,
          correctAnswers: Math.floor(Math.random() * 4) + 7,
          xpEarned: 20,
          completedAt: new Date(date.getTime() + i * 60000),
          createdAt: new Date(date.getTime() + i * 60000),
          updatedAt: new Date(date.getTime() + i * 60000)
        });
      }
      
      if (quizCount > 0) {
        console.log(`   Jour ${day + 1}: ${quizCount} quiz (${xpForDay} XP)`);
      }
    }
    
    if (attempts.length > 0) {
      await db.collection('attempts').insertMany(attempts);
      console.log(`✅ ${attempts.length} tentatives créées`);
    }
    
    // 3. Créer des erreurs récentes simples
    const errorQuestions = [
      "Question de test 1",
      "Question de test 2", 
      "Question de test 3",
      "Question de test 4",
      "Question de test 5"
    ];
    
    const errors = errorQuestions.map((question, index) => ({
      userId: userId,
      question,
      theme: 'general',
      difficulty: 'debutant',
      quizType: 'thematic',
      category: 'general',
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
    }));
    
    await db.collection('usererrors').insertMany(errors);
    console.log(`✅ ${errors.length} erreurs récentes créées`);
    
    // 4. Créer les données de division
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    await db.collection('userdivisions').updateOne(
      { userId: userId },
      {
        $set: {
          userId: userId,
          divisionName: 'Division Or',
          divisionColor: '#FFD700',
          rank: 12,
          weeklyXP: totalXP,
          seasonStart: startOfWeek,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('✅ Division créée: Division Or (rang 12)');
    
    // 5. Créer les quêtes du jour
    const todayAttempts = attempts.filter(a => {
      const attemptDate = new Date(a.completedAt);
      const today = new Date();
      return attemptDate.toDateString() === today.toDateString();
    }).length;
    
    const quests = [
      {
        id: 'daily-quiz-3',
        title: 'Terminer 3 quiz',
        progress: Math.min(todayAttempts, 3),
        total: 3,
        completed: todayAttempts >= 3,
        type: 'daily',
        xpReward: 50
      },
      {
        id: 'daily-game-1',
        title: 'Terminer 1 jeu',
        progress: Math.min(todayAttempts, 1),
        total: 1,
        completed: todayAttempts >= 1,
        type: 'daily',
        xpReward: 25
      },
      {
        id: 'daily-lesson-1',
        title: 'Reprendre une leçon',
        progress: 0,
        total: 1,
        completed: false,
        type: 'daily',
        xpReward: 30
      }
    ];
    
    await db.collection('userquests').updateOne(
      { userId: userId, date: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
      {
        $set: {
          userId: userId,
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          quests: quests,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('✅ Quêtes du jour créées');
    
    console.log('\n🎉 Données de test ajoutées avec succès !');
    console.log('📊 Résumé:');
    console.log(`   - Streak: 18 jours`);
    console.log(`   - Total XP: ${totalXP}`);
    console.log(`   - Tentatives: ${attempts.length}`);
    console.log(`   - Erreurs récentes: ${errors.length}`);
    console.log(`   - Division: Division Or (rang 12)`);
    console.log(`   - Quêtes: ${quests.length} quêtes du jour`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

setupSimpleTestData();
