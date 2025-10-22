"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuizAudio } from "@/hooks/useAudio";

interface VocabularyWord {
  _id: string;
  word: string;
  correctDefinition: string;
  wrongDefinitions: string[];
  difficulty: "debutant" | "intermediaire" | "expert";
  category?: string;
}

interface QuizState {
  currentWordIndex: number;
  score: number;
  totalQuestions: number;
  showResult: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  completed: boolean;
}

export default function VocabulairePage() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentWordIndex: 0,
    score: 0,
    totalQuestions: 0,
    showResult: false,
    selectedAnswer: null,
    isCorrect: null,
    completed: false
  });
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Hook pour jouer les sons de quiz
  const { playCorrect, playWrong, playFinish } = useQuizAudio();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const getCelebrationMessage = () => {
    const messages = [
      {
        title: "Tu viens d'enchaîner 5 bonnes réponses !",
        subtitle: "Ta progression est impressionnante, continue comme ça 🚀"
      },
      {
        title: "5 sur 5, ton cerveau carbure !",
        subtitle: "Continue sur cette lancée ⚡"
      },
      {
        title: "Bravo ! 5 réussites non-stop.",
        subtitle: "Tu es sur la bonne voie 🚀"
      }
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  useEffect(() => {
    const fetchVocabularyWords = async () => {
      try {
        // Récupérer les mots depuis l'API avec mélange aléatoire
        const res = await fetch("/api/vocabulary?random=true&limit=10");
        const data = await res.json();
        
        if (!res.ok) throw new Error(data?.error || "Erreur lors du chargement");
        
        if (data.success && data.words) {
          setWords(data.words);
          setQuizState(prev => ({ ...prev, totalQuestions: data.words.length }));
        } else {
          throw new Error("Aucun mot de vocabulaire trouvé");
        }
      } catch (e: unknown) {
        setError((e as Error).message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchVocabularyWords();
  }, []);

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case "debutant":
        return { label: "Facile", emoji: "🖐️", color: "bg-green-100 text-green-800" };
      case "intermediaire":
        return { label: "Moyen", emoji: "🧠", color: "bg-yellow-100 text-yellow-800" };
      case "expert":
        return { label: "Difficile", emoji: "🏆", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Tous niveaux", emoji: "📚", color: "bg-gray-100 text-gray-800" };
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setQuizState({
      currentWordIndex: 0,
      score: 0,
      totalQuestions: words.length,
      showResult: false,
      selectedAnswer: null,
      isCorrect: null,
      completed: false
    });
  };

  const handleAnswerSelect = async (answer: string) => {
    if (quizState.showResult) return; // Empêcher de changer de réponse après sélection

    const currentWord = words[quizState.currentWordIndex];
    const isCorrect = answer === currentWord.correctDefinition;

    // Enregistrer l'erreur si la réponse est incorrecte
    if (!isCorrect) {
      try {
        await fetch('/api/user-errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizType: 'vocabulary',
            questionId: currentWord._id,
            question: `Quel est le sens du mot &quot;${currentWord.word}&quot; ?`,
            userAnswer: answer,
            correctAnswer: currentWord.correctDefinition,
            quizTitle: 'Quiz de Vocabulaire',
            difficulty: currentWord.difficulty,
            category: currentWord.category
          })
        });
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'erreur:', error);
      }
    }

    // Gérer les bonnes réponses consécutives
    if (isCorrect) {
      // Jouer le son de bonne réponse
      playCorrect();
      
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      
      // Afficher la célébration après 5 bonnes réponses consécutives
      if (newConsecutive === 5) {
        setShowCelebration(true);
      }
    } else {
      // Jouer le son de mauvaise réponse
      playWrong();
      setConsecutiveCorrect(0);
    }

    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answer,
      isCorrect,
      showResult: true
    }));
    
    // Le bouton "Continuer" apparaîtra automatiquement car showResult est true
  };

  const continueToNext = () => {
    const newScore = quizState.isCorrect ? quizState.score + 1 : quizState.score;
    const nextIndex = quizState.currentWordIndex + 1;
    const isCompleted = nextIndex >= words.length;

    if (isCompleted) {
      setQuizState(prev => ({
        ...prev,
        score: newScore,
        completed: true
      }));
      // Jouer le son de fin quand le quiz est terminé
      playFinish();
    } else {
      setQuizState(prev => ({
        ...prev,
        currentWordIndex: nextIndex,
        score: newScore,
        showResult: false,
        selectedAnswer: null,
        isCorrect: null
      }));
    }
    setShowCelebration(false);
  };


  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizState({
      currentWordIndex: 0,
      score: 0,
      totalQuestions: words.length,
      showResult: false,
      selectedAnswer: null,
      isCorrect: null,
      completed: false
    });
  };

  const getShuffledAnswers = (word: VocabularyWord) => {
    if (!word || !word.correctDefinition || !word.wrongDefinitions) {
      return [];
    }
    const allAnswers = [word.correctDefinition, ...word.wrongDefinitions];
    return allAnswers.sort(() => Math.random() - 0.5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête avec gamification */}
          <div className="text-center mb-16">
            <div className="text-8xl mb-6 animate-bounce">📚</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Maîtrise du Vocabulaire
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Débloquez votre potentiel linguistique ! Chaque mot maîtrisé vous rapproche du niveau Expert
            </p>
            
            {/* Badge de niveau */}
            <div className="mt-8 inline-flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
              <span className="mr-2">🎯</span>
              Niveau Vocabulaire : Expert
              <span className="ml-2">⭐</span>
            </div>
            
            <Link 
              href="/reviser"
              className="inline-flex items-center mt-6 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à la révision
            </Link>
          </div>

          {/* Informations du quiz gamifiées */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-2xl p-10 mb-12 border-2 border-blue-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              🎯 Défis du Vocabulaire
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="text-center group transform hover:scale-110 transition-transform duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
                  <div className="text-4xl font-bold mb-2">{words.length}</div>
                  <div className="text-blue-100 font-semibold">Défis</div>
                </div>
              </div>
              <div className="text-center group transform hover:scale-110 transition-transform duration-300">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
                  <div className="text-4xl font-bold mb-2">3</div>
                  <div className="text-green-100 font-semibold">Choix par défi</div>
                </div>
              </div>
              <div className="text-center group transform hover:scale-110 transition-transform duration-300">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
                  <div className="text-4xl font-bold mb-2">
                    {words.filter(w => w.difficulty === 'expert').length}
                  </div>
                  <div className="text-purple-100 font-semibold">Niveau Expert</div>
                </div>
              </div>
            </div>
            
            {/* Bouton de démarrage gamifié */}
            <div className="text-center">
              <button
                onClick={startQuiz}
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-5 px-12 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-bold text-xl shadow-2xl transform hover:scale-105 hover:shadow-3xl"
              >
                <span className="mr-3">🚀</span>
                Lancer l&apos;Aventure Vocabulaire
                <span className="ml-3 group-hover:translate-x-2 transition-transform duration-300">⚡</span>
              </button>
            </div>
          </div>

          {/* Section de conseils */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">💡 Conseils pour réussir</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">📖 Lisez attentivement</h4>
                <p className="text-blue-100">Prenez le temps de lire toutes les définitions</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🤔 Analysez le contexte</h4>
                <p className="text-blue-100">Utilisez le contexte pour éliminer les mauvaises réponses</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⏰ Prenez votre temps</h4>
                <p className="text-blue-100">Ne vous précipitez pas, réfléchissez bien</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">�� Apprenez de vos erreurs</h4>
                <p className="text-blue-100">Notez les mots que vous ne connaissiez pas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizState.completed) {
    const percentage = Math.round((quizState.score / quizState.totalQuestions) * 100);
    const getResultMessage = () => {
      if (percentage >= 90) return { message: "Excellent ! Vous maîtrisez parfaitement ce vocabulaire", emoji: "🏆" };
      if (percentage >= 70) return { message: "Très bien ! Vous avez une bonne connaissance", emoji: "🎉" };
      if (percentage >= 50) return { message: "Pas mal ! Continuez à progresser", emoji: "👍" };
      return { message: "Continuez à réviser pour améliorer vos résultats", emoji: "📚" };
    };
    const result = getResultMessage();

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{result.emoji}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Quiz terminé !
            </h1>
            <p className="text-xl text-gray-600 mb-8">{result.message}</p>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">{percentage}%</div>
                <div className="text-2xl text-gray-700">
                  {quizState.score} / {quizState.totalQuestions} bonnes réponses
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={restartQuiz}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Recommencer
              </button>
              <Link
                href="/reviser"
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Retour à la révision
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[quizState.currentWordIndex];
  
  if (!currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">Aucun mot trouvé pour cette question</p>
        </div>
      </div>
    );
  }
  
  const shuffledAnswers = getShuffledAnswers(currentWord);
  const difficultyInfo = getDifficultyInfo(currentWord.difficulty);

  // Affichage de la célébration
  if (showCelebration) {
    const celebration = getCelebrationMessage();
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
          <img 
            src="/quizz/gif5series.gif" 
            alt="Célébration" 
            className="mb-6 max-w-md w-full h-auto"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {celebration.title}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {celebration.subtitle}
          </p>
          
          {/* Bouton Continuer pour la célébration */}
          <button
            onClick={continueToNext}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200"
          >
            Continuer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Barre de statut */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo à gauche */}
            <div className="flex items-center">
              <img 
                src="/logo-certif.png" 
                alt="CertifDiag" 
                className="h-8 w-auto"
              />
            </div>

            {/* Barre de progression au centre */}
            <div className="flex items-center justify-center flex-1">
              <div className="flex items-center space-x-6">
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((quizState.currentWordIndex + 1) / quizState.totalQuestions) * 100}%` }}
                  ></div>
                </div>
                {/* Score espacé de 18px de la barre */}
                <div className="flex items-center space-x-1">
                  <span className="text-lg text-blue-500">⭐</span>
                  <span className="text-sm font-medium text-gray-700">
                    {quizState.score}
                  </span>
                </div>
              </div>
            </div>

            {/* Espace vide à droite pour équilibrer */}
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pb-24">
        <div className="max-w-4xl mx-auto p-6">

        {/* Question */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${difficultyInfo.color} mb-4`}>
              {difficultyInfo.emoji} {difficultyInfo.label}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Quel est le sens du mot <span className="text-blue-600">&quot;{currentWord.word}&quot;</span> ?
            </h2>
          </div>

          {/* Réponses */}
          <div className="space-y-3">
            {shuffledAnswers.map((answer, index) => {
              const isSelected = quizState.selectedAnswer === answer;
              const isCorrectAnswer = answer === currentWord.correctDefinition;
              let buttonClass = "w-full p-4 transition-all duration-200 text-left";
              
              if (quizState.showResult) {
                if (isCorrectAnswer) {
                  buttonClass += " bg-green-100 text-green-800 rounded-lg";
                } else if (isSelected) {
                  buttonClass += " bg-red-100 text-red-800 rounded-lg";
                } else {
                  buttonClass += " text-gray-600";
                }
              } else {
                buttonClass += isSelected 
                  ? " bg-blue-100 text-blue-800 rounded-lg" 
                  : "";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(answer)}
                  disabled={quizState.showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                      isSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{answer}</span>
                    {quizState.showResult && isCorrectAnswer && (
                      <div className="ml-auto text-green-600">✓</div>
                    )}
                    {quizState.showResult && isSelected && !isCorrectAnswer && (
                      <div className="ml-auto text-red-600">✗</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bouton suivant */}
          {quizState.showResult && (
            <div className="mt-6 text-center">
              <div className={`text-lg font-semibold mb-4 ${
                quizState.isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {quizState.isCorrect ? '✅ Correct !' : '❌ Incorrect'}
              </div>
            </div>
          )}
        </div>

        {/* Bouton Continuer en bas de page */}
        {quizState.showResult && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto text-center">
              <button
                onClick={continueToNext}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                {quizState.currentWordIndex + 1 >= words.length ? 'Voir les résultats' : 'Continuer'}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
