const mongoose = require('mongoose');
require('dotenv').config();

// Modèles (simplifiés pour le script)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  points: { type: Number, default: 0 },
  customId: String
}, { timestamps: true });

const DivisionSchema = new mongoose.Schema({
  name: String,
  minPoints: Number,
  maxPoints: Number,
  color: String,
  order: Number,
  promotionThreshold: { type: Number, default: 5 },
  relegationThreshold: { type: Number, default: 5 }
}, { timestamps: true });

const WeeklyRankingSchema = new mongoose.Schema({
  weekStart: Date,
  weekEnd: Date,
  divisionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Division' },
  rankings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    points: Number,
    rank: Number,
    previousRank: Number,
    status: { type: String, enum: ['promoted', 'relegated', 'stayed', 'new'], default: 'new' }
  }],
  isProcessed: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Division = mongoose.models.Division || mongoose.model('Division', DivisionSchema);
const WeeklyRanking = mongoose.models.WeeklyRanking || mongoose.model('WeeklyRanking', WeeklyRankingSchema);

async function addQuickRankings() {
  try {
    console.log('🚀 Ajout rapide de classements...');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag');
    console.log('✅ Connecté à MongoDB');

    // Vérifier si les divisions existent
    let divisions = await Division.find({});
    if (divisions.length === 0) {
      console.log('🏆 Création des divisions...');
      const divisionData = [
        { name: 'Saphir', minPoints: 1000, maxPoints: null, color: '#3B82F6', order: 1 },
        { name: 'Or', minPoints: 500, maxPoints: 999, color: '#F59E0B', order: 2 },
        { name: 'Argent', minPoints: 150, maxPoints: 499, color: '#6B7280', order: 3 },
        { name: 'Bronze', minPoints: 10, maxPoints: 149, color: '#CD7F32', order: 4 }
      ];

      for (const data of divisionData) {
        const division = new Division(data);
        await division.save();
        divisions.push(division);
      }
      console.log('✅ Divisions créées');
    }

    // Récupérer tous les utilisateurs existants
    const users = await User.find({});
    console.log(`👥 ${users.length} utilisateurs trouvés`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Créez d\'abord des utilisateurs.');
      return;
    }

    // Mettre à jour les points des utilisateurs pour créer des divisions variées
    console.log('🎯 Attribution des points aux utilisateurs...');
    
    const pointRanges = [
      { min: 1000, max: 1200, division: 'Saphir' },
      { min: 500, max: 999, division: 'Or' },
      { min: 150, max: 499, division: 'Argent' },
      { min: 10, max: 149, division: 'Bronze' }
    ];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const range = pointRanges[i % pointRanges.length];
      const points = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      
      user.points = points;
      await user.save();
      console.log(`✅ ${user.name}: ${points} points (${range.division})`);
    }

    // Calculer la semaine actuelle
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    const startDate = monday;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    console.log(`📅 Création des classements pour la semaine du ${startDate.toISOString()}`);

    // Nettoyer les classements existants pour cette semaine
    await WeeklyRanking.deleteMany({ weekStart: startDate });

    // Créer les classements pour chaque division
    for (const division of divisions) {
      console.log(`\n📊 Classement pour la division ${division.name}...`);

      // Filtrer les utilisateurs selon la division
      let divisionUsers = users.filter(user => {
        if (division.maxPoints) {
          return user.points >= division.minPoints && user.points <= division.maxPoints;
        } else {
          return user.points >= division.minPoints;
        }
      });

      // Trier par points décroissants
      divisionUsers.sort((a, b) => b.points - a.points);

      if (divisionUsers.length === 0) {
        console.log(`⚠️ Aucun utilisateur dans la division ${division.name}`);
        continue;
      }

      // Créer les rankings
      const rankings = divisionUsers.map((user, index) => ({
        userId: user._id,
        username: user.name,
        points: user.points,
        rank: index + 1,
        status: 'new'
      }));

      // Créer le classement hebdomadaire
      const weeklyRanking = new WeeklyRanking({
        weekStart: startDate,
        weekEnd: endDate,
        divisionId: division._id,
        rankings: rankings,
        isProcessed: false
      });

      await weeklyRanking.save();
      console.log(`✅ Classement créé pour ${division.name} avec ${rankings.length} joueurs`);

      // Afficher le top 5
      console.log(`🏆 Top 5 de la division ${division.name}:`);
      rankings.slice(0, 5).forEach((ranking, index) => {
        console.log(`   ${index + 1}. ${ranking.username} - ${ranking.points} XP`);
      });
    }

    console.log('\n🎉 Classements créés avec succès !');
    console.log('🔗 Vous pouvez maintenant tester la page des ligues !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Exécuter le script
addQuickRankings();
