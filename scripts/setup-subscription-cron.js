const cron = require('node-cron');
require('dotenv').config();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Fonction pour traiter les essais qui expirent
async function processExpiringTrials() {
  try {
    console.log('🔄 Traitement des essais gratuits qui expirent...');
    
    const response = await fetch(`${API_BASE_URL}/api/subscription/process-trials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ ${data.message}`);
    } else {
      console.error('❌ Erreur lors du traitement des essais:', data.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel API (essais):', error);
  }
}

// Fonction pour traiter les renouvellements d'abonnements
async function processRenewals() {
  try {
    console.log('🔄 Traitement des renouvellements d\'abonnements...');
    
    const response = await fetch(`${API_BASE_URL}/api/subscription/process-renewals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ ${data.message}`);
    } else {
      console.error('❌ Erreur lors du traitement des renouvellements:', data.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel API (renouvellements):', error);
  }
}

// Fonction qui exécute tous les traitements
async function processAllSubscriptions() {
  console.log('⏰ Cron job déclenché: Traitement des abonnements');
  await processExpiringTrials();
  await processRenewals();
  console.log('✅ Traitement terminé\n');
}

// Exécuter tous les jours à minuit
cron.schedule('0 0 * * *', processAllSubscriptions);

console.log('✅ Cron job de gestion des abonnements démarré');
console.log('📅 Sera exécuté tous les jours à minuit');
console.log(`🌐 API URL: ${API_BASE_URL}\n`);

// Garder le script en cours d'exécution
process.on('SIGINT', () => {
  console.log('👋 Arrêt du cron job');
  process.exit(0);
});

