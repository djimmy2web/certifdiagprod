const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function testStreakDesign() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔌 Connecté à MongoDB');
    
    const db = client.db();
    
    // Trouver l'utilisateur saphir5@test.com
    const user = await db.collection('users').findOne({ email: 'saphir5@test.com' });
    
    if (!user) {
      console.log('❌ Utilisateur saphir5@test.com non trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.name || user.email}`);
    console.log(`🔥 Streak actuel: ${user.streak || 0} jours`);
    
    // Tester différents niveaux de streak
    const testStreaks = [0, 1, 2, 3, 5, 7];
    
    for (const testStreak of testStreaks) {
      console.log(`\n📊 Test avec streak = ${testStreak} jours:`);
      
      // Simuler la logique de generateStreakData
      const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
      
      if (testStreak < 2) {
        console.log('   - Aucun rond orange (streak < 2)');
        console.log('   - Tous les jours en gris');
      } else {
        console.log('   - Ronds orange affichés');
        console.log('   - Flammes pour les jours actifs, croix pour les autres');
        
        const streakData = days.map((day, index) => {
          let status = "pending";
          let color = "bg-[#e8f3ff]";
          let textColor = "text-[#868686]";
          
          if (index < testStreak) {
            status = "completed";
            color = "bg-[#ffdfc4]";
            textColor = "text-[#ff7f00]";
          } else if (index < 7) {
            status = "failed";
            color = "bg-[#e8f3ff]";
            textColor = "text-[#868686]";
          }
          
          return { day, status, color, textColor };
        });
        
        console.log('   - Détail des jours:');
        streakData.forEach((day, index) => {
          const icon = day.status === "completed" ? "🔥" : day.status === "failed" ? "❌" : "⚪";
          console.log(`     ${day.day}: ${icon} (${day.status})`);
        });
      }
    }
    
    // Optionnel: Mettre à jour le streak à 5 pour tester
    console.log('\n🔧 Mise à jour du streak à 5 jours pour test...');
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { streak: 5 } }
    );
    console.log('✅ Streak mis à jour à 5 jours');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

testStreakDesign();
