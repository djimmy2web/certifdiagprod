const fetch = require('node-fetch');

async function testQuestsEndpointWithAuth() {
  try {
    console.log('🧪 Test de l\'endpoint /api/me/quests avec authentification...');
    
    // Test de l'endpoint des quêtes
    const response = await fetch('http://localhost:3000/api/me/quests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📡 Status: ${response.status}`);
    console.log(`📡 Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse de l\'API:');
      console.log(`   Success: ${data.success}`);
      console.log(`   Nombre de quêtes: ${data.quests?.length || 0}`);
      
      if (data.quests && data.quests.length > 0) {
        console.log('\n📋 Premières quêtes:');
        data.quests.slice(0, 5).forEach(quest => {
          console.log(`   - ${quest.title} (${quest.progress}/${quest.total}) - ${quest.completed ? '✅' : '⏳'}`);
        });
        
        const completedQuests = data.quests.filter(q => q.completed).length;
        console.log(`\n🎉 ${completedQuests}/${data.quests.length} quêtes complétées`);
      } else {
        console.log('❌ PROBLÈME: Aucune quête retournée par l\'API');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur de l\'API:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${errorText}`);
      
      if (response.status === 401) {
        console.log('🔐 Problème d\'authentification - vérifiez votre session');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testQuestsEndpointWithAuth();
