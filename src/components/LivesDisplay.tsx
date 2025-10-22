'use client';

import { useLives } from '@/hooks/useLives';
import LivesBar from './LivesBar';
import LivesHearts from './LivesHearts';

interface LivesDisplayProps {
  variant?: 'bar' | 'hearts';
  className?: string;
  showLabel?: boolean;
  showCount?: boolean;
  heartSize?: "sm" | "md" | "lg";
  showTimeUntilNext?: boolean;
}

export default function LivesDisplay({ 
  variant = 'bar',
  className = "",
  showLabel = true,
  showCount = true,
  heartSize = "md",
  showTimeUntilNext = false
}: LivesDisplayProps) {
  const { lives, loading, error } = useLives();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse">
          <div className="w-32 h-2 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !lives) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Erreur: {error || 'Impossible de charger les vies'}
      </div>
    );
  }

  const formatTimeUntilNext = (minutes: number) => {
    if (minutes <= 0) return 'Prochaine vie disponible maintenant';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {variant === 'bar' ? (
        <LivesBar
          currentLives={lives.current}
          maxLives={lives.max}
          showLabel={showLabel}
          showCount={showCount}
        />
      ) : (
        <LivesHearts
          currentLives={lives.current}
          maxLives={lives.max}
          showLabel={showLabel}
          showCount={showCount}
          heartSize={heartSize}
        />
      )}
      
      {showTimeUntilNext && lives.current < lives.max && (
        <div className="text-xs text-gray-500">
          Prochaine vie: {formatTimeUntilNext(lives.timeUntilNext)}
        </div>
      )}
      
      {!lives.canPlay && (
        <div className="text-xs text-red-500 font-medium">
          Plus de vies disponibles
        </div>
      )}
    </div>
  );
}
