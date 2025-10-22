"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import QuizLoading from "@/components/QuizLoading";
import { useQuizAudio } from "@/hooks/useAudio";

type Choice = { 
  index: number;
  text: string; 
  media?: { type: "image" | "video"; url: string; filename: string };
};

type Question = { 
  index: number;
  text: string; 
  explanation?: string;
  media?: { type: "image" | "video"; url: string; filename: string };
  choices: Choice[] 
};

type Progress = {
  lives: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  isCompleted: boolean;
  isFailed: boolean;
  startedAt: string;
  lastActivityAt?: string;
  completedAt?: string;
  correctAnswers?: number;
  totalAnswers?: number;
  percentage?: number;
};

type QuizData = {
  id: string;
  title: string;
  description?: string;
  totalQuestions: number;
};

export default function TakeQuizPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    explanation?: string;
    correctAnswerText?: string;
  } | null>(null);
  const [allAnswersCorrect, setAllAnswersCorrect] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [nextQuestionData, setNextQuestionData] = useState<{ index: number; text: string; explanation?: string; media?: unknown; choices: Array<{ index: number; text: string; media?: unknown }> } | null>(null);

  // Hook pour jouer les sons de quiz
  const { playCorrect, playWrong, playFinish } = useQuizAudio();

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

  const startQuiz = useCallback(async () => {
    try {
      setInitialLoading(true);
      
      // Délai minimum pour afficher le chargement
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await fetch(`/api/quizzes/${id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data?.error || "Erreur");
      
      setProgress(data.progress);
      setCurrentQuestion(data.question);
      
      // Attendre le délai minimum
      await minLoadingTime;
      
    } catch (e: unknown) {
      setError((e as Error).message || "Erreur");
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  const loadQuizProgress = useCallback(async () => {
    try {
      setLoading(true);
      setInitialLoading(true);
      
      // Délai minimum pour afficher le chargement
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await fetch(`/api/quizzes/${id}/progress`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data?.error || "Erreur");
      
      setQuiz(data.quiz);
      
      if (data.hasProgress) {
        setProgress(data.progress);
        
        if (data.progress.isCompleted || data.progress.isFailed) {
          // Quiz terminé, afficher les résultats
          setShowResult(true);
        } else if (data.currentQuestion) {
          // Quiz en cours, afficher la question actuelle
          setCurrentQuestion(data.currentQuestion);
        }
      } else {
        // Pas de progression, démarrer le quiz
        await startQuiz();
      }
      
      // Attendre le délai minimum
      await minLoadingTime;
      
    } catch (e: unknown) {
      setError((e as Error).message || "Erreur");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [id, startQuiz]);

  useEffect(() => {
    loadQuizProgress();
  }, [loadQuizProgress]);

  async function submitAnswer() {
    if (selectedChoice === null || !currentQuestion) return;
    
    try {
      setSubmitting(true);
      const res = await fetch(`/api/quizzes/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choiceIndex: selectedChoice }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data?.error || "Erreur");
      
      // Afficher le résultat de la réponse
      setLastAnswerResult({
        isCorrect: data.isCorrect,
        explanation: data.explanation,
        correctAnswerText: data.correctAnswerText,
      });
      
      // Gérer les bonnes réponses consécutives
      if (data.isCorrect) {
        // Jouer le son de bonne réponse
        playCorrect();
        
        const newConsecutive = consecutiveCorrect + 1;
        setConsecutiveCorrect(newConsecutive);
        
        // Afficher la célébration après 5 bonnes réponses consécutives
        if (newConsecutive === 1) {
          setShowCelebration(true);
        }
      } else {
        // Jouer le son de mauvaise réponse
        playWrong();
        setConsecutiveCorrect(0);
      }
      
      // Mettre à jour la progression
      setProgress({
        ...progress!,
        lives: data.lives,
        currentQuestionIndex: data.currentQuestionIndex,
        isCompleted: data.isCompleted,
        isFailed: data.isFailed,
        correctAnswers: data.correctAnswers || 0,
        totalAnswers: data.totalAnswers || 0,
      });

      // Jouer le son de fin si le quiz est terminé ou échoué
      if (data.isCompleted || data.isFailed) {
        playFinish();
      }
      
      // Stocker la question suivante si elle existe
      if (data.nextQuestion) {
        setNextQuestionData(data.nextQuestion);
      } else {
        // Plus de questions, vérifier si toutes les réponses sont correctes
        if (data.allCorrect) {
          setAllAnswersCorrect(true);
          // Jouer le son de fin pour toutes les réponses correctes
          playFinish();
        } else {
          // Si pas toutes correctes, afficher l'écran de résultat normal
          setShowResult(true);
          // Jouer le son de fin même si pas toutes correctes
          playFinish();
        }
        // Mettre à jour avec les données finales si disponibles
        if (data.finalScore) {
          setProgress(prev => ({
            ...prev!,
            correctAnswers: data.finalScore.correct,
            totalAnswers: data.finalScore.total,
          }));
        }
      }
      
      // Le bouton "Continuer" apparaîtra automatiquement car lastAnswerResult n'est plus null
      
    } catch (e: unknown) {
      setError((e as Error).message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  function continueToNext() {
    setLastAnswerResult(null);
    setSelectedChoice(null);
    setShowCelebration(false);
    
    if (progress?.isCompleted || progress?.isFailed) {
      // Quiz terminé
      setShowResult(true);
      if (progress?.isCompleted) {
        // Mettre à jour les statistiques finales si disponibles
        const correctAnswers = progress.correctAnswers || 0;
        const totalAnswers = progress.totalAnswers || 0;
        const percentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
        setProgress(prev => ({
          ...prev!,
          correctAnswers,
          totalAnswers,
          percentage,
        }));
      }
    } else if (nextQuestionData) {
      // Charger la question suivante
      setCurrentQuestion({
        index: nextQuestionData.index,
        text: nextQuestionData.text,
        explanation: nextQuestionData.explanation,
        media: nextQuestionData.media as { type: "image" | "video"; url: string; filename: string } | undefined,
        choices: nextQuestionData.choices as Choice[],
      });
      setNextQuestionData(null);
    }
  }

  async function resetQuiz() {
    try {
      const res = await fetch(`/api/quizzes/${id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) throw new Error("Erreur lors de la réinitialisation");
      
      const data = await res.json();
      
      if (data.success) {
        // Mettre à jour directement avec les nouvelles données
        setProgress(data.progress);
        setCurrentQuestion(data.question);
        setShowResult(false);
        setSelectedChoice(null);
        setLastAnswerResult(null);
      }
    } catch (e: unknown) {
      setError((e as Error).message || "Erreur");
    }
  }

  // Affichage du chargement initial avec le GIF
  if (initialLoading) {
    return <QuizLoading message="Préparation du quiz..." />;
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p>Chargement du quiz...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  if (!quiz) return (
    <div className="max-w-4xl mx-auto p-6">
      <p>Quiz introuvable</p>
    </div>
  );

  // Affichage des résultats finaux
  if (showResult && progress) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          
          {progress.isFailed ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-red-800 mb-4">💔 Plus de vies disponibles</h2>
              <p className="text-lg">Vous avez perdu toutes vos vies. Essayez de nouveau !</p>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-orange-800 mb-4">Quiz terminé</h2>
              <div className="text-lg">
                <p>Score : <span className="font-bold">{progress.correctAnswers}</span> / <span className="font-bold">{progress.totalAnswers}</span></p>
                <p>Vies restantes : <span className="font-bold">{progress.lives}</span></p>
              </div>
            </div>
          )}
          
          <div className="space-x-4">
            <button 
              onClick={resetQuiz}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
            >
              Recommencer le quiz
            </button>
            <button 
              onClick={() => router.push('/reviser')}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
            >
              Retour aux quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  // Affichage de la question actuelle
  if (!currentQuestion || !progress) return null;

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
                    style={{ width: `${((progress.currentQuestionIndex + 1) / progress.totalQuestions) * 100}%` }}
                  ></div>
                </div>
                {/* Cœurs espacés de 18px de la barre */}
                <div className="flex items-center space-x-1">
                  <span className="text-lg text-red-500">❤️</span>
                  <span className="text-sm font-medium text-gray-700">
                    {progress.lives}
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
      <div className={`${lastAnswerResult ? 'pb-0' : 'pb-24'}`}>
        <div className="max-w-4xl mx-auto p-6">

          {/* Question actuelle */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-8">
              {currentQuestion.text}
            </h2>
              
            {currentQuestion.media && (
              <div className="mb-4">
                {currentQuestion.media.type === "image" ? (
                  <Image
                    src={currentQuestion.media.url}
                    alt="Média de la question"
                    width={400}
                    height={256}
                    className="max-w-full h-auto max-h-64 object-contain rounded"
                  />
                ) : (
                  <video
                    src={currentQuestion.media.url}
                    controls
                    className="max-w-full h-auto max-h-64 rounded"
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                )}
              </div>
            )}

            {currentQuestion.explanation && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded mb-4">
                <strong>Contexte :</strong> {currentQuestion.explanation}
              </div>
            )}

            {/* Choix de réponses */}
            <div className="space-y-3">
              {currentQuestion.choices.map((choice, index) => (
                <button
                  key={choice.index}
                  onClick={() => setSelectedChoice(choice.index)}
                  disabled={submitting || lastAnswerResult !== null}
                  className={`w-full text-left p-4 transition-all duration-200 ${
                    selectedChoice === choice.index
                      ? 'bg-blue-100 rounded-lg'
                      : ''
                  } ${
                    submitting || lastAnswerResult !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                      selectedChoice === choice.index 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-base font-medium text-gray-800">{choice.text}</span>
                      {choice.media && (
                        <div className="mt-2">
                          {choice.media.type === "image" ? (
                            <Image
                              src={choice.media.url}
                              alt="Média du choix"
                              width={200}
                              height={96}
                              className="max-w-full h-auto max-h-24 object-contain rounded"
                            />
                          ) : (
                            <video
                              src={choice.media.url}
                              controls
                              className="max-w-full h-auto max-h-24 rounded"
                            >
                              Votre navigateur ne supporte pas la lecture de vidéos.
                            </video>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Écran de succès complet - toutes les réponses correctes */}
        {allAnswersCorrect && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center">
              {/* Icône de célébration */}
              <div className="mb-6">
                <img src="/quizz/gifffullreponse.gif" alt="Toutes les réponses correctes!" className="mx-auto h-20 w-auto" />
              </div>
              
              {/* Message principal */}
              <h1 className="text-3xl font-bold text-black mb-4">
                Tu as trouvé {progress?.correctAnswers || 0} bonnes réponses sur {progress?.totalAnswers || 0}
              </h1>
              
              {/* Message de félicitations */}
              <p className="text-lg text-black mb-8">
                Excellent ! Tu as montré une vraie maîtrise du sujet 🏆
              </p>
              
              {/* Boîtes d'information */}
              <div className="flex justify-center gap-6 mb-8">
                {/* XP gagnés */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-green-500 px-4 py-2">
                    <span className="text-white font-bold">XP gagnés</span>
                  </div>
                  <div className="bg-green-50 px-4 py-4 flex items-center gap-2">
                    <img src="/quizz/XP.svg" alt="XP" className="w-5 h-5" />
                    <span className="text-green-600 font-semibold text-xl">{progress?.correctAnswers || 0}</span>
                  </div>
                </div>
                
                {/* Incroyable */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-blue-500 px-4 py-2">
                    <span className="text-white font-bold">Incroyable</span>
                  </div>
                  <div className="bg-blue-50 px-4 py-4 flex items-center gap-2">
                    <img src="/quizz/Target.svg" alt="Target" className="w-5 h-5" />
                    <span className="text-blue-600 font-semibold text-xl">100%</span>
                  </div>
                </div>
              </div>
              
              {/* Message de fin d'examen */}
              <div className="mb-8 flex items-center justify-center gap-2">
                <img src="/quizz/XP.svg" alt="XP" className="w-5 h-5" />
                <span className="text-black">Examen blanc terminé +{progress?.correctAnswers || 0} XP</span>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => {
                    setAllAnswersCorrect(false);
                    setShowResult(true);
                  }} 
                  className="px-6 py-3 bg-white border border-gray-300 text-black rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Voir mes réponses
                </button>
                <button 
                  onClick={() => {
                    // Rejouer le quiz
                    window.location.reload();
                  }} 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
                >
                  Rejouer
                </button>
                <button 
                  onClick={() => {
                    setAllAnswersCorrect(false);
                    router.push('/reviser');
                  }} 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
                >
                  Continuer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Encadré de réponse normal */}
        {lastAnswerResult && !allAnswersCorrect && (
          <div className={`fixed bottom-0 left-0 right-0 border-t-2 ${
            lastAnswerResult.isCorrect
              ? 'bg-green-50 border-green-300 text-green-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            <div className="p-6 flex items-start justify-between">
              <div className="flex items-start gap-4" style={{ marginLeft: '240px' }}>
                <div className={`${lastAnswerResult.isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white w-7 h-7 rounded-full flex items-center justify-center mt-0.5`}>{lastAnswerResult.isCorrect ? '✓' : '✕'}</div>
                <div>
                  <div className="font-semibold">La bonne réponse est :</div>
                  <div className="mt-1">{lastAnswerResult.correctAnswerText || ''}</div>
                  {lastAnswerResult.explanation && (
                    <>
                      <div className="mt-4 text-sm font-semibold">Détails :</div>
                      <div className="text-sm">{lastAnswerResult.explanation}</div>
                    </>
                  )}
                  <a href="#" className="mt-3 inline-block text-xs underline opacity-70 hover:opacity-100">Signaler</a>
                </div>
              </div>
              <button onClick={continueToNext} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" style={{ marginRight: '240px' }}>Continuer</button>
            </div>
          </div>
        )}

        {/* Boutons d'action en bas de page */}
        {!lastAnswerResult && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button
              onClick={() => {
                // Logique pour passer la question
                setSelectedChoice(null);
                setLastAnswerResult(null);
              }}
              disabled={submitting}
              className="px-8 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Passer
            </button>
            
            <button
              onClick={submitAnswer}
              disabled={selectedChoice === null || submitting}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                selectedChoice === null || submitting
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Vérification...' : 'Valider'}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
