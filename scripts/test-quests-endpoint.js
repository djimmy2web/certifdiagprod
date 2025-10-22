const fetch = require('node-fetch');

async function testQuestsEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint /api/me/quests...');
    
    // Attendre que le serveur démarre
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await fetch('http://localhost:3000/api/me/quests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Simuler une session (vous devrez peut-être ajuster selon votre auth)
        'Cookie': 'next-auth.session-token=test'
      }
    });
    
    console.log(`📡 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse de l\'API:');
      console.log(`   Success: ${data.success}`);
      console.log(`   Nombre de quêtes: ${data.quests?.length || 0}`);
      
      if (data.quests && data.quests.length > 0) {
        console.log('\n📋 Premières quêtes:');
        data.quests.slice(0, 3).forEach(quest => {
          console.log(`   - ${quest.title} (${quest.progress}/${quest.total})`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur de l\'API:');
      console.log(errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testQuestsEndpoint();
