import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import Division from '@/models/Division';
import WeeklyRanking from '@/models/WeeklyRanking';

export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const userId = session.user!.id;

    // Récupérer les points de l'utilisateur pour déterminer sa division
    const user = await User.findById(userId).select('points');
    if (!user || user.points === undefined) {
      return NextResponse.json({
        success: true,
        top3Count: 0
      });
    }

    // Trouver la division de l'utilisateur
    const divisions = await Division.find({}).sort({ order: 1 });
    const userPoints = user.points!;
    const userDivision = divisions.find((div: { minPoints: number; maxPoints?: number }) => {
      if (div.maxPoints) {
        return userPoints >= div.minPoints && userPoints <= div.maxPoints;
      }
      return userPoints >= div.minPoints;
    });

    if (!userDivision) {
      return NextResponse.json({
        success: true,
        top3Count: 0
      });
    }

    // Récupérer tous les classements hebdomadaires de la division de l'utilisateur
    const weeklyRankings = await WeeklyRanking.find({
      divisionId: userDivision._id
    }).sort({ weekStart: -1 });

    let top3Count = 0;

    // Compter le nombre de fois où l'utilisateur était dans le top 3
    for (const ranking of weeklyRankings) {
      const userRanking = ranking.rankings.find(
        (r: { userId: { toString: () => string } }) => r.userId.toString() === userId.toString()
      );
      
      if (userRanking && userRanking.rank <= 3) {
        top3Count++;
      }
    }

    return NextResponse.json({
      success: true,
      top3Count
    });

  } catch (error) {
    console.error('Erreur lors du calcul du top3Count:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du calcul du top3Count' },
      { status: 500 }
    );
  }
}
