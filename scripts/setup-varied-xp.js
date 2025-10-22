const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function setupVariedXP() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connecté à MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const attemptsCollection = db.collection('attempts');
    
    // Trouver l'utilisateur saphir5@test.com
    const user = await usersCollection.findOne({ email: 'saphir5@test.com' });
    
    if (!user) {
      console.log('Aucun utilisateur de test trouvé');
      return;
    }
    
    console.log(`Utilisateur trouvé: ${user.email}`);
    
    // Créer des données XP variées pour la semaine
    const weeklyData = [
      { day: 'L', xp: 15, isHighest: false },  // Rouge (< 30)
      { day: 'M', xp: 85, isHighest: false },  // Bleu clair
      { day: 'M', xp: 45, isHighest: false },  // Bleu clair
      { day: 'J', xp: 120, isHighest: true },  // Vert (le plus haut)
      { day: 'V', xp: 25, isHighest: false },  // Rouge (< 30)
      { day: 'S', xp: 60, isHighest: false },  // Bleu (samedi)
      { day: 'D', xp: 0, isHighest: false }    // Gris (pas d'XP)
    ];
    
    // Calculer la semaine actuelle
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Supprimer les anciennes tentatives de cette semaine
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    await attemptsCollection.deleteMany({
      userId: user._id,
      createdAt: { $gte: startOfWeek, $lt: endOfWeek }
    });
    
    // Créer des tentatives pour chaque jour avec XP
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      currentDate.setHours(12, 0, 0, 0); // Midi
      
      const dayData = weeklyData[i];
      
      if (dayData.xp > 0) {
        // Créer une tentative avec le score correspondant à l'XP
        await attemptsCollection.insertOne({
          userId: user._id,
          quizId: new ObjectId(), // ID fictif
          score: dayData.xp,
          totalQuestions: 10,
          correctAnswers: Math.min(10, Math.ceil(dayData.xp / 10)),
          createdAt: currentDate,
          updatedAt: currentDate
        });
      }
    }
    
    console.log('Données XP variées ajoutées:');
    weeklyData.forEach(day => {
      let color = 'Gris';
      if (day.isHighest) color = 'Vert';
      else if (day.xp < 30) color = 'Rouge';
      else if (day.day === 'S') color = 'Bleu';
      else color = 'Bleu clair';
      
      console.log(`  ${day.day}: ${day.xp} XP (${color})`);
    });
    
    console.log('✅ Données XP variées configurées avec succès!');
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await client.close();
  }
}

setupVariedXP();
