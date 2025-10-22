"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import RevisionCards from "@/components/RevisionCards";
import StatsSidebar from "@/components/StatsSidebar";
import { UserStats, Division, Quest, WeeklyXP } from "@/types/dashboard";

interface RevisionCard {
  id: string;
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  href: string;
  buttonText: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  difficulty: "debutant" | "apprenti" | "expert" | "specialiste" | "maitre";
  iconUrl?: string;
  questionsCount: number;
  isPublished: boolean;
  status?: "completed" | "failed" | "locked" | "available";
  xpReward?: number;
}

interface Theme {
  id: string;
  name: string;
  slug: string;
}

function ReviserPageContent() {
  const searchParams = useSearchParams();
  const themeSlug = searchParams.get('theme');
  
  
  // États pour la vue thématique
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizProgress, setQuizProgress] = useState<Record<string, { isCompleted: boolean; isFailed: boolean; score?: number }>>({});

  // États pour la sidebar de statistiques
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [division, setDivision] = useState<Division | null>(null);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyXP, setWeeklyXP] = useState<WeeklyXP[]>([]);


  // Charger les données de la sidebar de statistiques
  useEffect(() => {
    (async () => {
      try {
        // Stats personnelles de base: streak + points (totalScore)
        const res = await fetch("/api/stats/me");
        if (!res.ok) return; // utilisateur non connecté
        const data = await res.json();
        setUserStats({ 
          xp: data?.totals?.totalScore || 0, 
          lives: 3, // Valeur par défaut
          streak: data?.totals?.streak || 0 
        });

        // Charger la division de l'utilisateur
        try {
          const divRes = await fetch("/api/me/division");
          if (divRes.ok) {
            const divData = await divRes.json();
            if (divData.success) {
              setDivision(divData.division);
            }
          }
        } catch {}

        // Charger les quêtes du jour
        try {
          const questRes = await fetch("/api/me/quests");
          if (questRes.ok) {
            const questData = await questRes.json();
            if (questData.success) {
              setDailyQuests(questData.quests);
            }
          }
        } catch {}

        // Charger les XP hebdomadaires
        try {
          const xpRes = await fetch("/api/me/weekly-xp");
          if (xpRes.ok) {
            const xpData = await xpRes.json();
            if (xpData.success) {
              setWeeklyXP(xpData.weeklyData);
            }
          }
        } catch {}
      } catch {}
    })();
  }, []);

  // Charger les quiz de la thématique sélectionnée
  useEffect(() => {
    if (!themeSlug) return;
    
    setLoading(true);
    setError(null);
    
    (async () => {
      try {
        // Charger les thématiques pour obtenir le nom
        const themesRes = await fetch("/api/themes");
        const themesData = await themesRes.json();
        
        if (themesRes.ok) {
          const theme = themesData.themes?.find((t: Theme) => t.slug === themeSlug);
          if (theme) {
            setCurrentTheme(theme);
          }
        }
        
        // Charger les quiz de cette thématique
        const quizzesRes = await fetch(`/api/quizzes?theme=${encodeURIComponent(themeSlug)}`);
        const quizzesData = await quizzesRes.json();
        
        if (!quizzesRes.ok) throw new Error(quizzesData?.error || "Erreur");
        
        const quizzes = quizzesData.quizzes || [];
        
        // Charger la progression des quiz
        try {
          const progressRes = await fetch("/api/me/progress");
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setQuizProgress(progressData.progress || {});
          }
        } catch (e) {
          console.log("Erreur lors du chargement de la progression:", e);
        }
        
        setQuizzes(quizzes);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, [themeSlug]);



  // Déterminer le statut d'un quiz
  const getQuizStatus = (quiz: Quiz): "completed" | "failed" | "locked" | "available" => {
    const progress = quizProgress[quiz.id];
    
    if (!progress) {
      // Si c'est le premier quiz ou si le niveau précédent est débloqué
      return "available";
    }
    
    if (progress.isCompleted) {
      return "completed";
    }
    
    if (progress.isFailed && progress.isFailed) {
      return "failed";
    }
    
    return "available";
  };

  // Organiser les quiz par niveaux
  const organizeQuizzesByLevel = (quizzes: Quiz[]) => {
    const levels = {
      debutant: [] as Quiz[],
      apprenti: [] as Quiz[],
      expert: [] as Quiz[],
      specialiste: [] as Quiz[],
      maitre: [] as Quiz[]
    };

    quizzes.forEach(quiz => {
      const status = getQuizStatus(quiz);
      const quizWithStatus = { ...quiz, status, xpReward: getXPReward(quiz.difficulty) };
      
      switch (quiz.difficulty) {
        case "debutant":
          levels.debutant.push(quizWithStatus);
          break;
        case "apprenti":
          levels.apprenti.push(quizWithStatus);
          break;
        case "expert":
          levels.expert.push(quizWithStatus);
          break;
        case "specialiste":
          levels.specialiste.push(quizWithStatus);
          break;
        case "maitre":
          levels.maitre.push(quizWithStatus);
          break;
      }
    });

    return levels;
  };

  // Obtenir la récompense XP selon le niveau
  const getXPReward = (difficulty: string) => {
    switch (difficulty) {
      case "debutant": return 5;
      case "apprenti": return 10;
      case "expert": return 15;
      case "specialiste": return 20;
      case "maitre": return 25;
      default: return 5;
    }
  };

  // Obtenir les couleurs et styles selon le statut
  const getQuizCardStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          icon: "text-green-600",
          button: "bg-gray-100 text-gray-700 hover:bg-gray-200",
          buttonText: "S'entraîner +5 XP"
        };
      case "failed":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-600",
          button: "bg-gray-100 text-gray-700 hover:bg-gray-200",
          buttonText: "Recommencer +5 XP"
        };
      case "locked":
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: "text-gray-400",
          button: "hidden",
          buttonText: ""
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: "text-gray-400",
          button: "bg-gray-100 text-gray-700 hover:bg-gray-200",
          buttonText: "Commencer +5 XP"
        };
    }
  };

  const revisionCards: RevisionCard[] = [
    {
      id: "themes",
      title: "Thématiques",
      description: "Explorez les sujets essentiels du diagnostic immobilier.",
      iconSrc: "https://c.animaapp.com/mg7tdvizPziJrm/img/thematique.svg",
      iconAlt: "Thematique",
      href: "/reviser/thematiques",
      buttonText: "Continuer"
    },
    {
      id: "errors",
      title: "Erreurs récentes",
      description: "Révisez vos erreurs pour progresser.",
      iconSrc: "https://c.animaapp.com/mg7tdvizPziJrm/img/erreur.svg",
      iconAlt: "Erreur",
      href: "/reviser/erreurs-recentes",
      buttonText: "Commencer"
    },
    {
      id: "vocabulary",
      title: "Définitions",
      description: "Apprenez et révisez le vocabulaire essentiel.",
      iconSrc: "https://c.animaapp.com/mg7tdvizPziJrm/img/alpha.svg",
      iconAlt: "Alpha",
      href: "/reviser/vocabulaire",
      buttonText: "Commencer"
    },
    {
      id: "games",
      title: "Jeux",
      description: "Apprenez en vous amusant avec des jeux interactifs.",
      iconSrc: "https://c.animaapp.com/mg7tdvizPziJrm/img/game.svg",
      iconAlt: "Game",
      href: "/reviser/jeux",
      buttonText: "Commencer"
    }
  ];

  // Si une thématique est sélectionnée, afficher les quiz
  if (themeSlug) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* En-tête avec bouton retour */}
          <div className="mb-8">
            <Link 
              href="/reviser/thematiques"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              RETOUR AUX THÉMATIQUES
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentTheme?.name || "Thématique"}
            </h1>
          </div>

          {/* Contenu principal */}
          <div className="max-w-4xl mx-auto">
            {/* Quiz organisés par niveaux */}
            <div className="space-y-8">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Chargement des quiz...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-xl mb-4">❌</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-xl mb-4">📝</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun quiz</h2>
                  <p className="text-gray-600">Aucun quiz n&apos;est disponible pour cette thématique.</p>
                </div>
              ) : (() => {
                const levels = organizeQuizzesByLevel(quizzes);
                const levelConfigs = [
                  { key: 'debutant', name: 'Niveau débutant', icon: '/icone-debutant.png', emoji: '👋' },
                  { key: 'apprenti', name: 'Niveau apprenti', icon: '/icone-apprenti.png', emoji: '😎' },
                  { key: 'expert', name: 'Niveau expert', icon: '/icone-expert.png', emoji: '🔥' },
                  { key: 'specialiste', name: 'Niveau spécialiste', icon: '/icone-specialiste.png', emoji: '⭐' },
                  { key: 'maitre', name: 'Niveau maître', icon: '/icone-maitre.png', emoji: '👑' }
                ];

                return (
                  <div className="space-y-8">
                    {levelConfigs.map((config) => {
                      const levelQuizzes = levels[config.key as keyof typeof levels];
                      if (levelQuizzes.length === 0) return null;

                      return (
                        <div key={config.key}>
                          <div className="border-t border-gray-300 my-6"></div>
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                              <Image
                                src={config.icon}
                                alt={config.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-contain"
                              />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">{config.name}</h2>
                          </div>
                          <div className="space-y-3">
                            {levelQuizzes.map((quiz) => {
                              const style = getQuizCardStyle(quiz.status || "available");
                              return (
                                <div
                                  key={quiz.id}
                                  className={`${style.bg} ${style.border} rounded-lg border p-4`}
                                >
                                  <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center ${style.icon}`}>
                                      {quiz.iconUrl ? (
                                        <img
                                          src={quiz.iconUrl}
                                          alt={quiz.title}
                                          className="w-full h-full object-contain"
                                        />
                                      ) : (
                                        <span className="text-xl">
                                          {quiz.title.includes("Examen") ? "📋" : "⚡"}
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-medium text-gray-800">
                                      {quiz.title}
                                    </span>
                                  </div>
                                    {quiz.status !== "locked" && (
                                      <Link
                                        href={`/reviser/${quiz.id}`}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${style.button}`}
                                      >
                                        {style.buttonText.replace('+5 XP', `+${quiz.xpReward} XP`)}
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue normale des cartes de révision
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[700px_350px] gap-12 w-full">
          {/* Section principale avec les cartes de révision */}
          <div className="flex flex-col items-start gap-12 w-full">
            {/* Titre principal aligné avec le logo */}
            <div className="w-full">
              <h1 className="text-[#202225] text-[length:var(--XL-bold-font-size)] leading-[var(--XL-bold-line-height)] font-XL-bold font-[number:var(--XL-bold-font-weight)] tracking-[var(--XL-bold-letter-spacing)] [font-style:var(--XL-bold-font-style)] ml-8">
                Révision
              </h1>
            </div>

            {/* 4 cartes principales avec le nouveau design */}
            <div className="flex flex-col items-start gap-6 flex-1 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms] ml-8">
              <RevisionCards cards={revisionCards} />
            </div>
          </div>

          {/* Sidebar avec les statistiques */}
          <StatsSidebar 
            userStats={userStats}
            division={division}
            dailyQuests={dailyQuests}
            weeklyXP={weeklyXP}
          />
        </div>
      </div>
    </div>
  );
}

export default function ReviserPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ReviserPageContent />
    </Suspense>
  );
}
