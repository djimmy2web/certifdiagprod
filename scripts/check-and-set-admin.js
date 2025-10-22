const { MongoClient } = require('mongodb');
const readline = require('readline');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certifdiag';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function checkAndSetAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Vérification des utilisateurs admin...\n');
    
    // Récupérer tous les utilisateurs
    const users = await db.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('Veuillez d\'abord créer un compte sur l\'application');
      return;
    }
    
    console.log(`📊 ${users.length} utilisateur(s) trouvé(s):\n`);
    
    // Afficher tous les utilisateurs
    users.forEach((user, index) => {
      const roleEmoji = user.role === 'admin' ? '👑' : '👤';
      console.log(`${index + 1}. ${roleEmoji} ${user.email || user.name || 'Sans email'}`);
      console.log(`   - Nom: ${user.name || 'Non défini'}`);
      console.log(`   - Email: ${user.email || 'Non défini'}`);
      console.log(`   - Rôle: ${user.role || 'user'}`);
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Custom ID: ${user.customId || 'Non défini'}`);
      console.log('');
    });
    
    // Vérifier s'il y a déjà un admin
    const adminUsers = users.filter(u => u.role === 'admin');
    
    if (adminUsers.length > 0) {
      console.log(`✅ ${adminUsers.length} administrateur(s) trouvé(s):`);
      adminUsers.forEach(admin => {
        console.log(`   👑 ${admin.email || admin.name}`);
      });
      console.log('');
    } else {
      console.log('⚠️  Aucun administrateur trouvé\n');
    }
    
    // Demander quelle action effectuer
    console.log('Actions disponibles:');
    console.log('1. Promouvoir un utilisateur en admin');
    console.log('2. Rétrograder un admin en utilisateur');
    console.log('3. Quitter');
    console.log('');
    
    const action = await question('Choisissez une action (1-3): ');
    
    if (action === '1') {
      // Promouvoir en admin
      const email = await question('Entrez l\'email de l\'utilisateur à promouvoir: ');
      
      const user = await db.collection('users').findOne({ email: email.trim() });
      
      if (!user) {
        console.log('❌ Utilisateur non trouvé avec cet email');
        return;
      }
      
      if (user.role === 'admin') {
        console.log('ℹ️  Cet utilisateur est déjà administrateur');
        return;
      }
      
      const result = await db.collection('users').updateOne(
        { email: email.trim() },
        { $set: { role: 'admin' } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`\n✅ Succès ! ${email} est maintenant administrateur`);
        console.log('');
        console.log('⚠️  IMPORTANT : Pour que les changements prennent effet:');
        console.log('   1. Déconnectez-vous de l\'application');
        console.log('   2. Reconnectez-vous avec vos identifiants');
        console.log('   3. Votre session sera mise à jour avec les droits admin');
        console.log('');
      } else {
        console.log('❌ Erreur lors de la mise à jour');
      }
      
    } else if (action === '2') {
      // Rétrograder un admin
      const email = await question('Entrez l\'email de l\'admin à rétrograder: ');
      
      const user = await db.collection('users').findOne({ email: email.trim() });
      
      if (!user) {
        console.log('❌ Utilisateur non trouvé avec cet email');
        return;
      }
      
      if (user.role !== 'admin') {
        console.log('ℹ️  Cet utilisateur n\'est pas administrateur');
        return;
      }
      
      const result = await db.collection('users').updateOne(
        { email: email.trim() },
        { $set: { role: 'user' } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`\n✅ ${email} n'est plus administrateur`);
      } else {
        console.log('❌ Erreur lors de la mise à jour');
      }
      
    } else {
      console.log('👋 Au revoir !');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    rl.close();
    await client.close();
  }
}

// Exécuter le script
checkAndSetAdmin()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

