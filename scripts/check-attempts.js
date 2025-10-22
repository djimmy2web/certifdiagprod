const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function checkAttempts() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔌 Connecté à MongoDB');
    
    const db = client.db();
    
    // Vérifier les tentatives pour saphir5@test.com
    const user = await db.collection('users').findOne({ email: 'saphir5@test.com' });
    
    if (!user) {
      console.log('❌ Utilisateur saphir5@test.com non trouvé');
      return;
    }
    
    const attempts = await db.collection('attempts').find({ userId: user._id }).toArray();
    console.log(`📊 ${attempts.length} tentatives trouvées pour saphir5@test.com`);
    
    if (attempts.length > 0) {
      attempts.forEach((attempt, index) => {
        console.log(`   ${index + 1}. ${attempt.themeSlug} - Score: ${attempt.score} - XP: ${attempt.xpEarned} - Date: ${attempt.completedAt}`);
      });
    }
    
    // Vérifier les erreurs
    const errors = await db.collection('usererrors').find({ userId: user._id }).toArray();
    console.log(`\n❌ ${errors.length} erreurs trouvées`);
    
    // Vérifier la division
    const division = await db.collection('userdivisions').findOne({ userId: user._id });
    console.log(`\n🏆 Division: ${division ? division.divisionName : 'Aucune'}`);
    
    // Vérifier les quêtes
    const quests = await db.collection('userquests').find({ userId: user._id }).toArray();
    console.log(`\n🎯 ${quests.length} quêtes trouvées`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

checkAttempts();
