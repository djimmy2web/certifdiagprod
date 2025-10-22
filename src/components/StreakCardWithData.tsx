'use client';

import { useEffect, useState } from 'react';
import StreakCard from './StreakCard';

interface StreakCardWithDataProps {
  streak: number;
}

export default function StreakCardWithData({ streak }: StreakCardWithDataProps) {
  const [weeklyStreak, setWeeklyStreak] = useState<Array<{
    day: string;
    completed: boolean;
    broken: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreakDetails = async () => {
      try {
        const res = await fetch('/api/me/streak-details');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setWeeklyStreak(data.weeklyStreak);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails de série:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakDetails();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Série d&apos;{streak} jours</h3>
        <div className="animate-pulse">
          <div className="flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-300 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <StreakCard streak={streak} weeklyStreak={weeklyStreak} />;
}
