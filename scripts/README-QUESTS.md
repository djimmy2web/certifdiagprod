# Système de Quêtes

Ce guide explique comment ajouter et gérer les quêtes dans l'application CertifDiag.

## 🚀 Installation rapide

### 1. Configuration

Assurez-vous que votre fichier `.env` contient la variable `MONGODB_URI` :

```env
MONGODB_URI=mongodb://localhost:27017/certifdiag
# ou
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/certifdiag
```

### 2. Installation des dépendances

Si ce n'est pas déjà fait :

```bash
npm install
```

### 3. Ajouter toutes les quêtes

Pour créer/réinitialiser toutes les quêtes dans la base de données :

```bash
node scripts/add-quests.js
```

⚠️ **Attention** : Ce script supprimera toutes les quêtes existantes et les remplacera par les nouvelles.

## 📋 Liste des quêtes disponibles

### Quêtes XP (3)
- ⭐ Gagne 20 XP
- 🌟 Gagne 50 XP
- 💫 Gagne 100 XP

### Quêtes de réponses d'affilée (6)
- 🔥 3 réponses d'affilée
- ⚡ 5 réponses d'affilée
- 🎯 10 réponses d'affilée
- 🔥 Donne 5 bonnes réponses d'affilée dans 3 leçons
- 🔥 Donne 5 bonnes réponses d'affilée dans 4 leçons
- 💎 Répondre correctement à 10 questions d'affilée

### Quêtes de quiz terminés (5)
- 📝 Termine 1 quiz
- 📚 Termine 2 quiz
- 🎯 Termine 3 quiz
- 📖 Termine 4 quiz
- 🏆 Termine 5 quiz

### Quêtes de questions (2)
- ❓ Réponds à 20 questions
- ❔ Réponds à 40 questions

### Quêtes de badges (1)
- 🏅 Débloque 1 badge

### Quêtes de score (2)
- 🎯 Obtiens un score d'au moins 80% dans 3 leçons
- 🎯 Obtiens un score d'au moins 80% dans 4 leçons

### Quêtes de leçons (1)
- 🔄 Reprends une leçon

### Quêtes d'erreurs (1)
- 🔍 Quiz sur tes erreurs

**Total : 21 quêtes**

## 🔧 Structure d'une quête

Chaque quête possède la structure suivante :

```javascript
{
  title: 'Nom de la quête',
  description: 'Description détaillée',
  icon: '🎯',
  isActive: true,
  criteria: {
    type: 'xp' | 'streak' | 'quiz_completed' | 'questions_answered' | 'badge_unlocked' | 'score_threshold' | 'correct_streak' | 'lesson_resumed' | 'error_quiz',
    value: 20, // Valeur cible
    additionalData: {
      minScore: 80, // Pour score_threshold
      lessonCount: 3, // Pour score_threshold ou correct_streak
      streakCount: 5 // Pour correct_streak
    }
  },
  reward: {
    xp: 10 // Récompense en XP
  }
}
```

## 📊 Types de critères

| Type | Description | Exemple |
|------|-------------|---------|
| `xp` | Gagner X points d'expérience | Gagne 20 XP |
| `correct_streak` | X bonnes réponses consécutives | 5 réponses d'affilée |
| `quiz_completed` | Terminer X quiz | Termine 3 quiz |
| `questions_answered` | Répondre à X questions | Réponds à 20 questions |
| `badge_unlocked` | Débloquer X badges | Débloque 1 badge |
| `score_threshold` | Score minimum dans X leçons | 80% dans 3 leçons |
| `lesson_resumed` | Reprendre X leçons | Reprends une leçon |
| `error_quiz` | Faire un quiz sur ses erreurs | Quiz sur tes erreurs |

## 🛠️ Scripts disponibles

### Créer/Réinitialiser les quêtes
```bash
node scripts/add-quests.js
```

### Vérifier les quêtes existantes
```bash
node scripts/verify-quests.js
```

### Autres scripts
- `setup-quests-mongoose.js` - Alternative pour créer les quêtes
- `setup-quests-simple.js` - Version simplifiée
- `setup-quest-progress.js` - Gérer la progression des quêtes

## 🧪 Tests

Pour tester le système de quêtes :

```bash
# Tester l'API des quêtes
node scripts/test-quests-api.js

# Tester avec authentification
node scripts/test-auth-quests.js
```

## 💡 Conseils

- Les quêtes sont créées avec `isActive: true` par défaut
- Chaque quête offre une récompense en XP
- Les utilisateurs peuvent suivre leur progression via `QuestProgress`
- Les quêtes sont automatiquement validées lors des actions des utilisateurs
- **Seulement 3 quêtes sont affichées par jour** sur le dashboard
- **Les 3 quêtes du jour changent automatiquement chaque jour** (basé sur un algorithme avec la date comme seed)
- Tous les utilisateurs voient les mêmes 3 quêtes le même jour

## 🔍 Dépannage

### Erreur de connexion MongoDB
Vérifiez que :
- Le fichier `.env` contient `MONGODB_URI`
- MongoDB est en cours d'exécution (si local)
- Les identifiants sont corrects (si distant)

### Les quêtes n'apparaissent pas
1. Vérifiez que le script s'est exécuté sans erreur
2. Vérifiez dans MongoDB que les quêtes existent : `db.quests.find()`
3. Vérifiez que `isActive` est `true`

### Problème de doublons
Exécutez à nouveau `node scripts/add-quests.js` pour nettoyer et recréer toutes les quêtes.

