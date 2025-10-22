"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserStats, Division, Quest, WeeklyXP } from "@/types/dashboard";

interface StatsSidebarProps {
  userStats: UserStats | null;
  division: Division | null;
  dailyQuests: Quest[];
  weeklyXP: WeeklyXP[];
  isPro?: boolean;
}

const StatsSidebar: React.FC<StatsSidebarProps> = ({
  userStats,
  division,
  dailyQuests,
  weeklyXP,
  isPro = false
}) => {
  // Générer les données de streak basées sur les vraies données
  const generateStreakData = (streak: number) => {
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    
    // Si pas de streak, tous les jours en gris
    if (streak === 0) {
      return days.map((day) => ({
        day,
        status: "pending",
        color: "bg-[#e8f3ff]",
        textColor: "text-[#868686]"
      }));
    }
    
    // Si streak > 0, afficher les flammes groupées puis une croix puis des ronds gris
    return days.map((day, index) => {
      let status = "pending";
      let color = "bg-[#e8f3ff]";
      let textColor = "text-[#868686]";
      
      if (index < streak) {
        // Jours avec activité - flammes groupées
        status = "completed";
        color = "bg-[#ffdfc4]";
        textColor = "text-[#ff7f00]";
      } else if (index === streak) {
        // Premier jour après le streak - croix (jour manqué)
        status = "failed";
        color = "bg-[#e8f3ff]";
        textColor = "text-[#868686]";
      } else {
        // Jours non passés - ronds gris simples
        status = "pending";
        color = "bg-[#e8f3ff]";
        textColor = "text-[#868686]";
      }
      
      return { day, status, color, textColor };
    });
  };

  // Calculer la largeur de l'ovale orange pour couvrir tous les jours de streak
  const getOvalWidth = (streak: number) => {
    if (streak === 0) return 0;
    return (streak * 32) - 4; // 32px par jour, -4px pour l'espacement
  };

  const streakData = generateStreakData(userStats?.streak || 0);

  // Générer les données XP basées sur les vraies données
  const generateXPData = (weeklyData: WeeklyXP[]) => {
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return days.map((day) => {
      const dayData = weeklyData.find(d => d.day === day);
      if (!dayData || dayData.xp === 0) {
        return { day, value: null, height: "", color: "", textColor: "text-[#202225]" };
      }
      
      const maxXP = Math.max(...weeklyData.map(d => d.xp));
      const height = Math.round((dayData.xp / maxXP) * 83);
      
      let color = "bg-[#e8f3ff]";
      if (dayData.isHighest) color = "bg-[#42db71]";
      if (dayData.xp < 30) color = "bg-[#ff4b4b]";
      if (day === 'S') color = "bg-[#0083ff]";
          
      return {
        day,
        value: dayData.xp,
        height: height,
        color,
        textColor: dayData.isHighest ? "text-[#868686]" : "text-[#868686]"
      };
    });
  };

  const xpData = generateXPData(weeklyXP);

  return (
    <aside className="flex flex-col items-start gap-6 relative w-full max-w-sm">
      {/* Bannière d'essai gratuit - seulement pour les utilisateurs non abonnés */}
      {!isPro && (
        <Card className="flex flex-col w-full items-start justify-center gap-4 p-6 relative rounded-xl bg-[#F0A400] border-0 shadow-lg">
          <CardContent className="p-0 w-full">
            <h3 className="relative w-fit font-xl-bold font-[number:var(--xl-bold-font-weight)] text-white text-[20px] tracking-tight leading-tight mb-2 [font-style:var(--xl-bold-font-style)]">
              Essaie CertifDiag Pro gratuitement
            </h3>
            <p className="relative w-full font-s-regular text-white/90 text-[14px] leading-relaxed mb-4">
              Transformez chaque session en un véritable entraînement gagnant.
            </p>
            <Button 
              onClick={() => window.location.href = '/preferences?tab=subscription'}
              className="w-full bg-white text-[#F0A400] hover:bg-gray-50 font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Essayer 3 jours gratuits
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Streak Card */}
      <Card className="flex flex-col w-full items-start justify-center gap-6 p-6 relative rounded-xl border border-solid border-[#e8e8e8]">
        <CardContent className="p-0 w-full">
          <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto] mb-6">
            <h3 className="relative w-fit mt-[-1.00px] font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
              Série d&apos;{userStats?.streak || 0} jours
            </h3>
          </div>

          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
            {(userStats?.streak || 0) > 0 && (
              <div 
                className="absolute top-6 h-7 bg-[#ffdfc4] rounded-full" 
                style={{ 
                  left: '8px',
                  width: `${getOvalWidth(userStats?.streak || 0)}px`
                }}
              />
            )}

            {streakData.map((streak, index) => (
              <div
                key={`${streak.day}-${index}`}
                className="flex flex-col w-7 items-center gap-1 relative"
              >
                <div
                  className={`relative flex items-center justify-center self-stretch mt-[-1.00px] font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] text-center tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)] ${streak.textColor}`}
                >
                  {streak.day}
                </div>

                <div
                  className={`relative w-7 h-7 ${streak.color} rounded-[14px]`}
                >
                  {streak.status === "completed" && (
                    <img
                      className="absolute top-[calc(50.00%_-_14px)] left-[calc(50.00%_-_14px)] w-7 h-7"
                      alt="Flamme"
                      src="/flamme.svg"
                    />
                  )}
                  {streak.status === "failed" && (
                    <img
                      className="absolute top-[calc(50.00%_-_14px)] left-[calc(50.00%_-_14px)] w-7 h-7"
                      alt="Croix"
                      src="/croix.svg"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Division Card */}
      <Card className="flex flex-col w-full items-start justify-center gap-6 p-6 relative rounded-xl border border-solid border-[#e8e8e8]">
        <CardContent className="p-0 w-full">
          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto] mb-6">
            <h3 className="relative w-fit mt-[-1.00px] font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
              {division?.name || "Division"}
            </h3>

            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 relative flex-[0_0_auto] h-auto p-0 hover:bg-transparent"
            >
              <div className="relative w-fit mt-[-1.00px] [font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap hover:underline transition-all">
                VOIR LA LIGUE
              </div>
            </Button>
          </div>

          <div className="items-start gap-4 self-stretch w-full flex-[0_0_auto] flex relative">
            <div className="relative w-[38px] h-[42px] flex items-center justify-center">
              <img
                className="w-full h-full object-contain"
                alt={`Division ${division?.name || 'Bronze'}`}
                src={`/badge-classement/${division?.name === 'Saphir' ? 'badge1er' : division?.name === 'Or' ? 'Or' : division?.name === 'Argent' ? 'Argent' : 'Bronze'}.svg`}
              />
            </div>

            <div className="flex flex-col items-start gap-1 relative flex-1 grow">
              <div className="relative w-fit mt-[-1.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
                Tu es n° {division?.rank || 0} du classement
              </div>

              <div className="relative self-stretch font-s-regular font-[number:var(--s-regular-font-weight)] text-[#484848] text-[length:var(--s-regular-font-size)] tracking-[var(--s-regular-letter-spacing)] leading-[var(--s-regular-line-height)] [font-style:var(--s-regular-font-style)]">
                Tu as gagné {division?.weeklyXP || 0} XP pour l&apos;instant cette semaine
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Quests Card */}
      <Card className="flex flex-col w-full items-start justify-center gap-6 p-6 relative rounded-xl border border-solid border-[#e8e8e8]">
        <CardContent className="p-0 w-full">
          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto] mb-6">
            <h3 className="relative w-fit mt-[-1.00px] font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
              Quêtes du jour
            </h3>

            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 relative flex-[0_0_auto] h-auto p-0 hover:bg-transparent"
            >
              <div className="relative w-fit mt-[-1.00px] [font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap hover:underline transition-all">
                AFFICHER TOUT
              </div>
            </Button>
          </div>

          <div className="flex flex-col items-start gap-[18px] relative self-stretch w-full flex">
            {dailyQuests.map((quest) => {
              const progressWidth = quest.progress > 0 ? `w-[${Math.round((quest.progress / quest.total) * 167)}px]` : "w-0";
              return (
                <div
                  key={quest.id}
                  className="flex items-center justify-center gap-3 relative self-stretch w-full flex-[0_0_auto]"
                >
                  <img
                    className="relative w-[38px] h-[38px]"
                    alt="Xp"
                    src="/quizz/XP.svg"
                  />

                  <div className="flex flex-col items-start gap-2 relative flex-1">
                    <div className="relative w-full mt-[-1.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)] break-words">
                      {quest.title}
                    </div>

                    <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                      <div className="h-[6.5px] relative flex-1 grow">
                        <div className="absolute top-0 left-0 w-[167px] h-1.5 bg-[#e5ffed] rounded-[1000px]" />
                        {quest.progress > 0 && (
                          <div
                            className={`absolute top-px left-0 ${progressWidth} h-1.5 bg-[#42db71] rounded-[1000px]`}
                          />
                        )}
                      </div>

                      <div className="relative flex items-center justify-center w-[35px] mt-[-1.00px] font-XS-regular font-[number:var(--XS-regular-font-weight)] text-[#868686] text-[length:var(--XS-regular-font-size)] text-right tracking-[var(--XS-regular-letter-spacing)] leading-[var(--XS-regular-line-height)] [font-style:var(--XS-regular-font-style)]">
                        {quest.progress}/{quest.total}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* XP Earned Card */}
      <Card className="flex flex-col w-full items-start justify-center gap-6 p-6 relative rounded-xl border border-solid border-[#e8e8e8]">
        <CardContent className="p-0 w-full">
          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto] mb-6">
            <h3 className="relative w-fit mt-[-1.00px] font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
              XP Gagnés
            </h3>

            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 relative flex-[0_0_auto] h-auto p-0 hover:bg-transparent"
            >
              <div className="relative w-fit mt-[-1.00px] [font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap hover:underline transition-all">
                VOIR PLUS
              </div>
            </Button>
          </div>

          <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
            {xpData.map((xp, index) => (
              <div
                key={`${xp.day}-${index}`}
                className="flex-col w-7 h-[143px] items-center justify-between flex relative"
              >
                {xp.value && (
                  <div
                    className={`${xp.textColor} relative flex items-center justify-center self-stretch mt-[-1.00px] font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] text-center tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)]`}
                  >
                    {xp.value}
                  </div>
                )}

                <div className="flex flex-col items-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
                  {xp.value && (
                    <div
                      className={`${xp.color} relative self-stretch w-full rounded-lg`}
                      style={{ height: `${xp.height}px` }}
                    />
                  )}

                  <div
                    className={`${xp.textColor} relative flex items-center justify-center self-stretch font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] text-center tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)]`}
                  >
                    {xp.day}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default StatsSidebar;
