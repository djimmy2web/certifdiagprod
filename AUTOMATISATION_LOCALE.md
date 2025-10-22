# 🏆 Automatisation Locale des Divisions

Ce guide explique comment configurer l'automatisation des divisions pour un environnement local.

## 📋 Vue d'ensemble

Le système de divisions se met à jour automatiquement chaque lundi à 00:00. Voici les différentes options pour l'environnement local :

## 🚀 Options d'automatisation

### Option 1 : Déclenchement manuel (Recommandé pour le développement)

```bash
# Déclencher le processus manuellement
npm run auto-process
```

**Avantages :**
- Simple à utiliser
- Contrôle total sur le timing
- Idéal pour les tests

### Option 2 : Cron job local

```bash
# Installer la dépendance node-cron
npm install node-cron

# Démarrer le cron job (chaque lundi à 00:00)
npm run cron:start

# Tester le processus
npm run cron:test
```

**Avantages :**
- Automatisation complète
- Fonctionne même quand l'application n'est pas ouverte
- Logs détaillés

### Option 3 : Via l'interface d'administration

1. Aller sur `/admin/divisions`
2. Cliquer sur "🚀 Déclencher maintenant"

## ⚙️ Configuration

### Variables d'environnement

Ajoutez dans votre fichier `.env.local` :

```env
# Token pour sécuriser l'API d'automatisation
CRON_SECRET_TOKEN=votre-token-secret-ici

# URL de votre application (optionnel)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Initialisation des divisions

Avant d'utiliser l'automatisation, initialisez les divisions :

1. Aller sur `/admin/divisions`
2. Cliquer sur "Initialiser les divisions"

## 📊 Fonctionnement du processus

### Ce qui se passe automatiquement :

1. **Calcul de la semaine** : Le système détermine automatiquement le lundi de la semaine actuelle
2. **Vérification des doublons** : Évite de traiter la même semaine plusieurs fois
3. **Calcul des classements** : Pour chaque division (Saphir, Or, Argent, Bronze)
4. **Promotions/Rétrogradations** : 
   - Top 5 → Promotion vers la division supérieure
   - Bottom 5 → Rétrogradation vers la division inférieure
   - Entre les deux → Maintien dans la division actuelle
5. **Mise à jour des points** : Ajustement automatique des points des utilisateurs

### Logs et monitoring

Le processus génère des logs détaillés :

```
🚀 Processus automatique hebdomadaire - Semaine du 2024-01-15T00:00:00.000Z
📊 Calcul automatique des classements...
✅ Classement calculé pour Saphir: 12 joueurs
✅ Classement calculé pour Or: 25 joueurs
✅ Classement calculé pour Argent: 45 joueurs
✅ Classement calculé pour Bronze: 78 joueurs
🔄 Traitement automatique des promotions et rétrogradations...
⬆️ John Doe promu de Or vers Saphir
⬇️ Jane Smith rétrogradé de Argent vers Bronze
✅ Processus automatique hebdomadaire terminé avec succès
```

## 🔧 Dépannage

### Problème : "Processus déjà exécuté pour cette semaine"

**Solution :** C'est normal ! Le système évite les doublons. Attendez la semaine suivante ou modifiez la date dans la base de données.

### Problème : Erreur de connexion

**Solution :** Vérifiez que votre application Next.js est en cours d'exécution sur le port 3000.

### Problème : Erreur d'autorisation

**Solution :** Vérifiez que la variable `CRON_SECRET_TOKEN` est correctement configurée.

## 📅 Planification pour la production

Quand vous déployez en production, vous pouvez :

1. **Utiliser Vercel Cron Jobs** (si vous utilisez Vercel)
2. **Configurer un vrai cron job** sur votre serveur
3. **Utiliser un service comme GitHub Actions** pour les tâches planifiées

## 🎯 Recommandations

- **Développement** : Utilisez `npm run auto-process` pour les tests
- **Tests** : Utilisez `npm run cron:test` pour vérifier le fonctionnement
- **Production** : Configurez un vrai cron job ou utilisez les services de votre hébergeur

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console
2. Vérifiez que toutes les dépendances sont installées
3. Vérifiez la configuration des variables d'environnement
4. Testez avec `npm run cron:test` pour diagnostiquer
