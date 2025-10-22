# 🏆 Scripts de Configuration des Classements

Ce dossier contient plusieurs scripts pour configurer et tester le système de classements et de divisions.

## 📁 Scripts Disponibles

### 1. `setup-rankings-simple.js` (Recommandé)
**Configuration simple et rapide**
- Utilise les utilisateurs existants ou en crée quelques-uns
- Crée les divisions si elles n'existent pas
- Attribue des points variés aux utilisateurs
- Génère les classements pour la semaine actuelle

```bash
node scripts/setup-rankings-simple.js
```

### 2. `add-test-rankings.js`
**Configuration complète avec données de test**
- Crée 18 utilisateurs de test avec des noms réalistes
- Crée 4 divisions (Saphir, Or, Argent, Bronze)
- Génère 4 semaines de classements historiques
- Parfait pour tester l'évolution des classements

```bash
node scripts/add-test-rankings.js
```

### 3. `add-quick-rankings.js`
**Configuration rapide avec utilisateurs existants**
- Utilise uniquement les utilisateurs existants
- Met à jour leurs points pour créer des divisions variées
- Génère les classements pour la semaine actuelle

```bash
node scripts/add-quick-rankings.js
```

### 4. `run-rankings-setup.js`
**Script interactif**
- Menu de sélection des options
- Exécute automatiquement le script choisi

```bash
node scripts/run-rankings-setup.js
# ou avec une option directe:
node scripts/run-rankings-setup.js 1
```

## 🎯 Divisions Configurées

| Division | Points Min | Points Max | Couleur | Ordre |
|----------|------------|------------|---------|-------|
| **Saphir** | 1000+ | - | Bleu (#3B82F6) | 1 |
| **Or** | 500 | 999 | Or (#F59E0B) | 2 |
| **Argent** | 150 | 499 | Argent (#6B7280) | 3 |
| **Bronze** | 10 | 149 | Bronze (#CD7F32) | 4 |

## 🚀 Utilisation Rapide

1. **Première fois** (recommandé):
   ```bash
   node scripts/setup-rankings-simple.js
   ```

2. **Test complet**:
   ```bash
   node scripts/add-test-rankings.js
   ```

3. **Avec utilisateurs existants**:
   ```bash
   node scripts/add-quick-rankings.js
   ```

## 📊 Données de Test Incluses

### Utilisateurs de Test (add-test-rankings.js)
- **Division Or**: Capitaine Vert, Horizon Perroquet, Kylian064, etc.
- **Division Argent**: Joueurs avec 150-499 points
- **Division Bronze**: Joueurs avec 10-149 points
- **Division Saphir**: Joueurs avec 1000+ points

### Classements Générés
- **Semaine actuelle**: Classements non traités (isProcessed: false)
- **3 semaines précédentes**: Classements traités avec variations de points
- **Statuts**: new, stayed, promoted, relegated

## 🔧 Configuration Requise

1. **Variables d'environnement**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/certifdiag
   ```

2. **Dépendances**:
   ```bash
   npm install mongoose dotenv
   ```

3. **Base de données**:
   - MongoDB doit être accessible
   - La base de données sera créée automatiquement si elle n'existe pas

## 🎨 Test de l'Interface

Après avoir exécuté un script:

1. **Accédez à la page des ligues**:
   ```
   http://localhost:3000/ligues
   ```

2. **Connectez-vous** avec un utilisateur existant

3. **Vérifiez**:
   - Les badges de division s'affichent
   - Le classement de votre division est visible
   - Les zones de promotion/régression sont marquées
   - Les cartes latérales (quiz, quêtes, XP) fonctionnent

## 🐛 Dépannage

### Erreur de connexion MongoDB
```bash
# Vérifiez que MongoDB est démarré
mongod

# Ou utilisez MongoDB Atlas
# Vérifiez votre MONGODB_URI dans .env
```

### Aucun classement affiché
```bash
# Vérifiez que les divisions existent
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Division = require('./src/models/Division').default;
  const divisions = await Division.find({});
  console.log('Divisions:', divisions.length);
  process.exit(0);
});
"
```

### Utilisateurs sans points
```bash
# Relancez le script simple
node scripts/setup-rankings-simple.js
```

## 📝 Notes

- Les scripts nettoient les données existantes avant de créer les nouvelles
- Les utilisateurs de test ont l'email `@test.com`
- Les classements sont créés pour la semaine actuelle (lundi)
- Les points sont attribués de manière aléatoire dans les plages définies

## 🔄 Réinitialisation

Pour recommencer complètement:

```bash
# Supprimer tous les classements et utilisateurs de test
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User').default;
  const WeeklyRanking = require('./src/models/WeeklyRanking').default;
  await User.deleteMany({ email: { \$regex: /@test\.com$/ } });
  await WeeklyRanking.deleteMany({});
  console.log('Données nettoyées');
  process.exit(0);
});
"

# Puis relancer un script
node scripts/setup-rankings-simple.js
```
