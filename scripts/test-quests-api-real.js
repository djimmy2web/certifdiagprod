const fetch = require('node-fetch');

async function testQuestsAPIReal() {
  try {
    console.log('🧪 Test de l\'API réelle /api/me/quests...');
    
    // Tester l'API sans authentification
    console.log('\n1️⃣ Test sans authentification:');
    const response1 = await fetch('http://localhost:3000/api/me/quests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response1.status}`);
    const data1 = await response1.text();
    console.log(`   Response: ${data1.substring(0, 200)}...`);
    
    // Tester avec un cookie de session simulé
    console.log('\n2️⃣ Test avec cookie de session:');
    const response2 = await fetch('http://localhost:3000/api/me/quests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test-token'
      }
    });
    
    console.log(`   Status: ${response2.status}`);
    const data2 = await response2.text();
    console.log(`   Response: ${data2.substring(0, 200)}...`);
    
    // Tester l'endpoint de santé
    console.log('\n3️⃣ Test endpoint de santé:');
    const response3 = await fetch('http://localhost:3000/api/health', {
      method: 'GET'
    });
    
    console.log(`   Status: ${response3.status}`);
    const data3 = await response3.text();
    console.log(`   Response: ${data3}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)');
  }
}

testQuestsAPIReal();
