# 💳 Page de Gestion d'Abonnement

## 📍 URL de la page

**Route** : `/gestion-abonnement`

## ✨ Fonctionnalités

### Pour les utilisateurs abonnés

La page affiche :
- ✅ **Badge Pro** avec message de bienvenue personnalisé
- ✅ **Liste des avantages** de CertifDiag Pro
- ✅ **Détails de l'abonnement** :
  - Plan actuel
  - Prochain paiement (date et montant)
  - Mode de paiement (carte avec 4 derniers chiffres)
- ✅ **Actions disponibles** :
  - Annuler l'abonnement (avec confirmation)
  - Mettre à jour le mode de paiement
  - Accéder aux préférences et au profil
  - Centre d'aide

### Pour les utilisateurs sans abonnement

La page affiche :
- 📋 **Liste des avantages** de CertifDiag Pro
- 🎯 **Call-to-action** pour s'abonner
- 📌 **Liens** vers les offres d'abonnement

## 🎨 Design

Le design est basé sur les maquettes fournies avec :
- Layout responsive (desktop & mobile)
- Animations au chargement
- Design moderne et épuré
- Typographie personnalisée (Gilroy)

## 🔌 Intégration API

### Endpoints utilisés

1. **`GET /api/me/subscription`**
   - Récupère les données d'abonnement de l'utilisateur connecté
   - Retourne :
     - Plan actuel
     - Statut d'abonnement
     - Date de prochain paiement
     - Montant
     - Méthode de paiement

2. **`POST /api/billing/portal`**
   - Crée une session du portail de facturation Stripe
   - Permet de :
     - Annuler l'abonnement
     - Mettre à jour le mode de paiement
     - Voir l'historique des factures

## 📦 Composant

**Fichier** : `src/components/SubscriptionManagementSection.tsx`

Le composant est réutilisable et peut être intégré dans d'autres pages.

### Props

Aucune props requise - Le composant récupère les données automatiquement via l'API.

### Utilisation

```tsx
import { SubscriptionManagementSection } from "@/components/SubscriptionManagementSection";

export default function MaPage() {
  return (
    <div>
      <SubscriptionManagementSection />
    </div>
  );
}
```

## 🔒 Sécurité

- ✅ **Authentification requise** : Redirection vers `/connexion` si non connecté
- ✅ **Sessions validées** : Utilisation de `next-auth` pour la sécurité
- ✅ **Données personnelles** : Uniquement visibles par le propriétaire du compte

## 🎯 Avantages affichés

1. **Jeux interactifs** 🎮
2. **Examens blancs** 📝
3. **Vies illimitées** ❤️
4. **Pas de publicité** 🚫
5. **Revue des erreurs** 📊

## 🌐 Navigation

La page inclut des liens vers :

### Section "Compte"
- Préférences (`/preferences?tab=preferences`)
- Profil (`/preferences?tab=profile`)

### Section "Abonnement"
- Modifier/Choisir un abonnement (`/subscription`)

### Section "Assistance"
- Centre d'aide (email : `support@certifdiag.fr`)

## 📱 Responsive Design

### Desktop (>1024px)
- Layout en deux colonnes
- Section principale : 700px
- Sidebar : 350px
- Gap : 48px

### Tablette (768px - 1024px)
- Layout en deux colonnes adaptées
- Largeurs flexibles

### Mobile (<768px)
- Layout en une colonne
- Stack vertical
- Pleine largeur

## 🎨 Animations

Toutes les sections ont des animations au chargement :
- `[--animation-delay:0ms]` - Titre principal
- `[--animation-delay:200ms]` - Avantages
- `[--animation-delay:400ms]` - Détails abonnement
- `[--animation-delay:600ms]` - Sidebar

## 💡 États de chargement

Le composant gère 3 états :

1. **Loading** : Spinner pendant le chargement
2. **Subscribed** : Interface complète pour les abonnés
3. **Free** : Interface simplifiée avec CTA pour s'abonner

## 🔄 Gestion des erreurs

- **Erreur API** : Message d'erreur dans la console
- **Erreur Stripe** : Alerte utilisateur
- **Session expirée** : Redirection vers connexion

## 🧪 Tests

Pour tester la page :

### En local

```bash
# Démarrer l'application
npm run dev

# Ouvrir dans le navigateur
http://localhost:3000/gestion-abonnement
```

### Utilisateurs de test

1. **Utilisateur Free** : 
   - Voir l'interface sans abonnement
   - CTA visible

2. **Utilisateur Pro** :
   - Voir tous les détails d'abonnement
   - Actions d'annulation disponibles

## 📋 Checklist d'intégration

- [x] Composant créé
- [x] Page créée
- [x] APIs intégrées
- [x] Design responsive
- [x] Animations ajoutées
- [x] Gestion des erreurs
- [x] États de chargement
- [x] Navigation fonctionnelle
- [x] Portail Stripe intégré

## 🚀 Déploiement

Aucune configuration supplémentaire requise. La page utilise les variables d'environnement existantes :

- `NEXTAUTH_URL` : URL de retour après Stripe
- `STRIPE_SECRET_KEY` : Clé API Stripe
- Variables d'environnement Stripe déjà configurées

## 📞 Support

Pour toute question ou problème :
- Email : support@certifdiag.fr
- Issue tracker : Créer une issue sur le repo

---

**Créé le** : Janvier 2025  
**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0

