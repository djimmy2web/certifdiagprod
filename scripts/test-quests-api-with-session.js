const fetch = require('node-fetch');

async function testQuestsAPIWithSession() {
  try {
    console.log('🧪 Test de l\'API /api/me/quests avec session...');
    
    // D'abord, se connecter pour obtenir une session
    console.log('\n1️⃣ Connexion pour obtenir une session...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test150505050@example.com',
        password: 'password123'
      })
    });
    
    console.log(`   Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      const cookies = loginResponse.headers.get('set-cookie');
      console.log(`   Cookies: ${cookies ? 'Oui' : 'Non'}`);
      
      // Tester l'API des quêtes avec les cookies
      console.log('\n2️⃣ Test de l\'API des quêtes avec session...');
      const questsResponse = await fetch('http://localhost:3000/api/me/quests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        }
      });
      
      console.log(`   Status: ${questsResponse.status}`);
      const questsData = await questsResponse.text();
      console.log(`   Response: ${questsData.substring(0, 500)}...`);
      
      if (questsResponse.status === 200) {
        try {
          const parsed = JSON.parse(questsData);
          console.log(`   Success: ${parsed.success}`);
          console.log(`   Quêtes: ${parsed.quests ? parsed.quests.length : 'N/A'}`);
        } catch (e) {
          console.log('   Erreur de parsing JSON');
        }
      }
    } else {
      console.log('   Échec de la connexion');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)');
  }
}

testQuestsAPIWithSession();
