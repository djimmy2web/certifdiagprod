const fetch = require('node-fetch');

async function testAPIStreak() {
  try {
    console.log('🧪 Test de l\'API /api/stats/me...');
    
    const response = await fetch('http://localhost:3000/api/stats/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log(`❌ Erreur API: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Réponse API:');
    console.log(`   - Streak: ${data.totals?.streak || 'Non défini'}`);
    console.log(`   - Total Score: ${data.totals?.totalScore || 'Non défini'}`);
    console.log(`   - Total Attempts: ${data.totals?.totalAttempts || 'Non défini'}`);
    console.log(`   - Moyenne: ${data.totals?.avgScore || 'Non défini'}`);
    
    if (data.totals?.streak === 3) {
      console.log('🎉 Le streak est correctement à 3 jours !');
    } else {
      console.log(`⚠️ Le streak devrait être à 3 jours, mais il est à ${data.totals?.streak}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testAPIStreak();
