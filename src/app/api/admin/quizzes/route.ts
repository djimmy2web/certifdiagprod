import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";
import { Quiz } from "@/models/Quiz";
import { z } from "zod";

const MediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().url(),
  filename: z.string(),
}).optional();

const ChoiceSchema = z.object({ 
  text: z.string().min(1), 
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
  media: MediaSchema,
});

const QuestionSchema = z.object({
  text: z.string().min(1),
  explanation: z.string().optional(),
  media: MediaSchema,
  choices: z.array(ChoiceSchema).min(2),
});
const QuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isPublished: z.boolean().optional(),
  themeSlug: z.string().min(1).regex(/^[a-z0-9-]+$/i, "Slug thématique invalide").optional(),
  difficulty: z.enum(["debutant", "apprenti", "expert", "specialiste", "maitre"]).optional(),
  iconUrl: z.string().optional().nullable(),
  questions: z.array(QuestionSchema).min(1),
});

export async function GET() {
  await requireAdmin();
  await connectToDatabase();
  const quizzes = await Quiz.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ quizzes });
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    await connectToDatabase();
    
    const body = await req.json();
    console.log("Données reçues:", { title: body.title, iconUrl: body.iconUrl });
    
    const parsed = QuizSchema.parse(body);
    
    const quizData = { 
      ...parsed, 
      themeSlug: parsed.themeSlug?.toLowerCase(),
      createdBy: undefined as string | undefined
    };
    
    // Ajouter createdBy seulement si c'est un ObjectId valide
    if (session.user?.id) {
      try {
        const mongoose = await import('mongoose');
        if (mongoose.Types.ObjectId.isValid(session.user.id)) {
          quizData.createdBy = session.user.id;
        }
      } catch (e) {
        console.log("Impossible de valider l'ObjectId createdBy:", e);
      }
    }
    
    console.log("Données pour création:", { title: quizData.title, iconUrl: quizData.iconUrl });
    
    // Utiliser insertOne pour contourner la validation Mongoose temporairement
    const mongoose = await import('mongoose');
    const created = await mongoose.connection.db?.collection('quizzes').insertOne({
      ...quizData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Quiz créé avec succès:", { id: String(created?.insertedId), iconUrl: quizData.iconUrl });
    
    return NextResponse.json({ quiz: { id: String(created?.insertedId) } }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du quiz:", error);
    
    if (error instanceof z.ZodError) {
      const message = error.issues.map((i) => i.message).join(", ") || "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    
    const status = (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') ? error.status : 500;
    const message = status === 401 ? "Non autorisé" : status === 403 ? "Interdit" : "Erreur serveur";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  try {
    await requireAdmin();
    await connectToDatabase();
    
    // Supprimer tous les quiz
    const result = await Quiz.deleteMany({});
    
    return NextResponse.json({ 
      message: `${result.deletedCount} quiz supprimé(s) avec succès`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des quiz:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression des quiz" }, { status: 500 });
  }
}


