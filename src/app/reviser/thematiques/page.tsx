"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Theme {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  progress?: number;
  total?: number;
}



export default function ThematiquesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [themesRes, progressRes] = await Promise.all([
          fetch("/api/themes"),
          fetch("/api/themes/progress")
        ]);
        
        const themesData = await themesRes.json();
        const progressData = await progressRes.json();
        
        if (!themesRes.ok) throw new Error(themesData?.error || "Erreur");
        
        // Récupérer le nombre de quiz pour chaque thématique
        const themesWithProgress = await Promise.all(
          (themesData.themes || []).map(async (theme: Theme) => {
            const themeProgress = progressData.success 
              ? progressData.progress.find((p: { themeSlug: string; totalQuizzesCompleted: number }) => p.themeSlug === theme.slug)
              : null;
            
            // Récupérer le nombre total de quiz pour cette thématique
            const quizzesRes = await fetch(`/api/quizzes?theme=${encodeURIComponent(theme.slug)}`);
            const quizzesData = await quizzesRes.json();
            const totalQuizzes = quizzesRes.ok ? (quizzesData.quizzes || []).length : 0;
            
            return {
              ...theme,
              progress: themeProgress?.totalQuizzesCompleted || 0,
              total: totalQuizzes
            };
          })
        );
        
        setThemes(themesWithProgress);
      } catch (e: unknown) {
        setError((e as Error).message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getThemeIcon = (theme: Theme) => {
    // Si une image est définie dans la base de données, l'utiliser
    if (theme.iconUrl) {
      return (
        <Image
          src={theme.iconUrl}
          alt={theme.name}
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
        />
      );
    }
    
    // Sinon, utiliser des icônes par défaut basées sur le slug
    const defaultIcons: Record<string, string> = {
      'electricite': '⚡',
      'dpe': '🏠',
      'termites': '🐛',
      'plomb': 'Pb',
      'amiante': 'a',
      'audit-energetique': '📊',
      'gaz': '🔥'
    };
    
    return (
      <span className="text-white text-xl font-bold">
        {defaultIcons[theme.slug] || '📚'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <Link 
            href="/reviser"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            RETOUR
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thématiques</h1>
          <p className="text-gray-600">Explorez les sujets essentiels du diagnostic immobilier.</p>
        </div>

        {/* Grille des thématiques */}
        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme) => (
            <Link
              key={theme.id}
              href={`/reviser?theme=${encodeURIComponent(theme.slug)}`}
              className="group block"
            >
              <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Icône */}
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getThemeIcon(theme)}
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 mb-2">{theme.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ 
                            width: theme.total && theme.total > 0 
                              ? `${((theme.progress || 0) / theme.total) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium flex-shrink-0">
                        {theme.progress || 0}/{theme.total || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">Thématiques - QCM</p>
        </div>
      </div>
    </div>
  );
}
