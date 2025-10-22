# 🏆 Système de Divisions et Classements

## Vue d'ensemble

Le système de divisions permet de classer les utilisateurs selon leurs points dans différentes catégories, avec des promotions et rétrogradations hebdomadaires automatiques.

## 🎯 Divisions

### Configuration des divisions

| Division | Points minimum | Points maximum | Couleur | Ordre |
|----------|---------------|----------------|---------|-------|
| **Saphir** | 1000+ | - | Bleu (#3B82F6) | 1 |
| **Or** | 500 | 999 | Or (#F59E0B) | 2 |
| **Argent** | 150 | 499 | Argent (#6B7280) | 3 |
| **Bronze** | 10 | 149 | Bronze (#CD7F32) | 4 |

### Règles de promotion/rétrogradation

- **Top 5** : Promotion vers la division supérieure
- **Bottom 5** : Rétrogradation vers la division inférieure
- **Entre les deux** : Maintien dans la division actuelle

## 📊 Modèles de données

### Division
```typescript
interface IDivision {
  name: string;           // Nom de la division
  minPoints: number;      // Points minimum requis
  maxPoints?: number;     // Points maximum (optionnel)
  color: string;          // Couleur de la division
  order: number;          // Ordre d'affichage
  promotionThreshold: number;    // Nombre de promotions (5)
  relegationThreshold: number;   // Nombre de rétrogradations (5)
}
```

### WeeklyRanking
```typescript
interface IWeeklyRanking {
  weekStart: Date;        // Début de semaine (lundi)
  weekEnd: Date;          // Fin de semaine (dimanche)
  divisionId: ObjectId;   // Référence à la division
  rankings: Array<{
    userId: ObjectId;     // Référence à l'utilisateur
    username: string;     // Nom d'utilisateur
    points: number;       // Points actuels
    rank: number;         // Position dans le classement
    status: 'promoted' | 'relegated' | 'stayed' | 'new';
  }>;
  isProcessed: boolean;   // Si les promotions ont été traitées
}
```

## 🔄 Processus hebdomadaire

### 1. Calcul des classements
- Récupération de tous les utilisateurs par division
- Tri par points décroissants
- Attribution des rangs
- Création/mise à jour des classements hebdomadaires

### 2. Traitement des promotions/rétrogradations
- Identification des top 5 et bottom 5 de chaque division
- Mise à jour des statuts (promoted/relegated/stayed)
- Modification des points des utilisateurs pour changer de division
- Marquage du classement comme traité

## 🛠️ API Routes

### Divisions
- `GET /api/divisions` - Récupérer toutes les divisions
- `POST /api/admin/divisions/init` - Initialiser les divisions

### Classements
- `GET /api/rankings/weekly` - Récupérer les classements hebdomadaires
- `POST /api/admin/rankings/calculate` - Calculer les classements
- `POST /api/admin/rankings/process-promotions` - Traiter promotions/rétrogradations
- `POST /api/admin/rankings/weekly-process` - Processus complet automatique

## 🎨 Composants React

### DivisionRanking
Affiche les classements par division avec :
- Sélection de semaine
- Affichage des top 10 par division
- Statuts visuels (promotion/rétrogradation)
- Couleurs par division

### UserDivision
Affiche la division actuelle d'un utilisateur :
- Indicateur coloré
- Nom de la division
- Points actuels

## 📱 Pages

### `/classement-divisions`
Page publique pour consulter les classements par division

### `/admin/divisions`
Interface d'administration pour :
- Initialiser les divisions
- Calculer les classements
- Traiter les promotions/rétrogradations
- Automatiser le processus hebdomadaire

## 🔧 Configuration

### Initialisation
1. Accéder à `/admin/divisions`
2. Cliquer sur "Initialiser les divisions"
3. Les 4 divisions seront créées avec les seuils définis

### Processus hebdomadaire
1. Sélectionner la semaine de début (lundi)
2. Cliquer sur "Calculer les classements"
3. Cliquer sur "Traiter promotions/rétrogradations"
4. Ou utiliser "Processus complet automatique"

## 📈 Logs et monitoring

Le système génère des logs détaillés :
- Début du processus hebdomadaire
- Calcul des classements par division
- Promotions et rétrogradations
- Résumé final

## 🎯 Utilisation

### Pour les utilisateurs
- Consulter leur division actuelle
- Voir les classements hebdomadaires
- Suivre leur progression

### Pour les administrateurs
- Gérer les divisions
- Déclencher les processus hebdomadaires
- Surveiller les promotions/rétrogradations

## 🔮 Améliorations futures

- Notifications automatiques pour les promotions/rétrogradations
- Historique des changements de division
- Statistiques détaillées par division
- Système de badges par division
- Classements historiques
