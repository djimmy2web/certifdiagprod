const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function debugWeeklyXP() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connecté à MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const attemptsCollection = db.collection('attempts');
    const weeklyrankingsCollection = db.collection('weeklyrankings');
    const divisionsCollection = db.collection('divisions');
    
    // Trouver l'utilisateur saphir5@test.com
    const user = await usersCollection.findOne({ email: 'saphir5@test.com' });
    
    if (!user) {
      console.log('Utilisateur saphir5@test.com non trouvé');
      return;
    }
    
    console.log(`Utilisateur trouvé: ${user.email} (ID: ${user._id})`);
    console.log(`Points: ${user.points}`);
    
    // Calculer la semaine actuelle
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    
    console.log(`Lundi de cette semaine: ${monday.toISOString()}`);
    
    // Vérifier les tentatives de cette semaine
    const startOfWeek = new Date(monday);
    const endOfWeek = new Date(monday);
    endOfWeek.setDate(monday.getDate() + 7);
    
    const attempts = await attemptsCollection.find({
      userId: user._id,
      createdAt: { $gte: startOfWeek, $lt: endOfWeek }
    }).toArray();
    
    console.log(`Tentatives trouvées: ${attempts.length}`);
    attempts.forEach(attempt => {
      console.log(`  - ${attempt.createdAt.toISOString()}: ${attempt.score} XP`);
    });
    
    const weeklyXP = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    console.log(`XP hebdomadaire total: ${weeklyXP}`);
    
    // Vérifier la division
    const divisions = await divisionsCollection.find({}).sort({ order: 1 }).toArray();
    console.log('Divisions disponibles:');
    divisions.forEach(div => {
      console.log(`  - ${div.name}: ${div.minPoints} - ${div.maxPoints || '∞'} points`);
    });
    
    const userDivision = divisions.find((div) => {
      if (div.maxPoints) {
        return user.points >= div.minPoints && user.points <= div.maxPoints;
      }
      return user.points >= div.minPoints;
    });
    
    console.log(`Division de l'utilisateur: ${userDivision ? userDivision.name : 'Aucune'}`);
    
    if (userDivision) {
      // Vérifier le classement hebdomadaire
      const weeklyRanking = await weeklyrankingsCollection.findOne({
        weekStart: monday,
        divisionId: userDivision._id
      });
      
      console.log(`Classement hebdomadaire trouvé: ${weeklyRanking ? 'Oui' : 'Non'}`);
      
      if (weeklyRanking) {
        console.log(`Nombre de participants: ${weeklyRanking.rankings.length}`);
        const userRanking = weeklyRanking.rankings.find(
          (r) => r.userId.toString() === user._id.toString()
        );
        
        if (userRanking) {
          console.log(`Rang de l'utilisateur: ${userRanking.rank}`);
          console.log(`XP de l'utilisateur dans le classement: ${userRanking.weeklyXP}`);
        } else {
          console.log('Utilisateur non trouvé dans le classement');
        }
      }
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await client.close();
  }
}

debugWeeklyXP();
