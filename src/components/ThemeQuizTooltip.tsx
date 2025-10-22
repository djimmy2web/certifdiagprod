'use client';

import { useState, useEffect } from 'react';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
}

interface ThemeQuizTooltipProps {
  themeSlug: string;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ThemeQuizTooltip({ themeSlug, isVisible, position, onClose }: ThemeQuizTooltipProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && themeSlug) {
      setLoading(true);
      fetch(`/api/quizzes?theme=${encodeURIComponent(themeSlug)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setQuizzes(data.quizzes || []);
          }
        })
        .catch(error => {
          console.error('Erreur lors du chargement des quiz:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isVisible, themeSlug]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-gray-800">Quiz disponibles</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : quizzes.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="border-b border-gray-100 pb-2 last:border-b-0">
              <h5 className="font-medium text-sm text-gray-800 truncate">{quiz.title}</h5>
              {quiz.description && (
                <p className="text-xs text-gray-600 truncate">{quiz.description}</p>
              )}
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs px-2 py-1 rounded ${
                  quiz.difficulty === 'debutant' ? 'bg-green-100 text-green-700' :
                  quiz.difficulty === 'intermediaire' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {quiz.difficulty}
                </span>
                <a
                  href={`/reviser/${quiz.id}`}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Commencer →
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Aucun quiz disponible</p>
      )}
      
      <div className="mt-3 pt-2 border-t border-gray-100">
        <a
          href={`/reviser?theme=${encodeURIComponent(themeSlug)}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Voir tous les quiz →
        </a>
      </div>
    </div>
  );
}
