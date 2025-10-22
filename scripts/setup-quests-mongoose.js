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

async function setupQuestsMongoose() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB via Mongoose');
    
    // Supprimer les anciennes quêtes
    await Quest.deleteMany({});
    console.log('✅ Anciennes quêtes supprimées');
    
    // Créer toutes les quêtes
    const allQuests = [
      // Quêtes XP
      {
        title: 'Gagne 20 XP',
        description: 'Accumule 20 points d\'expérience',
        icon: '⭐',
        isActive: true,
        criteria: {
          type: 'xp',
          value: 20
        },
        reward: {
          xp: 10
        }
      },
      {
        title: 'Gagne 50 XP',
        description: 'Accumule 50 points d\'expérience',
        icon: '🌟',
        isActive: true,
        criteria: {
          type: 'xp',
          value: 50
        },
        reward: {
          xp: 25
        }
      },
      {
        title: 'Gagne 100 XP',
        description: 'Accumule 100 points d\'expérience',
        icon: '💫',
        isActive: true,
        criteria: {
          type: 'xp',
          value: 100
        },
        reward: {
          xp: 50
        }
      },
      
      // Quêtes de réponses d'affilée
      {
        title: '3 réponses d\'affilée',
        description: 'Donne 3 bonnes réponses consécutives',
        icon: '🔥',
        isActive: true,
        criteria: {
          type: 'correct_streak',
          value: 3
        },
        reward: {
          xp: 15
        }
      },
      {
        title: '5 réponses d\'affilée',
        description: 'Donne 5 bonnes réponses consécutives',
        icon: '⚡',
        isActive: true,
        criteria: {
          type: 'correct_streak',
          value: 5
        },
        reward: {
          xp: 25
        }
      },
      {
        title: '10 réponses d\'affilée',
        description: 'Donne 10 bonnes réponses consécutives',
        icon: '🎯',
        isActive: true,
        criteria: {
          type: 'correct_streak',
          value: 10
        },
        reward: {
          xp: 50
        }
      },
      
      // Quêtes de quiz terminés
      {
        title: 'Termine 1 quiz',
        description: 'Complète 1 quiz',
        icon: '📝',
        isActive: true,
        criteria: {
          type: 'quiz_completed',
          value: 1
        },
        reward: {
          xp: 10
        }
      },
      {
        title: 'Termine 2 quiz',
        description: 'Complète 2 quiz',
        icon: '📚',
        isActive: true,
        criteria: {
          type: 'quiz_completed',
          value: 2
        },
        reward: {
          xp: 20
        }
      },
      {
        title: 'Termine 3 quiz',
        description: 'Complète 3 quiz',
        icon: '🎯',
        isActive: true,
        criteria: {
          type: 'quiz_completed',
          value: 3
        },
        reward: {
          xp: 30
        }
      },
      {
        title: 'Termine 4 quiz',
        description: 'Complète 4 quiz',
        icon: '📖',
        isActive: true,
        criteria: {
          type: 'quiz_completed',
          value: 4
        },
        reward: {
          xp: 40
        }
      },
      {
        title: 'Termine 5 quiz',
        description: 'Complète 5 quiz',
        icon: '🏆',
        isActive: true,
        criteria: {
          type: 'quiz_completed',
          value: 5
        },
        reward: {
          xp: 50
        }
      },
      
      // Quêtes de leçons
      {
        title: 'Reprends une leçon',
        description: 'Reprends une leçon en cours',
        icon: '📚',
        isActive: true,
        criteria: {
          type: 'lesson_resumed',
          value: 1
        },
        reward: {
          xp: 20
        }
      },
      
      // Quêtes d'erreurs
      {
        title: 'Quiz sur tes erreurs',
        description: 'Fais un quiz sur tes erreurs récentes',
        icon: '🔍',
        isActive: true,
        criteria: {
          type: 'error_quiz',
          value: 1
        },
        reward: {
          xp: 30
        }
      },
      
      // Quêtes de questions
      {
        title: 'Réponds à 20 questions',
        description: 'Réponds à 20 questions au total',
        icon: '❓',
        isActive: true,
        criteria: {
          type: 'questions_answered',
          value: 20
        },
        reward: {
          xp: 25
        }
      },
      {
        title: 'Réponds à 40 questions',
        description: 'Réponds à 40 questions au total',
        icon: '❓',
        isActive: true,
        criteria: {
          type: 'questions_answered',
          value: 40
        },
        reward: {
          xp: 50
        }
      },
      
      // Quêtes de badges
      {
        title: 'Débloque 1 badge',
        description: 'Débloque ton premier badge',
        icon: '🏅',
        isActive: true,
        criteria: {
          type: 'badge_unlocked',
          value: 1
        },
        reward: {
          xp: 30
        }
      },
      
      // Quêtes de score
      {
        title: 'Obtiens un score d\'au moins 80% dans 3 leçons',
        description: 'Réussis 3 leçons avec au moins 80% de bonnes réponses',
        icon: '🎯',
        isActive: true,
        criteria: {
          type: 'score_threshold',
          value: 3,
          additionalData: {
            minScore: 80
          }
        },
        reward: {
          xp: 40
        }
      },
      {
        title: 'Obtiens un score d\'au moins 80% dans 4 leçons',
        description: 'Réussis 4 leçons avec au moins 80% de bonnes réponses',
        icon: '🎯',
        isActive: true,
        criteria: {
          type: 'score_threshold',
          value: 4,
          additionalData: {
            minScore: 80
          }
        },
        reward: {
          xp: 60
        }
      },
      
      // Quêtes de séries dans les leçons
      {
        title: 'Donne 5 bonnes réponses d\'affilée dans 3 leçons',
        description: 'Fais 5 bonnes réponses consécutives dans 3 leçons différentes',
        icon: '🔥',
        isActive: true,
        criteria: {
          type: 'correct_streak',
          value: 3,
          additionalData: {
            streakCount: 5,
            lessonCount: 3
          }
        },
        reward: {
          xp: 45
        }
      },
      {
        title: 'Donne 5 bonnes réponses d\'affilée dans 4 leçons',
        description: 'Fais 5 bonnes réponses consécutives dans 4 leçons différentes',
        icon: '🔥',
        isActive: true,
        criteria: {
          type: 'correct_streak',
          value: 4,
          additionalData: {
            streakCount: 5,
            lessonCount: 4
          }
        },
        reward: {
          xp: 60
        }
      },
      
      // Quête finale
      {
        title: 'Répondre correctement à 10 questions d\'affilée',
        description: 'Donne 10 bonnes réponses consécutives',
        icon: '💎',
        isActive: true,
        criteria: {
          type: 'correct_streak',
          value: 10
        },
        reward: {
          xp: 100
        }
      }
    ];
    
    // Créer les quêtes
    const createdQuests = await Quest.insertMany(allQuests);
    console.log(`✅ ${createdQuests.length} quêtes créées dans Mongoose`);
    
    // Vérifier les quêtes créées
    const quests = await Quest.find({ isActive: true }).lean();
    console.log(`📊 ${quests.length} quêtes actives dans la base`);
    
    if (quests.length > 0) {
      console.log('\n📋 Premières quêtes:');
      quests.slice(0, 5).forEach(quest => {
        console.log(`   - ${quest.title} (${quest.criteria.type}: ${quest.criteria.value})`);
      });
    }
    
    console.log('\n🎉 Quêtes configurées avec succès dans Mongoose !');
    console.log('💡 Les quêtes devraient maintenant s\'afficher dans l\'interface.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupQuestsMongoose();
