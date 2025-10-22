"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import InviteFriendsModal from "./InviteFriendsModal";

// Interfaces pour les données
interface UserProfile {
  email: string;
  name?: string;
  customId: string;
  image: string;
  points: number;
  role: string;
  createdAt: string;
}

interface UserStats {
  streak: number;
  totalXP: number;
  division: {
    name: string;
    color: string;
    rank: number;
    weeklyXP: number;
  };
  top3Count: number;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  isEarned: boolean;
  progress: number;
  current: number;
  total: number;
  awardedAt?: string;
}

interface Quest {
  id: string;
  title: string;
  progress: number;
  total: number;
  completed: boolean;
}

interface WeeklyXP {
  day: string;
  xp: number;
  isHighest: boolean;
}

export const ProfileStatsSection = (): JSX.Element => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [weeklyXP, setWeeklyXP] = useState<WeeklyXP[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/connexion");
      return;
    }

    if (session?.user) {
      fetchAllData();
    }
  }, [session, status, router]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les données en parallèle
      const [
        profileRes,
        statsRes,
        badgesRes,
        questsRes,
        weeklyXPRes,
        top3CountRes
      ] = await Promise.all([
        fetch("/api/me/profile"),
        fetch("/api/stats/me"),
        fetch("/api/me/badges"),
        fetch("/api/me/quests"),
        fetch("/api/me/weekly-xp"),
        fetch("/api/me/top3-count")
      ]);

      // Traiter les réponses
      const profileData = await profileRes.json();
      const statsData = await statsRes.json();
      const badgesData = await badgesRes.json();
      const questsData = await questsRes.json();
      const weeklyXPData = await weeklyXPRes.json();
      const top3CountData = await top3CountRes.json();

      if (profileRes.ok && profileData.success) {
        setProfile(profileData.user);
      }

      if (statsRes.ok && statsData.totals) {
        // Récupérer les données de division
        const divisionRes = await fetch("/api/me/division");
        const divisionData = await divisionRes.json();
        
        setStats({
          streak: statsData.totals.streak || 0,
          totalXP: statsData.totals.totalScore || 0,
          division: divisionData.success ? divisionData.division : {
            name: "Non classé",
            color: "#6B7280",
            rank: 0,
            weeklyXP: 0
          },
          top3Count: top3CountData.success ? top3CountData.top3Count : 0
        });
      }

      if (badgesRes.ok && badgesData.success) {
        setBadges(badgesData.badges || []);
      }

      if (questsRes.ok && questsData.success) {
        setQuests(questsData.quests || []);
      }

      if (weeklyXPRes.ok && weeklyXPData.success) {
        setWeeklyXP(weeklyXPData.weeklyData || []);
      }

    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  // Données pour les statistiques
  const statsData = [
    {
      icon: "https://c.animaapp.com/mg80bcldZCdFCx/img/no-daily.svg",
      value: stats?.streak?.toString() || "0",
      label: "Jour d'activité",
    },
    {
      icon: "https://c.animaapp.com/mg80bcldZCdFCx/img/xp.svg",
      value: stats?.totalXP?.toString() || "0",
      label: "Total XP gagnés",
    },
    {
      icon: null,
      value: stats?.division?.name || "Non classé",
      label: "Division actuelle",
      customIcon: true,
    },
    {
      icon: "https://c.animaapp.com/mg80bcldZCdFCx/img/vector-3.svg",
      value: stats?.top3Count?.toString() || "0",
      label: "Fois dans le top 3",
    },
  ];

  // Données pour les badges (limités à 3)
  const badgesData = badges.slice(0, 3).map(badge => ({
    title: badge.title,
    progress: `${badge.current}/${badge.total}`,
    description: badge.description,
    progressValue: badge.progress,
  }));

  // Données pour les quêtes quotidiennes
  const questsData = quests.map(quest => ({
    title: quest.title,
    progress: `${quest.progress}/${quest.total}`,
    progressValue: quest.total > 0 ? (quest.progress / quest.total) * 100 : 0,
    completed: quest.completed,
  }));

  // Données pour le graphique XP
  const xpChartData = weeklyXP.map((day) => {
    const maxXP = Math.max(...weeklyXP.map(d => d.xp));
    const height = day.xp > 0 ? Math.max((day.xp / maxXP) * 100, 8) : 0;
    
    return {
      day: day.day,
      value: day.xp > 0 ? day.xp : null,
      height: height,
      color: day.isHighest ? "bg-[#42db71]" : 
             day.xp > 50 ? "bg-[#0083ff]" : 
             day.xp > 20 ? "bg-[#e8f3ff]" : "bg-[#e8f3ff]",
      textColor: day.xp > 0 ? "text-[#868686]" : "text-[#202225]",
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">Erreur lors du chargement du profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full items-start gap-8 lg:gap-12 translate-y-[-1rem] animate-fade-in opacity-0">
      <div className="flex flex-col flex-1 items-start gap-8 lg:gap-12 w-full">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 sm:gap-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <div className="flex items-center gap-4 sm:gap-8">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={profile.image || "https://c.animaapp.com/mg80bcldZCdFCx/img/rectangle-52.svg"}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback>
                {profile.customId?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-1.5">
              <h1 className="font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
                {profile.customId || "Utilisateur"}
              </h1>
              <p className="font-m-regular font-[number:var(--m-regular-font-weight)] text-[#868686] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                {profile.name || "Nom non renseigné"}
              </p>
              <p className="font-m-regular font-[number:var(--m-regular-font-weight)] text-[#484848] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col w-full sm:w-auto lg:w-[150px] gap-2 sm:gap-4 lg:gap-1.5">
            <Button 
              onClick={() => router.push('/preferences')}
              className="bg-[#0083ff] text-white font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)] h-auto px-6 py-2 rounded-md hover:bg-[#0083ff]/90 transition-colors"
            >
              Paramètres
            </Button>
            <Button
              onClick={() => signOut({ callbackUrl: '/connexion' })}
              variant="outline"
              className="bg-white border-[#e8e8e8] text-[#202225] font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)] h-auto px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Se deconnecter
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-start gap-8 w-full">
          {/* Statistics Section */}
          <div className="flex flex-col items-start gap-6 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <h2 className="font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
              Statistiques
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {statsData.map((stat, index) => (
                <Card
                  key={index}
                  className="border-[#e8e8e8] rounded-xl hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {stat.customIcon ? (
                        <div className="relative w-[29px] h-8 bg-[url(https://c.animaapp.com/mg80bcldZCdFCx/img/vector-10.svg)] bg-[100%_100%]">
                          <img
                            className="absolute w-[82.51%] h-[83.26%] top-[8.37%] left-[8.75%]"
                            alt="Vector"
                            src="https://c.animaapp.com/mg80bcldZCdFCx/img/vector.svg"
                          />
                          <img
                            className="absolute w-[38.88%] h-[43.23%] top-[28.39%] left-[30.56%]"
                            alt="Group"
                            src="https://c.animaapp.com/mg80bcldZCdFCx/img/group.png"
                          />
                          <img
                            className="absolute w-full h-[76.27%] top-[12.11%] left-0"
                            alt="Group"
                            src="https://c.animaapp.com/mg80bcldZCdFCx/img/group-1.png"
                          />
                        </div>
                      ) : (
                        <img
                          className="w-8 h-8"
                          alt="Stat icon"
                          src={stat.icon || ""}
                        />
                      )}
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                          {stat.value}
                        </div>
                        <div className="font-s-regular font-[number:var(--s-regular-font-weight)] text-[#484848] text-[length:var(--s-regular-font-size)] tracking-[var(--s-regular-letter-spacing)] leading-[var(--s-regular-line-height)] [font-style:var(--s-regular-font-style)]">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Badges Section */}
          <div className="flex flex-col items-start gap-6 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
            <div className="flex items-center justify-between w-full">
              <h2 className="font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
                Badges
              </h2>
              <Button
                onClick={() => router.push('/badges')}
                variant="ghost"
                className="text-[#0083ff] [font-family:'Gilroy-Bold',Helvetica] font-bold text-sm h-auto p-0 hover:bg-transparent hover:text-[#0083ff]/80 transition-colors"
              >
                AFFICHER TOUT
              </Button>
            </div>

            <Card className="border-[#e8e8e8] rounded-xl w-full hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-8">
                  {badgesData.map((badge, index) => (
                    <div key={index} className="flex items-center gap-6">
                      <div className="relative w-[58px] h-16 flex-shrink-0">
                        <img
                          className="absolute w-[82.51%] h-[83.25%] top-[8.37%] left-[8.75%]"
                          alt="Vector"
                          src="https://c.animaapp.com/mg80bcldZCdFCx/img/vector.svg"
                        />
                        <img
                          className="absolute w-full h-[100.00%] top-0 left-0"
                          alt="Vector"
                          src="https://c.animaapp.com/mg80bcldZCdFCx/img/vector-1.svg"
                        />
                        <img
                          className="absolute w-[38.88%] h-[43.23%] top-[28.39%] left-[30.56%]"
                          alt="Group"
                          src={`https://c.animaapp.com/mg80bcldZCdFCx/img/group-${index + 2}.png`}
                        />
                        <img
                          className="absolute w-full h-[76.27%] top-[12.11%] left-0"
                          alt="Group"
                          src={`https://c.animaapp.com/mg80bcldZCdFCx/img/group-${index + 3}.png`}
                        />
                        <img
                          className="absolute w-[6.75%] h-[6.93%] top-[3.92%] left-[46.62%]"
                          alt="Vector"
                          src="https://c.animaapp.com/mg80bcldZCdFCx/img/vector-4.svg"
                        />
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                            {badge.title}
                          </h3>
                          <span className="font-XS-regular font-[number:var(--XS-regular-font-weight)] text-[#868686] text-[length:var(--XS-regular-font-size)] tracking-[var(--XS-regular-letter-spacing)] leading-[var(--XS-regular-line-height)] [font-style:var(--XS-regular-font-style)]">
                            {badge.progress}
                          </span>
                        </div>
                        <div className="relative w-full h-1.5 bg-[#e8f3ff] rounded-[1000px]">
                          <div
                            className="absolute top-0 left-0 h-1.5 bg-[#0083ff] rounded-[1000px] transition-all duration-300"
                            style={{ width: `${badge.progressValue}%` }}
                          />
                        </div>
                        <p className="font-s-regular font-[number:var(--s-regular-font-weight)] text-[#484848] text-[length:var(--s-regular-font-size)] tracking-[var(--s-regular-letter-spacing)] leading-[var(--s-regular-line-height)] [font-style:var(--s-regular-font-style)]">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col items-start gap-6 w-full lg:w-[300px] flex-shrink-0">
        {/* Add Friends Card */}
        <Card className="border-[#e8e8e8] rounded-xl w-full hover:shadow-md transition-shadow translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <h3 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] [font-style:var(--l-bold-font-style)]">
                Ajouter des amis
              </h3>
              <Button
                onClick={() => setIsInviteModalOpen(true)}
                variant="ghost"
                className="flex items-center justify-between w-full p-0 h-auto hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    className="w-[29px] h-8 object-cover"
                    alt="Image"
                    src="https://c.animaapp.com/mg80bcldZCdFCx/img/image-18.png"
                  />
                  <span className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                    Inviter des amis
                  </span>
                </div>
                <img
                  className="w-6 h-6"
                  alt="Arrow left"
                  src="https://c.animaapp.com/mg80bcldZCdFCx/img/arrow-left.svg"
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Quests Card */}
        <Card className="border-[#e8e8e8] rounded-xl w-full hover:shadow-md transition-shadow translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] [font-style:var(--l-bold-font-style)]">
                  Quêtes du jour
                </h3>
                <Button
                  variant="ghost"
                  className="text-[#0083ff] [font-family:'Gilroy-Bold',Helvetica] font-bold text-sm h-auto p-0 hover:bg-transparent hover:text-[#0083ff]/80 transition-colors"
                >
                  AFFICHER TOUT
                </Button>
              </div>

              <div className="flex flex-col gap-[18px]">
                {questsData.map((quest, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <img
                      className="w-[38px] h-[38px] flex-shrink-0"
                      alt="XP"
                      src="https://c.animaapp.com/mg80bcldZCdFCx/img/xp.svg"
                    />
                    <div className="flex flex-col gap-2 flex-1">
                      <h4 className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                        {quest.title}
                      </h4>
                      <div className="flex items-center justify-between gap-3">
                        <div className="relative flex-1 h-1.5 bg-[#e5ffed] rounded-[1000px]">
                          {quest.progressValue > 0 && (
                            <div
                              className="absolute top-0 left-0 h-1.5 bg-[#42db71] rounded-[1000px] transition-all duration-300"
                              style={{ width: `${quest.progressValue}%` }}
                            />
                          )}
                        </div>
                        <span className="w-[35px] font-XS-regular font-[number:var(--XS-regular-font-weight)] text-[#868686] text-[length:var(--XS-regular-font-size)] text-right tracking-[var(--XS-regular-letter-spacing)] leading-[var(--XS-regular-line-height)] [font-style:var(--XS-regular-font-style)]">
                          {quest.progress}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP Chart Card */}
        <Card className="border-[#e8e8e8] rounded-xl w-full hover:shadow-md transition-shadow translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] [font-style:var(--l-bold-font-style)]">
                  XP Gagnés
                </h3>
                <Button
                  variant="ghost"
                  className="text-[#0083ff] [font-family:'Gilroy-Bold',Helvetica] font-bold text-sm h-auto p-0 hover:bg-transparent hover:text-[#0083ff]/80 transition-colors"
                >
                  VOIR PLUS
                </Button>
              </div>

              <div className="flex items-end justify-between h-[143px]">
                {xpChartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col w-7 h-full items-center justify-between"
                  >
                    {item.value && (
                      <div
                        className={`flex items-center justify-center font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] text-center tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)] ${item.textColor}`}
                      >
                        {item.value}
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-1 w-full">
                      {item.height > 0 && (
                        <div
                          className={`${item.color} w-full rounded-lg transition-all duration-300 hover:opacity-80`}
                          style={{ height: `${item.height}px` }}
                        />
                      )}
                      <div
                        className={`flex items-center justify-center font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] text-center tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)] ${item.textColor}`}
                      >
                        {item.day}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal d'invitation d'amis */}
      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        userCustomId={profile?.customId}
      />
    </div>
  );
};
