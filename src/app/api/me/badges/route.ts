import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/mongodb';
import { UserBadge } from '@/models/UserBadge';
import { Badge } from '@/models/Badge';
import { Attempt } from '@/models/Attempt';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(session.user!.id);

    // Récupérer tous les badges disponibles
    const allBadges = await Badge.find({ isActive: true }).lean();

    // Récupérer les badges de l'utilisateur
    const userBadges = await UserBadge.find({ userId }).populate('badgeId').lean();

    // Créer un set des IDs de badges obtenus par l'utilisateur
    const userBadgeIds = new Set(userBadges.map(ub => ub.badgeId._id.toString()));

    // Calculer la progression pour chaque badge
    const badgesWithProgress = await Promise.all(
      allBadges.map(async (badge) => {
        const isEarned = userBadgeIds.has(badge._id.toString());
        let progress = 0;
        let current = 0;
        let total = 0;

        if (isEarned) {
          progress = 100;
          current = total = 1;
        } else {
          // Calculer la progression selon les critères du badge
          if (badge.criteria.minScore) {
            // Badge basé sur le score minimal
            const attempts = await Attempt.find({ userId }).lean();
            const qualifyingAttempts = attempts.filter(attempt => 
              attempt.score >= (badge.criteria.minScore || 0)
            );
            
            current = qualifyingAttempts.length;
            total = badge.criteria.minScore || 1; // Utiliser le score minimal comme objectif
            progress = Math.min((current / total) * 100, 100);
          } else if (badge.criteria.quizId) {
            // Badge basé sur un quiz spécifique
            const attempt = await Attempt.findOne({ 
              userId, 
              quizId: badge.criteria.quizId 
            }).lean();
            
            if (attempt) {
              current = attempt.score || 0;
              total = 100; // Score maximal possible
              progress = Math.min((current / total) * 100, 100);
            }
          } else {
            // Badge générique - basé sur le nombre total de quiz complétés
            const totalAttempts = await Attempt.countDocuments({ userId });
            current = totalAttempts;
            total = 10; // Objectif par défaut
            progress = Math.min((current / total) * 100, 100);
          }
        }

        return {
          id: badge._id.toString(),
          title: badge.title,
          description: badge.description || '',
          isEarned,
          progress: Math.round(progress),
          current,
          total,
          awardedAt: isEarned ? userBadges.find(ub => ub.badgeId._id.toString() === badge._id.toString())?.awardedAt : null
        };
      })
    );

    // Trier par progression décroissante puis par titre
    badgesWithProgress.sort((a, b) => {
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      if (a.progress !== b.progress) return b.progress - a.progress;
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json({
      success: true,
      badges: badgesWithProgress
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des badges' },
      { status: 500 }
    );
  }
}
