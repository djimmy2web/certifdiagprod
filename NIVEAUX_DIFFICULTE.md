# 📊 Niveaux de Difficulté des Quiz

## ✅ Niveaux acceptés

Voici les **5 niveaux de difficulté** valides pour les quiz CertifDiag :

| Niveau | Slug | Description | Utilisation |
|--------|------|-------------|-------------|
| 🟢 **Débutant** | `debutant` | Questions de base, fondamentaux | Apprentissage initial |
| 🟡 **Apprenti** | `apprenti` | Questions intermédiaires | Après les bases |
| 🟠 **Expert** | `expert` | Questions techniques avancées | Maîtrise approfondie |
| 🔴 **Spécialiste** | `specialiste` | Questions très pointues | Expertise sectorielle |
| 🟣 **Maître** | `maitre` | Questions de niveau master | Maîtrise complète |

## ⚠️ Attention

**N'utilisez PAS** : 
- ❌ `intermediaire` (ancien nom, obsolète)
- ❌ `moyen` (non supporté)
- ❌ `avance` (non supporté)

## 📝 Utilisation dans les fichiers CSV

### Format correct :

```csv
quiz_title,description,difficulty,is_published,question_text,...
"Mon Quiz","Description",debutant,true,"Question ?",...
"Quiz Avancé","Description",apprenti,true,"Question ?",...
"Quiz Expert","Description",expert,true,"Question ?",...
"Quiz Pro","Description",specialiste,false,"Question ?",...
"Quiz Master","Description",maitre,false,"Question ?",...
```

### ❌ Format incorrect :

```csv
quiz_title,description,difficulty,is_published,question_text,...
"Mon Quiz","Description",intermediaire,true,"Question ?",...  ❌ ERREUR
"Mon Quiz","Description",moyen,true,"Question ?",...          ❌ ERREUR
```

## 🔄 Migration

Si vous avez des anciens fichiers CSV avec `intermediaire`, remplacez-le par `apprenti` :

```bash
# PowerShell
(Get-Content fichier.csv) -replace 'intermediaire','apprenti' | Set-Content fichier.csv

# Unix/Mac
sed -i 's/intermediaire/apprenti/g' fichier.csv
```

## 📚 Exemples de répartition

### Progression typique pour un thème :

1. **Quiz Introduction** → `debutant` (3-5 questions simples)
2. **Quiz Réglementation** → `apprenti` (5-8 questions avec cas pratiques)
3. **Quiz Technique** → `expert` (8-10 questions pointues)
4. **Quiz Normes avancées** → `specialiste` (10+ questions très techniques)
5. **Quiz Certification** → `maitre` (questions niveau professionnel)

### Exemple concret (DPE) :

```
DPE - Les bases              → debutant     (Validité, classes, etc.)
DPE - Réglementation         → apprenti     (Opposabilité, seuils, dates)
DPE - Calculs et méthodes    → expert       (Méthode 3CL, surfaces)
DPE - Audit énergétique      → specialiste  (Normes précises, calculs complexes)
DPE - Certification          → maitre       (Niveau professionnel certifié)
```

## 🎯 Critères de choix

### 🟢 Débutant
- Questions à choix unique évident
- Vocabulaire simple
- Réponses binaires (oui/non, vrai/faux)
- Pas de calculs

### 🟡 Apprenti
- Nécessite compréhension des concepts
- Quelques pièges légers
- Dates et chiffres clés
- Cas pratiques simples

### 🟠 Expert
- Normes et références précises
- Calculs ou raisonnements
- Distinctions fines entre options
- Connaissance approfondie

### 🔴 Spécialiste
- Cas particuliers et exceptions
- Références normatives précises
- Méthodologies avancées
- Niveau professionnel

### 🟣 Maître
- Questions de certification
- Expertises multiples combinées
- Cas complexes réels
- Niveau consultant/formateur

## 🔧 Correction des erreurs

### Erreur courante lors de l'import :

```
Error [ZodError]: Invalid input
path: ["quizzes", 0, "difficulty"]
values: ["debutant", "apprenti", "expert", "specialiste", "maitre"]
```

**Solution** : Vérifiez que votre CSV utilise uniquement les 5 valeurs autorisées.

### Script de vérification :

Créez un fichier `verify-difficulty.js` :

```javascript
const fs = require('fs');
const csv = fs.readFileSync('votre_fichier.csv', 'utf-8');
const lines = csv.split('\n');

const validLevels = ['debutant', 'apprenti', 'expert', 'specialiste', 'maitre'];
const errors = [];

lines.forEach((line, index) => {
  const match = line.match(/,([^,]+),/);
  if (match && !validLevels.includes(match[1].trim())) {
    errors.push(`Ligne ${index + 1}: "${match[1]}" n'est pas valide`);
  }
});

if (errors.length > 0) {
  console.log('❌ Erreurs trouvées:');
  errors.forEach(e => console.log(e));
} else {
  console.log('✅ Tous les niveaux sont valides');
}
```

## 📖 Références

- Modèle : `src/models/Quiz.ts` (ligne 30)
- API Import : `src/app/api/admin/quizzes/import/route.ts` (ligne 27)
- Interface : `src/app/(dashboard)/admin/quizzes/import/page.tsx`

## 💡 Conseils

1. **Commencez simple** : Créez d'abord des quiz `debutant` et `apprenti`
2. **Progressez graduellement** : Ajoutez des quiz `expert` une fois que vous avez du contenu de base
3. **Réservez les niveaux élevés** : `specialiste` et `maitre` pour du contenu vraiment avancé
4. **Testez l'import** : Utilisez le template fourni pour éviter les erreurs

## 🎓 Statistiques recommandées

Pour un thème complet :

- **40%** de quiz `debutant` (accessibilité)
- **30%** de quiz `apprenti` (progression)
- **20%** de quiz `expert` (approfondissement)
- **10%** de quiz `specialiste` + `maitre` (excellence)

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 2.0 (Harmonisation des niveaux)

