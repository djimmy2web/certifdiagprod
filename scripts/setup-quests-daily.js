const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function setupDailyQuests() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔧 Configuration des quêtes quotidiennes...');
    
    // Supprimer les anciennes quêtes
    await db.collection('quests').deleteMany({});
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insérer les quêtes
    await db.collection('quests').insertMany(allQuests);
    console.log(`✅ ${allQuests.length} quêtes créées`);
    
    console.log('\n🎉 Système de quêtes configuré avec succès !');
    console.log('📊 Quêtes créées :');
    allQuests.forEach(quest => {
      console.log(`   - ${quest.title} (${quest.criteria.value} ${quest.criteria.type})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

setupDailyQuests();
