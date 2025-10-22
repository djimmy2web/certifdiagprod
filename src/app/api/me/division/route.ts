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

    const user = await User.findById(session.user!.id).select('points');
    if (!user || user.points === undefined) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé ou points manquants' },
        { status: 404 }
      );
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
        division: {
          name: 'Non classé',
          color: '#6B7280',
          rank: 0,
          weeklyXP: 0
        }
      });
    }

    // Calculer la semaine actuelle
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);

    // Trouver le classement hebdomadaire de l'utilisateur
    const weeklyRanking = await WeeklyRanking.findOne({
      weekStart: monday,
      divisionId: userDivision._id
    });

    let rank = 0;
    let weeklyXP = 0;

    if (weeklyRanking) {
      const userRanking = weeklyRanking.rankings.find(
        (r: { userId: { toString: () => string } }) => r.userId.toString() === session.user!.id
      );
      if (userRanking) {
        rank = userRanking.rank;
        weeklyXP = userRanking.weeklyXP || 0;
      }
    }

    return NextResponse.json({
      success: true,
      division: {
        name: userDivision.name,
        color: userDivision.color,
        rank,
        weeklyXP
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la division:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la division' },
      { status: 500 }
    );
  }
}
