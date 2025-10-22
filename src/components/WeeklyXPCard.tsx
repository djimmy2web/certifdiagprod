'use client';

interface WeeklyXPData {
  day: string;
  xp: number;
  isHighest: boolean;
}

interface WeeklyXPCardProps {
  weeklyData: WeeklyXPData[];
}

export default function WeeklyXPCard({ weeklyData }: WeeklyXPCardProps) {
  const maxXP = Math.max(...weeklyData.map(d => d.xp));
  
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">XP Gagnés</h3>
        <a href="/mes-statistiques" className="text-blue-600 text-sm font-medium hover:underline">
          VOIR PLUS
        </a>
      </div>
      
      <div className="space-y-2">
        {/* Valeurs XP au-dessus des barres */}
        <div className="flex justify-between text-xs font-medium text-gray-600">
          {weeklyData.map((data, index) => (
            <span key={index} className="w-6 text-center">{data.xp}</span>
          ))}
        </div>
        
        {/* Barres de progression */}
        <div className="flex items-end justify-between h-16">
          {weeklyData.map((data, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div 
                className={`w-4 rounded-t transition-all duration-300 ${
                  data.isHighest 
                    ? 'bg-green-500' 
                    : 'bg-blue-400'
                }`}
                style={{ 
                  height: `${(data.xp / maxXP) * 48}px`,
                  minHeight: data.xp > 0 ? '4px' : '0px'
                }}
              ></div>
            </div>
          ))}
        </div>
        
        {/* Jours de la semaine */}
        <div className="flex justify-between text-xs text-gray-600">
          {weeklyData.map((data, index) => (
            <span key={index} className="w-6 text-center">{data.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
