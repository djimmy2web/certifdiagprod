const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Script de configuration des classements');
console.log('==========================================\n');

console.log('Choisissez une option:');
console.log('1. Configuration simple (recommandé)');
console.log('2. Configuration complète avec données de test');
console.log('3. Configuration rapide avec utilisateurs existants');
console.log('4. Quitter\n');

// Simuler une entrée utilisateur (dans un vrai script, vous utiliseriez readline)
const option = process.argv[2] || '1';

switch (option) {
  case '1':
    console.log('🔧 Exécution de la configuration simple...\n');
    exec('node scripts/setup-rankings-simple.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erreur:', error);
        return;
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
    });
    break;

  case '2':
    console.log('🔧 Exécution de la configuration complète...\n');
    exec('node scripts/add-test-rankings.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erreur:', error);
        return;
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
    });
    break;

  case '3':
    console.log('🔧 Exécution de la configuration rapide...\n');
    exec('node scripts/add-quick-rankings.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erreur:', error);
        return;
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
    });
    break;

  case '4':
    console.log('👋 Au revoir !');
    break;

  default:
    console.log('❌ Option invalide. Utilisation de la configuration simple...\n');
    exec('node scripts/setup-rankings-simple.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erreur:', error);
        return;
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
    });
}

console.log('\n💡 Pour exécuter manuellement:');
console.log('node scripts/setup-rankings-simple.js');
console.log('node scripts/add-test-rankings.js');
console.log('node scripts/add-quick-rankings.js');
