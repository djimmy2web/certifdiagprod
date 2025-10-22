const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function testQuestsAPI() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Test de l\'API des quêtes...');
    
    // Vérifier les quêtes dans la base
    const quests = await db.collection('quests').find({}).toArray();
    console.log(`📊 ${quests.length} quêtes trouvées dans la base de données`);
    
    if (quests.length > 0) {
      console.log('\n📋 Premières quêtes :');
      quests.slice(0, 5).forEach(quest => {
        console.log(`   - ${quest.title} (${quest.criteria.type}: ${quest.criteria.value})`);
      });
    }
    
    // Vérifier s'il y a des utilisateurs
    const users = await db.collection('users').find({}).limit(1).toArray();
    if (users.length > 0) {
      console.log(`\n👤 Utilisateur trouvé: ${users[0].email || users[0].name || 'Sans nom'}`);
      
      // Tester l'API des quêtes pour cet utilisateur
      console.log('\n🧪 Test de l\'API /api/me/quests...');
      
      // Simuler une requête à l'API
      const userId = users[0]._id;
      console.log(`   User ID: ${userId}`);
      
      // Vérifier les quêtes actives
      const activeQuests = await db.collection('quests').find({ isActive: true }).toArray();
      console.log(`   Quêtes actives: ${activeQuests.length}`);
      
      // Vérifier la progression des quêtes
      const questProgress = await db.collection('questprogresses').find({ userId }).toArray();
      console.log(`   Progression des quêtes: ${questProgress.length}`);
      
    } else {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

testQuestsAPI();
