import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/mongodb';
import { Attempt } from '@/models/Attempt';

export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const userId = session.user!.id;
    
    // Calculer le lundi de cette semaine
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);

    const weeklyStreak = [];
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);

      // Vérifier s'il y a eu des tentatives ce jour
      const hasAttempts = await Attempt.exists({
        userId,
        createdAt: { $gte: currentDate, $lt: nextDate }
      });

      // Vérifier si c'est un jour futur
      const isFuture = currentDate > now;
      
      weeklyStreak.push({
        day: days[i],
        completed: !!hasAttempts && !isFuture,
        broken: !hasAttempts && !isFuture && currentDate < now
      });
    }

    return NextResponse.json({
      success: true,
      weeklyStreak
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails de série:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des détails de série' },
      { status: 500 }
    );
  }
}
