import { Quest } from '@/models/Quest';
import { QuestProgress } from '@/models/QuestProgress';
import { User } from '@/models/User';
import { Attempt } from '@/models/Attempt';
import { QuizProgress } from '@/models/QuizProgress';
import { UserBadge } from '@/models/UserBadge';
import mongoose from 'mongoose';

export interface QuestUpdateData {
  userId: mongoose.Types.ObjectId;
  xpGained?: number;
  quizCompleted?: boolean;
  questionsAnswered?: number;
  correctAnswers?: number;
  scorePercentage?: number;
  lessonResumed?: boolean;
  badgeUnlocked?: boolean;
}

export class QuestTracker {
  private userId: mongoose.Types.ObjectId;

  constructor(userId: mongoose.Types.ObjectId) {
    this.userId = userId;
  }

  /**
   * Met à jour la progression des quêtes basée sur les actions de l'utilisateur
   */
  async updateQuestProgress(data: QuestUpdateData): Promise<void> {
    try {
      // Récupérer toutes les quêtes actives
      const activeQuests = await Quest.find({ isActive: true }).lean();

      for (const quest of activeQuests) {
        await this.updateSingleQuest(quest, data);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des quêtes:', error);
    }
  }

  private async updateSingleQuest(quest: any, data: QuestUpdateData): Promise<void> {
    const questId = quest._id;
    
    // Récupérer ou créer la progression pour cette quête
    let questProgress = await QuestProgress.findOne({ userId: this.userId, questId });
    
    if (!questProgress) {
      questProgress = await QuestProgress.create({
        userId: this.userId,
        questId,
        progress: 0,
        isCompleted: false
      });
    }

    // Si déjà complétée, ne pas recalculer
    if (questProgress.isCompleted) {
      return;
    }

    let newProgress = questProgress.progress;
    let shouldUpdate = false;

    switch (quest.criteria.type) {
      case 'xp':
        if (data.xpGained !== undefined) {
          const user = await User.findById(this.userId).lean();
          newProgress = user?.points || 0;
          shouldUpdate = true;
        }
        break;

      case 'quiz_completed':
        if (data.quizCompleted) {
          newProgress += 1;
          shouldUpdate = true;
        }
        break;

      case 'questions_answered':
        if (data.questionsAnswered !== undefined) {
          // Récupérer le total de questions répondues
          const totalQuestions = await Attempt.aggregate([
            { $match: { userId: this.userId } },
            { $group: { _id: null, total: { $sum: { $size: '$answers' } } } }
          ]);
          newProgress = totalQuestions[0]?.total || 0;
          shouldUpdate = true;
        }
        break;

      case 'badge_unlocked':
        if (data.badgeUnlocked) {
          const badgeCount = await UserBadge.countDocuments({ userId: this.userId });
          newProgress = badgeCount;
          shouldUpdate = true;
        }
        break;

      case 'lesson_resumed':
        if (data.lessonResumed) {
          newProgress += 1;
          shouldUpdate = true;
        }
        break;

      case 'score_threshold':
        if (data.scorePercentage !== undefined && data.scorePercentage >= (quest.criteria.additionalData?.minScore || 0)) {
          // Compter les tentatives avec score >= minScore
          const highScoreAttempts = await Attempt.aggregate([
            { $match: { userId: this.userId } },
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
              scorePercentage: { $gte: quest.criteria.additionalData?.minScore || 0 }
            }},
            { $count: 'count' }
          ]);
          newProgress = highScoreAttempts[0]?.count || 0;
          shouldUpdate = true;
        }
        break;

      case 'correct_streak':
        // Pour les séries de bonnes réponses, on utilise une logique simplifiée
        // Dans un vrai système, il faudrait tracker les séries en temps réel
        if (data.correctAnswers !== undefined) {
          // Logique simplifiée : on considère qu'une série de 5+ bonnes réponses compte
          if (data.correctAnswers >= 5) {
            newProgress += 1;
            shouldUpdate = true;
          }
        }
        break;

      case 'error_quiz':
        // Pour l'instant, on considère qu'il n'y a pas de quiz d'erreurs spécifique
        break;
    }

    if (shouldUpdate) {
      const isCompleted = newProgress >= quest.criteria.value;
      
      await QuestProgress.updateOne(
        { userId: this.userId, questId },
        {
          $set: {
            progress: newProgress,
            isCompleted,
            completedAt: isCompleted ? new Date() : undefined
          }
        }
      );

      // Si la quête est complétée, on peut déclencher des récompenses
      if (isCompleted && !questProgress.isCompleted) {
        await this.handleQuestCompletion(quest);
      }
    }
  }

  private async handleQuestCompletion(quest: { title: string; reward?: { xp?: number } }): Promise<void> {
    console.log(`Quête complétée: ${quest.title} par l'utilisateur ${this.userId}`);
    
    // Ici on pourrait ajouter des récompenses comme des points XP supplémentaires
    if (quest.reward?.xp) {
      await User.updateOne(
        { _id: this.userId },
        { $inc: { points: quest.reward.xp } }
      );
    }
  }

  /**
   * Met à jour les quêtes lors de la complétion d'un quiz
   */
  async onQuizCompleted(quizId: mongoose.Types.ObjectId, score: number, totalQuestions: number): Promise<void> {
    const scorePercentage = (score / totalQuestions) * 100;
    
    await this.updateQuestProgress({
      userId: this.userId,
      quizCompleted: true,
      questionsAnswered: totalQuestions,
      scorePercentage
    });
  }

  /**
   * Met à jour les quêtes lors de la reprise d'une leçon
   */
  async onLessonResumed(): Promise<void> {
    await this.updateQuestProgress({
      userId: this.userId,
      lessonResumed: true
    });
  }

  /**
   * Met à jour les quêtes lors du déblocage d'un badge
   */
  async onBadgeUnlocked(): Promise<void> {
    await this.updateQuestProgress({
      userId: this.userId,
      badgeUnlocked: true
    });
  }

  /**
   * Met à jour les quêtes lors de l'attribution de XP
   */
  async onXpGained(xpAmount: number): Promise<void> {
    await this.updateQuestProgress({
      userId: this.userId,
      xpGained: xpAmount
    });
  }
}
