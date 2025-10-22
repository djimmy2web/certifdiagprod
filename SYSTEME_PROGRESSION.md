# Système de Progression avec Vies

## Vue d'ensemble

Le système de progression avec vies permet aux utilisateurs de progresser dans les quiz de manière interactive, avec un système de 5 vies par quiz. Ce système remplace l'ancien système de soumission unique et offre une expérience plus engageante.

## Fonctionnalités principales

### 🎮 Système de vies
- **5 vies par quiz** : Chaque utilisateur commence avec 5 vies
- **Perte de vie** : Une vie est perdue à chaque mauvaise réponse
- **Échec du quiz** : Le quiz se termine quand toutes les vies sont perdues
- **Succès** : Le quiz est réussi quand toutes les questions sont répondues

### 📊 Progression en temps réel
- **Question par question** : Les utilisateurs répondent une question à la fois
- **Feedback immédiat** : Affichage du résultat (correct/incorrect) après chaque réponse
- **Explications** : Affichage des explications pour les réponses incorrectes
- **Barre de progression** : Visualisation de l'avancement dans le quiz

### 🔄 Reprise de session
- **Sauvegarde automatique** : La progression est sauvegardée automatiquement
- **Reprise possible** : Les utilisateurs peuvent reprendre un quiz en cours
- **Réinitialisation** : Possibilité de recommencer un quiz depuis le début

## Modèles de données

### QuizProgress
```typescript
interface IQuizProgress {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  lives: number; // 0-5
  currentQuestionIndex: number;
  answers: {
    questionIndex: number;
    choiceIndex: number;
    isCorrect: boolean;
    answeredAt: Date;
  }[];
  isCompleted: boolean;
  isFailed: boolean;
  startedAt: Date;
  completedAt?: Date;
  lastActivityAt: Date;
}
```

## Routes API

### Démarrer un quiz
```
POST /api/quizzes/[id]/start
```
- Crée ou récupère la progression pour un quiz
- Retourne la première question et l'état de la progression

### Répondre à une question
```
POST /api/quizzes/[id]/answer
```
- Traite la réponse de l'utilisateur
- Met à jour les vies et la progression
- Retourne le résultat et la question suivante

### Récupérer la progression
```
GET /api/quizzes/[id]/progress
```
- Retourne l'état actuel de la progression
- Permet de reprendre un quiz en cours

### Réinitialiser la progression
```
POST /api/quizzes/[id]/reset
```
- Supprime la progression existante
- Permet de recommencer le quiz

### Statistiques d'administration
```
GET /api/admin/stats/progress
```
- Statistiques globales des progressions
- Données par quiz et par utilisateur
- Activité récente

## Interface utilisateur

### Page de quiz
- **En-tête** : Titre du quiz, barre de progression, affichage des vies
- **Question actuelle** : Affichage de la question avec ses choix
- **Feedback** : Affichage du résultat après chaque réponse
- **Résultats finaux** : Score final et possibilité de recommencer

### Interface d'administration
- **Statistiques globales** : Nombre total de progressions, taux de réussite
- **Statistiques par quiz** : Performance de chaque quiz
- **Statistiques par utilisateur** : Performance de chaque utilisateur
- **Activité récente** : Dernières activités des utilisateurs

## Flux utilisateur

1. **Démarrage** : L'utilisateur clique sur "Commencer le quiz"
2. **Question** : Affichage de la question actuelle avec 5 vies
3. **Réponse** : L'utilisateur sélectionne une réponse
4. **Feedback** : Affichage du résultat (correct/incorrect)
5. **Progression** : Passage à la question suivante ou fin du quiz
6. **Résultat** : Affichage du score final et possibilité de recommencer

## États du quiz

### En cours
- `isCompleted: false`
- `isFailed: false`
- `lives > 0`
- `currentQuestionIndex < totalQuestions`

### Terminé avec succès
- `isCompleted: true`
- `isFailed: false`
- `currentQuestionIndex >= totalQuestions`

### Échoué
- `isCompleted: false`
- `isFailed: true`
- `lives === 0`

## Intégration avec l'existant

### Compatibilité
- Le système de progression coexiste avec l'ancien système de tentatives
- Les tentatives finales sont toujours créées dans la collection `Attempt`
- Les badges sont attribués normalement

### Migration
- Les anciens quiz continuent de fonctionner
- Les nouveaux quiz utilisent automatiquement le système de progression
- Pas de migration de données nécessaire

## Avantages

### Pour les utilisateurs
- **Engagement** : Expérience plus interactive et engageante
- **Feedback** : Retour immédiat sur les réponses
- **Persistance** : Possibilité de reprendre un quiz en cours
- **Motivation** : Système de vies ajoute du challenge

### Pour les administrateurs
- **Analytics** : Données détaillées sur la progression
- **Monitoring** : Suivi en temps réel de l'activité
- **Optimisation** : Identification des questions difficiles
- **Engagement** : Mesure de l'engagement des utilisateurs

## Configuration

### Nombre de vies
Le nombre de vies par quiz est configuré dans le modèle `QuizProgress` :
```typescript
lives: { type: Number, required: true, default: 5, min: 0, max: 5 }
```

### Index de base de données
```typescript
// Index unique pour éviter les doublons
QuizProgressSchema.index({ userId: 1, quizId: 1 }, { unique: true });

// Index pour les requêtes de performance
QuizProgressSchema.index({ userId: 1, lastActivityAt: -1 });
```

## Sécurité

- **Authentification** : Toutes les routes nécessitent une session valide
- **Validation** : Validation des données d'entrée avec Zod
- **Autorisation** : Vérification des permissions utilisateur
- **Intégrité** : Contraintes de base de données pour éviter les incohérences
