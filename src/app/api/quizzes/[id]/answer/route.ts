import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";
import { Quiz } from "@/models/Quiz";
import { QuizProgress } from "@/models/QuizProgress";
import { Attempt } from "@/models/Attempt";
import { Badge } from "@/models/Badge";
import { UserBadge } from "@/models/UserBadge";
import { User } from "@/models/User";
import { QuestTracker } from "@/lib/quest-tracker";
import mongoose from "mongoose";

interface AnswerResponse {
  isCorrect: boolean;
  lives: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  isCompleted: boolean;
  isFailed: boolean;
  explanation?: string;
  correctAnswerText?: string;
  allCorrect?: boolean;
  correctAnswers?: number;
  totalAnswers?: number;
  nextQuestion?: {
    index: number;
    text: string;
    explanation?: string;
    media?: unknown;
    choices: Array<{
      index: number;
      text: string;
      media?: unknown;
    }>;
  };
  finalScore?: {
    correct: number;
    total: number;
    percentage: number;
  };
}

const AnswerSchema = z.object({
  choiceIndex: z.number().int().min(0),
});

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Quiz invalide" }, { status: 400 });
    }

    const quiz = await Quiz.findById(id).lean();
    if (!quiz || !quiz.isPublished) {
      return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const { choiceIndex } = AnswerSchema.parse(body);

    const userId = new mongoose.Types.ObjectId(session.user!.id);
    const quizId = new mongoose.Types.ObjectId(id);

    // Récupérer l'utilisateur et la progression actuelle
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const progress = await QuizProgress.findOne({ userId, quizId });
    if (!progress) {
      return NextResponse.json({ error: "Progression introuvable" }, { status: 404 });
    }

    if (progress.isCompleted || progress.isFailed) {
      return NextResponse.json({ error: "Quiz déjà terminé" }, { status: 400 });
    }

    // Vérifier si l'utilisateur a des vies disponibles
    const currentLives = user.lives?.current || 0;
    if (currentLives <= 0) {
      return NextResponse.json({ error: "Pas de vies disponibles" }, { status: 400 });
    }

    // Vérifier que la question actuelle existe
    const currentQuestion = quiz.questions[progress.currentQuestionIndex];
    if (!currentQuestion) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    // Vérifier que le choix est valide
    if (choiceIndex < 0 || choiceIndex >= currentQuestion.choices.length) {
      return NextResponse.json({ error: "Choix invalide" }, { status: 400 });
    }

    // Vérifier la réponse
    const isCorrect = currentQuestion.choices[choiceIndex].isCorrect;
    const correctChoice = currentQuestion.choices.find((c: { isCorrect: boolean }) => c.isCorrect) || currentQuestion.choices[0];

    // Ajouter la réponse à la progression
    progress.answers.push({
      questionIndex: progress.currentQuestionIndex,
      choiceIndex,
      isCorrect,
      answeredAt: new Date(),
    });

    // Si la réponse est incorrecte, perdre une vie du compte utilisateur
    if (!isCorrect) {
      user.lives!.current = Math.max(0, (user.lives?.current || 1) - 1);
      await user.save();
    }

    // Passer à la question suivante
    progress.currentQuestionIndex += 1;
    progress.lastActivityAt = new Date();

    // Vérifier si le quiz est terminé
    if (progress.currentQuestionIndex >= quiz.questions.length) {
      // Quiz terminé avec succès
      progress.isCompleted = true;
      progress.completedAt = new Date();

      // Créer une tentative finale
      const correctAnswers = progress.answers.filter(a => a.isCorrect).length;
      await Attempt.create({
        userId,
        quizId,
        score: correctAnswers,
        answers: progress.answers.map(a => ({
          questionIndex: a.questionIndex,
          choiceIndex: a.choiceIndex,
          isCorrect: a.isCorrect,
        })),
      });

      // Attribution de badges
      const activeBadges = await Badge.find({ isActive: true }).lean();
      const eligible = activeBadges.filter((b: unknown) => {
        const badge = b as { criteria?: { minScore?: number; quizId?: unknown } };
        const okScore = badge.criteria?.minScore == null || correctAnswers >= badge.criteria.minScore;
        const okQuiz = !badge.criteria?.quizId || String(badge.criteria.quizId) === String(quiz._id); 
        return okScore && okQuiz;
      });

      if (eligible.length > 0) {
        for (const b of eligible) {
          try {
            const badge = b as { _id: unknown };
            await UserBadge.updateOne(
              { userId, badgeId: badge._id },
              { $setOnInsert: { awardedAt: new Date() } },
              { upsert: true }
            );
          } catch {}
        }
      }

      // Mettre à jour les quêtes
      const questTracker = new QuestTracker(userId);
      await questTracker.onQuizCompleted(quiz._id, correctAnswers, quiz.questions.length);
    } else if ((user.lives?.current || 0) <= 0) {
      // Plus de vies disponibles dans le compte utilisateur
      progress.isFailed = true;
      progress.completedAt = new Date();
    }

    await progress.save();

    // Compter les bonnes réponses
    const correctAnswers = progress.answers.filter(a => a.isCorrect).length;
    
    // Préparer la réponse
    const response: AnswerResponse = {
      isCorrect,
      lives: user.lives?.current || 0,
      currentQuestionIndex: progress.currentQuestionIndex,
      totalQuestions: quiz.questions.length,
      isCompleted: progress.isCompleted,
      isFailed: progress.isFailed,
      explanation: currentQuestion.choices[choiceIndex].explanation,
      correctAnswerText: correctChoice?.text,
      correctAnswers,
      totalAnswers: progress.answers.length,
    };

    // Si le quiz n'est pas terminé, inclure la question suivante
    if (!progress.isCompleted && !progress.isFailed) {
      const nextQuestion = quiz.questions[progress.currentQuestionIndex];
      response.nextQuestion = {
        index: progress.currentQuestionIndex,
        text: nextQuestion.text,
        explanation: nextQuestion.explanation,
        media: nextQuestion.media,
        choices: nextQuestion.choices.map((choice, index) => ({
          index,
          text: choice.text,
          media: choice.media,
        })),
      };
    } else if (progress.isCompleted) {
      // Quiz terminé avec succès
      const correctAnswers = progress.answers.filter(a => a.isCorrect).length;
      response.finalScore = {
        correct: correctAnswers,
        total: quiz.questions.length,
        percentage: Math.round((correctAnswers / quiz.questions.length) * 100),
      };
      // Vérifier si toutes les réponses sont correctes
      response.allCorrect = correctAnswers === quiz.questions.length;
    }

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((i) => i.message).join(", ") || "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("Erreur lors de la réponse:", error);
    const status = (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') ? error.status : 500;
    const message = status === 401 ? "Non autorisé" : status === 403 ? "Interdit" : "Erreur serveur";
    return NextResponse.json({ error: message }, { status });
  }
}
