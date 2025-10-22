'use client';
import Link from 'next/link';

interface RecentErrorsCardProps {
  errors: Array<{
    question: string;
    theme?: string;
  }>;
}

export default function RecentErrorsCard({}: RecentErrorsCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Revois tes erreurs les plus récentes</h2>
        <Link href="/reviser/erreurs-recentes" className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">
          VOIR PLUS
        </Link>
      </div>
      
      <div className="bg-orange-500 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <span className="font-medium">Quiz sur tes 20 dernières erreurs</span>
          <div className="flex items-center gap-2">
            <div className="w-px h-6 bg-white/30"></div>
            <Link 
              href="/reviser/erreurs-recentes" 
              className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer"
            >
              Commencer +25 XP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
