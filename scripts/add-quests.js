const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

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

async function addQuests() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Supprimer les anciennes quêtes
    const deleteResult = await Quest.deleteMany({});
    console.log(`🗑️  ${deleteResult.deletedCount} anciennes quêtes supprimées`);
    
    // Définir toutes les quêtes
    const allQuests = [
      // ========== QUÊTES XP ==========
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
      
      // ========== QUÊTES DE RÉPONSES D'AFFILÉE ==========
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
      
      // ========== QUÊTES DE QUIZ TERMINÉS ==========
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
      
      // ========== QUÊTES DE LEÇONS ==========
      {
        title: 'Reprends une leçon',
        description: 'Reprends une leçon en cours',
        icon: '🔄',
        isActive: true,
        criteria: {
          type: 'lesson_resumed',
          value: 1
        },
        reward: {
          xp: 20
        }
      },
      
      // ========== QUÊTES D'ERREURS ==========
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
      
      // ========== QUÊTES DE QUESTIONS ==========
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
        icon: '❔',
        isActive: true,
        criteria: {
          type: 'questions_answered',
          value: 40
        },
        reward: {
          xp: 50
        }
      },
      
      // ========== QUÊTES DE BADGES ==========
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
      
      // ========== QUÊTES DE SCORE ==========
      {
        title: 'Obtiens un score d\'au moins 80% dans 3 leçons',
        description: 'Réussis 3 leçons avec au moins 80% de bonnes réponses',
        icon: '🎯',
        isActive: true,
        criteria: {
          type: 'score_threshold',
          value: 3,
          additionalData: {
            minScore: 80,
            lessonCount: 3
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
            minScore: 80,
            lessonCount: 4
          }
        },
        reward: {
          xp: 60
        }
      },
      
      // ========== QUÊTES DE SÉRIES DANS LES LEÇONS ==========
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
      
      // ========== QUÊTE FINALE ==========
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
    console.log('🔄 Création des quêtes...');
    const createdQuests = await Quest.insertMany(allQuests);
    console.log(`✅ ${createdQuests.length} quêtes créées avec succès !`);
    
    // Vérifier les quêtes créées
    const quests = await Quest.find({ isActive: true }).lean();
    console.log(`\n📊 Total: ${quests.length} quêtes actives dans la base`);
    
    // Afficher un résumé par type
    console.log('\n📋 Résumé des quêtes par catégorie:');
    const questsByType = {
      'xp': quests.filter(q => q.criteria.type === 'xp').length,
      'correct_streak': quests.filter(q => q.criteria.type === 'correct_streak').length,
      'quiz_completed': quests.filter(q => q.criteria.type === 'quiz_completed').length,
      'questions_answered': quests.filter(q => q.criteria.type === 'questions_answered').length,
      'badge_unlocked': quests.filter(q => q.criteria.type === 'badge_unlocked').length,
      'score_threshold': quests.filter(q => q.criteria.type === 'score_threshold').length,
      'lesson_resumed': quests.filter(q => q.criteria.type === 'lesson_resumed').length,
      'error_quiz': quests.filter(q => q.criteria.type === 'error_quiz').length,
    };
    
    console.log(`   ⭐ Quêtes XP: ${questsByType.xp}`);
    console.log(`   🔥 Quêtes de réponses d'affilée: ${questsByType.correct_streak}`);
    console.log(`   📝 Quêtes de quiz terminés: ${questsByType.quiz_completed}`);
    console.log(`   ❓ Quêtes de questions: ${questsByType.questions_answered}`);
    console.log(`   🏅 Quêtes de badges: ${questsByType.badge_unlocked}`);
    console.log(`   🎯 Quêtes de score: ${questsByType.score_threshold}`);
    console.log(`   🔄 Quêtes de leçons: ${questsByType.lesson_resumed}`);
    console.log(`   🔍 Quêtes d'erreurs: ${questsByType.error_quiz}`);
    
    console.log('\n📝 Liste complète des quêtes:');
    quests.forEach((quest, index) => {
      console.log(`   ${index + 1}. ${quest.icon} ${quest.title} (${quest.criteria.type}: ${quest.criteria.value}) - Récompense: ${quest.reward?.xp || 0} XP`);
    });
    
    console.log('\n🎉 Système de quêtes configuré avec succès !');
    console.log('💡 Les quêtes sont maintenant disponibles dans votre application.');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des quêtes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

// Exécuter le script
addQuests();

