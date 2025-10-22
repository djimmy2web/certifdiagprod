const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function testStatsAPI() {
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
    
    console.log(`✅ Utilisateur trouvé: ${user.name || user.email} (ID: ${user._id})`);
    
    // Simuler le calcul de l'API /api/stats/me
    const userId = new ObjectId(user._id);
    const now = new Date();
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - 29); // 30 jours
    start.setUTCHours(0, 0, 0, 0);
    
    console.log(`📅 Période: ${start.toISOString()} à ${now.toISOString()}`);
    
    // 1) Totaux et moyenne
    const totalsAgg = await db.collection('attempts').aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          totalScore: { $sum: "$score" },
        },
      },
    ]).toArray();
    
    const totalAttempts = totalsAgg[0]?.totalAttempts ?? 0;
    const totalScore = totalsAgg[0]?.totalScore ?? 0;
    const avgScore = totalAttempts ? Math.round((totalScore / totalAttempts) * 100) / 100 : 0;
    
    console.log(`📊 Totaux: ${totalAttempts} tentatives, ${totalScore} points, moyenne: ${avgScore}`);
    
    // 2) Tentatives par jour
    const dailyAgg = await db.collection('attempts').aggregate([
      { $match: { userId, createdAt: { $gte: start } } },
      { $group: { _id: { $dateTrunc: { date: "$createdAt", unit: "day" } }, attempts: { $sum: 1 }, score: { $sum: "$score" } } },
      { $sort: { _id: 1 } },
    ]).toArray();
    
    const attemptsByDay = dailyAgg.map((d) => ({ day: d._id, attempts: d.attempts, score: d.score }));
    console.log(`📅 ${attemptsByDay.length} jours avec activité`);
    
    // 3) Streak (jours consécutifs avec au moins 1 tentative jusqu'à aujourd'hui)
    const daysSet = new Set(attemptsByDay.map((d) => new Date(d.day).toISOString().slice(0, 10)));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const ref = new Date(now);
      ref.setUTCDate(ref.getUTCDate() - i);
      const key = ref.toISOString().slice(0, 10);
      if (i === 0 && !daysSet.has(key)) break; // si pas d'activité aujourd'hui, streak = 0
      if (daysSet.has(key)) streak += 1; else break;
    }
    
    console.log(`🔥 Streak calculé: ${streak} jours`);
    console.log(`📅 Jours avec activité:`, Array.from(daysSet).sort().reverse().slice(0, 10));
    
    // 4) Vérifier les tentatives récentes
    const recentAttempts = await db.collection('attempts').find({ userId }).sort({ createdAt: -1 }).limit(10).toArray();
    console.log(`\n📝 10 dernières tentatives:`);
    recentAttempts.forEach((attempt, index) => {
      console.log(`   ${index + 1}. ${attempt.createdAt.toISOString().split('T')[0]} - Score: ${attempt.score} - XP: ${attempt.xpEarned}`);
    });
    
    // Résumé final
    console.log(`\n🎯 Résumé final:`);
    console.log(`   - Total tentatives: ${totalAttempts}`);
    console.log(`   - Total score: ${totalScore}`);
    console.log(`   - Streak: ${streak} jours`);
    console.log(`   - Moyenne: ${avgScore}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

testStatsAPI();
