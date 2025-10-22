import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST() {
  try {
    await connectToDatabase();

    // Trouver tous les utilisateurs dont la période de facturation se termine aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersToRenew = await User.find({
      'subscription.status': 'active',
      'subscription.current_period_end': { $lte: today }
    });

    console.log(`🔍 ${usersToRenew.length} abonnements à renouveler trouvés`);

    let renewed = 0;
    let failed = 0;

    for (const user of usersToRenew) {
      try {
        // Calculer la prochaine période de facturation
        const currentPeriodStart = new Date();
        const nextBillingDate = new Date();
        
        if (user.subscription?.billing_period === 'quarterly') {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        } else if (user.subscription?.billing_period === 'yearly') {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        } else {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        }

        // Mettre à jour la période de facturation
        await User.findByIdAndUpdate(user._id, {
          'subscription.current_period_start': currentPeriodStart,
          'subscription.current_period_end': nextBillingDate,
          'subscription.status': 'active',
          subscriptionStatus: 'active',
          isPro: true,
          updatedAt: new Date()
        });

        renewed++;
        console.log(`✅ Abonnement renouvelé pour l'utilisateur ${user.email} - Prochaine facturation: ${nextBillingDate.toLocaleDateString('fr-FR')}`);
      } catch (error) {
        console.error(`❌ Erreur pour l'utilisateur ${user.email}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Traitement terminé: ${renewed} abonnements renouvelés, ${failed} échecs`,
      renewed,
      failed
    });

  } catch (error) {
    console.error('❌ Erreur lors du traitement des renouvellements:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement des renouvellements' },
      { status: 500 }
    );
  }
}

// Permettre l'accès depuis les cron jobs
export const dynamic = 'force-dynamic';

