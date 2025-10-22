const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  subscription: {
    plan: String,
    status: String,
    billing_period: String,
    trial_end: Date,
    current_period_start: Date,
    current_period_end: Date,
    price: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
  },
  subscriptionStatus: String,
  isPro: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUserSubscription() {
  try {
    console.log('🔌 Connexion à MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const email = 'djimmy.allard@hotmail.fr';
    console.log(`🔍 Recherche de l'utilisateur: ${email}\n`);

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ Utilisateur non trouvé dans la base de données\n');
      await mongoose.connection.close();
      return;
    }

    console.log('✅ Utilisateur trouvé!\n');
    console.log('📋 Informations de l\'utilisateur:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Nom: ${user.name || 'N/A'}`);
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${user._id}`);
    console.log(`\n🎯 Statut d'abonnement:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`isPro: ${user.isPro || false}`);
    console.log(`subscriptionStatus: ${user.subscriptionStatus || 'N/A'}`);
    
    if (user.subscription) {
      console.log(`\n📦 Détails de l'abonnement:`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Plan: ${user.subscription.plan || 'N/A'}`);
      console.log(`Status: ${user.subscription.status || 'N/A'}`);
      console.log(`Période de facturation: ${user.subscription.billing_period || 'N/A'}`);
      console.log(`Prix: ${user.subscription.price || 'N/A'}`);
      
      if (user.subscription.trial_end) {
        const trialEnd = new Date(user.subscription.trial_end);
        const now = new Date();
        const isTrialActive = trialEnd > now;
        console.log(`\n⏰ Période d'essai:`);
        console.log(`Fin de l'essai: ${trialEnd.toLocaleString('fr-FR')}`);
        console.log(`Essai actif: ${isTrialActive ? '✅ OUI' : '❌ NON (expiré)'}`);
      }
      
      if (user.subscription.current_period_start && user.subscription.current_period_end) {
        console.log(`\n📅 Période de facturation actuelle:`);
        console.log(`Début: ${new Date(user.subscription.current_period_start).toLocaleString('fr-FR')}`);
        console.log(`Fin: ${new Date(user.subscription.current_period_end).toLocaleString('fr-FR')}`);
      }
      
      if (user.subscription.stripeCustomerId) {
        console.log(`\n💳 Stripe:`);
        console.log(`Customer ID: ${user.subscription.stripeCustomerId}`);
        console.log(`Subscription ID: ${user.subscription.stripeSubscriptionId || 'N/A'}`);
      }
    } else {
      console.log(`\n❌ Aucune information d'abonnement trouvée`);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Déterminer si l'utilisateur devrait voir les bannières
    const shouldSeeBanner = !user.isPro && 
                           (!user.subscription || 
                            user.subscription.plan === 'free' || 
                            !['trial', 'active', 'trialing'].includes(user.subscription.status));
    
    console.log(`🎨 Affichage des bannières Pro: ${shouldSeeBanner ? '✅ OUI (non abonné)' : '❌ NON (abonné)'}\n`);

    await mongoose.connection.close();
    console.log('🔌 Connexion fermée\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkUserSubscription();

