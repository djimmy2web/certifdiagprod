const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

async function makeMeAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Liste des utilisateurs:\n');
    
    // Récupérer tous les utilisateurs
    const users = await db.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    // Afficher tous les utilisateurs avec leur index
    users.forEach((user, index) => {
      const roleEmoji = user.role === 'admin' ? '👑' : '👤';
      console.log(`${index + 1}. ${roleEmoji} ${user.email || user.name || 'Sans email'} (${user.role || 'user'})`);
    });
    
    console.log('\n📧 Pour promouvoir un utilisateur en admin, utilisez:');
    console.log('   node scripts/make-me-admin.js <email>');
    console.log('\nExemple:');
    console.log('   node scripts/make-me-admin.js moi@test.com');
    console.log('');
    
    // Si un email est fourni en argument
    const emailArg = process.argv[2];
    
    if (emailArg) {
      const user = await db.collection('users').findOne({ email: emailArg });
      
      if (!user) {
        console.log(`❌ Utilisateur non trouvé: ${emailArg}`);
        console.log('Vérifiez l\'email et réessayez');
        return;
      }
      
      if (user.role === 'admin') {
        console.log(`ℹ️  ${emailArg} est déjà administrateur`);
        return;
      }
      
      // Promouvoir l'utilisateur
      const result = await db.collection('users').updateOne(
        { email: emailArg },
        { $set: { role: 'admin' } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`\n✅ SUCCÈS ! ${emailArg} est maintenant administrateur\n`);
        console.log('⚠️  IMPORTANT - Pour que les changements prennent effet:');
        console.log('   1. 🚪 Déconnectez-vous de l\'application');
        console.log('   2. 🔑 Reconnectez-vous avec vos identifiants');
        console.log('   3. ✨ Votre session sera mise à jour avec les droits admin');
        console.log('   4. 🎉 Vous pourrez alors accéder à la page d\'import\n');
      } else {
        console.log('❌ Erreur lors de la mise à jour');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

// Exécuter le script
makeMeAdmin()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

