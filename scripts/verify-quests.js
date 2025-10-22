const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function verifyQuests() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Vérification des quêtes...');
    
    // Vérifier les quêtes dans la collection quests
    const quests = await db.collection('quests').find({}).toArray();
    console.log(`📊 ${quests.length} quêtes dans la collection 'quests'`);
    
    // Vérifier les quêtes actives
    const activeQuests = await db.collection('quests').find({ isActive: true }).toArray();
    console.log(`✅ ${activeQuests.length} quêtes actives`);
    
    if (activeQuests.length > 0) {
      console.log('\n📋 Structure d\'une quête:');
      const sampleQuest = activeQuests[0];
      console.log(`   - ID: ${sampleQuest._id}`);
      console.log(`   - Title: ${sampleQuest.title}`);
      console.log(`   - Description: ${sampleQuest.description}`);
      console.log(`   - Icon: ${sampleQuest.icon}`);
      console.log(`   - IsActive: ${sampleQuest.isActive}`);
      console.log(`   - Criteria: ${JSON.stringify(sampleQuest.criteria)}`);
      console.log(`   - Reward: ${JSON.stringify(sampleQuest.reward)}`);
      console.log(`   - CreatedAt: ${sampleQuest.createdAt}`);
    }
    
    // Vérifier s'il y a des utilisateurs
    const users = await db.collection('users').find({}).limit(1).toArray();
    if (users.length > 0) {
      console.log(`\n👤 Utilisateur de test: ${users[0].email || users[0].name || 'Sans nom'}`);
      
      // Vérifier la progression des quêtes pour cet utilisateur
      const questProgress = await db.collection('questprogresses').find({ userId: users[0]._id }).toArray();
      console.log(`📈 Progression des quêtes: ${questProgress.length} entrées`);
      
      if (questProgress.length > 0) {
        console.log('\n📊 Progression:');
        questProgress.forEach(progress => {
          console.log(`   - Quest ID: ${progress.questId}, Progress: ${progress.progress}, Completed: ${progress.isCompleted}`);
        });
      }
    }
    
    // Vérifier les tentatives de l'utilisateur
    if (users.length > 0) {
      const attempts = await db.collection('attempts').find({ userId: users[0]._id }).toArray();
      console.log(`🎯 Tentatives de l'utilisateur: ${attempts.length}`);
      
      if (attempts.length > 0) {
        const totalQuestions = attempts.reduce((sum, attempt) => sum + (attempt.answers?.length || 0), 0);
        console.log(`❓ Total questions répondues: ${totalQuestions}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

verifyQuests();
