const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

// Modèles
const QuestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  criteria: {
    type: { 
      type: String, 
      enum: ['xp', 'streak', 'quiz_completed', 'questions_answered', 'badge_unlocked', 'score_threshold', 'correct_streak', 'lesson_resumed', 'error_quiz'],
      required: true 
    },
    value: { type: Number, required: true },
    additionalData: {
      minScore: { type: Number },
      lessonCount: { type: Number },
      streakCount: { type: Number }
    }
  },
  reward: {
    xp: { type: Number },
    badge: { type: mongoose.Schema.Types.ObjectId, ref: "Badge" }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const Quest = mongoose.models.Quest || mongoose.model('Quest', QuestSchema);

const QuestProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questId: { type: mongoose.Schema.Types.ObjectId, ref: "Quest", required: true },
  progress: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

const QuestProgress = mongoose.models.QuestProgress || mongoose.model('QuestProgress', QuestProgressSchema);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  points: { type: Number, default: 0 },
  // ... autres champs
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const AttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [{ 
    questionIndex: { type: Number },
    selectedChoice: { type: Number },
    isCorrect: { type: Boolean }
  }],
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Attempt = mongoose.models.Attempt || mongoose.model('Attempt', AttemptSchema);

const UserBadgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: "Badge", required: true },
  unlockedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const UserBadge = mongoose.models.UserBadge || mongoose.model('UserBadge', UserBadgeSchema);

async function testQuestsAPISimulation() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB via Mongoose');
    
    // Simuler l'API des quêtes
    console.log('🧪 Simulation de l\'API /api/me/quests...');
    
    // Trouver un utilisateur de test
    const user = await User.findOne({});
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const userId = user._id;
    console.log(`👤 Utilisateur: ${user.email || user.name} (${userId})`);
    
    // Récupérer toutes les quêtes actives
    const quests = await Quest.find({ isActive: true }).lean();
    console.log(`📊 ${quests.length} quêtes actives trouvées`);
    
    // Récupérer la progression des quêtes pour cet utilisateur
    const questProgresses = await QuestProgress.find({ userId }).lean();
    const progressMap = new Map(questProgresses.map(p => [p.questId.toString(), p]));
    console.log(`📈 ${questProgresses.length} progressions existantes`);
    
    // Récupérer les statistiques de l'utilisateur
    const totalAttempts = await Attempt.countDocuments({ userId });
    const totalQuestionsAnswered = await Attempt.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: { $size: '$answers' } } } }
    ]);
    const totalQuestions = totalQuestionsAnswered[0]?.total || 0;
    
    // Récupérer les badges débloqués
    const unlockedBadges = await UserBadge.countDocuments({ userId });
    
    console.log(`📊 Statistiques utilisateur:`);
    console.log(`   - Points: ${user.points || 0}`);
    console.log(`   - Tentatives: ${totalAttempts}`);
    console.log(`   - Questions répondues: ${totalQuestions}`);
    console.log(`   - Badges débloqués: ${unlockedBadges}`);
    
    // Calculer les quêtes
    const questResults = await Promise.all(quests.map(async (quest) => {
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
            currentProgress = 0; // Simplifié
            break;
          case 'error_quiz':
            currentProgress = 0;
            break;
          case 'score_threshold':
            currentProgress = 0; // Simplifié
            break;
          case 'correct_streak':
            currentProgress = 0; // Simplifié
            break;
        }
        
        isCompleted = currentProgress >= quest.criteria.value;
      }
      
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
    }));
    
    console.log(`\n📋 Résultats des quêtes (${questResults.length}):`);
    questResults.forEach(quest => {
      const status = quest.completed ? '✅' : '⏳';
      console.log(`   ${status} ${quest.title}: ${quest.progress}/${quest.total}`);
    });
    
    const completedCount = questResults.filter(q => q.completed).length;
    console.log(`\n🎉 ${completedCount}/${questResults.length} quêtes complétées`);
    
    // Vérifier le format de réponse
    const apiResponse = {
      success: true,
      quests: questResults
    };
    
    console.log(`\n📡 Format API:`);
    console.log(`   Success: ${apiResponse.success}`);
    console.log(`   Quêtes: ${apiResponse.quests.length}`);
    
    if (questResults.length === 0) {
      console.log('❌ PROBLÈME: Aucune quête retournée !');
    } else {
      console.log('✅ L\'API devrait fonctionner correctement');
      console.log('💡 Le problème vient peut-être de l\'authentification ou de la session');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testQuestsAPISimulation();
