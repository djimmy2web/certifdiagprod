'use client';

import { useLives } from '@/hooks/useLives';
import { useUserStats } from '@/hooks/useUserStats';

interface LivesNavbarProps {
  className?: string;
}

export default function LivesNavbar({ className = "" }: LivesNavbarProps) {
  const { lives, loading, error } = useLives();
  const { streak, loading: statsLoading } = useUserStats();

  if (loading) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !lives) {
    return null; // Ne pas afficher d'erreur dans la navbar
  }

  const formatTimeUntilNext = (minutes: number) => {
    if (minutes <= 0) return 'Maintenant';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Icône de fiole de potion pour les vies */}
      <div className="flex items-center space-x-1">
        <div className="relative">
          <img 
            src="/fiole.svg" 
            alt="Vies" 
            width="20" 
            height="20" 
            className="w-5 h-5"
          />
          {/* Indicateur de régénération en cours */}
          {lives.current < lives.max && lives.timeUntilNext > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {lives.current}
        </span>
      </div>

      {/* Icône de flamme pour le streak */}
      <div className="flex items-center space-x-1">
        <img 
          src={streak > 0 ? "/flamme.svg" : "/flammeéteinte.svg"} 
          alt="Streak" 
          width="18" 
          height="18" 
          className="w-[18px] h-[18px]"
        />
        <span className="text-sm font-semibold text-gray-700">
          {statsLoading ? '...' : streak}
        </span>
      </div>

      {/* Icône de cœur pour les vies */}
      <div className="flex items-center space-x-1">
        <img 
          src={lives.current > 0 ? "/vie.svg" : "/coeurcasse.svg"} 
          alt="Vies" 
          width="18" 
          height="18" 
          className="w-[18px] h-[18px]"
        />
        <span className="text-sm font-semibold text-gray-700">
          {lives.current}
        </span>
      </div>

      {/* Tooltip avec informations détaillées */}
      <div className="group relative">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50">
          <div className="space-y-1">
            <div>Vies: {lives.current}/{lives.max}</div>
            {lives.current < lives.max && (
              <div>Prochaine: {formatTimeUntilNext(lives.timeUntilNext)}</div>
            )}
            <div>Régénération: {lives.regenerationRate}h</div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
}
