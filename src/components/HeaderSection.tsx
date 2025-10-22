"use client";

import React, { useState, useEffect } from "react";

interface UserStats {
  xp: number;
  lives: number;
  streak: number;
}

export const HeaderSection = (): JSX.Element => {
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0,
    lives: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        // Charger les statistiques de l'utilisateur
        const [statsRes, streakRes] = await Promise.all([
          fetch('/api/stats/me'),
          fetch('/api/me/streak')
        ]);

        let xp = 0;
        let lives = 0;
        let streak = 0;

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            xp = statsData.totalScore || 0;
          }
        }

        if (streakRes.ok) {
          const streakData = await streakRes.json();
          if (streakData.success) {
            streak = streakData.streak || 0;
          }
        }

        // Pour les vies, on peut utiliser une valeur par défaut ou une API spécifique
        lives = 3; // Valeur par défaut, à adapter selon votre système de vies

        setUserStats({ xp, lives, streak });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, []);

  const userStatsDisplay = [
    {
      icon: "https://c.animaapp.com/mfv6kdiwVPAaDt/img/xp-1.svg",
      alt: "XP",
      value: userStats.xp.toString(),
    },
    {
      icon: "https://c.animaapp.com/mfv6kdiwVPAaDt/img/no-daily.svg",
      alt: "Streak",
      value: userStats.streak.toString(),
    },
    {
      icon: "https://c.animaapp.com/mfv6kdiwVPAaDt/img/vie-cass-.svg",
      alt: "Vies",
      value: userStats.lives.toString(),
    },
  ];

  return (
    <header className="flex h-[90px] w-full relative flex-col items-start gap-2.5 px-[246px] py-6 bg-white border-b border-[#e8e8e8]">
      <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
        <div className="inline-flex items-center gap-12 relative flex-[0_0_auto]">
          <img
            className="relative w-[42px] h-[42px]"
            alt="CertifDiag Logo"
            src="https://c.animaapp.com/mfv6kdiwVPAaDt/img/group-816.png"
          />
        </div>

        <div className="inline-flex items-center justify-end gap-3.5 relative flex-[0_0_auto]">
          {loading ? (
            <div className="flex items-center gap-3.5">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            userStatsDisplay.map((stat, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]"
              >
                <img
                  className="relative w-6 h-6"
                  alt={stat.alt}
                  src={stat.icon}
                />
                <div className="relative w-fit text-[#202225] text-[length:var(--m-bold-font-size)] leading-[var(--m-bold-line-height)] whitespace-nowrap font-m-bold font-[number:var(--m-bold-font-weight)] tracking-[var(--m-bold-letter-spacing)] [font-style:var(--m-bold-font-style)]">
                  {stat.value}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </header>
  );
};
