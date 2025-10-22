const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function setupStreak3WithCross() {
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
    
    // Créer un streak de 3 jours consécutifs
    const attempts = [];
    const today = new Date();
    
    // Créer des tentatives pour 3 jours consécutifs
    for (let day = 0; day < 3; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() - day);
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
    console.log(`✅ ${attempts.length} tentatives créées pour 3 jours de streak`);
    
    // Mettre à jour le streak à 3 jours
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { streak: 3 } }
    );
    console.log('✅ Streak mis à jour à 3 jours');
    
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
    
    console.log(`🔥 Streak calculé par l'API: ${user.streak} jours`);
    console.log(`📅 Jours avec activité:`, Array.from(daysSet).sort().reverse().slice(0, 5));
    
    console.log('\n🎯 Résultat attendu:');
    console.log('   - L, M, M : Flammes orange avec ovale orange (3 jours)');
    console.log('   - J : Croix (jour manqué)');
    console.log('   - V, S, D : Ronds gris');
    
    console.log('\n🌐 Rafraîchissez la page pour voir le changement !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

setupStreak3WithCross();
