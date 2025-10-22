/**
 * Script de migration pour ajouter le système de vies aux utilisateurs existants
 * À exécuter une seule fois après le déploiement du nouveau système
 */

const { connectToDatabase } = require('../src/lib/mongodb.ts');
const mongoose = require('mongoose');

// Définition du schéma utilisateur
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  customId: { type: String, required: true, unique: true },
  lives: {
    current: { type: Number, default: 5, min: 0, max: 10 },
    max: { type: Number, default: 5, min: 1, max: 10 },
    lastRegeneration: { type: Date, default: Date.now },
    regenerationRate: { type: Number, default: 4 }, // 4 heures
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function migrateUsersLives() {
  try {
    console.log('🚀 Début de la migration du système de vies...');
    
    await connectToDatabase();
    
    // Compter les utilisateurs sans système de vies
    const usersWithoutLives = await User.countDocuments({
      $or: [
        { lives: { $exists: false } },
        { lives: null }
      ]
    });
    
    console.log(`📊 ${usersWithoutLives} utilisateurs à migrer`);
    
    if (usersWithoutLives === 0) {
      console.log('✅ Tous les utilisateurs ont déjà le système de vies');
      return;
    }
    
    // Mise à jour en lot des utilisateurs
    const result = await User.updateMany(
      {
        $or: [
          { lives: { $exists: false } },
          { lives: null }
        ]
      },
      {
        $set: {
          lives: {
            current: 5,
            max: 5,
            lastRegeneration: new Date(),
            regenerationRate: 4
          }
        }
      }
    );
    
    console.log(`✅ Migration terminée avec succès!`);
    console.log(`📈 ${result.modifiedCount} utilisateurs mis à jour`);
    
    // Vérification
    const totalUsers = await User.countDocuments();
    const usersWithLives = await User.countDocuments({
      lives: { $exists: true, $ne: null }
    });
    
    console.log(`📊 Résumé:`);
    console.log(`   - Total utilisateurs: ${totalUsers}`);
    console.log(`   - Avec système de vies: ${usersWithLives}`);
    console.log(`   - Sans système de vies: ${totalUsers - usersWithLives}`);
    
    if (totalUsers === usersWithLives) {
      console.log('🎉 Migration 100% réussie!');
    } else {
      console.log('⚠️  Certains utilisateurs n\'ont pas été migrés');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Fonction pour tester le système de régénération
async function testLivesRegeneration() {
  try {
    console.log('🧪 Test du système de régénération...');
    
    // Créer un utilisateur de test avec des vies réduites et une ancienne date
    const testUser = await User.findOneAndUpdate(
      { email: 'test-lives@example.com' },
      {
        $set: {
          email: 'test-lives@example.com',
          customId: 'test-lives-user',
          lives: {
            current: 2,
            max: 5,
            lastRegeneration: new Date(Date.now() - 5 * 60 * 60 * 1000), // Il y a 5 heures
            regenerationRate: 4
          }
        }
      },
      { upsert: true, new: true }
    );
    
    console.log('👤 Utilisateur de test créé:', {
      customId: testUser.customId,
      lives: testUser.lives
    });
    
    // Simuler la régénération
    const now = new Date();
    const lastRegen = new Date(testUser.lives.lastRegeneration);
    const hoursElapsed = Math.floor((now.getTime() - lastRegen.getTime()) / (1000 * 60 * 60));
    
    console.log(`⏰ Heures écoulées: ${hoursElapsed}`);
    
    if (hoursElapsed >= testUser.lives.regenerationRate) {
      const livesToAdd = Math.floor(hoursElapsed / testUser.lives.regenerationRate);
      const newLives = Math.min(testUser.lives.current + livesToAdd, testUser.lives.max);
      
      testUser.lives.current = newLives;
      testUser.lives.lastRegeneration = new Date(
        lastRegen.getTime() + (livesToAdd * testUser.lives.regenerationRate * 60 * 60 * 1000)
      );
      
      await testUser.save();
      
      console.log('✅ Régénération simulée:', {
        livesAjoutees: livesToAdd,
        nouvellesVies: newLives,
        prochaineRegeneration: testUser.lives.lastRegeneration
      });
    } else {
      console.log('⏳ Pas encore de régénération nécessaire');
    }
    
    // Nettoyer l'utilisateur de test
    await User.deleteOne({ email: 'test-lives@example.com' });
    console.log('🧹 Utilisateur de test supprimé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécution du script
async function main() {
  try {
    await migrateUsersLives();
    await testLivesRegeneration();
    
    console.log('🏁 Script terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter seulement si appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  migrateUsersLives,
  testLivesRegeneration
};
