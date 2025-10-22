const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function fixDates() {
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
    
    // Récupérer toutes les tentatives
    const attempts = await db.collection('attempts').find({ userId: user._id }).toArray();
    console.log(`📊 ${attempts.length} tentatives trouvées`);
    
    // Mettre à jour les dates pour créer un streak de 7 jours
    const today = new Date();
    const updates = [];
    
    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      const dayOffset = Math.floor(i / 5); // 5 tentatives par jour
      const newDate = new Date(today);
      newDate.setDate(today.getDate() - dayOffset);
      newDate.setHours(10 + (i % 5), 0, 0, 0); // 10h, 11h, 12h, 13h, 14h
      
      updates.push({
        updateOne: {
          filter: { _id: attempt._id },
          update: { 
            $set: { 
              createdAt: newDate,
              completedAt: newDate,
              updatedAt: newDate
            }
          }
        }
      });
    }
    
    // Exécuter les mises à jour par lots
    if (updates.length > 0) {
      await db.collection('attempts').bulkWrite(updates);
      console.log(`✅ ${updates.length} tentatives mises à jour`);
    }
    
    // Vérifier le nouveau streak
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
    
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const ref = new Date(now);
      ref.setUTCDate(ref.getUTCDate() - i);
      const key = ref.toISOString().slice(0, 10);
      if (i === 0 && !daysSet.has(key)) break;
      if (daysSet.has(key)) streak += 1; else break;
    }
    
    console.log(`🔥 Nouveau streak: ${streak} jours`);
    console.log(`📅 Jours avec activité:`, Array.from(daysSet).sort().reverse().slice(0, 10));
    
    // Mettre à jour le streak dans la collection users
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { streak: streak } }
    );
    console.log(`✅ Streak mis à jour dans la collection users: ${streak} jours`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

fixDates();
