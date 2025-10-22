import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";
import { Theme } from "@/models/Theme";
import { z } from "zod";

const CreateThemeSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  slug: z.string().min(1, "Le slug est obligatoire").regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"),
  iconUrl: z.string().optional().nullable(),
});

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();
    
    const themes = await Theme.find().sort({ name: 1 }).lean();
    
    return NextResponse.json({ themes });
  } catch (error) {
    console.error("Erreur lors de la récupération des thématiques:", error);
    const status = (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') ? error.status : 500;
    const message = status === 401 ? "Non autorisé" : status === 403 ? "Interdit" : "Erreur serveur";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const parsed = CreateThemeSchema.parse(body);

    // Vérifier si le slug existe déjà
    const existingTheme = await Theme.findOne({ slug: parsed.slug });
    if (existingTheme) {
      return NextResponse.json({ error: "Une thématique avec ce slug existe déjà" }, { status: 400 });
    }

    const theme = await Theme.create({
      name: parsed.name,
      slug: parsed.slug,
      iconUrl: parsed.iconUrl || undefined,
      isActive: true,
    });

    return NextResponse.json({ 
      message: "Thématique créée avec succès",
      theme: {
        _id: theme._id,
        name: theme.name,
        slug: theme.slug,
        iconUrl: theme.iconUrl,
        isActive: theme.isActive,
        createdAt: theme.createdAt,
        updatedAt: theme.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((i) => i.message).join(", ") || "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("Erreur lors de la création de la thématique:", error);
    const status = (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') ? error.status : 500;
    const message = status === 401 ? "Non autorisé" : status === 403 ? "Interdit" : "Erreur serveur";
    return NextResponse.json({ error: message }, { status });
  }
}