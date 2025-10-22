import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST() {
  try {
    await connectToDatabase();

    // Trouver tous les utilisateurs dont l'essai se termine aujourd'hui ou dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersWithEndingTrial = await User.find({
      'subscription.status': 'trial',
      'subscription.trial_end': { $lte: today }
    });

    console.log(`🔍 ${usersWithEndingTrial.length} utilisateurs avec essai terminé trouvés`);

    let processed = 0;
    let failed = 0;

    for (const user of usersWithEndingTrial) {
      try {
        // Calculer la prochaine période de facturation
        const nextBillingDate = new Date();
        if (user.subscription?.billing_period === 'quarterly') {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        } else {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        }

        // Mettre à jour le statut de l'abonnement
        await User.findByIdAndUpdate(user._id, {
          'subscription.status': 'active',
          'subscription.current_period_start': new Date(),
          'subscription.current_period_end': nextBillingDate,
          subscriptionStatus: 'active',
          isPro: true,
          updatedAt: new Date()
        });

        processed++;
        console.log(`✅ Abonnement activé pour l'utilisateur ${user.email}`);
      } catch (error) {
        console.error(`❌ Erreur pour l'utilisateur ${user.email}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Traitement terminé: ${processed} abonnements activés, ${failed} échecs`,
      processed,
      failed
    });

  } catch (error) {
    console.error('❌ Erreur lors du traitement des essais:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement des essais' },
      { status: 500 }
    );
  }
}

// Permettre l'accès depuis les cron jobs
export const dynamic = 'force-dynamic';

