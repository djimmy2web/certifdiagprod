const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function checkUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔌 Connecté à MongoDB');
    
    const db = client.db();
    
    // Vérifier tous les utilisateurs
    const users = await db.collection('users').find({}).toArray();
    console.log(`📊 ${users.length} utilisateurs trouvés:`);
    
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name || 'Pas de nom'}) - Streak: ${user.streak || 0}, XP: ${user.totalScore || 0}`);
    });
    
    // Vérifier spécifiquement saphir5@test.com
    const targetUser = await db.collection('users').findOne({ email: 'saphir5@test.com' });
    
    if (targetUser) {
      console.log(`\n✅ Utilisateur saphir5@test.com trouvé:`);
      console.log(`   - ID: ${targetUser._id}`);
      console.log(`   - Nom: ${targetUser.name || 'Pas de nom'}`);
      console.log(`   - Streak: ${targetUser.streak || 0}`);
      console.log(`   - Total Score: ${targetUser.totalScore || 0}`);
      console.log(`   - Dernière activité: ${targetUser.lastActivityDate || 'Pas définie'}`);
    } else {
      console.log('\n❌ Utilisateur saphir5@test.com non trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

checkUser();
