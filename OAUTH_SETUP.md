# Configuration des connexions OAuth Google et Facebook

## Variables d'environnement requises

Ajoutez les variables suivantes à votre fichier `.env.local` :

```env
# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

## Configuration Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API
4. Allez dans "Credentials" et cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configurez l'écran de consentement OAuth si nécessaire
6. Sélectionnez "Web application" comme type d'application
7. Ajoutez les URIs de redirection autorisés :
   - `http://localhost:3000/api/auth/callback/google` (développement)
   - `https://votre-domaine.com/api/auth/callback/google` (production)
8. Copiez le Client ID et Client Secret dans votre `.env.local`

## Configuration Facebook OAuth

1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Créez une nouvelle application ou sélectionnez une application existante
3. Allez dans "Settings" > "Basic" et notez l'App ID et App Secret
4. Allez dans "Products" et ajoutez "Facebook Login"
5. Dans les paramètres de Facebook Login, ajoutez les URIs de redirection OAuth :
   - `http://localhost:3000/api/auth/callback/facebook` (développement)
   - `https://votre-domaine.com/api/auth/callback/facebook` (production)
6. Copiez l'App ID et App Secret dans votre `.env.local`

## Fonctionnalités ajoutées

### Modèles de base de données
- **User** : Modèle utilisateur mis à jour pour supporter les connexions OAuth
- **Account** : Nouveau modèle pour stocker les comptes OAuth
- **Session** : Nouveau modèle pour gérer les sessions utilisateur
- **VerificationToken** : Nouveau modèle pour la vérification des emails

### Pages mises à jour
- **Page de connexion** (`/connexion`) : Ajout des boutons Google et Facebook
- **Page d'inscription** (`/register`) : Ajout des boutons Google et Facebook

### Configuration NextAuth
- Support des providers Google et Facebook
- Adaptateur MongoDB personnalisé
- Gestion des sessions en base de données
- Callbacks pour la gestion des rôles utilisateur

## Utilisation

Les utilisateurs peuvent maintenant :
1. Se connecter avec Google ou Facebook directement
2. Créer un compte avec email/mot de passe classique
3. Lier plusieurs comptes OAuth au même compte utilisateur
4. Bénéficier d'une interface utilisateur moderne et responsive

## Sécurité

- Les tokens OAuth sont stockés de manière sécurisée en base de données
- Les sessions utilisent une stratégie de base de données pour plus de sécurité
- Les mots de passe restent optionnels pour les utilisateurs OAuth
- Validation et nettoyage des données utilisateur
