'use client';

interface DivisionCardProps {
  division: {
    name: string;
    color: string;
    rank: number;
    weeklyXP: number;
  };
}

export default function DivisionCard({ division }: DivisionCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Division {division.name}</h3>
        <a href="/classement-divisions" className="text-blue-600 text-sm font-medium hover:underline">
          VOIR LA LIGUE
        </a>
      </div>
      
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: division.color }}
        >
          ⭐
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-700">
            Tu es n° {division.rank} du classement
          </p>
          <p className="text-sm text-gray-600">
            Tu as gagné {division.weeklyXP} XP pour l&apos;instant cette semaine
          </p>
        </div>
      </div>
    </div>
  );
}
