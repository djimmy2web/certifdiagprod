import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getStripe } from '@/lib/stripe';

export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const user = await User.findById(session.user!.id).select('subscription email name isPro');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const subscription = user.subscription;
    const isPro = user.isPro || (subscription?.status === 'trial' || subscription?.status === 'active') && subscription?.plan !== 'free';
    
    // Si l'utilisateur a un abonnement Stripe, récupérer les détails
    let stripeSubscription = null;
    let paymentMethod = null;
    
    if (subscription?.stripeCustomerId) {
      const stripe = getStripe();
      
      try {
        // Récupérer l'abonnement Stripe
        if (subscription.stripeSubscriptionId) {
          stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        }
        
        // Récupérer les méthodes de paiement
        const paymentMethods = await stripe.paymentMethods.list({
          customer: subscription.stripeCustomerId,
          type: 'card',
        });
        
        if (paymentMethods.data.length > 0) {
          paymentMethod = paymentMethods.data[0].card;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données Stripe:', error);
      }
    }

    // Déterminer les avantages selon le plan
    const benefits = {
      free: [
        "Quiz de base",
        "Vies limitées",
        "Publicités"
      ],
      pro: [
        "Jeux interactifs",
        "Examens blancs", 
        "Vies illimitées",
        "Pas de publicité",
        "Revue des erreurs"
      ],
      premium: [
        "Tous les avantages Pro",
        "Support prioritaire",
        "Contenu exclusif",
        "Analyses avancées"
      ]
    };

    const planBenefits = benefits[subscription?.plan as keyof typeof benefits] || benefits.free;

    // Calculer la date de fin de période
    let nextPaymentDate = null;
    let nextPaymentAmount = 0;
    
    if (stripeSubscription) {
      try {
        const subscriptionData = stripeSubscription as { current_period_end?: number };
        if (subscriptionData.current_period_end) {
          const endDate = new Date(subscriptionData.current_period_end * 1000);
          nextPaymentDate = endDate.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          });
        }
      } catch (error) {
        console.error('Erreur lors du traitement de la date de fin de période:', error);
      }
      
      // Calculer le montant selon la durée et le plan
      const interval = stripeSubscription.items?.data[0]?.price?.recurring?.interval_count || 1;
      
      if (subscription && subscription.plan === 'pro') {
        if (interval === 3) {
          nextPaymentAmount = 47.97; // 3 mois Pro (15.99 x 3)
        } else {
          nextPaymentAmount = 15.99; // 1 mois Pro
        }
      } else if (subscription && subscription.plan === 'premium') {
        if (interval === 3) {
          nextPaymentAmount = 89.97; // 3 mois Premium (29.99 x 3)
        } else {
          nextPaymentAmount = 29.99; // 1 mois Premium
        }
      }
    }

    // Déterminer la durée de l'abonnement
    let subscriptionDuration = '1 mois';
    if (stripeSubscription) {
      const interval = stripeSubscription.items?.data[0]?.price?.recurring?.interval_count || 1;
      if (interval === 3) {
        subscriptionDuration = '3 mois';
      }
    }

    const subscriptionData = {
      currentPlan: subscription?.plan || 'free',
      planName: subscription?.plan === 'free' ? 'Gratuit' : 
               subscription?.plan === 'pro' ? 'CertifDiag Pro' : 'CertifDiag Premium',
      nextPayment: subscription?.plan === 'free' ? null : 
                   `${subscriptionDuration} d'abonnement ${subscription?.plan === 'pro' ? 'CertifDiag Pro' : 'CertifDiag Premium'}`,
      nextPaymentDate,
      nextPaymentAmount,
      subscriptionDuration,
      paymentMethod: paymentMethod ? {
        brand: paymentMethod.brand?.toUpperCase() || 'CARD',
        last4: paymentMethod.last4 || '****'
      } : null,
      isActive: subscription?.status === 'active',
      isPro,
      benefits: planBenefits,
      stripeCustomerId: subscription?.stripeCustomerId,
      currentPeriodEnd: subscription?.current_period_end
    };

    return NextResponse.json({
      success: true,
      subscription: subscriptionData
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    );
  }
}
