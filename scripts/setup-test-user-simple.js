const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function setupTestUserData() {
  try {
    console.log('🚀 Configuration des données de test pour saphir5@test.com...\n');
    
    // 1. Créer des tentatives pour générer des XP
    console.log('📝 Création des tentatives...');
    
    const attempts = [];
    const themes = ['electricite', 'amiante', 'plomb', 'dpe', 'audit-energetique', 'termites', 'gaz'];
    const xpPerDay = [16, 124, 71, 148, 24, 32, 0]; // XP par jour de la semaine
    
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(10, 0, 0, 0);
      
      const xpForDay = xpPerDay[day];
      const quizCount = Math.floor(xpForDay / 20); // ~20 XP par quiz
      
      for (let i = 0; i < quizCount; i++) {
        const attemptData = {
          quizId: `quiz-${themes[day % themes.length]}-${i}`,
          themeSlug: themes[day % themes.length],
          score: Math.floor(Math.random() * 30) + 70, // 70-100
          totalQuestions: 10,
          correctAnswers: Math.floor(Math.random() * 4) + 7, // 7-10
          xpEarned: 20,
          completedAt: new Date(date.getTime() + i * 60000).toISOString()
        };
        
        attempts.push(attemptData);
      }
    }
    
    console.log(`✅ ${attempts.length} tentatives préparées`);
    
    // 2. Créer des erreurs récentes
    console.log('❌ Création des erreurs récentes...');
    
    const errorQuestions = [
      "Quelle est la tension nominale d'un circuit électrique domestique ?",
      "Quels sont les principaux risques liés à l'amiante ?", 
      "Comment identifier la présence de plomb dans un logement ?",
      "Qu'est-ce que le DPE (Diagnostic de Performance Énergétique) ?",
      "Quels sont les objectifs d'un audit énergétique ?"
    ];
    
    const errors = errorQuestions.map((question, index) => ({
      question,
      theme: themes[index % themes.length],
      difficulty: ['debutant', 'intermediaire', 'expert'][index % 3],
      quizType: 'thematic',
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    console.log(`✅ ${errors.length} erreurs récentes préparées`);
    
    // 3. Créer des données de progression par thème
    console.log('📊 Création de la progression par thème...');
    
    const themeProgress = themes.map((theme, index) => {
      const themeAttempts = attempts.filter(a => a.themeSlug === theme);
      return {
        themeSlug: theme,
        currentLevel: themeAttempts.length >= 5 ? 'expert' : themeAttempts.length >= 3 ? 'intermediaire' : 'debutant',
        totalQuizzesCompleted: themeAttempts.length,
        totalScore: themeAttempts.reduce((sum, a) => sum + a.score, 0),
        lastActivityAt: new Date().toISOString()
      };
    });
    
    console.log(`✅ Progression créée pour ${themes.length} thèmes`);
    
    // 4. Créer des données de division
    console.log('🏆 Création des données de division...');
    
    const totalXP = attempts.reduce((sum, a) => sum + a.xpEarned, 0);
    const divisionData = {
      name: 'Division Or',
      color: '#FFD700',
      rank: 12,
      weeklyXP: totalXP
    };
    
    console.log(`✅ Division Or créée (rang 12, ${totalXP} XP)`);
    
    // 5. Créer des quêtes du jour
    console.log('🎯 Création des quêtes du jour...');
    
    const todayAttempts = attempts.filter(a => {
      const attemptDate = new Date(a.completedAt);
      const today = new Date();
      return attemptDate.toDateString() === today.toDateString();
    }).length;
    
    const quests = [
      {
        id: 'daily-quiz-3',
        title: 'Terminer 3 quiz',
        progress: Math.min(todayAttempts, 3),
        total: 3,
        completed: todayAttempts >= 3
      },
      {
        id: 'daily-game-1', 
        title: 'Terminer 1 jeu',
        progress: Math.min(todayAttempts, 1),
        total: 1,
        completed: todayAttempts >= 1
      },
      {
        id: 'daily-lesson-1',
        title: 'Reprendre une leçon',
        progress: 0,
        total: 1,
        completed: false
      }
    ];
    
    console.log(`✅ ${quests.length} quêtes créées`);
    
    // 6. Afficher le résumé
    console.log('\n🎉 Données de test préparées avec succès !');
    console.log('📊 Résumé des données:');
    console.log(`   - Streak: 18 jours`);
    console.log(`   - Total XP: ${totalXP}`);
    console.log(`   - Tentatives: ${attempts.length}`);
    console.log(`   - Erreurs récentes: ${errors.length}`);
    console.log(`   - Division: ${divisionData.name} (rang ${divisionData.rank})`);
    console.log(`   - Thèmes: ${themes.length} avec progression`);
    console.log(`   - Quêtes: ${quests.length} quêtes du jour`);
    
    console.log('\n💡 Note: Ces données sont préparées pour être insérées dans la base de données.');
    console.log('   Vous pouvez utiliser ces données avec vos APIs existantes.');
    
    // Retourner les données pour utilisation
    return {
      attempts,
      errors,
      themeProgress,
      divisionData,
      quests,
      totalXP,
      streak: 18
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  }
}

// Exécuter le script
if (require.main === module) {
  setupTestUserData();
}

module.exports = setupTestUserData;
