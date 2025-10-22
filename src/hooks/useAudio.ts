import { useRef, useCallback } from 'react';

interface UseAudioOptions {
  volume?: number;
  preload?: boolean;
}

export function useAudio(src: string, options: UseAudioOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { volume = 1, preload = true } = options;

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume;
      audioRef.current.preload = preload ? 'auto' : 'none';
    }
    
    // Réinitialiser la position de lecture
    audioRef.current.currentTime = 0;
    
    // Jouer le son
    audioRef.current.play().catch((error) => {
      console.warn('Impossible de jouer le son:', error);
    });
  }, [src, volume, preload]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop };
}

// Hook spécialisé pour les sons de quiz
export function useQuizAudio() {
  const correctSound = useAudio('/song/correcte.mp3', { volume: 0.7 });
  const wrongSound = useAudio('/song/faux.wav', { volume: 0.7 });
  const finishSound = useAudio('/song/fin.mp3', { volume: 0.7 });

  // Fonction helper pour vérifier si les sons sont activés dans les préférences
  const areSoundEffectsEnabled = () => {
    if (typeof window === 'undefined') return true;
    try {
      const preferences = localStorage.getItem('userPreferences');
      if (preferences) {
        const parsed = JSON.parse(preferences);
        return parsed.soundEffects !== false;
      }
      return true; // Par défaut, les sons sont activés
    } catch {
      return true;
    }
  };

  return {
    playCorrect: () => {
      if (areSoundEffectsEnabled()) {
        correctSound.play();
      }
    },
    playWrong: () => {
      if (areSoundEffectsEnabled()) {
        wrongSound.play();
      }
    },
    playFinish: () => {
      if (areSoundEffectsEnabled()) {
        finishSound.play();
      }
    },
    stopCorrect: correctSound.stop,
    stopWrong: wrongSound.stop,
    stopFinish: finishSound.stop,
  };
}
