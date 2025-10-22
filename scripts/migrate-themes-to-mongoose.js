const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

// Schéma Mongoose pour les thématiques
const ThemeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  iconUrl: { type: String, trim: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

const Theme = mongoose.model('Theme', ThemeSchema);

async function migrateThemes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Migration des thématiques vers Mongoose...\n');
    
    // Connexion à MongoDB brut
    await client.connect();
    const db = client.db();
    
    // Récupérer les thématiques de la collection brute
    const rawThemes = await db.collection('themes').find({}).toArray();
    console.log(`📊 Thématiques trouvées dans MongoDB brut: ${rawThemes.length}`);
    
    if (rawThemes.length === 0) {
      console.log('⚠️  Aucune thématique trouvée dans MongoDB brut');
      return;
    }
    
    // Connexion à Mongoose
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion Mongoose établie');
    
    // Vérifier les thématiques existantes dans Mongoose
    const existingThemes = await Theme.find({});
    console.log(`📊 Thématiques existantes dans Mongoose: ${existingThemes.length}`);
    
    if (existingThemes.length > 0) {
      console.log('⚠️  Des thématiques existent déjà dans Mongoose');
      console.log('🔄 Suppression des anciennes thématiques...');
      await Theme.deleteMany({});
    }
    
    // Migrer les données
    console.log('🔄 Migration des données...');
    const migratedThemes = [];
    
    for (const rawTheme of rawThemes) {
      const themeData = {
        name: rawTheme.name,
        slug: rawTheme.slug,
        iconUrl: rawTheme.iconUrl,
        isActive: rawTheme.isActive !== false, // Par défaut true si non défini
        createdAt: rawTheme.createdAt || new Date(),
        updatedAt: rawTheme.updatedAt || new Date()
      };
      
      const theme = new Theme(themeData);
      await theme.save();
      migratedThemes.push(theme);
      
      console.log(`   ✅ ${theme.name} (${theme.slug})`);
    }
    
    console.log(`\n🎉 Migration terminée ! ${migratedThemes.length} thématiques migrées`);
    
    // Vérifier la migration
    const finalThemes = await Theme.find({});
    console.log(`📊 Thématiques finales dans Mongoose: ${finalThemes.length}`);
    
    finalThemes.forEach((theme, index) => {
      console.log(`   ${index + 1}. ${theme.name} (${theme.slug}) - ${theme.isActive ? 'Actif' : 'Inactif'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await client.close();
    await mongoose.disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  migrateThemes();
}

module.exports = { migrateThemes };
