// Types partagés pour le dashboard et les composants de statistiques

export type UserStats = {
  xp: number;
  lives: number;
  streak: number;
};

export type Division = {
  name: string;
  color: string;
  rank: number;
  weeklyXP: number;
};

export type Quest = {
  id: string;
  title: string;
  progress: number;
  total: number;
  completed: boolean;
};

export type WeeklyXP = {
  day: string;
  xp: number;
  isHighest: boolean;
};

export type Theme = { 
  id: string; 
  name: string; 
  slug: string; 
  progress?: number; 
  total?: number;
  iconUrl?: string;
};

export type QuizCard = { 
  id: string; 
  title: string; 
  description?: string;
};

export type RecentError = { 
  question: string; 
  theme?: string;
};
