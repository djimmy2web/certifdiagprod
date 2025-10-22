#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Configuration des données de test pour saphir5@test.com\n');

try {
  // Vérifier si node_modules existe
  const fs = require('fs');
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    console.log('📦 Installation des dépendances...');
    execSync('npm install', { stdio: 'inherit' });
  }
  
  // Exécuter le script d'insertion simple
  console.log('💾 Insertion des données de test simples...');
  execSync('node scripts/setup-simple-test-data.js', { stdio: 'inherit' });
  
  console.log('\n✅ Configuration terminée !');
  console.log('🌐 Vous pouvez maintenant visiter http://localhost:3000 pour voir les données');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'exécution:', error.message);
  process.exit(1);
}
