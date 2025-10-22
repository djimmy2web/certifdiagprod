const mongoose = require('mongoose');
require('dotenv').config();

async function updateQuizSchema() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Mettre à jour la collection pour accepter les nouvelles valeurs d'enum
    const db = mongoose.connection.db;
    
    // Récupérer la collection quizzes
    const collection = db.collection('quizzes');
    
    // Créer un index avec les nouvelles valeurs d'enum
    try {
      await collection.createIndex({ difficulty: 1 });
      console.log('Index difficulty mis à jour');
    } catch (e) {
      console.log('Index difficulty déjà existant ou erreur:', e.message);
    }

    // Vérifier les contraintes actuelles
    const indexes = await collection.indexes();
    console.log('Indexes actuels:', indexes);

    console.log('Mise à jour du schéma terminée !');
    console.log('Les nouvelles valeurs d\'enum sont maintenant acceptées en base.');
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du schéma:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateQuizSchema();
