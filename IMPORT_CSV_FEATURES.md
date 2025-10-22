# Fonctionnalité d'Import CSV pour les Administrateurs

## 🎯 Vue d'ensemble

Cette fonctionnalité permet aux administrateurs d'importer des utilisateurs en masse via un fichier CSV, facilitant la gestion de grands volumes d'utilisateurs.

## 📁 Structure des fichiers

### API Routes
- `src/app/api/admin/users/import/route.ts` - API pour l'import CSV
- `src/app/api/admin/users/route.ts` - API pour récupérer la liste des utilisateurs
- `src/app/api/admin/users/[id]/route.ts` - API pour modifier/supprimer un utilisateur

### Pages
- `src/app/(dashboard)/admin/users/page.tsx` - Page de gestion des utilisateurs
- `src/app/(dashboard)/admin/users/import/page.tsx` - Page d'import CSV

### Composants
- `src/components/AdminNavigation.tsx` - Navigation d'administration

## 🚀 Fonctionnalités

### 1. Import CSV

#### Format du fichier CSV
Le fichier CSV doit contenir les colonnes suivantes :
```csv
email,name,role,password
john@example.com,John Doe,user,password123
jane@example.com,Jane Smith,admin,securepass
```

#### Colonnes requises
- **email** (obligatoire) : Adresse email de l'utilisateur
- **name** (obligatoire) : Nom complet de l'utilisateur

#### Colonnes optionnelles
- **role** : "user" ou "admin" (par défaut : "user")
- **password** : Mot de passe de l'utilisateur

#### Options d'import
- **Génération automatique de mots de passe** : Si activée, génère des mots de passe aléatoires pour les utilisateurs qui n'en ont pas
- **Envoi d'emails de bienvenue** : Option pour envoyer des emails (non implémentée)

### 2. Gestion des utilisateurs

#### Fonctionnalités
- **Liste des utilisateurs** avec filtres et recherche
- **Modification des rôles** en temps réel
- **Suppression d'utilisateurs** avec confirmation
- **Statistiques** : nombre de tentatives, dernière connexion
- **Recherche** par nom ou email
- **Filtrage** par rôle (utilisateur/administrateur)

#### Sécurité
- **Vérification des doublons** : Les utilisateurs existants sont ignorés
- **Validation des données** : Vérification des emails et mots de passe
- **Protection contre l'auto-suppression** : Un admin ne peut pas supprimer son propre compte
- **Suppression en cascade** : Suppression des tentatives associées

### 3. Interface d'administration

#### Navigation
- **Menu déroulant** pour les pages d'administration
- **Indicateurs visuels** pour la page active
- **Accès rapide** aux différentes sections

#### Tableau de bord
- **Statistiques en temps réel** :
  - Total des utilisateurs
  - Nombre d'utilisateurs vs administrateurs
  - Utilisateurs actifs (avec dernière connexion)

## 🔧 Configuration technique

### Validation des données
```typescript
const UserImportSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(1, "Nom requis"),
  role: z.enum(["user", "admin"]).default("user"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères").optional(),
});
```

### Génération de mots de passe
```typescript
function generateRandomPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

### Traitement des erreurs
- **Validation des en-têtes** : Vérification de la présence des colonnes requises
- **Gestion des doublons** : Identification et rapport des utilisateurs existants
- **Erreurs de validation** : Rapport détaillé des erreurs par ligne
- **Résumé d'import** : Statistiques des succès, échecs et ignorés

## 📊 Résultats d'import

### Rapport détaillé
- **Utilisateurs importés** : Liste des utilisateurs créés avec succès
- **Erreurs** : Détail des erreurs par ligne
- **Statistiques** : Total, importés, échecs, ignorés

### Export des résultats
- **Téléchargement CSV** : Export des résultats d'import
- **Format** : email, nom, rôle, mot de passe, statut, erreur

## 🎨 Interface utilisateur

### Page d'import
- **Upload de fichier** avec validation
- **Aperçu des données** (5 premières lignes)
- **Options d'import** configurables
- **Résultats en temps réel**

### Page de gestion
- **Tableau interactif** avec tri et filtres
- **Actions en ligne** (modification de rôle, suppression)
- **Recherche** par nom ou email
- **Statistiques** visuelles

## 🚀 Utilisation

### Pour les administrateurs

1. **Accéder à l'import** : `/admin/users/import`
2. **Télécharger le modèle** : Utiliser le bouton "Télécharger le modèle CSV"
3. **Préparer le fichier** : Remplir le CSV avec les données des utilisateurs
4. **Configurer les options** : Choisir les options d'import
5. **Importer** : Cliquer sur "Importer les utilisateurs"
6. **Vérifier les résultats** : Consulter le rapport d'import
7. **Télécharger les résultats** : Exporter le rapport si nécessaire

### Gestion quotidienne

1. **Accéder à la gestion** : `/admin/users`
2. **Rechercher un utilisateur** : Utiliser la barre de recherche
3. **Modifier un rôle** : Utiliser le menu déroulant dans le tableau
4. **Supprimer un utilisateur** : Cliquer sur "Supprimer" avec confirmation

## 🔮 Évolutions futures

### Fonctionnalités prévues
- **Envoi d'emails de bienvenue** automatique
- **Import de quiz** via CSV
- **Export des utilisateurs** en CSV
- **Historique des modifications** des rôles
- **Notifications** lors de l'import

### Améliorations techniques
- **Validation avancée** des emails (vérification de domaine)
- **Compression** des fichiers CSV volumineux
- **Import asynchrone** pour les gros volumes
- **API REST** pour l'intégration externe

## 📝 Notes importantes

### Bonnes pratiques
- **Vérifier les données** avant l'import
- **Sauvegarder** avant les imports massifs
- **Tester** avec un petit fichier d'abord
- **Communiquer** les mots de passe générés aux utilisateurs

### Limitations
- **Taille de fichier** : Limite recommandée de 1000 lignes
- **Types de fichiers** : CSV uniquement
- **Encodage** : UTF-8 recommandé
- **Séparateurs** : Virgules uniquement

### Sécurité
- **Authentification** : Réservé aux administrateurs
- **Validation** : Vérification stricte des données
- **Audit** : Logs des actions d'import
- **Backup** : Sauvegarde automatique avant suppression
