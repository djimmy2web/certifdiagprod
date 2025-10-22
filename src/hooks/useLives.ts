import { useState, useEffect, useCallback } from 'react';

interface LivesData {
  current: number;
  max: number;
  regenerationRate: number; // heures
  timeUntilNext: number; // minutes
  canPlay: boolean;
}

export function useLives() {
  const [lives, setLives] = useState<LivesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLives = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/me/lives');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des vies');
      }
      
      setLives(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  const consumeLife = useCallback(async () => {
    try {
      const response = await fetch('/api/me/lives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'consume' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la consommation d\'une vie');
      }
      
      setLives(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchLives();
  }, [fetchLives]);

  // Rafraîchir automatiquement les vies toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLives();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [fetchLives]);

  return {
    lives,
    loading,
    error,
    refetch: fetchLives,
    consumeLife,
  };
}
