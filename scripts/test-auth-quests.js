const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function testAuthQuests() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔐 Test de l\'authentification et des quêtes...');
    
    // Vérifier les sessions NextAuth
    const sessions = await db.collection('sessions').find({}).toArray();
    console.log(`🔑 Sessions actives: ${sessions.length}`);
    
    if (sessions.length > 0) {
      console.log('📋 Sessions trouvées:');
      sessions.forEach(session => {
        console.log(`   - User ID: ${session.userId}`);
        console.log(`   - Expires: ${session.expires}`);
        console.log(`   - Active: ${new Date() < new Date(session.expires)}`);
      });
    }
    
    // Vérifier les utilisateurs
    const users = await db.collection('users').find({}).toArray();
    console.log(`👥 Utilisateurs: ${users.length}`);
    
    if (users.length > 0) {
      const user = users[0];
      console.log(`👤 Premier utilisateur: ${user.email || user.name}`);
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Points: ${user.points || 0}`);
      
      // Tester l'API des quêtes pour cet utilisateur
      console.log('\n🧪 Test de l\'API des quêtes...');
      
      // Simuler l'authentification
      const userId = new ObjectId(user._id);
      
      // Vérifier les quêtes
      const quests = await db.collection('quests').find({ isActive: true }).toArray();
      console.log(`📊 Quêtes actives: ${quests.length}`);
      
      if (quests.length > 0) {
        console.log('\n📋 Premières quêtes:');
        quests.slice(0, 3).forEach(quest => {
          console.log(`   - ${quest.title} (${quest.criteria.type}: ${quest.criteria.value})`);
        });
        
        // Simuler le calcul de progression
        const totalAttempts = await db.collection('attempts').countDocuments({ userId });
        const totalQuestions = await db.collection('attempts').aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: { $size: '$answers' } } } }
        ]).toArray();
        const questionsAnswered = totalQuestions[0]?.total || 0;
        
        console.log(`\n📊 Progression calculée:`);
        console.log(`   - Tentatives: ${totalAttempts}`);
        console.log(`   - Questions: ${questionsAnswered}`);
        console.log(`   - Points: ${user.points || 0}`);
        
        // Créer quelques quêtes avec progression
        const questResults = quests.slice(0, 5).map(quest => {
          let progress = 0;
          switch (quest.criteria.type) {
            case 'xp':
              progress = Math.min(user.points || 0, quest.criteria.value);
              break;
            case 'quiz_completed':
              progress = Math.min(totalAttempts, quest.criteria.value);
              break;
            case 'questions_answered':
              progress = Math.min(questionsAnswered, quest.criteria.value);
              break;
            default:
              progress = 0;
          }
          
          return {
            id: quest._id.toString(),
            title: quest.title,
            description: quest.description,
            icon: quest.icon,
            progress: progress,
            total: quest.criteria.value,
            completed: progress >= quest.criteria.value,
            type: quest.criteria.type
          };
        });
        
        console.log(`\n🎯 Résultats des quêtes:`);
        questResults.forEach(quest => {
          const status = quest.completed ? '✅' : '⏳';
          console.log(`   ${status} ${quest.title}: ${quest.progress}/${quest.total}`);
        });
        
        console.log('\n✅ L\'API devrait retourner ces quêtes !');
        
      } else {
        console.log('❌ Aucune quête active trouvée');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

testAuthQuests();
