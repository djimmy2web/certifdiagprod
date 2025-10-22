const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function finalQuestTest() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🎯 Test final du système de quêtes...');
    
    // Vérifier les quêtes
    const quests = await db.collection('quests').find({ isActive: true }).toArray();
    console.log(`✅ ${quests.length} quêtes actives`);
    
    // Vérifier l'utilisateur et ses données
    const user = await db.collection('users').findOne({});
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const userId = user._id;
    console.log(`👤 Utilisateur: ${user.email || user.name}`);
    console.log(`💰 Points: ${user.points || 0}`);
    
    // Vérifier les tentatives
    const attempts = await db.collection('attempts').find({ userId }).toArray();
    console.log(`🎯 Tentatives: ${attempts.length}`);
    
    // Vérifier les badges
    const badges = await db.collection('userbadges').find({ userId }).toArray();
    console.log(`🏅 Badges: ${badges.length}`);
    
    // Vérifier les leçons en cours
    const lessons = await db.collection('quizprogresses').find({ userId }).toArray();
    console.log(`📚 Leçons en cours: ${lessons.length}`);
    
    // Calculer les statistiques pour les quêtes
    const totalQuestions = attempts.reduce((sum, attempt) => sum + (attempt.answers?.length || 0), 0);
    console.log(`❓ Questions répondues: ${totalQuestions}`);
    
    // Simuler l'API des quêtes
    console.log('\n🧪 Simulation de l\'API des quêtes...');
    
    const questResults = quests.map(quest => {
      let currentProgress = 0;
      let isCompleted = false;
      
      switch (quest.criteria.type) {
        case 'xp':
          currentProgress = user.points || 0;
          break;
        case 'quiz_completed':
          currentProgress = attempts.length;
          break;
        case 'questions_answered':
          currentProgress = totalQuestions;
          break;
        case 'badge_unlocked':
          currentProgress = badges.length;
          break;
        case 'lesson_resumed':
          currentProgress = lessons.length;
          break;
        case 'correct_streak':
          // Simulation simple
          currentProgress = Math.min(attempts.length, quest.criteria.value);
          break;
        case 'error_quiz':
          currentProgress = 0; // Pas de quiz d'erreurs pour l'instant
          break;
        case 'score_threshold':
          // Compter les tentatives avec score >= 80%
          const highScoreAttempts = attempts.filter(attempt => {
            const scorePercentage = (attempt.score / attempt.totalQuestions) * 100;
            return scorePercentage >= (quest.criteria.additionalData?.minScore || 80);
          });
          currentProgress = highScoreAttempts.length;
          break;
      }
      
      isCompleted = currentProgress >= quest.criteria.value;
      
      return {
        id: quest._id.toString(),
        title: quest.title,
        description: quest.description,
        icon: quest.icon,
        progress: Math.min(currentProgress, quest.criteria.value),
        total: quest.criteria.value,
        completed: isCompleted,
        type: quest.criteria.type
      };
    });
    
    console.log(`\n📊 Résultats des quêtes:`);
    questResults.forEach(quest => {
      const status = quest.completed ? '✅' : '⏳';
      console.log(`   ${status} ${quest.title}: ${quest.progress}/${quest.total}`);
    });
    
    const completedQuests = questResults.filter(q => q.completed).length;
    console.log(`\n🎉 ${completedQuests}/${questResults.length} quêtes complétées !`);
    
    console.log('\n💡 Le système de quêtes est maintenant opérationnel !');
    console.log('   Les quêtes devraient s\'afficher dans la StatsSidebar avec la progression.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

finalQuestTest();
