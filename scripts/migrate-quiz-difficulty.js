const mongoose = require('mongoose');
require('dotenv').config();

// Modèle Quiz avec les anciens niveaux
const OldQuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  themeSlug: String,
  difficulty: { 
    type: String, 
    enum: ["debutant", "intermediaire", "expert"], 
    default: "debutant" 
  },
  isPublished: Boolean,
  createdBy: mongoose.Schema.Types.ObjectId,
  questions: [mongoose.Schema.Types.Mixed],
}, { timestamps: true });

// Modèle Quiz avec les nouveaux niveaux
const NewQuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  themeSlug: String,
  difficulty: { 
    type: String, 
    enum: ["debutant", "apprenti", "expert", "specialiste", "maitre"], 
    default: "debutant" 
  },
  isPublished: Boolean,
  createdBy: mongoose.Schema.Types.ObjectId,
  questions: [mongoose.Schema.Types.Mixed],
}, { timestamps: true });

async function migrateQuizDifficulty() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Récupérer tous les quiz
    const quizzes = await mongoose.connection.db.collection('quizzes').find({}).toArray();
    console.log(`Trouvé ${quizzes.length} quiz à migrer`);

    // Mettre à jour les quiz avec "intermediaire" vers "apprenti"
    const result = await mongoose.connection.db.collection('quizzes').updateMany(
      { difficulty: "intermediaire" },
      { $set: { difficulty: "apprenti" } }
    );
    
    console.log(`${result.modifiedCount} quiz migrés de "intermediaire" vers "apprenti"`);

    // Vérifier la migration
    const updatedQuizzes = await mongoose.connection.db.collection('quizzes').find({}).toArray();
    const difficulties = [...new Set(updatedQuizzes.map(q => q.difficulty))];
    console.log('Difficultés après migration:', difficulties);

    console.log('Migration terminée avec succès !');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateQuizDifficulty();
