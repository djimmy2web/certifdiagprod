# 🎯 Création de Thèmes et Quiz

Ce guide explique comment utiliser le script de création automatique de thèmes et quiz pour l'application CertifDiag.

## 📋 Contenu créé

### 🎨 8 Thèmes de diagnostics immobiliers :

1. **DPE - Performance Énergétique** (`dpe`)
2. **Amiante** (`amiante`)
3. **Plomb** (`plomb`)
4. **Électricité** (`electricite`)
5. **Gaz** (`gaz`)
6. **Termites** (`termites`)
7. **Assainissement** (`assainissement`)
8. **État des Risques (ERP)** (`erp`)

### 📝 11 Quiz avec questions réalistes :

#### Niveau Débutant (8 quiz)
- DPE - Les bases
- Amiante - Fondamentaux
- Plomb - CREP Essentiels
- Électricité - Diagnostic de base
- Gaz - État de l'installation
- Termites - État parasitaire
- Assainissement - Les bases
- ERP - État des Risques et Pollutions

#### Niveau Apprenti (1 quiz)
- DPE - Réglementation avancée

#### Niveau Expert (2 quiz)
- DPE Expert - Calculs et normes
- Électricité Expert - Norme NFC 15-100

### 📊 Statistiques des quiz :
- **Total : 33 questions**
- **132 réponses** (4 choix par question)
- Toutes les questions ont des **explications détaillées**
- Toutes les réponses ont des **feedbacks personnalisés**

## 🚀 Utilisation

### Prérequis
- MongoDB doit être démarré
- Les variables d'environnement doivent être configurées

### Exécution du script

```bash
# Depuis la racine du projet
node scripts/create-themes-and-quizzes.js
```

### Avec variable d'environnement personnalisée

```bash
MONGODB_URI="mongodb://localhost:27017/certifdiag" node scripts/create-themes-and-quizzes.js
```

## ✨ Fonctionnalités du script

✅ **Vérification des doublons** : Le script ne crée pas de doublons (vérifie les slugs et titres existants)

✅ **Création intelligente** : Ajoute uniquement les thèmes et quiz qui n'existent pas déjà

✅ **Affichage détaillé** : Rapport complet de ce qui a été créé

✅ **Gestion d'erreurs** : Gestion propre des erreurs avec messages clairs

## 📖 Structure des quiz

Chaque quiz contient :
- Un **titre** explicite
- Une **description** claire
- Un **thème** (slug)
- Un **niveau de difficulté** (debutant, apprenti, expert, specialiste, maitre)
- Des **questions** avec :
  - Texte de la question
  - Explication générale
  - 4 choix de réponse
  - Indication de la bonne réponse
  - Explication pour chaque choix

## 🎓 Niveaux de difficulté

- **debutant** : Questions de base, connaissances essentielles
- **apprenti** : Questions intermédiaires, réglementation
- **expert** : Questions techniques avancées, normes précises
- **specialiste** : Questions très pointues (non utilisé dans ce script)
- **maitre** : Questions d'expert absolu (non utilisé dans ce script)

## 🔍 Vérification post-création

Après l'exécution, vous pouvez vérifier :

```bash
# Vérifier les thèmes créés
node scripts/check-themes.js

# Vérifier un utilisateur et ses données
node scripts/check-user.js
```

## 🌐 Tester l'application

Après l'exécution du script, visitez :
- http://localhost:3000 - Page d'accueil
- http://localhost:3000/quiz - Liste des quiz
- http://localhost:3000/themes - Liste des thèmes

## 📝 Exemple de sortie

```
🚀 Création des thèmes et quiz...

✅ 8 nouveaux thèmes créés:
   - DPE - Performance Énergétique
   - Amiante
   - Plomb
   - Électricité
   - Gaz
   - Termites
   - Assainissement
   - État des Risques (ERP)

✅ 11 nouveaux quiz créés:

   📚 DPE:
      - DPE - Les bases
      - DPE - Réglementation avancée
      - DPE Expert - Calculs et normes

   📚 AMIANTE:
      - Amiante - Fondamentaux

   ... (etc)

============================================================
🎉 CRÉATION TERMINÉE AVEC SUCCÈS !
============================================================

📊 STATISTIQUES FINALES:
   ✓ Nombre total de thèmes : 8
   ✓ Nombre total de quiz : 11

📋 DÉTAIL PAR THÈME:
   • DPE - Performance Énergétique (dpe) : 3 quiz
   • Amiante (amiante) : 1 quiz
   • Plomb (plomb) : 1 quiz
   • Électricité (electricite) : 2 quiz
   • Gaz (gaz) : 1 quiz
   • Termites (termites) : 1 quiz
   • Assainissement (assainissement) : 1 quiz
   • État des Risques (ERP) (erp) : 1 quiz

🌐 Vous pouvez maintenant tester sur http://localhost:3000
============================================================
```

## 🛠️ Personnalisation

Pour ajouter vos propres quiz :

1. Ouvrez `scripts/create-themes-and-quizzes.js`
2. Ajoutez un nouvel objet dans le tableau `quizzes`
3. Suivez la structure existante
4. Relancez le script

### Exemple de structure :

```javascript
{
  title: 'Mon Quiz Personnalisé',
  description: 'Description de mon quiz',
  themeSlug: 'nom-du-theme',
  difficulty: 'debutant',
  questions: [
    {
      text: 'Ma question ?',
      explanation: 'Explication de la question',
      choices: [
        { text: 'Choix A', isCorrect: true, explanation: 'Pourquoi A est correct' },
        { text: 'Choix B', isCorrect: false, explanation: 'Pourquoi B est faux' },
        { text: 'Choix C', isCorrect: false, explanation: 'Pourquoi C est faux' },
        { text: 'Choix D', isCorrect: false, explanation: 'Pourquoi D est faux' }
      ]
    }
  ],
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## 🐛 Dépannage

### Erreur de connexion MongoDB
```
❌ Erreur: MongoServerError: connect ECONNREFUSED
```
**Solution** : Vérifiez que MongoDB est démarré

### Erreur de doublons
```
❌ Erreur: E11000 duplicate key error
```
**Solution** : Le script vérifie normalement les doublons. Si cette erreur apparaît, vérifiez votre base de données.

## 📚 Ressources

- [Documentation MongoDB](https://www.mongodb.com/docs/)
- [Réglementation diagnostics immobiliers](https://www.legifrance.gouv.fr/)
- [Norme NFC 15-100](https://www.promotelec.com/)

## 📧 Support

Pour toute question ou problème, consultez les autres scripts de la section `scripts/` ou créez une issue.

---

**Créé avec ❤️ pour CertifDiag**

