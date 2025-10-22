const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';
const EMAIL = process.argv[2] || 'donova371@outlook.com';

async function setPaidSubscription() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Trouver l'utilisateur
    const user = await users.findOne({ email: EMAIL });
    
    if (!user) {
      console.log(`❌ Utilisateur avec l'email ${EMAIL} non trouvé`);
      return;
    }
    
    console.log(`\n📧 Utilisateur trouvé: ${user.name} (${user.email})`);
    console.log(`📊 Statut actuel: ${user.subscription?.status || 'aucun'}`);
    console.log(`📦 Plan actuel: ${user.subscription?.plan || 'aucun'}`);
    
    // Calculer la date de fin d'abonnement (3 mois à partir d'aujourd'hui)
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);
    
    // Mise à jour de l'abonnement
    const updateResult = await users.updateOne(
      { email: EMAIL },
      {
        $set: {
          isPro: true,
          'subscription.status': 'active',
          'subscription.plan': 'pro',
          'subscription.current_period_end': endDate,
          'subscription.stripeCustomerId': user.subscription?.stripeCustomerId || `cus_test_${Date.now()}`,
          'subscription.stripeSubscriptionId': user.subscription?.stripeSubscriptionId || `sub_test_${Date.now()}`,
          'subscription.paymentMethod': {
            brand: 'visa',
            last4: '4242'
          },
          updatedAt: new Date()
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('\n✅ Abonnement mis à jour avec succès !');
      console.log('\n📊 Nouvelles informations:');
      console.log(`   - Statut: active`);
      console.log(`   - Plan: pro (CertifDiag Pro)`);
      console.log(`   - Fin de période: ${endDate.toLocaleDateString('fr-FR')}`);
      console.log(`   - Carte: Visa se terminant par 4242`);
      console.log(`   - Durée: 3 mois`);
    } else {
      console.log('\n⚠️  Aucune modification effectuée');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connexion fermée');
  }
}

setPaidSubscription();

