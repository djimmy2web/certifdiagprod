const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function setupTestUserData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connecté à MongoDB');
    
    const db = client.db();
    
    // Trouver l'utilisateur saphir5@test.com
    const user = await db.collection('users').findOne({ email: 'saphir5@test.com' });
    
    if (!user) {
      console.log('Utilisateur saphir5@test.com non trouvé');
      return;
    }
    
    console.log(`Utilisateur trouvé: ${user.name} (${user.email})`);
    
    const userId = user._id;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi de cette semaine
    startOfWeek.setHours(0, 0, 0, 0);
    
    // 1. Mettre à jour le streak (18 jours)
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { 
          streak: 18,
          lastActivityDate: new Date(today.getTime() - 24 * 60 * 60 * 1000) // Hier
        }
      }
    );
    console.log('✅ Streak mis à jour: 18 jours');
    
    // 2. Créer des tentatives (Attempts) pour générer des XP
    const attempts = [];
    const themes = ['electricite', 'amiante', 'plomb', 'dpe', 'audit-energetique', 'termites', 'gaz'];
    
    // Créer des tentatives pour les 7 derniers jours
    for (let i = 0; i < 7; i++) {
      const attemptDate = new Date(today);
      attemptDate.setDate(today.getDate() - i);
      attemptDate.setHours(10 + i, 0, 0, 0);
      
      const xpEarned = [16, 124, 71, 148, 24, 32, 0][i]; // XP par jour
      const quizCount = Math.floor(xpEarned / 20); // ~20 XP par quiz
      
      for (let j = 0; j < quizCount; j++) {
        attempts.push({
          userId: userId,
          quizId: new ObjectId(), // ID fictif
          themeSlug: themes[i % themes.length],
          score: Math.floor(Math.random() * 30) + 70, // Score entre 70-100
          totalQuestions: 10,
          correctAnswers: Math.floor(Math.random() * 4) + 7, // 7-10 bonnes réponses
          xpEarned: 20,
          completedAt: new Date(attemptDate.getTime() + j * 60000), // +1min par quiz
          createdAt: new Date(attemptDate.getTime() + j * 60000),
          updatedAt: new Date(attemptDate.getTime() + j * 60000)
        });
      }
    }
    
    if (attempts.length > 0) {
      await db.collection('attempts').insertMany(attempts);
      console.log(`✅ ${attempts.length} tentatives créées`);
    }
    
    // 3. Mettre à jour le totalScore de l'utilisateur
    const totalXP = attempts.reduce((sum, attempt) => sum + attempt.xpEarned, 0);
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { totalScore: totalXP } }
    );
    console.log(`✅ Total XP mis à jour: ${totalXP}`);
    
    // 4. Créer des erreurs récentes
    const recentErrors = [];
    const errorQuestions = [
      "Quelle est la tension nominale d'un circuit électrique domestique ?",
      "Quels sont les principaux risques liés à l'amiante ?",
      "Comment identifier la présence de plomb dans un logement ?",
      "Qu'est-ce que le DPE (Diagnostic de Performance Énergétique) ?",
      "Quels sont les objectifs d'un audit énergétique ?",
      "Comment détecter la présence de termites ?",
      "Quels sont les dangers du gaz naturel ?"
    ];
    
    for (let i = 0; i < 5; i++) {
      recentErrors.push({
        userId: userId,
        question: errorQuestions[i],
        theme: themes[i % themes.length],
        difficulty: ['debutant', 'intermediaire', 'expert'][i % 3],
        quizType: 'thematic',
        createdAt: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        updatedAt: new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      });
    }
    
    await db.collection('usererrors').insertMany(recentErrors);
    console.log(`✅ ${recentErrors.length} erreurs récentes créées`);
    
    // 5. Créer des quêtes du jour
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Compter les tentatives d'aujourd'hui
    const todayAttempts = await db.collection('attempts').countDocuments({
      userId: userId,
      completedAt: { $gte: todayStart, $lte: todayEnd }
    });
    
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
    
    // Sauvegarder les quêtes dans la base (optionnel)
    await db.collection('userquests').updateOne(
      { userId: userId, date: todayStart },
      { 
        $set: { 
          userId: userId,
          date: todayStart,
          quests: quests,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('✅ Quêtes du jour créées');
    
    // 6. Créer des données de progression par thème
    const themeProgress = [];
    for (const theme of themes) {
      const themeAttempts = attempts.filter(a => a.themeSlug === theme);
      const totalQuizzes = themeAttempts.length;
      const totalScore = themeAttempts.reduce((sum, a) => sum + a.score, 0);
      
      themeProgress.push({
        userId: userId,
        themeSlug: theme,
        currentLevel: totalQuizzes >= 5 ? 'expert' : totalQuizzes >= 3 ? 'intermediaire' : 'debutant',
        completedQuizzes: themeAttempts.map(a => ({
          quizId: a.quizId,
          score: a.score,
          totalQuestions: a.totalQuestions,
          completedAt: a.completedAt,
          difficulty: a.themeSlug
        })),
        totalScore: totalScore,
        totalQuizzesCompleted: totalQuizzes,
        lastActivityAt: new Date()
      });
    }
    
    await db.collection('themeprogress').insertMany(themeProgress);
    console.log(`✅ Progression par thème créée pour ${themes.length} thèmes`);
    
    // 7. Créer des données de division (Division Or, rang 12)
    await db.collection('userdivisions').updateOne(
      { userId: userId },
      {
        $set: {
          userId: userId,
          divisionName: 'Division Or',
          divisionColor: '#FFD700',
          rank: 12,
          weeklyXP: totalXP,
          seasonStart: new Date(startOfWeek),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('✅ Division créée: Division Or, rang 12');
    
    console.log('\n🎉 Données de test créées avec succès pour saphir5@test.com !');
    console.log(`📊 Résumé:`);
    console.log(`   - Streak: 18 jours`);
    console.log(`   - Total XP: ${totalXP}`);
    console.log(`   - Tentatives: ${attempts.length}`);
    console.log(`   - Erreurs récentes: ${recentErrors.length}`);
    console.log(`   - Division: Or (rang 12)`);
    console.log(`   - Thèmes: ${themes.length} avec progression`);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await client.close();
  }
}

// Fonction helper pour créer un ObjectId
function ObjectId() {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const objectId = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
    return Math.floor(Math.random() * 16).toString(16);
  }).toLowerCase();
  return objectId;
}

setupTestUserData();
