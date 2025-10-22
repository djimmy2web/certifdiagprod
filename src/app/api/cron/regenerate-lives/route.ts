import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/mongodb';
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    // Vérifier la clé d'autorisation pour les tâches CRON
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectToDatabase();
    
    const now = new Date();
    let updatedUsers = 0;
    
    // Récupérer tous les utilisateurs qui ont besoin de régénération de vies
    const users = await User.find({
      'lives.current': { $lt: '$lives.max' }, // Vies actuelles < vies max
      'lives.lastRegeneration': { $exists: true }
    });

    for (const user of users) {
      if (!user.lives) continue;
      
      const lastRegen = new Date(user.lives.lastRegeneration);
      const hoursElapsed = Math.floor((now.getTime() - lastRegen.getTime()) / (1000 * 60 * 60));
      
      if (hoursElapsed >= user.lives.regenerationRate) {
        const livesToAdd = Math.floor(hoursElapsed / user.lives.regenerationRate);
        const newLives = Math.min(user.lives.current + livesToAdd, user.lives.max);
        
        if (newLives > user.lives.current) {
          user.lives.current = newLives;
          user.lives.lastRegeneration = new Date(
            lastRegen.getTime() + (livesToAdd * user.lives.regenerationRate * 60 * 60 * 1000)
          );
          
          await user.save();
          updatedUsers++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Régénération terminée. ${updatedUsers} utilisateurs mis à jour.`,
      timestamp: now.toISOString(),
      updatedUsers
    });

  } catch (error) {
    console.error("Erreur lors de la régénération des vies:", error);
    return NextResponse.json({ 
      error: "Erreur serveur lors de la régénération",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET pour les tests manuels (en développement uniquement)
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: "Disponible uniquement en développement" }, { status: 403 });
  }
  
  // Simuler un POST avec l'autorisation correcte
  const mockRequest = new Request('http://localhost:3000/api/cron/regenerate-lives', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`
    }
  });
  
  return POST(mockRequest as NextRequest);
}
