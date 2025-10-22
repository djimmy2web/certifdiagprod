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

// Données de test pour les utilisateurs
const testUsers = [
  { name: 'Capitaine Vert', email: 'capitaine.vert@test.com', points: 850, customId: 'capitaine_vert' },
  { name: 'Horizon Perroquet', email: 'horizon.perroquet@test.com', points: 820, customId: 'horizon_perroquet' },
  { name: 'Kylian064', email: 'kylian064@test.com', points: 780, customId: 'kylian064' },
  { name: 'Stylo Delux', email: 'stylo.delux@test.com', points: 750, customId: 'stylo_delux' },
  { name: 'Ballon Eloigné', email: 'ballon.eloigne@test.com', points: 720, customId: 'ballon_eloigne' },
  { name: 'Moi', email: 'moi@test.com', points: 700, customId: 'moi' },
  { name: 'Manon789', email: 'manon789@test.com', points: 680, customId: 'manon789' },
  { name: 'DIAGQCM12', email: 'diagqcm12@test.com', points: 650, customId: 'diagqcm12' },
  { name: 'Capitaine Vert 2', email: 'capitaine.vert2@test.com', points: 620, customId: 'capitaine_vert2' },
  { name: 'Capitaine Vert 3', email: 'capitaine.vert3@test.com', points: 590, customId: 'capitaine_vert3' },
  { name: 'Capitaine Vert 4', email: 'capitaine.vert4@test.com', points: 560, customId: 'capitaine_vert4' },
  { name: 'Capitaine Vert 5', email: 'capitaine.vert5@test.com', points: 530, customId: 'capitaine_vert5' },
  { name: 'Joueur Argent 1', email: 'argent1@test.com', points: 400, customId: 'argent1' },
  { name: 'Joueur Argent 2', email: 'argent2@test.com', points: 380, customId: 'argent2' },
  { name: 'Joueur Argent 3', email: 'argent3@test.com', points: 350, customId: 'argent3' },
  { name: 'Joueur Bronze 1', email: 'bronze1@test.com', points: 120, customId: 'bronze1' },
  { name: 'Joueur Bronze 2', email: 'bronze2@test.com', points: 100, customId: 'bronze2' },
  { name: 'Joueur Bronze 3', email: 'bronze3@test.com', points: 80, customId: 'bronze3' }
];

// Données de test pour les divisions
const testDivisions = [
  { name: 'Saphir', minPoints: 1000, maxPoints: null, color: '#3B82F6', order: 1 },
  { name: 'Or', minPoints: 500, maxPoints: 999, color: '#F59E0B', order: 2 },
  { name: 'Argent', minPoints: 150, maxPoints: 499, color: '#6B7280', order: 3 },
  { name: 'Bronze', minPoints: 10, maxPoints: 149, color: '#CD7F32', order: 4 }
];

async function addTestRankings() {
  try {
    console.log('🚀 Début de l\'ajout des données de test...');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag');
    console.log('✅ Connecté à MongoDB');

    // Nettoyer les données existantes
    console.log('🧹 Nettoyage des données existantes...');
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    await WeeklyRanking.deleteMany({});
    console.log('✅ Données nettoyées');

    // Créer les divisions
    console.log('🏆 Création des divisions...');
    const divisions = [];
    for (const divisionData of testDivisions) {
      const division = new Division(divisionData);
      await division.save();
      divisions.push(division);
      console.log(`✅ Division ${division.name} créée`);
    }

    // Créer les utilisateurs
    console.log('👥 Création des utilisateurs...');
    const users = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`✅ Utilisateur ${user.name} créé avec ${user.points} points`);
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

    // Créer les classements pour chaque division
    for (const division of divisions) {
      console.log(`\n📊 Création du classement pour la division ${division.name}...`);

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

    // Créer aussi des classements pour les semaines précédentes
    console.log('\n📅 Création des classements des semaines précédentes...');
    
    for (let weekOffset = 1; weekOffset <= 3; weekOffset++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() - (weekOffset * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      console.log(`\n📊 Semaine du ${weekStart.toISOString()}`);

      for (const division of divisions) {
        // Filtrer les utilisateurs selon la division
        let divisionUsers = users.filter(user => {
          if (division.maxPoints) {
            return user.points >= division.minPoints && user.points <= division.maxPoints;
          } else {
            return user.points >= division.minPoints;
          }
        });

        // Ajouter de la variation pour simuler l'évolution
        const variedUsers = divisionUsers.map(user => ({
          ...user.toObject(),
          points: Math.max(0, user.points + Math.floor(Math.random() * 100) - 50)
        }));

        // Trier par points décroissants
        variedUsers.sort((a, b) => b.points - a.points);

        // Créer les rankings
        const rankings = variedUsers.map((user, index) => ({
          userId: user._id,
          username: user.name,
          points: user.points,
          rank: index + 1,
          status: 'stayed'
        }));

        // Créer le classement hebdomadaire
        const weeklyRanking = new WeeklyRanking({
          weekStart: weekStart,
          weekEnd: weekEnd,
          divisionId: division._id,
          rankings: rankings,
          isProcessed: true
        });

        await weeklyRanking.save();
        console.log(`✅ Classement créé pour ${division.name} (semaine ${weekOffset})`);
      }
    }

    console.log('\n🎉 Données de test ajoutées avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`- ${users.length} utilisateurs créés`);
    console.log(`- ${divisions.length} divisions créées`);
    console.log('- 4 semaines de classements créées');
    console.log('\n🔗 Vous pouvez maintenant tester la page des ligues !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Exécuter le script
addTestRankings();
