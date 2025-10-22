'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeQuizTooltip from './ThemeQuizTooltip';

interface Theme {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  progress?: number;
  total?: number;
}

interface ThemesGridProps {
  themes: Theme[];
}

const getThemeIcon = (name: string) => {
  const icons: { [key: string]: string } = {
    'Électricité': '⚡',
    'Amiante': 'a',
    'DPE': '🏠',
    'Audit énergétique': '📊',
    'Termites': '🐛',
    'Gaz': '🔥',
    'Plomb': 'Pb'
  };
  return icons[name] || '📚';
};

export default function ThemesGrid({ themes }: ThemesGridProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (themeSlug: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setHoveredTheme(themeSlug);
  };

  const handleMouseLeave = () => {
    setHoveredTheme(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Thématiques</h2>
        <Link href="/reviser/thematiques" className="text-blue-600 text-sm font-medium hover:underline">
          VOIR PLUS
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <div 
            key={theme.id} 
            className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
            onMouseEnter={(e) => handleMouseEnter(theme.slug, e)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-3">
              {/* Icône */}
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {getThemeIcon(theme.name)}
              </div>
              
              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-800 mb-2">{theme.name}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${((theme.progress || 0) / (theme.total || 24)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium flex-shrink-0">
                    {theme.progress || 0}/{theme.total || 24}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip pour afficher les quiz */}
      <ThemeQuizTooltip
        themeSlug={hoveredTheme || ''}
        isVisible={!!hoveredTheme}
        position={tooltipPosition}
        onClose={() => setHoveredTheme(null)}
      />
    </div>
  );
}
