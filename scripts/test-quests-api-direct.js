const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function testQuestsAPIDirect() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Test direct de l\'API des quêtes...');
    
    // Simuler l'API /api/me/quests
    const user = await db.collection('users').findOne({});
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const userId = new ObjectId(user._id);
    console.log(`👤 Utilisateur: ${user.email || user.name} (${userId})`);
    
    // Récupérer toutes les quêtes actives
    const quests = await db.collection('quests').find({ isActive: true }).toArray();
    console.log(`📊 ${quests.length} quêtes actives trouvées`);
    
    // Récupérer la progression des quêtes pour cet utilisateur
    const questProgresses = await db.collection('questprogresses').find({ userId }).toArray();
    const progressMap = new Map(questProgresses.map(p => [p.questId.toString(), p]));
    console.log(`📈 ${questProgresses.length} progressions existantes`);
    
    // Récupérer les statistiques de l'utilisateur
    const totalAttempts = await db.collection('attempts').countDocuments({ userId });
    const totalQuestionsAnswered = await db.collection('attempts').aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: { $size: '$answers' } } } }
    ]).toArray();
    const totalQuestions = totalQuestionsAnswered[0]?.total || 0;
    
    const unlockedBadges = await db.collection('userbadges').countDocuments({ userId });
    
    console.log(`📊 Statistiques utilisateur:`);
    console.log(`   - Points: ${user.points || 0}`);
    console.log(`   - Tentatives: ${totalAttempts}`);
    console.log(`   - Questions répondues: ${totalQuestions}`);
    console.log(`   - Badges débloqués: ${unlockedBadges}`);
    
    // Simuler le calcul des quêtes comme dans l'API
    const questResults = [];
    
    for (const quest of quests) {
      const progress = progressMap.get(quest._id.toString());
      let currentProgress = 0;
      let isCompleted = false;
      
      if (progress) {
        currentProgress = progress.progress;
        isCompleted = progress.isCompleted;
      } else {
        // Calculer la progression actuelle selon le type de quête
        switch (quest.criteria.type) {
          case 'xp':
            currentProgress = user.points || 0;
            break;
          case 'quiz_completed':
            currentProgress = totalAttempts;
            break;
          case 'questions_answered':
            currentProgress = totalQuestions;
            break;
          case 'badge_unlocked':
            currentProgress = unlockedBadges;
            break;
          case 'lesson_resumed':
            const resumedLessons = await db.collection('quizprogresses').countDocuments({
              userId,
              isCompleted: false,
              isFailed: false
            });
            currentProgress = resumedLessons;
            break;
          case 'error_quiz':
            currentProgress = 0;
            break;
          case 'score_threshold':
            if (quest.criteria.additionalData?.minScore) {
              const highScoreAttempts = await db.collection('attempts').aggregate([
                { $match: { userId } },
                { $lookup: {
                  from: 'quizzes',
                  localField: 'quizId',
                  foreignField: '_id',
                  as: 'quiz'
                }},
                { $unwind: '$quiz' },
                { $addFields: {
                  scorePercentage: {
                    $multiply: [
                      { $divide: ['$score', { $size: '$quiz.questions' }] },
                      100
                    ]
                  }
                }},
                { $match: {
                  scorePercentage: { $gte: quest.criteria.additionalData.minScore }
                }},
                { $count: 'count' }
              ]).toArray();
              currentProgress = highScoreAttempts[0]?.count || 0;
            }
            break;
          case 'correct_streak':
            currentProgress = 0; // Simplifié pour l'instant
            break;
        }
        
        isCompleted = currentProgress >= quest.criteria.value;
      }
      
      questResults.push({
        id: quest._id.toString(),
        title: quest.title,
        description: quest.description,
        icon: quest.icon,
        progress: Math.min(currentProgress, quest.criteria.value),
        total: quest.criteria.value,
        completed: isCompleted,
        type: quest.criteria.type
      });
    }
    
    console.log(`\n📋 Résultats des quêtes (${questResults.length}):`);
    questResults.forEach(quest => {
      const status = quest.completed ? '✅' : '⏳';
      console.log(`   ${status} ${quest.title}: ${quest.progress}/${quest.total}`);
    });
    
    const completedCount = questResults.filter(q => q.completed).length;
    console.log(`\n🎉 ${completedCount}/${questResults.length} quêtes complétées`);
    
    // Vérifier si les quêtes sont bien formatées pour l'API
    const apiResponse = {
      success: true,
      quests: questResults
    };
    
    console.log(`\n📡 Format API:`);
    console.log(`   Success: ${apiResponse.success}`);
    console.log(`   Quêtes: ${apiResponse.quests.length}`);
    
    if (questResults.length === 0) {
      console.log('❌ PROBLÈME: Aucune quête retournée par l\'API !');
    } else {
      console.log('✅ L\'API devrait fonctionner correctement');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

testQuestsAPIDirect();
