const mongoose = require('mongoose');

async function setupQuests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag');
    console.log('Connecté à MongoDB');

    // Supprimer les quêtes existantes
    await mongoose.connection.db.collection('quests').deleteMany({});
    console.log('Anciennes quêtes supprimées');

    const quests = [
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
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Termine 3 quiz',
        description: 'Complète 3 quiz',
        icon: '📖',
        isActive: true,
        criteria: {
          type: 'quiz_completed',
          value: 3
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Termine 4 quiz',
        description: 'Complète 4 quiz',
        icon: '📘',
        isActive: true,
        criteria: {
          type: 'quiz_completed',
          value: 4
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Termine 5 quiz',
        description: 'Complète 5 quiz',
        icon: '📗',
        isActive: true,
        criteria: {
          type: 'quiz_completed',
          value: 5
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Quête de reprise de leçon
      {
        title: 'Reprends une leçon',
        description: 'Reprends une leçon en cours',
        icon: '🔄',
        isActive: true,
        criteria: {
          type: 'lesson_resumed',
          value: 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Quête de quiz sur erreurs
      {
        title: 'Quiz sur tes erreurs',
        description: 'Fais un quiz sur tes erreurs',
        icon: '🔍',
        isActive: true,
        criteria: {
          type: 'error_quiz',
          value: 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Quêtes de questions répondues
      {
        title: 'Réponds à 20 questions',
        description: 'Réponds correctement à 20 questions',
        icon: '❓',
        isActive: true,
        criteria: {
          type: 'questions_answered',
          value: 20
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Réponds à 40 questions',
        description: 'Réponds correctement à 40 questions',
        icon: '❔',
        isActive: true,
        criteria: {
          type: 'questions_answered',
          value: 40
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Quête de badge
      {
        title: 'Débloque 1 badge',
        description: 'Débloque ton premier badge',
        icon: '🏆',
        isActive: true,
        criteria: {
          type: 'badge_unlocked',
          value: 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Quêtes de score minimum
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
            minScore: 80,
            lessonCount: 4
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Quêtes de bonnes réponses d'affilée dans les leçons
      {
        title: 'Donne 5 bonnes réponses d\'affilée dans 3 leçons',
        description: 'Maintiens 5 bonnes réponses consécutives dans 3 leçons différentes',
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
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Donne 5 bonnes réponses d\'affilée dans 4 leçons',
        description: 'Maintiens 5 bonnes réponses consécutives dans 4 leçons différentes',
        icon: '⚡',
        isActive: true,
        criteria: {
          type: 'correct_streak',
          value: 4,
          additionalData: {
            streakCount: 5,
            lessonCount: 4
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Quête spéciale de 10 réponses d'affilée
      {
        title: 'Répondre correctement à 10 questions d\'affilée',
        description: 'Donne 10 bonnes réponses consécutives dans une session',
        icon: '🎖️',
        isActive: true,
        criteria: {
          type: 'correct_streak',
          value: 10
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Créer toutes les quêtes
    const result = await mongoose.connection.db.collection('quests').insertMany(quests);
    console.log(`${result.insertedCount} quêtes créées avec succès`);

    // Afficher les quêtes créées
    quests.forEach(quest => {
      console.log(`- ${quest.title} (${quest.icon})`);
    });

  } catch (error) {
    console.error('Erreur lors de la création des quêtes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

// Exécuter le script
setupQuests();
