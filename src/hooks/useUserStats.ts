import { useState, useEffect, useCallback } from 'react';

interface UserStats {
  streak: number;
  errors: number;
  loading: boolean;
  error: string | null;
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    errors: 0,
    loading: true,
    error: null
  });

  const fetchStats = useCallback(async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      // Récupérer le streak
      const streakResponse = await fetch('/api/me/streak');
      const streakData = streakResponse.ok ? await streakResponse.json() : { streak: 0 };
      
      // Récupérer les erreurs récentes
      const errorsResponse = await fetch('/api/user-errors/recent');
      const errorsData = errorsResponse.ok ? await errorsResponse.json() : { count: 0 };
      
      setStats({
        streak: streakData.streak || 0,
        errors: errorsData.count || 0,
        loading: false,
        error: null
      });
    } catch (err) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erreur inconnue'
      }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...stats,
    refetch: fetchStats
  };
}
