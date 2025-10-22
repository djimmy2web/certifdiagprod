import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";
import { Quiz } from "@/models/Quiz";
import { QuizProgress } from "@/models/QuizProgress";
import { User } from "@/models/User";
import { QuestTracker } from "@/lib/quest-tracker";
import mongoose from "mongoose";

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

    const userId = new mongoose.Types.ObjectId(session.user!.id);
    const quizId = new mongoose.Types.ObjectId(id);

    // Vérifier l'utilisateur et ses vies
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Vérifier si l'utilisateur a des vies disponibles
    const currentLives = user.lives?.current || 0;
    if (currentLives <= 0) {
      return NextResponse.json({ 
        error: "Pas de vies disponibles",
        lives: {
          current: currentLives,
          max: user.lives?.max || 5,
          regenerationRate: user.lives?.regenerationRate || 4
        }
      }, { status: 400 });
    }

    // Vérifier s'il existe déjà une progression pour ce quiz
    let progress = await QuizProgress.findOne({ userId, quizId }).lean();
    let isResuming = false;

    if (!progress) {
      try {
        // Créer une nouvelle progression (sans les vies car gérées au niveau utilisateur)
        progress = await QuizProgress.create({
          userId,
          quizId,
          lives: 0, // Obsolète mais gardé pour compatibilité
          currentQuestionIndex: 0,
          answers: [],
          isCompleted: false,
          isFailed: false,
          startedAt: new Date(),
          lastActivityAt: new Date(),
        });
      } catch (error: unknown) {
        // Si erreur de clé dupliquée, récupérer la progression existante
        if ((error as { code?: number }).code === 11000) {
          progress = await QuizProgress.findOne({ userId, quizId }).lean();
          if (!progress) {
            throw new Error("Erreur de concurrence lors de la création de la progression");
          }
        } else {
          throw error;
        }
      }
    } else {
      // Si la progression existe mais est terminée, la réinitialiser
      if (progress.isCompleted || progress.isFailed) {
        await QuizProgress.updateOne(
          { userId, quizId },
          {
            $set: {
              lives: 0, // Obsolète mais gardé pour compatibilité
              currentQuestionIndex: 0,
              answers: [],
              isCompleted: false,
              isFailed: false,
              startedAt: new Date(),
              lastActivityAt: new Date(),
            },
            $unset: { completedAt: 1 },
          }
        );
        progress = await QuizProgress.findOne({ userId, quizId }).lean();
      } else {
        // C'est une reprise de leçon
        isResuming = true;
      }
    }

    // Mettre à jour les quêtes si c'est une reprise de leçon
    if (isResuming) {
      const questTracker = new QuestTracker(userId);
      await questTracker.onLessonResumed();
    }

    // Retourner la question actuelle
    const currentQuestion = quiz.questions[progress!.currentQuestionIndex];
    if (!currentQuestion) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      progress: {
        lives: user.lives?.current || 0, // Utiliser les vies du compte utilisateur
        currentQuestionIndex: progress!.currentQuestionIndex,
        totalQuestions: quiz.questions.length,
        isCompleted: progress!.isCompleted,
        isFailed: progress!.isFailed,
      },
      question: {
        index: progress!.currentQuestionIndex,
        text: currentQuestion.text,
        explanation: currentQuestion.explanation,
        media: currentQuestion.media,
        choices: currentQuestion.choices.map((choice, index) => ({
          index,
          text: choice.text,
          media: choice.media,
        })),
      },
    });

  } catch (error) {
    console.error("Erreur lors du démarrage du quiz:", error);
    const status = (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') ? error.status : 500;
    const message = status === 401 ? "Non autorisé" : status === 403 ? "Interdit" : "Erreur serveur";
    return NextResponse.json({ error: message }, { status });
  }
}
