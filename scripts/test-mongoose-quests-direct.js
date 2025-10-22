const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

// Modèle Quest
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

async function testMongooseQuests() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB via Mongoose');
    
    // Vérifier les quêtes actives
    const quests = await Quest.find({ isActive: true }).lean();
    console.log(`📊 ${quests.length} quêtes actives trouvées`);
    
    if (quests.length > 0) {
      console.log('\n📋 Premières quêtes:');
      quests.slice(0, 5).forEach(quest => {
        console.log(`   - ${quest.title} (${quest.criteria.type}: ${quest.criteria.value})`);
      });
      
      // Simuler l'API des quêtes
      console.log('\n🧪 Simulation de l\'API des quêtes...');
      
      const questResults = quests.map(quest => {
        return {
          id: quest._id.toString(),
          title: quest.title,
          description: quest.description,
          icon: quest.icon,
          progress: 0, // Simulation
          total: quest.criteria.value,
          completed: false, // Simulation
          type: quest.criteria.type
        };
      });
      
      console.log(`📡 Format API:`);
      console.log(`   Success: true`);
      console.log(`   Quêtes: ${questResults.length}`);
      
      if (questResults.length > 0) {
        console.log('\n📋 Premières quêtes formatées:');
        questResults.slice(0, 3).forEach(quest => {
          console.log(`   - ${quest.title} (${quest.progress}/${quest.total})`);
        });
      }
      
      console.log('\n✅ L\'API devrait fonctionner correctement !');
      console.log('💡 Le problème vient probablement de l\'API elle-même.');
      
    } else {
      console.log('❌ Aucune quête active trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testMongooseQuests();
