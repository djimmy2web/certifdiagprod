const { MongoClient, ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

// Modèle Quest simplifié pour la migration
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

async function migrateQuestsToMongoose() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔄 Migration des quêtes vers Mongoose...');
    
    // Se connecter à Mongoose
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à Mongoose');
    
    // Supprimer les anciennes quêtes Mongoose
    await Quest.deleteMany({});
    console.log('✅ Anciennes quêtes Mongoose supprimées');
    
    // Récupérer les quêtes de la collection MongoDB
    const quests = await db.collection('quests').find({}).toArray();
    console.log(`📊 ${quests.length} quêtes trouvées dans MongoDB`);
    
    if (quests.length === 0) {
      console.log('❌ Aucune quête trouvée dans MongoDB');
      return;
    }
    
    // Migrer chaque quête
    const migratedQuests = [];
    for (const quest of quests) {
      const mongooseQuest = new Quest({
        title: quest.title,
        description: quest.description,
        icon: quest.icon,
        isActive: quest.isActive,
        criteria: {
          type: quest.criteria.type,
          value: quest.criteria.value,
          additionalData: quest.criteria.additionalData || {}
        },
        reward: quest.reward || {},
        createdAt: quest.createdAt || new Date(),
        updatedAt: quest.updatedAt || new Date()
      });
      
      await mongooseQuest.save();
      migratedQuests.push(mongooseQuest);
    }
    
    console.log(`✅ ${migratedQuests.length} quêtes migrées vers Mongoose`);
    
    // Vérifier la migration
    const mongooseQuests = await Quest.find({}).lean();
    console.log(`📋 ${mongooseQuests.length} quêtes dans Mongoose`);
    
    if (mongooseQuests.length > 0) {
      console.log('\n📋 Premières quêtes migrées:');
      mongooseQuests.slice(0, 3).forEach(quest => {
        console.log(`   - ${quest.title} (${quest.criteria.type}: ${quest.criteria.value})`);
      });
    }
    
    console.log('\n🎉 Migration terminée avec succès !');
    console.log('💡 Les quêtes devraient maintenant s\'afficher dans l\'interface.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await client.close();
    await mongoose.disconnect();
  }
}

migrateQuestsToMongoose();
