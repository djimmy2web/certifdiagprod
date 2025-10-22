import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

// Fonction utilitaire pour régénérer les vies
async function regenerateLives(userId: string) {
  await connectToDatabase();
  
  const user = await User.findById(userId);
  if (!user || !user.lives) return user;

  const now = new Date();
  const lastRegen = new Date(user.lives.lastRegeneration);
  const hoursElapsed = Math.floor((now.getTime() - lastRegen.getTime()) / (1000 * 60 * 60));
  
  if (hoursElapsed >= user.lives.regenerationRate && user.lives.current < user.lives.max) {
    const livesToAdd = Math.floor(hoursElapsed / user.lives.regenerationRate);
    const newLives = Math.min(user.lives.current + livesToAdd, user.lives.max);
    
    user.lives.current = newLives;
    user.lives.lastRegeneration = new Date(lastRegen.getTime() + (livesToAdd * user.lives.regenerationRate * 60 * 60 * 1000));
    
    await user.save();
  }
  
  return user;
}

// GET - Récupérer les vies de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await regenerateLives(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Calculer le temps jusqu'à la prochaine régénération
    const now = new Date();
    const lastRegen = new Date(user.lives?.lastRegeneration || now);
    const nextRegenTime = new Date(lastRegen.getTime() + (user.lives?.regenerationRate || 4) * 60 * 60 * 1000);
    const timeUntilNext = Math.max(0, Math.ceil((nextRegenTime.getTime() - now.getTime()) / (1000 * 60))); // en minutes

    return NextResponse.json({
      current: user.lives?.current || 5,
      max: user.lives?.max || 5,
      regenerationRate: user.lives?.regenerationRate || 4, // heures
      timeUntilNext, // minutes
      canPlay: (user.lives?.current || 0) > 0
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des vies:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Consommer une vie
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { action } = await req.json();

    if (action !== "consume") {
      return NextResponse.json({ error: "Action non valide" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Régénérer les vies d'abord
    const user = await regenerateLives(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Vérifier si l'utilisateur a des vies disponibles
    if ((user.lives?.current || 0) <= 0) {
      return NextResponse.json({ 
        error: "Pas de vies disponibles",
        current: user.lives?.current || 0,
        max: user.lives?.max || 5
      }, { status: 400 });
    }

    // Consommer une vie
    user.lives!.current = Math.max(0, (user.lives?.current || 1) - 1);
    await user.save();

    // Calculer le temps jusqu'à la prochaine régénération
    const now = new Date();
    const lastRegen = new Date(user.lives?.lastRegeneration || now);
    const nextRegenTime = new Date(lastRegen.getTime() + (user.lives?.regenerationRate || 4) * 60 * 60 * 1000);
    const timeUntilNext = Math.max(0, Math.ceil((nextRegenTime.getTime() - now.getTime()) / (1000 * 60))); // en minutes

    return NextResponse.json({
      current: user.lives?.current || 0,
      max: user.lives?.max || 5,
      regenerationRate: user.lives?.regenerationRate || 4,
      timeUntilNext,
      canPlay: user.lives?.current || 0 > 0
    });
  } catch (error) {
    console.error("Erreur lors de la consommation d'une vie:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
