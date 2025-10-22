const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function setupSaphirUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connecté à MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const divisionsCollection = db.collection('divisions');
    const weeklyrankingsCollection = db.collection('weeklyrankings');
    
    // Trouver l'utilisateur saphir5@test.com
    const user = await usersCollection.findOne({ email: 'saphir5@test.com' });
    
    if (!user) {
      console.log('Utilisateur saphir5@test.com non trouvé');
      return;
    }
    
    console.log(`Utilisateur trouvé: ${user.email}`);
    
    // Mettre à jour les points de l'utilisateur
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { points: 1500 } } // Points pour être dans une division
    );
    
    console.log('Points mis à jour: 1500');
    
    // Trouver une division appropriée
    const division = await divisionsCollection.findOne({
      minPoints: { $lte: 1500 },
      $or: [
        { maxPoints: { $gte: 1500 } },
        { maxPoints: { $exists: false } }
      ]
    });
    
    if (!division) {
      console.log('Aucune division trouvée');
      return;
    }
    
    console.log(`Division trouvée: ${division.name}`);
    
    // Calculer la semaine actuelle
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    
    // Calculer l'XP hebdomadaire total
    const attemptsCollection = db.collection('attempts');
    const startOfWeek = new Date(monday);
    const endOfWeek = new Date(monday);
    endOfWeek.setDate(monday.getDate() + 7);
    
    const attempts = await attemptsCollection.find({
      userId: user._id,
      createdAt: { $gte: startOfWeek, $lt: endOfWeek }
    }).toArray();
    
    const weeklyXP = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    
    console.log(`XP hebdomadaire calculé: ${weeklyXP}`);
    
    // Créer ou mettre à jour le classement hebdomadaire
    const existingRanking = await weeklyrankingsCollection.findOne({
      weekStart: monday,
      divisionId: division._id
    });
    
    if (existingRanking) {
      // Mettre à jour le classement existant
      const userRankingIndex = existingRanking.rankings.findIndex(
        (r) => r.userId.toString() === user._id.toString()
      );
      
      if (userRankingIndex >= 0) {
        existingRanking.rankings[userRankingIndex].weeklyXP = weeklyXP;
      } else {
        existingRanking.rankings.push({
          userId: user._id,
          weeklyXP: weeklyXP,
          rank: 0 // Sera calculé plus tard
        });
      }
      
      // Trier par XP et mettre à jour les rangs
      existingRanking.rankings.sort((a, b) => b.weeklyXP - a.weeklyXP);
      existingRanking.rankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
      });
      
      await weeklyrankingsCollection.updateOne(
        { _id: existingRanking._id },
        { $set: { rankings: existingRanking.rankings } }
      );
    } else {
      // Créer un nouveau classement
      await weeklyrankingsCollection.insertOne({
        weekStart: monday,
        divisionId: division._id,
        rankings: [{
          userId: user._id,
          weeklyXP: weeklyXP,
          rank: 1
        }]
      });
    }
    
    console.log('✅ Utilisateur saphir5@test.com configuré avec succès!');
    console.log(`Division: ${division.name}`);
    console.log(`XP hebdomadaire: ${weeklyXP}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await client.close();
  }
}

setupSaphirUser();
