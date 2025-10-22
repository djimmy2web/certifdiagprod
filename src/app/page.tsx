"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StatsSidebar from "@/components/StatsSidebar";
import { Theme, QuizCard, RecentError, UserStats, Division, Quest, WeeklyXP } from "@/types/dashboard";


const QuizSection = ({ 
  resumeQuiz, 
  themes, 
  recentErrors,
  userStats,
  division,
  dailyQuests,
  weeklyXP,
  isPro
}: { 
  resumeQuiz: QuizCard | null; 
  themes: Theme[]; 
  recentErrors: RecentError[];
  userStats: UserStats | null;
  division: Division | null;
  dailyQuests: Quest[];
  weeklyXP: WeeklyXP[];
  isPro: boolean;
}): JSX.Element => {
  const router = useRouter();
  
  // Fonction pour gérer le clic sur un thème
  const handleThemeClick = (theme: Theme) => {
    router.push(`/reviser?theme=${theme.slug}`);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[700px_350px] gap-12 w-full">
      <div className="flex flex-col items-start gap-12 w-full">
        {/* Resume Quiz Section */}
        <section className="flex flex-col w-full items-start gap-6 relative">
          <h2 className="relative self-stretch mt-[-1.00px] font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
            Reprend ton quiz
          </h2>

          {resumeQuiz ? (
            <Card className="relative self-stretch w-full bg-[#0083ff] rounded-xl border-0 overflow-hidden">
              <CardContent className="flex items-center justify-between p-6 relative">
                <img
                  className="absolute top-[calc(50.00%_-_64px)] left-[calc(50.00%_-_398px)] w-[796px] h-32"
                  alt="Frame"
                  src="https://c.animaapp.com/mg3n91uorLLscs/img/frame-353.png"
                />

                <div className="flex items-center gap-4 relative flex-1 grow">
                  <img
                    className="relative w-7"
                    alt="Frame"
                    src="https://c.animaapp.com/mg3n91uorLLscs/img/frame-826.svg"
                  />

                  <div className="relative w-fit font-l-bold font-[number:var(--l-bold-font-weight)] text-white text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                    {resumeQuiz.title}
                  </div>
                </div>

                <Button className="inline-flex items-center justify-center gap-[15px] px-6 py-2 relative flex-[0_0_auto] bg-white rounded-md overflow-hidden border border-solid border-[#e8e8e8] h-auto hover:bg-gray-50 transition-colors">
                  <div className="relative w-fit mt-[-1.00px] font-s-bold font-[number:var(--s-bold-font-weight)] text-[#202225] text-[length:var(--s-bold-font-size)] tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] whitespace-nowrap [font-style:var(--s-bold-font-style)]">
                    Reprendre +10 XP
                  </div>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="relative self-stretch w-full bg-gray-100 rounded-xl border border-[#e8e8e8]">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-gray-500">Aucun quiz en cours</div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Topics Section */}
        <section className="flex flex-col w-full items-start gap-6 relative">
          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative w-fit mt-[-1.00px] font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] whitespace-nowrap [font-style:var(--XL-bold-font-style)]">
              Thématiques
            </h2>

            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 relative flex-[0_0_auto] h-auto p-0 hover:bg-transparent"
            >
              <div className="relative w-fit mt-[-1.00px] [font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap hover:underline transition-all">
                VOIR PLUS
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-2 grid-rows-[94.00px_94.00px_94.00px_94.00px] h-[424px] gap-4 relative w-full max-w-2xl">
            {themes.slice(0, 7).map((theme, index) => {
              const gridPositions = [
                "row-[1_/_2] col-[1_/_2]",
                "row-[1_/_2] col-[2_/_3]",
                "row-[2_/_3] col-[1_/_2]",
                "row-[2_/_3] col-[2_/_3]",
                "row-[3_/_4] col-[1_/_2]",
                "row-[3_/_4] col-[2_/_3]",
                "row-[4_/_5] col-[1_/_2]",
              ];

  return (
                <Card
                  key={theme.id}
                  onClick={() => handleThemeClick(theme)}
                  className={`${gridPositions[index]} relative w-full h-fit bg-[#f9f9f9] rounded-xl overflow-hidden border border-solid border-[#e8e8e8] shadow-[0px_0px_0px_#0083ff40] hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <CardContent className="flex flex-col items-start justify-center gap-6 p-6">
                    <div className="items-start gap-4 self-stretch w-full flex-[0_0_auto] flex relative">
                      <div className="flex w-10 items-center justify-center gap-2.5 p-2 relative self-stretch bg-[#0083ff] rounded-md">
                        <div className="relative flex-1 self-stretch grow">
                          <img
                            className="absolute w-full h-full object-contain"
                            alt={theme.name}
                            src={theme.iconUrl || "/icone-thematique.png"}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 relative flex-1 grow">
                        <div className="relative w-fit mt-[-1.00px] font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                          {theme.name}
                        </div>

                        <div className="flex items-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
                          <div className="relative flex-1 grow h-1.5 bg-[#e8f3ff] rounded-[1000px]">
                            <div 
                              className="h-1.5 bg-[#0083ff] rounded-[1000px]" 
                              style={{ width: `${(theme.total ?? 0) > 0 ? ((theme.progress || 0) / (theme.total ?? 0)) * 100 : 0}%` }}
                            />
          </div>

                          <div className="relative flex items-center justify-center w-fit mt-[-1.00px] font-XS-regular font-[number:var(--XS-regular-font-weight)] text-[#868686] text-[length:var(--XS-regular-font-size)] text-right tracking-[var(--XS-regular-letter-spacing)] leading-[var(--XS-regular-line-height)] whitespace-nowrap [font-style:var(--XS-regular-font-style)]">
                            {theme.progress || 0}/{theme.total ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recent Errors Section */}
        <section className="flex flex-col w-full items-start gap-6 relative">
          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative w-fit mt-[-1.00px] font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] whitespace-nowrap [font-style:var(--XL-bold-font-style)]">
              Revois tes erreurs les plus récentes
            </h2>

            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 relative flex-[0_0_auto] h-auto p-0 hover:bg-transparent"
            >
              <div className="relative w-fit mt-[-1.00px] [font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap hover:underline transition-all">
                VOIR PLUS
              </div>
            </Button>
          </div>

          <Card className="relative self-stretch w-full bg-[#ff7f00] rounded-xl border-0 overflow-hidden">
            <CardContent className="flex items-center justify-between p-6 relative">
              <img
                className="absolute top-[calc(50.00%_-_64px)] left-[calc(50.00%_-_398px)] w-[796px] h-32"
                alt="Frame"
                src="https://c.animaapp.com/mg3n91uorLLscs/img/frame-353-1.png"
              />

              <div className="flex items-center gap-4 relative flex-1 grow">
                <div className="relative w-fit mt-[-1.00px] font-l-bold font-[number:var(--l-bold-font-weight)] text-white text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                  Quiz sur tes {recentErrors.length} dernières erreurs
          </div>
        </div>

              <Button className="inline-flex items-center justify-center gap-[15px] px-6 py-2 relative flex-[0_0_auto] bg-white rounded-md overflow-hidden border border-solid border-[#e8e8e8] h-auto hover:bg-gray-50 transition-colors">
                <div className="relative w-fit mt-[-1.00px] font-s-bold font-[number:var(--s-bold-font-weight)] text-[#202225] text-[length:var(--s-bold-font-size)] tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] whitespace-nowrap [font-style:var(--s-bold-font-style)]">
                  Commencer +25 XP
                </div>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Right Sidebar */}
      <StatsSidebar 
        userStats={userStats}
        division={division}
        dailyQuests={dailyQuests}
        weeklyXP={weeklyXP}
        isPro={isPro}
      />
    </div>
  );
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumeQuiz, setResumeQuiz] = useState<QuizCard | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);
  const [division, setDivision] = useState<Division | null>(null);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyXP, setWeeklyXP] = useState<WeeklyXP[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{currentPlan: string; isActive: boolean} | null>(null);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // Rediriger vers la page de landing si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/landing");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return; // Ne pas charger les données si pas connecté
    
    (async () => {
      try {
        // D'abord charger les thématiques
        const themesRes = await fetch("/api/themes");
        const themesData = await themesRes.json();
        
        // Ensuite charger la progression si l'utilisateur est connecté
        let progressData = { success: false, progress: [] };
        try {
          const progressRes = await fetch("/api/themes/progress");
          if (progressRes.ok) {
            progressData = await progressRes.json();
          }
        } catch (progressError) {
          console.log("Progression non disponible:", progressError);
        }
        
        // Enrichir les thèmes avec les vraies données de progression
        const themesWithProgress = (themesData.themes || []).map((theme: Theme & { totalQuizzes?: number }) => {
          const themeProgress = progressData.success 
            ? progressData.progress.find((p: { themeSlug: string; totalQuizzesCompleted: number }) => p.themeSlug === theme.slug)
            : null;
          
          return {
            ...theme,
            progress: (themeProgress as unknown as { totalQuizzesCompleted?: number })?.totalQuizzesCompleted || 0,
            total: theme.totalQuizzes || 0 // Nombre réel de quiz par thème
          };
        });
        
        setThemes(themesWithProgress);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    })();
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return; // Ne pas charger les données si pas connecté
    
    // Récupérer le quiz en cours via API (si connecté)
    (async () => {
      try {
        const res = await fetch("/api/me/progress");
        if (!res.ok) return; // non connecté
        const data = await res.json();
        if (data?.progress) setResumeQuiz({ id: data.progress.quizId, title: data.progress.title, description: data.progress.description });
      } catch {}
    })();
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return; // Ne pas charger les données si pas connecté
    
    // Stats personnelles de base: streak + points (totalScore)
    (async () => {
      try {
        const res = await fetch("/api/stats/me");
        if (!res.ok) return; // utilisateur non connecté
        const data = await res.json();
        setUserStats({ 
          xp: data?.totals?.totalScore || 0, 
          lives: 3, // Valeur par défaut
          streak: data?.totals?.streak || 0 
        });

        // Charger les erreurs récentes de l'utilisateur
        try {
          const er = await fetch("/api/user-errors/recent?limit=5");
          if (er.ok) {
            const erData = await er.json();
            setRecentErrors(erData.errors || []);
          }
        } catch {}

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

        // Charger les données d'abonnement
        try {
          const subRes = await fetch("/api/me/subscription");
          if (subRes.ok) {
            const subData = await subRes.json();
            if (subData.success) {
              setSubscription(subData.subscription);
              // Afficher le bandeau si l'utilisateur est sur le plan gratuit
              setShowTrialBanner(subData.subscription.currentPlan === 'free');
              // Mettre à jour le statut Pro
              setIsPro(subData.subscription.isPro || false);
            }
          }
        } catch {}
      } catch {}
    })();
  }, [status]);

  // Afficher un loader pendant la vérification de l'authentification
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher (redirection en cours)
  if (status === "unauthenticated") {
    return null;
  }


  return (
    <div className="min-h-screen bg-white pt-4">
      
      <div className="max-w-7xl mx-auto px-4 pl-10">
        <QuizSection 
          resumeQuiz={resumeQuiz} 
          themes={themes} 
          recentErrors={recentErrors}
          userStats={userStats}
          division={division}
          dailyQuests={dailyQuests}
          weeklyXP={weeklyXP}
          isPro={isPro}
        />
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
