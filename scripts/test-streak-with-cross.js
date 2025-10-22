const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function testStreakWithCross() {
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
    
    // Supprimer toutes les tentatives existantes
    await db.collection('attempts').deleteMany({ userId: user._id });
    console.log('🗑️ Anciennes tentatives supprimées');
    
    // Créer un streak de 2 jours, puis une croix (jour manqué), puis des jours gris
    const attempts = [];
    const today = new Date();
    
    // Jour 1 (hier) - avec activité
    const day1 = new Date(today);
    day1.setDate(today.getDate() - 1);
    day1.setHours(10, 0, 0, 0);
    
    // Jour 2 (avant-hier) - avec activité  
    const day2 = new Date(today);
    day2.setDate(today.getDate() - 2);
    day2.setHours(10, 0, 0, 0);
    
    // Créer des tentatives pour les 2 premiers jours seulement
    for (let day = 0; day < 2; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() - day - 1);
      date.setHours(10, 0, 0, 0);
      
      // 3 tentatives par jour
      for (let i = 0; i < 3; i++) {
        attempts.push({
          userId: user._id,
          quizId: new ObjectId(),
          themeSlug: 'general',
          score: Math.floor(Math.random() * 30) + 70,
          totalQuestions: 10,
          correctAnswers: Math.floor(Math.random() * 4) + 7,
          xpEarned: 20,
          completedAt: new Date(date.getTime() + i * 60000),
          createdAt: new Date(date.getTime() + i * 60000),
          updatedAt: new Date(date.getTime() + i * 60000)
        });
      }
    }
    
    // Insérer les tentatives
    await db.collection('attempts').insertMany(attempts);
    console.log(`✅ ${attempts.length} tentatives créées pour 2 jours de streak`);
    
    // Mettre à jour le streak à 2 jours
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { streak: 2 } }
    );
    console.log('✅ Streak mis à jour à 2 jours');
    
    // Vérifier le streak calculé
    const userId = new ObjectId(user._id);
    const now = new Date();
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - 29);
    start.setUTCHours(0, 0, 0, 0);
    
    const dailyAgg = await db.collection('attempts').aggregate([
      { $match: { userId, createdAt: { $gte: start } } },
      { $group: { _id: { $dateTrunc: { date: "$createdAt", unit: "day" } }, attempts: { $sum: 1 }, score: { $sum: "$score" } } },
      { $sort: { _id: 1 } },
    ]).toArray();
    
    const attemptsByDay = dailyAgg.map((d) => ({ day: d._id, attempts: d.attempts, score: d.score }));
    const daysSet = new Set(attemptsByDay.map((d) => new Date(d.day).toISOString().slice(0, 10)));
    
    let calculatedStreak = 0;
    for (let i = 0; i < 365; i++) {
      const ref = new Date(now);
      ref.setUTCDate(ref.getUTCDate() - i);
      const key = ref.toISOString().slice(0, 10);
      if (i === 0 && !daysSet.has(key)) break;
      if (daysSet.has(key)) calculatedStreak += 1; else break;
    }
    
    console.log(`🔥 Streak calculé par l'API: ${calculatedStreak} jours`);
    console.log(`📅 Jours avec activité:`, Array.from(daysSet).sort().reverse().slice(0, 5));
    
    console.log('\n🎯 Résultat attendu:');
    console.log('   - L, M : Flammes orange avec ovale orange');
    console.log('   - M : Croix (jour manqué)');
    console.log('   - J, V, S, D : Ronds gris');
    
    console.log('\n🌐 Rafraîchissez la page pour voir le changement !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

testStreakWithCross();
