# 🎯 Guide Rapide - Création de Thèmes et Quiz

## 📦 Ce qui a été créé pour vous

### ✅ Script automatique : `scripts/create-themes-and-quizzes.js`

Ce script va créer automatiquement :
- **8 thèmes** de diagnostics immobiliers
- **11 quiz** complets avec 33 questions au total
- **Tous les niveaux de difficulté** : débutant, apprenti, expert, spécialiste

### ✅ Fichier CSV : `quiz_diagnostics_complets.csv`

Un fichier CSV prêt à importer avec 4 quiz supplémentaires :
- Quiz Mesurage Loi Carrez (apprenti)
- Quiz Gaz Avancé (expert)
- Quiz Amiante Expert (expert)
- Quiz DPE Collectif (spécialiste)

### ✅ Documentation : `scripts/README-CREATION-THEMES-QUIZ.md`

Documentation complète avec tous les détails.

---

## 🚀 Comment utiliser ?

### Méthode 1 : Script automatique (RECOMMANDÉ)

#### Étape 1 : Assurez-vous que MongoDB est démarré

```powershell
# Vérifiez que MongoDB tourne
Get-Process mongod
```

#### Étape 2 : Exécutez le script

```powershell
# Depuis la racine du projet
node scripts/create-themes-and-quizzes.js
```

#### Étape 3 : Vérifiez la création

Le script affichera :
```
🚀 Création des thèmes et quiz...

✅ 8 nouveaux thèmes créés:
   - DPE - Performance Énergétique
   - Amiante
   - Plomb
   ...

✅ 11 nouveaux quiz créés:
   📚 DPE:
      - DPE - Les bases
      - DPE - Réglementation avancée
      ...

🎉 CRÉATION TERMINÉE AVEC SUCCÈS !
```

---

### Méthode 2 : Import CSV

Si vous préférez importer via CSV (après avoir créé l'API d'import) :

1. Utilisez le fichier `quiz_diagnostics_complets.csv`
2. Importez-le via votre interface d'administration
3. Ou utilisez l'API d'import si disponible

---

## 📊 Détail du contenu créé

### 🎨 Les 8 Thèmes

| Thème | Slug | Quiz disponibles |
|-------|------|------------------|
| DPE - Performance Énergétique | `dpe` | 3 quiz |
| Amiante | `amiante` | 1 quiz |
| Plomb | `plomb` | 1 quiz |
| Électricité | `electricite` | 2 quiz |
| Gaz | `gaz` | 1 quiz |
| Termites | `termites` | 1 quiz |
| Assainissement | `assainissement` | 1 quiz |
| État des Risques (ERP) | `erp` | 1 quiz |

### 📝 Les 11 Quiz (script automatique)

#### Niveau Débutant 🟢
1. **DPE - Les bases** : Durée de validité, classes énergétiques, mesures
2. **Amiante - Fondamentaux** : Biens concernés, validité, localisation
3. **Plomb - CREP Essentiels** : CREP, validité, seuils réglementaires
4. **Électricité - Diagnostic de base** : Installations concernées, validité, vérifications
5. **Gaz - État de l'installation** : Installations concernées, validité, contrôles
6. **Termites - État parasitaire** : Zones à risque, validité, parasites
7. **Assainissement - Les bases** : Assainissement non collectif, SPANC
8. **ERP - État des Risques** : Signification, validité, risques couverts

#### Niveau Apprenti 🟡
9. **DPE - Réglementation avancée** : Opposabilité, seuils de consommation, interdictions

#### Niveau Expert 🔴
10. **DPE Expert - Calculs et normes** : Méthode 3CL, surfaces, émissions GES
11. **Électricité Expert - Norme NFC 15-100** : Indice IP, volumes de sécurité, prises

### 📝 Les 4 Quiz supplémentaires (CSV)

#### Niveau Apprenti 🟡
- **Mesurage Loi Carrez** : Hauteur minimale, biens concernés, erreurs de surface

#### Niveau Expert 🔴
- **Gaz Avancé** : Points de contrôle, test d'étanchéité, détection CO
- **Amiante Expert** : Types de fibres, dangerosité, META

#### Niveau Spécialiste 🟣
- **DPE Collectif** : DPE en copropriété, obligations, évaluations

---

## 🎯 Exemples de questions

### Question Débutant (DPE)
```
❓ Quelle est la durée de validité d'un DPE ?
   A) 5 ans ❌ "Trop court, c'est 10 ans"
   B) 10 ans ✅ "Correct ! Le DPE est valable 10 ans"
   C) 15 ans ❌ "Trop long, c'est 10 ans"
   D) Illimité ❌ "Non, le DPE a une durée limitée"
```

### Question Expert (Électricité)
```
❓ Quel est le nombre minimum de prises par chambre selon la NFC 15-100 ?
   A) 1 prise ❌ "Non, c'est insuffisant"
   B) 3 prises ✅ "Exact ! Minimum 3 prises par chambre"
   C) 5 prises ❌ "Non, c'est le nombre pour le séjour"
   D) 6 prises ❌ "Non, c'est trop pour une chambre"
```

---

## 🔍 Vérification après création

### Vérifier dans MongoDB

```javascript
// Connexion à MongoDB
use certifdiag

// Compter les thèmes
db.themes.countDocuments()
// Doit retourner : 8

// Compter les quiz
db.quizzes.countDocuments()
// Doit retourner : 11 (ou plus si vous aviez déjà des quiz)

// Voir les thèmes
db.themes.find({}, {name: 1, slug: 1})

// Voir les quiz par thème
db.quizzes.find({themeSlug: "dpe"}, {title: 1, difficulty: 1})
```

### Tester sur l'application

Ouvrez votre navigateur :
- **Page d'accueil** : http://localhost:3000
- **Liste des thèmes** : http://localhost:3000/themes
- **Liste des quiz** : http://localhost:3000/quiz

---

## 🛠️ Personnalisation

### Ajouter vos propres quiz

1. Ouvrez `scripts/create-themes-and-quizzes.js`
2. Trouvez le tableau `quizzes` (ligne ~100)
3. Ajoutez votre quiz en suivant le modèle :

```javascript
{
  title: 'Mon Nouveau Quiz',
  description: 'Description de mon quiz',
  themeSlug: 'dpe',  // Utilisez un thème existant
  difficulty: 'debutant',  // debutant, apprenti, expert, specialiste, maitre
  questions: [
    {
      text: 'Votre question ici ?',
      explanation: 'Explication générale de la question',
      choices: [
        { 
          text: 'Réponse A', 
          isCorrect: true, 
          explanation: 'Pourquoi c\'est la bonne réponse' 
        },
        { 
          text: 'Réponse B', 
          isCorrect: false, 
          explanation: 'Pourquoi c\'est faux' 
        },
        { 
          text: 'Réponse C', 
          isCorrect: false, 
          explanation: 'Pourquoi c\'est faux' 
        },
        { 
          text: 'Réponse D', 
          isCorrect: false, 
          explanation: 'Pourquoi c\'est faux' 
        }
      ]
    },
    // Ajoutez d'autres questions...
  ],
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

4. Relancez le script : `node scripts/create-themes-and-quizzes.js`

### Ajouter un nouveau thème

Dans le même fichier, trouvez le tableau `themes` (ligne ~10) et ajoutez :

```javascript
{
  name: 'Mon Nouveau Thème',
  slug: 'mon-theme',  // Sans espaces, en minuscules
  iconUrl: '/icone-thematique.png',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

---

## 🐛 Résolution de problèmes

### ❌ Erreur : MongoDB n'est pas démarré

```
MongoServerError: connect ECONNREFUSED
```

**Solution** :
```powershell
# Démarrer MongoDB
net start MongoDB
```

### ❌ Les thèmes/quiz existent déjà

```
✅ Tous les thèmes existent déjà
✅ Tous les quiz existent déjà
```

**C'est normal !** Le script ne crée pas de doublons. Si vous voulez recréer :

```javascript
// Option 1 : Supprimer manuellement dans MongoDB
use certifdiag
db.themes.deleteMany({})
db.quizzes.deleteMany({})

// Option 2 : Changer les titres/slugs dans le script
```

### ❌ Erreur de variable d'environnement

**Solution** :
```powershell
# Définir la variable avant d'exécuter
$env:MONGODB_URI="mongodb://localhost:27017/certifdiag"
node scripts/create-themes-and-quizzes.js
```

---

## 📈 Statistiques

### Contenu total créé

- ✅ **8 thèmes** professionnels
- ✅ **15 quiz** (11 script + 4 CSV)
- ✅ **45 questions** au total
- ✅ **180 réponses** avec explications
- ✅ **Tous les niveaux** : débutant → spécialiste
- ✅ **Tous les diagnostics** : DPE, Amiante, Plomb, Gaz, Électricité, etc.

### Qualité du contenu

- ✅ Questions **réalistes** basées sur la réglementation française
- ✅ **Explications détaillées** pour chaque question
- ✅ **Feedback personnalisé** pour chaque réponse
- ✅ **Progression pédagogique** du débutant à l'expert
- ✅ **Références réglementaires** (Loi Carrez, NFC 15-100, etc.)

---

## 📚 Ressources

### Documentation officielle
- [Légifrance](https://www.legifrance.gouv.fr/) - Textes de loi
- [ANIL](https://www.anil.org/) - Agence Nationale pour l'Information sur le Logement
- [Promotelec](https://www.promotelec.com/) - Norme NFC 15-100

### Scripts utiles
- `scripts/check-themes.js` - Vérifier les thèmes créés
- `scripts/check-quiz-icons.js` - Vérifier les icônes
- `scripts/add-test-data.js` - Ajouter des données de test

---

## ✅ Checklist de vérification

Après l'exécution du script, vérifiez :

- [ ] MongoDB est démarré
- [ ] Le script s'est exécuté sans erreur
- [ ] 8 thèmes ont été créés (ou existaient déjà)
- [ ] 11 quiz ont été créés (ou existaient déjà)
- [ ] L'application affiche les nouveaux thèmes
- [ ] Les quiz sont accessibles et fonctionnels
- [ ] Les questions s'affichent correctement
- [ ] Les explications sont visibles après réponse

---

## 🎉 Félicitations !

Vous avez maintenant une base solide de contenu pour votre application CertifDiag !

**Prochaines étapes suggérées :**
1. ✅ Créer des utilisateurs de test : `node scripts/create-test-users.js`
2. ✅ Ajouter des tentatives de quiz : `node scripts/create-test-attempts.js`
3. ✅ Configurer le système de classement : `node scripts/setup-rankings-simple.js`
4. ✅ Tester l'application complète sur http://localhost:3000

---

**Besoin d'aide ?**
- Consultez `scripts/README-CREATION-THEMES-QUIZ.md` pour plus de détails
- Vérifiez les autres scripts dans le dossier `scripts/`
- Testez avec les scripts de vérification (`check-*.js`)

**Bon courage avec CertifDiag ! 🚀**

