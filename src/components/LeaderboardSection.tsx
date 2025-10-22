"use client";

import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StatsSidebar from "./StatsSidebar";

interface Division {
  _id: string;
  name: string;
  color: string;
  minPoints: number;
  maxPoints?: number;
  order: number;
}

interface Player {
  userId: string;
  username: string;
  points: number;
  rank: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

interface DailyQuest {
  id: string;
  title: string;
  progress: number;
  total: number;
  completed: boolean;
  icon: string;
}

interface WeeklyXP {
  day: string;
  xp: number;
  isHighest: boolean;
}

interface LeaderboardSectionProps {
  currentDivision: Division | null;
  leaderboardData: Player[];
  dailyQuests: DailyQuest[];
  weeklyXP: WeeklyXP[];
  timeLeft: string;
  loading: boolean;
}

const divisionBadges = [
  {
    name: "Saphir",
    image: "/badge-classement/Vérouiller.svg",
    width: "w-[57px]",
    height: "h-16"
  },
  {
    name: "Or", 
    image: "/badge-classement/Or.svg",
    width: "w-[57px]",
    height: "h-16"
  },
  {
    name: "Argent",
    image: "/badge-classement/Argent.svg", 
    width: "w-[87px]",
    height: "h-24"
  },
  {
    name: "Bronze",
    image: "/badge-classement/Bronze.svg",
    width: "w-[57px]",
    height: "h-16"
  },
  {
    name: "Non classé",
    image: "/badge-classement/Vérouiller.svg",
    width: "w-[57px]",
    height: "h-16"
  }
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return '/badge-classement/badge1er.svg';
  if (rank === 2) return '/badge-classement/badge2eme.svg';
  if (rank === 3) return '/badge-classement/badge3eme.svg';
  return null;
};


export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  currentDivision,
  leaderboardData,
  dailyQuests,
  weeklyXP,
  timeLeft,
  loading
}) => {

  if (loading) {
    return (
      <div className="flex gap-12 w-full relative translate-y-[-1rem] animate-fade-in opacity-0">
        <div className="flex flex-col w-[600px] items-center justify-center gap-8 relative">
          <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="w-[300px] space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-12 w-full relative translate-y-[-1rem] animate-fade-in opacity-0">
      <div className="flex flex-col w-[600px] items-center justify-center gap-8 relative">
        <header className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex items-center justify-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
            {divisionBadges.map((badge, index) => (
              <div
                key={index}
                className={`relative ${badge.width} ${badge.height}`}
                title={badge.name}
              >
                <img
                  src={badge.image}
                  alt={badge.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>

          <h1 className="relative self-stretch font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] text-center tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
            Division {currentDivision?.name || 'Non classé'}
          </h1>

          <p className="relative self-stretch font-m-regular font-[number:var(--m-regular-font-weight)] text-[#484848] text-[length:var(--m-regular-font-size)] text-center tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
            Les 4 premiers rejoignent la division supérieure dans
          </p>

          <div className="self-stretch text-[#0083ff] text-center relative font-m-bold font-[number:var(--m-bold-font-weight)] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
            {timeLeft}
          </div>
        </header>

        <Separator className="w-full" />

        <section className="flex flex-col items-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-8 w-full">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <p className="text-gray-600 font-medium">Aucun classement disponible</p>
              <p className="text-gray-500 text-sm">Les classements se mettent à jour chaque semaine</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                {leaderboardData.slice(0, 4).map((player) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]"
                  >
                    <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
                      <div className="relative w-[27px] h-8 flex items-center justify-center">
                        {getRankIcon(player.rank) ? (
                          <img
                            src={getRankIcon(player.rank)!}
                            alt={`Rang ${player.rank}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'block';
                              }
                            }}
                          />
                        ) : null}
                        <span 
                          className={`text-[#0083ff] text-lg font-bold ${getRankIcon(player.rank) ? 'hidden' : 'block'}`}
                        >
                          {player.rank}
                        </span>
                      </div>

                      <Avatar className="w-12 h-12">
                        <AvatarImage src={player.avatar} alt={player.username || 'Joueur'} />
                        <AvatarFallback>{player.username?.charAt(0)?.toUpperCase() || 'J'}</AvatarFallback>
                      </Avatar>

                      <div className="relative w-fit font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
                        {player.username || 'Joueur'}
                      </div>
                    </div>

                    <div className="w-fit text-[#858585] whitespace-nowrap relative font-m-bold font-[number:var(--m-bold-font-weight)] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                      {player.points} XP
                    </div>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]">
                <span className="text-green-500 text-lg">⬆️</span>

                <Badge
                  variant="outline"
                  className="text-[#42db71] border-[#42db71] bg-transparent font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)]"
                >
                  ZONE DE PROMOTION
                </Badge>

                <span className="text-green-500 text-lg">⬆️</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                {leaderboardData.slice(4, 8).map((player) => (
                  <div
                    key={player.userId}
                    className={`flex items-center justify-between relative self-stretch w-full flex-[0_0_auto] ${
                      player.isCurrentUser
                        ? "bg-[#e8f3ff] rounded-lg px-3 py-2 ml-[-11px] mr-[-11px] w-[622px]"
                        : ""
                    }`}
                  >
                    <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
                      <div className="relative w-[27px] h-8 flex items-center justify-center">
                        <span className="text-[#484848] text-lg font-bold">
                          {player.rank}
                        </span>
                      </div>

                      <Avatar className="w-12 h-12">
                        <AvatarImage src={player.avatar} alt={player.username || 'Joueur'} />
                        <AvatarFallback>{player.username?.charAt(0)?.toUpperCase() || 'J'}</AvatarFallback>
                      </Avatar>

                      <div className="relative w-fit font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
                        {player.username || 'Joueur'}
                      </div>
                    </div>

                    <div className="w-fit text-[#858585] whitespace-nowrap relative font-m-bold font-[number:var(--m-bold-font-weight)] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                      {player.points} XP
                    </div>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]">
                <span className="text-red-500 text-lg">⬇️</span>

                <Badge
                  variant="outline"
                  className="text-[#ff4b4b] border-[#ff4b4b] bg-transparent font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)]"
                >
                  ZONE DE RÉGRESSION
                </Badge>

                <span className="text-red-500 text-lg">⬇️</span>
              </div>

              <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                {leaderboardData.slice(8).map((player) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]"
                  >
                    <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
                      <div className="relative w-[27px] h-8 flex items-center justify-center">
                        <span className="text-[#484848] text-lg font-bold">
                          {player.rank}
                        </span>
                      </div>

                      <Avatar className="w-12 h-12">
                        <AvatarImage src={player.avatar} alt={player.username || 'Joueur'} />
                        <AvatarFallback>{player.username?.charAt(0)?.toUpperCase() || 'J'}</AvatarFallback>
                      </Avatar>

                      <div className="relative w-fit font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
                        {player.username || 'Joueur'}
                      </div>
                    </div>

                    <div className="w-fit text-[#858585] whitespace-nowrap relative font-m-bold font-[number:var(--m-bold-font-weight)] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                      {player.points} XP
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <StatsSidebar 
        userStats={null}
        division={currentDivision ? {
          name: currentDivision.name,
          color: currentDivision.color,
          rank: 0,
          weeklyXP: 0
        } : null}
        dailyQuests={dailyQuests}
        weeklyXP={weeklyXP}
      />
    </div>
  );
};