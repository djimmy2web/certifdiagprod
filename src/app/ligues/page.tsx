"use client";

import React, { useState, useEffect } from "react";
import { LeaderboardSection } from "@/components/LeaderboardSection";

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


export default function LiguesPage() {
  // États pour le contenu principal
  const [currentDivision, setCurrentDivision] = useState<Division | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [weeklyXP, setWeeklyXP] = useState<WeeklyXP[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('5 jours');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger toutes les divisions
        const divisionsRes = await fetch('/api/divisions');
        if (divisionsRes.ok) {
          const divisionsData = await divisionsRes.json();
          console.log('Divisions data:', divisionsData);
        }
        
        // Charger le profil de l'utilisateur pour récupérer son ID
        const profileRes = await fetch('/api/me/profile');
        let currentUserId = null;
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success) {
            currentUserId = profileData.user.email;
          }
        }
        
        // Charger la division de l'utilisateur
        const divisionRes = await fetch('/api/me/division');
        let userDivision: { name: string; color: string; rank: number; weeklyXP: number } | null = null;
        if (divisionRes.ok) {
          const divisionData = await divisionRes.json();
          if (divisionData.success) {
            userDivision = divisionData.division;
            if (userDivision) {
              setCurrentDivision({
                _id: 'current',
                name: userDivision.name,
                color: userDivision.color,
                minPoints: 0,
                order: 0
              });
            }
          }
        }
        
        // Charger les classements pour la division de l'utilisateur
        if (userDivision) {
          const rankingsRes = await fetch('/api/rankings/weekly');
          if (rankingsRes.ok) {
            const rankingsData = await rankingsRes.json();
            console.log('Rankings data:', rankingsData);
            if (rankingsData.success && rankingsData.rankings.length > 0) {
              // Trouver le classement de la division de l'utilisateur
              const currentRanking = rankingsData.rankings.find((r: { divisionId?: { name: string } }) => 
                r.divisionId && r.divisionId.name === userDivision.name
              );
              
              console.log('Current ranking:', currentRanking);
              if (currentRanking) {
                // Marquer l'utilisateur actuel
                const rankingsWithCurrentUser = currentRanking.rankings.map((player: Player) => ({
                  ...player,
                  isCurrentUser: currentUserId ? player.userId === currentUserId : false
                }));
                console.log('Leaderboard data:', rankingsWithCurrentUser);
                setLeaderboardData(rankingsWithCurrentUser);
              }
            }
          }
        }
        
        // Charger les quêtes du jour
        const questsRes = await fetch('/api/me/quests');
        if (questsRes.ok) {
          const questsData = await questsRes.json();
          if (questsData.success) {
            const questsWithIcons = questsData.quests.map((quest: { id: string; title: string; description: string; progress: number; total: number; completed: boolean }) => ({
              ...quest,
              icon: 'https://c.animaapp.com/mfv6kdiwVPAaDt/img/xp.svg'
            }));
            setDailyQuests(questsWithIcons);
          }
        }
        
        // Charger les XP hebdomadaires
        const xpRes = await fetch('/api/me/weekly-xp');
        if (xpRes.ok) {
          const xpData = await xpRes.json();
          if (xpData.success) {
            setWeeklyXP(xpData.weeklyData);
          }
        }
        
        // Calculer le temps restant jusqu'à la fin de la semaine
        const now = new Date();
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        
        const diffTime = endOfWeek.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTimeLeft(`${diffDays} jour${diffDays > 1 ? 's' : ''}`);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLeaderboardData([]);
        setDailyQuests([]);
        setWeeklyXP([]);
        setCurrentDivision(null);
        setTimeLeft('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);




  return (
    <div className="min-h-screen">
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
      
      {/* Contenu principal */}
      <div className="px-[246px] py-8">
        <LeaderboardSection
          currentDivision={currentDivision}
          leaderboardData={leaderboardData}
          dailyQuests={dailyQuests}
          weeklyXP={weeklyXP}
          timeLeft={timeLeft}
          loading={loading}
        />
      </div>
    </div>
  );
}
