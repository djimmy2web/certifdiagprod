import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Theme } from "@/models/Theme";
import { Quiz } from "@/models/Quiz";

export async function GET() {
  try {
    console.log('🔍 Début de la récupération des thématiques...');
    await connectToDatabase();
    console.log('✅ Connexion à la base de données établie');
    
    const themes = await Theme.find({ isActive: true }).sort({ name: 1 }).lean();
    console.log(`📊 Thématiques trouvées: ${themes.length}`);
    
    // Compter le nombre de quiz publiés pour chaque thème
    const formattedThemes = await Promise.all(themes.map(async (t: any) => {
      const quizCount = await Quiz.countDocuments({ 
        themeSlug: t.slug, 
        isPublished: true 
      });
      
      return {
        id: String(t._id), 
        name: t.name, 
        slug: t.slug,
        iconUrl: t.iconUrl,
        totalQuizzes: quizCount
      };
    }));
    
    console.log('📊 Thématiques formatées avec comptage des quiz:', formattedThemes.length);
    
    return NextResponse.json({ themes: formattedThemes });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des thématiques:', error);
    return NextResponse.json({ themes: [] });
  }
}


