import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/mongodb';
import { Quest } from '@/models/Quest';
import { QuestProgress } from '@/models/QuestProgress';
import { Attempt } from '@/models/Attempt';
import { QuizProgress } from '@/models/QuizProgress';
import { User } from '@/models/User';
import { UserBadge } from '@/models/UserBadge';
import mongoose from 'mongoose';

// Fonction pour sélectionner 3 quêtes aléatoires basées sur la date du jour
function selectDailyQuests<T>(quests: T[]): T[] {
  if (quests.length <= 3) return quests;

  // Utiliser la date du jour (en UTC) comme seed
  const today = new Date();
  const dateString = `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`;
  
  // Créer un seed à partir de la date
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
    seed = seed & seed; // Convertir en entier 32 bits
  }

  // Générateur de nombres pseudo-aléatoires avec seed
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  // Mélanger le tableau avec le seed
  const shuffled = [...quests];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Retourner les 3 premières quêtes
  return shuffled.slice(0, 3);
}

export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(session.user!.id);

    // Récupérer toutes les quêtes actives
    const allQuests = await Quest.find({ isActive: true }).lean();
    
    // Sélectionner 3 quêtes aléatoires pour aujourd'hui
    const quests = selectDailyQuests(allQuests);

    // Récupérer la progression des quêtes pour cet utilisateur
    const questProgresses = await QuestProgress.find({ userId }).lean();
    const progressMap = new Map(questProgresses.map(p => [p.questId.toString(), p]));

    // Récupérer les statistiques de l'utilisateur
    const user = await User.findById(userId).lean();
    const totalAttempts = await Attempt.countDocuments({ userId });
    const totalQuestionsAnswered = await Attempt.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: { $size: '$answers' } } } }
    ]);
    const totalQuestions = totalQuestionsAnswered[0]?.total || 0;

    // Récupérer les badges débloqués
    const unlockedBadges = await UserBadge.countDocuments({ userId });

    const questResults = await Promise.all(quests.map(async (quest) => {
      const progress = progressMap.get(quest._id.toString());
      let currentProgress = 0;
      let isCompleted = false;

      if (progress) {
        currentProgress = progress.progress;
        isCompleted = progress.isCompleted;
      } else {
        // Calculer la progression actuelle selon le type de quête
        switch (quest.criteria.type) {
          case 'xp':
            currentProgress = user?.points || 0;
            break;
          case 'quiz_completed':
            currentProgress = totalAttempts;
            break;
          case 'questions_answered':
            currentProgress = totalQuestions;
            break;
          case 'badge_unlocked':
            currentProgress = unlockedBadges;
            break;
          case 'lesson_resumed':
            // Compter les quiz en cours
            const resumedLessons = await QuizProgress.countDocuments({
              userId,
              isCompleted: false,
              isFailed: false
            });
            currentProgress = resumedLessons;
            break;
          case 'error_quiz':
            // Pour l'instant, on considère qu'il n'y a pas de quiz d'erreurs spécifique
            currentProgress = 0;
            break;
          case 'score_threshold':
            // Compter les tentatives avec score >= minScore
            if (quest.criteria.additionalData?.minScore) {
              const highScoreAttempts = await Attempt.aggregate([
                { $match: { userId } },
                { $lookup: {
                  from: 'quizzes',
                  localField: 'quizId',
                  foreignField: '_id',
                  as: 'quiz'
                }},
                { $unwind: '$quiz' },
                { $addFields: {
                  scorePercentage: {
                    $multiply: [
                      { $divide: ['$score', { $size: '$quiz.questions' }] },
                      100
                    ]
                  }
                }},
                { $match: {
                  scorePercentage: { $gte: quest.criteria.additionalData.minScore }
                }},
                { $count: 'count' }
              ]);
              currentProgress = highScoreAttempts[0]?.count || 0;
            }
            break;
          case 'correct_streak':
            // Pour les séries de bonnes réponses, on utilise une logique simplifiée
            // Dans un vrai système, il faudrait tracker les séries en temps réel
            currentProgress = 0;
            break;
        }

        // Vérifier si la quête est complétée
        isCompleted = currentProgress >= quest.criteria.value;

        // Créer ou mettre à jour la progression
        if (isCompleted && !progress) {
          await QuestProgress.create({
            userId,
            questId: quest._id,
            progress: currentProgress,
            isCompleted: true,
            completedAt: new Date()
          });
        } else if (!progress) {
          await QuestProgress.create({
            userId,
            questId: quest._id,
            progress: currentProgress,
            isCompleted: false
          });
        }
      }

      return {
        id: quest._id.toString(),
        title: quest.title,
        description: quest.description,
        icon: quest.icon,
        progress: Math.min(currentProgress, quest.criteria.value),
        total: quest.criteria.value,
        completed: isCompleted,
        type: quest.criteria.type
      };
    }));

    return NextResponse.json({
      success: true,
      quests: questResults
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des quêtes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des quêtes' },
      { status: 500 }
    );
  }
}
