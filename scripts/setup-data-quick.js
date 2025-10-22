const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
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

async function setupDataQuick() {
  try {
    console.log('🚀 Configuration rapide des données...');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag');
    console.log('✅ Connecté à MongoDB');

    // 1. Créer les divisions
    console.log('🏆 Création des divisions...');
    await Division.deleteMany({});
    
    const divisions = [
      { name: 'Saphir', minPoints: 1000, maxPoints: null, color: '#3B82F6', order: 1 },
      { name: 'Or', minPoints: 500, maxPoints: 999, color: '#F59E0B', order: 2 },
      { name: 'Argent', minPoints: 150, maxPoints: 499, color: '#6B7280', order: 3 },
      { name: 'Bronze', minPoints: 10, maxPoints: 149, color: '#CD7F32', order: 4 }
    ];

    const createdDivisions = [];
    for (const div of divisions) {
      const division = new Division(div);
      await division.save();
      createdDivisions.push(division);
      console.log(`✅ Division ${division.name} créée`);
    }

    // 2. Créer des utilisateurs de test
    console.log('👥 Création des utilisateurs...');
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    
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

    const createdUsers = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Utilisateur ${user.name} créé avec ${user.points} points`);
    }

    // 3. Créer les classements hebdomadaires
    console.log('📊 Création des classements...');
    await WeeklyRanking.deleteMany({});

    // Calculer la semaine actuelle (lundi)
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    const startDate = monday;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    console.log(`📅 Semaine du ${startDate.toISOString()}`);

    // Créer les classements pour chaque division
    for (const division of createdDivisions) {
      console.log(`\n📊 Classement pour ${division.name}...`);

      // Filtrer les utilisateurs selon la division
      let divisionUsers = createdUsers.filter(user => {
        if (division.maxPoints) {
          return user.points >= division.minPoints && user.points <= division.maxPoints;
        } else {
          return user.points >= division.minPoints;
        }
      });

      // Trier par points décroissants
      divisionUsers.sort((a, b) => b.points - a.points);

      if (divisionUsers.length === 0) {
        console.log(`⚠️ Aucun utilisateur dans ${division.name}`);
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
      console.log(`🏆 Top 5 de ${division.name}:`);
      rankings.slice(0, 5).forEach((ranking, index) => {
        console.log(`   ${index + 1}. ${ranking.username} - ${ranking.points} XP`);
      });
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('📊 Résumé:');
    console.log(`- ${createdDivisions.length} divisions créées`);
    console.log(`- ${createdUsers.length} utilisateurs créés`);
    console.log('- Classements hebdomadaires créés');
    console.log('\n🔗 Vous pouvez maintenant tester /ligues !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Exécuter le script
setupDataQuick();
