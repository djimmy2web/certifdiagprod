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

async function setupRankingsSimple() {
  try {
    console.log('🚀 Configuration simple des classements...');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag');
    console.log('✅ Connecté à MongoDB');

    // Vérifier si les divisions existent, sinon les créer
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
    } else {
      console.log(`✅ ${divisions.length} divisions trouvées`);
    }

    // Récupérer tous les utilisateurs existants
    let users = await User.find({});
    console.log(`👥 ${users.length} utilisateurs trouvés`);

    // Si pas d'utilisateurs, en créer quelques-uns
    if (users.length === 0) {
      console.log('👥 Création d\'utilisateurs de test...');
      const testUsers = [
        { name: 'Capitaine Vert', email: 'capitaine.vert@test.com', points: 850, customId: 'capitaine_vert' },
        { name: 'Horizon Perroquet', email: 'horizon.perroquet@test.com', points: 820, customId: 'horizon_perroquet' },
        { name: 'Kylian064', email: 'kylian064@test.com', points: 780, customId: 'kylian064' },
        { name: 'Stylo Delux', email: 'stylo.delux@test.com', points: 750, customId: 'stylo_delux' },
        { name: 'Ballon Eloigné', email: 'ballon.eloigne@test.com', points: 720, customId: 'ballon_eloigne' },
        { name: 'Moi', email: 'moi@test.com', points: 700, customId: 'moi' },
        { name: 'Manon789', email: 'manon789@test.com', points: 680, customId: 'manon789' },
        { name: 'DIAGQCM12', email: 'diagqcm12@test.com', points: 650, customId: 'diagqcm12' },
        { name: 'Joueur Argent 1', email: 'argent1@test.com', points: 400, customId: 'argent1' },
        { name: 'Joueur Argent 2', email: 'argent2@test.com', points: 380, customId: 'argent2' },
        { name: 'Joueur Bronze 1', email: 'bronze1@test.com', points: 120, customId: 'bronze1' },
        { name: 'Joueur Bronze 2', email: 'bronze2@test.com', points: 100, customId: 'bronze2' }
      ];

      for (const userData of testUsers) {
        const user = new User(userData);
        await user.save();
        users.push(user);
      }
      console.log(`✅ ${testUsers.length} utilisateurs de test créés`);
    }

    // Mettre à jour les points des utilisateurs existants pour avoir des divisions variées
    console.log('🎯 Mise à jour des points des utilisateurs...');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (user.points === 0 || !user.points) {
        // Attribution de points aléatoires selon l'index
        const pointRanges = [1000, 800, 600, 400, 200, 100];
        const basePoints = pointRanges[i % pointRanges.length];
        user.points = basePoints + Math.floor(Math.random() * 100);
        await user.save();
      }
      console.log(`✅ ${user.name}: ${user.points} points`);
    }

    // Calculer la semaine actuelle (lundi)
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
    console.log('🧹 Anciens classements supprimés');

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

    console.log('\n🎉 Configuration terminée !');
    console.log('🔗 Vous pouvez maintenant tester la page des ligues !');
    console.log('\n📝 Pour tester:');
    console.log('1. Allez sur /ligues');
    console.log('2. Connectez-vous avec un utilisateur existant');
    console.log('3. Vous devriez voir les classements par division');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Exécuter le script
setupRankingsSimple();
