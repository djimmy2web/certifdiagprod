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

    const weeklyData = [];
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);

      // Récupérer les tentatives de ce jour
      const attempts = await Attempt.find({
        userId,
        createdAt: { $gte: currentDate, $lt: nextDate }
      });

      const dailyXP = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
      
      weeklyData.push({
        day: days[i],
        xp: dailyXP,
        isHighest: false // Sera calculé après
      });
    }

    // Trouver le jour avec le plus d'XP
    const maxXP = Math.max(...weeklyData.map(d => d.xp));
    weeklyData.forEach(day => {
      day.isHighest = day.xp === maxXP && day.xp > 0;
    });

    return NextResponse.json({
      success: true,
      weeklyData
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des XP hebdomadaires:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des XP hebdomadaires' },
      { status: 500 }
    );
  }
}
