"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatsSidebar from "@/components/StatsSidebar";
import { UserStats, Division, Quest, WeeklyXP } from "@/types/dashboard";

export default function BadgesPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [division, setDivision] = useState<Division | null>(null);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [sidebarQuests, setSidebarQuests] = useState<Quest[]>([]);
  const [weeklyXP, setWeeklyXP] = useState<WeeklyXP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Charger toutes les données en parallèle
        const [
          statsRes,
          divisionRes,
          questsRes,
          weeklyXPRes,
          livesRes
        ] = await Promise.all([
          fetch("/api/stats/me"),
          fetch("/api/me/division"),
          fetch("/api/me/quests"),
          fetch("/api/me/weekly-xp"),
          fetch("/api/me/lives")
        ]);

        // Traiter les statistiques utilisateur
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const livesData = livesRes.ok ? await livesRes.json() : { lives: 3 };
          setUserStats({
            streak: statsData?.totals?.streak || 0,
            xp: statsData?.totals?.totalScore || 0,
            lives: livesData?.lives || 3
          });
        }

        // Traiter la division
        if (divisionRes.ok) {
          const divisionData = await divisionRes.json();
          if (divisionData.success) {
            setDivision(divisionData.division);
          }
        }

        // Traiter les quêtes
        if (questsRes.ok) {
          const questsData = await questsRes.json();
          if (questsData.success) {
            setDailyQuests(questsData.quests || []);
            setSidebarQuests(questsData.quests?.slice(0, 2) || []); // Prendre les 2 premières pour la sidebar
          }
        }

        // Traiter les XP hebdomadaires
        if (weeklyXPRes.ok) {
          const xpData = await weeklyXPRes.json();
          if (xpData.success) {
            setWeeklyXP(xpData.weeklyData || []);
          }
        }

      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0083ff] mx-auto mb-4"></div>
          <p className="text-[#868686]">Chargement des badges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#0083ff] text-white rounded-md hover:bg-[#0083ff]/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="flex gap-12 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms] ml-12">
        <div className="flex flex-col gap-8 flex-1 max-w-[600px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <div className="flex flex-col gap-6">
            <header className="flex items-center justify-between">
              <h1 className="font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
                Quêtes du jour
              </h1>
            </header>

          <Card className="border-[#e8e8e8]">
            <CardContent className="p-6">
              <div className="flex flex-col gap-8">
                {dailyQuests.length > 0 ? (
                  dailyQuests.map((quest) => (
                    <div key={quest.id} className="flex items-center gap-4">
                      <img
                        className="w-[38px] h-[38px]"
                        alt="XP"
                        src="https://c.animaapp.com/mg7zs6akPsoGn4/img/xp.svg"
                      />

                      <div className="flex flex-col gap-2 flex-1">
                        <h3 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] [font-style:var(--l-bold-font-style)]">
                          {quest.title}
                        </h3>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 relative h-[6.5px]">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#e5ffed] rounded-[1000px]" />
                            <Progress
                              value={(quest.progress / quest.total) * 100}
                              className="absolute top-px left-0 h-1.5 bg-transparent"
                            />
                            <div 
                              className="absolute top-px left-0 h-1.5 bg-[#42db71] rounded-[1000px]"
                              style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                            />
                          </div>

                          <span className="w-[35px] font-XS-regular font-[number:var(--XS-regular-font-weight)] text-[#868686] text-[length:var(--XS-regular-font-size)] text-right tracking-[var(--XS-regular-letter-spacing)] leading-[var(--XS-regular-line-height)] [font-style:var(--XS-regular-font-style)]">
                            {quest.progress}/{quest.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#868686]">Aucune quête disponible pour le moment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        <StatsSidebar 
          userStats={userStats}
          division={division}
          dailyQuests={sidebarQuests}
          weeklyXP={weeklyXP}
        />
      </section>
    </div>
  );
}


