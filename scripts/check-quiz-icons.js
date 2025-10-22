const mongoose = require('mongoose');
require('dotenv').config();

// Modèle Quiz simplifié
const QuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: String,
  iconUrl: String,
  isPublished: Boolean,
  questions: [mongoose.Schema.Types.Mixed],
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', QuizSchema);

async function checkQuizIcons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Récupérer tous les quiz
    const quizzes = await Quiz.find({});
    console.log(`Trouvé ${quizzes.length} quiz:`);

    quizzes.forEach(quiz => {
      console.log(`- ${quiz.title}: iconUrl = ${quiz.iconUrl || 'null'}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkQuizIcons();
