import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const { plan, price, trialDays } = await request.json();
    
    const userId = new mongoose.Types.ObjectId(session.user!.id);

    // Calculer la date de fin d'essai (3 jours à partir de maintenant)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + (trialDays || 3));

    // Calculer la prochaine date de facturation selon le plan
    const nextBillingDate = new Date(trialEndDate);
    if (plan === "3 mois") {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    // Mettre à jour l'utilisateur avec les informations d'abonnement
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        subscription: {
          status: 'trial', // Commence en trial
          plan: 'pro',
          billing_period: plan === "3 mois" ? 'quarterly' : 'monthly',
          trial_end: trialEndDate,
          current_period_start: new Date(),
          current_period_end: nextBillingDate,
          price: price,
        },
        subscriptionStatus: 'trial',
        isPro: true,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Abonnement activé avec succès',
      subscription: {
        status: 'trial',
        plan: plan,
        trial_end: trialEndDate,
        next_billing_date: nextBillingDate
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'abonnement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'activation de l\'abonnement' },
      { status: 500 }
    );
  }
}

