const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function testNewStreakLogic() {
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
    
    // Tester différents scénarios de streak
    const testScenarios = [
      { streak: 0, description: "Aucun streak" },
      { streak: 1, description: "1 jour de streak" },
      { streak: 3, description: "3 jours de streak" },
      { streak: 5, description: "5 jours de streak" },
      { streak: 7, description: "7 jours de streak (semaine complète)" }
    ];
    
    for (const scenario of testScenarios) {
      console.log(`\n📊 ${scenario.description} (streak = ${scenario.streak}):`);
      
      // Simuler la nouvelle logique
      const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
      
      if (scenario.streak === 0) {
        console.log('   - Tous les jours en gris (pas de barre orange)');
        console.log('   - Aucune icône');
      } else {
        console.log('   - Barre orange visible');
        console.log('   - Flammes groupées au début, puis croix');
        
        const streakData = days.map((day, index) => {
          let status = "pending";
          let color = "bg-[#e8f3ff]";
          let textColor = "text-[#868686]";
          
          if (index < scenario.streak) {
            status = "completed";
            color = "bg-[#ffdfc4]";
            textColor = "text-[#ff7f00]";
          } else {
            status = "failed";
            color = "bg-[#e8f3ff]";
            textColor = "text-[#868686]";
          }
          
          return { day, status, color, textColor };
        });
        
        console.log('   - Détail des jours:');
        streakData.forEach((day, index) => {
          const icon = day.status === "completed" ? "🔥" : day.status === "failed" ? "❌" : "⚪";
          const color = day.status === "completed" ? "orange" : "gris";
          console.log(`     ${day.day}: ${icon} (${color})`);
        });
        
        // Afficher la logique de regroupement
        const flameDays = streakData.filter(d => d.status === "completed");
        const crossDays = streakData.filter(d => d.status === "failed");
        
        console.log(`   - Flammes groupées: ${flameDays.length} jours (${flameDays.map(d => d.day).join(', ')})`);
        console.log(`   - Croix après: ${crossDays.length} jours (${crossDays.map(d => d.day).join(', ')})`);
      }
    }
    
    // Mettre à jour le streak à 3 pour un test visuel
    console.log('\n🔧 Mise à jour du streak à 3 jours pour test visuel...');
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { streak: 3 } }
    );
    console.log('✅ Streak mis à jour à 3 jours');
    console.log('🌐 Rafraîchissez la page pour voir le résultat !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

testNewStreakLogic();
